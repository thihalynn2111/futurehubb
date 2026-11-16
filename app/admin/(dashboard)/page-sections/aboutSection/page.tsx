// import AboutSection from "@/app/component/admin/about";
// import AdminDashboard from "../../component/admin/Sidebar";
import AboutSection from "@/components/admin/about";
export default function section() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <AboutSection />
      </main>
    </div>
  );
}
