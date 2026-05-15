import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import api from "@/api/axios";
import categoryService from "@/api/category";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", image: null });

  const getFullUrl = (path) => {
    if (!path || path === "No Image Available") return "";
    if (path.startsWith("http")) return path;
    const baseUrl = api.defaults.baseURL.replace("/api", "");
    return `${baseUrl}/Images/Category/${path.replace(/\\/g, "/")}`;
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => categoryService.getAll(),
  });

  const categories = response?.data || [];

  const categoryMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("CategoryName", data.name);
      fd.append("Description", data.description);
      if (data.image) fd.append("ImgURL", data.image);

      if (editingCategory) {
        return await categoryService.update(editingCategory.categoryId, fd);
      }
      return await categoryService.create(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "categories"]);
      toast.success(`Category ${editingCategory ? "updated" : "created"}!`);
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", image: null });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "categories"]);
      toast.success("Category deleted");
    },
    onError: (error) => toast.error(error.response?.data?.message || "Error"),
  });

  if (isLoading) return <Skeleton className="h-60 w-full" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize courses by topic</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", description: "", image: null });
            }}>
              <Plus className="w-4 h-4 mr-2" /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit" : "Create"} Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Design, Business"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this category covers"
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => categoryMutation.mutate(formData)}
                disabled={categoryMutation.isPending}
              >
                {categoryMutation.isPending ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Platform Categories
          </CardTitle>
          <CardDescription>Manage how students browse content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.categoryId}>
                  <TableCell>
                    {cat.imgPath ? (
                      <img 
                        src={getFullUrl(cat.imgPath)} 
                        alt={cat.categoryName} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">{cat.categoryName}</TableCell>
                  <TableCell className="text-muted-foreground line-clamp-1">{cat.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(cat);
                          setFormData({ name: cat.categoryName, description: cat.description || "", image: null });
                          setIsModalOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this category?")) deleteMutation.mutate(cat.categoryId);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
