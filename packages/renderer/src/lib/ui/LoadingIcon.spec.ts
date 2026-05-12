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

import '@testing-library/jest-dom/vitest';

import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import LoadingIcon from './LoadingIcon.svelte';

test('Expect default size', async () => {
  render(LoadingIcon, {
    icon: faPlayCircle,
    loading: true,
  });
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();

  expect(loadingIcon).not.toHaveAttribute('style');
});

test('Expect specified size', async () => {
  render(LoadingIcon, {
    icon: faPlayCircle,
    iconSize: '2x',
    loading: true,
  });
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();

  expect(loadingIcon).toHaveAttribute('style', expect.stringContaining('font-size: 2em;'));
});

test('Expect spinner visible when loading', async () => {
  render(LoadingIcon, {
    icon: faPlayCircle,
    loading: true,
  });
  const spinner = screen.getByRole('status', { name: 'spinner' });
  expect(spinner).toBeInTheDocument();
});

test('Expect spinner hidden when not loading', async () => {
  render(LoadingIcon, {
    icon: faPlayCircle,
    loading: false,
  });
  const spinner = screen.queryByRole('status', { name: 'spinner' });
  expect(spinner).not.toBeInTheDocument();
});
