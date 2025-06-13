"use client";
import React from "react";
import {
  Download,
  Link,
  AlertTriangle,
  Users,
  FileText,
  Camera,
  CopyIcon,
  PaperclipIcon,
  LucideBookCopy,
  TriangleAlertIcon,
  Trash2Icon,
  ArrowUpRightFromSquare,
  ArrowRight,
  ArrowRightCircle,
  CheckCircleIcon,
  BadgeMinusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import avatar from "@/public/avatar.jpeg";
import { IUser } from "@/models/User";
import { useRouter } from "next/navigation";
import { useNotification } from "../Notification";
import {
  AlertTriangleIcon,
  FlaskConicalIcon,
  Tag,
  TagIcon,
} from "lucide-react";
import { IReport } from "@/models/Report";
import SpotlightCard from "../../components/ui/SpotlightCard";
import ShinyText from "../ui/ShinyText";
import { apiClient, ReportFormData } from "@/lib/api-client";

interface Participant {
  name: string;
  avatar: string;
}

interface Attachment {
  name: string;
  size: string;
  type: "PDF" | "PNG";
  icon: React.ReactNode;
}

const BugReport: React.FC = () => {
  interface Report {
    _id?: string;
    title?: string;
    description?: string;
    sharedWith?: (IUser | string)[];
    status?: string;
    tags?: string[];
    similarTo?: IReport[];
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    testResults?: Array<{
      fileUrl: string;
      fileType: string;
      fileSize: number;
      imageKitFileId: string;
      uploadedBy: IUser;
      score?: Array<{
        name: string;
        relatedTo: string;
        value?: number | string;
        unit?: string;
        range?: [number, number];
        expectedRange?: [number, number];
        remarks?: string;
        verdict: boolean;
      }>;
    }>;
    uploadedBy: IUser;
    createdAt: string;
    updatedAt: string;
  }

  const [report, setReport] = useState<Report | null>(null);
  const [similarReportIdsForDelete, setSimilarReportIdsForDelete] = useState<
    string[]
  >([]);
  const [isselected, setIsSelected] = useState<boolean>(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const stored = sessionStorage.getItem("reportToView");
    if (!stored) {
      router.push("/dashboard"); // Redirect if no report found
      return;
    }

    const parsed = JSON.parse(stored);
    console.log("🚀 ~ useEffect ~ parsed:", parsed);
    setReport(parsed);
  }, [router]);

  if (!report) {
    return <div className="text-white p-6">Loading report...</div>;
  }

  const hasTestResultsWithScore =
    Array.isArray(report.testResults) &&
    report.testResults.some(
      (result) => Array.isArray(result.score) && result.score.length > 0
    );

  const {
    title,
    description,
    sharedWith = [],
    status,
    tags = [],
    fileUrl,
    fileType,
    fileSize,
    testResults = [],
    similarTo = [],
  } = report;

  const handleDownload = async (url: string) => {
    console.log("🚀 ~ handleDownload ~ url:", url);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${url}`,
        {
          mode: "cors",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = url?.split("/").pop() || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Unable to download file.");
      console.error(error);
    }
  };

  const handleProductVisit = async (id: string) => {
    try {
      const response = await fetch(`/api/report/${id}`);

      if (!response.ok) {
        throw new Error("Unable to fetch the report data");
      }

      const reportData = await response.json();

      // Handle the case if no report data is returned
      if (!reportData) {
        throw new Error("Report not found");
      }
      showNotification(
        `Navigating to Product, Title: ${reportData.title}`,
        "info"
      );

      sessionStorage.setItem("reportToView", JSON.stringify(reportData));
      window.location.assign(`/sales/dashboard/view/${id}`);
    } catch (error) {
      alert("Unable to Visit Product.");
      console.error(error);
    }
  };

  const handleDeleteSimilarProducts = async (
    reportId: string,
  ) => {
    try {
      const reportData = {
        similarReportIdsForDelete,
      };

      const response = await apiClient.editReport(reportData, reportId);

      if (!response) {
        throw new Error("Similar Report not found after update");
      }

      showNotification("Successfully Deleted the Similar report.", "info");

      sessionStorage.setItem("reportToView", JSON.stringify(response));

      window.location.assign(`/sales/dashboard/view/${reportId}`);
    } catch (error) {
      showNotification(error.message, "error")
      console.error("Unable to delete similar products or update the report: ",error);
    }
  };

  const toggleReportSelection = (reportId: string) => {
    setIsSelected(!isselected);
    setSimilarReportIdsForDelete((prevIds) => {
      if (prevIds.includes(reportId)) {
        return prevIds.filter((id) => id !== reportId);
      }

      return [...prevIds, reportId];
    });
  };

  function formatStatus(status?: string) {
    switch (status) {
      case "pending":
        return "Pending";
      case "reviewed":
        return "Reviewed";
      case "approved":
        return "Approved";
      case "ApprovedByFinance":
        return "Approved By Finance";
      case "RejectedByLab":
        return "Rejected By Lab";
      case "RejectedByFinance":
        return "Rejected By Finance";
      case "RejectedByAdmin":
        return "Rejected By Admin";
      default:
        return status?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? "Unknown";
    }
  }

  return (
    <div className="max-w-[90%] mx-auto  p-6 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            {/* Left Side: Avatar and Report Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Image
                  src={avatar}
                  alt="avatar"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                <span
                  data-tip={report.uploadedBy.role?.toUpperCase() + " Role"}
                  className="tooltip tooltip-primary font-medium text-gray-900 dark:text-gray-100"
                >
                  {report.uploadedBy.email}
                </span>
                <span>|</span>
                <span>
                  Reported{" "}
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Right Side: Last Updated */}
            <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-3 items-center">
              <span className=" p-1 dark:bg-purple-400/40 bg-purple-300 italic rounded-md text-black dark:text-white">
                Last Updated:{" "}
                {report.updatedAt
                  ? new Date(report.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "N/A"}
              </span>

              {/* Status and Similar Section */}
              {status ? (
                <span
                  className={`px-2 py-1 rounded font-medium ${
                    status === "RejectedByLab"
                      ? "bg-red-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                      : status === "RejectedByAdmin"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : status === "RejectedByFinance"
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : status === "pending"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : status === "approved"
                      ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300"
                      : status === "ApprovedByFinance"
                      ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {formatStatus(status)}
                </span>
              ) : (
                <em className="text-gray-500">No status provided</em>
              )}

              {similarTo.length > 0 && (
                <span className="px-2 py-1 rounded text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                  Similar Products Found: {similarTo.length}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            Title: {title || <em className="text-gray-500">Untitled</em>}
            {similarTo.length > 0 && (
              <span
                data-tip={`Similar Products Found: ${similarTo?.length}`}
                className="text-red-500 font-extralight text-2xl hover:text-red-400 tooltip tooltip-error cursor-help"
              >
                *
              </span>
            )}
          </h1>
        </div>

        {/* Metadata Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
            {/* Report ID */}
            <div className="flex items-center gap-3 ">
              <Link className="w-4 h-4 text-gray-500 dark:text-gray-400 " />
              <div
                className="cursor-pointer group"
                onClick={() => {
                  navigator.clipboard.writeText(report._id);
                  showNotification("Report ID Copied!", "success");
                }}
                title="Click to copy"
              >
                <span className="text-sm text-gray-500 flex gap-2 items-center dark:text-gray-400 uppercase tracking-wide">
                  REPORT ID
                  <CopyIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 text-nlue-500 transition duration-150 ease-in-out transform active:scale-75 " />
                </span>
                <p className="font-medium italic  text-gray-900 dark:text-gray-100 ">
                  {report._id}
                </p>
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-green-700 dark:text-green-500" />
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Category Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(tags) && tags.length > 0 ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="dark:bg-green-700 text-black bg-green-300 dark:text-white px-3 py-1 rounded-full text-sm flex gap-2 items-center"
                      >
                        <TagIcon size={15} /> {tag}
                      </span>
                    ))
                  ) : (
                    <em className="text-gray-500">No tags</em>
                  )}
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  PARTICIPANTS
                </span>
                <div className="flex flex-wrap gap-2">
                  {sharedWith.length > 0 ? (
                    sharedWith.map((user: IUser | string) => {
                      const email =
                        typeof user === "string" ? user : user.email;
                      const role = typeof user === "string" ? user : user.role;
                      const roleContent = `${
                        role === "superadmin"
                          ? "Superadmin"
                          : role === "admin"
                          ? "Admin"
                          : role === "sales"
                          ? "Sales"
                          : role === "finance"
                          ? "Finance"
                          : "Lab Personnel"
                      }`;

                      return (
                        <span
                          key={email}
                          data-tip={roleContent}
                          className="bg-purple-700 tooltip text-white px-3 py-1 rounded-full text-sm"
                        >
                          {email}
                        </span>
                      );
                    })
                  ) : (
                    <em className="text-gray-500">None</em>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              DESCRIPTION
            </span>
          </div>

          <div className="space-y-4">
            {description ? (
              <p className="text-gray-700  dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            ) : (
              <em className="text-gray-700/40  dark:text-gray-300/40 leading-relaxed">
                None Provided.
              </em>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <PaperclipIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              ATTACHMENTS
            </span>
          </div>

          {fileUrl ? (
            <div
              tabIndex={0}
              className=" collapse collapse-arrow  border-gray-200 dark:border-gray-700 border bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="collapse-title font-semibold">
                {" "}
                <div className="flex  items-center gap-3 flex-wrap">
                  <FileText className="text-black/30 dark:text-gray-300 text-xs hidden lg:inline" />{" "}
                  <a
                    onClick={() => {
                      handleDownload(fileUrl);
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    {fileUrl?.split("/").pop()}
                  </a>
                  <button
                    onClick={() => {
                      handleDownload(fileUrl);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Download
                  </button>
                  <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs">
                    {fileType?.toUpperCase()}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {(fileSize! / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <div className="collapse-content text-sm">
                <h2 className="text-sm text-gray-400 p-2">
                  Preview of Sales person's Reports/Attachments
                </h2>
                {fileType === "pdf" ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${fileUrl}`}
                    title="PDF Preview"
                    className="w-full h-[600px] bg-white"
                  />
                ) : fileType?.match(/(jpg|jpeg|png|gif|webp)/i) ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${fileUrl}`}
                    title="Image Preview"
                    className="max-w-full max-h-[600px] object-contain mx-auto"
                  />
                ) : (
                  <p className="italic text-gray-500">
                    Preview not available for this file type.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <em className="text-gray-500">
              No Attachments uploaded from Sales Department Side.
            </em>
          )}
        </div>
      </div>

      {/* section 2 for similar products */}
      {similarTo && similarTo.length > 0 && (
        <div className="bg-white mt-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
          <p className="m-2 flex items-center justify-center gap-2 text-lg font-bold text-white bg-amber-400 dark:bg-amber-600 p-2 rounded-md mt-5 hover:text-yellow-500 transition-colors duration-500">
            <AlertTriangleIcon className="animate-bounce" />{" "}
            <ShinyText
              text="Similar reports found"
              disabled={false}
              speed={3}
              className="uppercase custom-class"
            />
          </p>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <TriangleAlertIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                Similar Reports
              </span>
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  similarReportIdsForDelete.length > 0
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <button onClick={()=>{handleDeleteSimilarProducts(report._id?.toString())}} className="bg-red-500/40 dark:bg-red-500 text-white p-2 rounded-md flex gap-2 text-lg font-bold hover:text-red-200">
                  <Trash2Icon /> Remove All
                </button>
              </div>
            </div>

            {/* Cards of similar reports */}
            <div className="flex flex-wrap gap-6">
              {similarTo.map((similarReport, index) => (
                <SpotlightCard
                  className="custom-spotlight-card max-w-[29rem]"
                  key={index}
                  spotlightColor={
                    typeof window !== "undefined" &&
                    document.documentElement.classList.contains("dark")
                      ? "rgba(67, 64, 150, 0.5)"
                      : "rgba(150, 255, 255, 0.3)"
                  }
                >
                  {/* Header / Index & Status */}
                  <div
                    className="flex items-center justify-between mb-2 p-2 rounded-md transition-all duration-300"
                    style={{
                      background: similarReportIdsForDelete.includes(
                        similarReport._id?.toString()
                      )
                        ? "rgba(49,196,145,0.3)"
                        : "transparent",
                      transform: similarReportIdsForDelete.includes(
                        similarReport._id?.toString()
                      )
                        ? "translateY(-12px) scale(1.05)"
                        : "translateY(0px) scale(1)",
                      opacity: 1,
                    }}
                  >
                    {" "}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                      <TriangleAlertIcon className="w-3 h-3 text-yellow-500 dark:text-yellow-400" />
                      Similar Report {index + 1}
                    </div>
                    <div className="flex gap-2 items-center">
                      {similarReport.status && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            similarReport.status === "RejectedByLab"
                              ? "bg-red-100 dark:bg-amber-900 text-amber-700 dark:text-orange-400"
                              : similarReport.status === "RejectedByAdmin"
                              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              : similarReport.status === "RejectedByFinance"
                              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              : similarReport.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                              : similarReport.status === "approved"
                              ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300"
                              : similarReport.status === "ApprovedByFinance"
                              ? "bg-green-100 dark:bg-emerald-700 text-green-700 dark:text-green-300"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {formatStatus(similarReport.status)}
                        </span>
                      )}
                      <div
                        onClick={() =>
                          toggleReportSelection(similarReport._id?.toString())
                        }
                        className="icon-container cursor-pointer"
                      >
                        <div className="icon-slider">
                          <div
                            className="icon-stack"
                            style={{
                              transform: similarReportIdsForDelete.includes(
                                similarReport._id?.toString()
                              )
                                ? "translateY(-36px) scale(1.05)"
                                : "translateY(0px) scale(1)",
                              opacity: 1, // always visible but animated
                            }}
                          >
                            <Trash2Icon className="text-red-500 w-7 h-7 opacity-35 hover:opacity-100 transition-opacity duration-200" />
                            <BadgeMinusIcon className="text-red-500 w-7 h-7 opacity-80 transition-opacity duration-300 delay-150" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white leading-snug">
                    {similarReport.title?.slice(0, 1).toUpperCase() +
                      similarReport.title?.slice(1)}
                  </h3>

                  {/* Tags */}
                  {similarReport.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {similarReport.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-green-600 text-white px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                        >
                          <Tag size={13} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Uploaded Info */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mb-4 leading-relaxed">
                    Uploaded by:{" "}
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {typeof similarReport.uploadedBy === "object" &&
                      "email" in similarReport.uploadedBy
                        ? (similarReport.uploadedBy as unknown as IUser).email
                        : "Unknown"}
                    </span>{" "}
                    <span className="bg-purple-500/20 text-purple-800 dark:text-purple-200 ml-1 px-1.5 py-0.5 rounded uppercase tracking-wide text-[10px]">
                      {typeof similarReport.uploadedBy === "object" &&
                      "role" in similarReport.uploadedBy
                        ? (similarReport.uploadedBy as unknown as IUser).role
                        : "Unknown"}{" "}
                      Person
                    </span>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-700 dark:text-gray-100">
                    {(similarReport.description ?? "").length > 60 ? (
                      <>
                        {similarReport.description?.slice(0, 60)}...
                        <span
                          onClick={() => {
                            handleProductVisit(similarReport._id?.toString());
                          }}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                        >
                          read more
                        </span>
                      </>
                    ) : (
                      similarReport.description || (
                        <em className="text-gray-400 dark:text-gray-500">
                          No description provided.
                        </em>
                      )
                    )}
                  </div>
                  <div
                    className="group relative inline-flex items-center space-x-2 cursor-pointer mt-2"
                    onClick={() => {
                      handleProductVisit(similarReport._id?.toString());
                    }}
                  >
                    {/* Circle with Arrow Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-all duration-300">
                      <ArrowRight
                        className="text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:-rotate-45"
                        size={20}
                      />
                    </div>

                    {/* Sliding Text */}
                    <span className="text-sm text-blue-600 dark:text-blue-300 font-medium opacity-0 dark:group-hover:bg-blue-800 group-hover:bg-blue-100 p-2 rounded-full transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      Visit Product
                    </span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* section 3 test results */}

      <div className="bg-white mt-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <p className="ms-center justify-center flex gap-2 m-2 text-lg font-bold text-white bg-green-500/50 dark:bg-green-500 p-2 rounded-md mt-5 hover:text-green-700 transition-colors duration-500">
          <FlaskConicalIcon className="animate-pulse" />
          <ShinyText
            text="Test Results"
            disabled={false}
            speed={3}
            className="uppercase custom-class"
          />
        </p>

        <div className="flex flex-wrap gap-6 m-4  justify-start">
          {testResults.flatMap((testResult, testIndex) =>
            testResult.score?.map((scoreItem, scoreIndex) => {
              const globalIndex =
                testResults
                  ?.slice(0, testIndex)
                  .reduce((acc, t) => acc + (t.score?.length || 0), 0) +
                scoreIndex +
                1;

              return (
                <div
                  key={`${testIndex}-${scoreIndex}`}
                  className=" w-[27rem] max-w-[44rem] min-h-max flex "
                >
                  <div className="border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 space-y-4 w-full">
                    {/* 🔢 Global Test Number */}
                    <div className="text-sm font-bold text-green-700 dark:text-green-300 flex items-center gap-5">
                      Test #{globalIndex}
                      <span
                        className={`font-semibold text-lg ${
                          scoreItem.verdict
                            ? "dark:text-green-500 text-green-500 bg-green-200 dark:bg-green-500/40 px-1 rounded-md"
                            : "dark:text-red-500 text-red-500 bg-red-200 dark:bg-red-500/40 px-1 rounded-md"
                        }`}
                      >
                        {scoreItem.verdict ? "Passed" : "Failed"}
                      </span>
                    </div>
                    {/* 👤 Tested By Info */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 border-b border-gray-500 pb-2 gap-2 flex">
                      <span className="font-semibold">Tested By:</span>{" "}
                      {testResult.uploadedBy?.email || "Unknown"}{" "}
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                        {(() => {
                          const role = testResult.uploadedBy?.role;
                          return role === "superadmin"
                            ? "Superadmin"
                            : role === "admin"
                            ? "Admin"
                            : role === "sales"
                            ? "Sales"
                            : role === "finance"
                            ? "Finance"
                            : "Lab Personnel";
                        })()}
                      </span>
                    </div>
                    {/* 📊 Score Info */}
                    <div className="grid   grid-cols-2 gap-y-6 gap-x-20 text-sm">
                      {scoreItem.name && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Test Name
                          </span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {scoreItem.name}
                          </span>
                        </div>
                      )}

                      {scoreItem.relatedTo && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Related To
                          </span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {scoreItem.relatedTo}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                          Observed Value
                        </span>
                        {scoreItem.value ? (
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {scoreItem.value} {scoreItem.unit || ""}
                          </span>
                        ) : (
                          <span className="text-gray-900 dark:text-white font-semibold">
                            -
                          </span>
                        )}
                      </div>

                      {Array.isArray(scoreItem.range) &&
                        scoreItem.range.length === 2 && (
                          <div className="flex flex-col">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                              Expected Range
                            </span>
                            {scoreItem.range[0] != null ? (
                              <span className="text-gray-900 dark:text-white font-semibold">
                                {scoreItem.range[0]} - {scoreItem.range[1]}{" "}
                                {scoreItem.unit || ""}
                              </span>
                            ) : (
                              <span className="text-gray-900 dark:text-white font-semibold">
                                -
                              </span>
                            )}
                          </div>
                        )}

                      {scoreItem.verdict !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Verdict
                          </span>
                          <span
                            className={`font-semibold ${
                              scoreItem.verdict
                                ? "dark:text-green-600 text-green-500"
                                : "dark:text-red-500 text-red-400"
                            }`}
                          >
                            {scoreItem.verdict ? "Passed" : "Failed"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 border-t border-gray-500 pt-4 text-gray-600 dark:text-gray-400 text-sm italic">
                      Remarks: {scoreItem.remarks ? scoreItem.remarks : "None."}
                    </div>{" "}
                    {/* File Info */}
                    {testResult.fileUrl ? (
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            onClick={() => handleDownload(testResult.fileUrl)}
                            className="text-blue-600 dark:text-blue-400 underline cursor-pointer"
                          >
                            {testResult.fileUrl.length > 40
                              ? testResult.fileUrl
                                  .split("/")
                                  .pop()
                                  ?.slice(0, 38) + "...file"
                              : testResult.fileUrl.split("/").pop()}
                          </a>

                          <button
                            onClick={() =>
                              window.open(
                                `${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${testResult.fileUrl}`,
                                "_blank"
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleDownload(testResult.fileUrl)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          >
                            Download
                          </button>
                          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">
                            {testResult.fileType?.toUpperCase()}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {(testResult.fileSize / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      </div>
                    ) : (
                      <em className="italic text-xs text-gray-300/40 translate-x-10">
                        No Attachmentes Provided.
                      </em>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BugReport;
