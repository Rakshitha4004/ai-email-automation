"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type Email = {
  subject: string;
  from: string;
  category: string;
};

const BACKEND_URL = "https://ai-email-automation-qfyq.onrender.com";
const COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];

export default function Dashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [replyModal, setReplyModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [aiReply, setAiReply] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const loginWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/emails`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setEmails(data);
    } catch {
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const generateReply = async (email: Email) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/generate-reply?subject=${encodeURIComponent(
          email.subject
        )}&sender=${encodeURIComponent(email.from)}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setSelectedEmail(email);
      setAiReply(data.reply || "");
      setReplyModal(true);
    } catch {
      alert("AI reply generation failed");
    }
  };

  const createDraft = async () => {
    if (!selectedEmail) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/create-draft?subject=${encodeURIComponent(
          selectedEmail.subject
        )}&sender=${encodeURIComponent(
          selectedEmail.from
        )}&reply=${encodeURIComponent(aiReply)}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      alert(data.message || data.error || "Draft created");
    } catch {
      alert("Draft creation failed");
    }
  };

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        email.subject.toLowerCase().includes(search.toLowerCase()) ||
        email.from.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ? true : email.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [emails, search, filter]);

  const stats = {
    total: filteredEmails.length,
    urgent: filteredEmails.filter((e) => e.category === "URGENT").length,
    important: filteredEmails.filter((e) => e.category === "IMPORTANT").length,
    unwanted: filteredEmails.filter((e) => e.category === "UNWANTED").length,
  };

  const pieData = [
    { name: "Urgent", value: stats.urgent },
    { name: "Important", value: stats.important },
    { name: "Unwanted", value: stats.unwanted },
  ];

  const barData = [
    { category: "Urgent", count: stats.urgent },
    { category: "Important", count: stats.important },
    { category: "Unwanted", count: stats.unwanted },
  ];

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Sidebar */}
      <div className="w-64 p-6 border-r border-gray-800">
        <h1 className="text-4xl font-bold mb-12">AI Mail</h1>

        <div className="space-y-6 text-2xl">
          <button
            onClick={() =>
              document
                .getElementById("emails-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-3 hover:text-blue-400 transition"
          >
            📥 Inbox
          </button>

          <button
            onClick={() => {
              if (selectedEmail) {
                setReplyModal(true);
              } else {
                alert("Generate AI reply first.");
              }
            }}
            className="flex items-center gap-3 hover:text-green-400 transition"
          >
            📝 Drafts
          </button>

          <button
            onClick={() =>
              document
                .getElementById("analytics-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-3 hover:text-yellow-400 transition"
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-6xl font-bold">AI Email Dashboard</h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-800 px-5 py-3 rounded-xl"
          >
            🌙
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={loginWithGoogle}
            className="bg-blue-600 px-8 py-4 rounded-xl text-xl font-semibold"
          >
            Login with Gmail
          </button>

          <button
            onClick={fetchEmails}
            className="bg-green-600 px-8 py-4 rounded-xl text-xl font-semibold"
          >
            {loading ? "Loading..." : "Fetch Emails"}
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 rounded-xl bg-gray-900 border border-gray-700 text-white"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-white"
          >
            <option value="ALL">All</option>
            <option value="URGENT">Urgent</option>
            <option value="IMPORTANT">Important</option>
            <option value="UNWANTED">Unwanted</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-950 rounded-2xl p-6">
            <h2 className="text-2xl">Total Emails</h2>
            <p className="text-5xl font-bold mt-3">{stats.total}</p>
          </div>

          <div className="bg-red-900 rounded-2xl p-6">
            <h2 className="text-2xl">Urgent</h2>
            <p className="text-5xl font-bold mt-3">{stats.urgent}</p>
          </div>

          <div className="bg-amber-700 rounded-2xl p-6">
            <h2 className="text-2xl">Important</h2>
            <p className="text-5xl font-bold mt-3">{stats.important}</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl">Unwanted</h2>
            <p className="text-5xl font-bold mt-3">{stats.unwanted}</p>
          </div>
        </div>

        <div
          id="analytics-section"
          className="grid grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-slate-950 rounded-2xl p-6 h-[450px]">
            <h2 className="text-3xl font-bold mb-6">Email Distribution</h2>

            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={140} label>
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-950 rounded-2xl p-6 h-[450px]">
            <h2 className="text-3xl font-bold mb-6">Category Counts</h2>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          id="emails-section"
          className="bg-slate-950 rounded-2xl p-6"
        >
          <h2 className="text-3xl font-bold mb-6">Emails</h2>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <p className="text-gray-400">No emails found</p>
            ) : (
              filteredEmails.map((email, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-900 p-5 rounded-xl"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{email.subject}</h3>
                    <p className="text-gray-400">{email.from}</p>
                    <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                      {email.category}
                    </span>
                  </div>

                  <button
                    onClick={() => generateReply(email)}
                    className="bg-purple-600 px-6 py-3 rounded-xl font-semibold"
                  >
                    Generate AI Reply
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {replyModal && selectedEmail && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-slate-900 w-[700px] rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-6">AI Generated Reply</h2>

              <textarea
                value={aiReply}
                onChange={(e) => setAiReply(e.target.value)}
                rows={10}
                className="w-full bg-gray-800 rounded-xl p-4 text-white"
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={createDraft}
                  className="bg-green-600 px-6 py-3 rounded-xl"
                >
                  Create Gmail Draft
                </button>

                <button
                  onClick={() => setReplyModal(false)}
                  className="bg-red-600 px-6 py-3 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}