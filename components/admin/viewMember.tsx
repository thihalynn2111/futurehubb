"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, Edit3, Trash2, User, Plus } from "lucide-react";

export default function Member() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/team-members");
        const result = await response.json();
        if (result.success) {
          setTeamMembers(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch team members");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching team members");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team member?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/team-members/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete member");
      }

      setTeamMembers((previous) =>
        previous.filter((member) => member.id !== id),
      );

      alert("Team member deleted successfully!");
    } catch (error) {
      console.error("DELETE MEMBER ERROR:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-sans">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading team
        members...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-900 font-sans">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <span className="text-orange-600 text-xs font-bold tracking-widest uppercase">
            Team Management
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            Team Members
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your company team members, roles, and profiles.
          </p>
        </div>
        <button
          onClick={() => router.push(`/admin/addTeamMember`)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-center py-2.5 px-8 rounded-xl shadow-sm transition flex items-center  disabled:opacity-50"
        >
          <span>Add Team Member</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {teamMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          No team members found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member: any) => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Member Image / Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner mb-3">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={36} className="text-gray-300" />
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 text-center">
                    {member.name}
                  </h2>
                  <span className="text-orange-600 text-xs font-semibold tracking-wider uppercase mt-0.5">
                    {member.position}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-gray-500 text-sm text-center mb-6 line-clamp-3">
                  {member.bio ? member.bio : "No biography provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() =>
                    router.push(`/admin/teamMember/${member.id}/edit`)
                  }
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl border border-gray-200 transition flex items-center justify-center space-x-1.5 text-sm shadow-sm"
                >
                  <Edit3 size={16} className="text-orange-600" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-xl border border-red-100 transition flex items-center justify-center space-x-1.5 text-sm"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
