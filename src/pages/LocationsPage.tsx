import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2 } from 'lucide-react';
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

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [form, setForm] = useState({
    name: '',
    building: '',
    floor: '',
    description: '',
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
      setForm({ name: '', building: '', floor: '', description: '' });
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
    createMutation.mutate(form);
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
                <th className="text-center px-4 py-3 font-medium align-middle">Здание</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Этаж</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Описание</th>
                <th className="text-center px-4 py-3 font-medium align-middle">Устройств</th>
                <th className="w-10 px-2 py-3 align-middle" />
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
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.building || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.floor || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle text-muted-foreground">{l.description || '—'}</td>
                  <td className="px-4 py-3 text-center align-middle font-semibold">{l.deviceCount}</td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-center">
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
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Сохранение…' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
