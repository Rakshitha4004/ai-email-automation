"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Mail,
  AlertCircle,
  FileText,
  Search,
  X,
  Moon,
  Sun,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const BACKEND_URL = "https://ai-email-automation-qfyq.onrender.com";

export default function Home() {
  const [emails, setEmails] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const [replyPreview, setReplyPreview] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyFrom, setReplyFrom] = useState("");
  const [open, setOpen] = useState(false);

  const loginWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };

  const fetchEmails = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/emails`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setEmails(data);
        toast.success("Emails fetched successfully");
      } else {
        toast.error(data.error || "Failed to fetch emails");
      }
    } catch {
      toast.error("Backend connection failed");
    }

    setLoading(false);
  };

  const generateReply = async (subject: string, sender: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/generate-reply?subject=${encodeURIComponent(subject)}&sender=${encodeURIComponent(sender)}`
      );

      const data = await res.json();

      if (data.reply) {
        setReplyPreview(data.reply);
        setReplySubject(data.subject);
        setReplyFrom(data.from);
        setOpen(true);
      } else {
        toast.error(data.error || "Reply generation failed");
      }
    } catch {
      toast.error("Reply generation failed");
    }

    setLoading(false);
  };

  const createDraft = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/create-draft?subject=${encodeURIComponent(replySubject)}&sender=${encodeURIComponent(replyFrom)}&reply=${encodeURIComponent(replyPreview)}`
      );

      const data = await res.json();

      if (data.message) {
        toast.success("Draft created successfully");
        setOpen(false);
      } else {
        toast.error(data.error || "Draft creation failed");
      }
    } catch {
      toast.error("Draft creation failed");
    }

    setLoading(false);
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.from.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "ALL" || email.category === filter;

    return matchesSearch && matchesFilter;
  });

  const urgentCount = emails.filter((e) => e.category === "URGENT").length;
  const importantCount = emails.filter(
    (e) => e.category === "IMPORTANT"
  ).length;
  const unwantedCount = emails.filter(
    (e) => e.category === "UNWANTED"
  ).length;

  const chartData = [
    { name: "Urgent", value: urgentCount },
    { name: "Important", value: importantCount },
    { name: "Unwanted", value: unwantedCount },
  ];

  const COLORS = ["#ef4444", "#eab308", "#6b7280"];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex">
      <Toaster />

      <div className="w-64 bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-10">AI Mail</h1>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Mail size={20} />
            <span>Inbox</span>
          </div>

          <div className="flex items-center gap-3">
            <FileText size={20} />
            <span>Drafts</span>
          </div>

          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <span>Analytics</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            AI Email Dashboard
          </h1>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-white dark:bg-gray-800 dark:text-white p-3 rounded-lg shadow"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={loginWithGoogle}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Login with Gmail
          </button>

          <button
            onClick={fetchEmails}
            className="bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Loading..." : "Fetch Emails"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 dark:text-white shadow rounded-xl p-6">
            <h2>Total Emails</h2>
            <p className="text-3xl font-bold">{emails.length}</p>
          </div>

          <div className="bg-red-100 dark:bg-red-900 dark:text-white shadow rounded-xl p-6">
            <h2>Urgent</h2>
            <p className="text-3xl font-bold">{urgentCount}</p>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-700 dark:text-white shadow rounded-xl p-6">
            <h2>Important</h2>
            <p className="text-3xl font-bold">{importantCount}</p>
          </div>

          <div className="bg-gray-200 dark:bg-gray-800 dark:text-white shadow rounded-xl p-6">
            <h2>Unwanted</h2>
            <p className="text-3xl font-bold">{unwantedCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Email Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" outerRadius={100} label>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Category Counts
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow px-4 py-3 mb-6">
          <Search />
          <input
            type="text"
            placeholder="Search emails..."
            className="ml-3 w-full outline-none bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 mb-8">
          {["ALL", "URGENT", "IMPORTANT", "UNWANTED"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg ${
                filter === item
                  ? "bg-black text-white"
                  : "bg-white dark:bg-gray-900 dark:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEmails.map((email, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-xl p-6"
            >
              <h2 className="text-xl font-bold mb-3">{email.subject}</h2>

              <p className="mb-3">From: {email.from}</p>

              <p className="font-bold mb-4">{email.category}</p>

              <button
                onClick={() => generateReply(email.subject, email.from)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg"
              >
                Generate Reply
              </button>
            </div>
          ))}
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />

            <Dialog.Content className="fixed top-1/2 left-1/2 bg-white dark:bg-gray-900 dark:text-white p-6 rounded-xl shadow-xl w-[650px] -translate-x-1/2 -translate-y-1/2">
              <Dialog.Title className="text-2xl font-bold mb-4">
                AI Reply Preview
              </Dialog.Title>

              <div className="flex justify-end mb-4">
                <Dialog.Close>
                  <X />
                </Dialog.Close>
              </div>

              <p><strong>Subject:</strong> {replySubject}</p>
              <p className="mb-4"><strong>From:</strong> {replyFrom}</p>

              <textarea
                className="w-full border rounded-lg p-4 h-64 bg-transparent"
                value={replyPreview}
                onChange={(e) => setReplyPreview(e.target.value)}
              />

              <button
                onClick={createDraft}
                className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg"
              >
                Create Draft
              </button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}