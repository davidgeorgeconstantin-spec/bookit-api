import { useSyncExternalStore } from 'react';
import type { LogEntry } from '@/types/api';

/** A tiny global store (no library) for the "API console". */
let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

export const requestLog = {
  add(entry: Omit<LogEntry, 'id' | 'at'>) {
    entries = [{ ...entry, id: Date.now() + Math.random(), at: new Date().toISOString() }, ...entries].slice(0, 30);
    listeners.forEach((l) => l());
  },
  clear() {
    entries = [];
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => entries,
};

export function useRequestLog() {
  return useSyncExternalStore(requestLog.subscribe, requestLog.get);
}
