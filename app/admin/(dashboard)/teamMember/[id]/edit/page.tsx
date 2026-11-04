// import EditMember from "@/app/component/admin/editMember";
// import AdminDashboard from "../../../../component/admin/Sidebar";
import EditMember from "@/components/admin/editMember";
// Allow this route to use runtime data
export const instant = false;

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMemberPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <AdminDashboard /> */}

      <main className="flex-1 p-8">
        <EditMember id={Number(id)} />;
      </main>
    </div>
  );
}
