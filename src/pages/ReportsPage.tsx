import { useState } from 'react';
import { FileDown, ClipboardList, FileSpreadsheet } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [inventoryForm, setInventoryForm] = useState({
    locationId: '',
    personId: '',
    startDate: '',
    endDate: '',
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });
  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople(),
  });

  const csvExportMutation = useMutation({
    mutationFn: () => api.exportDevices('csv'),
    onSuccess: () => toast.success('CSV экспортирован'),
    onError: (err: Error) => toast.error(err.message),
  });

  const excelExportMutation = useMutation({
    mutationFn: () => api.exportDevices('excel'),
    onSuccess: () => toast.success('Excel экспортирован'),
    onError: (err: Error) => toast.error(err.message),
  });

  const inventoryMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.generateInventoryReport(data),
    onSuccess: () => {
      toast.success('Акт инвентаризации сформирован');
      setInventoryForm({ locationId: '', personId: '', startDate: '', endDate: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inventoryMutation.mutate(inventoryForm);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Отчёты и инвентаризация</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileDown className="h-5 w-5" />Выгрузка списка устройств</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5" />Акт инвентаризации</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleInventorySubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Кабинет</Label>
              <Select value={inventoryForm.locationId} onValueChange={v => setInventoryForm(f => ({ ...f, locationId: v }))}>
                <SelectTrigger><SelectValue placeholder="Выберите кабинет" /></SelectTrigger>
                <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ответственное лицо</Label>
              <Select value={inventoryForm.personId} onValueChange={v => setInventoryForm(f => ({ ...f, personId: v }))}>
                <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{people.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={inventoryForm.startDate}
                onChange={e => setInventoryForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Дата окончания</Label>
              <Input
                type="date"
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
