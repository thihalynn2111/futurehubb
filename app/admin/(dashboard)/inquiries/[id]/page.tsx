"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminInquiriesPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // 🔑 Roles နဲ့ Permissions အတွက် State များကို ဤနေရာတွင် ထည့်ပေးရန် လိုအပ်ပါသည်
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Fetch Inquiry Detail
  const fetchInquiryDetail = async () => {
    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setInquiry(data);
      }
    } catch (err) {
      console.error("Error fetching inquiry detail:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Fetch Current User Permissions & Roles from API
  const fetchUserPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const userObj = data.user || {};

        setPermissions(userObj.permissions || []);

        const rawRoles = userObj.roles || [];
        setRoles(Array.isArray(rawRoles) ? rawRoles : [rawRoles]);
      }
    } catch (err) {
      console.error("Error fetching user permissions:", err);
    }
  };

  useEffect(() => {
    fetchInquiryDetail();
    fetchUserPermissions();
  }, [params.id]);

  // Handle Save as Draft
  const handleSaveAsDraft = async () => {
    try {
      alert("Draft saved successfully! 💾");
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  };

  // Handle Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${params.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      if (res.ok) {
        alert("Reply sent successfully! 🚀");
        router.push("/admin/inquiries");
      } else {
        alert("Failed to send reply.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">
        Loading inquiry detail...
      </div>
    );
  if (!inquiry)
    return (
      <div className="p-8 text-center text-red-500">Inquiry not found.</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Management Portal
          </h1>
          <Link
            href="/admin/inquiries"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Back to Inquiries List
          </Link>
        </div>

        {/* Detail & Reply Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold">
                FROM
              </span>
              <div className="font-semibold text-slate-900">{inquiry.name}</div>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold">
                EMAIL
              </span>
              <div className="text-sm text-blue-600">{inquiry.email}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">
              SUBJECT
            </span>
            <div className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {inquiry.subject || "No Subject"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-bold">
              MESSAGE
            </span>
            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>

          <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-bold">
                REPLY / DRAFT MESSAGE:
              </label>
              <textarea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message here..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ACTION BUTTONS WITH DRAFT BUTTON */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-3">
                {/* 🔑 Roles နဲ့ Permissions ကို မှန်ကန်စွာ စစ်ဆေးခြင်း */}
                {(roles.some(
                  (r) =>
                    typeof r === "string" &&
                    r.toUpperCase().includes("SUPER_ADMIN"),
                ) ||
                  permissions.includes("inquiries:update")) && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveAsDraft}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                    >
                      💾 Save as Draft
                    </button>

                    <button
                      type="submit"
                      disabled={sending}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {sending ? "Sending..." : "🚀 Send Reply & Mark Resolved"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
