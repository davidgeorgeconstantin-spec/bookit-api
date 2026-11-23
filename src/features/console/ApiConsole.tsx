import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { requestLog, useRequestLog } from '@/api/requestLog';
import { usingMock } from '@/api/client';

const METHOD_COLOR = { GET: 'text-sky-400', POST: 'text-emerald-400', PATCH: 'text-amber-400', DELETE: 'text-rose-400' } as const;
const statusColor = (s: number) => (s < 300 ? 'bg-emerald-500/20 text-emerald-300' : s < 500 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300');

/** Live log of every HTTP request the UI makes — shows how the REST API works. */
export function ApiConsole() {
  const entries = useRequestLog();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <aside className="flex max-h-[42rem] flex-col rounded-3xl bg-slate-900 p-4 text-slate-200 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-bold">API console</p>
          <p className="text-xs text-slate-400">{usingMock ? 'Mock server in your browser (demo)' : 'Connected to Express server'}</p>
        </div>
        <button onClick={requestLog.clear} className="text-xs text-slate-400 hover:text-white">
          Clear
        </button>
      </div>
      <ul className="flex-1 space-y-1.5 overflow-y-auto font-mono text-xs">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, x: 20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0 }} className="rounded-lg bg-white/5">
              <button onClick={() => setOpen(open === e.id ? null : e.id)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left">
                <span className={`w-11 font-bold ${METHOD_COLOR[e.method]}`}>{e.method}</span>
                <span className="flex-1 truncate">{e.path}</span>
                <span className={`rounded px-1.5 py-0.5 ${statusColor(e.status)}`}>{e.status}</span>
                <span className="w-12 text-right text-slate-500">{e.ms}ms</span>
              </button>
              <AnimatePresence>
                {open === e.id && (
                  <motion.pre initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden whitespace-pre-wrap break-all px-2.5 pb-2 text-[11px] text-slate-400">
                    {e.requestBody !== undefined && `→ ${JSON.stringify(e.requestBody, null, 2)}\n`}
                    {`← ${JSON.stringify(e.responseBody, null, 2).slice(0, 900)}`}
                  </motion.pre>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && <li className="py-8 text-center text-slate-500">Requests will appear here…</li>}
      </ul>
    </aside>
  );
}
