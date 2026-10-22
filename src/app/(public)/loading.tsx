import { AppShell } from "@/components/layout/app-shell";
import { SkeletonCardGrid, SkeletonPageHeader } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <SkeletonPageHeader className="mb-8" />
        <SkeletonCardGrid count={8} />
      </div>
    </AppShell>
  );
}
