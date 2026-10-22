import { AppShell } from "@/components/layout/app-shell";
import { SkeletonDetail } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <AppShell>
      <SkeletonDetail />
    </AppShell>
  );
}
