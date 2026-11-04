// import EditPartner from "@/app/component/admin/editPartner";
// import AdminDashboard from "../../../../component/admin/Sidebar";
// Allow this route to use runtime data
import EditPartner from "@/components/admin/editPartner";
export const instant = false;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPartnerPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <EditPartner id={Number(id)} />
      </main>
    </div>
  );
}
