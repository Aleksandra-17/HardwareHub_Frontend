import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Wrench, QrCode } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';
import type { AuditEntry, Device } from '@/lib/types';
import { toast } from 'sonner';

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

  const sendToRepairMutation = useMutation({
    mutationFn: () => api.updateDevice(id!, { status: 'repair' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['deviceAudit', id] });
      toast.success('Устройство отправлено на ремонт');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const scrappedMutation = useMutation({
    mutationFn: () => api.updateDevice(id!, { status: 'scrapped' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      queryClient.invalidateQueries({ queryKey: ['deviceAudit', id] });
      toast.success('Устройство списано');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const qrCodeMutation = useMutation({
    mutationFn: () => api.generateQRCode(id!),
    onSuccess: () => toast.success('QR-код сгенерирован'),
    onError: (err: Error) => toast.error(err.message),
  });

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

  const dt = deviceTypes.find(t => t.id === device.deviceTypeId);
  const loc = locations.find(l => l.id === device.locationId);
  const per = people.find(p => p.id === device.personId);

  const fields: [string, string][] = [
    ['Инвентарный №', device.inventoryNumber],
    ['Тип', dt?.name ?? '—'],
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => sendToRepairMutation.mutate()}
          disabled={sendToRepairMutation.isPending}
        >
          <Wrench className="h-4 w-4 mr-1" />
          {sendToRepairMutation.isPending ? 'Отправка…' : 'На ремонт'}
        </Button>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => qrCodeMutation.mutate()}
          disabled={qrCodeMutation.isPending}
        >
          <QrCode className="h-4 w-4 mr-1" />
          {qrCodeMutation.isPending ? 'Генерация…' : 'QR-код'}
        </Button>
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
    </div>
  );
}
