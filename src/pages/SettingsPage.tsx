import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const roles = [
  { name: 'Администратор', description: 'Полный доступ ко всем функциям системы, управление пользователями и настройками', level: 'full' },
  { name: 'Инвентаризатор', description: 'Добавление и редактирование устройств, проведение инвентаризации, формирование отчётов', level: 'mid' },
  { name: 'Просмотр', description: 'Только просмотр списка устройств и отчётов, без возможности изменения данных', level: 'low' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-5 w-5" />Роли и доступ</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left pb-2 font-medium">Роль</th>
                <th className="text-left pb-2 font-medium">Уровень</th>
                <th className="text-left pb-2 font-medium">Описание</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.name} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3">
                    <Badge variant={r.level === 'full' ? 'default' : 'secondary'}>
                      {r.level === 'full' ? 'Полный' : r.level === 'mid' ? 'Средний' : 'Базовый'}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
