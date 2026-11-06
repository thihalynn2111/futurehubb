// app/user/home/page.tsx
import { Suspense } from "react";
import AboutPage from "@/components/about/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutPage />
    </Suspense>
  );
}
