import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { locations } from '@/lib/mock-data';

export default function LocationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Кабинеты</h1>
        <Button><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left pb-3 px-4 font-medium">Кабинет</th>
                <th className="text-left pb-3 px-4 font-medium">Здание</th>
                <th className="text-left pb-3 px-4 font-medium">Этаж</th>
                <th className="text-left pb-3 px-4 font-medium">Описание</th>
                <th className="text-left pb-3 px-4 font-medium">Устройств</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <Link to={`/devices?location=${l.id}`} className="flex items-center gap-2 text-primary hover:underline">
                      <MapPin className="h-4 w-4 text-muted-foreground" />{l.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{l.building}</td>
                  <td className="py-3 px-4 text-muted-foreground">{l.floor}</td>
                  <td className="py-3 px-4 text-muted-foreground">{l.description}</td>
                  <td className="py-3 px-4 font-semibold">{l.deviceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
