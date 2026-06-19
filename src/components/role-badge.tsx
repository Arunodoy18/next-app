import { Badge } from "@/components/ui/badge";
import { ROLE_BADGE, type UserRole } from "@/lib/mock-data";

// Coloured badge for any role (Student/Instructor/Admin or a department role).
// Pass `className` (e.g. "ml-2") when placing it inline after a name.
export default function RoleBadge({ role, className = "" }: { role: UserRole; className?: string }) {
  return (
    <Badge className={`align-middle font-medium ${ROLE_BADGE[role]} ${className}`}>
      {role}
    </Badge>
  );
}
