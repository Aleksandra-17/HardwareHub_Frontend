import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Laptop, Monitor as MonitorIcon, Printer, Server, Wifi, Projector } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { statusLabels } from '@/lib/labels';
import { DeviceStatus } from '@/lib/types';
import DeviceFormDialog from '@/components/DeviceFormDialog';

const typeIcons: Record<string, React.ElementType> = {
  'Ноутбук': Laptop, 'ПК': MonitorIcon, 'МФУ': Printer, 'Принтер': Printer,
  'Проектор': Projector, 'Монитор': MonitorIcon, 'Коммутатор': Wifi, 'Сервер': Server,
};

export default function DevicesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'all');
  const [locationFilter, setLocationFilter] = useState<string>(searchParams.get('location') || 'all');
  const [personFilter, setPersonFilter] = useState<string>(searchParams.get('person') || 'all');
  const [dialogOpen, setDialogOpen] = useState(searchParams.get('action') === 'add');
  const [sortField, setSortField] = useState<string>('inventoryNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices', { search, statusFilter, typeFilter, locationFilter, personFilter, sortField, sortDir }],
    queryFn: () =>
      api.getDevices({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        location: locationFilter !== 'all' ? locationFilter : undefined,
        person: personFilter !== 'all' ? personFilter : undefined,
        sort: sortField,
        order: sortDir,
      }),
  });

  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => api.getDeviceTypes(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople(),
  });

  const filtered = devices;

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th className="text-left pb-3 font-medium cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(field)}>
      {children} {sortField === field && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );

  if (devicesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Устройства</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted border-0" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-muted border-0"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] bg-muted border-0"><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {deviceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[160px] bg-muted border-0"><SelectValue placeholder="Кабинет" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все кабинеты</SelectItem>
            {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <SortHeader field="inventoryNumber">Инв. №</SortHeader>
                  <SortHeader field="name">Название</SortHeader>
                  <th className="text-left pb-3 font-medium">Тип</th>
                  <th className="text-left pb-3 font-medium">Кабинет</th>
                  <th className="text-left pb-3 font-medium">Ответственный</th>
                  <SortHeader field="status">Статус</SortHeader>
                  <SortHeader field="commissionDate">Дата ввода</SortHeader>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const dt = deviceTypes.find(t => t.id === d.deviceTypeId);
                  const loc = locations.find(l => l.id === d.locationId);
                  const per = people.find(p => p.id === d.personId);
                  const Icon = dt ? typeIcons[dt.name] || MonitorIcon : MonitorIcon;
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{d.inventoryNumber}</td>
                      <td className="py-3 px-4">
                        <Link to={`/devices/${d.id}`} className="flex items-center gap-2 text-primary hover:underline">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          {d.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{dt?.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{loc?.name || '—'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{per?.fullName || '—'}</td>
                      <td className="py-3 px-4"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-4 text-muted-foreground">{d.commissionDate}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Устройства не найдены</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DeviceFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
