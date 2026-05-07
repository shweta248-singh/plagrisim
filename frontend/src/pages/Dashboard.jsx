import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Percent,
  FileCheck,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../services/api";

const getScoreClass = (score) => {
  if (score <= 15) return "bg-emerald-500/15 text-emerald-300";
  if (score <= 25) return "bg-yellow-500/15 text-yellow-300";
  return "bg-red-500/15 text-red-300";
};

const StatCard = ({ title, value, change, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(124,58,237,0.12)] text-slate-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-100">{value}</h3>
        </div>

        <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {change && (
        <p className="mt-4 text-sm text-slate-500">
          <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
            {change}
          </span>{" "}
          from last week
        </p>
      )}
    </motion.div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const { searchQuery: search = "" } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  let userName = "User";
  try {
    const authData = localStorage.getItem("proofnexa_auth");
    if (authData) {
      const auth = JSON.parse(authData);
      userName = auth?.user?.name || "User";
    }
  } catch (err) {
    console.error("Failed to parse user name:", err);
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const authData = localStorage.getItem("proofnexa_auth");
      const auth = authData ? JSON.parse(authData) : null;
      const token = auth?.accessToken || auth?.token;

      if (!token || token === "null" || token === "undefined") {
        console.warn("Dashboard fetch skipped: no valid token yet");
        return;
      }

      const res = await api.get('/history');
      const result = res.data;
      const submissions = result.submissions || [];

      // Derive Stats from history data
      const totalScans = submissions.length;
      const avgSimilarity = totalScans > 0
        ? Math.round(submissions.reduce((acc, s) => acc + (s.similarityScore || 0), 0) / totalScans)
        : 0;

      const statsData = {
        totalScans,
        totalScansChange: "+5%",
        avgSimilarity,
        avgSimilarityChange: "-2%",
        documentsUploaded: totalScans,
        documentsUploadedChange: "+3%",
        accuracy: 98.7,
        accuracyChange: "+0.1%",
      };

      // Derive Activity Data (Last 7 days)
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const activityMap = {};
      
      // Initialize activity map with last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        activityMap[days[d.getDay()]] = 0;
      }

      submissions.forEach((scan) => {
        const date = new Date(scan.createdAt);
        const dayName = days[date.getDay()];
        if (activityMap[dayName] !== undefined) {
          activityMap[dayName]++;
        }
      });

      const activityData = Object.keys(activityMap).map((day) => ({
        day,
        scans: activityMap[day],
      }));

      setStats(statsData);
      setActivity(activityData);
      setRecentScans(submissions.slice(0, 10)); // Top 10 for better list
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredScans = recentScans.filter((scan) => {
    const term = search.toLowerCase();
    if (!term) return true;

    const fileName = (scan.fileName || scan.name || scan.documentName || scan.title || "").toLowerCase();
    const content = (scan.content || "").toLowerCase();
    const status = (scan.status || "").toLowerCase();
    const similarity = scan.similarity ?? scan.result?.similarity ?? scan.similarityScore ?? 0;
    const similarityStr = similarity.toString();
    const createdDate = scan.createdAt ? new Date(scan.createdAt).toDateString().toLowerCase() : "";

    return (
      fileName.includes(term) ||
      content.includes(term) ||
      status.includes(term) ||
      createdDate.includes(term) ||
      similarityStr.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-white/5" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-white/5" />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-900/30 bg-[#111827]/80 backdrop-blur-xl p-10 text-center shadow-[0_0_30px_rgba(124,58,237,0.12)]">
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Backend API connect hone ke baad real dashboard data show hoga.
          </p>

          <button
            onClick={fetchDashboardData}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl p-10 text-center shadow-[0_0_30px_rgba(124,58,237,0.12)]">
          <h2 className="text-xl font-semibold text-slate-100">
            No dashboard data available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Backend se data aane ke baad dashboard update hoga.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 gap-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back, {userName}! 👋
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Here’s what’s happening with your scans today.
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <StatCard
          title="Total Scans"
          value={stats.totalScans ?? 0}
          change={stats.totalScansChange}
          icon={Search}
        />

        <StatCard
          title="Documents Uploaded"
          value={stats.documentsUploaded ?? 0}
          change={stats.documentsUploadedChange}
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(124,58,237,0.12)] xl:col-span-2 text-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Scan Activity
              </h2>
              <p className="text-sm text-slate-400">
                Documents verified over time
              </p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No activity data available
            </div>
          ) : (
            <div className="bg-[#111827]/80 p-4 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)] w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="scanColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    fill="url(#scanColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(124,58,237,0.12)] text-slate-100">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Recent Scans
              </h2>
              <p className="text-sm text-slate-400">
                Your latest verified documents
              </p>
            </div>
          </div>

          {filteredScans.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400 bg-[#0B1020]/70 rounded-xl border border-white/10">
              No matching records found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredScans.map((scan, index) => (
                <div
                  key={scan._id || index}
                  className="flex items-center justify-between rounded-xl p-3 transition hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                      <FileCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {scan.fileName || scan.name || "Untitled document"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {scan.createdAt
                          ? new Date(scan.createdAt).toDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getScoreClass(
                      scan.similarityScore ?? 0
                    )}`}
                  >
                    {scan.similarityScore ?? 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}