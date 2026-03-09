import { FileDown, ClipboardList, FileSpreadsheet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });
  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople(),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Отчёты и инвентаризация</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileDown className="h-5 w-5" />Выгрузка списка устройств</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={() => toast.info('Экспорт CSV (демо)')}><FileSpreadsheet className="h-4 w-4 mr-2" />Экспорт в CSV</Button>
          <Button variant="outline" onClick={() => toast.info('Экспорт Excel (демо)')}><FileSpreadsheet className="h-4 w-4 mr-2" />Экспорт в Excel</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5" />Акт инвентаризации</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Кабинет</Label>
            <Select><SelectTrigger><SelectValue placeholder="Выберите кабинет" /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ответственное лицо</Label>
            <Select><SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>{people.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Дата начала</Label><Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Дата окончания</Label><Input type="date" />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={() => toast.info('Акт сформирован (демо)')}>Сформировать акт</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
