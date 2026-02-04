import { Book, Store, FileText, BarChart3, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps: boolean[];
}

const stepIcons = [
  { Icon: Book, label: 'Formato' },
  { Icon: Store, label: 'Mercado' },
  { Icon: FileText, label: 'Libro' },
  { Icon: BarChart3, label: 'Resultados' },
];

export const WizardProgress = ({ steps, currentStep, completedSteps }: WizardProgressProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;
        const { Icon } = stepIcons[index];

        return (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            {/* Step box */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300",
                  isActive && "bg-primary border-primary shadow-lg shadow-primary/20",
                  isPast && "bg-primary/10 border-primary",
                  !isActive && !isPast && "bg-muted border-border"
                )}
              >
                {isPast ? (
                  <Check className={cn("h-5 w-5", "text-primary")} />
                ) : (
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive && "text-primary-foreground",
                    !isActive && "text-muted-foreground"
                  )} />
                )}
              </div>
              <div className="mt-2 text-center">
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-primary",
                  isPast && "text-foreground",
                  !isActive && !isPast && "text-muted-foreground"
                )}>
                  {index + 1}. {step}
                </span>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-3">
                <div
                  className={cn(
                    "h-0.5 transition-all duration-300",
                    isPast ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
