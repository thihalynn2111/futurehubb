// import ViewProjects from "@/app/component/admin/viewPartner";
// import AdminDashboard from "../../component/admin/Sidebar";
import ViewProjects from "@/components/admin/viewPartner";
export default function viewProject() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <ViewProjects />;
      </main>
    </div>
  );
}
