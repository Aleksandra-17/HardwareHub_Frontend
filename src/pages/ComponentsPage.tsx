import { useState } from 'react';
import { Cpu, Pencil, Plus, Trash2, Unplug } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { componentTypeLabels, statusLabels } from '@/lib/labels';
import type { Component, ComponentType } from '@/lib/types';

const componentTypes = Object.keys(componentTypeLabels) as ComponentType[];

export default function ComponentsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Component | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Component | null>(null);
  const [form, setForm] = useState({
    name: '',
    componentType: 'cpu' as ComponentType,
    status: 'in_use',
    arrivalDate: '',
    expiryDate: '',
    notes: '',
  });
  const [editForm, setEditForm] = useState(form);

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['components'],
    queryFn: () => api.getComponents(),
  });
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.getDevices(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Комплектующая добавлена');
      setDialogOpen(false);
      setForm({
        name: '',
        componentType: 'cpu',
        status: 'in_use',
        arrivalDate: '',
        expiryDate: '',
        notes: '',
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.updateComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Комплектующая обновлена');
      setEditTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Комплектующая удалена');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const detachMutation = useMutation({
    mutationFn: (id: string) => api.detachComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      queryClient.invalidateQueries({ queryKey: ['device'] });
      toast.success('Комплектующая отвязана');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      arrivalDate: form.arrivalDate || undefined,
      expiryDate: form.expiryDate || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const openEdit = (item: Component) => {
    setEditTarget(item);
    setEditForm({
      name: item.name,
      componentType: item.componentType,
      status: item.status,
      arrivalDate: item.arrivalDate ?? '',
      expiryDate: item.expiryDate ?? '',
      notes: item.notes ?? '',
    });
  };

  const onEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    updateMutation.mutate({
      id: editTarget.id,
      data: {
        ...editForm,
        arrivalDate: editForm.arrivalDate || undefined,
        expiryDate: editForm.expiryDate || undefined,
        notes: editForm.notes.trim() || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Комплектующие</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-center px-4 py-3 font-medium align-middle">Название</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Тип</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Статус</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Привязка к ПК</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Срок прибытия</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Срок годности</th>
                <th className="w-32 px-2 py-3 align-middle" />
              </tr>
            </thead>
            <tbody>
              {components.map((item: Component) => {
                const device = devices.find(d => d.id === item.linkedComputerId);
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 group">
                    <td className="px-4 py-3 align-middle">
                      <span className="inline-flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">{componentTypeLabels[item.componentType]}</td>
                    <td className="px-4 py-3 text-center align-middle">{statusLabels[item.status]}</td>
                    <td className="px-4 py-3 text-center align-middle text-muted-foreground">{device?.name ?? 'Не привязано'}</td>
                    <td className="px-4 py-3 text-center align-middle text-muted-foreground">{item.arrivalDate ?? '—'}</td>
                    <td className="px-4 py-3 text-center align-middle text-muted-foreground">{item.expiryDate ?? '—'}</td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex justify-center gap-1">
                        {item.linkedComputerId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => detachMutation.mutate(item.id)}
                            title="Отвязать от ПК"
                          >
                            <Unplug className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={() => openEdit(item)}
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {components.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Комплектующие еще не добавлены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Добавить комплектующую</DialogTitle></DialogHeader>
          <form onSubmit={onCreateSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Тип *</Label>
              <Select value={form.componentType} onValueChange={(v: ComponentType) => setForm(f => ({ ...f, componentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {componentTypes.map(v => <SelectItem key={v} value={v}>{componentTypeLabels[v]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус *</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Срок прибытия</Label>
              <Input type="date" value={form.arrivalDate} onChange={e => setForm(f => ({ ...f, arrivalDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Срок годности</Label>
              <Input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Примечания</Label>
              <Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Сохранение…' : 'Сохранить'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Редактировать комплектующую</DialogTitle></DialogHeader>
          <form onSubmit={onEditSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Тип *</Label>
              <Select value={editForm.componentType} onValueChange={(v: ComponentType) => setEditForm(f => ({ ...f, componentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {componentTypes.map(v => <SelectItem key={v} value={v}>{componentTypeLabels[v]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус *</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Срок прибытия</Label>
              <Input type="date" value={editForm.arrivalDate} onChange={e => setEditForm(f => ({ ...f, arrivalDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Срок годности</Label>
              <Input type="date" value={editForm.expiryDate} onChange={e => setEditForm(f => ({ ...f, expiryDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Примечания</Label>
              <Textarea rows={2} value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>Отмена</Button>
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Сохранение…' : 'Сохранить'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить комплектующую?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `Вы уверены, что хотите удалить «${deleteTarget.name}»?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
