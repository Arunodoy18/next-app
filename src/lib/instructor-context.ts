import { INSTRUCTORS } from "@/lib/mock-data";

// Prototype context: no auth, so the portal views as the first instructor
// with multiple assigned programmes.
export const CURRENT_INSTRUCTOR =
  INSTRUCTORS.find((i) => i.assignedProgrammeIds.length > 1) ?? INSTRUCTORS[0];
