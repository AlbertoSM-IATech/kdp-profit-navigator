import { GlobalData, EbookData, PaperbackData } from '@/types/kdp';
import { Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepSummaryProps {
  globalData: GlobalData;
  ebookData: EbookData;
  paperbackData: PaperbackData;
  onEditStep: (step: number) => void;
}

const MARKETPLACE_LABEL: Record<string, string> = {
  ES: 'Amazon.es',
  COM: 'Amazon.com',
  DE: 'Amazon.de',
  FR: 'Amazon.fr',
  IT: 'Amazon.it',
  UK: 'Amazon.co.uk',
  CA: 'Amazon.ca',
  AU: 'Amazon.com.au',
  JP: 'Amazon.co.jp',
};

const INTERIOR_LABEL: Record<string, string> = {
  BN: 'Blanco y negro',
  COLOR_STANDARD: 'Color estándar',
  COLOR_PREMIUM: 'Color premium',
};

const SIZE_LABEL: Record<string, string> = {
  SMALL: 'Pequeño (≤ 6 × 9")',
  LARGE: 'Grande (> 6 × 9")',
};

interface RowProps {
  label: string;
  value: React.ReactNode;
}

const Row = ({ label, value }: RowProps) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground text-right">{value ?? '—'}</dd>
  </div>
);

interface SectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

const Section = ({ title, step, onEdit, children }: SectionProps) => (
  <section className="rounded-xl border border-border bg-card overflow-hidden">
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-3.5 w-3.5" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(step)}
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Editar
      </Button>
    </header>
    <dl className="px-5 py-3 divide-y divide-border/60">{children}</dl>
  </section>
);

export const StepSummary = ({ globalData, ebookData, paperbackData, onEditStep }: StepSummaryProps) => {
  const isEbook = globalData.selectedFormat === 'EBOOK';
  const currencySymbol = globalData.marketplace === 'COM' ? '$' : '€';

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Revisa los datos antes de calcular
        </h2>
        <p className="text-sm text-muted-foreground">
          Estos son los inputs con los que se generará tu análisis. Edita cualquier sección si necesitas
          ajustarla; cuando estés conforme, pulsa <strong className="text-foreground">Siguiente</strong>{' '}
          para ver los resultados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Formato" step={0} onEdit={onEditStep}>
          <Row label="Tipo de libro" value={isEbook ? 'eBook' : 'Formato impreso'} />
        </Section>

        <Section title="Mercado y publicidad" step={1} onEdit={onEditStep}>
          <Row
            label="Marketplace"
            value={globalData.marketplace ? MARKETPLACE_LABEL[globalData.marketplace] : '—'}
          />
          <Row
            label="Coste por clic (CPC)"
            value={globalData.cpc !== null ? `${currencySymbol}${globalData.cpc.toFixed(2)}` : '—'}
          />
          <Row
            label="Ventas diarias competencia"
            value={
              globalData.ventasDiariasCompetencia !== null
                ? `${globalData.ventasDiariasCompetencia}/día`
                : '—'
            }
          />
          <Row
            label="Margen objetivo"
            value={
              globalData.margenObjetivoPct !== null ? `${globalData.margenObjetivoPct}%` : '—'
            }
          />
        </Section>

        <Section title="Datos del libro" step={2} onEdit={onEditStep}>
          {isEbook ? (
            <>
              <Row
                label="Precio de venta"
                value={ebookData.pvp !== null ? `${currencySymbol}${ebookData.pvp.toFixed(2)}` : '—'}
              />
              <Row label="Tasa de regalías" value={`${ebookData.royaltyRate}%`} />
              <Row
                label="Tamaño del archivo"
                value={ebookData.tamanoMb !== null ? `${ebookData.tamanoMb} MB` : '—'}
              />
              <Row label="IVA aplicado" value={`${ebookData.ivaType}%`} />
            </>
          ) : (
            <>
              <Row
                label="Interior"
                value={paperbackData.interior ? INTERIOR_LABEL[paperbackData.interior] : '—'}
              />
              <Row
                label="Tamaño"
                value={paperbackData.size ? SIZE_LABEL[paperbackData.size] : '—'}
              />
              <Row label="Páginas" value={paperbackData.pages ?? '—'} />
              <Row
                label="Precio de venta"
                value={
                  paperbackData.pvp !== null ? `${currencySymbol}${paperbackData.pvp.toFixed(2)}` : '—'
                }
              />
              <Row
                label="Formato"
                value={paperbackData.bookFormat === 'HARDCOVER' ? 'Tapa dura' : 'Tapa blanda'}
              />
              <Row label="IVA aplicado" value={`${paperbackData.ivaType}%`} />
            </>
          )}
        </Section>

        <Section title="¿Qué pasa al continuar?" step={3} onEdit={() => {}}>
          <div className="py-2 space-y-2 text-sm text-muted-foreground">
            <p>Se calcularán los siguientes resultados con los inputs anteriores:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Regalías estimadas y margen publicitario (BACOS).</li>
              <li>Precio mínimo viable y CPC máximo rentable.</li>
              <li>Clics máximos por venta y diagnóstico de viabilidad.</li>
              <li>Score global con desglose y recomendaciones.</li>
            </ul>
          </div>
        </Section>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Los resultados son estimaciones orientativas basadas en los datos introducidos.
      </p>
    </div>
  );
};
