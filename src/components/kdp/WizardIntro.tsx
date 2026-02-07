import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Calculator, DollarSign, TrendingUp, MousePointer, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export const WizardIntro = () => {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(!isMobile);

  const items = [
    {
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      text: 'Regalías del libro (según PVP y condiciones de impresión)',
    },
    {
      icon: <Target className="h-4 w-4 text-destructive" />,
      text: 'PVP mínimo viable (para no ir en negativo)',
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-success" />,
      text: 'Rentabilidad objetivo (BACOS)',
    },
    {
      icon: <Calculator className="h-4 w-4 text-secondary" />,
      text: 'CPC máximo rentable (límite para pujar sin cargarte el margen)',
    },
    {
      icon: <MousePointer className="h-4 w-4 text-warning" />,
      text: 'Conversión mínima viable: clics máximos permitidos por venta en Amazon Ads para no perder dinero',
    },
  ];

  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-secondary/15 rounded-lg shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-secondary" />
        </div>
        <div className="space-y-1 flex-1">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Configura tu libro antes de producirlo
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Define límites de rentabilidad con datos: costes, PVP, regalías y márgenes. Así sabes si el libro es viable antes de invertir tiempo y dinero.
          </p>
        </div>
      </div>

      {/* "¿Qué calcula?" toggle */}
      <Accordion
        type="single"
        collapsible
        defaultValue={isMobile ? undefined : 'que-calcula'}
      >
        <AccordionItem value="que-calcula" className="border-none">
          <AccordionTrigger className="py-2 px-0 hover:no-underline text-sm font-medium text-secondary gap-2">
            ¿Qué calcula esta herramienta?
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground italic mb-3">
                Resultados aproximados para tomar decisiones.
              </p>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
