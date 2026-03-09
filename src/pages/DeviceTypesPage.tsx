import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { categoryLabels } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function DeviceTypesPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: deviceTypes = [], isLoading } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => api.getDeviceTypes(),
  });

  const filtered = useMemo(() =>
    deviceTypes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())),
    [deviceTypes, search],
  );

  if (isLoading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Виды техники</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted border-0" />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left pb-3 px-4 font-medium">Название</th>
                <th className="text-left pb-3 px-4 font-medium">Код</th>
                <th className="text-left pb-3 px-4 font-medium">Категория</th>
                <th className="text-left pb-3 px-4 font-medium">Устройств</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{t.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{t.code}</td>
                  <td className="py-3 px-4"><Badge variant="secondary">{categoryLabels[t.category]}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{t.deviceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить вид техники</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); toast.success('Тип сохранён (демо)'); setDialogOpen(false); }} className="grid gap-4">
            <div className="space-y-1.5"><Label>Название *</Label><Input required /></div>
            <div className="space-y-1.5"><Label>Код / стандарт</Label><Input /></div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select><SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                <SelectContent>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Описание</Label><Textarea rows={2} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Отмена</Button><Button type="submit">Сохранить</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
