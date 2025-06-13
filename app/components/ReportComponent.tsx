import { IReport } from "@/models/Report";
import {
  CheckCircleIcon,
  File,
  FileIcon,
  FileSpreadsheet,
  FileText,
  Trash2Icon,
  Upload,
  XCircleIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { JSX, useState } from "react";
import UploadVerdictForm from "./VerdictUploadForm";
import Modal from "./ui/Modal";

// Define the file type keys to make sure we only use valid keys
type FileType = "pdf" | "docx" | "xlsx" | "default";

interface ReportComponentProps {
  report: IReport;
  isHorizontal: boolean;
}

const fileTypeIcons: Record<FileType, JSX.Element> = {
  pdf: (
    <FileText className="w-6 h-6 text-gray-600 hover:text-red-700 transition-colors duration-300" />
  ),
  docx: (
    <File className="w-6 h-6 text-gray-600 hover:text-red-700 transition-colors duration-300" />
  ),
  xlsx: (
    <FileSpreadsheet className="w-6 h-6 text-green-700 hover:text-green-400 transition-colors duration-300" />
  ),
  default: (
    <FileIcon className="w-6 h-6 text-gray-600 hover:text-red-700 transition-colors duration-300" />
  ),
};

function bytesToSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}

export default function ReportComponent({
  report,
  isHorizontal = true,
}: ReportComponentProps) {
  const { data: session } = useSession();
  const [loading, setloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const getFileTypeIcon = (fileType: string | undefined) => {
    return fileType
      ? fileTypeIcons[fileType.toLowerCase() as FileType] ||
          fileTypeIcons.default
      : fileTypeIcons.default;
  };

  const handleApprove = async (reportid: string | undefined) => {
    let approvestatus = "";
    if (!reportid) {
      console.error("Report ID is undefined");
      return;
    }
    if (session?.user?.role === "labtester") {
      approvestatus = "reviewed";
    } else if (session?.user?.role == "admin") {
      approvestatus = "approved";
    } else {
      console.error("Role is unauthorized");
    }
    try {
      setloading(true);
      const response = await fetch(`/api/report/${reportid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: approvestatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Status Change failed");
      }

      window.location.reload();
    } catch (error) {
      setloading(false);
      console.error("Not able to update Status", error);
    } finally {
      setloading(false);
    }
  };

  const handleDisapprove = async (reportid: string | undefined) => {
    let approvestatus = "";
    if (!reportid) {
      console.error("Report ID is undefined");
      return;
    }
    if (session?.user?.role === "labtester") {
      approvestatus = "RejectedByLab";
    } else if (session?.user?.role == "admin") {
      approvestatus = "RejectedByAdmin";
    } else {
      console.error("Role is unauthorized");
    }
    try {
      setloading(true);
      const response = await fetch(`/api/report/${reportid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: approvestatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Status Change failed");
      }

      window.location.reload();
    } catch (error) {
      setloading(false);
      console.error("Not able to update Status", error);
    } finally {
      setloading(false);
    }
  };

  const handledelete = async (reportid: string | undefined) => {
    if (!reportid) {
      console.error("Report ID is undefined");
      return;
    }

    try {
      setloading(true);
      const response = await fetch(`/api/report/${reportid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: reportid }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Deleting failed");
      }

      window.location.reload();
    } catch (error) {
      setloading(false);
      console.error("Not able to delete", error);
    } finally {
      setloading(false);
    }
  };

   

  return (
    <div
      className={`w-full flex ${
        isHorizontal ? "sm:flex-row" : "flex-col"
      } items-start sm:items-center gap-4 bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Left side (Title and Description) */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white">{report.title}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
          {report.description}
        </p>
      </div>

      {/* Right side (File Icon and Size) */}
      <div className="flex items-center space-x-2">
        <div className="text-xs text-gray-500">
          {report.fileType && getFileTypeIcon(report.fileType)}
        </div>
        <div className="text-xs text-gray-400">
          {report.fileSize ? `${bytesToSize(report.fileSize)}` : "No file"}
        </div>
      </div>

      {loading && (
        <div className="toast toast-end">
          <div className="alert alert-success">
            <span>Deleting Your Report...</span>
          </div>
        </div>
      )}

      {/* Delete Button */}
      {session?.user.role === "sales" && (
        <Trash2Icon
          onClick={() => handledelete(report?._id?.toString())}
          className=" hover:text-red-700 transition-colors duration-300 cursor-pointer"
        />
      )}

      {(session?.user.role === "labtester" ||
        session?.user.role === "admin") && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApprove(report._id?.toString())}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none transition-colors duration-300"
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" /> Approve
          </button>
          <button
            onClick={() => handleDisapprove(report._id?.toString())}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300"
          >
            <XCircleIcon className="w-4 h-4 mr-2" /> Disapprove
          </button>

          <button
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300"
          >
            <Upload className="w-4 h-4 mr-2" /> 
          </button>
         
        </div>
      )}
       <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <h2 className="text-xl font-semibold mb-4">Upload Test Result</h2>
        {/* <UploadVerdictForm reportId={report?._id?.toString() || undefined} closeModal={closeModal} /> */}
      </Modal>
    </div>
  );
}



