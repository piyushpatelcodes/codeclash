import { FlaskConical } from "lucide-react";
import ShinyText from "./ui/ShinyText";

export  const TestCard = ({ product, scoreItem, scoreIndex = 0, uploadedBy }) => {
  return (
    <div className="bg-white mt-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md w-full">
      {/* Title & Description */}
     

      {/* Header */}
      <p className="ms-center justify-center flex gap-2 m-2 text-lg font-bold text-white bg-green-500/50 dark:bg-green-500 p-2 rounded-md mt-5 hover:text-green-700 transition-colors duration-500">
        <FlaskConical className="animate-pulse" />
        <ShinyText text="Test Results" disabled={false} speed={3} className="uppercase custom-class" />
      </p>

      {/* Test Card */}
      <div className="flex flex-wrap gap-6 m-4 justify-start">
        <div className="w-[27rem] max-w-[44rem] min-h-max flex">
          <div className="border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 space-y-4 w-full">
            {/* Title */}
            <div className="text-sm font-bold text-green-700 dark:text-green-300 flex items-center gap-5">
              Test #{scoreIndex + 1}
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

            {/* Tested By */}
            <div className="text-sm text-gray-600 dark:text-gray-300 border-b border-gray-500 pb-2 gap-2 flex">
              <span className="font-semibold">Tested By:</span> {uploadedBy?.email || "Unknown"}
              <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                {uploadedBy?.role || "Lab Personnel"}
              </span>
            </div>

            {/* Test Data */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-20 text-sm">
              {scoreItem.name && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Test Name</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{scoreItem.name}</span>
                </div>
              )}

              {scoreItem.relatedTo && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Related To</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{scoreItem.relatedTo}</span>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Observed Value</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {scoreItem.value ?? "-"} {scoreItem.unit || ""}
                </span>
              </div>

              {Array.isArray(scoreItem.range) && scoreItem.range.length === 2 && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Expected Range</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {scoreItem.range[0]} - {scoreItem.range[1]} {scoreItem.unit || ""}
                  </span>
                </div>
              )}

              {scoreItem.verdict !== undefined && (
                <div className="flex flex-col">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Verdict</span>
                  <span
                    className={`font-semibold ${
                      scoreItem.verdict ? "dark:text-green-600 text-green-500" : "dark:text-red-500 text-red-400"
                    }`}
                  >
                    {scoreItem.verdict ? "Passed" : "Failed"}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-gray-500 pt-4 text-gray-600 dark:text-gray-400 text-sm italic">
              Remarks: {scoreItem.remarks || "None."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
