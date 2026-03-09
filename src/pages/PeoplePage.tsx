import { Link } from 'react-router-dom';
import { Users, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { people } from '@/lib/mock-data';
import { Plus } from 'lucide-react';

export default function PeoplePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ответственные</h1>
        <Button><Plus className="h-4 w-4 mr-2" />Добавить</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map(p => (
          <Card key={p.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                  {p.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <Link to={`/devices?person=${p.id}`} className="font-semibold text-primary hover:underline block truncate">{p.fullName}</Link>
                  <p className="text-sm text-muted-foreground">{p.position}</p>
                  <p className="text-xs text-muted-foreground">{p.department}</p>
                  <div className="flex flex-col gap-1 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{p.deviceCount} устройств</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
