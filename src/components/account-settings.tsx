"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_BADGE } from "@/utils/badgeColor";
import { changeNameSchema, type ChangeNameInput } from "@/schema/settingsSchema";
import { Loader2 } from "lucide-react";

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.session;
}

/**
 * Account settings panel (account info + name change + credential reset).
 * Rendered inline inside the portal dashboards so the surrounding sidebar
 * chrome stays put — it is intentionally just the content, no page shell.
 */
export default function AccountSettings() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ["current-user"], queryFn: fetchCurrentUser });

  const [showConfirmName, setShowConfirmName] = useState(false);

  const nameForm = useForm<ChangeNameInput>({
    resolver: zodResolver(changeNameSchema),
    values: { name: user?.name || "" },
  });

  const watchedName = useWatch({ control: nameForm.control, name: "name" });
  const nameHasChanged = watchedName !== user?.name;

  const changeNameMutation = useMutation({
    mutationFn: async (data: ChangeNameInput) => {
      const res = await fetch(`/api/admin/users/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Name updated successfully");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setShowConfirmName(false);
    },
    onError: () => {
      toast.error("Failed to update name");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-normal m-0">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Account Info Card Skeleton */}
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card Skeleton */}
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <div className="flex items-end gap-2">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const credentialsVerified = user?.verified === "complete";

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Account Info Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Email</p>
                <p className="text-sm font-semibold truncate">{user?.email}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Role</p>
                <div>
                  <Badge className={`align-middle ${ROLE_BADGE[user?.role as keyof typeof ROLE_BADGE]}`}>{user?.role}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Member Since</p>
                <p className="text-sm font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    : "N/A"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Status</p>
                <Badge
                  className={
                    credentialsVerified
                      ? "bg-green-500/10 text-green-600 border-transparent w-fit"
                      : "bg-yellow-500/10 text-yellow-600 border-transparent w-fit"
                  }
                >
                  {credentialsVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowConfirmName(true);
              }}
            >
              <Controller
                name="name"
                control={nameForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name" className="text-xs uppercase tracking-wide font-medium">Change Name</FieldLabel>
                    <div className="flex items-end gap-2">
                      <div>
                        <Input {...field} id="name" placeholder="Enter your name" className="w-48" aria-invalid={fieldState.invalid} />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </div>
                      <Button
                        type="submit"
                        className="w-fit"
                        disabled={!nameHasChanged}
                      >
                        Save
                      </Button>
                    </div>
                  </Field>
                )}
              />
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Name Change Dialog */}
      <AlertDialog open={showConfirmName} onOpenChange={setShowConfirmName}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Name Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your name to <strong>{watchedName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const data = nameForm.getValues();
                changeNameMutation.mutate(data);
              }}
              disabled={changeNameMutation.isPending}
            >
              {changeNameMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
