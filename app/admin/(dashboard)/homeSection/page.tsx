// import AdminDashboard from "../../component/admin/Sidebar";
// import Home from "../../component/admin/home";
import Home from "@/components/admin/home";
export default function section() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <Home />
      </main>
    </div>
  );
}
