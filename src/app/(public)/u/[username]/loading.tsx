import { AppShell } from "@/components/layout/app-shell";
import { SkeletonProfile } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <AppShell>
      <SkeletonProfile />
    </AppShell>
  );
}
