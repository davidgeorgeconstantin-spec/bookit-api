# Lecții: Proiectul 4, BookIt API (Node + Express + PostgreSQL)

**6 seri.** Construiești **partea de server**: un API REST, ca formularul tău PHP de rezervări, dar profesionist, cu teste.

Proiectul are două părți:
- `server/` = API-ul real (Node + Express). Aici e lecția principală.
- `src/` = interfața React care arată cum se folosește API-ul (demo pe GitHub Pages).

```bash
cd server && npm install && npm run dev   # http://localhost:4000/docs
```

---

## Lecția 1: REST, HTTP și primul server Express

### Concepte
- **REST** = reguli simple: resurse (`/bookings`) + verbe HTTP: `GET` (citește), `POST` (creează), `PATCH` (modifică), `DELETE` (șterge).
- **Coduri de stare:** `200` OK, `201` creat, `400` date greșite, `404` nu există, `409` conflict, `422` regulă încălcată, `500` eroare de server.
- **Express:** `app.get('/ruta', (req, res) => res.json(...))`.
- **Middleware:** funcții care rulează înaintea rutelor (`express.json()` citește corpul JSON, `cors()` permite cereri din alt domeniu).
- **Router:** grupezi rutele pe fișiere (`routes/bookings.ts`).

### Unde e în cod
| Ce | Fișier |
|---|---|
| Crearea aplicației + middleware | `server/src/app.ts` |
| Pornirea serverului | `server/src/index.ts` |
| Rutele pentru servicii și sloturi | `server/src/routes/services.ts` |
| Rutele pentru rezervări | `server/src/routes/bookings.ts` |

### Încearcă
Pornește serverul și deschide `http://localhost:4000/api/services` și `http://localhost:4000/docs`. În Swagger, apasă „Try it out” la `POST /bookings`.

### Exercițiu 1
Adaugă ruta **`GET /api/stats`** care întoarce `{ totalBookings, confirmed, cancelled }`.
**Indicii:** în `app.ts`, folosește `repo.listBookings({ page: 1, pageSize: 50 })` și numără cu `.filter()`. Nu uita `async`.

---

## Lecția 2: validare cu Zod și erori centralizate

### Concepte
- **Nu ai încredere în datele primite.** Le validezi înainte de orice.
- **Zod:** descrii forma datelor (`z.object({...})`); `schema.parse(data)` aruncă eroare dacă nu se potrivesc.
- **`z.infer<typeof schema>`**: tipul TypeScript se generează din schemă. O singură sursă de adevăr.
- **`z.coerce.number()`**: query string-ul vine ca text (`"2"`), Zod îl transformă în număr.
- **Middleware de erori:** în Express 5, o eroare aruncată într-o rută `async` ajunge automat la `errorHandler`. Toate erorile au același format JSON.
- **`HttpError`**: clasa noastră care poartă codul HTTP.

### Unde e în cod
| Ce | Fișier |
|---|---|
| Schemele Zod | `server/src/domain/schemas.ts` |
| Clasa `HttpError` | `server/src/domain/errors.ts` |
| Middleware-ul de erori | `server/src/middleware/errorHandler.ts` |
| Regulile de business (program, suprapuneri) | `server/src/routes/bookings.ts` (POST) |

### Exercițiu 2
Adaugă câmpul opțional **`notes`** (maxim 200 de caractere) la rezervare.
**Indicii:** `notes: z.string().max(200).optional()` în `createBookingSchema`; adaugă `notes?: string` în tipul `Booking`; în `schema.sql` o coloană `notes TEXT`.

---

## Lecția 3: baza de date și repository pattern

### Concepte
- **Repository pattern:** rutele vorbesc cu o **interfață** (`BookingRepository`), nu direct cu baza de date. Avem două implementări:
  - `memoryRepository` (în memorie: pentru teste și pornire rapidă)
  - `postgresRepository` (PostgreSQL real)
- **Dependency injection:** `createApp(repo)` primește repository-ul ca parametru. În teste dăm unul gol, în producție pe cel real.
- **SQL cu parametri (`$1, $2`)**: niciodată nu lipim textul utilizatorului în SQL. Așa eviți *SQL injection* (știi asta din PHP/MySQL: e ca prepared statements).
- **`CHECK`, `REFERENCES`, `INDEX`** în SQL: baza de date protejează și ea datele.

### Unde e în cod
| Ce | Fișier |
|---|---|
| Interfața | `server/src/repositories/types.ts` |
| Implementarea în memorie | `server/src/repositories/memoryRepository.ts` |
| Implementarea PostgreSQL | `server/src/repositories/postgresRepository.ts` |
| Schema bazei de date | `server/db/schema.sql` |
| Alegerea implementării | `server/src/index.ts` |

### Exercițiu 3
Adaugă în repository metoda **`deleteBooking(id)`** și ruta **`DELETE /api/bookings/:id`** (răspuns `204` fără corp).
**Indicii:** adaug-o în interfață (TypeScript îți va cere s-o implementezi în ambele fișiere). În memorie: `splice`. În SQL: `DELETE FROM bookings WHERE id = $1`. Răspuns: `res.status(204).end()`.

---

## Lecția 4: teste automate cu Vitest + Supertest

### Concepte
- **Testele** verifică automat că API-ul funcționează. Rulezi `npm test` după fiecare schimbare.
- **Supertest** trimite cereri HTTP la aplicație fără să pornească un server real.
- **`beforeEach`**: fiecare test primește un repository nou, gol. Testele nu se influențează.
- **Testezi și cazurile rele:** 400, 409, 422, 404. Acolo apar bug-urile.
- **CI:** GitHub Actions rulează testele la fiecare push (`.github/workflows/server-tests.yml`).

### Unde e în cod
| Ce | Fișier |
|---|---|
| Testele | `server/tests/bookings.test.ts` |
| Workflow CI | `.github/workflows/server-tests.yml` |

### Exercițiu 4
Scrie un test pentru ruta `GET /api/stats` din exercițiul 1 (2 rezervări, una anulată → `{ totalBookings: 2, confirmed: 1, cancelled: 1 }`).

---

## Lecția 5: front-end-ul care folosește API-ul

### Concepte
- **Clientul API** (`request()`) e un singur loc prin care trec toate cererile: adaugă latența, loghează, transformă erorile în `ApiError`.
- **Mock server:** pe GitHub Pages nu poate rula Node, așa că demo-ul folosește un server simulat în browser, cu aceleași reguli.
- **Variabile de mediu Vite:** `VITE_API_URL` alege între mock și serverul real.
- **Mutații cu TanStack Query:** după o creare sau anulare, `invalidateQueries` reîncarcă listele.
- **`useSyncExternalStore`**: conectezi React la un „store” simplu, scris de tine (consola API).

### Unde e în cod
| Ce | Fișier |
|---|---|
| Clientul | `src/api/client.ts` |
| Mock server | `src/api/mockServer.ts` |
| Store-ul consolei | `src/api/requestLog.ts` |
| Hook-uri query + mutation | `src/hooks/useBookingApi.ts` |

### Exercițiu 5
Afișează în consola API **numărul de cereri cu eroare** (status ≥ 400) lângă titlu, într-o bulină roșie.
**Indicii:** în `ApiConsole.tsx` ai deja `entries`; `entries.filter(e => e.status >= 400).length`.

---

## Lecția 6: animații – wizard și liste

### Concepte
- **Variants cu `custom`:** direcția (+1 înainte, −1 înapoi) decide din ce parte intră pasul.
- **`AnimatePresence mode="wait"`**: pasul vechi iese, apoi intră cel nou.
- **Animație de eroare („shake”)**: `animate={{ x: [0, -8, 8, -5, 5, 0] }}` = keyframes.
- **SVG `pathLength`**: bifa de succes se desenează singură.
- **`layout` + `popLayout`**: rândurile se rearanjează lin când se schimbă lista.

### Unde e în cod
| Ce | Fișier |
|---|---|
| Wizard + direcție | `src/features/booking/BookingWizard.tsx`, `src/lib/motion.ts` |
| Shake la eroare | `src/features/booking/DetailsStep.tsx` |
| Bifă + confetti | `src/features/booking/SuccessStep.tsx` |
| Indicatorul de pași | `src/features/booking/StepIndicator.tsx` |

### Exercițiu 6
În `SuccessStep`, adaugă un buton **„Add to calendar”** care descarcă un fișier `.ics` cu programarea.
**Indicii:** format text simplu `BEGIN:VCALENDAR … BEGIN:VEVENT … DTSTART:20261201T100000Z …`; descarci cu `Blob` + `URL.createObjectURL`, ca la exportul CSV din Spendly.

---

## Verifică-te
1. Ce diferență e între 400, 404, 409 și 422?
2. De ce validăm și pe server, nu doar în browser?
3. Ce e repository pattern și ce câștigăm din el?
4. Cum previi SQL injection?
5. De ce fiecare test primește un repository nou?
