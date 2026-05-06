# TripTracker – Fahrtendokumentation

iOS & Android App zur Fahrtendokumentation mit GPS-Tracking, DSGVO-Konformität und PDF/CSV-Export.

## Tech Stack

| Bereich | Technologie |
|---|---|
| Mobile | React Native + Expo SDK 53 (TypeScript) |
| Backend | Node.js + Express + TypeScript |
| Datenbank | MongoDB + Mongoose |
| Auth | JWT + Refresh Token + Biometrie |
| State | Zustand + TanStack Query |
| Maps | react-native-maps (Google/Apple) |
| Export | PDFKit + csv-stringify |

---

## Schnellstart

### Voraussetzungen
- Node.js 18+
- MongoDB (lokal oder Atlas)
- Expo Go App (iOS/Android) oder Simulator
- Google Maps API Key (Android)

### Backend starten

```bash
cd backend
npm install
cp .env.example .env
# .env ausfüllen (MONGODB_URI, JWT_SECRET, SMTP-Daten, GOOGLE_DIRECTIONS_API_KEY)
npm run dev
```

Der Server läuft dann auf `http://localhost:3000`

### Mobile App starten

```bash
cd mobile
npm install
cp .env.example .env
# .env ausfüllen (API_BASE_URL, GOOGLE_MAPS_API_KEY)
npx expo start
```

Für native Features (Hintergrundlocation, Widget):
```bash
npx expo prebuild --clean
npx expo run:ios     # oder
npx expo run:android
```

---

## Projektstruktur

```
triptracker/
├── backend/
│   └── src/
│       ├── config/        # DB, Env-Validierung
│       ├── controllers/   # Auth, User, Trip, Export
│       ├── middleware/    # Auth, Validation, RateLimit, ErrorHandler
│       ├── models/        # User, Trip (Mongoose)
│       ├── routes/        # Express Router
│       ├── schemas/       # Zod Validierungsschemas
│       ├── services/      # Auth, Email, Export
│       └── utils/         # Haversine, Geocode, Directions API, Encryption
│
└── mobile/
    └── src/
        ├── api/           # Axios Client + Auth/Trip/Export API
        ├── components/    # UI-Komponenten, Trip-Karte, Karte, Filter
        ├── hooks/         # useTrips, useActiveTrip, useBiometric
        ├── navigation/    # AuthStack, MainTabs, AppNavigator
        ├── screens/       # Auth, Dashboard, Tracking, Profil, Export
        ├── services/      # Location, Biometrie, Notifications, Export
        ├── store/         # Zustand (Auth, Trip)
        ├── tasks/         # Background Location Task
        ├── theme/         # Farben, Abstände, Typografie
        └── types/         # TypeScript Typdefinitionen
```

---

## Funktionen

### ✅ Implementiert
- Registrierung mit E-Mail-Verifizierung
- Login mit JWT + Biometrie (Face ID / Fingerabdruck)
- DSGVO-Einwilligungsdialog
- Fahrtstart / Fahrtstopp mit GPS
- Hintergrundlocation via Expo TaskManager
- Fahrtzweck-Auswahl (Privat, Geschäftlich, Arbeitsweg)
- Kartenansicht mit tatsächlicher Route (blau)
- **Kürzeste Route** laut Google Maps (gestrichelt grau)
- Fahrtenliste mit Filtern (Monat, 3/6 Monate, Jahr, Zeitraum)
- Detailansicht mit Routenvergleich auf der Karte
- PDF-Export (A4, professionell formatiert)
- CSV-Export (Semikolon-getrennt, BOM für Excel)
- E-Mail-Export direkt vom Backend
- Nutzerprofil mit Biometrie-Toggle
- DSGVO Art. 17 – Datenlöschung

### 🔜 Erweiterbar
- Homescreen-Widget (iOS WidgetKit / Android AppWidget)
- Bluetooth-Autoerkennung
- Push-Benachrichtigungen bei Bewegungserkennung

---

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| POST | /api/v1/auth/register | Registrierung |
| POST | /api/v1/auth/login | Anmeldung |
| POST | /api/v1/auth/refresh | Token erneuern |
| POST | /api/v1/auth/logout | Abmelden |
| GET | /api/v1/auth/verify-email/:token | E-Mail bestätigen |
| GET | /api/v1/user/me | Profil abrufen |
| PATCH | /api/v1/user/me | Profil aktualisieren |
| DELETE | /api/v1/user/me | Konto löschen (DSGVO) |
| POST | /api/v1/trips/start | Fahrt starten |
| PATCH | /api/v1/trips/:id/stop | Fahrt beenden |
| PATCH | /api/v1/trips/:id/route | Route-Punkte anhängen |
| GET | /api/v1/trips | Fahrtenliste |
| GET | /api/v1/trips/:id | Fahrtdetails |
| DELETE | /api/v1/trips/:id | Fahrt löschen |
| GET | /api/v1/export/pdf | PDF herunterladen |
| GET | /api/v1/export/csv | CSV herunterladen |
| POST | /api/v1/export/email | Per E-Mail senden |

---

## Datenschutz & Sicherheit

- JWT Access Token (15 Min.) + Refresh Token (30 Tage, rotiert)
- Biometrie lokal (kein Biometrie-Daten auf Server)
- Standortdaten nur mit Einwilligung erfasst
- AES-256-GCM Verschlüsselung der Routenpunkte
- Token sicher gespeichert (iOS Keychain / Android Keystore)
- Rate Limiting: 5 req/15 Min auf Auth-Routes
- Helmet + CORS Headers
- DSGVO Art. 17: Datenlöschung auf Anfrage
