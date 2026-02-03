import { Check } from 'lucide-react';

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps: boolean[];
}

export const WizardProgress = ({ steps, currentStep, completedSteps }: WizardProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = completedSteps[index];
          const isPast = index < currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${isActive 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : isCompleted || isPast
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground border-2 border-border'
                    }
                  `}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={`
                    mt-2 text-xs font-medium transition-colors duration-300 text-center
                    ${isActive ? 'text-primary' : isPast || isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 mx-2 transition-colors duration-300
                    ${isPast || (isCompleted && index < currentStep) 
                      ? 'bg-primary' 
                      : 'bg-border'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
