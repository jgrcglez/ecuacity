import { Suspense } from "react";
import PracticarClient from "./client";

export default function PracticarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">
      <div className="size-6 rounded-full border-2 border-flag-blue border-t-transparent animate-spin" />
    </div>}>
      <PracticarClient />
    </Suspense>
  );
}
