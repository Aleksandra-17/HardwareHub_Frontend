import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { deviceTypes, locations, people, statusLabels } from '@/lib/mock-data';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeviceFormDialog({ open, onOpenChange }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Устройство сохранено (демо)');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить устройство</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Инвентарный номер *</Label>
            <Input placeholder="INV-2024-XXX" required />
          </div>
          <div className="space-y-1.5">
            <Label>Наименование *</Label>
            <Input placeholder="Ноутбук Lenovo ThinkPad…" required />
          </div>
          <div className="space-y-1.5">
            <Label>Тип устройства *</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
              <SelectContent>{deviceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Статус *</Label>
            <Select defaultValue="in_use">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Серийный номер</Label>
            <Input placeholder="SN-XXX-XXX" />
          </div>
          <div className="space-y-1.5">
            <Label>Модель</Label>
            <Input />
          </div>
          <div className="space-y-1.5">
            <Label>Производитель</Label>
            <Input />
          </div>
          <div className="space-y-1.5">
            <Label>Кабинет *</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Выберите кабинет" /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ответственный *</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Выберите ответственного" /></SelectTrigger>
              <SelectContent>{people.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Дата ввода в эксплуатацию</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Стоимость (₽)</Label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Дата покупки</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Примечания</Label>
            <Textarea rows={2} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
