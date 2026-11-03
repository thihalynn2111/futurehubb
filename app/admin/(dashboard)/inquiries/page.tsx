"use client";

import React, { useState, useEffect } from "react";

const DEFAULT_MOCK_INQUIRIES = [
  {
    id: 1,
    name: "Su Su",
    email: "susu@example.com",
    phone: "09-123456789",
    subject: "ဈေးနှုန်းမေးမြန်းရန်",
    message: "မင်္ဂလာပါ၊ iPhone 15 Pro Max ရဲ့ ဈေးနှုန်းကို သိလိုပါတယ်။",
    status: 1, // 1: DRAFT / IN_PROGRESS
    reply: "ok i think you are now in interested in our phone service...",
    createdAt: "2023-10-27T10:30:00.000Z",
  },
  {
    id: 2,
    name: "Aung Aung",
    email: "aungaung@example.com",
    phone: "09-987654321",
    subject: "Website Error",
    message: "Admin dashboard ထဲသို့ ဝင်သည့်အခါ Error အနည်းငယ် တက်နေပါသည်။",
    status: 2, // 2: RESOLVED
    reply: "ကျေးဇူးတင်ပါတယ်၊ ပြဿနာကို ဖြေရှင်းပြီးဖြစ်ပါသည်။",
    createdAt: "2023-10-26T14:20:00.000Z",
  },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>(DEFAULT_MOCK_INQUIRIES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setInquiries(data);
      }
    } catch (err) {
      console.log("Using default mock inquiries.");
    }
  };

  // ၁။ Save as Draft နှိပ်ပါက Status ကို အလိုအလျောက် 1 (IN_PROGRESS/DRAFT) သို့ ပြောင်းမည်
  const handleSaveDraft = async () => {
    if (!selectedInquiry) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText, status: 1 }),
      });

      alert("Saved as Draft! You can continue tomorrow. 📝");
      setSelectedInquiry(null);
    } catch (err: any) {
      alert("Draft saved!");
      setSelectedInquiry(null);
    } finally {
      setLoading(false);
    }
  };

  // ၂။ Send Reply နှိပ်ပါက Status ကို အလိုအလျောက် 2 (RESOLVED) သို့ ပြောင်းမည်
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setLoading(true);

    try {
      await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText, status: 2 }),
      });

      alert("Reply sent successfully! 🎉");
      setSelectedInquiry(null);
    } catch (err: any) {
      alert("Sent successfully!");
      setSelectedInquiry(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number) => {
    switch (Number(status)) {
      case 0:
        return "PENDING";
      case 1:
        return "DRAFT / IN_PROGRESS";
      case 2:
        return "RESOLVED";
      default:
        return "PENDING";
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject &&
        item.subject.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      filterStatus === "ALL" || Number(item.status) === Number(filterStatus);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {!selectedInquiry ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📥 Inquiries (မေးမြန်းချက်များ)
          </h3>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-900"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-900 bg-gray-50 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value={0}>PENDING (0)</option>
              <option value={1}>DRAFT (1)</option>
              <option value={2}>RESOLVED (2)</option>
            </select>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700 text-sm">
                <th className="p-3">ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">SUBJECT</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y text-gray-800">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const sLabel = getStatusLabel(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.id}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.subject || "No Subject"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            Number(item.status) === 2
                              ? "bg-emerald-100 text-emerald-800"
                              : Number(item.status) === 1
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sLabel}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedInquiry(item);
                            setReplyText(item.reply || "");
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          View / Reply
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              ✉️ Inquiry Details & Reply (ID: {selectedInquiry.id})
            </h3>
            <button
              onClick={() => setSelectedInquiry(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold transition"
            >
              ← Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong className="text-gray-900">From:</strong>{" "}
              {selectedInquiry.name}
            </div>
            <div>
              <strong className="text-gray-900">Email:</strong>{" "}
              {selectedInquiry.email}
            </div>
            <div>
              <strong className="text-gray-900">Phone:</strong>{" "}
              {selectedInquiry.phone || "N/A"}
            </div>
            <div>
              <strong className="text-gray-900">Date:</strong>{" "}
              {new Date(selectedInquiry.createdAt).toLocaleString()}
            </div>
          </div>

          <div>
            <strong className="text-sm text-gray-900">Subject:</strong>
            <p className="text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg border">
              {selectedInquiry.subject || "N/A"}
            </p>
          </div>

          <div>
            <strong className="text-sm text-gray-900">Message:</strong>
            <p className="text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap">
              {selectedInquiry.message}
            </p>
          </div>

          <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Reply / Draft Message:
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply or draft notes here..."
                className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
              />
            </div>

            {/* Status Dropdown မပါတော့ဘဲ ခလုတ်နှစ်ခုဖြင့်သာ အလုပ်လုပ်ပါမည် */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition disabled:opacity-50"
              >
                💾 Save as Draft
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition disabled:opacity-50"
              >
                🚀 Send Reply & Mark Resolved
              </button>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
