// app/user/home/page.tsx
import { Suspense } from "react";
import ContactPage from "@/components/contact/page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactPage />
    </Suspense>
  );
}
