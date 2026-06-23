import { Badge } from "@/components/ui/badge";
import { roleBadgeColor } from "@/utils/badgeColor";
import type { UserRole } from "@/lib/mock-data";

export default function RoleBadge({ role, className = "" }: { role: UserRole | string; className?: string }) {
  const colors = roleBadgeColor[role as UserRole] ?? "bg-stone-100 text-stone-800 dark:bg-stone-700/50 dark:text-stone-100";
  return (
    <Badge className={`align-middle font-medium ${colors} ${className}`}>
      {role}
    </Badge>
  );
}
