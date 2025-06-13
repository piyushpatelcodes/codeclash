import React from "react";
import { FlaskConical } from "lucide-react";
import ShinyText from "./ui/ShinyText";

const product2 = {
  title: "Plant Based Syprup",
  description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel illo aspernatur explicabo voluptates at corporis eius iste unde, adipisci, error nesciunt iure tenetur beatae accusamus? Voluptates sequi quibusdam obcaecati iusto quidem incidunt? Delectus, natus ipsam id illo asperiores modi praesentium ipsa ex fugiat? Laboriosam perferendis ipsum neque dolorem beatae quis accusamus corrupti sunt possimus esse aliquam iusto adipisci iste, quas doloremque enim reiciendis vitae soluta nisi modi impedit quasi? Non ad atque quidem aut quibusdam praesentium ullam totam, iusto labore laborum perspiciatis fugit expedita veniam. Mollitia, qui modi sed quam libero fugiat quis minima molestiae vero dolore earum, enim eius nostrum culpa perferendis similique nam? Vero, adipisci? Tenetur, itaque praesentium dicta accusamus nam, blanditiis eaque officiis beatae explicabo magni sit cum. Doloremque perspiciatis ab quas sequi officiis earum maiores explicabo laboriosam iste aliquid! Illum, ut.",
  testResults: [
    {
      uploadedBy: { email: "lab1@company.com", role: "lab" },
      score: [
        {
          name: "Test 1",
          relatedTo: "Durability",
          value: 95,
          unit: "%",
          range: [90, 100],
          expectedRange: [90, 100],
          verdict: true,
          remarks: "Passed all durability tests with flying colors.",
        },
        {
          name: "Test 2",
          relatedTo: "Temperature Resistance",
          value: 85,
          unit: "°C",
          range: [80, 100],
          expectedRange: [80, 100],
          verdict: true,
          remarks: "Withstood extreme temperatures successfully.",
        },
        {
          name: "Test 3",
          relatedTo: "Moisture Resistance",
          value: 92,
          unit: "%",
          range: [80, 100],
          expectedRange: [80, 100],
          verdict: true,
          remarks: "Resisted moisture well, no deterioration detected.",
        },
        {
          name: "Test 4",
          relatedTo: "Electrical Conductivity",
          value: 75,
          unit: "S/m",
          range: [70, 80],
          expectedRange: [70, 80],
          verdict: true,
          remarks: "Passed electrical conductivity test, within expected range.",
        },
      ],
      fileUrl: "https://example.com/test-report-product1.pdf",
      fileType: "pdf",
      fileSize: 2048, // in KB
      imageKitFileId: "some-image-kit-file-id-12345",
    },
  ],
};

const product1 = {
  title: "Plant Based Medicine",
  description: "This is a detailed description of Product 1. It is a premium quality product with excellent performance in various tests.",
  testResults: [
    {
      uploadedBy: { email: "lab1@company.com", role: "lab" },
      score: [
        {
          name: "Test 1",
          relatedTo: "Durability",
          value: 95,
          unit: "%",
          verdict: true,
          remarks: "Passed all durability tests with flying colors.",
        },
        {
          name: "Test 2",
          relatedTo: "Temperature Resistance",
          verdict: true,
          remarks: "Withstood extreme temperatures successfully.",
        },
        {
          name: "Test 3",
          relatedTo: "Moisture Resistance",
          value: 92,
          unit: "%",
          range: [80, 100],
          expectedRange: [80, 100],
          verdict: true,
          remarks: "Resisted moisture well, no deterioration detected.",
        },
        {
          name: "Test 4",
          relatedTo: "Electrical Conductivity",
          value: 75,
          unit: "S/m",
          range: [70, 80],
          expectedRange: [70, 80],
          verdict: true,
          remarks: "Passed electrical conductivity test, within expected range.",
        },
      ],
      fileUrl: "https://example.com/test-report-product1.pdf",
      fileType: "pdf",
      fileSize: 2048, // in KB
      imageKitFileId: "some-image-kit-file-id-12345",
    },
  ],
};


export default function CaseStudy() {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Product Comparison</h2>
      <div className="flex gap-8 justify-between">
        <div className="w-1/2">
         

          {/* Test Result Cards */}
          {product1.testResults.map((testResult, testIndex) => (
            <div
              key={testIndex}
              className="bg-white mt-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
            >
               <div className="m-3">
  <h1 className="text-center items-center text-lg font-bold mb-1">
    Title: {product1.title}
  </h1>
  Description:
  <p className="bg-gray-500/40 p-2 rounded-md text-sm text-gray-600 dark:text-gray-300">
    {product1.description.length > 200 ? (
      <>
        {product1.description.slice(0, 190)}...
        <span className="text-blue-500 cursor-pointer">
          {' '}read more
        </span>
      </>
    ) : (
      product1.description
    )}
  </p>
</div>
              <p className="ms-center justify-center flex gap-2 m-2 text-lg font-bold text-white bg-green-500/50 dark:bg-green-500 p-2 rounded-md mt-5 hover:text-green-700 transition-colors duration-500">
                <FlaskConical className="animate-pulse" />
                <ShinyText text="Test Results" disabled={false} speed={3} className="uppercase custom-class" />
              </p>

              <div className="flex flex-wrap gap-6 m-4 justify-start">
                {testResult.score.map((scoreItem, scoreIndex) => {
                  return (
                    <div
                      key={`${testIndex}-${scoreIndex}`}
                      className="w-[27rem] max-w-[44rem] min-h-max flex"
                    >
                      <div className="border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 space-y-4 w-full">
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
                          <span className="font-semibold">Tested By:</span> {testResult.uploadedBy?.email || "Unknown"}
                          <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                            {testResult.uploadedBy?.role || "Lab Personnel"}
                          </span>
                        </div>

                        {/* Score Info */}
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
                            {scoreItem.value ? (
                              <span className="text-gray-900 dark:text-white font-semibold">
                                {scoreItem.value} {scoreItem.unit || ""}
                              </span>
                            ) : (
                              <span className="text-gray-900 dark:text-white font-semibold">-</span>
                            )}
                          </div>

                          {Array.isArray(scoreItem.range) && scoreItem.range.length === 2 && (
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Expected Range</span>
                              {scoreItem.range[0] != null ? (
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {scoreItem.range[0]} - {scoreItem.range[1]} {scoreItem.unit || ""}
                                </span>
                              ) : (
                                <span className="text-gray-900 dark:text-white font-semibold">-</span>
                              )}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* Product 2 */}
        <div className="w-1/2">
         

          {/* Test Result Cards */}
           {product2.testResults.map((testResult, testIndex) => (
            <div
              key={testIndex}
              className="bg-white mt-3 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
            >
              <div className="m-3">
  <h1 className="text-center items-center text-lg font-bold mb-1">
    Title: {product2.title}
  </h1>
  Description:
  <p className="bg-gray-500/40 p-2 rounded-md text-sm text-gray-600 dark:text-gray-300">
    {product2.description.length > 200 ? (
      <>
        {product2.description.slice(0, 190)}...
        <span className="text-blue-500 cursor-pointer">
          {' '}read more
        </span>
      </>
    ) : (
      product2.description
    )}
  </p>
</div>

              <p className="ms-center justify-center flex gap-2 m-2 text-lg font-bold text-white bg-green-500/50 dark:bg-green-500 p-2 rounded-md mt-5 hover:text-green-700 transition-colors duration-500">
                <FlaskConical className="animate-pulse" />
                <ShinyText text="Test Results" disabled={false} speed={3} className="uppercase custom-class" />
              </p>

              <div className="flex flex-wrap gap-6 m-4 justify-start">
                {testResult.score.map((scoreItem, scoreIndex) => {
                  return (
                    <div
                      key={`${testIndex}-${scoreIndex}`}
                      className="w-[27rem] max-w-[44rem] min-h-max flex"
                    >
                      <div className="border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 space-y-4 w-full">
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
                          <span className="font-semibold">Tested By:</span> {testResult.uploadedBy?.email || "Unknown"}
                          <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                            {testResult.uploadedBy?.role || "Lab Personnel"}
                          </span>
                        </div>

                        {/* Score Info */}
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
                            {scoreItem.value ? (
                              <span className="text-gray-900 dark:text-white font-semibold">
                                {scoreItem.value} {scoreItem.unit || ""}
                              </span>
                            ) : (
                              <span className="text-gray-900 dark:text-white font-semibold">-</span>
                            )}
                          </div>

                          {Array.isArray(scoreItem.range) && scoreItem.range.length === 2 && (
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">Expected Range</span>
                              {scoreItem.range[0] != null ? (
                                <span className="text-gray-900 dark:text-white font-semibold">
                                  {scoreItem.range[0]} - {scoreItem.range[1]} {scoreItem.unit || ""}
                                </span>
                              ) : (
                                <span className="text-gray-900 dark:text-white font-semibold">-</span>
                              )}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
