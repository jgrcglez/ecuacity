"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { extractYoutubeId, youtubeThumbnail } from "@/lib/youtube";

// ─── Types ────────────────────────────────────────────────

interface ApiVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

interface ApiResponse {
  videos: ApiVideo[];
}

// ─── Constants ────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  youtubeUrl: "",
  description: "",
  sortOrder: 0,
  active: true,
};

// ─── Component ────────────────────────────────────────────

export default function VideosPage() {
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Form state ──
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formActive, setFormActive] = useState(true);

  // ── Fetch ──
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/youtube-videos");
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      setVideos(data.videos);
    } catch {
      toast.error("Error al cargar videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ── CRUD ──
  const openCreate = () => {
    setFormTitle("");
    setFormUrl("");
    setFormDescription("");
    setFormSortOrder(videos.length);
    setFormActive(true);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (v: ApiVideo) => {
    setFormTitle(v.title);
    setFormUrl(v.youtubeUrl);
    setFormDescription(v.description ?? "");
    setFormSortOrder(v.sortOrder);
    setFormActive(v.active);
    setEditingId(v.id);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const save = async () => {
    if (!formTitle.trim() || !formUrl.trim()) return;

    setSaving(true);
    try {
      const body = {
        title: formTitle.trim(),
        youtubeUrl: formUrl.trim(),
        description: formDescription.trim() || null,
        sortOrder: formSortOrder,
        active: formActive,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/youtube-videos/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Video actualizado");
      } else {
        const res = await fetch("/api/admin/youtube-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Video creado");
      }

      setDialogOpen(false);
      fetchVideos();
    } catch {
      toast.error("Error al guardar el video");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/youtube-videos/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Video eliminado");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchVideos();
    } catch {
      toast.error("Error al eliminar el video");
    } finally {
      setDeleting(false);
    }
  };

  // ── Thumbnail preview ──
  const previewId = (() => {
    const url = formUrl.trim();
    if (!url) return null;
    return extractYoutubeId(url);
  })();

  // ── Table skeleton ──
  const renderSkeleton = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell className="pl-5"><Skeleton className="h-12 w-20 rounded" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
        <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Videos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {videos.length} video{videos.length !== 1 && "s"} · carrusel público
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold"
            >
              <Plus className="size-4 mr-1.5" />
              Nuevo video
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                  <TableHead className="pl-5">Miniatura</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right pr-5">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeleton()
                ) : videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                      No hay videos todavía.
                    </TableCell>
                  </TableRow>
                ) : (
                  videos.map((v) => {
                    const id = extractYoutubeId(v.youtubeUrl);
                    return (
                      <TableRow key={v.id}>
                        <TableCell className="pl-5">
                          {id ? (
                            <img
                              src={youtubeThumbnail(id)}
                              alt={v.title}
                              className="w-20 h-12 rounded object-cover border border-border"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground max-w-xs truncate">
                          {v.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          <a
                            href={v.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-flag-blue inline-flex items-center gap-1"
                          >
                            {v.youtubeUrl}
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              v.active
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-400 border-gray-200"
                            }
                          >
                            {v.active ? "Activo" : "Oculto"}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-5">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-flag-blue"
                              onClick={() => openEdit(v)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:text-red-600"
                              onClick={() => openDelete(v.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
              {editingId ? "Editar video" : "Nuevo video"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifica los datos del video de YouTube."
                : "Agrega un video de YouTube al carrusel público."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej: Cómo prepararse para el examen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL de YouTube</Label>
              <Input
                id="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {/* Live thumbnail preview */}
              {previewId && (
                <img
                  src={youtubeThumbnail(previewId)}
                  alt="Vista previa"
                  className="w-full h-36 rounded-lg object-cover border border-border mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Breve texto mostrado bajo el video..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2 flex items-end pb-0.5">
                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setFormActive(true)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      formActive
                        ? "bg-flag-blue text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormActive(false)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      !formActive
                        ? "bg-muted-foreground text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Oculto
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button
              onClick={save}
              disabled={!formTitle.trim() || !formUrl.trim() || saving}
              className="bg-flag-blue text-white hover:bg-flag-blue/90"
            >
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              {editingId ? "Guardar cambios" : "Crear video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar video</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar este video del carrusel?
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
