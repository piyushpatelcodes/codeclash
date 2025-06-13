"use client";

import { useEffect, useState } from "react";
import { IUser } from "@/models/User";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  FlaskConicalIcon,
  Tag,
  TagIcon,
} from "lucide-react";
import { IReport } from "@/models/Report";

export default function ReportViewPage() {
  interface Report {
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
  }

  const [report, setReport] = useState<Report | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 space-y-6">
        <h1 className="text-3xl font-bold border-b border-gray-600 pb-2 gap-2 flex items-center">
          Report Details
          {status ? (
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
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
        </h1>

        {/* Title */}
        <div>
          <h2 className="text-sm text-gray-400">Title</h2>
          <p className="text-xl font-semibold">
            {title || <em className="text-gray-500">Untitled</em>}
            {similarTo.length > 0 && (
              <span
                data-tip={`Similar Products Found: ${similarTo?.length}`}
                className="text-red-500 font-extralight text-2xl hover:text-red-400 tooltip tooltip-error cursor-help"
              >
                *
              </span>
            )}
          </p>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm text-gray-400">Description</h2>
          <p>
            {description || (
              <em className="text-gray-500">No description provided</em>
            )}
          </p>
        </div>

        {/* Recipients */}
        <div>
          <h2 className="text-sm text-gray-400 mb-1">Recipients</h2>
          <div className="flex flex-wrap gap-2">
            {sharedWith.length > 0 ? (
              sharedWith.map((user: IUser | string) => {
                const email = typeof user === "string" ? user : user.email;
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

        {/* Tags */}
        <div>
          <h2 className="text-sm text-gray-400 mb-1">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-green-700 text-white px-3 py-1 rounded-full text-sm flex gap-2 items-center"
                >
                  <TagIcon size={15} /> {tag}
                </span>
              ))
            ) : (
              <em className="text-gray-500">No tags</em>
            )}
          </div>
        </div>

        {/* File Info + Download */}
        <h2 className="text-lg text-gray-400 mt-1">Attachments [File Info]</h2>
        {fileUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
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

            {/* Preview */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
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
          <em className="text-gray-500">No file uploaded</em>
        )}
        {/* Similar Reports Section */}
        {similarTo.length > 0 ? (
          <div className="space-y-4 border-t-4  border-gray-600  ">
            <p className="items-center justify-center flex gap-2  hover:text-yellow-500 transition-colors duration-500 text-lg font-bold text-white bg-amber-600 p-2 rounded-md mt-5">
              <AlertTriangleIcon className="animate-bounce" /> SIMILAR REPORTS
              FOUND
            </p>
            {similarTo.map((report, index) => (
              <div
                key={index}
                className="space-y-3 border-b border-gray-600 pb-4"
              >
                <h3 className="text-xl font-semibold">{`Similar Report ${
                  index + 1
                }`}</h3>
                <p className="text-lg flex flex-wrap gap-2 font-bold bg-base-200 p-2 rounded-lg">
                  Title: {report.title}
                  {report.status ? (
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        report.status === "RejectedByLab"
                          ? "bg-red-100 dark:bg-amber-900 text-amber-700 dark:text-orange-400"
                          : report.status === "RejectedByAdmin"
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : report.status === "RejectedByFinance"
                          ? "bg-red-100 dark:bg-pink-900 text-red-700 dark:text-red-300"
                          : report.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                          : report.status === "approved"
                          ? "bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300"
                          : report.status === "ApprovedByFinance"
                          ? "bg-green-100 dark:bg-emerald-700 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {formatStatus(report.status)}
                    </span>
                  ) : (
                    <em className="text-gray-500">No status provided</em>
                  )}
                  {report.tags && (
                    <span className="flex flex-wrap gap-2 opacity-55 hover:opacity-90 transition-opacity duration-500">
                      {report.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-extralight flex gap-2 items-center"
                        >
                          <Tag size={15} /> {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </p>
                {description ? (
                  <div className="collapse collapse-arrow text-black bg-gray-200  dark:text-white dark:bg-base-300/40">
                    <input type="checkbox" />
                    <div className="collapse-title text-md font-medium">
                      Description
                    </div>
                    <div className="collapse-content">
                      <p className="text-sm">
                        {report?.description || "No description provided."}
                      </p>
                      <p className="text-xs mt-5 italic border-gray-500 border-t-2 pt-2">
                        Uploaded At:{" "}
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
                      </p>
                      <p className="text-xs flex gap-2 mt-1 italic">
                        Uploaded By:{" "}
                        {(report.uploadedBy as unknown as IUser)?.email}
                        <span className="bg-purple-500/40 px-1 rounded-md">
                          {(report.uploadedBy as unknown as IUser)?.role} Person
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <em className="text-gray-500">No Descriptin Provided</em>
                )}
              </div>
            ))}
          </div>
        ) : (
          <em className="text-gray-500">No similar reports found</em>
        )}

        {/* Test Results Section */}
        {testResults.length > 0 ? (
          <div className="space-y-4 border-t-4  border-gray-600">
            <p className="ms-center justify-center flex gap-2 text-lg font-bold text-white bg-green-500 p-2 rounded-md mt-5 hover:text-green-700 transition-colors duration-500">
              <FlaskConicalIcon className="animate-pulse" /> TEST RESULTS
            </p>
            {testResults.map((testResult, index) => (
              <div
                key={index}
                className="space-y-3 border-b border-gray-600 pb-4"
              >
                <h3 className="text-xl font-semibold">{`Test Result ${
                  index + 1
                }`}</h3>
                <p className="text-xl italic">
                  Tested By: {testResult.uploadedBy?.email}{" "}
                  <span className="bg-purple-600 p-1 rounded-md text-xs font-medium">
                    {(() => {
                      const { role } = testResult.uploadedBy!;
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
                </p>
                {hasTestResultsWithScore &&
                  testResult.score?.map((scoreItem, idx) => (
                    <div key={idx} className="mb-4">
                      <div
                        tabIndex={0}
                        className="collapse max-w-lg collapse-arrow border border-base-300 bg-base-100 rounded-box shadow-sm"
                      >
                        <input type="checkbox" />
                        <div className="collapse-title text-lg font-semibold text-base-content">
                          Test {index + 1}.{idx + 1}:{" "}
                          {scoreItem.name || "Unnamed Test"}{" "}
                          <span className="ml-8 text-gray-500 dark:text-gray-400 font-medium">
                            Verdict:{" "}
                          </span>
                          <span
                            className={`font-semibold ${
                              scoreItem.verdict
                                ? "text-green-500 bg-green-600/40 p-1 rounded-md"
                                : "text-red-500 bg-red-600/40 p-1 rounded-md"
                            }`}
                          >
                            {scoreItem.verdict ? "Passed" : "Failed"}
                          </span>
                        </div>

                        <div className="collapse-content">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
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

                            {scoreItem.value && (
                              <div className="flex flex-col">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  Observed Value
                                </span>
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {scoreItem.value} {scoreItem.unit || ""}
                                </span>
                              </div>
                            )}

                            {(Array.isArray(scoreItem.range) &&
                              scoreItem.range.length === 2) ||
                              (scoreItem.range[0] != null && (
                                <div className="flex flex-col">
                                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    Expected Range
                                  </span>
                                  <span className="text-gray-900 dark:text-white font-semibold">
                                    {scoreItem.range[0]}
                                    {scoreItem.unit
                                      ? ` ${scoreItem.unit}`
                                      : ""}{" "}
                                    – {scoreItem.range[1]}
                                    {scoreItem.unit ? ` ${scoreItem.unit}` : ""}
                                  </span>
                                </div>
                              ))}

                            {scoreItem.verdict !== undefined && (
                              <div className="flex flex-col">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  Verdict
                                </span>
                                <span
                                  className={`font-semibold ${
                                    scoreItem.verdict
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {scoreItem.verdict ? "Passed" : "Failed"}
                                </span>
                              </div>
                            )}
                          </div>

                          {scoreItem.remarks && (
                            <div className="mt-4 border-t pt-4 text-gray-600 dark:text-gray-400 text-sm italic">
                              Remarks: {scoreItem.remarks}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {testResult.fileUrl && testResult.fileUrl.trim() !== "" && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      onClick={() => {
                        handleDownload(testResult.fileUrl);
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline cursor-pointer"
                    >
                      {testResult?.fileUrl?.split("/").pop()}
                    </a>
                    <button
                      onClick={() => {
                        handleDownload(testResult.fileUrl);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Download Test Result
                    </button>

                    <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs">
                      {testResult.fileType?.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {(testResult.fileSize / 1024).toFixed(2)} KB
                    </span>
                  </div>
                )}
                {testResult.fileUrl &&
                testResult.fileUrl.trim() !== "" &&
                testResult?.fileType === "pdf" ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${testResult.fileUrl}`}
                    title="PDF Preview"
                    className="w-full h-[600px] bg-white"
                  />
                ) : testResult.fileUrl &&
                  testResult.fileUrl.trim() !== "" &&
                  testResult.fileType?.match(/(jpg|jpeg|png|gif|webp)/i) ? (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${testResult.fileUrl}`}
                    title="Image Preview"
                    className="max-w-full max-h-[600px] object-contain mx-auto"
                  />
                ) : (
                  testResult.fileUrl &&
                  testResult.fileUrl.trim() !== "" && (
                    <p className="italic text-gray-500">
                      Preview not available for this file type.
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <em className="text-gray-500">No test results available</em>
        )}
      </div>
    </div>
  );
}
