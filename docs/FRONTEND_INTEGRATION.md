# Интеграция фронтенда с бэкендом API

Инструкция по подключению фронтенда HardwareHub к REST API бэкенда.

---

## Текущее состояние

Сейчас фронтенд работает с **mock-данными** (`src/lib/mock-data.ts`).

Добавлены:
- `src/lib/api.ts` — клиент для API с поддержкой JWT
- `src/lib/auth.ts` — управление токенами
- `.env.example` — шаблон переменных окружения

---

## Шаг 1: Настройка окружения

1. Создайте `.env` в корне проекта:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

2. При необходимости отредактируйте URL бэкенда.

---

## Шаг 2: Настройка бэкенда

Убедитесь, что бэкенд:
- Работает на `http://localhost:3000` (или указанный URL)
- Отдаёт API на `/api/*`
- Поддерживает CORS с фронтенда (`http://localhost:8080`)
- Реализует эндпоинты из [BACKEND_API.md](./BACKEND_API.md)

---

## Шаг 3: Миграция компонентов на API

### Принцип

Везде, где используется `mock-data`, заменить на вызов API через `useQuery` (React Query) или `async/await`.

### Пример: Dashboard

**Было (mock-данные):**
```typescript
import { devices, deviceTypes } from '@/lib/mock-data';

export default function DashboardPage() {
  const stats = useMemo(() => {
    // расчёты по devices
  }, []);
}
```

**Стало (API):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.getDevices(),
  });

  const { data: deviceTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => api.getDeviceTypes(),
  });

  if (devicesLoading || typesLoading) return <LoadingSpinner />;

  // расчёты по devices
}
```

### Список компонентов для миграции

| Компонент | Mock-источник | API-метод | Примечание |
|-----------|---------------|-----------|-----------|
| DashboardPage | `devices`, `deviceTypes`, `locations`, `people` | `getDevices()`, `getDeviceTypes()`, `getLocations()`, `getPeople()` | Несколько запросов → `useQueries()` или параллельные `useQuery` |
| DevicesPage | `devices`, `deviceTypes`, `locations`, `people` | `getDevices(params)` с фильтрами | Поддержка фильтрации уже в API |
| DeviceDetailPage | `devices`, `deviceTypes`, `locations`, `people`, `auditEntries` | `getDevice(id)`, `getDeviceAudit(id)` | Два запроса параллельно |
| DeviceTypesPage | `deviceTypes` | `getDeviceTypes()` | Простой запрос |
| LocationsPage | `locations` | `getLocations()` | Простой запрос |
| PeoplePage | `people` | `getPeople()` | Простой запрос |
| ReportsPage | `locations`, `people` | `getLocations()`, `getPeople()` + экспорт | Экспорт → window.open() на `api.exportDevices()` |
| DeviceFormDialog | mock-сохранение | `createDevice(data)`, `updateDevice(id, data)` | Оптимистичное обновление через React Query |

---

## Шаг 4: Обработка ошибок и loading

### Loading-состояние

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['devices'],
  queryFn: () => api.getDevices(),
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorAlert message={error.message} />;
```

### Обработка ошибок API

```typescript
import { ApiError } from '@/lib/api';

try {
  await api.createDevice(data);
  toast.success('Устройство добавлено');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      toast.error('Проверьте данные');
    } else {
      toast.error(error.message);
    }
  }
}
```

---

## Шаг 5: Аутентификация (JWT)

Если бэкенд требует логин:

1. Создайте страницу логина (`src/pages/LoginPage.tsx`):
   ```typescript
   import { useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { auth } from '@/lib/auth';

   export default function LoginPage() {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const navigate = useNavigate();

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       try {
         await auth.login(username, password);
         navigate('/');
       } catch (error) {
         console.error('Login failed:', error);
       }
     };

     return (
       <form onSubmit={handleSubmit}>
         <input value={username} onChange={(e) => setUsername(e.target.value)} />
         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
         <button type="submit">Вход</button>
       </form>
     );
   }
   ```

2. В `App.tsx` добавьте проверку авторизации:
   ```typescript
   import { auth } from '@/lib/auth';

   const isAuthenticated = auth.isAuthenticated();

   return isAuthenticated ? <AppRoutes /> : <LoginPage />;
   ```

3. Для обновления токена при 401 используйте interceptor в `api.ts`:
   ```typescript
   if (response.status === 401) {
     try {
       const refreshToken = localStorage.getItem('refresh_token');
       if (refreshToken) {
         await auth.refreshTokens();
         return request(endpoint, options); // повторить запрос
       }
     } catch {
       auth.clearTokens();
       window.location.href = '/login';
     }
   }
   ```

---

## Шаг 6: Экспорт и отчёты

**Для экспорта CSV/XLSX:**
```typescript
const handleExport = (format: 'csv' | 'xlsx') => {
  const url = api.exportDevices(format);
  window.open(url, '_blank');
};

// В компоненте:
<Button onClick={() => handleExport('csv')}>Экспорт CSV</Button>
```

**Для акта инвентаризации:**
```typescript
const handleCreateReport = async () => {
  try {
    const result = await api.createInventoryReport({
      locationId: selectedLocation,
      personId: selectedPerson,
      dateFrom: startDate,
      dateTo: endDate,
    });
    // результат — файл или ID для скачивания
  } catch (error) {
    console.error(error);
  }
};
```

---

## Чек-лист миграции

- [ ] Файлы `api.ts`, `auth.ts`, `.env.example` созданы
- [ ] `.env` заполнен с правильным `VITE_API_URL`
- [ ] DashboardPage переведена на `useQuery`
- [ ] DevicesPage поддерживает фильтрацию через API
- [ ] DeviceDetailPage загружает данные через API
- [ ] Справочники (типы, локации, люди) загружаются через API
- [ ] FormDialog сохраняет данные через POST/PATCH
- [ ] Экспорт работает
- [ ] Обработка ошибок и loading-состояния добавлена везде
- [ ] (Опционально) Аутентификация настроена
- [ ] Все коомпоненты тестированы с живым API

---

## Отладка

### Проверить, что работает API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/devices
```

### Проверить отправку токена

В DevTools (Network) смотрите заголовок `Authorization: Bearer ...`

### Логирование запросов

В `api.ts` добавьте перед `fetch()`:
```typescript
console.log(`[API] ${options.method || 'GET'} ${url}`);
```

---

## Рекомендации

- Используйте **React Query** для кэширования (уже подключена в `App.tsx`)
- Для сложных фильтров используйте `useSearchParams` + `useQuery` с зависимостями
- Сохраняйте токены в `localStorage` (или `sessionStorage` для более безопасного варианта)
- При logout вызывайте `auth.clearTokens()` и `queryClient.clear()` для очистки кэша
