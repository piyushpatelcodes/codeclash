import { IReport } from "@/models/Report";
import { IUser } from "@/models/User";
import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id">;
export type ReportFormData = Omit<IReport, "uploadedBy" | "isPrivate"> & {
  similarReportIdsForDelete?: string[]; // Optional field for deletion
};

type FetchOptions<T = unknown> = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: T; // Generic type for body
  headers?: Record<string, string>;
};

class ApiClient {
 
  private async fetch<T, U = unknown>(
    endpoint: string,
    options: FetchOptions<U> = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos() {
    return this.fetch<IVideo[]>("/videos");
  }
  async getReports() {
    return this.fetch<IReport[]>("/report");
  }



  async getVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`);
  }
  async editReport(reportData: Partial<ReportFormData>, reportId: string,) {
    return this.fetch<IReport, Partial<ReportFormData>>(`/report/${reportId}`,{
      method: "PATCH",
      body: reportData,
    });
  }


  async updateStatus(reportStatus:Partial<ReportFormData>, reportId: string) {
    return this.fetch<IReport, Partial<ReportFormData>>(`/report/${reportId}`,{
      method: "PATCH",
      body: reportStatus,
    });
  }
  async deleteReport(reportId: string) {
    return this.fetch<IReport, ReportFormData>(`/report/${reportId}`,{
      method: "DELETE",
    });
  }



  async getRecipients() {
    return this.fetch<IUser[]>(`/users/role`);
  }



  async sendDocument(reportData: ReportFormData) {
    return this.fetch<IReport,ReportFormData>("/report", {
      method: "POST",
      body: reportData,
    });
  }

  async createVideo(videoData: VideoFormData) {
    return this.fetch<IVideo, VideoFormData>("/videos", {
      method: "POST",
      body: videoData, // body is now type-safe
    });
  }
}

export const apiClient = new ApiClient();