"use client"
import { useEffect, useState } from "react";
import ThemeToggle from "./Theme-toggle";
import { apiClient } from "@/lib/api-client";
import { IReport } from "@/models/Report";


const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ApprovedByFinance: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  RejectedByLab: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  RejectedByAdmin: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  RejectedByFinance: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  unknown: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
};

export default  function Header() {
    const [reports, setReports] = useState<IReport[]>([]);
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
      const fetchReports = async () => {
        try {
          const data = await apiClient.getReports();
          setReports(data);
          const counts = countReportsByStatus(data);
        setStatusCounts(counts);
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      };
  
      fetchReports();
    }, []);

    const countReportsByStatus = (reports: IReport[]) => {
      return reports.reduce((acc, report) => {
        const status = report.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Craftboard Project</h1>
        <div className="flex space-x-4 mt-2">
          {/* <button className="border-b-2 border-indigo-600 dark:border-indigo-400 pb-1 text-indigo-600 dark:text-indigo-300">List</button>
          <button className="text-gray-400 dark:text-gray-500">Kanban</button>
          <button className="text-gray-400 dark:text-gray-500">Timeline</button> */}
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                STATUS_COLORS[status] || STATUS_COLORS["unknown"]
              }`}
            >
              {status.toUpperCase()}: {count}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Avatars */}
        {/* <div className="flex -space-x-2">
          <img src="/vercel.svg" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" />
          <img src="/vercel.svg" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" />
        </div> */}
          <a href="/upload" className="no-underline text-white">
        <button className="dark:bg-indigo-600 bg-indigo-500 text-white px-4 py-2 rounded-lg ml-4 hover:bg-indigo-700">

          + New Product
          </button>
          </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
