import { TableRow, GlobalData } from '@/types/kdp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as TRow,
} from '@/components/ui/table';
import { LayoutGrid, BookOpen, Book } from 'lucide-react';

interface ResultsTableProps {
  data: TableRow[];
  globalData: GlobalData;
}

export const ResultsTable = ({ data, globalData }: ResultsTableProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  const getMarginClass = (margin: number) => {
    if (margin < 30) return 'bg-destructive/20 text-destructive font-semibold';
    if (margin <= 40) return 'bg-warning/20 text-warning font-semibold';
    return 'bg-success/20 text-success font-semibold';
  };

  const getClicksClass = (clicks: number) => {
    // More clicks allowed = better (healthier margin)
    if (clicks < 10) return 'bg-destructive/20 text-destructive font-semibold';
    return 'bg-success/20 text-success font-semibold';
  };

  const getDiagnosticBadge = (diagnostico: string) => {
    switch (diagnostico) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/30">
            🟢 Óptimo
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/30">
            🟠 Ajustar
          </span>
        );
      case 'bad':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
            🔴 Riesgo
          </span>
        );
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Tabla de Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TRow className="bg-muted/50">
                  <TableHead className="font-heading font-semibold">Tipo</TableHead>
                  <TableHead className="font-heading font-semibold text-right">PVP</TableHead>
                  <TableHead className="font-heading font-semibold text-right">Regalías</TableHead>
                  <TableHead className="font-heading font-semibold text-right">Margen</TableHead>
                  <TableHead className="font-heading font-semibold text-right">Clics máx./Venta</TableHead>
                  <TableHead className="font-heading font-semibold text-center">Estado</TableHead>
                  <TableHead className="font-heading font-semibold">Recomendación</TableHead>
                </TRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TRow 
                    key={idx} 
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.tipo === 'eBook' ? (
                          <BookOpen className="h-4 w-4 text-secondary" />
                        ) : (
                          <Book className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium">{row.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.pvp.toFixed(2)}{currencySymbol}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={row.regalias > 0 ? 'text-success' : 'text-destructive'}>
                        {row.regalias.toFixed(2)}{currencySymbol}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded ${getMarginClass(row.margen)}`}>
                        {row.margen.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded ${getClicksClass(row.clicsPorVenta)}`}>
                        {row.clicsPorVenta}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {getDiagnosticBadge(row.diagnostico)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate" title={row.recomendacion}>
                        {row.recomendacion}
                      </p>
                    </TableCell>
                  </TRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Completa los datos de eBook y/o Paperback para ver la tabla comparativa
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span>Margen &gt; 40% / ≥10 clics máx.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning"></span>
            <span>Margen 30-40% / =10 clics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive"></span>
            <span>Margen &lt; 30% / &lt;10 clics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
