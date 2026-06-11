"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileQuestion,
  Users,
  BarChart3,
  FolderTree,
} from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCard from "@/components/dashboard/stats-card";

interface DashboardStats {
  questions: number;
  activeQuestions: number;
  draftQuestions: number;
  categories: number;
  users: number;
  approvalRate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      }
    } catch {
      // silent — card shows placeholder
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const questionsDesc = stats
    ? `${stats.activeQuestions} activas · ${stats.draftQuestions} borradores`
    : "—";

  const categoriesDesc = stats
    ? `${stats.categories} en total`
    : "—";

  const usersDesc = stats
    ? `${stats.users} registrados`
    : "—";

  const approvalDesc = stats
    ? `${stats.approvalRate}% de aciertos`
    : "—";

  return (
    <div className="flex h-screen bg-muted">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Page heading */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Panel de administración de Ecuacity
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Preguntas"
              value={stats ? String(stats.questions) : "—"}
              description={questionsDesc}
              icon={FileQuestion}
            />
            <StatsCard
              title="Categorías"
              value={stats ? String(stats.categories) : "—"}
              description={categoriesDesc}
              icon={FolderTree}
              iconBgClass="bg-flag-yellow/20"
              iconColorClass="text-flag-yellow-dark"
            />
            <StatsCard
              title="Usuarios"
              value={stats ? String(stats.users) : "—"}
              description={usersDesc}
              icon={Users}
              iconBgClass="bg-flag-red/10"
              iconColorClass="text-flag-red"
            />
            <StatsCard
              title="Aprobación"
              value={stats ? `${stats.approvalRate}%` : "—"}
              description={approvalDesc}
              icon={BarChart3}
              iconBgClass="bg-green-50"
              iconColorClass="text-green-600"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
