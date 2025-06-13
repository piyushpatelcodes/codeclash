"use client";
import { apiClient } from "@/lib/api-client";
import { IReport } from "@/models/Report";
import { IUser } from "@/models/User";
import { Edit, Eye, Trash2Icon, Upload } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import avatar from "../../../public/avatar.jpeg";
import { usePathname, useRouter } from "next/navigation";
import { useNotification } from "../Notification";
import Modal from "../ui/Modal";
import UploadVerdictForm from "../VerdictUploadForm";

type Person = { name: string; avatar: string };
type Task = {
  name: string;
  description: string;
  estimation: string;
  type: string;
  people: Person[];
  priority: "High" | "Medium" | "Low";
  status: "To-do" | "On Progress" | "In Review";
};
type GroupByOption = "none" | "status" | "date" | "user" | "role";

const mockTasks: Task[] = [
  // To-do section
  {
    name: "Employee Details",
    description: "Create a page where there is information about employees",
    estimation: "Feb 10, 2024 - Feb 1, 2024",
    type: "Dashboard",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "Medium",
    status: "To-do",
  },
  {
    name: "Darkmode version",
    description: "Darkmode version for all screens",
    estimation: "Feb 10, 2024 - Feb 1, 2024",
    type: "Mobile App",
    people: [{ name: "AL", avatar: "/avatars/al.png" }],
    priority: "Low",
    status: "To-do",
  },
  {
    name: "Super Admin Role",
    description: "-",
    estimation: "Feb 10, 2024 - Feb 1, 2024",
    type: "Dashboard",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "Medium",
    status: "To-do",
  },

  // On Progress section
  {
    name: "Super Admin Role",
    description: "-",
    estimation: "Feb 14, 2024 - Feb 1, 2024",
    type: "Dashboard",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "High",
    status: "On Progress",
  },
  {
    name: "Settings Page",
    description: "-",
    estimation: "Feb 14, 2024 - Feb 1, 2024",
    type: "Mobile App",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "Medium",
    status: "On Progress",
  },
  {
    name: "KPI and Employee Statistics",
    description: "Create a design that displays KPIs and employee statistics",
    estimation: "Feb 14, 2024 - Feb 1, 2024",
    type: "Mobile App",
    people: [{ name: "AL", avatar: "/avatars/al.png" }],
    priority: "Low",
    status: "On Progress",
  },

  // In Review section
  {
    name: "Customer Role",
    description: "-",
    estimation: "Feb 14, 2024 - Feb 1, 2024",
    type: "Dashboard",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "Medium",
    status: "In Review",
  },
  {
    name: "Admin Role",
    description:
      "Set up with relevant information such as profile picture, phone number etc",
    estimation: "Feb 14, 2024 - Feb 1, 2024",
    type: "Dashboard",
    people: [
      { name: "AL", avatar: "/avatars/al.png" },
      { name: "DT", avatar: "/avatars/dt.png" },
    ],
    priority: "Medium",
    status: "In Review",
  },
];

const getUserRole = (): string => {
  const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
  return currentUser?.role || "guest"; // Default to "guest" if no role is found
};

// Function to generate status options based on the current user's role
const getStatusOptions = (role: string, status: string) => {
  const capitalRole = role.charAt(0).toUpperCase() + role.slice(1);

  // Initialize an array to store the options
  const statusOptions = [{ label: "Pending", value: "pending" }];

  // Add the current status if it's not already "Pending"
  if (status && status !== "pending") {
    statusOptions.push({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: status,
    });
  }

  // Dynamically add options based on the role, but avoid duplicating
  if (role === "labtester") {
    if (!statusOptions.some((option) => option.value === "reviewed")) {
      statusOptions.push({
        label: `Reviewed by ${capitalRole}`,
        value: "reviewed",
      });
    }
    if (!statusOptions.some((option) => option.value === "RejectedByLab")) {
      statusOptions.push({
        label: `Rejected by ${capitalRole}`,
        value: "RejectedByLab",
      });
    }
  }

  if (role === "admin") {
    if (!statusOptions.some((option) => option.value === "approved")) {
      statusOptions.push({
        label: `Approved by ${capitalRole}`,
        value: "approved",
      });
    }
    if (!statusOptions.some((option) => option.value === "RejectedByAdmin")) {
      statusOptions.push({
        label: `Rejected by ${capitalRole}`,
        value: "RejectedByAdmin",
      });
    }
  }

  if (role === "finance") {
    if (!statusOptions.some((option) => option.value === "ApprovedByFinance")) {
      statusOptions.push({
        label: `Approved by ${capitalRole}`,
        value: "ApprovedByFinance",
      });
    }
    if (!statusOptions.some((option) => option.value === "RejectedByFinance")) {
      statusOptions.push({
        label: `Rejected by ${capitalRole}`,
        value: "RejectedByFinance",
      });
    }
  }

  return statusOptions;
};

export default function TaskTable() {
  const [groupBy, setGroupBy] = useState<GroupByOption>("none");
  const [reports, setReports] = useState<IReport[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const { showNotification } = useNotification();
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskformodal, setTaskformodal] = useState<IReport | null>(null);

  const openModal = (task: IReport) => {
    setTaskformodal(task);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTaskformodal(null);
  };

  // Fetch the role when the component mounts
  useEffect(() => {
    const role = getUserRole(); // Get the current user role
    setCurrentUserRole(role); // Set the user role in the state
  }, []);

  // Function to handle status change
  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    taskId: string
  ) => {
    const newStatus = e.target.value;

    // Find the task that was updated
    const taskToUpdate = reports.find(
      (task) => task._id?.toString() === taskId
    );

    // If the status is the same, no need to update
    if (taskToUpdate?.status === newStatus) return;

    try {
      // Make a PATCH request to update the task status
      await apiClient.updateStatus(
        {
          status: newStatus as
            | "pending"
            | "reviewed"
            | "approved"
            | "ApprovedByFinance"
            | "RejectedByLab"
            | "RejectedByFinance"
            | "RejectedByAdmin",
        },
        taskId
      );

      // Update the task status locally

      showNotification("Status updated successfully!", "success");
      window.location.reload();
    } catch (err) {
      console.error("Error updating status:", err);
      showNotification("Error updating status", "error");
    }
  };

  const handleEdit = (report: IReport | undefined) => {
    if (!report?._id) {
      console.error("Report ID is undefined");
      return;
    }
    sessionStorage.setItem("reportToEdit", JSON.stringify(report));
    router.push(`${pathname}/edit/${report._id}`);
  };

  const handleViewDocument = (report: IReport | undefined) => {
    if (!report?._id) {
      console.error("Report ID is undefined");
      return;
    }
    sessionStorage.setItem("reportToView", JSON.stringify(report));
    router.push(`${pathname}/view/${report._id}`);
  };

  const handleDeleteDocument = async (reportId: string | undefined) => {
    showNotification("Deleting Report..", "info");

    if (!reportId) {
      console.error("Report ID is undefined");
      return;
    }
    try {
      const data = await apiClient.deleteReport(reportId);
      showNotification("Report Deleted successfully!", "success");
      console.log("🚀 ~ TaskTable ~ handleDeleteDocument ~ data:", data);
      window.location.reload();
    } catch (error) {
      showNotification("Failed to Delete!", "error");
      console.log("🚀 ~ TaskTable ~ handleDeleteDocument ~ error:", error);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await apiClient.getReports();
        setReports(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchReports();
  }, []);
  console.log("🚀 ~ TaskTable ~ reports:", reports);

  const getGroupedSections = () => {
    switch (groupBy) {
      case "status":
        return Array.from(new Set(reports.map((t) => t.status))).map(
          (status) => ({ label: status.toUpperCase(), value: status })
        );
      case "date":
        const dates = reports.map(
          (t) => t.createdAt?.toString()?.split("T")[0]
        );
        return Array.from(new Set(dates)).map((date) => ({
          label: date,
          value: date,
        }));
      case "user":
        const users = reports
          .map((r) => (r.uploadedBy as unknown as IUser)?.email)
          .filter(Boolean);

        return Array.from(new Set(users)).map((email) => ({
          label: email,
          value: email,
        }));

      case "role":
        const roles = reports
          .map((r) => (r.uploadedBy as unknown as IUser)?.role)
          .filter(Boolean);
        return Array.from(new Set(roles)).map((role) => ({
          label: role,
          value: role,
        }));

      default:
        return [{ label: "All Tasks", value: "all" }];
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
    <div className="bg-white dark:bg-[#23232b] rounded-lg shadow  ">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-gray-700 dark:text-gray-300"
        >
          <option value="status">Group by Status</option>
          <option value="date">Group by Date</option>
          <option value="user">Group by User</option>
          <option value="role">Group by Role</option>
          <option className="text-red-400" value="none">
            No Grouping
          </option>
        </select>
      </div>

      {getGroupedSections().map(({ label, value }) => (
        <div key={label}>
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
            {groupBy === "status" && label}
            {groupBy === "role" && label.toUpperCase()}
            {groupBy === "date" && `Date: ${label}`}
            {groupBy === "user" && `User: ${label}`}
            {groupBy === "none" && "All Tasks"}
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-500">
                <th className="p-3 text-left border-r border-gray-200 dark:border-gray-700 w-[11vw]">
                  Task Name
                </th>
                <th className="p-3 text-left w-[11vw] border-r border-gray-200 dark:border-gray-700 ">
                  Description
                </th>
                <th className="p-3  text-left border-r border-gray-200 dark:border-gray-700">
                  Created At
                </th>
                <th className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                  Type
                </th>
                <th className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                  People
                </th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left border-l border-gray-200 dark:border-gray-700">
                  Actions
                </th>
                {(currentUserRole === "labtester" || currentUserRole === "finance" ||
                  currentUserRole === "admin") && (
                  <th className="p-3 text-left">Verdict</th>
                )}
              </tr>
            </thead>
            <tbody>
              {reports
                .filter((t) =>
                  groupBy === "status"
                    ? t.status === value
                    : groupBy === "date"
                    ? t.createdAt?.toString()?.split("T")[0] === value
                    : groupBy === "user"
                    ? t.uploadedBy?.toString() === value
                    : groupBy === "role"
                    ? (t.uploadedBy as unknown as IUser)?.role === value
                    : true
                )
                .map((task, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-300/40 dark:hover:bg-gray-800"
                  >
                    <td className="p-3 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      {task.title}
                      {task.similarTo?.length > 0 && (
                        <span className="relative group">
                          <p
                            data-tip={`Similar Products Found: ${task.similarTo?.length}`}
                            className="text-2xl text-red-600 cursor-help tooltip tooltip-error  "
                          >
                            *
                          </p>
                         
                        </span>
                      )}
                    </td>

                    <td className="p-3 w-[21vw] text-gray-700 dark:text-gray-300  border-r border-gray-200 dark:border-gray-700">
                      {(task?.description ?? "").length > 50 ? (
                        <>
                          {task.description?.slice(0, 50)}...
                          <span
                            onClick={() => {
                              handleViewDocument(task);
                            }}
                            className="text-blue-500 cursor-pointer"
                          >
                            read more
                          </span>
                        </>
                      ) : (
                        task.description
                      )}
                    </td>
                    <td className="p-3 w-[12vw] text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {task.createdAt
                        ? new Date(task.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="p-3 w-[6vw] border-r border-gray-200 dark:border-gray-700">
                      <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {task.fileType}
                      </span>
                    </td>
                    <td className="p-3 border-r w-[7vw] border-gray-200 dark:border-gray-700">
                      <div className="flex -space-x-2">
                        {task.sharedWith?.map((user) => {
                          // Destructure the user object to get email
                          const email =
                            typeof user === "object" && "email" in user
                              ? user.email
                              : "Unknown";
                          const role =
                            typeof user === "object" && "role" in user
                              ? user.role
                              : "Unknown";
                          const tooltipContent = `${email}, ${
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
                            <div
                              className="relative tooltip "
                              data-tip={tooltipContent}
                              key={user._id?.toString()} // Use _id for uniqueness (instead of idx)
                            >
                              <Image
                                width={34}
                                height={34}
                                src={avatar} // Assuming `avatar` is predefined
                                alt={email as string} // Use email as alt text for better accessibility
                                className="rounded-full cursor-pointer border-2 border-white  hover:border-purple-500 transition-transform transform group-hover:scale-110  ease-in-out duration-200"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="w-[14vw] p-3 gap-2 flex items-center">
                      <span
                        className={`px-2 py-1 rounded ${
                          task.status === "RejectedByLab"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : task.status === "RejectedByAdmin"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : task.status === "RejectedByFinance"
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : task.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                            : task.status === "approved"
                            ? "bg-yellow-100 dark:bg-green-700 text-yellow-700 dark:text-green-300"
                            : task.status === "ApprovedByFinance"
                            ? "bg-yellow-100 dark:bg-green-700 text-yellow-700 dark:text-green-300"
                            : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {formatStatus(task.status)}
                      </span>
                      {task.testResults.length > 0 ? (
                        <span className="text-green-500 text-sm font-semibold">
                          {task.testResults.length} Results
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-sm font-semibold opacity-60">
                          No Results
                        </span>
                      )}
                    </td>
                    <td className="w-[9vw] p-3 border-l border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                          <Edit
                            onClick={() => handleEdit(task)}
                            size={20}
                            className="hover:text-blue-400 text-gray-400 cursor-pointer transition duration-150 ease-in-out transform active:scale-75"
                          />
                        {(currentUserRole === "admin" || currentUserRole === "finance" ||
                          currentUserRole === "labtester") && (
                          <Upload
                            onClick={() => {
                              console.log(
                                "Opening upload modal for task:",
                                task
                              ); // Log the task to verify
                              openModal(task); // Pass the correct task._id
                            }}
                            size={20}
                            className="hover:text-blue-400 text-gray-400 cursor-pointer transition duration-150 ease-in-out transform active:scale-75"
                          />
                        )}
                        <Modal isOpen={isModalOpen} closeModal={closeModal}>
                          <h2 className="text-xl font-semibold mb-4">
                            Upload Test Result
                          </h2>
                          <UploadVerdictForm
                            report={taskformodal || undefined}
                            closeModal={closeModal}
                          />
                        </Modal>

                        <Eye
                          onClick={() => handleViewDocument(task)}
                          size={20}
                          className="hover:text-blue-500 text-gray-400 cursor-pointer transition duration-150 ease-in-out transform active:scale-75"
                        />
                        <Trash2Icon
                          onClick={() =>
                            handleDeleteDocument(task._id?.toString())
                          }
                          size={20}
                          className="hover:text-red-500 text-red-700 cursor-pointer transition duration-150 ease-in-out transform active:scale-75"
                        />
                      </div>
                    </td>

                    {(currentUserRole === "labtester" || currentUserRole === "finance" ||
                      currentUserRole === "admin") && (
                      <td className="w-[9vw] p-3">
                        <select
                          className="dark:bg-gray-900 cursor-pointer dark:text-white text-black bg-white p-2 rounded-md w-full border dark:border-gray-700 border-gray-400 focus:outline-none focus:ring focus:ring-blue-200  dark:focus:ring-blue-500"
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(e, task._id?.toString())
                          }
                        >
                          {getStatusOptions(currentUserRole, task.status).map(
                            (option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
