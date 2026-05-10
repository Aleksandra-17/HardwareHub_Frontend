import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Person } from '@/lib/types';

export default function PeoplePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    position: '',
    department: '',
    email: '',
    phone: '',
  });

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: () => api.getPeople(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Ответственный добавлен');
      setDialogOpen(false);
      setForm({ fullName: '', position: '', department: '', email: '', phone: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      toast.success('Ответственный удалён');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Укажите ФИО');
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ответственные</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((p: Person) => (
          <Card key={p.id} className="hover:border-primary/30 transition-colors group">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                    {p.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/devices?person=${p.id}`} className="font-semibold text-primary hover:underline block truncate">{p.fullName}</Link>
                    <p className="text-sm text-muted-foreground">{p.position}</p>
                    <p className="text-xs text-muted-foreground">{p.department}</p>
                    <div className="flex flex-col gap-1 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" />{p.email || '—'}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{p.phone || '—'}</span>
                    </div>
                    <p className="mt-3 text-sm font-medium">{p.deviceCount} устройств</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(p)}
                  disabled={deleteMutation.isPending}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить ответственного</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>ФИО *</Label>
              <Input
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Должность</Label>
              <Input
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                placeholder="Системный администратор"
              />
            </div>
            <div className="space-y-2">
              <Label>Отдел</Label>
              <Input
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="IT-отдел"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="ivanov@company.ru"
              />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+7 (999) 111-22-33"
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
            <AlertDialogTitle>Удалить ответственного?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Вы уверены, что хотите удалить «{deleteTarget.fullName}»?
                  {deleteTarget.deviceCount > 0 && (
                    <span className="block mt-2 text-amber-600 dark:text-amber-500">
                      У этого ответственного {deleteTarget.deviceCount} устройств. Возможно, их нужно переназначить.
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
