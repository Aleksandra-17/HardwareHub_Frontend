import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { statusLabels } from '@/lib/labels';

const statusColors: Record<string, string> = {
  in_use: 'bg-success/15 text-success border-success/30',
  repair: 'bg-warning/15 text-warning border-warning/30',
  scrapped: 'bg-destructive/15 text-destructive border-destructive/30',
  archived: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: string }) {
  const label = statusLabels[status] ?? status;
  return (
    <Badge variant="outline" className={cn('font-medium', statusColors[status] ?? statusColors.archived)}>
      {label}
    </Badge>
  );
}
