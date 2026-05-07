import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import api from "../services/api";

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/history/${id}`);
        setReport(res.data.submission || res.data);
      } catch (err) {
        console.error("Report fetch error:", err);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading report details...</div>;
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">{error || "Report not found"}</div>
        <button onClick={() => navigate("/dashboard/reports")} className="text-purple-400 hover:text-purple-300 transition">
          &larr; Back to Reports
        </button>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/report/${id}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `proofnexa-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const similarity = report.similarity ?? report.result?.similarity ?? report.similarityScore ?? 0;

  const generateTextTitle = (text) => {
    if (!text) return "Unknown Source";
    const clean = text.replace(/\s+/g, " ").trim();
    const words = clean.split(" ").slice(0, 8).join(" ");
    return words.length > 0 ? `${words}${clean.split(" ").length > 8 ? "..." : ""}` : "Unknown Source";
  };

  let displayTitle = report.fileName || report.name || report.documentName || report.title || "Untitled Document";
  if (displayTitle === "Raw Text Scan" || displayTitle === "Untitled Document") {
    displayTitle = generateTextTitle(report.originalText || report.content);
  }

  const formattedDate = report.createdAt ? new Date(report.createdAt).toLocaleString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) : "Unknown";

  return (
    <div className="p-6">
      <button onClick={() => navigate("/dashboard/reports")} className="text-purple-400 hover:text-purple-300 transition mb-4 inline-block">
        &larr; Back to Reports
      </button>

      <h1 className="text-2xl font-bold text-slate-100">Report Details</h1>

      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-slate-200 shadow-[0_0_30px_rgba(124,58,237,0.12)] mt-4">
        <p className="mb-2"><strong className="text-slate-400">Document:</strong> <span className="text-slate-100">{displayTitle}</span></p>
        <p className="mb-2"><strong className="text-slate-400">Status:</strong> <span className="text-slate-100 capitalize">{report.status || "Completed"}</span></p>
        <p className="mb-2"><strong className="text-slate-400">Similarity:</strong> <span className="text-slate-100">{similarity}%</span></p>
        <p className="mb-2"><strong className="text-slate-400">Date Scanned:</strong> <span className="text-slate-100">{formattedDate}</span></p>
      </div>

      <button
        onClick={handleDownloadPdf}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:from-purple-700 hover:to-indigo-700 transition"
      >
        <Download size={18} />
        Download PDF Report
      </button>
    </div>
  );
}
