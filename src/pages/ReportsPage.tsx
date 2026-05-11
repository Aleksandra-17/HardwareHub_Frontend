import { useState } from 'react';
import { FileDown, ClipboardList, FileSpreadsheet, Cpu, KeyRound } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, saveReportBlob } from '@/lib/api';
import { toast } from 'sonner';

interface InventoryReportResult {
  documentNumber?: string;
  deviceCount?: number;
  startDate?: string;
  endDate?: string;
}

export default function ReportsPage() {
  const [inventoryForm, setInventoryForm] = useState({
    locationId: '',
    personId: '',
    startDate: '',
    endDate: '',
  });
  const [exportLocationId, setExportLocationId] = useState('');
  const [exportPersonId, setExportPersonId] = useState('');
  const [componentsLocationId, setComponentsLocationId] = useState('');

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });
  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople(),
  });

  const csvExportMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadDevicesExport('csv', {
        ...(exportLocationId ? { locationId: exportLocationId } : {}),
        ...(exportPersonId ? { personId: exportPersonId } : {}),
      });
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('CSV скачан'),
    onError: (err: Error) => toast.error(err.message),
  });

  const excelExportMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadDevicesExport('xlsx', {
        ...(exportLocationId ? { locationId: exportLocationId } : {}),
        ...(exportPersonId ? { personId: exportPersonId } : {}),
      });
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('Excel скачан'),
    onError: (err: Error) => toast.error(err.message),
  });

  const licensesCsvMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadLicensesExport('csv');
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('Лицензии (CSV) скачаны'),
    onError: (err: Error) => toast.error(err.message),
  });

  const licensesXlsxMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadLicensesExport('xlsx');
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('Лицензии (Excel) скачаны'),
    onError: (err: Error) => toast.error(err.message),
  });

  const componentsCsvMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadComponentsExport('csv', {
        ...(componentsLocationId ? { locationId: componentsLocationId } : {}),
      });
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('Комплектующие (CSV) скачаны'),
    onError: (err: Error) => toast.error(err.message),
  });

  const componentsXlsxMutation = useMutation({
    mutationFn: async () => {
      const { blob, filename } = await api.downloadComponentsExport('xlsx', {
        ...(componentsLocationId ? { locationId: componentsLocationId } : {}),
      });
      saveReportBlob(blob, filename);
    },
    onSuccess: () => toast.success('Комплектующие (Excel) скачаны'),
    onError: (err: Error) => toast.error(err.message),
  });

  const inventoryMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.generateInventoryReport(data),
    onSuccess: (data: InventoryReportResult) => {
      const n = data.deviceCount ?? 0;
      toast.success('Акт инвентаризации сформирован', {
        description: `${data.documentNumber ?? ''} · ${n} ед. · период ${data.startDate ?? ''} — ${data.endDate ?? ''}`,
      });
      setInventoryForm({ locationId: '', personId: '', startDate: '', endDate: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.locationId || !inventoryForm.personId || !inventoryForm.startDate || !inventoryForm.endDate) {
      toast.error('Заполните кабинет, ответственное лицо и период дат');
      return;
    }
    inventoryMutation.mutate(inventoryForm);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Отчёты и инвентаризация</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileDown className="h-5 w-5" />Выгрузка списка устройств</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            В выгрузку входят тип, категория типа (в т.ч. периферия), кабинет, рабочее место и остальные поля учёта.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Фильтр по кабинету</Label>
              <Select value={exportLocationId || '__all__'} onValueChange={v => setExportLocationId(v === '__all__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Все кабинеты" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Все кабинеты</SelectItem>
                  {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Фильтр по ответственному</Label>
              <Select value={exportPersonId || '__all__'} onValueChange={v => setExportPersonId(v === '__all__' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Все</SelectItem>
                  {people.map((p: { id: string; fullName: string }) => (
                    <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => csvExportMutation.mutate()}
              disabled={csvExportMutation.isPending}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {csvExportMutation.isPending ? 'Экспорт…' : 'Экспорт в CSV'}
            </Button>
            <Button
              variant="outline"
              onClick={() => excelExportMutation.mutate()}
              disabled={excelExportMutation.isPending}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {excelExportMutation.isPending ? 'Экспорт…' : 'Экспорт в Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-5 w-5" />Лицензии</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => licensesCsvMutation.mutate()} disabled={licensesCsvMutation.isPending}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {licensesCsvMutation.isPending ? 'Экспорт…' : 'CSV'}
          </Button>
          <Button variant="outline" onClick={() => licensesXlsxMutation.mutate()} disabled={licensesXlsxMutation.isPending}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {licensesXlsxMutation.isPending ? 'Экспорт…' : 'Excel'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cpu className="h-5 w-5" />Комплектующие</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 max-w-sm">
            <Label>Только кабинет хоста (опционально)</Label>
            <Select value={componentsLocationId || '__all__'} onValueChange={v => setComponentsLocationId(v === '__all__' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Все кабинеты</SelectItem>
                {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => componentsCsvMutation.mutate()} disabled={componentsCsvMutation.isPending}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {componentsCsvMutation.isPending ? 'Экспорт…' : 'CSV'}
            </Button>
            <Button variant="outline" onClick={() => componentsXlsxMutation.mutate()} disabled={componentsXlsxMutation.isPending}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {componentsXlsxMutation.isPending ? 'Экспорт…' : 'Excel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5" />Акт инвентаризации</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Список устройств «в эксплуатации» по выбранному кабинету и ответственному; в акте указываются тип техники и рабочее место.
          </p>
          <form onSubmit={handleInventorySubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Кабинет *</Label>
              <Select value={inventoryForm.locationId} onValueChange={v => setInventoryForm(f => ({ ...f, locationId: v }))} required>
                <SelectTrigger><SelectValue placeholder="Выберите кабинет" /></SelectTrigger>
                <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ответственное лицо *</Label>
              <Select value={inventoryForm.personId} onValueChange={v => setInventoryForm(f => ({ ...f, personId: v }))} required>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{people.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Дата начала *</Label>
              <Input
                type="date"
                required
                value={inventoryForm.startDate}
                onChange={e => setInventoryForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Дата окончания *</Label>
              <Input
                type="date"
                required
                value={inventoryForm.endDate}
                onChange={e => setInventoryForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={inventoryMutation.isPending}>
                {inventoryMutation.isPending ? 'Формирование…' : 'Сформировать акт'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
