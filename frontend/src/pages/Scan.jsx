import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UploadTabs from "../components/scan/UploadTabs";
import UploadDropzone from "../components/scan/UploadDropzone";
import PasteTextBox from "../components/scan/PasteTextBox";
import RecentUploads from "../components/scan/RecentUploads";

const Scan = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTabState] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState("");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setError("");
  };

  const handleScan = () => {
    setError("");

    if (activeTab === "file") {
      if (!selectedFile) {
        setError("Please select a file to scan");
        return;
      }

      navigate("/dashboard/scan-progress", {
        state: {
          activeTab: "file",
          file: selectedFile,
        },
      });

      return;
    }

    const cleanedText = pasteText.trim();

    if (!cleanedText || cleanedText.length < 20) {
      setError("Please enter at least 20 characters");
      return;
    }

    console.log("TEXT SENT TO SCAN PROGRESS:", cleanedText.slice(0, 100));

    navigate("/dashboard/scan-progress", {
      state: {
        activeTab: "text",
        text: cleanedText,
        pasteText: cleanedText,
        sourceType: "text",
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col lg:flex-row gap-6"
    >
      <div className="flex-1 bg-[#111827]/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_30px_rgba(124,58,237,0.12)] border border-white/10 text-slate-100">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Scan Document
        </h1>

        <p className="text-slate-400 mb-6">
          Upload your document or paste text to check originality.
        </p>

        <UploadTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "file" ? (
          <UploadDropzone
            selectedFile={selectedFile}
            setSelectedFile={(file) => {
              setSelectedFile(file);
              setError("");
            }}
            setError={setError}
          />
        ) : (
          <PasteTextBox
            pasteText={pasteText}
            setPasteText={(value) => {
              setPasteText(value);
              setError("");
            }}
            setError={setError}
          />
        )}

        {error && (
          <div className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleScan}
          className="mt-4 w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)]"
        >
          {activeTab === "file" ? "Scan Now" : "Scan Text"}
        </button>
      </div>

      <div className="lg:w-80">
        <RecentUploads />
      </div>
    </motion.div>
  );
};

export default Scan;