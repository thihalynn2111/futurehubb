"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Reply Form State
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) {
          setUserRoles(meData.user.roles || []);
          setUserPermissions(meData.user.permissions || []);
        }
      }

      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isSuperAdmin = userRoles.some(
    (role) =>
      role.toLowerCase() === "super-admin" ||
      role.toLowerCase() === "super_admin" ||
      role.toLowerCase() === "admin",
  );

  const canUpdate =
    isSuperAdmin || userPermissions.includes("inquiries:update");
  const canDelete =
    isSuperAdmin || userPermissions.includes("inquiries:delete");

  // Handle Send Reply & Mark Resolved
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    if (!replyMessage.trim()) {
      alert("Please enter a reply message.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          toEmail: selectedInquiry.email,
          subject: selectedInquiry.subject,
          message: replyMessage,
        }),
      });

      if (res.ok) {
        alert("Reply sent successfully and marked as resolved! ✅");
        setReplyMessage("");
        setSelectedInquiry(null);
        fetchData();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to send email via Nodemailer.");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Something went wrong while sending the reply.");
    } finally {
      setSending(false);
    }
  };

  // Handle Save as Draft (Status = 2)
  const handleSaveAsDraft = async () => {
    if (!selectedInquiry) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 2 }), // 2 = Draft
      });

      if (res.ok) {
        alert("Saved as Draft successfully! 📝");
        setSelectedInquiry(null);
        fetchData();
      } else {
        alert("Failed to save draft.");
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert("Something went wrong while saving draft.");
    }
  };

  // Handle Soft Delete / Trash
  const handleSoftDelete = async (id: number) => {
    if (!confirm("Move this inquiry to Trash?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedInquiry(null);
        fetchData();
      } else {
        alert("Failed to trash inquiry");
      }
    } catch (err) {
      console.error("Error trashing inquiry:", err);
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && item.status === 0) ||
      (statusFilter === "resolved" && item.status === 1) ||
      (statusFilter === "draft" && item.status === 2);

    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="p-8 text-center text-slate-600">Loading inquiries...</div>
    );

  return (
    <div className="p-8 text-slate-800 min-h-screen bg-slate-100 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Management Portal
            </h1>
          </div>
          <Link
            href="/admin/inquiries/trash"
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 shadow-sm cursor-pointer"
          >
            🗑️ View Inquiries Trash
          </Link>
        </div>

        {/* If selectedInquiry exists, show reply form view */}
        {selectedInquiry ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
              >
                ← Back to Inquiries List
              </button>
              <div className="space-x-2">
                {canDelete && (
                  <button
                    onClick={() => handleSoftDelete(selectedInquiry.id)}
                    className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Trash
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  From
                </label>
                <div className="font-semibold text-slate-900">
                  {selectedInquiry.name}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Email
                </label>
                <div className="text-blue-600 font-medium">
                  {selectedInquiry.email}
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedInquiry.subject || "No Subject"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Message
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* REPLY / DRAFT FORM */}
            <form
              onSubmit={handleSendReply}
              className="space-y-4 pt-4 border-t"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Reply / Draft Message:
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message here..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* ACTION BUTTONS WITH DRAFT BUTTON */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                >
                  💾 Save as Draft
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "🚀 Send Reply & Mark Resolved"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                📬 Inquiries (မေးမြန်းချက်များ)
              </h2>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                placeholder="Search by name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="draft">Draft / In Progress</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-16">ID</th>
                    <th className="py-3 px-4">NAME</th>
                    <th className="py-3 px-4">SUBJECT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-4 px-4 font-semibold text-slate-600">
                          {item.id}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.email}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-700 font-medium">
                          {item.subject || "No Subject"}
                        </td>

                        <td className="py-4 px-4">
                          {item.status === 1 ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                              RESOLVED
                            </span>
                          ) : item.status === 2 ? (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                              DRAFT
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider">
                              PENDING
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedInquiry(item)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                          >
                            View / Reply
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => handleSoftDelete(item.id)}
                              className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl text-xs font-bold cursor-pointer transition"
                            >
                              Trash
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-slate-400"
                      >
                        No inquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
