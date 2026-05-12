import { derived, writable } from 'svelte/store';

import type { IConnectionStatus } from '/@/lib/preferences/Util';

export interface PopoverEntry {
  action: string;
  status: 'in-progress' | 'done';
  label: string;
}

export interface PrototypeOverride {
  connectionStatus: string;
  loadingStatus: IConnectionStatus;
  popoverEntries: PopoverEntry[];
}

const overrides: Record<string, PrototypeOverride> = {
  idle: {
    connectionStatus: 'started',
    loadingStatus: { status: 'started', inProgress: false },
    popoverEntries: [],
  },
  'single-starting': {
    connectionStatus: 'starting',
    loadingStatus: { status: 'starting', action: 'start', inProgress: true },
    popoverEntries: [{ action: 'start', status: 'in-progress', label: 'Starting machine...' }],
  },
  'single-complete': {
    connectionStatus: 'started',
    loadingStatus: { status: 'started', inProgress: false },
    popoverEntries: [{ action: 'start', status: 'done', label: 'Machine started' }],
  },

  // dual-spinners: phase 0 -> both spinning, phase 1 -> stop done, phase 2 -> both done (auto-dismiss via popover)
  'dual-spinners': {
    connectionStatus: 'stopping',
    loadingStatus: { status: 'stopping', activeActions: ['stop', 'start'], inProgress: true },
    popoverEntries: [
      { action: 'stop', status: 'in-progress', label: 'Stopping machine...' },
      { action: 'start', status: 'in-progress', label: 'Starting machine...' },
    ],
  },
  'dual-spinners:1': {
    connectionStatus: 'starting',
    loadingStatus: { status: 'starting', activeActions: ['start'], inProgress: true },
    popoverEntries: [
      { action: 'stop', status: 'done', label: 'Machine stopped' },
      { action: 'start', status: 'in-progress', label: 'Starting machine...' },
    ],
  },
  'dual-spinners:2': {
    connectionStatus: 'started',
    loadingStatus: { status: 'started', inProgress: false },
    popoverEntries: [
      { action: 'stop', status: 'done', label: 'Machine stopped' },
      { action: 'start', status: 'done', label: 'Machine started' },
    ],
  },

  // timer-interrupt: phase 0 -> one action done (dismiss timer starts),
  // phase 1 (at 2s, before 3s dismiss) -> new in-progress action interrupts dismiss,
  // phase 2 (at 7s) -> second action done (dismiss timer restarts)
  'timer-interrupt': {
    connectionStatus: 'started',
    loadingStatus: { status: 'started', inProgress: false },
    popoverEntries: [{ action: 'stop', status: 'done', label: 'Machine stopped' }],
  },
  'timer-interrupt:1': {
    connectionStatus: 'starting',
    loadingStatus: { status: 'starting', action: 'start', inProgress: true },
    popoverEntries: [
      { action: 'stop', status: 'done', label: 'Machine stopped' },
      { action: 'start', status: 'in-progress', label: 'Starting machine...' },
    ],
  },
  'timer-interrupt:2': {
    connectionStatus: 'started',
    loadingStatus: { status: 'started', inProgress: false },
    popoverEntries: [
      { action: 'stop', status: 'done', label: 'Machine stopped' },
      { action: 'start', status: 'done', label: 'Machine started' },
    ],
  },
};

interface PhaseSchedule {
  delay: number;
  phase: number;
}

const screenTimelines: Record<string, PhaseSchedule[]> = {
  'dual-spinners': [
    { delay: 5000, phase: 1 },
    { delay: 10000, phase: 2 },
  ],
  'timer-interrupt': [
    { delay: 2000, phase: 1 },
    { delay: 7000, phase: 2 },
  ],
};

export const prototypeScreen = writable<string>('idle');
const prototypePhase = writable<number>(0);

let phaseTimers: ReturnType<typeof setTimeout>[] = [];

prototypeScreen.subscribe(screen => {
  phaseTimers.forEach(clearTimeout);
  phaseTimers = [];
  prototypePhase.set(0);

  const timeline = screenTimelines[screen];
  if (timeline) {
    for (const entry of timeline) {
      phaseTimers.push(
        setTimeout(() => {
          prototypePhase.set(entry.phase);
        }, entry.delay),
      );
    }
  }
});

export const prototypeOverride = derived([prototypeScreen, prototypePhase], ([$screen, $phase]) => {
  const key = $phase > 0 ? `${$screen}:${$phase}` : $screen;
  return overrides[key];
});
