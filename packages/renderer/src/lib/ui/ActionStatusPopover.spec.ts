/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { PopoverEntry } from '/@/stores/prototype-screen';

import ActionStatusPopover from './ActionStatusPopover.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

const inProgressEntry: PopoverEntry = { action: 'start', status: 'in-progress', label: 'Starting machine...' };
const doneEntry: PopoverEntry = { action: 'stop', status: 'done', label: 'Machine stopped' };

test('popover is hidden when visible is false', () => {
  render(ActionStatusPopover, {
    entries: [inProgressEntry],
    leftPx: 100,
    visible: false,
  });

  expect(screen.queryByRole('status', { name: 'Action status' })).not.toBeInTheDocument();
});

test('popover is hidden when entries are empty', () => {
  render(ActionStatusPopover, {
    entries: [],
    leftPx: 100,
    visible: true,
  });

  expect(screen.queryByRole('status', { name: 'Action status' })).not.toBeInTheDocument();
});

test('popover is shown when visible is true and entries exist', () => {
  render(ActionStatusPopover, {
    entries: [inProgressEntry],
    leftPx: 100,
    visible: true,
  });

  const status = screen.getByRole('status', { name: 'Action status' });
  expect(status).toBeInTheDocument();
  expect(status).toHaveTextContent('Starting machine...');
});

test('popover renders in-progress entry with spinner', () => {
  render(ActionStatusPopover, {
    entries: [inProgressEntry],
    leftPx: 100,
    visible: true,
  });

  expect(screen.getByRole('status', { name: 'Action status' })).toHaveTextContent('Starting machine...');
});

test('popover renders done entry with check icon', () => {
  render(ActionStatusPopover, {
    entries: [doneEntry],
    leftPx: 100,
    visible: true,
  });

  expect(screen.getByRole('status', { name: 'Action status' })).toHaveTextContent('Machine stopped');
});

test('popover renders multiple entries', () => {
  render(ActionStatusPopover, {
    entries: [doneEntry, inProgressEntry],
    leftPx: 100,
    visible: true,
  });

  const status = screen.getByRole('status', { name: 'Action status' });
  expect(status).toHaveTextContent('Machine stopped');
  expect(status).toHaveTextContent('Starting machine...');
});

test('popover is positioned at leftPx', () => {
  render(ActionStatusPopover, {
    entries: [inProgressEntry],
    leftPx: 150,
    visible: true,
  });

  const popover = screen.getByRole('status', { name: 'Action status' });
  expect(popover).toHaveStyle('left: 150px');
});
