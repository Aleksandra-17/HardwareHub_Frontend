import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { DeviceType, Location, Workstation, WorkstationRequirement } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
}

type ReqDraft = { deviceTypeId: string; quantity: number };

const emptyDraft = (): ReqDraft[] => [];

export default function WorkstationsDialog({ open, onOpenChange, location }: Props) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [seatCode, setSeatCode] = useState('');
  const [email, setEmail] = useState('');
  const [reqDrafts, setReqDrafts] = useState<ReqDraft[]>(emptyDraft());

  const locId = location?.id ?? '';

  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => api.getDeviceTypes() as Promise<DeviceType[]>,
    enabled: open,
  });

  const { data: workstations = [], isLoading } = useQuery({
    queryKey: ['workstations', locId],
    queryFn: () => api.getWorkstations(locId),
    enabled: open && !!locId,
  });

  useEffect(() => {
    if (!open) {
      setCreating(false);
      setEditingId(null);
      resetForm();
    }
  }, [open]);

  function resetForm() {
    setSeatCode('');
    setEmail('');
    setReqDrafts(emptyDraft());
  }

  function normRequirements(list: ReqDraft[]): { deviceTypeId: string; quantity: number }[] {
    return list
      .filter(r => r.deviceTypeId.trim())
      .map(r => ({ deviceTypeId: r.deviceTypeId.trim(), quantity: Math.max(1, r.quantity) }));
  }

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createWorkstation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workstations', locId] });
      toast.success('Рабочее место добавлено');
      setCreating(false);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.updateWorkstation(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workstations', locId] });
      toast.success('Сохранено');
      setEditingId(null);
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteWorkstation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workstations', locId] });
      toast.success('Удалено');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (w: Workstation) => {
    setEditingId(w.id);
    setCreating(false);
    setSeatCode(w.seatCode);
    setEmail(w.employeeInternalEmail ?? '');
    const rows: ReqDraft[] = (w.requirements ?? []).length
      ? w.requirements!.map(r => ({ deviceTypeId: r.deviceTypeId, quantity: r.quantity }))
      : [{ deviceTypeId: '', quantity: 1 }];
    setReqDrafts(rows);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locId || !seatCode.trim()) {
      toast.error('Укажите номер места');
      return;
    }
    createMutation.mutate({
      locationId: locId,
      seatCode: seatCode.trim(),
      employeeInternalEmail: email.trim() || undefined,
      requirements: normRequirements(reqDrafts).map(r => ({ deviceTypeId: r.deviceTypeId, quantity: r.quantity })),
    });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !seatCode.trim()) {
      toast.error('Укажите номер места');
      return;
    }
    updateMutation.mutate({
      id: editingId,
      body: {
        seatCode: seatCode.trim(),
        employeeInternalEmail: email.trim() || undefined,
        requirements: normRequirements(reqDrafts).map(r => ({ deviceTypeId: r.deviceTypeId, quantity: r.quantity })),
      },
    });
  };

  function renderRequirementsSummary(reqs: WorkstationRequirement[] | undefined) {
    if (!reqs?.length) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex flex-wrap justify-center gap-1">
        {reqs.map(r => (
          <Badge key={r.id} variant="outline" className="text-xs font-normal">
            {(r.deviceTypeName || r.deviceTypeId).slice(0, 22)}
            ×{r.quantity}
          </Badge>
        ))}
      </div>
    );
  }

  const formBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Рабочие места{location ? ` — ${location.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        {creating || editingId ? (
          <form onSubmit={editingId ? submitEdit : submitCreate} className="space-y-4 border rounded-lg p-4">
            <h3 className="font-medium">{editingId ? 'Изменить место' : 'Новое место'}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Номер места *</Label>
                <Input value={seatCode} onChange={e => setSeatCode(e.target.value)} placeholder="1, А3, стол-02…" />
              </div>
              <div className="space-y-1.5">
                <Label>Внутренняя почта сотрудника</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ivanov@corp.local" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Необходимое оборудование (тип × количество)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setReqDrafts(r => [...r, { deviceTypeId: '', quantity: 1 }])}>
                  <Plus className="h-4 w-4 mr-1" />Строка
                </Button>
              </div>
              {!reqDrafts.length && (
                <p className="text-xs text-muted-foreground">Можно оставить пустым или добавить требования по справочнику типов.</p>
              )}
              <div className="space-y-2">
                {reqDrafts.map((row, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={row.deviceTypeId || undefined} onValueChange={v => setReqDrafts(rs => rs.map((x, j) => j === i ? { ...x, deviceTypeId: v } : x))}>
                        <SelectTrigger><SelectValue placeholder="Тип техники" /></SelectTrigger>
                        <SelectContent>{deviceTypes.map(dt => <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={e => setReqDrafts(rs => rs.map((x, j) => j === i ? { ...x, quantity: Math.max(1, Number(e.target.value) || 1) } : x))}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setReqDrafts(rs => rs.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => { setCreating(false); setEditingId(null); resetForm(); }}>
                Отмена
              </Button>
              <Button type="submit" disabled={formBusy}>{formBusy ? 'Сохранение…' : 'Сохранить'}</Button>
            </div>
          </form>
        ) : (
          <Button type="button" className="mb-4" onClick={() => { setCreating(true); setReqDrafts([{ deviceTypeId: '', quantity: 1 }]); }}>
            <Plus className="h-4 w-4 mr-2" />Добавить место
          </Button>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-center py-2 px-2">Место</th>
                <th className="text-center py-2 px-2">Почта</th>
                <th className="text-center py-2 px-2">Требования</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {workstations.map(w => (
                <tr key={w.id} className="border-b border-border">
                  <td className="py-2 px-2 text-center font-medium">{w.seatCode}</td>
                  <td className="py-2 px-2 text-center text-muted-foreground text-xs">{w.employeeInternalEmail || '—'}</td>
                  <td className="py-2 px-2 align-top">{renderRequirementsSummary(w.requirements)}</td>
                  <td className="py-2 px-2">
                    <div className="flex justify-center gap-1">
                      <Button type="button" variant="ghost" size="icon" title="Изменить" onClick={() => startEdit(w)} disabled={!!creating || !!editingId}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" title="Удалить" disabled={deleteMutation.isPending} onClick={() => {
                        if (confirm(`Удалить место «${w.seatCode}»?`)) deleteMutation.mutate(w.id);
                      }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {workstations.length === 0 && !creating && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Нет рабочих мест</td></tr>
              )}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}
