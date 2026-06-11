"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface ApiResponse {
  categories: ApiCategory[];
}

// ─── Component ────────────────────────────────────────────

export default function CategoriasPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Form state ──

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);

  // ── Fetch categories ──

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      setCategories(data.categories);
    } catch {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── CRUD handlers ──

  const openCreate = () => {
    setFormName("");
    setFormDescription("");
    setFormSortOrder(categories.length);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: ApiCategory) => {
    setFormName(cat.name);
    setFormDescription(cat.description ?? "");
    setFormSortOrder(cat.sortOrder);
    setEditingId(cat.id);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const save = async () => {
    if (!formName.trim()) return;

    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        sortOrder: formSortOrder,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Categoría actualizada");
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Categoría creada");
      }

      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error("Error al guardar la categoría");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Categoría eliminada");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchCategories();
    } catch {
      toast.error("Error al eliminar la categoría");
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading skeleton ──

  const renderSkeleton = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell className="pl-5"><Skeleton className="h-4 w-6" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell className="pr-5">
          <div className="flex justify-end gap-1">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
          </div>
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Categorías
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {categories.length} categoría{categories.length !== 1 && "s"} · fuente única para preguntas
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold"
            >
              <Plus className="size-4 mr-1.5" />
              Nueva categoría
            </Button>
          </div>

          {/* ── Table ── */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                  <TableHead className="pl-5 w-12">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-20">Orden</TableHead>
                  <TableHead className="w-24 text-right pr-5">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeleton()
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                      No hay categorías todavía.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat, idx) => (
                    <TableRow key={cat.id}>
                      <TableCell className="pl-5 text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-sm truncate">
                        {cat.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground font-mono">{cat.sortOrder}</span>
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-flag-blue"
                            onClick={() => openEdit(cat)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-600"
                            onClick={() => openDelete(cat.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "Modifica los campos de la categoría."
                : "Agrega una nueva categoría al banco de preguntas."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Geografía"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Geografía del Ecuador"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button
              onClick={save}
              disabled={!formName.trim() || saving}
              className="bg-flag-blue text-white hover:bg-flag-blue/90"
            >
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              {editingId !== null ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar esta categoría? Esta acción no se puede
              deshacer y eliminará también todas las preguntas asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
