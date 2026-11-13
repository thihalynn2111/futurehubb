// import Member from "@/app/component/admin/viewMember";
// import AdminDashboard from "../../component/admin/Sidebar";
import Member from "@/components/admin/viewMember";
export default function viewMember() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <Member />
      </main>
    </div>
  );
}
