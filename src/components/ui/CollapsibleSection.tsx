import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection = ({
  title,
  icon,
  description,
  isCollapsed,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) => {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader 
        className="pb-4 cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="section-header">
            {icon}
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>
        {description && !isCollapsed && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent>{children}</CardContent>
      )}
    </Card>
  );
};
