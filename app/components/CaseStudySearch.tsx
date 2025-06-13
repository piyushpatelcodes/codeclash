/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useRef, useState } from 'react';
import data from "@/public/data.json"
import { AnimatePresence, motion } from "framer-motion";
import { IReport } from '@/models/Report';
import { Copy } from 'lucide-react';

const daghta = [
  {
    "_id": "684ad49cfc13ae5b4e17634c",
    "title": "Plant Growing Kit",
    "description": "Complete kit for growing herbs indoors.",
    "tags": ["tag2", "tag9", "tag6", "tag7", "tag4"],
    "uploadedBy": "684ad49cfc13ae5b4e17634d",
    "fileUrl": "http://dummyimage.com/204x100.png/cc0000/ffffff",
    "similarTo": [
      "684ad49cfc13ae5b4e17634e",
      "684ad49cfc13ae5b4e17634f",
      "684ad49cfc13ae5b4e176350"
    ],
    "status": "approved",
    "testResults": [
      {
        "score": [
          { "name": "Falco mexicanus", "relatedTo": "game", "verdict": false },
          { "name": "Loris tardigratus", "relatedTo": "referee", "verdict": true },
          { "name": "Procyon lotor", "relatedTo": "player", "verdict": true }
        ]
      }
    ]
  },
  {
    "_id": "684ad49cfc13ae5b4e176353",
    "title": "Marinara Parmesan Baked Ziti",
    "description": "Ziti pasta baked with marinara and parmesan cheese",
    "tags": ["tag3", "tag9", "tag6"],
    "uploadedBy": "684ad49cfc13ae5b4e176354",
    "fileUrl": "http://dummyimage.com/118x100.png/5fa2dd/ffffff",
    "similarTo": [],
    "status": "pending",
    "testResults": []
  }
];

function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSearchClick = () => {
    onSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className="my-4 flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="p-2 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
        placeholder="Search products by title, tags, or ID..."
      />
      <button
        onClick={handleSearchClick}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
      >
        Search
      </button>
    </div>
  );
}

function ProductList({
  query,
  selectedProducts,
  toggleSelectProduct,
}: {
  query: string;
  selectedProducts: any[];
  toggleSelectProduct: (product: any) => void;
}) {
  const filteredProducts = data.filter(
    (product) =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
      product._id?.toString().toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      {filteredProducts.map((product,index) => {
        const isSelected = selectedProducts.some((p) => p._id === product._id);
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 dark:text-white border border-gray-500/40 shadow-md rounded-lg p-4 w-full relative"
          >
            {/* Checkbox */}
            <label className="absolute top-4 right-4 flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelectProduct(product)}
                className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
              />
            </label>

            <h2 className="text-xl font-bold">{product.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
            <div className="mt-4">
              <h3 className="font-semibold">Similar Products:</h3>
              {product.similarTo.length ? (
                <ul className="list-disc pl-5">
                  {product.similarTo.map((similarId) => (
                    <li key={similarId.$oid.toString()}>
                      <span className="text-blue-600  cursor-pointer dark:text-blue-400">
                        ID: {similarId.$oid.toString() } 
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No similar products.</p>
              )}
            </div>
{product.testResults.length > 0 ? (

    <TestResultCard testResults={product.testResults} />

):(
    <div className="relative overflow-hidden mt-4 p-2">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent z-10" />

      <div className="marquee-container cursor-grab select-none no-scrollbar px-4 py-2">
        <div className="marquee-track flex space-x-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-[27rem] max-w-[44rem] flex-shrink-0 border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 animate-pulse space-y-4"
            >
                
              {/* Header */}
              <div className="flex items-center gap-5">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-6 w-16 rounded bg-green-200 dark:bg-green-500/40" />
              </div>

              {/* Tester Info */}
              <div className="flex gap-3 border-b border-gray-400 pb-2">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-purple-400 rounded" />
              </div>

              {/* Score Details */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-20 text-sm">
                {[...Array(2)].map((_, i) => (
                  <div className="space-y-2" key={i}>
                    <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-400 dark:bg-gray-600 rounded" />
                  </div>
                ))}
              </div>
 <p className="text-2xl font-semibold text-gray-400 p-2 rounded-lg bg-base-300 dark:text-gray-600  text-center">
        No Tests Done.
      </p>
              {/* Remarks */}
              <div className="mt-4 border-t border-gray-500 pt-4">
                <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>

              {/* File Info */}
              <div className="mt-4 space-y-2">
                <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-blue-300 dark:bg-blue-500 rounded" />
                  <div className="h-6 w-16 bg-blue-300 dark:bg-blue-500 rounded" />
                  <div className="h-6 w-10 bg-red-400 rounded" />
                  <div className="h-6 w-10 bg-gray-400 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
)}
          </div>
        );
      })}
    </div>
  );
}

function SelectedProductsBar({
  selectedProducts,
  onClearAll,
  onCompare,
}: {
  selectedProducts: IReport[];
  onClearAll: () => void;
  onCompare: () => void;
}) {
  if (selectedProducts.length === 0) return null;

 
return (
  <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 p-2 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2 flex-wrap z-20">
    <div className="flex flex-wrap gap-2 flex-grow">
      <AnimatePresence>
        {selectedProducts.map((product,index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25 }}
            className="bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-xs font-semibold"
          >
            {product.title}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
    <button
      onClick={onClearAll}
      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
    >
      Clear All
    </button>
    {selectedProducts.length > 1 && (
      <button
        onClick={onCompare}
        className="px-4 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition"
      >
        Compare ({selectedProducts.length})
      </button>
    )}
  </div>
);
}

export default function ProductComparisonPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<IReport[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSelectProduct = (product: IReport) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p._id === product._id)) {
        // Remove product
        return prev.filter((p) => p._id !== product._id);
      } else {
        // Add product
        return [...prev, product];
      }
    });
  };

  const clearAllSelected = () => {
    setSelectedProducts([]);
  };

  const handleCompare = () => {
    // You can replace this with navigation or modal display of comparison data
    console.log("Comparing products:", selectedProducts);
    alert(`Comparing ${selectedProducts.length} products:\n${selectedProducts
      .map((p) => p.title)
      .join(", ")}`);
  };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen flex flex-col">
     
<AnimatePresence>
  {selectedProducts.length > 0 && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <SelectedProductsBar
        selectedProducts={selectedProducts}
        onClearAll={clearAllSelected}
        onCompare={handleCompare}
      />
    </motion.div>
  )}
</AnimatePresence>
      <SearchBar onSearch={handleSearch} />
      <ProductList query={searchQuery} selectedProducts={selectedProducts} toggleSelectProduct={toggleSelectProduct} />
    </div>
  );
}

type ScoreItem = {
  name?: string;
  relatedTo?: string;
  verdict: boolean;
  value?: string | number;
  unit?: string;
  range?: [number, number];
  remarks?: string;
};

type TestResult = {
  score?: ScoreItem[];
  uploadedBy?: {
    email?: string;
    role?: string;
  };
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
};

function TestResultCard({ testResults }: { testResults: TestResult[] }) {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  if (!testResults?.length) return null;

  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!marqueeRef.current) return;
    isDown = true;
    marqueeRef.current.classList.add('cursor-grabbing');
    startX = e.pageX - marqueeRef.current.offsetLeft;
    scrollLeft = marqueeRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
    marqueeRef.current?.classList.remove('cursor-grabbing');
  };

  const handleMouseUp = () => {
    isDown = false;
    marqueeRef.current?.classList.remove('cursor-grabbing');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !marqueeRef.current) return;
    e.preventDefault();
    const x = e.pageX - marqueeRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // sensitivity
    marqueeRef.current.scrollLeft = scrollLeft - walk;
  };

  let globalIndex = 1;
return (
  <div className="relative overflow-hidden mt-4 p-2">
    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100 dark:from-gray-900 to-transparent z-10" />
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 dark:from-gray-900 to-transparent z-10" />

   <div
  ref={marqueeRef}
  onMouseDown={handleMouseDown}
  onMouseLeave={handleMouseLeave}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  className="marquee-container cursor-grab select-none no-scrollbar"
>
  <div className="marquee-track space-x-6 py-2 px-4 no-scrollbar">
    {[...Array(2)].map((_, loopIndex) =>
      testResults.map((testResult, testIndex: number) =>
        testResult.score?.map((scoreItem, scoreIndex: number) => {
          const currentIndex = globalIndex++;
          return (
            <div
              key={`${loopIndex}-${testIndex}-${scoreIndex}`}
              className="w-[27rem] max-w-[44rem] min-h-max flex-shrink-0 no-scrollbar"
            >
                  {/* === Card Content === */}
                  <div className="no-scrollbar border border-gray-300 dark:border-base-300 bg-gray-100 dark:bg-base-100 rounded-box shadow p-4 space-y-4 w-full">
                    {/* Test Number and Verdict */}
                    <div className="text-sm font-bold text-green-700 dark:text-green-300 flex items-center gap-5">
                      Test #{currentIndex}
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

                    {/* Tester Info */}
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

                    {/* Score Details */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-20 text-sm">
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
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {scoreItem.range[0]} - {scoreItem.range[1]}{" "}
                              {scoreItem.unit || ""}
                            </span>
                          </div>
                        )}

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
                    </div>

                    {/* Remarks */}
                    <div className="mt-4 border-t border-gray-500 pt-4 text-gray-600 dark:text-gray-400 text-sm italic">
                      Remarks: {scoreItem.remarks || "None."}
                    </div>

                    {/* File Info */}
                    {testResult.fileUrl ? (
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            onClick={() => (console.log("downloading...", testResult.fileUrl))}
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
                            onClick={() => (console.log("downloading...", testResult.fileUrl))}
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
                        No Attachments Provided.
                      </em>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  </div>
);
}


