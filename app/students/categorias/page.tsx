"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderTree, ArrowRight, Loader2 } from "lucide-react";

interface CategoryInfo {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 text-flag-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Categorías</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Elige una categoría para practicar con preguntas específicas.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <FolderTree className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No hay categorías</h2>
          <p className="text-sm text-muted-foreground">No hay categorías disponibles todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/students/practicar?categoryId=${cat.id}`}
              className="group bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-flag-blue/30 transition-all"
            >
              <div className="size-10 rounded-lg bg-flag-blue/10 flex items-center justify-center mb-4 group-hover:bg-flag-blue/20 transition-colors">
                <FolderTree className="size-5 text-flag-blue" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 tracking-tight">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {cat.description ?? "Sin descripción"}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-flag-blue">
                  {cat.questionCount} pregunta{cat.questionCount !== 1 && "s"}
                </span>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-flag-blue transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
