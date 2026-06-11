"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ─── Types ────────────────────────────────────────────────

type QuestionStatus = "active" | "draft";

interface AnswerForm {
  text: string;
  isCorrect: boolean;
  order: number;
}

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface ApiAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface ApiQuestion {
  id: string;
  text: string;
  categoryId: string;
  categoryName: string;
  order: number;
  status: QuestionStatus;
  imageUrl: string | null;
  answers: ApiAnswer[];
}

interface ApiResponse {
  questions: ApiQuestion[];
  categories: ApiCategory[];
  page: number;
  totalPages: number;
  total: number;
}

// ─── Constants ────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const statusStyles: Record<QuestionStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

const statusLabels: Record<QuestionStatus, string> = {
  active: "Activa",
  draft: "Borrador",
};

const ANSWER_LABELS = ["A", "B", "C", "D", "E"];

const EMPTY_ANSWERS: AnswerForm[] = Array.from({ length: 5 }, (_, i) => ({
  text: "",
  isCorrect: i === 0,
  order: i,
}));

const EMPTY_FORM = {
  text: "",
  categoryId: "",
  status: "active" as QuestionStatus,
  imageUrl: "",
  answers: EMPTY_ANSWERS,
};

// ─── Component ────────────────────────────────────────────

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pageRef = useRef(page);
  useEffect(() => { pageRef.current = page; }, [page]);

  // ── Debounce search ──

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Fetch questions ──

  const fetchQuestions = useCallback(async () => {
    const p = pageRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/questions?${params}`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data: ApiResponse = await res.json();
      if (data.questions.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setQuestions(data.questions);
      setCategories(data.categories);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Error al cargar preguntas");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [page, fetchQuestions]);

  // ── CRUD handlers ──

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (q: ApiQuestion) => {
    setForm({
      text: q.text,
      categoryId: q.categoryId,
      status: q.status,
      imageUrl: q.imageUrl ?? "",
      answers: q.answers.map((a) => ({
        text: a.text,
        isCorrect: a.isCorrect,
        order: a.order,
      })),
    });
    setEditingId(q.id);
    setDialogOpen(true);
  };

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const save = async () => {
    const hasEmptyAnswer = form.answers.some((a) => !a.text.trim());
    if (hasEmptyAnswer) return;

    setSaving(true);
    try {
      const body = {
        text: form.text.trim(),
        categoryId: form.categoryId,
        status: form.status,
        imageUrl: form.imageUrl || null,
        answers: form.answers.map((a) => ({
          text: a.text.trim(),
          isCorrect: a.isCorrect,
          order: a.order,
        })),
      };

      if (editingId) {
        const res = await fetch(`/api/admin/questions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Pregunta actualizada");
      } else {
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Pregunta creada");
      }

      setDialogOpen(false);
      fetchQuestions();
    } catch {
      toast.error("Error al guardar la pregunta");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Pregunta eliminada");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchQuestions();
    } catch {
      toast.error("Error al eliminar la pregunta");
    } finally {
      setDeleting(false);
    }
  };

  // ── Answer helpers ──

  const setAnswerText = (index: number, text: string) => {
    setForm((prev) => {
      const answers = prev.answers.map((a, i) =>
        i === index ? { ...a, text } : a,
      );
      return { ...prev, answers };
    });
  };

  // ── Pagination numbers ──

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const safe = Math.min(page, totalPages);
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safe > 3) pages.push("...");
      for (let i = Math.max(2, safe - 1); i <= Math.min(totalPages - 1, safe + 1); i++) {
        pages.push(i);
      }
      if (safe < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const safePage = Math.min(page, totalPages);

  // ── Loading skeleton ──

  const renderSkeleton = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell className="pl-5"><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell><Skeleton className="h-4 w-80" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
        <TableCell className="pr-5">
          <div className="flex justify-end gap-1">
            <Skeleton className="size-8 rounded" />
            <Skeleton className="size-8 rounded" />
          </div>
        </TableCell>
      </TableRow>
    ));

  // ── Render ──

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
                Preguntas
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total} pregunta{total !== 1 && "s"} en total
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold"
            >
              <Plus className="size-4 mr-1.5" />
              Nueva pregunta
            </Button>
          </div>

          {/* ── Search ── */}
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar preguntas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* ── Table ── */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                  <TableHead className="pl-5 w-12">#</TableHead>
                  <TableHead>Pregunta</TableHead>
                  <TableHead className="w-36">Categoría</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-24 text-right pr-5">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeleton()
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                      {searchQuery ? "No se encontraron preguntas." : "No hay preguntas todavía."}
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((q, idx) => (
                    <TableRow key={q.id}>
                      <TableCell className="pl-5 text-xs text-muted-foreground font-mono">
                        {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-sm text-foreground max-w-md truncate">
                        {q.text}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{q.categoryName}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[11px] px-2 py-0.5 font-medium ${statusStyles[q.status]}`}
                        >
                          {statusLabels[q.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-flag-blue"
                            onClick={() => openEdit(q)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-red-600"
                            onClick={() => openDelete(q.id)}
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

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Página {safePage} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} className="text-xs text-muted-foreground/40 px-1">...</span>
                    ) : (
                      <Button
                        key={p}
                        variant={safePage === p ? "default" : "ghost"}
                        size="icon"
                        className={`size-8 text-xs ${
                          safePage === p
                            ? "bg-flag-blue text-white"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Editar pregunta" : "Nueva pregunta"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "Modifica los campos de la pregunta y sus respuestas."
                : "Completa los campos para agregar una nueva pregunta al banco."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Question text */}
            <div className="space-y-2">
              <Label htmlFor="text">Pregunta</Label>
              <Textarea
                id="text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Escribe el texto de la pregunta..."
                rows={2}
              />
            </div>

            {/* Category + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: QuestionStatus) =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de imagen (opcional)</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Answers */}
            <div className="border-t border-border pt-1">
              <Label className="text-sm font-semibold text-foreground">
                Opciones de respuesta
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Haz clic en cualquier opción para marcarla como la <strong className="text-foreground/80">respuesta correcta</strong>.
              </p>

              <div className="space-y-2.5">
                {form.answers.map((answer, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        answers: prev.answers.map((a, j) => ({
                          ...a,
                          isCorrect: j === i,
                        })),
                      }));
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      answer.isCorrect
                        ? "border-green-400 bg-green-50/50 ring-1 ring-green-400/30"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {answer.isCorrect ? (
                      <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                    ) : (
                      <span className="text-xs font-mono font-semibold text-muted-foreground/40 w-5 shrink-0 text-center">
                        {ANSWER_LABELS[i]}.
                      </span>
                    )}
                    <Input
                      placeholder={
                        answer.isCorrect
                          ? "Respuesta correcta..."
                          : `Distractor ${ANSWER_LABELS[i]}...`
                      }
                      value={answer.text}
                      onChange={(e) => setAnswerText(i, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`h-9 text-sm flex-1 min-w-0 ${
                        answer.isCorrect ? "border-green-400 focus-visible:border-green-500" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button
              onClick={save}
              disabled={
                !form.text.trim() ||
                !form.categoryId ||
                form.answers.some((a) => !a.text.trim()) ||
                saving
              }
              className="bg-flag-blue text-white hover:bg-flag-blue/90"
            >
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              {editingId !== null ? "Guardar cambios" : "Crear pregunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar pregunta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar esta pregunta? Esta acción no se puede
              deshacer y eliminará también sus opciones de respuesta.
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
