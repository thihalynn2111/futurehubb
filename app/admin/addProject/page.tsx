// import Projects from "@/app/component/admin/project";
// import AdminDashboard from "../../component/admin/Sidebar";
import Projects from "@/components/admin/project";
export default function projectSection() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <Projects />;
      </main>
    </div>
  );
}
