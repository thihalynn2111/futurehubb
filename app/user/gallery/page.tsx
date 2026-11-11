// app/user/home/page.tsx
import { Suspense } from "react";
import GalleryPage from "@/components/gallery/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryPage />
    </Suspense>
  );
}
