# Soluții: Proiectul 4, BookIt API

## Soluția 1: `GET /api/stats`
`server/src/app.ts`, înainte de `app.use(notFound)`:
```ts
app.get('/api/stats', async (_req, res) => {
  const { data, total } = await repo.listBookings({ page: 1, pageSize: 50 });
  res.json({
    totalBookings: total,
    confirmed: data.filter((b) => b.status === 'confirmed').length,
    cancelled: data.filter((b) => b.status === 'cancelled').length,
  });
});
```
(Pentru multe rezervări, ai face o metodă `stats()` în repository cu `SELECT status, count(*) … GROUP BY status`.)

## Soluția 2: câmpul `notes`
`server/src/domain/schemas.ts`:
```ts
notes: z.string().trim().max(200).optional(),
```
`server/src/domain/types.ts` → `notes?: string;` în `Booking`.
`server/db/schema.sql` → `notes TEXT,` în tabelul `bookings`.
`postgresRepository.ts` → adaugă `notes` în `INSERT` (`$7`) și în `toBooking`.

## Soluția 3: `DELETE /api/bookings/:id`
`repositories/types.ts`: `deleteBooking(id: string): Promise<boolean>;`
`memoryRepository.ts`:
```ts
async deleteBooking(id) {
  const i = bookings.findIndex((b) => b.id === id);
  if (i === -1) return false;
  bookings.splice(i, 1);
  return true;
},
```
`postgresRepository.ts`:
```ts
async deleteBooking(id) {
  const result = await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
},
```
`routes/bookings.ts`:
```ts
router.delete('/:id', async (req, res) => {
  if (!(await repo.deleteBooking(req.params.id))) throw new HttpError(404, 'Booking not found');
  res.status(204).end();
});
```

## Soluția 4: test pentru `/api/stats`
```ts
it('returns booking stats', async () => {
  const a = await request(app).post('/api/bookings').send(valid);
  await request(app).post('/api/bookings').send({ ...valid, startAt: at('12:00') });
  await request(app).patch(`/api/bookings/${a.body.data.id}/cancel`);
  const res = await request(app).get('/api/stats');
  expect(res.body).toEqual({ totalBookings: 2, confirmed: 1, cancelled: 1 });
});
```

## Soluția 5: număr de erori în consolă
`src/features/console/ApiConsole.tsx`:
```tsx
const errorCount = entries.filter((e) => e.status >= 400).length;
// lângă „API console”:
{errorCount > 0 && (
  <motion.span key={errorCount} initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
    {errorCount}
  </motion.span>
)}
```

## Soluția 6: „Add to calendar” (.ics)
`src/features/booking/SuccessStep.tsx`:
```tsx
function downloadIcs(b: Booking) {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BookIt//EN', 'BEGIN:VEVENT',
    `UID:${b.id}`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(b.startAt)}`, `DTEND:${fmt(b.endAt)}`, 'SUMMARY:BookIt appointment',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'booking.ics';
  a.click();
  URL.revokeObjectURL(url);
}
// <Button variant="ghost" onClick={() => downloadIcs(booking)}>Add to calendar</Button>
```
