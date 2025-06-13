"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FlaskConicalIcon, Loader2, LocateFixedIcon, MapPin, Tag, TagIcon, UploadCloudIcon } from "lucide-react";
import { useNotification } from "./Notification";
import { apiClient } from "@/lib/api-client";
import FileUpload from "./FileUpload";
import { IUser } from "@/models/User";
import { Types } from "mongoose";
import CreatableSelect from "react-select/creatable";

interface ReportFormData {
  title: string;
  region: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  imageKitFileId: string;
  tags: string[];
  testsToConduct: string[];
  sharedWith: string[];
  similarTo: Types.ObjectId[];
}
interface TagOption {
  label: string;
  value: string;
}
interface SimilarReport extends ReportFormData {
  _id: Types.ObjectId;
}

export default function DocumentUploadForm() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recipients, setRecipients] = useState<IUser[]>([]);
  const { showNotification } = useNotification();
  const [similarReports, setSimilarReports] = useState<SimilarReport[]>([]);
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState(false);
  const [isSimilarityChecked, setIsSimilarityChecked] = useState(false);

  const [tagOptions, setTagOptions] = useState<TagOption[]>([
    { label: "Electronics", value: "Electronics" },
    { label: "Medicine", value: "medicine" },
    { label: "Food & Beverage", value: "food beverage" },
    { label: "Cosmetics & Personal Care", value: "cosmetics personal care" },
    { label: "Industrial / Manufacturing", value: "industrial manufacturing" },
    { label: "Confidential", value: "confidential" },
    { label: "New Launch", value: "new-launch" },
  ]); // Default tags
  const [tags, setTags] = useState<TagOption[]>([]);

  const [testsToConductOptions, setTestsToConductOptions] = useState<TagOption[]>([
    { label: "Strength Tests", value: "strength tests" },
    { label: "Fastnes", value: "fastnes" },
    { label: "Shelf Life Test", value: "shelf life test" },
    { label: "Microbial Contamination Test", value: "microbial contamination test" },
    { label: "Quality Tests", value: "quality tests" },
  ]); // Default tests to conduct
  const [testsToConduct, setTestsToConduct] = useState<TagOption[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      title: "",
      region: "",
      description: "",
      fileUrl: "",
      fileType: "",
      fileSize: 0,
      imageKitFileId: "",
      tags: [],
      sharedWith: [],
      similarTo: [],
      testsToConduct: [],
    },
  });

  const titleValue = watch("title");
  const tagsValue = watch("tags");

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await apiClient.getRecipients(); // Make an API call to get the list of lab testers
        console.log("🚀 ~ fetchRecipients ~ response:", response);
        setRecipients(response);
      } catch (error) {
        console.error("Failed to fetch recipients", error);
      }
    };

    fetchRecipients();
  }, []);

  const getUserLocation = async () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Fetch the address using Nominatim (OpenStreetMap)
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
            .then((response) => response.json())
            .then((data) => {
              // Extract the address from the API response
              const address = data.display_name;
              console.log("🚀 ~ .then ~ address:", data);
              setValue("region", address);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching address:", error);
              setLoading(false);
              setValue("region", "Unable to fetch address");
            });
        },
        (error) => {
          console.error("Error detecting location:", error);
          setLoading(false);
          setValue("region", "Location not provided");
        }
      );
    } else {
      setLoading(false);
      setValue("region", "Geolocation not supported");
    }
  };

  // Similarity check on button click
  const handleCheckSimilarity = async () => {
    const query = titleValue.trim() + " " + tagsValue.join(", ");
    console.log("🚀 ~ handleCheckSimilarity ~ query:", query);
    if (query.length < 3) {
      setSimilarReports([]);
      setExists(false);
      showNotification("Title or Tags are too short in length!", "info");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/check-similar-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      console.log("🚀 ~ handleCheckSimilarity ~ data:", data);
      setSimilarReports(data.similarReports || []);
      setExists(data.exists);
      setIsSimilarityChecked(true);
      if (data.exists == false) {
        showNotification(
          "No similar reports found in database by the Software!",
          "success"
        );
      } else {
        showNotification(
          "Similar Reports and Products Found in Database!",
          "warning"
        );
      }
    } catch (err) {
      console.error("Error checking similarity:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleUploadSuccess = (response: {
    filePath: string;
    size: number;
    fileId: string;
  }) => {
    console.log("🚀 ~ handleUploadSuccess ~ response:", response);
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
    if (
      !data.fileUrl ||
      !data.fileSize ||
      !data.fileType ||
      !data.imageKitFileId
    ) {
      showNotification("Please upload a document first", "error");
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        ...data,
        sharedWith: data.sharedWith
          .map((email: string) => {
            const user = recipients.find(
              (recipient) => recipient.email === email
            );
            return user ? user._id : undefined; // Convert email to ObjectId, or undefined if no user is found
          })
          .filter((id): id is Types.ObjectId => id !== undefined),
        tags: Array.isArray(data?.tags)
          ? data.tags.map((tag) => tag.trim())
          : [],
        similarTo: similarReports.map((report) => report._id),
      };
      console.log("🚀 ~ onSubmit ~ updatedData:", updatedData)

      // Send the updated data
      await apiClient.sendDocument(updatedData);
      showNotification("Document sent successfully!", "success");

      // Reset form after successful submission
      setValue("title", "");
      setValue("region", "");
      setValue("description", "");
      setValue("fileUrl", "");
      setValue("fileSize", 0);
      setValue("imageKitFileId", "");
      setValue("tags", []);
      setValue("sharedWith", []);
      setValue("similarTo", []);
      setValue("testsToConduct", []);
      setUploadProgress(0);
      setSimilarReports([]);
      setExists(false);
      setIsSimilarityChecked(false);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to send document",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (newValue: TagOption[]) => {
      setTags(newValue);
      setValue(
        "tags",
        newValue.map((tag) => tag.value)
      );
      showNotification("Tags updated successfully!", "success");
  };

  const handleTestsToConductChange = (newValue: TagOption[]) => {
      setTestsToConduct(newValue);
      setValue(
        "testsToConduct",
        newValue.map((tag) => tag.value)
      );
      showNotification("Tests To Conduct updated successfully!", "success");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-control">
        <label className="label">Title</label>
        <input
          type="text"
          className={`input input-bordered ${
            errors.title ? "input-error" : ""
          }`}
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <span className="text-error text-sm mt-1">
            {errors.title.message}
          </span>
        )}
      </div>

      <div className="form-control">
        <label className="label">Description</label>
        <textarea
          className={`textarea textarea-bordered h-24 ${
            errors.description ? "textarea-error" : ""
          }`}
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <span className="text-error text-sm mt-1">
            {errors.description.message}
          </span>
        )}
      </div>

      <div className="form-control ">
        <label className="label">
          <span className="label-text">Region</span>
          <MapPin className="hover:text-primary" size={20} />
        </label>
        <div className="relative">
          {/* Location Icon Button (Left Inside Input) */}
          <button
            type="button"
            onClick={() => {
              getUserLocation();
            }}
            className="absolute tooltip tooltip-left left-1 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none z-10"
            data-tip="Use my location"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm text-primary"></span>
            ) : (
              <LocateFixedIcon size={27} />
            )}
          </button>

          {/* Input Field (with left padding to make room for icon) */}
          <input
            type="text"
            placeholder="Add City, State, Country OR 'Use Current Location'"
            className={`input input-bordered w-full pl-16 ${
              errors.region ? "input-error" : ""
            }`}
            {...register("region", { required: "Location is required" })}
          />
        </div>

        {errors.region && (
          <span className="text-error text-sm mt-1">
            {errors.region.message}
          </span>
        )}
      </div>

      <div className="form-control">
        <label className="label">Upload Document / MSDS <UploadCloudIcon className="hover:text-primary" size={23} /></label>
        <FileUpload
          onSuccess={handleUploadSuccess}
          onProgress={handleUploadProgress}
        />
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Tag selection with custom and default tags */}
      <div className="form-control">
        <label className="label">
          Category Tags <Tag className="hover:text-primary" size={18} />
        </label>
        <CreatableSelect
          isMulti
          options={tagOptions}
          value={tags}
          onChange={handleTagChange}
          isSearchable
          placeholder="|  Search or Create Tags"
          className="bg-gray-800 text-black border-gray-600 rounded-md"
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
          onCreateOption={(inputValue) => {
            const newTag = {
              label: inputValue,
              value: inputValue.toLowerCase(),
            };
            setTagOptions((prevTags) => [...prevTags, newTag]);
            setTags((prevTags) => [...prevTags, newTag]);
          }}
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "transparent",
              borderColor: "#ccc",
              color: "#000",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#333", // Dark background for the dropdown menu
              color: "#fff", // White text in the dropdown
              borderRadius: "0.375rem",
              zIndex:2,
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected
                ? "#4f46e5"
                : state.isFocused
                ? "#3730a3"
                : "#333", // Dark background when focused or selected
              color: state.isSelected ? "#fff" : "#fff", // White text color
            }),
            input: (provided) => ({
              ...provided,
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#35335E",
              padding: "0.1rem",
              margin: "0.5rem",
              borderColor: "#ccc",
              borderRadius: "0.375rem",
              color: "#fff", // White text color for input
            }),
            placeholder: (provided) => ({
              ...provided,
              zIndex: 1,
              margin: "0.5rem",
              color: "#bbb", // Lighter color for the placeholder
            }),
          }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.value}
              className="px-3 py-1 bg-purple-500/40  rounded-full text-sm"
            >
              {tag.label}{" "}
              <button
                className="ml-2 hover:bg-red-500/40 p-2 rounded-md"
                onClick={() =>
                  setTags(tags.filter((t) => t.value !== tag.value))
                }
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Tests to Conduct selection with custom and default tests */}
      <div className="form-control">
        <label className="label">
          Tests To Conduct <FlaskConicalIcon className="hover:text-primary" size={18} />
        </label>
        <CreatableSelect
          isMulti
          options={testsToConductOptions}
          value={testsToConduct}
          onChange={handleTestsToConductChange}
          isSearchable
          placeholder="|  Search or Create Tests"
          className="bg-gray-800 text-black border-gray-600 rounded-md"
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
          onCreateOption={(inputValue) => {
            const newTag = {
              label: inputValue,
              value: inputValue.toLowerCase(),
            };
            setTestsToConductOptions((prevTags) => [...prevTags, newTag]);
            setTestsToConduct((prevTags) => [...prevTags, newTag]);
          }}
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "transparent",
              borderColor: "#ccc",
              color: "#000",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#333", // Dark background for the dropdown menu
              color: "#fff", // White text in the dropdown
              borderRadius: "0.375rem",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected
                ? "#0CA30E"
                : state.isFocused
                ? "#076E09"
                : "#333", // Dark background when focused or selected
              color: state.isSelected ? "#0CA30E" : "#fff", // White text color
            }),
            input: (provided) => ({
              ...provided,
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#335861",
              padding: "0.1rem",
              margin: "0.5rem",
              borderColor: "#ccc",
              borderRadius: "0.375rem",
              color: "#fff", // White text color for input
            }),
            placeholder: (provided) => ({
              ...provided,
              zIndex: 1,
              margin: "0.5rem",
              color: "#bbb", // Lighter color for the placeholder
            }),
          }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {testsToConduct.map((tag) => (
            <span
              key={tag.value}
              className="p-2 bg-green-500/40 flex gap-2  rounded-full text-sm"
            > 
            <FlaskConicalIcon  size={18} />
              {tag.label}{" "}
             
            </span>
          ))}
        </div>
      </div>

      <div className="form-control">
        <label className="label">Select Recipient</label>
        <select
          className={`select select-bordered ${
            errors.sharedWith ? "select-error" : ""
          }`}
          {...register("sharedWith", { required: "Please select a recipient" })}
          multiple
        >
          <option value="">Select a lab tester</option>
          {recipients.map((recipient) => (
            <option key={recipient.email} value={recipient.email}>
              {recipient.email}
            </option>
          ))}
        </select>
        {errors.sharedWith && (
          <span className="text-error text-sm mt-1">
            {errors.sharedWith.message}
          </span>
        )}
      </div>

      {/* Button to check similarity */}
      <div className="form-control">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCheckSimilarity}
          disabled={checking}
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking for Similarity...
            </>
          ) : (
            "Check Similarity"
          )}
        </button>
      </div>

      {/* Display similar report results */}
      {isSimilarityChecked && exists && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded">
          ⚠️ Similar product(s) found:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {similarReports.map((report, idx) => (
              <li key={idx}>
                <strong>{report.title}</strong>{" "}
                {report.tags?.length > 0 && (
                  <span className="text-xs text-gray-600">
                    ({report.tags.join(", ")})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={loading || !uploadProgress || !isSimilarityChecked}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Document...
          </>
        ) : (
          "Send Document"
        )}
      </button>
    </form>
  );
}
