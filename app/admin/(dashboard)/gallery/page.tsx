import Gallery from "@/components/admin/gallery";
export default function section() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <Gallery />
      </main>
    </div>
  );
}
