"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────

interface PaymentRow {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  transactionId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: string;
  cardBrand: string | null;
  cardType: string | null;
  authorizationCode: string | null;
  reference: string | null;
  createdAt: string;
}

interface Stats {
  totalGross: number;
  totalCommission: number;
  totalNet: number;
  count: number;
}

interface ApiResponse {
  payments: PaymentRow[];
  stats: Stats;
  page: number;
  totalPages: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
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

// ─── Component ────────────────────────────────────────────

export default function PagosPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const pageRef = useRef(page);
  useEffect(() => { pageRef.current = page; }, [page]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageRef.current) });
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      if (data.payments.length === 0 && pageRef.current > 1) {
        setPage(pageRef.current - 1);
        return;
      }
      setPayments(data.payments);
      setStats(data.stats);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [page, fetchPayments]);

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

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* ── Header ── */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Pagos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} transaccione{total !== 1 && "s"} registrada{total !== 1 && "s"}
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Ingresos brutos"
              value={stats ? formatCents(stats.totalGross) : "—"}
              description={stats ? `${stats.count} pago${stats.count !== 1 ? "s" : ""}` : "—"}
              icon={DollarSign}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
            <StatsCard
              title="Comisiones Payphone"
              value={stats ? formatCents(stats.totalCommission) : "—"}
              description={stats ? `${((stats.totalCommission / stats.totalGross) * 100).toFixed(2)}% efectivo` : "—"}
              icon={Percent}
              iconBgClass="bg-red-50"
              iconColorClass="text-red-500"
            />
            <StatsCard
              title="Ingresos netos"
              value={stats ? formatCents(stats.totalNet) : "—"}
              description="Lo que recibes realmente"
              icon={TrendingUp}
              iconBgClass="bg-flag-blue/10"
              iconColorClass="text-flag-blue"
            />
            <StatsCard
              title="Último pago"
              value={payments.length > 0 ? formatCents(payments[0].netAmount) : "—"}
              description={payments.length > 0 ? formatDate(payments[0].createdAt) : "—"}
              icon={CreditCard}
              iconBgClass="bg-flag-yellow/20"
              iconColorClass="text-flag-yellow-dark"
            />
          </div>

          {/* ── Table ── */}
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
                  <TableHead className="pl-5">Usuario</TableHead>
                  <TableHead>Transacción</TableHead>
                  <TableHead>Bruto</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Neto</TableHead>
                  <TableHead>Tarjeta</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-5"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                      No hay pagos registrados todavía.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{p.userName ?? "—"}</span>
                          <span className="text-xs text-muted-foreground">{p.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          #{p.transactionId}
                        </code>
                        {p.authorizationCode && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Auth: {p.authorizationCode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {formatCents(p.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-red-500">
                        -{formatCents(p.commission)}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-green-600">
                        {formatCents(p.netAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.cardBrand && p.cardType
                          ? `${p.cardBrand} (${p.cardType})`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(p.createdAt)}
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
    </div>
  );
}
