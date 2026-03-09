# HardwareHub Frontend

Веб-приложение для учёта техники: устройства, типы устройств, локации, ответственные лица, отчёты и инвентаризация.

## Стек

- **Vite** — сборка
- **React 18** + **TypeScript**
- **shadcn/ui** + **Tailwind CSS**
- **React Query** — кэширование данных (для будущей интеграции с API)
- **Vitest** + **Testing Library** — тесты

## Быстрый старт

```sh
# Клонирование
git clone <repo-url>
cd HardwareHub-Frontend

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Приложение откроется на http://localhost:8080

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер с hot reload |
| `npm run build` | Production-сборка в `dist/` |
| `npm run preview` | Просмотр production-сборки |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (разовый прогон) |
| `npm run test:watch` | Vitest в watch-режиме |
| `npm run docker:build` | Сборка Docker-образа |
| `npm run docker:run` | Запуск контейнера (порт 8080) |

## Docker

```sh
npm run docker:build
npm run docker:run
```

Приложение доступно на http://localhost:8080

## Структура проекта

```
src/
├── components/     # UI-компоненты
├── lib/            # Утилиты, типы, mock-данные
├── pages/          # Страницы приложения
├── test/           # Setup и тесты
└── hooks/
```

## Связь с бэкендом

Сейчас приложение работает на **mock-данных** (`src/lib/mock-data.ts`).

Чтобы подключить свой бэкенд, см. **[документацию API](docs/BACKEND_API.md)** — там описаны модели данных, эндпоинты и форматы запросов/ответов.

## CI/CD

GitHub Actions при push/PR на `main`/`master`:

- **Lint** — ESLint
- **Test** — Vitest
