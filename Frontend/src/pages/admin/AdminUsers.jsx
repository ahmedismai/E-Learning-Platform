import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, UserCog, Mail, Calendar, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import accountService from "@/api/account";
import roleService from "@/api/role";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [newRoleName, setNewRoleName] = useState("");

  const { data: response, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => accountService.getAllUsers(),
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: roleService.getAll,
  });

  const users = response?.data || [];

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      // First remove all roles, then assign the new one
      await roleService.removeAllRoles(userId);
      return await roleService.assignRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("User role updated successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update user role"),
  });

  const createRoleMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "roles"]);
      toast.success("Role created successfully");
      setNewRoleName("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create role"),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "roles"]);
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("Role deleted successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete role"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => accountService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("User deleted successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete user"),
  });

  if (isUsersLoading || isRolesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Control Center</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform users, roles, and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user roles and platform access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {u.fullName?.[0] || "U"}
                          </div>
                          {u.fullName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {u.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.roles?.includes("Admin")
                              ? "destructive"
                              : u.roles?.includes("Instructor")
                                ? "warning"
                                : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {u.roles?.join(", ") || "Student"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Select
                            defaultValue={u.roles?.[0] || "Student"}
                            onValueChange={(newRole) => updateRoleMutation.mutate({ userId: u.userId, role: newRole })}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (
                                confirm("Are you sure you want to delete this user?")
                              ) {
                                deleteUserMutation.mutate(u.userId);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary" />
                Role Management
              </CardTitle>
              <CardDescription>Create and delete platform roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Role name..."
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={() => createRoleMutation.mutate(newRoleName)}
                  disabled={createRoleMutation.isPending || !newRoleName}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {roles.map((r) => (
                  <div key={r} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm font-medium">{r}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (confirm(`Delete role "${r}"?`)) {
                          deleteRoleMutation.mutate(r);
                        }
                      }}
                      disabled={deleteRoleMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
