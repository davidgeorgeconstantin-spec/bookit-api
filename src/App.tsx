import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { BookingWizard } from '@/features/booking/BookingWizard';
import { BookingsTable } from '@/features/bookings/BookingsTable';
import { ApiConsole } from '@/features/console/ApiConsole';
import { EndpointList } from '@/features/docs/EndpointList';

type View = 'book' | 'bookings' | 'docs';

export default function App() {
  const [view, setView] = useState<View>('book');

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
        <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div className="flex items-center gap-3">
            <img src="./favicon.svg" alt="" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold">BookIt</h1>
              <p className="text-sm text-slate-500">REST booking API · live demo</p>
            </div>
          </div>
          <Tabs
            layoutId="view-pill"
            active={view}
            onChange={setView}
            tabs={[
              { id: 'book', label: 'Book' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'docs', label: 'API' },
            ]}
          />
        </header>

        <main className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {view === 'book' && <BookingWizard />}
              {view === 'bookings' && <BookingsTable />}
              {view === 'docs' && <EndpointList />}
            </motion.div>
          </AnimatePresence>
          <ApiConsole />
        </main>
        <footer className="pb-8 text-center text-xs text-slate-400">Learning project by David Constantin · Demo data stays in your browser</footer>
      </div>
    </MotionConfig>
  );
}
