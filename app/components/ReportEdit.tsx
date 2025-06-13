"use client";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader2, TagIcon } from "lucide-react";
import { useNotification } from "@/app/components/Notification";
import { apiClient } from "@/lib/api-client";
import FileUpload from "@/app/components/FileUpload";
import { IUser } from "@/models/User";
import {  Types } from "mongoose";
import { StylesConfig, GroupBase } from "react-select";

interface ReportFormData {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  imageKitFileId: string;
  tags: string[];
  sharedWith: string[];
}

const tagOptions = [
  { label: "Urgent", value: "urgent" },
  { label: "Confidential", value: "confidential" },
  { label: "QA", value: "qa" },
  // Add more as needed
];

interface CustomSelectOption {
  label: string;
  value: string;
}

const customSelectStyles: StylesConfig<CustomSelectOption, true, GroupBase<CustomSelectOption>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#1f2937", // Tailwind gray-800
    borderColor: state.isFocused ? "#3b82f6" : "#374151", // Focus = blue-500, default = gray-700
    color: "#fff",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    minHeight: "42px",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1f2937", // Match control background
    color: "#fff",
    borderColor: "#374151",
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#374151" : "#1f2937",
    color: "#fff",
    "&:active": {
      backgroundColor: "#2563eb", // blue-600
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#374151", // Tag pill background
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#fff",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#f87171", // red-400
    ":hover": {
      backgroundColor: "#b91c1c", // red-700
      color: "white",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af", // gray-400
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  input: (base) => ({
    ...base,
    color: "#fff",
  }),
};

export default function SalesEditPage() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recipients, setRecipients] = useState<IUser[]>([]);
  const originalDataRef = useRef<Partial<ReportFormData>>({});
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
      fileType: "",
      fileSize: 0,
      imageKitFileId: "",
      tags: [],
      sharedWith: [],
    },
  });

  const watchTitle = watch("title");
  const watchDescription = watch("description");
  const watchRecipients = watch("sharedWith") || [];
  const watchTags = watch("tags") || [];

  // Load and normalize report from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("reportToEdit");
    if (stored) {
      const report = JSON.parse(stored);

      const sharedWithEmails = (report.sharedWith ?? []).map(
        (user: IUser | string) =>
          typeof user === "string" ? user : user.email ?? ""
      );

      const tagsArray =
        typeof report.tags === "string"
          ? report.tags.split(",").map((t: string) => t.trim())
          : report.tags ?? [];

      const normalized = {
        title: report.title,
        description: report.description,
        fileUrl: report.fileUrl,
        fileSize: report.fileSize,
        fileType: report.fileType,
        imageKitFileId: report.imageKitFileId,
        tags: tagsArray,
        sharedWith: sharedWithEmails,
      };

      Object.entries(normalized).forEach(([key, value]) => {
        setValue(key as keyof ReportFormData, value);
      });

      originalDataRef.current = normalized;
    }

    const fetchRecipients = async () => {
      try {
        const response = await apiClient.getRecipients();
        setRecipients(response);
      } catch (error) {
        console.error("Failed to fetch recipients", error);
      }
    };

    fetchRecipients();
  }, [setValue]);

  const handleUploadSuccess = (response: {
    filePath: string;
    size: number;
    fileId: string;
  }) => {
    setValue("fileUrl", response.filePath);
    setValue("fileSize", response.size);
    setValue("fileType", response.filePath.split(".").pop() || "Document");
    setValue("imageKitFileId", response.fileId);
    showNotification("Document uploaded successfully!", "success");
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const onSubmit = async (data: ReportFormData) => {
    setLoading(true);
    const original = originalDataRef.current;
    const updatedFields: Record<string, unknown> = {};

    for (const key in data) {
      const currentVal = data[key as keyof ReportFormData];
      const originalVal = original[key as keyof ReportFormData];

      if (Array.isArray(currentVal)) {
        const curr = currentVal?.sort().join(",");
        const orig = (originalVal as unknown[])?.sort().join(",");
        if (curr !== orig) {
          updatedFields[key as keyof ReportFormData] = currentVal;
        }
      } else if (currentVal !== originalVal) {
        updatedFields[key as keyof ReportFormData] = currentVal;
      }
    }

    // No fields updated
    if (Object.keys(updatedFields).length === 0) {
      showNotification("No changes detected.", "info");
      return;
    }

    // Normalize tags
    if (updatedFields.tags) {
      if (Array.isArray(updatedFields.tags)) {
        updatedFields.tags = updatedFields.tags.map((tag) => tag.trim());
      }
    }

    // Convert sharedWith to ObjectIds if changed
    if (updatedFields.sharedWith) {
      updatedFields.sharedWith = (updatedFields.sharedWith as string[])
        ?.map((email: string) => {
          const user = recipients.find((r) => r.email === email);
          return user ? user._id : undefined;
        })
        .filter((id): id is Types.ObjectId => id !== undefined)
        .map((id) => id.toString()) as string[];
    }

    setLoading(true);
    try {
      await apiClient.editReport(
        updatedFields,
        JSON.parse(sessionStorage.getItem("reportToEdit")!)._id
      );
      showNotification("Document updated successfully!", "success");
      sessionStorage.removeItem("reportToEdit");
    } catch (error) {
      setLoading(false);
      showNotification(
        error instanceof Error ? error.message : "Failed to update document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 dark bg-gray-900 text-white min-h-screen">
      {/* Left: Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-control">
          <label className="label">Title</label>
          <input
            type="text"
            className={`input input-bordered bg-gray-800 text-white ${
              errors.title ? "input-error" : ""
            }`}
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <span className="text-error text-sm">{errors.title.message}</span>
          )}
        </div>

        <div className="form-control">
          <label className="label">Description</label>
          <textarea
            className={`textarea textarea-bordered h-24 bg-gray-800 text-white ${
              errors.description ? "textarea-error" : ""
            }`}
            {...register("description", {
              required: "Description is required",
            })}
          />
          {errors.description && (
            <span className="text-error text-sm">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">Upload Document</label>
          <FileUpload
            onSuccess={handleUploadSuccess}
            onProgress={handleUploadProgress}
          />
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="form-control ">
          <label className="label">Recipients</label>
          <Select
            isMulti
            options={recipients.map((r) => ({
              value: r.email,
              label: r.email,
            }))}
            styles={customSelectStyles}
            onChange={(selected) =>
              setValue(
                "sharedWith",
                selected.map((opt) => opt.value)
              )
            }
          />
        </div>

        <div className="form-control">
          <label className="label">Tags</label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            onChange={(selected) =>
              setValue(
                "tags",
                selected.map((opt) => opt.value)
              )
            }
            value={watchTags.map((tag) => ({ label: tag, value: tag }))}
          />
        </div>
{!loading ? (

        <button type="submit" className="btn btn-primary btn-block">
          Send Updated Document
        </button>
):(
        <button type="button" className="btn btn-primary btn-block" disabled>
          <Loader2 className="animate-spin mr-2" size={16} /> Processing...
        </button>
)}
      </form>

      {/* Right: Preview */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 border border-gray-700">
        <h2 className="text-2xl font-semibold border-b border-gray-600 pb-2">
          Document Preview
        </h2>

        <div>
          <p className="text-sm text-gray-400">Title</p>
          <p className="text-lg font-medium">
            {watchTitle || (
              <span className="italic text-gray-500">No title</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Description</p>
          <p className="">
            {watchDescription || (
              <span className="italic text-gray-500">No description</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Recipients</p>
          <div className="flex flex-wrap gap-2">
            {watchRecipients.length ? (
              watchRecipients.map((email) => (
                <span
                  key={email}
                  className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
                >
                  {email}
                </span>
              ))
            ) : (
              <span className="italic text-gray-500">None selected</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Tags</p>
          <div className="flex flex-wrap gap-2">
            {watchTags.length ? (
              watchTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex gap-2 items-center"
                >
                  <TagIcon size={15} />
                  {tag}
                </span>
              ))
            ) : (
              <span className="italic text-gray-500">No tags</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Uploaded Document</p>
          {watch("fileUrl") ? (
            <div className="flex items-center gap-2">
              <a
                href={watch("fileUrl")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {watch("fileUrl").split("/").pop()}
              </a>
              <span
                key={watch("fileType")}
                className="bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                {watch("fileType").toUpperCase()}
              </span>
              <span className="text-gray-500">
                {(watch("fileSize") / 1024).toFixed(2)} KB
              </span>
              <span className="text-gray-500">
                {uploadProgress ? `${uploadProgress}%` : ""}
              </span>
            </div>
          ) : (
            <span className="italic text-gray-500">No document uploaded</span>
          )}
          <div className="text-gray-500 italic">[Preview not available]</div>
        </div>
      </div>
    </div>
  );
}
