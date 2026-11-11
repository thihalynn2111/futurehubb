import TrashGallery from "@/components/admin/trashGallery";
export default function member() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <TrashGallery />
      </main>
    </div>
  );
}
