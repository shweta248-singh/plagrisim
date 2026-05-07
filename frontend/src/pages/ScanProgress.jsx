import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Search,
  UploadCloud,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";

const ScanProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const scanState = location.state || {};
  const { file, text, pasteText, activeTab } = scanState;

  const scanType = activeTab === "text" ? "text" : "file";
  const scanText = useMemo(
    () => String(text || pasteText || "").trim(),
    [text, pasteText]
  );

  const fileToUpload = file?.raw || file || null;

  // 1. TRACK CURRENT STEP USING KEY
  const [currentStep, setCurrentStep] = useState(scanType === "text" ? "prepare" : "upload");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const hasStartedRef = useRef(false);

  // 1. DEFINE STEPS WITH KEYS AND PROGRESS
  const steps = useMemo(() => {
    if (scanType === "text") {
      return [
        { key: "prepare", label: "Preparing Text", progress: 20, icon: UploadCloud, detail: "Preparing your text..." },
        { key: "analyze", label: "Analyzing", progress: 70, icon: Search, detail: "Checking for plagiarism..." },
        { key: "report", label: "Generating Report", progress: 90, icon: ShieldCheck, detail: "Finalizing results..." },
        { key: "complete", label: "Complete", progress: 100, icon: CheckCircle2, detail: "Scan finished!" },
      ];
    }
    return [
      { key: "upload", label: "Uploading", progress: 20, icon: UploadCloud, detail: "Uploading document..." },
      { key: "extract", label: "Extracting Text", progress: 40, icon: FileText, detail: "Reading file content..." },
      { key: "analyze", label: "Analyzing", progress: 70, icon: Search, detail: "Checking for plagiarism..." },
      { key: "report", label: "Generating Report", progress: 90, icon: ShieldCheck, detail: "Finalizing results..." },
      { key: "complete", label: "Complete", progress: 100, icon: CheckCircle2, detail: "Scan finished!" },
    ];
  }, [scanType]);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    // 6. PREVENT DUPLICATE API CALL
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    const startScan = async () => {
      try {
        setError(null);
        console.log("🚀 SCAN STARTED", { type: scanType });

        if (scanType === "file" && !fileToUpload) {
          throw new Error("No file selected.");
        }
        if (scanType === "text" && scanText.length < 20) {
          throw new Error("Text is too short.");
        }

        let response;

        if (scanType === "text") {
          // 3. TEXT SCAN FLOW
          console.log("STEP: prepare");
          setCurrentStep("prepare"); setProgress(20);
          await delay(400);

          console.log("STEP: analyze");
          setCurrentStep("analyze"); setProgress(70);
          
          console.log("CALLING TEXT API");
          try {
            response = await api.post("/analyze/text", {
              text: scanText,
            }, {
              timeout: 30000,
            });
            console.log("TEXT API RESPONSE:", response.data);
          } catch (e) {
            console.log("TEXT API ERROR:", e);
            throw e;
          }
        } else {
          // 4. FILE SCAN FLOW
          console.log("STEP: upload");
          setCurrentStep("upload"); setProgress(20);
          
          const formData = new FormData();
          formData.append("file", fileToUpload);

          // We simulate "extract" and "analyze" because the backend does it all in one call
          console.log("CALLING FILE API");
          const uploadPromise = api.post("/upload", formData, {
            onUploadProgress: (event) => {
              if (event.total) {
                const p = Math.round((event.loaded * 20) / event.total);
                if (!cancelled) setProgress(p);
              }
            },
            timeout: 30000,
          });

          // Simulate step transition while uploading/processing
          await delay(800);
          if (!cancelled) {
            console.log("STEP: extract");
            setCurrentStep("extract"); setProgress(40);
          }
          
          await delay(800);
          if (!cancelled) {
            console.log("STEP: analyze");
            setCurrentStep("analyze"); setProgress(70);
          }

          response = await uploadPromise;
          console.log("FILE RESPONSE:", response.data);
        }

        // 8. DEBUG LOGS
        console.log("CURRENT STEP:", currentStep);
        console.log("PROGRESS:", progress);
        console.log("FULL RESPONSE:", response);
        console.log("RESPONSE DATA:", response.data);
        console.log("REPORT:", response.data?.report);
        console.log("SUBMISSION:", response.data?.submission);

        // 7. NORMALIZE REPORT ID
        const reportId =
          response.data?.submissionId ||
          response.data?.report?._id ||
          response.data?.report?.id ||
          response.data?.submission?._id ||
          response.data?.submission?.id ||
          response.data?.data?._id ||
          response.data?._id;

        console.log("FINAL REPORT ID:", reportId);

        console.log("STEP: report");
        setCurrentStep("report"); setProgress(90);
        await delay(700);

        console.log("STEP: complete");
        setCurrentStep("complete"); setProgress(100);
        await delay(700);

        try {
          if (reportId) {
            console.log("🎯 REDIRECTING TO REPORT:", reportId);
            navigate(`/dashboard/reports/${reportId}`);
          } else {
            console.log("🎯 REDIRECTING TO REPORTS (Fallback)");
            navigate("/dashboard/reports");
          }
        } catch(e) {
          console.error("Navigation error:", e);
          navigate("/dashboard/reports");
        }
      } catch (err) {
        console.error("SCAN ERROR:", err);
        const message = err.response?.data?.message || err.message || "Scan failed";
        setError(message);
        
        setTimeout(() => {
          if (!cancelled) navigate("/dashboard/scan");
        }, 3000);
      }
    };

    startScan();

    return () => {
      cancelled = true;
    };
  }, [navigate, scanType, scanText, fileToUpload]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-slate-100">
        <div className="bg-red-500/15 border border-red-500/20 p-4 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Scan Failed</h2>
        <p className="text-slate-400 mb-8 text-center max-w-md">{error}</p>
        <button
          onClick={() => navigate("/dashboard/scan")}
          className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
        >
          Return to Scan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-slate-100">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 font-outfit">Processing Your Scan</h1>
        <p className="text-slate-400">Our NLP engine is analyzing the originality of your content.</p>
      </div>

      <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8 shadow-2xl">
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-12">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-8`}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            // 5. FIX ACTIVE/COMPLETED ICON LOGIC
            const currentStepIndex = steps.findIndex(s => s.key === currentStep);
            const isCompleted = index < currentStepIndex || currentStep === "complete";
            const isActive = step.key === currentStep && currentStep !== "complete";

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                  isCompleted ? "bg-emerald-500/20 text-emerald-400" : isActive ? "bg-purple-600 text-white shadow-xl scale-110" : "bg-white/5 text-slate-500"
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : isActive ? <Loader2 className="w-8 h-8 animate-spin" /> : <Icon className="w-8 h-8" />}
                </div>
                <span className={`text-sm font-bold mb-1 ${isActive ? "text-purple-300" : isCompleted ? "text-emerald-300" : "text-slate-500"}`}>
                  {step.label}
                </span>
                <p className="text-[10px] text-slate-500 text-center leading-tight">{step.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1e293b]/50 rounded-2xl p-6 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-xl">
            <FileText className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">
              {scanType === "file" ? fileToUpload?.name : "Pasted Content"}
            </h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              {scanType === "file" ? `${((fileToUpload?.size || 0) / 1024).toFixed(1)} KB` : `${scanText.length} characters`}
            </p>
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-400 font-mono">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;