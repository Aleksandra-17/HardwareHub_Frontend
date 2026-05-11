import { useState } from 'react';
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
import type { License } from '@/lib/types';

export default function LicensesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<License | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    expiresAt: '',
    details: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    expiresAt: '',
    details: '',
  });

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: () => api.getLicenses(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLicense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Лицензия добавлена');
      setDialogOpen(false);
      setForm({ name: '', price: '', expiresAt: '', details: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateLicense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Лицензия обновлена');
      setEditTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      toast.success('Лицензия удалена');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Укажите название лицензии');
      return;
    }
    createMutation.mutate({
      name: form.name.trim(),
      price: Number(form.price),
      expiresAt: form.expiresAt,
      details: form.details.trim() || undefined,
    });
  };

  const openEdit = (item: License) => {
    setEditTarget(item);
    setEditForm({
      name: item.name,
      price: String(item.price ?? ''),
      expiresAt: item.expiresAt,
      details: item.details ?? '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm.name.trim()) {
      toast.error('Укажите название лицензии');
      return;
    }
    updateMutation.mutate({
      id: editTarget.id,
      data: {
        name: editForm.name.trim(),
        price: Number(editForm.price),
        expiresAt: editForm.expiresAt,
        details: editForm.details.trim() || undefined,
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
        <h1 className="text-2xl font-bold">Лицензии</h1>
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
                <th className="text-center px-4 py-3 font-medium align-middle">Стоимость</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Срок</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Подробности</th>
                <th className="w-24 px-2 py-3 align-middle" />
              </tr>
            </thead>
            <tbody>
              {licenses.map((item: License) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 group">
                  <td className="px-4 py-3 align-middle font-medium">
                    <span className="inline-flex items-center justify-center gap-2 w-full">
                      <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {item.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center align-middle tabular-nums">
                    {Number(item.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{item.expiresAt}</td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{item.details || '—'}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => openEdit(item)}
                        disabled={updateMutation.isPending}
                        title="Изменить"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        disabled={deleteMutation.isPending}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Лицензии не добавлены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить лицензию</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Microsoft 365 Business Standard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Стоимость *</Label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Срок *</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Подробности</Label>
              <Textarea
                rows={3}
                value={form.details}
                onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                placeholder="API ключ, ссылка на кабинет поставщика, комментарий..."
              />
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
            <DialogTitle>Редактировать лицензию</DialogTitle>
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
              <Label>Стоимость *</Label>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={editForm.price}
                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Срок *</Label>
              <Input
                type="date"
                value={editForm.expiresAt}
                onChange={e => setEditForm(f => ({ ...f, expiresAt: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Подробности</Label>
              <Textarea
                rows={3}
                value={editForm.details}
                onChange={e => setEditForm(f => ({ ...f, details: e.target.value }))}
                placeholder="API ключ, ссылка на кабинет поставщика, комментарий..."
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить лицензию?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `Вы уверены, что хотите удалить «${deleteTarget.name}»?`}
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
