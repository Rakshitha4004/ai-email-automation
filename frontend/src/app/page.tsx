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
      const res = await fetch(`${BACKEND_URL}/emails`, {
        credentials: "include",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setEmails(data);
        toast.success("Emails fetched successfully");
      } else {
        toast.error(data.error || "Failed to fetch emails");
      }
    } catch (error) {
      console.error(error);
      toast.error("Backend connection failed");
    }

    setLoading(false);
  };

  const generateReply = async (subject: string, sender: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/generate-reply?subject=${encodeURIComponent(subject)}&sender=${encodeURIComponent(sender)}`,
        {
          credentials: "include",
        }
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
    } catch (error) {
      console.error(error);
      toast.error("Reply generation failed");
    }

    setLoading(false);
  };

  const createDraft = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/create-draft?subject=${encodeURIComponent(replySubject)}&sender=${encodeURIComponent(replyFrom)}&reply=${encodeURIComponent(replyPreview)}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.message) {
        toast.success("Draft created successfully");
        setOpen(false);
      } else {
        toast.error(data.error || "Draft creation failed");
      }
    } catch (error) {
      console.error(error);
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

        {/* rest remains same */}
      </div>
    </div>
  );
}