/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { IUser } from "@/models/User";
import { userInfo } from "os";
import { Edit, Eye, Trash2Icon, Upload } from "lucide-react";
import Modal from "./ui/Modal";
import UploadVerdictForm from "./VerdictUploadForm";
import { IReport } from "@/models/Report";
import router from "next/router";
import { usePathname, useRouter } from "next/navigation";
import { useNotification } from "./Notification";

// Statuses/columns in the order you want
const COLUMN_ORDER = [
  { key: "pending", label: "PENDING" },
  { key: "reviewed", label: "REVIEWED" },
  { key: "RejectedByLab", label: "REJECTED" },
  { key: "approved", label: "APPROVED" },
];

const getUserRole = (): string => {
    const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    return currentUser?.role || "guest"; // Default to "guest" if no role is found
  };

// --- Task Card ---
function KanbanTaskCard({
  task,
  listeners,
  attributes,
  setNodeRef,
  isDragging,
}: {
  task: any;
  listeners?: any;
  attributes?: any;
  setNodeRef?: any;
  isDragging?: boolean;
}) {
    const [currentUserRole, setCurrentUserRole] = useState<string>("");
    const router = useRouter();
      const pathname = usePathname();
        const { showNotification } = useNotification();
      
     const [isModalOpen, setIsModalOpen] = useState(false);
      const [taskIdformodal, setTaskIdformodal] = useState<string | null>(null);
    useEffect(() => {
        const role = getUserRole(); // Get the current user role
        setCurrentUserRole(role); // Set the user role in the state
      }, []);
  const handleDownload = async (url: string) => {
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
      link.download = url.split("/").pop() || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Unable to download file.");
      console.error(error);
    }
  };

  const openModal = (taskId: string) => {
    setTaskIdformodal(taskId);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTaskIdformodal(null);
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


  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-xl p-4 mb-4 shadow-md border border-transparent bg-white/5 transition
        ${isDragging ? "opacity-50" : ""}
        bg-violet-500/30
      `}
      style={{
        boxShadow: task.highlight
          ? "0 0 0 2px #a78bfa, 0 4px 16px 0 rgba(80, 70, 229, 0.15)"
          : undefined,
      }}
    >
      <div className="text-lg font-semibold tracking-wide  mb-1">
        {task.title || task._id?.slice(-6)?.toUpperCase()}
      </div>
      <div className="text-sm font-thin tracking-wide  mb-1">
        {(task?.description ?? "").length > 50 ? (
          <>
            {task.description?.slice(0, 50)}...
            <span
              onClick={() => {
                //   handleViewDocument(task);
              }}
              className="text-blue-500 cursor-pointer"
            >
              read more
            </span>
          </>
        ) : (
          task.description
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        {task.fileUrl && (
          <>
            <span className="px-2 text-xs textarea-sm font-extralight py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              {task.fileType.toUpperCase()}
            </span>
            <a
              onClick={() => {
                handleDownload(task.fileUrl);
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline cursor-pointer"
            >
              <span className={`text-sm font-medium text-blue-400`}>
                {task.fileUrl.slice(1, 9) || "-"}.{task.fileType}
              </span>
            </a>
            <span className={`text-sm font-medium text-blue-400`}>
              {(task.fileSize! / 1024).toFixed(2)} KB
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 ">
        {task.taskResults?.length > 0 || (
          <span className="text-green-500 text-sm font-semibold">
            {task.testResults?.length} Results
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        {task.uploadedBy?.avatar && (
          <Image
            src={task.uploadedBy.avatar}
            alt={task.uploadedBy?.email || "User"}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className={`text-xs font-medium text-gray-400`}>
          Uploaded By: {task.uploadedBy?.email || "-"}
        </span>
      </div>
      <div>
      {/* <div className="flex items-center space-x-2">
                        {currentUserRole === "sales" && (
                          <Edit
                            onClick={() => handleEdit(task)}
                            size={20}
                            className="hover:text-blue-400 text-gray-400 cursor-pointer transition duration-150 ease-in-out transform active:scale-75"
                          />
                        )}
                        {(currentUserRole === "admin" ||
                          currentUserRole === "labtester") && (
                          <Upload
                            onClick={() => {
                              console.log(
                                "Opening upload modal for task:",
                                task
                              ); // Log the task to verify
                              openModal(task._id?.toString()); // Pass the correct task._id
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
                            reportId={taskIdformodal || undefined}
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
                      </div> */}
      </div>
    </div>
  );
}

// --- Sortable Task Wrapper ---
function SortableTask({ task }: { task: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <KanbanTaskCard
        task={task}
        listeners={listeners}
        attributes={attributes}
        setNodeRef={setNodeRef}
        isDragging={isDragging}
      />
    </div>
  );
}

// --- Column ---
function KanbanColumn({
  columnKey,
  label,
  tasks,
  children,
  listeners,
  attributes,
  isDragging,
}: {
  columnKey: string;
  label: string;
  tasks: any[];
  children?: React.ReactNode;
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: columnKey, // make the whole column droppable
      });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`bg-[#181B2A]/80 rounded-2xl p-5 min-w-[320px] max-w-[340px] flex-1 flex flex-col ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        minHeight: 500,
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="text-gray-400 font-semibold text-sm tracking-widest">
          {label}
        </span>
        <span className="text-xs bg-[#23263A] text-gray-400 px-2 py-1 rounded-lg font-bold">
          {tasks.length}
        </span>
      </div>
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </div>
  );
}

// --- Main Kanban Board ---
export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState<Record<string, any[]>>({});
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const { showNotification } = useNotification();
  

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const [userRole, setUserRole] = useState<string>("");

useEffect(() => {
  const role = getUserRole();
  setUserRole(role);
}, []);


  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await apiClient.getReports();
        console.log("🚀 ~ fetchTasks kanban ~ data:", data);
        setTasks(data);

        // Group tasks by status
        const grouped = {};
        COLUMN_ORDER.forEach((col) => {
          grouped[col.key] = [];
        });
        data.forEach((task) => {
          const status = task.status || "To-do";
          if (!grouped[status]) grouped[status] = [];
          grouped[status].push(task);
        });
        setColumns(grouped);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Find column by task id
  const findColumnByTaskId = (taskId: UniqueIdentifier) => {
    return Object.entries(columns).find(([col, tasks]) =>
      tasks.some((t) => t._id === taskId)
    )?.[0];
  };

  // Handlers
  function handleDragStart(event) {
    const { active } = event;
    // Column drag (not supported here)
    // Task drag
    const task = Object.values(columns)
      .flat()
      .find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveColumn(null);
    const { active, over } = event;
    if (!over) return;

    // Task drag
    const fromColKey = findColumnByTaskId(active.id);
    const toColKey = findColumnByTaskId(over.id) || over.id; // over.id can be a column id if dropped on column
    if (!fromColKey || !toColKey) return;

    if (fromColKey === toColKey) {
      // Reorder within column
      const fromTasks = [...columns[fromColKey]];
      const oldIdx = fromTasks.findIndex((t) => t._id === active.id);
      const newIdx = fromTasks.findIndex((t) => t._id === over.id);
      setColumns((prev) => ({
        ...prev,
        [fromColKey]: arrayMove(fromTasks, oldIdx, newIdx),
      }));
      
    } else {
      // Move across columns
      const fromTasks = [...columns[fromColKey]];
      const toTasks = [...columns[toColKey]];
      const taskIdx = fromTasks.findIndex((t) => t._id === active.id);
      const [movedTask] = fromTasks.splice(taskIdx, 1);
      movedTask.status = toColKey; // update status for backend!
      toTasks.splice(0, 0, movedTask); // insert at top

      setColumns((prev) => ({
        ...prev,
        [fromColKey]: fromTasks,
        [toColKey]: toTasks,
      }));

      // Optionally: persist status change to backend
      try {
        await apiClient.updateStatus({ status: toColKey as "pending" | "reviewed" | "approved" | "ApprovedByFinance" | "RejectedByLab" | "RejectedByFinance" | "RejectedByAdmin" }, movedTask._id);
        console.log("Status updated!");
        showNotification("Status updated successfully!", "success");
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    //   await apiClient.updateStatus({ status: toColKey }, movedTask._id);
    }
  }

  return (
    <>
      <div className="mb-8">
        
        <span className="text-xs bg-[#23263A] text-gray-400 px-2 py-1 rounded-lg font-bold">
          {tasks.length} tasks
        </span>
      </div>
      <DndContext
        sensors={["admin", "labtester","finance"].includes(userRole) ? sensors : undefined}
        collisionDetection={closestCorners}
        onDragStart={["admin", "labtester","finance"].includes(userRole) ? handleDragStart : undefined}
  onDragEnd={["admin", "labtester","finance"].includes(userRole) ? handleDragEnd : undefined}
      >
        <div className="flex gap-6 overflow-x-auto">
          <SortableContext
            items={COLUMN_ORDER.map((c) => c.key)}
            strategy={horizontalListSortingStrategy}
          >
            {COLUMN_ORDER.map((col) => (
              <KanbanColumn
                key={col.key}
                columnKey={col.key}
                label={col.label}
                tasks={columns[col.key] || []}
              >
                {(columns[col.key] || []).map((task) => (
                  <SortableTask key={task._id} task={task} />
                ))}
              </KanbanColumn>
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeTask ? <KanbanTaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
