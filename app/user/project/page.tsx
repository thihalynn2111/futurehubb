// app/user/home/page.tsx
import { Suspense } from "react";
import ProjectPage from "@/components/projects/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectPage />
    </Suspense>
  );
}
