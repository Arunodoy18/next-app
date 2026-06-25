"use client";

import InstructorChat from "@/components/instructor-chat";
import { useLearner } from "@/components/learner-context";

export default function StudentMessages() {
  const { user, programme } = useLearner();
  return <InstructorChat user={user} programmeId={programme.id} />;
}
