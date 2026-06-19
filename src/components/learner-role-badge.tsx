import RoleBadge from "@/components/role-badge";
import { learnerRole } from "@/lib/mock-data";

// Renders the role badge for the user behind a learner id, wherever a learner
// appears across the portals. Plain students carry no badge (the default), so
// only non-Student roles (Instructor, HR, Project Management, Business
// Development, Admin) render. Pass `className` (e.g. "ml-2") for inline use.
export default function LearnerRoleBadge({ id, className = "" }: { id: string; className?: string }) {
  const role = learnerRole(id);
  if (!role || role === "Student") return null;
  return <RoleBadge role={role} className={className} />;
}
