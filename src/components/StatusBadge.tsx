import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeviceStatus } from '@/lib/types';
import { statusLabels } from '@/lib/mock-data';

const statusColors: Record<DeviceStatus, string> = {
  in_use: 'bg-success/15 text-success border-success/30',
  reserve: 'bg-info/15 text-info border-info/30',
  decommissioned: 'bg-muted text-muted-foreground border-border',
  repair: 'bg-warning/15 text-warning border-warning/30',
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <Badge variant="outline" className={cn('font-medium', statusColors[status])}>
      {statusLabels[status]}
    </Badge>
  );
}
