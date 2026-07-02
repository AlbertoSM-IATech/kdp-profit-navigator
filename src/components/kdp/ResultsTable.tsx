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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LayoutGrid, BookOpen, Book } from 'lucide-react';

interface ResultsTableProps {
  data: TableRow[];
  globalData: GlobalData;
  embedded?: boolean;
}

export const ResultsTable = ({ data, globalData, embedded = false }: ResultsTableProps) => {
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  const getMarginTier = (margin: number) => {
    if (margin < 30) return 'destructive';
    if (margin <= 40) return 'warning';
    return 'success';
  };

  const getClicksTier = (clicks: number) => {
    if (clicks >= 13) return 'success';
    if (clicks >= 11) return 'warning';
    return 'destructive';
  };

  const tierDot: Record<string, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  };
  const tierText: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const getDiagnosticBadge = (diagnostico: string) => {
    switch (diagnostico) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Excelente
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            Aceptable
          </span>
        );
      case 'bad':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            En riesgo
          </span>
        );
    }
  };

  const renderContent = () => (
    data.length > 0 ? (
      <>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.06] shadow-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TRow className="bg-muted/40">
                  <TableHead className="font-heading font-semibold w-[140px] py-3">Tipo</TableHead>
                <TableHead className="font-heading font-semibold text-right w-[90px] py-3">PVP</TableHead>
                <TableHead className="font-heading font-semibold text-right w-[110px] py-3">Regalías</TableHead>
                <TableHead className="font-heading font-semibold text-right w-[180px] py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dashed border-muted-foreground/40">Margen publicitario (BACOS)</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs"><p className="text-xs">Porcentaje del precio de venta que puedes destinar a publicidad manteniendo rentabilidad.</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="font-heading font-semibold text-right w-[160px] py-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dashed border-muted-foreground/40">Clics máx./venta</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs"><p className="text-xs">Cuántos clics de Amazon Ads puedes pagar como máximo por cada venta para no perder dinero.</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="font-heading font-semibold text-center w-[120px] py-3">Estado</TableHead>
                <TableHead className="font-heading font-semibold py-3">Recomendación</TableHead>
              </TRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TRow
                  key={idx}
                  className="hover:bg-muted/30 transition-colors align-top"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      {row.tipo === 'eBook' ? (
                        <BookOpen className="h-4 w-4 text-secondary" />
                      ) : (
                        <Book className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">{row.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono py-3">
                    {row.pvp.toFixed(2)}{currencySymbol}
                  </TableCell>
                  <TableCell className="text-right font-mono py-3">
                    <span className={row.regalias > 0 ? 'text-success' : 'text-destructive'}>
                      {row.regalias.toFixed(2)}{currencySymbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold ${tierText[getMarginTier(row.margen)]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tierDot[getMarginTier(row.margen)]}`} />
                      {row.margen.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold ${tierText[getClicksTier(row.clicsMaxPorVenta)]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tierDot[getClicksTier(row.clicsMaxPorVenta)]}`} />
                      {row.clicsMaxPorVenta}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    {getDiagnosticBadge(row.diagnostico)}
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {row.recomendacion}
                    </p>
                  </TableCell>
                </TRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success"></span>
            <span>Margen &gt; 40% / ≥13 clics — Excelente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning"></span>
            <span>Margen 30-40% / 10-12 clics — Aceptable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive"></span>
            <span>Margen &lt; 30% / &lt;10 clics — En riesgo</span>
          </div>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Completa los datos del formato seleccionado para ver la tabla comparativa
        </p>
      </div>
    )
  );

  if (embedded) {
    return renderContent();
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="section-header">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Tabla de Resultados
        </CardTitle>
        <p className="text-sm text-muted-foreground">Resumen comparativo de métricas clave.</p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};
