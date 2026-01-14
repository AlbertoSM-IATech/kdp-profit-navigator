import { PRICING_TABLE } from '@/data/printingCosts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface PrintingCostsTableProps {
  embedded?: boolean;
}

export const PrintingCostsTable = ({ embedded = false }: PrintingCostsTableProps) => {
  const formatCurrency = (value: number, currency: string) => {
    if (value === 0) return '—';
    if (currency === 'JPY') return `¥${value}`;
    return `${value.toFixed(currency === 'EUR' || currency === 'GBP' ? 2 : 3)}`;
  };

  if (embedded) {
    return renderContent();
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Costes de Impresión KDP - Todos los Marketplaces
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Fuente oficial:{' '}
          <a 
            href="https://kdp.amazon.com/es_ES/help/topic/G201834340" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            kdp.amazon.com
          </a>
        </p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );

  function renderContent() {
    return (
      <Tabs defaultValue="bn" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="bn" className="text-xs">B/N (Tinta Negra)</TabsTrigger>
          <TabsTrigger value="cp" className="text-xs">Color Premium</TabsTrigger>
          <TabsTrigger value="cs" className="text-xs">Color Estándar</TabsTrigger>
        </TabsList>

          {/* B/N Tab */}
          <TabsContent value="bn">
            <div className="text-xs text-muted-foreground mb-2">
              24-108 páginas: solo importe fijo | 110-828 páginas: fijo + por página
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Marketplace</TableHead>
                    <TableHead className="text-xs text-center" colSpan={2}>Tamaño Normal</TableHead>
                    <TableHead className="text-xs text-center" colSpan={2}>Tamaño Grande</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs"></TableHead>
                    <TableHead className="text-xs">24-108</TableHead>
                    <TableHead className="text-xs">110+ (fijo + /pág)</TableHead>
                    <TableHead className="text-xs">24-108</TableHead>
                    <TableHead className="text-xs">110+ (fijo + /pág)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRICING_TABLE.map((row) => (
                    <TableRow key={row.marketplace}>
                      <TableCell className="text-xs font-medium">
                        {row.marketplace}
                        <span className="text-muted-foreground ml-1">({row.currency})</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.bnSmallFixed24_108, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.bnSmallFixed110_828, row.currency)} + {formatCurrency(row.bnSmallPerPage, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.bnLargeFixed24_108, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.bnLargeFixed110_828, row.currency)} + {formatCurrency(row.bnLargePerPage, row.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Color Premium Tab */}
          <TabsContent value="cp">
            <div className="text-xs text-muted-foreground mb-2">
              24-40 páginas: solo importe fijo | 42-828 páginas: fijo + por página
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Marketplace</TableHead>
                    <TableHead className="text-xs text-center" colSpan={2}>Tamaño Normal</TableHead>
                    <TableHead className="text-xs text-center" colSpan={2}>Tamaño Grande</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-xs"></TableHead>
                    <TableHead className="text-xs">24-40</TableHead>
                    <TableHead className="text-xs">42+ (fijo + /pág)</TableHead>
                    <TableHead className="text-xs">24-40</TableHead>
                    <TableHead className="text-xs">42+ (fijo + /pág)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRICING_TABLE.map((row) => (
                    <TableRow key={row.marketplace}>
                      <TableCell className="text-xs font-medium">
                        {row.marketplace}
                        <span className="text-muted-foreground ml-1">({row.currency})</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.cpSmallFixed24_40, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.cpSmallFixed42_828, row.currency)} + {formatCurrency(row.cpSmallPerPage, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.cpLargeFixed24_40, row.currency)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatCurrency(row.cpLargeFixed42_828, row.currency)} + {formatCurrency(row.cpLargePerPage, row.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Color Estándar Tab */}
          <TabsContent value="cs">
            <div className="text-xs text-muted-foreground mb-2">
              Solo disponible para 72-600 páginas
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Marketplace</TableHead>
                    <TableHead className="text-xs">Disponible</TableHead>
                    <TableHead className="text-xs">Normal (fijo + /pág)</TableHead>
                    <TableHead className="text-xs">Grande (fijo + /pág)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRICING_TABLE.map((row) => (
                    <TableRow key={row.marketplace}>
                      <TableCell className="text-xs font-medium">
                        {row.marketplace}
                        <span className="text-muted-foreground ml-1">({row.currency})</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.csAvailable ? (
                          <Badge variant="outline" className="text-xs">Sí</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.csAvailable 
                          ? `${formatCurrency(row.csSmallFixed, row.currency)} + ${formatCurrency(row.csSmallPerPage, row.currency)}`
                          : '—'
                        }
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.csAvailable 
                          ? `${formatCurrency(row.csLargeFixed, row.currency)} + ${formatCurrency(row.csLargePerPage, row.currency)}`
                          : '—'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </TabsContent>
      </Tabs>
    );
  }
};
