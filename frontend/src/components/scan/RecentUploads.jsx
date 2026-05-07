import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const RecentUploads = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await api.get("/history?limit=5");
        setUploads(res.data.submissions || res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch uploads", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const getScoreColor = (score) => {
    if (score <= 20) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (score <= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getStatus = (score) => {
    if (score > 50) return "HIGH";
    if (score > 20) return "MEDIUM";
    return "LOW";
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-[#0B1020]/70 border border-white/10 rounded-xl hover:border-purple-500/40 transition h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100">Recent Uploads</h2>
        <button 
          onClick={() => navigate('/dashboard/history')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center transition-colors"
        >
          View All
          <ExternalLink className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-sm text-slate-500 text-center py-4">Loading uploads...</div>
        ) : uploads.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-4">No recent uploads</div>
        ) : (
          uploads.map((upload, index) => {
            const score = upload.similarityScore ?? upload.similarity ?? upload.score ?? 0;
            return (
              <motion.div
                key={upload._id || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/dashboard/reports/${upload._id}`)}
                className="p-3 rounded-xl border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#111827] rounded-lg group-hover:bg-purple-500/20 transition-colors border border-white/10">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-100 truncate max-w-[120px]" title={upload.fileName || upload.name || "Document"}>
                        {upload.fileName || upload.name || "Document"}
                      </h3>
                      <div className="flex items-center text-xs text-slate-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeAgo(upload.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold border tracking-wider ${getScoreColor(score)}`}>
                    {score}% {getStatus(score)}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentUploads;
