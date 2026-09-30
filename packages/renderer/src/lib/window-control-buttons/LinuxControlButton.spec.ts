/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import LinuxControlButton from './LinuxControlButton.svelte';

test('Check Minimize', async () => {
  render(LinuxControlButton, { name: 'Minimize' });

  const customButton = screen.getByRole('button', { name: 'Minimize' });
  expect(customButton).toBeInTheDocument();

  // check the tooltip of the button is 'Minimize'
  await fireEvent.mouseLeave(screen.getByTestId('tooltip-trigger'));
  await fireEvent.mouseEnter(screen.getByTestId('tooltip-trigger'));
  expect(await screen.findByRole('tooltip')).toHaveTextContent('Minimize');
});
