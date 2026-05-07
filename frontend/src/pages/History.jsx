import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, FileText, ChevronRight, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/history');
      // Support backend returning array directly or `{ submissions: [] }` or `{ data: [] }`
      const historyData = response.data?.submissions || response.data?.data || response.data || [];
      setData(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load your scan history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusIcon = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "bg-emerald-500/15 text-emerald-300";
    if (s === "failed") return "bg-red-500/15 text-red-300";
    return "bg-yellow-500/15 text-yellow-300";
  };

  const getScoreColor = (score) => {
    if (score == null) return "text-slate-500";
    if (score <= 15) return "text-emerald-400";
    if (score <= 30) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredData = data.filter(item => {
    const fileName = (item.fileName || item.documentName || item.title || "Untitled Document").toLowerCase();
    const status = (item.status || "Pending").toLowerCase();
    const similarity = (item.similarityScore ?? item.similarity ?? "N/A").toString().toLowerCase();
    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString().toLowerCase() : "unknown date";
    
    // Status Filter
    if (statusFilter !== "All" && status !== statusFilter.toLowerCase()) {
      return false;
    }

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!fileName.includes(q) && !status.includes(q) && !similarity.includes(q) && !date.includes(q)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded w-2/4"></div>
        </div>
        <div className="animate-pulse space-y-4 mt-8">
          <div className="h-12 bg-slate-200 rounded w-full"></div>
          <div className="h-20 bg-slate-200 rounded w-full"></div>
          <div className="h-20 bg-slate-200 rounded w-full"></div>
          <div className="h-20 bg-slate-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">{error}</p>
        <button 
          onClick={fetchHistory}
          className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">History</h1>
        <p className="mt-2 text-sm text-slate-400">View your previous document scans and plagiarism reports</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by file name, status, or date..."
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0B1020] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-between w-full md:w-auto gap-2 px-4 py-2 border border-white/10 rounded-xl bg-[#0B1020] text-slate-100 hover:bg-white/5 sm:text-sm transition-all"
          >
            <div className="flex items-center gap-2 font-medium">
              <Filter className="w-5 h-5 text-slate-400" />
              <span>Filter: {statusFilter === "All" ? "All Statuses" : statusFilter}</span>
            </div>
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#111827] border border-white/10 rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.15)] z-50 overflow-hidden">
              {['All', 'Completed', 'Pending', 'Failed'].map((status) => (
                <div
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setFilterOpen(false);
                  }}
                  className={`px-4 py-2 text-slate-200 hover:bg-white/5 cursor-pointer text-sm ${statusFilter === status ? 'bg-purple-500/20 font-medium text-purple-300' : ''}`}
                >
                  {status === 'All' ? 'All Statuses' : status}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.12)] overflow-hidden">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No scan history found.</h3>
            <p className="text-sm text-slate-500">You haven't scanned any documents yet.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No matching records found.</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#0B1020]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Similarity Score
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.map((item) => {
                  const id = item._id || item.id;
                  
                  // Better display name fallback
                  let fileName = item.fileName || item.documentName || item.title || "Untitled Document";
                  if (fileName === "Raw Text Scan" || !fileName) {
                    const textContent = item.originalText || item.content;
                    if (textContent) {
                      const clean = textContent.replace(/\s+/g, " ").trim();
                      const words = clean.split(" ").slice(0, 8).join(" ");
                      fileName = words.length > 0 ? `${words}${clean.split(" ").length > 8 ? "..." : ""}` : "Text Scan";
                    } else {
                      fileName = "Raw Text Scan";
                    }
                  }

                  const score = item.similarityScore ?? item.similarity;
                  const status = item.status || "Pending";
                  const date = item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }) : "Unknown Date";

                  return (
                    <tr key={id || Math.random()} className="hover:bg-purple-500/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-100 max-w-xs truncate">{fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {score != null ? (
                          <div className={`text-sm font-bold ${getScoreColor(score)}`}>
                            {score}%
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full gap-1.5 items-center ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(id ? `/dashboard/reports/${id}` : '/dashboard/reports')}
                          className="text-purple-600 hover:text-purple-800 flex items-center justify-end gap-1 font-semibold transition-colors w-full"
                        >
                          View Report
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
