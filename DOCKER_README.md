# PlanTogather - Docker Setup

## Przegląd

Ten projekt używa Docker do konteneryzacji aplikacji PlanTogather, która składa się z:
- **Frontend**: React.js aplikacja
- **Backend**: Node.js/Express.js API
- **Baza danych**: MongoDB

## Struktura Docker

### Pliki Docker:
- `Dockerfile` - Multi-stage build dla aplikacji
- `docker-compose.yml` - Orchestracja wszystkich serwisów
- `.dockerignore` - Pliki wykluczone z build context
- `mongo-init.js` - Skrypt inicjalizacyjny MongoDB

## Szybki Start

### 1. Uruchomienie z Docker Compose (Zalecane)

```bash
# Zbuduj i uruchom wszystkie serwisy
docker-compose up --build

# Uruchom w tle
docker-compose up -d --build

# Zatrzymaj serwisy
docker-compose down

# Zatrzymaj i usuń wolumeny (baza danych)
docker-compose down -v
```

### 2. Uruchomienie tylko aplikacji (bez bazy danych)

```bash
# Zbuduj obraz
docker build -t plantogather .

# Uruchom kontener
docker run -p 5000:5000 -e MONGO_URI="mongodb://localhost:27017/plantogather" plantogather
```

## Zmienne środowiskowe

### Wymagane zmienne:
- `MONGO_URI` - Connection string do MongoDB
- `PORT` - Port na którym uruchamia się aplikacja (domyślnie 5000)

### Opcjonalne zmienne:
- `NODE_ENV` - Środowisko (development/production)

## Porty

- **5000** - Aplikacja PlanTogather
- **27017** - MongoDB (tylko w trybie development)

## Wolumeny

- `mongodb_data` - Dane MongoDB (persystentne)

## Bezpieczeństwo

- Aplikacja uruchamia się jako nie-root użytkownik
- Używa `dumb-init` do prawidłowego obsługiwania sygnałów
- Baza danych ma skonfigurowane uwierzytelnianie

## Troubleshooting

### Sprawdzenie logów:
```bash
# Logi aplikacji
docker-compose logs app

# Logi bazy danych
docker-compose logs mongodb

# Wszystkie logi
docker-compose logs
```

### Dostęp do bazy danych:
```bash
# Połączenie z MongoDB
docker exec -it plantogather-mongodb mongosh -u admin -p password123
```

### Reset bazy danych:
```bash
# Usuń wolumeny i uruchom ponownie
docker-compose down -v
docker-compose up --build
```

## Produkcja

Dla środowiska produkcyjnego zalecane jest:

1. Zmiana domyślnych haseł w `docker-compose.yml`
2. Użycie zewnętrznej bazy danych MongoDB
3. Konfiguracja reverse proxy (nginx)
4. Użycie Docker secrets dla wrażliwych danych
5. Monitoring i logowanie

## Struktura obrazu Docker

```
plantogather:latest
├── /app
│   ├── /client/build (React build files)
│   ├── /server (Node.js application)
│   └── start.sh (Startup script)
└── nodejs user (non-root)
```
