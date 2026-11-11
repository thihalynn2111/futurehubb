import TrashMember from "@/components/admin/trashMember";
import TrashProject from "@/components/admin/trashProject";
export default function member() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <TrashProject />
      </main>
    </div>
  );
}
