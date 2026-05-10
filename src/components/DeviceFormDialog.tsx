import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { statusLabels } from '@/lib/labels';
import type { DeviceType, Location, Person } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Значение селекта, когда ответственный не выбран (в API поле опционально). */
const NO_PERSON_VALUE = '__no_person__';

export default function DeviceFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    inventoryNumber: '',
    name: '',
    deviceTypeId: '',
    status: 'in_use',
    serialNumber: '',
    model: '',
    manufacturer: '',
    locationId: '',
    personId: '',
    commissionDate: '',
    purchasePrice: '',
    purchaseDate: '',
    notes: '',
  });

  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => api.getDeviceTypes() as Promise<DeviceType[]>,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations() as Promise<Location[]>,
  });
  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople() as Promise<Person[]>,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Устройство сохранено');
      onOpenChange(false);
      setFormData({
        inventoryNumber: '',
        name: '',
        deviceTypeId: '',
        status: 'in_use',
        serialNumber: '',
        model: '',
        manufacturer: '',
        locationId: '',
        personId: '',
        commissionDate: '',
        purchasePrice: '',
        purchaseDate: '',
        notes: '',
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { purchasePrice, personId, commissionDate, purchaseDate, ...rest } = formData;
    createMutation.mutate({
      ...rest,
      ...(purchasePrice ? { purchasePrice: Number(purchasePrice) } : {}),
      ...(personId ? { personId } : {}),
      ...(commissionDate ? { commissionDate } : {}),
      ...(purchaseDate ? { purchaseDate } : {}),
    });
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
            <Input
              placeholder="INV-2024-XXX"
              value={formData.inventoryNumber}
              onChange={e => setFormData(f => ({ ...f, inventoryNumber: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Наименование *</Label>
            <Input
              placeholder="Ноутбук Lenovo ThinkPad…"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Тип устройства *</Label>
            <Select value={formData.deviceTypeId} onValueChange={v => setFormData(f => ({ ...f, deviceTypeId: v }))} required>
              <SelectTrigger><SelectValue placeholder="Выберите тип" /></SelectTrigger>
              <SelectContent>{deviceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Статус *</Label>
            <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v }))} required>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Серийный номер</Label>
            <Input
              placeholder="SN-XXX-XXX"
              value={formData.serialNumber}
              onChange={e => setFormData(f => ({ ...f, serialNumber: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Модель</Label>
            <Input
              value={formData.model}
              onChange={e => setFormData(f => ({ ...f, model: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Производитель</Label>
            <Input
              value={formData.manufacturer}
              onChange={e => setFormData(f => ({ ...f, manufacturer: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Кабинет *</Label>
            <Select value={formData.locationId} onValueChange={v => setFormData(f => ({ ...f, locationId: v }))} required>
              <SelectTrigger><SelectValue placeholder="Выберите кабинет" /></SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ответственный</Label>
            <Select
              value={formData.personId || NO_PERSON_VALUE}
              onValueChange={v =>
                setFormData(f => ({
                  ...f,
                  personId: v === NO_PERSON_VALUE ? '' : v,
                }))
              }
            >
              <SelectTrigger><SelectValue placeholder="Не назначен" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PERSON_VALUE}>Не назначен</SelectItem>
                {people.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Дата ввода в эксплуатацию</Label>
            <Input
              type="date"
              value={formData.commissionDate}
              onChange={e => setFormData(f => ({ ...f, commissionDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Стоимость (₽)</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.purchasePrice}
              onChange={e => setFormData(f => ({ ...f, purchasePrice: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Дата покупки</Label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={e => setFormData(f => ({ ...f, purchaseDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Примечания</Label>
            <Textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
