"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RoleBadge from "@/components/role-badge";
import { verificationBadgeColor } from "@/utils/badgeColor";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { UserResponse, CreateUserInput, UpdateUserInput } from "@/schema/userSchema";
import { createUserSchema, updateUserSchema } from "@/schema/userSchema";
import type { AuthRole } from "@/types/userDoc";
import { ASSIGNABLE_ROLES } from "@/lib/mock-data";
import { Plus, Trash2, Download, Search, Pencil, Loader2 } from "lucide-react";

const ALL_ROLES: AuthRole[] = [...ASSIGNABLE_ROLES, "Admin"];

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchUsers(): Promise<UserResponse[]> {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export default function AdminUsersPage() {
  return (
    <Suspense>
      <AdminUsersContent />
    </Suspense>
  );
}

function AdminUsersContent() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as AuthRole | null;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AuthRole | "all">(initialType ?? "all");

  const isNew = !editingId;
  const editingUser = editingId ? users.find((u) => u.userId === editingId) : null;

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(isNew ? createUserSchema : updateUserSchema) as never,
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      role: editingUser?.role,
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeletingUser(null);
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CreateUserInput | UpdateUserInput) => {
      if (isNew) {
        const username = data.name.trim().toLowerCase().replace(/\s+/g, ".");
        const password = Math.random().toString(36).slice(-8);
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, username, password }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to create user");
        }
        return res.json();
      } else {
        const res = await fetch(`/api/admin/users/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name, email: data.email, role: data.role }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update user");
        }
        return res.json();
      }
    },
    onSuccess: () => {
      toast.success(isNew ? "User created successfully" : "User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || (isNew ? "Failed to create user" : "Failed to update user"));
    },
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({ name: "", email: "", role: undefined });
    setDialogOpen(true);
  };

  const openEdit = (u: UserResponse) => {
    setEditingId(u.userId);
    form.reset({ name: u.name, email: u.email, role: u.role });
    setDialogOpen(true);
  };



  const header = ["Name", "Email", "Role", "Verification", "Signup Date"];
  const userRow = (u: UserResponse) => [
    u.name,
    u.email,
    u.role,
    u.verified,
    new Date(u.createdAt).toLocaleDateString("en-GB"),
  ];

  const exportUsers = () => {
    downloadCsv("users.csv", toCsv([header, ...users.map(userRow)]));
    toast.success("CSV exported");
  };

  const exportUser = (u: UserResponse) => {
    const slug = (u.name || u.email || u.userId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadCsv(`${slug || "user"}.csv`, toCsv([header, userRow(u)]));
    toast.success(`Exported ${u.name || u.email}`);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all users across the platform.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">All Users</CardTitle>
              <CardDescription>Use the edit button to modify details or role.</CardDescription>
            </div>
          </div>
          <div className="w-full flex flex-col lg:flex-row gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 lg:items-center lg:justify-between min-w-0">
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter((v ?? "all") as AuthRole | "all")}>
              <SelectTrigger className="w-full lg:w-48 bg-background shrink-0">
                <span className="flex flex-1 text-left truncate">{roleFilter === "all" ? "All Users" : roleFilter}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full lg:w-auto min-w-0">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full bg-background"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button variant="outline"   className="flex-1 sm:flex-none" onClick={exportUsers}>
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
                <Button
                   className="flex-1 sm:flex-none"
                  onClick={openNew}
                >
                  <Plus size={14} className="mr-1.5" /> New User
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Signup Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No users match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => {
                  const formattedDate = new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }).format(new Date(u.createdAt));

                  return (
                    <TableRow key={u.userId} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-medium ${verificationBadgeColor[u.verified]}`}>
                          {u.verified === "complete" ? "Complete" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="icon-sm" title="Edit user" onClick={() => openEdit(u)}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" title="Export this user" onClick={() => exportUser(u)}>
                            <Download size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            title="Delete user"
                            onClick={() => setDeletingUser(u)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingId(null);
          form.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? "New User" : `Edit ${editingUser?.name}`}</DialogTitle>
            <DialogDescription>{isNew ? "Create a new user. A verification email will be sent to set up their credentials." : "Edit user details and role."}</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input {...field} id="name" placeholder="Enter the name" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input {...field} id="email" placeholder="Enter the email" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter className="mt-5">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : isNew ? "Create User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingUser?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingUser) deleteMutation.mutate(deletingUser.userId);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
