# IT Failure Analyzer - Backend

Backend dla aplikacji SaaS do analizy awarii systemów IT wykorzystującej sztuczną inteligencję.

## Wymagania

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm lub yarn

## Instalacja

### Lokalna instalacja

1. Sklonuj repozytorium
```bash
git clone https://github.com/MichalRzeszot/Log_Analiyzer-.git
cd backend
```

2. Zainstaluj zależności
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe
```bash
cp .env.example .env
```
Edytuj `.env` i uzupełnij wartości dla Twojego środowiska.

4. Uruchom migracje bazy danych
```bash
npm run db:migrate
```

5. (Opcjonalnie) Zasilij bazę danych
```bash
npm run db:seed
```

6. Uruchom serwer deweloperski
```bash
npm run dev
```

Serwer będzie dostępny na `http://localhost:3000`

## Uruchomienie z Docker

```bash
docker-compose up
```

## Dostępne komendy

- `npm run dev` - Uruchomienie serwera w trybie deweloperskim
- `npm run build` - Zbudowanie aplikacji
- `npm start` - Uruchomienie zbudowanej aplikacji
- `npm test` - Uruchomienie testów
- `npm run lint` - Analiza kodu
- `npm run lint:fix` - Naprawianie problemów w kodzie
- `npm run db:migrate` - Uruchomienie migracji bazy danych
- `npm run db:seed` - Zasilenie bazy danych

## Struktura projektu

```
src/
├── config/          # Konfiguracja aplikacji
├── controllers/     # Kontrolery obsługujące requesty
├── services/        # Logika biznesowa
├── repositories/    # Dostęp do bazy danych
├── models/          # Modele danych
├── middleware/      # Middleware Express
├── utils/           # Funkcje narzędziowe
├── routes/          # Definicje ścieżek API
├── database/        # Migracje i seedery
├── app.ts           # Inicjalizacja Express
└── server.ts        # Punkt wejścia aplikacji
```

## Dokumentacja API

Pełna dokumentacja API dostępna jest w pliku `API.md` (wkrótce).

## Bezpieczeństwo

- Hasła są hashowane za pomocą bcryptjs
- Autentykacja JWT
- Rate limiting na wszystkich endpointach
- CORS skonfigurowany
- Helmet dla bezpieczeństwa HTTP headerów
- Walidacja danych Joi

## Troubleshooting

### Błąd połączenia z bazą danych

Upewnij się, że:
- PostgreSQL jest uruchomiony
- Dane w `.env` są poprawne
- Baza danych istnieje

### Błędy TypeScript

```bash
npm run build
```

Sprawdź czy wszystkie błędy typów są naprawione.

## Licencja

MIT
