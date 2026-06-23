"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RoleBadge from "@/components/role-badge";
import { verificationBadgeColor } from "@/utils/badgeColor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import PageTitle from "@/components/page-title";
import type { UserResponse } from "@/schema/userSchema";
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

interface EditingUser {
  _id?: string;
  name: string;
  email: string;
  role?: AuthRole;
}

const emptyUser: EditingUser = { name: "", email: "", role: undefined};

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

  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as AuthRole | null;
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AuthRole | "all">(initialType ?? "all");

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const openNew = () => {
    setEditingUser({ ...emptyUser });
    setDialogOpen(true);
  };

  const openEdit = (u: UserResponse) => {
    setEditingUser({ _id: u._id, name: u.name, email: u.email, role: u.role });
    setDialogOpen(true);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      if (editingUser._id) {
        const res = await fetch(`/api/admin/users/${editingUser._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editingUser.name, email: editingUser.email, role: editingUser.role }),
        });
        if (!res.ok) throw new Error("Failed to update user");
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingUser),
        });
        if (!res.ok) throw new Error("Failed to create user");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
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
  };

  const exportUser = (u: UserResponse) => {
    const slug = (u.name || u.email || u._id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadCsv(`${slug || "user"}.csv`, toCsv([header, userRow(u)]));
  };

  const isNew = !editingUser?._id;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <PageTitle title="Admin Portal" />
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
                  className="pl-9 h-9 w-full bg-background"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button variant="outline" size="sm" className="h-9 flex-1 sm:flex-none" onClick={exportUsers}>
                  <Download size={14} className="mr-1.5" /> Export CSV
                </Button>
                <Button
                  size="sm"
                  className="h-9 flex-1 sm:flex-none bg-[#7e55f6] hover:bg-[#6742d4] text-white"
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
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="animate-spin mx-auto text-muted-foreground" size={24} />
                  </TableCell>
                </TableRow>
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
                    <TableRow key={u._id} className="group hover:bg-muted/50 transition-colors">
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
                            onClick={() => deleteMutation.mutate(u._id)}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent>
          {editingUser && (
            <>
              <DialogHeader>
                <DialogTitle>{isNew ? "New User" : editingUser.name}</DialogTitle>
                <DialogDescription>{isNew ? "Create a new user account." : "Edit user details and role."}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Name</Label>
                  <Input
                    placeholder="Enter the name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input
                    placeholder="Enter the email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Role</Label>
                  <Select
                    value={editingUser.role ?? ""}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value as AuthRole })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button className="bg-[#7e55f6] hover:bg-[#6742d4] text-white" disabled={saving} onClick={saveUser}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : isNew ? "Create User" : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
