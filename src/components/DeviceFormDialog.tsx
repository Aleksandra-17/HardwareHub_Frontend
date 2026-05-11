import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { componentTypeLabels, statusLabels } from '@/lib/labels';
import type { ComponentType, DeviceType, Location, Person, Workstation as WorkstationType } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Значение селекта, когда ответственный не выбран (в API поле опционально). */
const NO_PERSON_VALUE = '__no_person__';
/** Когда место явно не выбрано (предупреждение без блокировки). */
const NO_WORKSTATION_VALUE = '__no_workstation__';
const COMPONENT_ORDER: ComponentType[] = ['cpu', 'motherboard', 'ram', 'storage', 'psu', 'gpu', 'case', 'cooler'];

type ComponentDraft = {
  componentType: ComponentType;
  name: string;
  status: string;
  arrivalDate: string;
  expiryDate: string;
  notes: string;
};

function emptyComponents(): ComponentDraft[] {
  return COMPONENT_ORDER.map(componentType => ({
    componentType,
    name: '',
    status: 'in_use',
    arrivalDate: '',
    expiryDate: '',
    notes: '',
  }));
}

const DETACHED_STATUSES = new Set(['archived', 'scrapped']);

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
    workstationId: '',
    personId: '',
    commissionDate: '',
    purchasePrice: '',
    purchaseDate: '',
    notes: '',
  });
  const [components, setComponents] = useState<ComponentDraft[]>(emptyComponents());

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
  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations', formData.locationId],
    queryFn: () => api.getWorkstations(formData.locationId),
    enabled: !!formData.locationId,
  });

  const selectedDeviceType = deviceTypes.find(t => t.id === formData.deviceTypeId);
  const supportsComponentsHost = (() => {
    if (!selectedDeviceType) return false;
    const code = (selectedDeviceType.code ?? '').toUpperCase();
    const name = (selectedDeviceType.name ?? '').trim().toLowerCase();
    return code === 'PC' || code === 'SRV' || name === 'пк' || name === 'сервер';
  })();
  const statusDetachesLocation = DETACHED_STATUSES.has(formData.status);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { purchasePrice, personId, commissionDate, purchaseDate, workstationId, ...rest } = formData;
      const created = await api.createDevice({
        ...rest,
        ...(workstationId ? { workstationId } : {}),
        ...(purchasePrice ? { purchasePrice: Number(purchasePrice) } : {}),
        ...(personId ? { personId } : {}),
        ...(commissionDate ? { commissionDate } : {}),
        ...(purchaseDate ? { purchaseDate } : {}),
      });
      if (supportsComponentsHost) {
        const readyComponents = components.filter(c => c.name.trim().length > 0);
        for (const component of readyComponents) {
          await api.createComponent({
            name: component.name.trim(),
            componentType: component.componentType,
            status: component.status,
            arrivalDate: component.arrivalDate || undefined,
            expiryDate: component.expiryDate || undefined,
            notes: component.notes.trim() || undefined,
            linkedComputerId: created.id,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
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
        workstationId: '',
        personId: '',
        commissionDate: '',
        purchasePrice: '',
        purchaseDate: '',
        notes: '',
      });
      setComponents(emptyComponents());
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusDetachesLocation && formData.status === 'in_use' && !formData.locationId) {
      toast.error('Для статуса «В эксплуатации» выберите кабинет');
      return;
    }
    if (formData.locationId && !formData.workstationId) {
      toast.warning(
        'Кабинет выбран без рабочего места. Рекомендуется указать позже в карточке устройства.',
        { duration: 6000 },
      );
    }
    createMutation.mutate();
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
            <Select
              value={formData.status}
              onValueChange={v =>
                setFormData(f => ({
                  ...f,
                  status: v,
                  ...(DETACHED_STATUSES.has(v) ? { locationId: '', workstationId: '' } : {}),
                }))
              }
              required
            >
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
            <Label>Кабинет {statusDetachesLocation ? '' : '*'}</Label>
            <Select
              value={formData.locationId}
              onValueChange={v =>
                setFormData(f => ({ ...f, locationId: v, workstationId: '' }))
              }
              disabled={statusDetachesLocation}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    statusDetachesLocation
                      ? 'Для archived/scrapped кабинет не указывается'
                      : 'Выберите кабинет'
                  }
                />
              </SelectTrigger>
              <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Рабочее место</Label>
            <Select
              value={formData.workstationId || NO_WORKSTATION_VALUE}
              onValueChange={v =>
                setFormData(f => ({
                  ...f,
                  workstationId: v === NO_WORKSTATION_VALUE ? '' : v,
                }))
              }
              disabled={!formData.locationId || statusDetachesLocation}
            >
              <SelectTrigger><SelectValue placeholder={formData.locationId ? 'Выберите место' : 'Сначала кабинет'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_WORKSTATION_VALUE}>Не указано</SelectItem>
                {workstations.map((w: WorkstationType) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.seatCode}
                    {w.employeeInternalEmail ? ` (${w.employeeInternalEmail})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Управление списком мест — на странице «Кабинеты», кнопка с иконкой слоёв в строке кабинета.
            </p>
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
          {supportsComponentsHost && (
            <div className="sm:col-span-2 space-y-3 rounded-md border border-border p-3">
              <div>
                <h3 className="font-medium">Комплектующие</h3>
                <p className="text-xs text-muted-foreground">
                  Укажите детали сборки. Заполняются только позиции, которые нужно завести сейчас.
                </p>
              </div>
              <div className="space-y-3">
                {components.map((item, idx) => (
                  <div key={item.componentType} className="grid gap-2 rounded-md border border-border/60 p-2 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{componentTypeLabels[item.componentType]}</Label>
                      <Input
                        placeholder="Название комплектующей"
                        value={item.name}
                        onChange={e =>
                          setComponents(prev => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Статус</Label>
                      <Select
                        value={item.status}
                        onValueChange={v =>
                          setComponents(prev => prev.map((p, i) => (i === idx ? { ...p, status: v } : p)))
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Срок прибытия</Label>
                      <Input
                        type="date"
                        value={item.arrivalDate}
                        onChange={e =>
                          setComponents(prev => prev.map((p, i) => (i === idx ? { ...p, arrivalDate: e.target.value } : p)))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Срок годности</Label>
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={e =>
                          setComponents(prev => prev.map((p, i) => (i === idx ? { ...p, expiryDate: e.target.value } : p)))
                        }
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Примечания</Label>
                      <Textarea
                        rows={2}
                        value={item.notes}
                        onChange={e =>
                          setComponents(prev => prev.map((p, i) => (i === idx ? { ...p, notes: e.target.value } : p)))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
