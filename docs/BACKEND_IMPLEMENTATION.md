# Руководство реализации бэкенда HardwareHub

Этот документ описывает все необходимые эндпоинты API и функциональность, которую необходимо реализовать на бэкенде для полной поддержки фронтенд приложения.

## Содержание

1. [Базовая настройка](#базовая-настройка)
2. [Аутентификация](#аутентификация)
3. [Типы устройств](#типы-устройств)
4. [Кабинеты (Locations)](#кабинеты-locations)
5. [Люди (People)](#люди-people)
6. [Устройства (Devices)](#устройства-devices)
7. [Отчеты (Reports)](#отчеты-reports)
8. [Пример реализации (FastAPI)](#пример-реализации-fastapi)

## Базовая настройка

### Обязательные параметры окружения

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
DATABASE_URL=postgresql://user:password@localhost/hardwarehub
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30
REFRESH_TOKEN_EXPIRATION_DAYS=7
```

### CORS конфигурация

Фронтенд обращается с адреса `http://localhost:5173` (Vite dev server) и может быть развёрнут на боевом сервере. Необходимо поддерживать:

- Credentials: включить поддержку cookies и Authorization header
- Headers: `Content-Type`, `Authorization`
- Methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`

## Аутентификация

### POST /auth/login

Вход в систему с username и password.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401 Unauthorized` - неверные учетные данные
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- Access token действует 30 минут
- Refresh token действует 7 дней
- Оба токена должны быть JWT с payload содержащим `sub` (user_id) и `type` (access/refresh)

---

### POST /auth/refresh

Обновление access token с использованием refresh token.

**Request:**
```json
{
  "refresh_token": "string"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401 Unauthorized` - неверный или истекший refresh token
- `422 Unprocessable Entity` - ошибка валидации

---

### POST /auth/logout

Выход из системы.

**Request:**
```json
{
  "refresh_token": "string (опционально)"
}
```

**Response (204 No Content)**

**Примечания:**
- Может быть вызван без body (просто POST /auth/logout)
- Если передан refresh_token, он должен быть инвалидирован в БД

---

### GET /auth/me

Получение информации о текущем пользователе (требует авторизации).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string@example.com"
}
```

**Errors:**
- `401 Unauthorized` - отсутствует или неверный токен

---

## Типы устройств

### GET /device-types

Получить список всех типов устройств (требует авторизации).

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Ноутбук"
  },
  {
    "id": "uuid",
    "name": "ПК"
  },
  {
    "id": "uuid",
    "name": "Монитор"
  }
]
```

**Примечания:**
- Должны быть предзагруженные типы в БД
- Читается часто, кэширование на клиенте рекомендуется
- Предустановленные типы: Ноутбук, ПК, Монитор, Принтер, Сканер, МФУ, Сервер, Коммутатор и т.д.
- Расширенный формат ответа (опционально): `id`, `name`, `code`, `category`, `description`, `deviceCount`

---

### POST /device-types

Создать новый тип устройства (требует авторизации).

**Request:**
```json
{
  "name": "Ноутбук",
  "code": "NB-001",
  "category": "computing",
  "description": "Портативный компьютер"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Ноутбук",
  "code": "NB-001",
  "category": "computing",
  "description": "Портативный компьютер",
  "deviceCount": 0
}
```

**Errors:**
- `400 Bad Request` - name или code уже существуют
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- `category`: computing | office | network | other
- `deviceCount` вычисляется автоматически (количество устройств данного типа)

---

## Кабинеты (Locations)

### GET /locations

Получить список всех кабинетов (требует авторизации).

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Кабинет 101"
  },
  {
    "id": "uuid",
    "name": "Кабинет 102"
  }
]
```

---

### POST /locations

Создать новый кабинет (требует авторизации).

**Request:**
```json
{
  "name": "Кабинет 103"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Кабинет 103"
}
```

**Errors:**
- `400 Bad Request` - name уже существует
- `422 Unprocessable Entity` - ошибка валидации

---

### DELETE /locations/{id}

Удалить кабинет (требует авторизации).

**Response (204 No Content)**

**Errors:**
- `404 Not Found` - кабинет не найден
- `409 Conflict` - кабинет содержит устройства (нельзя удалить)

**Примечания:**
- Если есть устройства в кабинете, операция должна быть отклонена или устройства перемещены

---

## Люди (People)

### GET /people

Получить список всех людей (требует авторизации).

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "fullName": "Иван Петров"
  },
  {
    "id": "uuid",
    "fullName": "Мария Сидорова"
  }
]
```

---

### POST /people

Создать нового человека (требует авторизации).

**Request:**
```json
{
  "fullName": "Петр Иванов"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "fullName": "Петр Иванов"
}
```

**Errors:**
- `400 Bad Request` - fullName уже существует
- `422 Unprocessable Entity` - ошибка валидации

---

### DELETE /people/{id}

Удалить человека (требует авторизации).

**Response (204 No Content)**

**Errors:**
- `404 Not Found` - человек не найден
- `409 Conflict` - человек ответственен за устройства (нельзя удалить)

**Примечания:**
- Если человек отвечает за устройства, операция должна быть отклонена или ответственность переназначена

---

## Устройства (Devices)

### GET /devices

Получить список устройств (требует авторизации).

**Query параметры:**
- `search` (optional): поиск по имени или инвентарному номеру
- `status` (optional): фильтр по статусу (in_use, repair, scrapped, archived)
- `type` (optional): фильтр по типу устройства (device type ID)
- `location` (optional): фильтр по кабинету (location ID)
- `person` (optional): фильтр по ответственному (person ID)
- `sort` (optional): поле для сортировки (name, inventoryNumber, purchaseDate, purchasePrice)
- `order` (optional): порядок сортировки (asc, desc)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "inventoryNumber": "INV-2024-001",
    "name": "Ноутбук Lenovo ThinkPad",
    "deviceTypeId": "uuid",
    "status": "in_use",
    "serialNumber": "SN12345",
    "model": "T490",
    "manufacturer": "Lenovo",
    "locationId": "uuid",
    "personId": "uuid",
    "commissionDate": "2024-01-15",
    "lastCheckDate": "2024-03-09",
    "purchasePrice": 45000,
    "purchaseDate": "2023-12-20",
    "notes": "Рабочее устройство"
  }
]
```

**Примечания:**
- Результаты должны быть пагинированы (опционально)
- Поиск должен быть case-insensitive
- Поле `lastCheckDate` устанавливается при каждом запросе к устройству

---

### GET /devices/{id}

Получить информацию о конкретном устройстве (требует авторизации).

**Response (200 OK):**
```json
{
  "id": "uuid",
  "inventoryNumber": "INV-2024-001",
  "name": "Ноутбук Lenovo ThinkPad",
  "deviceTypeId": "uuid",
  "status": "in_use",
  "serialNumber": "SN12345",
  "model": "T490",
  "manufacturer": "Lenovo",
  "locationId": "uuid",
  "personId": "uuid",
  "commissionDate": "2024-01-15",
  "lastCheckDate": "2024-03-09",
  "purchasePrice": 45000,
  "purchaseDate": "2023-12-20",
  "notes": "Рабочее устройство"
}
```

**Errors:**
- `404 Not Found` - устройство не найдено

**Примечания:**
- При каждом GET запросе обновить `lastCheckDate` на текущую дату

---

### POST /devices

Создать новое устройство (требует авторизации).

**Request:**
```json
{
  "inventoryNumber": "INV-2024-100",
  "name": "Ноутбук Dell",
  "deviceTypeId": "uuid",
  "status": "in_use",
  "serialNumber": "SN-XXXXX",
  "model": "Latitude 5430",
  "manufacturer": "Dell",
  "locationId": "uuid",
  "personId": "uuid",
  "commissionDate": "2024-03-09",
  "purchasePrice": 55000,
  "purchaseDate": "2024-02-01",
  "notes": "Новое устройство"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "inventoryNumber": "INV-2024-100",
  ...
  "lastCheckDate": "2024-03-09"
}
```

**Errors:**
- `400 Bad Request` - inventoryNumber уже существует
- `404 Not Found` - указанный deviceTypeId, locationId или personId не найдены
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- `inventoryNumber` должен быть уникальным
- `status` по умолчанию "in_use"
- `lastCheckDate` устанавливается на текущую дату
- Создать запись в audit log

---

### PATCH /devices/{id}

Обновить устройство (требует авторизации).

**Request (все поля опционально):**
```json
{
  "inventoryNumber": "string",
  "name": "string",
  "deviceTypeId": "uuid",
  "status": "in_use | repair | scrapped | archived",
  "serialNumber": "string",
  "model": "string",
  "manufacturer": "string",
  "locationId": "uuid",
  "personId": "uuid",
  "commissionDate": "date",
  "purchasePrice": "number",
  "purchaseDate": "date",
  "notes": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  ...
  "lastCheckDate": "2024-03-09"
}
```

**Errors:**
- `404 Not Found` - устройство не найдено
- `400 Bad Request` - inventoryNumber конфликт или недопустимые данные
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- Создать запись в audit log с указанием измененных полей
- Обновить `lastCheckDate`

---

### DELETE /devices/{id}

Удалить устройство (требует авторизации).

**Response (204 No Content)**

**Errors:**
- `404 Not Found` - устройство не найдено

**Примечания:**
- Создать запись в audit log
- Можно удалять только устройства со статусом scrapped или archived

---

### GET /devices/{id}/audit

Получить историю изменений устройства (требует авторизации).

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "date": "2024-03-09T10:30:00Z",
    "action": "Устройство создано",
    "user": "admin"
  },
  {
    "id": "uuid",
    "date": "2024-03-09T12:15:00Z",
    "action": "Статус изменен на repair",
    "user": "admin"
  }
]
```

**Errors:**
- `404 Not Found` - устройство не найдено

**Примечания:**
- Должны отслеживаться все операции: создание, обновление, смена статуса
- Формат: "Поле изменено с X на Y" или "Статус изменен на Y"
- Должны быть действия вроде "Просмотрено", "Отправлено на ремонт", "Списано"

---

### POST /devices/{id}/qr-code

Сгенерировать QR-код для устройства (требует авторизации).

**Response (200 OK):**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

Или возвращает PNG изображение с `Content-Type: image/png`

**Errors:**
- `404 Not Found` - устройство не найдено

**Примечания:**
- QR-код должен содержать ссылку на устройство, например: `https://app.example.com/devices/{id}`
- Или может содержать just ID или inventory number для сканирования

---

## Отчеты (Reports)

### POST /reports/devices/export

Экспортировать список устройств в CSV или Excel (требует авторизации).

**Request:**
```json
{
  "format": "csv | xlsx",
  "locationId": "uuid (опционально)",
  "personId": "uuid (опционально)"
}
```

**Response (200 OK):**
- Content-Type: `text/csv` (для CSV)
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (для Excel)
- Content-Disposition: `attachment; filename="devices-export.csv"`

**CSV формат:**
```
Инвентарный номер,Наименование,Тип,Статус,Серийный номер,Модель,Производитель,Кабинет,Ответственный,Дата ввода,Дата покупки,Стоимость (₽)
INV-2024-001,Ноутбук Lenovo,Ноутбук,в использовании,SN12345,T490,Lenovo,Кабинет 101,Иван Петров,2024-01-15,2023-12-20,45000
```

**Errors:**
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- Экспорт должен включать только выбранные устройства (если указаны фильтры)
- Все колонки должны быть на русском языке

---

### POST /reports/inventory

Сформировать акт инвентаризации (требует авторизации).

**Request:**
```json
{
  "locationId": "uuid",
  "personId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-03-09"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "documentNumber": "АКТ-2024-001",
  "date": "2024-03-09",
  "locationName": "Кабинет 101",
  "personName": "Иван Петров",
  "deviceCount": 15,
  "totalPrice": 450000,
  "devices": [
    {
      "inventoryNumber": "INV-2024-001",
      "name": "Ноутбук Lenovo",
      "serialNumber": "SN12345",
      "status": "in_use",
      "purchasePrice": 45000
    }
  ]
}
```

**Errors:**
- `404 Not Found` - кабинет или человек не найдены
- `422 Unprocessable Entity` - ошибка валидации

**Примечания:**
- Документ должен содержать список всех устройств в указанном кабинете, за которые отвечает указанный человек
- Должен быть номер документа (типа АКТ-YYYY-NNN)
- Сумма должна рассчитываться из purchasePrice устройств в статусе "in_use"

---

### GET /root/health

Проверка здоровья приложения (не требует авторизации).

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-03-09T10:30:00Z"
}
```

**Примечания:**
- Используется для проверки доступности API при запуске приложения

---

## Схема БД (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device Types
CREATE TABLE device_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL
);

-- Locations (Кабинеты)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL
);

-- People (Ответственные)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) UNIQUE NOT NULL
);

-- Devices
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_number VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  device_type_id UUID NOT NULL REFERENCES device_types(id),
  status VARCHAR(50) DEFAULT 'in_use',
  serial_number VARCHAR(255),
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  location_id UUID NOT NULL REFERENCES locations(id),
  person_id UUID NOT NULL REFERENCES people(id),
  commission_date DATE,
  last_check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  purchase_price INTEGER,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens (для инвалидации)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_device_type_id ON devices(device_type_id);
CREATE INDEX idx_devices_location_id ON devices(location_id);
CREATE INDEX idx_devices_person_id ON devices(person_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_audit_log_device_id ON audit_log(device_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

---

## Пример реализации (FastAPI)

### 1. Проект структура

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── device.py
│   │   ├── location.py
│   │   ├── person.py
│   │   └── audit.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── device.py
│   │   ├── location.py
│   │   ├── person.py
│   │   └── token.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── devices.py
│   │   ├── locations.py
│   │   ├── people.py
│   │   ├── reports.py
│   │   └── health.py
│   └── utils/
│       ├── __init__.py
│       ├── jwt.py
│       ├── qr.py
│       └── export.py
├── requirements.txt
├── .env
└── run.py
```

### 2. requirements.txt

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
qrcode==7.4.2
python-docx==0.8.11
openpyxl==3.1.0
```

### 3. main.py (основной файл)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, devices, locations, people, reports, health

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HardwareHub API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(locations.router, prefix="/api/locations", tags=["locations"])
app.include_router(people.router, prefix="/api/people", tags=["people"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(health.router, prefix="/api/root", tags=["health"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4. Пример роутера (routers/locations.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.location import LocationCreate, LocationResponse
from app.models.location import Location
from app.security import get_current_user

router = APIRouter()

@router.get("", response_model=list[LocationResponse])
def get_locations(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Location).all()

@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(Location).filter(Location.name == location.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Location name already exists")
    
    db_location = Location(name=location.name)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Проверить, есть ли устройства в этом кабинете
    from app.models.device import Device
    device_count = db.query(Device).filter(Device.location_id == location_id).count()
    if device_count > 0:
        raise HTTPException(status_code=409, detail="Location has devices, cannot delete")
    
    db.delete(location)
    db.commit()
```

---

## Чек-лист для реализации

- [ ] Создать базу данных PostgreSQL
- [ ] Создать схему БД (создать все таблицы и индексы)
- [ ] Реализовать аутентификацию (JWT, login, refresh, logout)
- [ ] Реализовать CRUD для Device Types
- [ ] Реализовать CRUD для Locations
- [ ] Реализовать CRUD для People
- [ ] Реализовать CRUD для Devices (включая фильтры и сортировку)
- [ ] Реализовать Audit Log
- [ ] Реализовать экспорт в CSV и Excel
- [ ] Реализовать генерацию акта инвентаризации
- [ ] Реализовать генерацию QR-кодов
- [ ] Настроить CORS
- [ ] Добавить проверку здоровья (/root/health)
- [ ] Протестировать все эндпоинты
- [ ] Развернуть и настроить для production
- [ ] Подключить фронтенд и протестировать интеграцию

---

## Примечания по безопасности

1. **Пароли**: использовать bcrypt для хеширования паролей
2. **JWT**: использовать сильный secret (минимум 32 символа)
3. **HTTPS**: в production использовать HTTPS (не HTTP)
4. **Rate Limiting**: добавить ограничение количества запросов
5. **Валидация**: валидировать все входные данные
6. **CORS**: ограничить origins только необходимыми
7. **Логирование**: логировать все операции в audit log
8. **Error Handling**: не раскрывать внутренние ошибки БД в responses

---

## Дополнительные функции (future)

- Пагинация устройств
- Кэширование результатов запросов
- Поддержка фотографий устройств
- Импорт устройств из CSV
- Уведомления о скорых проверках
- История цены (tracking price changes)
- Мултиязычность API
- WebSocket для real-time обновлений

