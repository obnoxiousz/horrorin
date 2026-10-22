import { AppShell } from "@/components/layout/app-shell";
import {
  SkeletonList,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <SkeletonPageHeader className="mb-6" />
        <div className="hidden lg:block glass rounded-3xl overflow-hidden">
          <SkeletonTable cols={7} rows={8} />
        </div>
        <div className="lg:hidden">
          <SkeletonList count={5} className="space-y-3" />
        </div>
      </div>
    </AppShell>
  );
}
