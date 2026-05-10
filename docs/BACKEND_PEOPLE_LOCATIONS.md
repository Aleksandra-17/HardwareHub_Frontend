# Бэкенд: Ответственные и Кабинеты

Инструкция по реализации CRUD API для разделов «Ответственные» (people) и «Кабинеты» (locations).

---

## Схема БД

### locations (кабинеты)

| Поле         | Тип           | Описание              |
|--------------|---------------|------------------------|
| id           | UUID (PK)     | Идентификатор          |
| name         | VARCHAR(255)  | Название (Каб. 101)    |
| building     | VARCHAR(255)  | Здание / корпус        |
| floor        | VARCHAR(50)   | Этаж                   |
| description  | TEXT          | Описание               |
| device_count | INT           | Количество устройств (вычисляемое) |

### people (ответственные)

| Поле         | Тип           | Описание         |
|--------------|---------------|-------------------|
| id           | UUID (PK)     | Идентификатор     |
| full_name    | VARCHAR(255)  | ФИО               |
| position     | VARCHAR(255)  | Должность         |
| department   | VARCHAR(255)  | Отдел             |
| email        | VARCHAR(255)  | Email             |
| phone        | VARCHAR(50)   | Телефон           |
| device_count | INT           | Кол-во устройств (вычисляемое) |

---

## SQL (PostgreSQL)

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  building VARCHAR(255),
  floor VARCHAR(50),
  description TEXT
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  department VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50)
);

-- Триггер или view для device_count (или считать в API)
-- Например, в API: COUNT(devices) WHERE location_id = locations.id
```

---

## Эндпоинты

Базовый путь: `/api`

### Locations

| Метод  | Путь             | Описание        | Авторизация |
|--------|------------------|-----------------|-------------|
| GET    | `/locations`     | Список локаций  | Bearer      |
| POST   | `/locations`     | Создать         | Bearer      |
| DELETE | `/locations/:id` | Удалить         | Bearer      |

#### GET /locations

**Response 200:**
```json
[
  {
    "id": "uuid",
    "name": "Каб. 101",
    "building": "Корпус А",
    "floor": "1",
    "description": "Приёмная",
    "deviceCount": 4
  }
]
```

#### POST /locations

**Request body:**
```json
{
  "name": "Каб. 102",
  "building": "Корпус А",
  "floor": "1",
  "description": "Бухгалтерия"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "Каб. 102",
  "building": "Корпус А",
  "floor": "1",
  "description": "Бухгалтерия",
  "deviceCount": 0
}
```

#### DELETE /locations/:id

**Response:** 204 No Content

**Ограничения:** Если в кабинете есть устройства (`deviceCount > 0`), можно:
- запретить удаление (409 Conflict) и возвращать ошибку;
- или разрешить с каскадным обнулением `locationId` у устройств (по бизнес-логике).

---

### People

| Метод  | Путь          | Описание          | Авторизация |
|--------|---------------|-------------------|-------------|
| GET    | `/people`     | Список людей      | Bearer      |
| POST   | `/people`     | Создать           | Bearer      |
| DELETE | `/people/:id` | Удалить           | Bearer      |

#### GET /people

**Response 200:**
```json
[
  {
    "id": "uuid",
    "fullName": "Иванов Иван Иванович",
    "position": "Системный администратор",
    "department": "IT-отдел",
    "email": "ivanov@company.ru",
    "phone": "+7 (999) 111-22-33",
    "deviceCount": 5
  }
]
```

#### POST /people

**Request body:**
```json
{
  "fullName": "Петров Пётр Петрович",
  "position": "Бухгалтер",
  "department": "Бухгалтерия",
  "email": "petrov@company.ru",
  "phone": "+7 (999) 222-33-44"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "fullName": "Петров Пётр Петрович",
  "position": "Бухгалтер",
  "department": "Бухгалтерия",
  "email": "petrov@company.ru",
  "phone": "+7 (999) 222-33-44",
  "deviceCount": 0
}
```

#### DELETE /people/:id

**Response:** 204 No Content

**Ограничения:** Аналогично локациям — при `deviceCount > 0` можно запретить удаление (409) или обработать по своей логике (например, обнулить `personId` у устройств).

---

## Именование полей

Используйте **camelCase** в JSON:

- `fullName`, `deviceCount` (не `full_name`, `device_count`)

---

## Валидация

### POST /locations
- `name` — обязательное, не пустое
- `building`, `floor`, `description` — опционально

### POST /people
- `fullName` — обязательное, не пустое
- `position`, `department`, `email`, `phone` — опционально

---

## Пример (FastAPI)

```python
from pydantic import BaseModel
from typing import Optional

class LocationCreate(BaseModel):
    name: str
    building: Optional[str] = None
    floor: Optional[str] = None
    description: Optional[str] = None

class LocationResponse(LocationCreate):
    id: str
    deviceCount: int = 0

@router.get("/locations", response_model=list[LocationResponse])
async def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.post("/locations", response_model=LocationResponse, status_code=201)
async def create_location(data: LocationCreate, db: Session = Depends(get_db)):
    loc = Location(**data.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/locations/{id}", status_code=204)
async def delete_location(id: str, db: Session = Depends(get_db)):
    loc = db.query(Location).get(id)
    if not loc:
        raise HTTPException(404)
    # Опционально: проверить device_count и вернуть 409
    db.delete(loc)
    db.commit()
    return None
```

---

## Связь с устройствами

Таблица `devices` должна содержать:

- `location_id` → `locations.id` (FK)
- `person_id` → `people.id` (FK, nullable)

Поле `deviceCount` можно считать в SQL/ORM:

```sql
SELECT l.*, COUNT(d.id) AS device_count
FROM locations l
LEFT JOIN devices d ON d.location_id = l.id
GROUP BY l.id
```

---

## Обработка ошибок

| Код | Описание                  |
|-----|---------------------------|
| 400 | Невалидные данные         |
| 404 | Локация/человек не найден |
| 409 | Нельзя удалить (есть устройства) |
| 422 | Ошибка валидации Pydantic |
