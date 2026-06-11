"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldOff,
  Ban,
  UserCheck,
  Loader2,
  KeyRound,
  LogOut,
  Trash2,
  Eye,
  Monitor,
  Smartphone,
  Globe,
  MoreVertical,
  Sparkles,
  Crown,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
  questionsAnswered: number;
  correctAnswers: number;
  successRate: number | null;
}

interface ApiResponse {
  users: ApiUser[];
  page: number;
  totalPages: number;
  total: number;
}

interface SessionData {
  id: string;
  createdAt: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
}

// ─── Constants ────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const roleBadgeClass = (role: string) =>
  role === "admin"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

const roleLabel = (role: string) => (role === "admin" ? "Admin" : "Usuario");

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function deviceIcon(ua: string | null) {
  if (!ua) return <Globe className="size-3.5" />;
  const s = ua.toLowerCase();
  if (s.includes("mobile") || s.includes("android") || s.includes("iphone"))
    return <Smartphone className="size-3.5" />;
  return <Monitor className="size-3.5" />;
}

// ─── Component ────────────────────────────────────────────

export default function UsuariosPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialogs
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
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

  // ── Fetch users ──

  const fetchUsers = useCallback(async () => {
    const p = pageRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (searchQuery) params.set("search", searchQuery);
      if (planFilter) params.set("plan", planFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      if (data.users.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [page, fetchUsers]);

  // ── Actions ──

  const callAction = async (userId: string, body: Record<string, unknown>) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      toast.error("Error al ejecutar la acción");
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const toggleRole = async (user: ApiUser) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const ok = await callAction(user.id, { action: "toggleRole", role: newRole });
    if (ok) {
      toast.success(newRole === "admin" ? `${user.name} ahora es administrador` : `${user.name} ahora es usuario`);
      fetchUsers();
    }
  };

  const toggleBan = async (user: ApiUser) => {
    const ok = await callAction(user.id, { action: user.banned ? "unban" : "ban" });
    if (ok) {
      toast.success(user.banned ? `${user.name} ha sido desbloqueado` : `${user.name} ha sido bloqueado`);
      fetchUsers();
    }
  };

  const togglePlan = async (user: ApiUser) => {
    const newPlan = user.plan === "premium" ? "free" : "premium";
    const ok = await callAction(user.id, { action: "togglePlan", plan: newPlan });
    if (ok) {
      toast.success(newPlan === "premium" ? `${user.name} ahora es Premium` : `${user.name} ahora es Básico`);
      fetchUsers();
    }
  };

  const resetPassword = async () => {
    if (!selectedUser || newPassword.length < 6) return;
    const ok = await callAction(selectedUser.id, { action: "resetPassword", newPassword });
    if (ok) {
      toast.success("Contraseña actualizada");
      setPasswordDialogOpen(false);
      setNewPassword("");
    }
  };

  const openPasswordDialog = (user: ApiUser) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordDialogOpen(true);
  };

  const openSessions = async (user: ApiUser) => {
    setSelectedUser(user);
    setSessionsDialogOpen(true);
    setSessionsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/sessions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSessions(data.sessions);
    } catch {
      toast.error("Error al cargar sesiones");
      setSessionsDialogOpen(false);
    } finally {
      setSessionsLoading(false);
    }
  };

  const revokeSessions = async (user: ApiUser) => {
    const ok = await callAction(user.id, { action: "revokeSessions" });
    if (ok) {
      toast.success("Sesiones revocadas");
      setSessions([]);
    }
  };

  const impersonate = async (user: ApiUser) => {
    setActionLoading(user.id);
    try {
      const res = await fetch("/api/auth/admin/impersonate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error();
      window.location.href = "/dashboard";
    } catch {
      toast.error("Error al impersonar usuario");
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${selectedUser.name} ha sido eliminado`);
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  // ── Pagination ──

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const safe = Math.min(page, totalPages);
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safe > 3) pages.push("...");
      for (let i = Math.max(2, safe - 1); i <= Math.min(totalPages - 1, safe + 1); i++) pages.push(i);
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
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="pr-5"><div className="flex justify-end gap-1"><Skeleton className="size-8 rounded" /></div></TableCell>
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
              <h1 className="text-xl font-bold tracking-tight text-foreground">Usuarios</h1>
              <p className="text-sm text-muted-foreground mt-1">{total} usuario{total !== 1 && "s"} registrados</p>
            </div>
          </div>

          {/* ── Search + Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setPlanFilter(""); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !planFilter
                    ? "bg-flag-blue text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => { setPlanFilter("admin"); setPage(1); }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  planFilter === "admin"
                    ? "bg-amber-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="size-3" />
                Admin
              </button>
              <button
                onClick={() => { setPlanFilter("premium"); setPage(1); }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  planFilter === "premium"
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown className="size-3" />
                Premium
              </button>
              <button
                onClick={() => { setPlanFilter("free"); setPage(1); }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  planFilter === "free"
                    ? "bg-gray-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Básico
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                  <TableHead className="pl-5">Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right pr-5">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  renderSkeleton()
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                      {searchQuery ? "No se encontraron usuarios." : "No hay usuarios todavía."}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className={u.banned ? "opacity-60" : ""}>
                      <TableCell className="pl-5 font-medium text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-flag-blue/10 flex items-center justify-center text-xs font-semibold text-flag-blue shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${roleBadgeClass(u.role)}`}>
                          {roleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.role === "admin" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${
                            u.plan === "premium"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}>
                            {u.plan === "premium" ? "Premium" : "Básico"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.banned ? (
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium bg-red-50 text-red-700 border-red-200">Bloqueado</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-medium bg-green-50 text-green-700 border-green-200">Activo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.questionsAnswered > 0 ? (
                          <span>{u.correctAnswers}/{u.questionsAnswered} <span className="text-muted-foreground/60 ml-1">({u.successRate}%)</span></span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" disabled={actionLoading === u.id}>
                                {actionLoading === u.id ? <Loader2 className="size-3.5 animate-spin" /> : <MoreVertical className="size-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => impersonate(u)} disabled={u.banned === true}>
                                <Eye className="size-3.5 mr-2" />
                                Impersonar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPasswordDialog(u)}>
                                <KeyRound className="size-3.5 mr-2" />
                                Resetear contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSessions(u)}>
                                <Monitor className="size-3.5 mr-2" />
                                Ver sesiones
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toggleRole(u)}>
                                {u.role === "admin" ? <ShieldOff className="size-3.5 mr-2" /> : <Shield className="size-3.5 mr-2" />}
                                {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                              </DropdownMenuItem>
                              {u.role !== "admin" && (
                                <DropdownMenuItem onClick={() => togglePlan(u)}>
                                  <Sparkles className="size-3.5 mr-2" />
                                  {u.plan === "premium" ? "Quitar Premium" : "Hacer Premium"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => toggleBan(u)}>
                                {u.banned ? <UserCheck className="size-3.5 mr-2" /> : <Ban className="size-3.5 mr-2" />}
                                {u.banned ? "Desbloquear" : "Bloquear"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => { setSelectedUser(u); setDeleteDialogOpen(true); }}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Eliminar usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <p className="text-xs text-muted-foreground">Página {safePage} de {totalPages}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
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
                        className={`size-8 text-xs ${safePage === p ? "bg-flag-blue text-white" : "text-muted-foreground"}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Reset Password Dialog ── */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Resetear contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <DialogFooter showCloseButton>
            <Button onClick={resetPassword} disabled={newPassword.length < 6} className="bg-flag-blue text-white hover:bg-flag-blue/90">
              Guardar contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sessions Dialog ── */}
      <Dialog open={sessionsDialogOpen} onOpenChange={setSessionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sesiones activas</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} tiene {sessions.length} sesión{sessions.length !== 1 && "es"}
            </DialogDescription>
          </DialogHeader>
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay sesiones activas</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50 text-sm">
                  <div className="text-muted-foreground">{deviceIcon(s.userAgent)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate">{s.userAgent ?? "Desconocido"}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.ipAddress ?? "IP desconocida"} · {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(s.expiresAt) > new Date() ? "Activa" : "Expirada"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {sessions.length > 0 && (
            <DialogFooter showCloseButton>
              <Button
                variant="destructive"
                onClick={() => { selectedUser && revokeSessions(selectedUser); }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <LogOut className="size-3.5 mr-1.5" />
                Cerrar todas las sesiones
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar a <strong>{selectedUser?.name}</strong>? Se eliminarán todas sus sesiones, cuentas y progreso. Esta acción no se puede deshacer.
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
              Eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
