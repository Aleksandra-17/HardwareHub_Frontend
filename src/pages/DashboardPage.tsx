import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Wrench, Archive, AlertTriangle, Users, MapPin, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { devices, deviceTypes, locations, people, statusLabels } from '@/lib/mock-data';
import { DeviceStatus } from '@/lib/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['hsl(171,65%,46%)', 'hsl(210,75%,58%)', 'hsl(220,10%,55%)', 'hsl(38,92%,55%)'];

export default function DashboardPage() {
  const stats = useMemo(() => {
    const byStatus = { in_use: 0, reserve: 0, decommissioned: 0, repair: 0 };
    let noResponsible = 0, noLocation = 0;
    devices.forEach(d => {
      byStatus[d.status]++;
      if (!d.personId) noResponsible++;
      if (!d.locationId) noLocation++;
    });
    return { total: devices.length, byStatus, noResponsible, noLocation };
  }, []);

  const statusData = Object.entries(stats.byStatus).map(([key, value]) => ({
    name: statusLabels[key], value
  }));

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    devices.forEach(d => {
      const dt = deviceTypes.find(t => t.id === d.deviceTypeId);
      if (dt) map[dt.name] = (map[dt.name] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, []);

  const recentDevices = [...devices].sort((a, b) => b.commissionDate.localeCompare(a.commissionDate)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Обзор учёта техники</p>
        </div>
        <Button asChild>
          <Link to="/devices?action=add"><Plus className="h-4 w-4 mr-2" />Добавить устройство</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Всего устройств" value={stats.total} icon={Monitor} />
        <StatCard title="В эксплуатации" value={stats.byStatus.in_use} icon={Monitor} iconClassName="bg-success/10 text-success" />
        <StatCard title="На ремонте" value={stats.byStatus.repair} icon={Wrench} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Без ответственного" value={stats.noResponsible} icon={AlertTriangle} iconClassName="bg-destructive/10 text-destructive" description="Требуют назначения" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">По статусам</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(220,18%,11%)', border: 'none', borderRadius: 8, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: 'hsl(171,65%,55%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">По типам техники</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'hsl(220,10%,55%)' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220,18%,11%)', border: 'none', borderRadius: 8, color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: 'hsl(171,65%,55%)' }}
                />
                <Bar dataKey="count" fill="hsl(171,65%,46%)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent devices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Последние добавленные</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/devices">Все устройства →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Инв. №</th>
                  <th className="text-left pb-2 font-medium">Название</th>
                  <th className="text-left pb-2 font-medium">Статус</th>
                  <th className="text-left pb-2 font-medium">Дата ввода</th>
                </tr>
              </thead>
              <tbody>
                {recentDevices.map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-mono text-xs">{d.inventoryNumber}</td>
                    <td className="py-2.5">
                      <Link to={`/devices/${d.id}`} className="text-primary hover:underline">{d.name}</Link>
                    </td>
                    <td className="py-2.5"><StatusBadge status={d.status} /></td>
                    <td className="py-2.5 text-muted-foreground">{d.commissionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
