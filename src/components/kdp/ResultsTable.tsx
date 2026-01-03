import { TableRow, GlobalData } from '@/types/kdp';
import { Card, CardContent } from '@/components/ui/card';
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
    if (margin < 30) return 'bg-destructive/20 text-destructive';
    if (margin <= 40) return 'bg-warning/20 text-warning';
    return 'bg-success/20 text-success';
  };

  const getClicksClass = (clicks: number) => {
    if (clicks >= 13) return 'bg-success/20 text-success';
    if (clicks >= 10) return 'bg-warning/20 text-warning';
    return 'bg-destructive/20 text-destructive';
  };

  const getDiagnosticBadge = (diagnostico: string) => {
    const styles = {
      good: 'bg-success/15 text-success border-success/30',
      warning: 'bg-warning/15 text-warning border-warning/30',
      bad: 'bg-destructive/15 text-destructive border-destructive/30'
    };
    const labels = { good: '🟢', warning: '🟠', bad: '🔴' };
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${styles[diagnostico as keyof typeof styles]}`}>
        {labels[diagnostico as keyof typeof labels]}
      </span>
    );
  };

  if (data.length === 0) return null;

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Resumen</span>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TRow className="bg-muted/50">
                <TableHead className="text-xs font-medium py-2">Tipo</TableHead>
                <TableHead className="text-xs font-medium text-right py-2">PVP</TableHead>
                <TableHead className="text-xs font-medium text-right py-2">Regalía</TableHead>
                <TableHead className="text-xs font-medium text-right py-2">BACOS</TableHead>
                <TableHead className="text-xs font-medium text-right py-2">Clics</TableHead>
                <TableHead className="text-xs font-medium text-center py-2">Estado</TableHead>
              </TRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TRow key={idx} className="hover:bg-muted/30">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5">
                      {row.tipo === 'eBook' ? (
                        <BookOpen className="h-3 w-3 text-secondary" />
                      ) : (
                        <Book className="h-3 w-3 text-primary" />
                      )}
                      <span className="text-xs font-medium">{row.tipo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono py-2">
                    {row.pvp.toFixed(2)}{currencySymbol}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono py-2">
                    <span className={row.regalias > 0 ? 'text-success' : 'text-destructive'}>
                      {row.regalias.toFixed(2)}{currencySymbol}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getMarginClass(row.margen)}`}>
                      {row.margen.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getClicksClass(row.clicsMaxPorVenta)}`}>
                      {row.clicsMaxPorVenta}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-2">
                    {getDiagnosticBadge(row.diagnostico)}
                  </TableCell>
                </TRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
