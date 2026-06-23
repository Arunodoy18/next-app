"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/auth/client";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout().then(() => router.push("/login"));
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-muted-foreground" size={24} />
    </div>
  );
}
