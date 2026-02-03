import { FormatType } from '@/types/kdp';
import { BookOpen, Book } from 'lucide-react';

interface StepFormatProps {
  selectedFormat: FormatType | null;
  onFormatChange: (format: FormatType) => void;
}

export const StepFormat = ({ selectedFormat, onFormatChange }: StepFormatProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ¿Qué formato quieres analizar?
        </h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de libro para calcular su viabilidad en Amazon KDP
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* eBook Card */}
        <button
          onClick={() => onFormatChange('EBOOK')}
          className={`
            group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
            hover:shadow-lg hover:scale-[1.02]
            ${selectedFormat === 'EBOOK' 
              ? 'border-secondary bg-secondary/10 shadow-md' 
              : 'border-border bg-card hover:border-secondary/50'
            }
          `}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div 
              className={`
                p-4 rounded-xl transition-colors duration-300
                ${selectedFormat === 'EBOOK' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-secondary/10 text-secondary group-hover:bg-secondary/20'
                }
              `}
            >
              <BookOpen className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">📘 eBook</h3>
              <p className="text-sm text-muted-foreground">
                Libro digital con regalías del 35% o 70%
              </p>
            </div>
          </div>
          
          {selectedFormat === 'EBOOK' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        {/* Paperback Card */}
        <button
          onClick={() => onFormatChange('PAPERBACK')}
          className={`
            group relative p-8 rounded-2xl border-2 transition-all duration-300 text-left
            hover:shadow-lg hover:scale-[1.02]
            ${selectedFormat === 'PAPERBACK' 
              ? 'border-primary bg-primary/10 shadow-md' 
              : 'border-border bg-card hover:border-primary/50'
            }
          `}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div 
              className={`
                p-4 rounded-xl transition-colors duration-300
                ${selectedFormat === 'PAPERBACK' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                }
              `}
            >
              <Book className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">📚 Formato impreso</h3>
              <p className="text-sm text-muted-foreground">
                Tapa blanda o dura con costes de impresión
              </p>
            </div>
          </div>
          
          {selectedFormat === 'PAPERBACK' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
