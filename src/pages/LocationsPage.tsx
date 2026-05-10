import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Layers, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Location } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import WorkstationsDialog from '@/components/WorkstationsDialog';

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [workstationsLoc, setWorkstationsLoc] = useState<Location | null>(null);
  const [form, setForm] = useState({
    name: '',
    building: '',
    floor: '',
    description: '',
    workstationCapacity: 0,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    building: '',
    floor: '',
    description: '',
    workstationCapacity: 0,
  });

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Кабинет добавлен');
      setDialogOpen(false);
      setForm({ name: '', building: '', floor: '', description: '', workstationCapacity: 0 });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Кабинет обновлён');
      setEditTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Кабинет удалён');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Укажите название кабинета');
      return;
    }
    createMutation.mutate({
      ...form,
      building: form.building.trim() || undefined,
      floor: form.floor.trim() || undefined,
      description: form.description.trim() || undefined,
    });
  };

  const openEdit = (l: Location) => {
    setEditTarget(l);
    setEditForm({
      name: l.name,
      building: l.building ?? '',
      floor: l.floor ?? '',
      description: l.description ?? '',
      workstationCapacity: l.workstationCapacity ?? 0,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm.name.trim()) {
      toast.error('Укажите название кабинета');
      return;
    }
    updateMutation.mutate({
      id: editTarget.id,
      data: {
        name: editForm.name.trim(),
        building: editForm.building.trim() || undefined,
        floor: editForm.floor.trim() || undefined,
        description: editForm.description.trim() || undefined,
        workstationCapacity: editForm.workstationCapacity,
      },
    });
  };

  const handleDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Кабинеты</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-center px-4 py-3 font-medium align-middle">Кабинет</th>
                <th className="text-center px-2 py-3 font-medium align-middle w-[4.5rem]">Места</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Здание</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Этаж</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Описание</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Мест</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Всего устр.</th>
                <th className="text-center px-4 py-3 font-medium align-middle">ПК / ноут</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Не хватает</th>
                <th className="text-center px-2 py-3 font-medium align-middle w-10" title="План не закрыт техникой">
                  !
                </th>
                <th className="w-24 px-2 py-3 align-middle" />
              </tr>
            </thead>
            <tbody>
              {locations.map((l: Location) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/50 group">
                  <td className="px-4 py-3 align-middle font-medium">
                    <Link
                      to={`/devices?location=${l.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 text-primary hover:underline"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />{l.name}
                    </Link>
                  </td>
                  <td className="px-2 py-3 align-middle text-center">
                    <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" title="Рабочие места кабинета" onClick={() => setWorkstationsLoc(l)}>
                      <Layers className="h-4 w-4" />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.building || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.floor || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.description || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle font-semibold tabular-nums">
                    {l.workstationCapacity ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center align-middle tabular-nums">{l.deviceCount}</td>
                  <td className="px-4 py-3 text-center align-middle tabular-nums">
                    {l.computingDeviceCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center align-middle tabular-nums text-muted-foreground">
                    {(l.workstationCapacity ?? 0) > 0 ? l.workstationDeficit ?? 0 : '—'}
                  </td>
                  <td className="px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      {l.needsEquipment ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex text-amber-600 dark:text-amber-500 cursor-default">
                              <AlertTriangle className="h-4 w-4" aria-label="Недостаточно техники" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            План {l.workstationCapacity} рабочих мест; вычислительной техники{' '}
                            {l.computingDeviceCount ?? 0}. Не хватает {l.workstationDeficit ?? 0}.
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => openEdit(l)}
                        disabled={updateMutation.isPending}
                        title="Изменить"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(l)}
                        disabled={deleteMutation.isPending}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить кабинет</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Каб. 101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Здание / корпус</Label>
              <Input
                value={form.building}
                onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                placeholder="Корпус А"
              />
            </div>
            <div className="space-y-2">
              <Label>Этаж</Label>
              <Input
                value={form.floor}
                onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Приёмная"
              />
            </div>
            <div className="space-y-2">
              <Label>Рабочих мест (план)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={form.workstationCapacity}
                onChange={e =>
                  setForm(f => ({ ...f, workstationCapacity: Math.max(0, Number(e.target.value) || 0) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Сравниваем с числом устройств категории «вычислительная техника» (ноутбук, ПК…).
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Сохранение…' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать кабинет</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Здание / корпус</Label>
              <Input
                value={editForm.building}
                onChange={e => setEditForm(f => ({ ...f, building: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Этаж</Label>
              <Input
                value={editForm.floor}
                onChange={e => setEditForm(f => ({ ...f, floor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Рабочих мест (план)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={editForm.workstationCapacity}
                onChange={e =>
                  setEditForm(f => ({
                    ...f,
                    workstationCapacity: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>Отмена</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <WorkstationsDialog
        open={!!workstationsLoc}
        location={workstationsLoc}
        onOpenChange={o => {
          if (!o) setWorkstationsLoc(null);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить кабинет?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Вы уверены, что хотите удалить «{deleteTarget.name}»?
                  {deleteTarget.deviceCount > 0 && (
                    <span className="block mt-2 text-amber-600 dark:text-amber-500">
                      В этом кабинете {deleteTarget.deviceCount} устройств. Возможно, их нужно переназначить.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
