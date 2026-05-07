// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Search } from "lucide-react";
// import api from "../services/api"; // axios instance

// const getColor = (score) => {
//   if (score <= 15) return "bg-green-100 text-green-700";
//   if (score <= 25) return "bg-orange-100 text-orange-700";
//   return "bg-red-100 text-red-700";
// };

// export default function Reports() {
//   const [reports, setReports] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // 🔗 Fetch from backend
//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");

//         if (!token) {
//           throw new Error("User not authenticated");
//         }

//         const res = await api.get("/history", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });
        
//         // Backend returns { success: true, submissions: [...] }
//         setReports(res.data.submissions || []);
//       } catch (err) {
//         console.error("Reports load error:", err);
//         if (err.response?.status === 401) {
//           console.warn("Unauthorized access - token missing or expired");
//         }
//         setError("Failed to load reports");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   // 🔍 Filter
//   const filtered = reports.filter((r) =>
//     r.fileName?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <h1 className="text-2xl font-semibold text-slate-900 mb-1">Reports</h1>
//       <p className="text-sm text-slate-500 mb-6">
//         View and manage all your scan reports
//       </p>

//       {/* Search */}
//       <div className="flex items-center bg-white shadow rounded-xl px-4 py-2 mb-6 border">
//         <Search size={18} className="text-gray-400 mr-2" />
//         <input
//           type="text"
//           placeholder="Search reports..."
//           className="outline-none w-full text-sm text-slate-800"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* States */}
//       {loading && (
//         <div className="text-center py-10 text-gray-400">
//           Loading reports...
//         </div>
//       )}

//       {error && (
//         <div className="text-center py-10 text-red-500">{error}</div>
//       )}

//       {!loading && !error && reports.length === 0 && (
//         <div className="text-center py-10 text-gray-400">
//           No reports available
//         </div>
//       )}

//       {/* Table */}
//       {!loading && !error && reports.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow overflow-hidden border"
//         >
//           <table className="w-full text-sm">
//             <thead className="bg-gray-100 text-gray-600">
//               <tr>
//                 <th className="text-left p-4">Document</th>
//                 <th className="text-left p-4">Date</th>
//                 <th className="text-left p-4">Similarity</th>
//                 <th className="text-right p-4">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filtered.map((report, i) => (
//                 <tr key={i} className="border-t hover:bg-gray-50">
//                   <td className="p-4 text-slate-900 font-medium">
//                     {report.fileName || "Untitled"}
//                   </td>

//                   <td className="p-4 text-slate-600">
//                     {new Date(report.createdAt).toDateString()}
//                   </td>

//                   <td className="p-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${getColor(
//                         report.similarityScore
//                       )}`}
//                     >
//                       {report.similarityScore}%
//                     </span>
//                   </td>

//                   <td className="p-4 text-right">
//                     <button className="text-indigo-600 hover:underline text-sm">
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </motion.div>
//       )}
//     </div>
//   );
// }








import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useOutletContext, useNavigate, useLocation } from "react-router-dom";

const getColor = (score) => {
  if (score <= 15) return "bg-emerald-500/15 text-emerald-300";
  if (score <= 25) return "bg-yellow-500/15 text-yellow-300";
  return "bg-red-500/15 text-red-300";
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const { searchQuery: search = "" } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const resultFromScan = location.state?.result;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const authData = localStorage.getItem("proofnexa_auth");
        const auth = authData ? JSON.parse(authData) : null;
        const token = auth?.accessToken || auth?.token;

        if (!token) {
          navigate("/auth?mode=login");
          return;
        }

        if (resultFromScan) {
          setReports([resultFromScan]);
        }

        const res = await api.get("/history");
        console.log("API RESPONSE:", res.data);

        // 🔥 FIX: backend returns array directly (not submissions)
        const data = res.data;

        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else if (Array.isArray(data.submissions)) {
          setReports(data.submissions);
        } else if (!resultFromScan) {
          setReports([]);
        }

      } catch (err) {
        console.error("Reports load error:", err);

        if (err.response?.status === 401) {
          console.warn("Unauthorized - token missing or expired");
        }

        if (!resultFromScan) {
          setError("Failed to load reports");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate, resultFromScan]);

  // 🔍 FIX: multi-field search logic
  const filtered = Array.isArray(reports)
    ? reports.filter((r) => {
        const term = search.toLowerCase();
        if (!term) return true;

        const fileName = (r.fileName || r.name || r.documentName || r.title || "").toLowerCase();
        const content = (r.content || "").toLowerCase();
        const status = (r.status || "").toLowerCase();
        
        // Correct similarity mapping logic from below
        const similarity = r.similarity ?? r.result?.similarity ?? r.similarityScore ?? 0;
        const similarityStr = similarity.toString();

        const createdDate = r.createdAt ? new Date(r.createdAt).toDateString().toLowerCase() : "";

        return (
          fileName.includes(term) ||
          content.includes(term) ||
          status.includes(term) ||
          createdDate.includes(term) ||
          similarityStr.includes(term)
        );
      })
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-100 mb-1">Reports</h1>
      <p className="text-sm text-slate-400 mb-6">
        View and manage all your scan reports
      </p>

      {loading && (
        <div className="text-center py-10 text-gray-400">
          Loading reports...
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500">{error}</div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          No reports available
        </div>
      )}

      {!loading && !error && reports.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-[#111827]/80 rounded-2xl shadow border border-white/10">
          No matching records found.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(124,58,237,0.12)] overflow-hidden border border-white/10"
        >
          <table className="w-full text-sm">
            <thead className="bg-[#0B1020] text-slate-400">
              <tr>
                <th className="text-left p-4">Document</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Similarity</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((report, i) => {
                // 🔥 FIX: correct similarity mapping
                const similarity =
                  report.similarity ??
                  report.result?.similarity ??
                  report.similarityScore ??
                  0;

                // Better display name fallback
                let displayTitle = report.fileName || report.name || report.documentName || report.title;
                if (displayTitle === "Raw Text Scan" || !displayTitle) {
                  const textContent = report.originalText || report.content;
                  if (textContent) {
                    const clean = textContent.replace(/\s+/g, " ").trim();
                    const words = clean.split(" ").slice(0, 8).join(" ");
                    displayTitle = words.length > 0 ? `${words}${clean.split(" ").length > 8 ? "..." : ""}` : "Text Scan";
                  } else {
                    displayTitle = "Raw Text Scan";
                  }
                }

                const formattedDate = report.createdAt ? new Date(report.createdAt).toLocaleString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }) : "Unknown date";

                return (
                  <tr key={i} className="border-t border-white/10 hover:bg-purple-500/10">
                    <td className="p-4 text-slate-100 font-medium">
                      {displayTitle}
                    </td>

                    <td className="p-4 text-slate-400">
                      {formattedDate}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getColor(
                          similarity
                        )}`}
                      >
                        {similarity}%
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button 
                        onClick={() => navigate(`/dashboard/reports/${report._id || report.id}`)}
                        className="text-purple-400 hover:text-purple-300 hover:underline text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}