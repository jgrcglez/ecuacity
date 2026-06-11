import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ExternalLink } from "lucide-react";

const placeholderQuestions = [
  {
    id: 1,
    text: "Ejemplo de pregunta de geografía...",
    category: "Geografía",
    status: "active" as const,
  },
  {
    id: 2,
    text: "Ejemplo de pregunta de historia...",
    category: "Historia",
    status: "active" as const,
  },
  {
    id: 3,
    text: "Ejemplo de pregunta de geografía...",
    category: "Geografía",
    status: "active" as const,
  },
  {
    id: 4,
    text: "Ejemplo de pregunta de cultura...",
    category: "Cultura",
    status: "draft" as const,
  },
  {
    id: 5,
    text: "Ejemplo de pregunta de economía...",
    category: "Economía",
    status: "active" as const,
  },
];

const statusVariant = {
  active: "default" as const,
  draft: "secondary" as const,
};

const statusClass = {
  active: "bg-green-50 text-green-700 hover:bg-green-50 border-green-200",
  draft: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
};

const statusLabel = {
  active: "Activa",
  draft: "Borrador",
};

export default function RecentQuestions() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
        <CardTitle className="text-sm font-semibold text-foreground tracking-tight">
          Preguntas recientes
        </CardTitle>
        <Button
          size="sm"
          className="bg-flag-yellow text-flag-blue hover:bg-flag-blue hover:text-white font-semibold text-xs h-8"
        >
          <Plus className="size-3.5 mr-1" />
          Nueva
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="[&>th]:text-[11px] [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:uppercase [&>th]:tracking-wider">
              <TableHead className="pl-5">Pregunta</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="pr-5 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholderQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="pl-5 font-medium text-sm text-foreground">
                  {q.text}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {q.category}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[q.status]}
                    className={statusClass[q.status]}
                  >
                    {statusLabel[q.status]}
                  </Badge>
                </TableCell>
                <TableCell className="pr-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground/40 hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
