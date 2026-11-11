// import TeamMember from "@/app/component/admin/teamMember";
// import AdminDashboard from "../../component/admin/Sidebar";

import TeamMember from "@/components/admin/addTeamMember";
export default function member() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <TeamMember />
      </main>
    </div>
  );
}
