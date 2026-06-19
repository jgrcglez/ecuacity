"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
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

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  isTestimonial: boolean;
  testimonialPublished: boolean;
  createdAt: string;
}

interface ApiResponse {
  messages: Message[];
  page: number;
  totalPages: number;
  total: number;
  unread: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selected, setSelected] = useState<Message | null>(null);

  const pageRef = useRef(page);
  useEffect(() => { pageRef.current = page; }, [page]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageRef.current) });
      if (filter !== "all") params.set("filter", filter);
      const res = await fetch(`/api/admin/contact-messages?${params}`);
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      setMessages(data.messages);
      setUnread(data.unread);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const id = setTimeout(() => fetchMessages(), 0);
    return () => clearTimeout(id);
  }, [page, fetchMessages]);

  const markRead = async (id: string, read: boolean) => {
    await fetch("/api/admin/contact-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    fetchMessages();
    if (selected?.id === id) {
      setSelected({ ...selected, read });
    }
  };

  const markPublished = async (id: string, published: boolean) => {
    await fetch("/api/admin/contact-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, testimonialPublished: published }),
    });
    fetchMessages();
    if (selected?.id === id) {
      setSelected({ ...selected, testimonialPublished: published });
    }
  };

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

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Mensajes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total} mensaje{total !== 1 && "s"}
                {unread > 0 && <span className="text-flag-blue font-medium"> · {unread} sin leer</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {["all", "unread", "read"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f as typeof filter); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f ? "bg-flag-blue text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "Todos" : f === "unread" ? "Sin leer" : "Leídos"}
                </button>
              ))}
            </div>
          </div>

          {/* Table and detail layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Table */}
            <div className={`rounded-lg border border-border bg-card shadow-sm overflow-hidden ${selected ? "hidden xl:block" : ""}`}>
              <Table>
                <TableHeader>
                  <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                    <TableHead className="pl-5 w-8"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="pl-5"><Skeleton className="size-4 rounded" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      </TableRow>
                    ))
                  ) : messages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-sm text-muted-foreground">
                        No hay mensajes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((m) => (
                      <TableRow
                        key={m.id}
                        className={`cursor-pointer ${selected?.id === m.id ? "bg-flag-blue/5" : ""} ${!m.read ? "font-medium" : ""}`}
                        onClick={() => setSelected(m)}
                      >
                        <TableCell className="pl-5">
                          {m.read ? <MailOpen className="size-4 text-muted-foreground/40" /> : <Mail className="size-4 text-flag-blue" />}
                        </TableCell>
                        <TableCell className="text-sm">{m.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{m.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

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
                        <Button key={p} variant={safePage === p ? "default" : "ghost"} size="icon"
                          className={`size-8 text-xs ${safePage === p ? "bg-flag-blue text-white" : "text-muted-foreground"}`}
                          onClick={() => setPage(p)}
                        >{p}</Button>
                      )
                    )}
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Detail */}
            {selected && (
              <div className="xl:col-span-2 rounded-lg border border-border bg-card shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={selected.read ? "text-muted-foreground" : "bg-flag-blue text-white border-flag-blue"}>
                      {selected.read ? "Leído" : "Sin leer"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(selected.createdAt)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => markRead(selected.id, !selected.read)}>
                      {selected.read ? <Mail className="size-3.5 mr-1.5" /> : <MailOpen className="size-3.5 mr-1.5" />}
                      {selected.read ? "Marcar no leído" : "Marcar leído"}
                    </Button>
                    {selected.isTestimonial ? (
                      <Button size="sm" variant="ghost" className={selected.testimonialPublished ? "text-green-600" : "text-muted-foreground"}
                        onClick={() => markPublished(selected.id, !selected.testimonialPublished)}
                      >
                        <Star className={`size-3.5 mr-1.5 ${selected.testimonialPublished ? "fill-flag-yellow text-flag-yellow" : ""}`} />
                        {selected.testimonialPublished ? "Publicado" : "Publicar testimonio"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-foreground mb-1">{selected.subject}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
