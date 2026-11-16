import EditGallery from "@/components/admin/editGallery";
export const instant = false;

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditPartnerPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <EditGallery slug={slug} />
      </main>
    </div>
  );
}
