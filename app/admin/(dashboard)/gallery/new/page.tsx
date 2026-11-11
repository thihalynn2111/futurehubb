import AddGallery from "@/components/admin/addGallery";
export default function section() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <AddGallery />
      </main>
    </div>
  );
}
