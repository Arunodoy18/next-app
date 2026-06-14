"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePortalStore } from "@/lib/portal-store";
import { programmeName, type AppUser, type UserRole } from "@/lib/mock-data";
import { Plus, Trash2, Download, Search } from "lucide-react";

let idCounter = 5000;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

// Each role gets its own colour so the table scans at a glance.
const ROLE_BADGE: Record<UserRole, string> = {
  Student: "bg-blue-500/10 text-blue-600 border-transparent",
  Instructor: "bg-[#7e55f6]/10 text-[#7e55f6] border-transparent",
  Admin: "bg-amber-500/10 text-amber-600 border-transparent",
};

function toCsv(rows: string[][]): string {
  // Quote fields and escape embedded quotes so commas/quotes survive.
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

export default function AdminUsersPage() {
  const { users, setUsers, programmes } = usePortalStore();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const openUser = (user: AppUser) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const saveUser = () => {
    if (!editingUser) return;
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === editingUser.id);
      return exists ? prev.map((u) => (u.id === editingUser.id ? editingUser : u)) : [...prev, editingUser];
    });
    setDialogOpen(false);
  };

  const header = ["Name", "Email", "Role", "Programme", "Signup Date"];
  const userRow = (u: AppUser) => [u.name, u.email, u.role, u.programmeId ? programmeName(u.programmeId) : "", new Date(u.signupDate).toLocaleDateString("en-GB")];

  const exportUsers = () => {
    downloadCsv("users.csv", toCsv([header, ...users.map(userRow)]));
  };

  const exportUser = (u: AppUser) => {
    const slug = (u.name || u.email || u.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    downloadCsv(`${slug || "user"}.csv`, toCsv([header, userRow(u)]));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-normal m-0">Users</h1>
        <p className="text-muted-foreground mt-1">Students, instructors, and admins across the platform.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium m-0">All Users</CardTitle>
              <CardDescription>Click a row to edit details, role, or enrolment.</CardDescription>
            </div>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-3 bg-muted/30 p-3 rounded-lg border border-border/50 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Tabs value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
                <TabsList className="bg-background">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="Student">Students</TabsTrigger>
                  <TabsTrigger value="Instructor">Instructors</TabsTrigger>
                  <TabsTrigger value="Admin">Admins</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-auto hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-64 bg-background"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={exportUsers}>
                <Download size={14} className="mr-1.5" /> Export CSV
              </Button>
              <Button
                size="sm"
                className="h-9 bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                onClick={() => openUser({ id: nextId("u"), name: "", email: "", role: "Student", signupDate: new Date().toISOString() })}
              >
                <Plus size={14} className="mr-1.5" /> New User
              </Button>
            </div>
          </div>
          {/* Mobile search bar */}
          <div className="relative w-full sm:hidden">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full bg-background"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Signup Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const signupDateObj = new Date(u.signupDate);
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }).format(signupDateObj);

                return (
                <TableRow key={u.id} className="cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => openUser({ ...u })}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge className={ROLE_BADGE[u.role]}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.programmeId ? programmeName(u.programmeId) : "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Export this user"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportUser(u);
                        }}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete user"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUsers((prev) => prev.filter((x) => x.id !== u.id));
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No users match your filters.
                  </TableCell>
                </TableRow>
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
                <DialogTitle>{editingUser.name || "New User"}</DialogTitle>
                <DialogDescription>Edit user details, role, and programme enrolment.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Name</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: (value ?? "Student") as UserRole })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Instructor">Instructor</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editingUser.role === "Student" && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Enrolled Programme</Label>
                    <Select
                      value={editingUser.programmeId ?? null}
                      onValueChange={(value) => setEditingUser({ ...editingUser, programmeId: value ?? undefined })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a programme" />
                      </SelectTrigger>
                      <SelectContent>
                        {programmes.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button className="bg-[#7e55f6] hover:bg-[#6742d4] text-white" onClick={saveUser}>
                  Save User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
