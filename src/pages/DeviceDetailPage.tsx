import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Edit, Trash2, Wrench, QrCode } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';
import { componentTypeLabels } from '@/lib/labels';
import type { AuditEntry, ComponentType, Device } from '@/lib/types';
import { toast } from 'sonner';

function downloadDataUriPng(dataUri: string, filename: string): void {
  void fetch(dataUri)
    .then(r => r.blob())
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    })
    .catch(() => toast.error('Не удалось подготовить файл для скачивания'));
}

function displayText(v: string | null | undefined): string {
  return v != null && v !== '' ? v : '—';
}

function formatMoney(v: Device['purchasePrice']): string {
  if (v == null || v === '') return '—';
  const n = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(n) ? `${n.toLocaleString('ru-RU')} ₽` : '—';
}

export default function DeviceDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [rebuildOpen, setRebuildOpen] = useState(false);
  const [qrPreviewOpen, setQrPreviewOpen] = useState(false);
  const [qrPreviewUri, setQrPreviewUri] = useState<string | null>(null);
  const [selectedByType, setSelectedByType] = useState<Record<string, string>>({});

  const { data: device, isLoading: deviceLoading, isError, error } = useQuery({
    queryKey: ['device', id],
    queryFn: () => api.getDevice(id!),
    enabled: !!id,
  });

  const { data: audit = [], isLoading: auditLoading } = useQuery({
    queryKey: ['deviceAudit', id],
    queryFn: () => api.getDeviceAudit(id!),
    enabled: !!id,
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
  const { data: allComponents = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => api.getComponents(),
  });

  const applyDeviceUpdate = (updated: Device) => {
    queryClient.setQueryData(['device', id], updated);
    void queryClient.invalidateQueries({ queryKey: ['devices'] });
    void queryClient.invalidateQueries({ queryKey: ['deviceAudit', id] });
  };

  const sendToRepairMutation = useMutation({
    mutationFn: () => api.updateDevice(id!, { status: 'repair' }),
    onSuccess: updated => {
      applyDeviceUpdate(updated);
      toast.success('Устройство отправлено на ремонт');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const returnToUseMutation = useMutation({
    mutationFn: () => api.updateDevice(id!, { status: 'in_use' }),
    onSuccess: updated => {
      applyDeviceUpdate(updated);
      toast.success('Устройство возвращено в эксплуатацию');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const scrappedMutation = useMutation({
    mutationFn: () => api.updateDevice(id!, { status: 'scrapped' }),
    onSuccess: updated => {
      applyDeviceUpdate(updated);
      toast.success('Устройство списано');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const qrCodeMutation = useMutation({
    mutationFn: () => api.generateQRCode(id!),
    onSuccess: data => {
      setQrPreviewUri(data.qrCode);
      setQrPreviewOpen(true);
      toast.success('QR-код готов');
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const rebuildMutation = useMutation({
    mutationFn: (items: Array<{ componentId: string; componentType: string }>) => api.rebuildDevice(id!, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
      queryClient.invalidateQueries({ queryKey: ['deviceAudit', id] });
      toast.success('Сборка ПК обновлена');
      setRebuildOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const dt = deviceTypes.find(t => t.id === device?.deviceTypeId);
  const isComponentsHost = (() => {
    if (!dt) return false;
    const code = (dt.code ?? '').toUpperCase();
    const name = (dt.name ?? '').trim().toLowerCase();
    return code === 'PC' || code === 'SRV' || name === 'пк' || name === 'сервер';
  })();
  const slots = Object.keys(componentTypeLabels) as ComponentType[];
  useEffect(() => {
    if (!device?.components) return;
    const next: Record<string, string> = {};
    for (const comp of device.components) next[comp.componentType] = comp.id;
    setSelectedByType(next);
  }, [device?.id, device?.components]);

  if (deviceLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (isError) {
    const msg = error instanceof ApiError ? String(error.message) : 'Не удалось загрузить устройство';
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-center max-w-md">{msg}</p>
        <Button variant="ghost" asChild className="mt-4"><Link to="/devices">← Назад к списку</Link></Button>
      </div>
    );
  }

  if (!device) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-muted-foreground">Устройство не найдено</p>
      <Button variant="ghost" asChild className="mt-4"><Link to="/devices">← Назад</Link></Button>
    </div>
  );

  const dtLive = deviceTypes.find(t => t.id === device.deviceTypeId);
  const loc = locations.find(l => l.id === device.locationId);
  const per = people.find(p => p.id === device.personId);

  const deviceStatus = device.status;
  const isInUse = deviceStatus === 'in_use';
  const isRepair = deviceStatus === 'repair';
  const isTerminal = deviceStatus === 'scrapped' || deviceStatus === 'archived';

  const fields: [string, string][] = [
    ['Инвентарный №', device.inventoryNumber],
    ['Тип', dtLive?.name ?? '—'],
    ['Серийный №', displayText(device.serialNumber)],
    ['Модель', displayText(device.model)],
    ['Производитель', displayText(device.manufacturer)],
    ['Кабинет', loc?.name ?? '—'],
    ['Рабочее место', displayText(device.workstationSeatCode ?? null)],
    ['Ответственный', per?.fullName ?? '—'],
    ['Дата ввода', displayText(device.commissionDate)],
    ['Последняя проверка', displayText(device.lastCheckDate)],
    ['Стоимость', formatMoney(device.purchasePrice)],
    ['Дата покупки', displayText(device.purchaseDate)],
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/devices"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{device.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">{device.inventoryNumber}</p>
        </div>
        <StatusBadge status={device.status} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled><Edit className="h-4 w-4 mr-1" />Редактировать</Button>
        {isInUse && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendToRepairMutation.mutate()}
            disabled={sendToRepairMutation.isPending}
          >
            <Wrench className="h-4 w-4 mr-1" />
            {sendToRepairMutation.isPending ? 'Отправка…' : 'На ремонт'}
          </Button>
        )}
        {isRepair && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => returnToUseMutation.mutate()}
            disabled={returnToUseMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {returnToUseMutation.isPending ? 'Возврат…' : 'Вернуть в эксплуатацию'}
          </Button>
        )}
        {(isInUse || isRepair) && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => scrappedMutation.mutate()}
            disabled={scrappedMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {scrappedMutation.isPending ? 'Списание…' : 'Списать'}
          </Button>
        )}
        {!isTerminal && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => qrCodeMutation.mutate()}
            disabled={qrCodeMutation.isPending}
          >
            <QrCode className="h-4 w-4 mr-1" />
            {qrCodeMutation.isPending ? 'Генерация…' : 'QR-код'}
          </Button>
        )}
        {isComponentsHost && isInUse && (
          <Button variant="outline" size="sm" onClick={() => setRebuildOpen(true)}>
            Пересобрать ПК
          </Button>
        )}
      </div>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Информация</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="text-center">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {device.notes && (
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="mb-2 text-xs text-muted-foreground">Примечания</p>
              <p className="mx-auto max-w-lg text-center">{device.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isComponentsHost && (
        <Card>
          <CardHeader><CardTitle className="text-base">Комплектующие</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-center px-3 py-3 font-medium align-middle">Тип</th>
                  <th className="text-center px-3 py-3 font-medium align-middle">Название</th>
                  <th className="text-center px-3 py-3 font-medium align-middle">Статус</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => {
                  const comp = device.components?.find(c => c.componentType === slot);
                  return (
                    <tr key={slot} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 text-center align-middle">{componentTypeLabels[slot]}</td>
                      <td className="px-3 py-3 text-center align-middle">{comp?.name ?? '—'}</td>
                      <td className="px-3 py-3 text-center align-middle text-muted-foreground">{comp ? comp.status : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Audit */}
      <Card>
        <CardHeader><CardTitle className="text-base">История изменений</CardTitle></CardHeader>
        <CardContent>
          {auditLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-center px-3 py-3 font-medium align-middle">Дата</th>
                  <th className="text-center px-3 py-3 font-medium align-middle">Действие</th>
                  <th className="text-center px-3 py-3 font-medium align-middle">Пользователь</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a: AuditEntry) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 text-center align-middle text-muted-foreground">{a.date}</td>
                    <td className="px-3 py-3 text-center align-middle">{a.action}</td>
                    <td className="px-3 py-3 text-center align-middle text-muted-foreground">{a.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={qrPreviewOpen}
        onOpenChange={open => {
          setQrPreviewOpen(open);
          if (!open) setQrPreviewUri(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR-код устройства</DialogTitle>
          </DialogHeader>
          {qrPreviewUri ? (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border border-border bg-white p-3">
                <img src={qrPreviewUri} alt="QR-код" className="h-48 w-48 object-contain" width={192} height={192} />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Содержит инвентарный номер: <span className="font-mono">{device.inventoryNumber}</span>
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  const safe = device.inventoryNumber.replace(/[^\w.-]+/g, '_') || 'device';
                  downloadDataUriPng(qrPreviewUri, `qr-${safe}.png`);
                }}
              >
                Скачать PNG
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={rebuildOpen} onOpenChange={setRebuildOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Пересборка ПК</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            {slots.map(slot => {
              const options = allComponents.filter(
                c => c.componentType === slot && (!c.linkedComputerId || c.linkedComputerId === device.id),
              );
              return (
                <div key={slot} className="space-y-1.5">
                  <Label>{componentTypeLabels[slot]}</Label>
                  <Select
                    value={selectedByType[slot] || '__none__'}
                    onValueChange={v =>
                      setSelectedByType(prev => ({
                        ...prev,
                        [slot]: v === '__none__' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Не выбрано" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Не установлено</SelectItem>
                      {options.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setRebuildOpen(false)}>Отмена</Button>
              <Button
                type="button"
                disabled={rebuildMutation.isPending}
                onClick={() => {
                  const items = slots
                    .map(slot => ({ componentId: selectedByType[slot], componentType: slot }))
                    .filter(x => !!x.componentId) as Array<{ componentId: string; componentType: string }>;
                  rebuildMutation.mutate(items);
                }}
              >
                {rebuildMutation.isPending ? 'Сохранение…' : 'Сохранить сборку'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
