import { Badge } from "@/components/ui/badge";

// Blue "Instructor" badge rendered next to a learner's name wherever an
// internal (instructor) learner appears across the portals. Pass `className`
// (e.g. "ml-2") when placing it inline after a name; omit it when stacking the
// badge on its own line below the name.
export default function InstructorTag({ className = "" }: { className?: string }) {
  return (
    <Badge
      className={`align-middle bg-blue-500/10 text-blue-600 border-transparent hover:bg-blue-500/20 font-medium ${className}`}
    >
      Instructor
    </Badge>
  );
}
