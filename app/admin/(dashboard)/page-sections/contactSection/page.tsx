// import AboutSection from "@/app/component/admin/about";
// import ContactSection from "@/app/component/admin/contact";
// import AdminDashboard from "../../component/admin/Sidebar";
import ContactSection from "@/components/admin/contact";
export default function section() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <ContactSection />
      </main>
    </div>
  );
}
