/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { KubernetesObject } from '@kubernetes/client-node';
import type { ContextGeneralState, ContributionInfo, ForwardConfig } from '@podman-desktop/core-api';
import { NavigationPage } from '@podman-desktop/core-api';
import { AppearanceSettings } from '@podman-desktop/core-api/appearance';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { readable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import AppNavigation from './AppNavigation.svelte';
import { handleNavigation } from './navigation';
import { onDidChangeConfiguration } from './stores/configurationProperties';
import { contributions } from './stores/contribs';
import { fetchNavigationRegistries } from './stores/navigation/navigation-registry';

vi.mock(import('./navigation'), () => ({
  handleNavigation: vi.fn(),
}));

const eventsMock = vi.fn();

const callbacks = new Map<string, (arg: unknown) => void>();

vi.mock(import('/@/stores/kubernetes-contexts-state'), async () => {
  return {};
});

const NAV_BAR_LAYOUT = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationAppearance}`;

beforeEach(() => {
  vi.mocked(handleNavigation).mockClear();
});

// fake the window object
beforeAll(() => {
  Object.defineProperty(window, 'events', { value: eventsMock });
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
  Object.defineProperty(window, 'sendNavigationItems', { value: vi.fn() });
  onDidChangeConfiguration.addEventListener = vi.fn().mockImplementation((message: string, callback: () => void) => {
    callbacks.set(message, callback);
  });
});

test('Test rendering of the navigation bar with empty items', async (_arg: unknown) => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<ForwardConfig[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);

  // init navigation registry
  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();

  const dasboard = screen.getByRole('link', { name: 'Dashboard' });
  expect(dasboard).toBeInTheDocument();
  const containers = screen.getByRole('link', { name: 'Containers' });
  expect(containers).toBeInTheDocument();
  const pods = screen.getByRole('link', { name: 'Pods' });
  expect(pods).toBeInTheDocument();
  const images = screen.getByRole('link', { name: 'Images' });
  expect(images).toBeInTheDocument();
  const volumes = screen.getByRole('link', { name: 'Volumes' });
  expect(volumes).toBeInTheDocument();
  const settings = screen.getByRole('link', { name: 'Settings' });
  expect(settings).toBeInTheDocument();
});

test('Test contributions', () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  contributions.set([
    {
      id: 'dashboard-tab',
      name: 'foo1',
      extensionId: 'my.extension1',
    } as unknown as ContributionInfo,
    {
      id: 'dashboard-tab',
      name: 'foo2',
      extensionId: 'my.extension2',
    } as unknown as ContributionInfo,
  ]);

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });
});

test('NAV_BAR_LAYOUT updates on configuration change', async () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  // init navigation registry
  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });
  await tick();

  callbacks.get(NAV_BAR_LAYOUT)?.({ detail: { key: NAV_BAR_LAYOUT, value: AppearanceSettings.IconAndTitle } });
  await tick();
  expect(screen.getByLabelText('Dashboard title')).toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveClass('min-w-fit');

  callbacks.get(NAV_BAR_LAYOUT)?.({ detail: { key: NAV_BAR_LAYOUT, value: AppearanceSettings.Icon } });
  await tick();
  expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveClass('min-w-leftnavbar');
});

test('renders Accounts nav item', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });

  // Accounts NavItem uses tooltip="" so its link aria-label is ""; query by attribute directly
  const accountsLink = document.querySelector('nav a[aria-label=""]');
  expect(accountsLink).toBeInTheDocument();
});

test('clicking Settings when URL starts with /preferences calls exitSettingsCallback', async () => {
  const exitSettingsCallback = vi.fn();
  const meta = { url: '/preferences/resources' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback });

  await fireEvent.click(screen.getByRole('link', { name: 'Settings' }));

  expect(exitSettingsCallback).toHaveBeenCalledOnce();
  expect(vi.mocked(handleNavigation)).not.toHaveBeenCalled();
});

test('clicking Settings when URL does not start with /preferences navigates to resources', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });

  await fireEvent.click(screen.getByRole('link', { name: 'Settings' }));

  expect(vi.mocked(handleNavigation)).toHaveBeenCalledWith({ page: NavigationPage.RESOURCES });
});

test('NAV_BAR_LAYOUT callback ignores event without detail property', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  callbacks.get(NAV_BAR_LAYOUT)?.(new Event('change'));
  await tick();

  expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument();
});

test('NAV_BAR_LAYOUT callback ignores event with mismatched key', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  callbacks.get(NAV_BAR_LAYOUT)?.({ detail: { key: 'some.other.setting', value: AppearanceSettings.IconAndTitle } });
  await tick();

  expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument();
});

test('removeEventListener is called for NAV_BAR_LAYOUT when component is destroyed', async () => {
  const removeEventListenerMock = vi.fn();
  onDidChangeConfiguration.removeEventListener = removeEventListenerMock;

  const meta = { url: '/' } as unknown as TinroRouteMeta;
  const { unmount } = render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });

  unmount();

  expect(removeEventListenerMock).toHaveBeenCalledWith(NAV_BAR_LAYOUT, expect.any(Function));
});

test('scroll thumb is hidden when scroll region has no overflow', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  expect(document.querySelector('[data-nav-scroll-thumb]')).not.toBeInTheDocument();
});

test('scroll thumb appears with correct aria attributes when content overflows', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  expect(scrollRegion).toBeInTheDocument();
  if (!scrollRegion) return;

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollRegion, 'clientHeight', { value: 200, configurable: true });
  Object.defineProperty(scrollRegion, 'scrollTop', { value: 50, configurable: true, writable: true });

  await fireEvent.scroll(scrollRegion);

  const thumb = await waitFor(() => {
    const el = document.querySelector('[data-nav-scroll-thumb]');
    if (!el) throw new Error('thumb not yet visible');
    return el;
  });

  expect(thumb).toHaveAttribute('role', 'scrollbar');
  expect(thumb).toHaveAttribute('aria-controls', 'nav-scroll-region');
  expect(thumb).toHaveAttribute('aria-valuemin', '0');
  expect(thumb).toHaveAttribute('aria-valuemax', '100');
  expect(Number(thumb.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
});

test('scroll thumb disappears after scroll when content fits again', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  if (!scrollRegion) return;

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollRegion, 'clientHeight', { value: 200, configurable: true });
  Object.defineProperty(scrollRegion, 'scrollTop', { value: 0, configurable: true, writable: true });
  await fireEvent.scroll(scrollRegion);
  await waitFor(() => {
    if (!document.querySelector('[data-nav-scroll-thumb]')) throw new Error('thumb not yet visible');
  });

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 200, configurable: true });
  await fireEvent.scroll(scrollRegion);
  await tick();

  expect(document.querySelector('[data-nav-scroll-thumb]')).not.toBeInTheDocument();
});

test('scroll region pointerdown on a nav link does not modify scrollTop', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  if (!scrollRegion) return;

  let scrollTopModified = false;
  Object.defineProperty(scrollRegion, 'scrollTop', {
    get: () => 0,
    set: () => {
      scrollTopModified = true;
    },
    configurable: true,
  });

  const navLink = scrollRegion.querySelector('a');
  if (navLink) {
    await fireEvent.pointerDown(navLink, { clientY: 100 });
  }

  expect(scrollTopModified).toBe(false);
});

test('scroll region pointerdown on non-interactive area modifies scrollTop', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  if (!scrollRegion) return;

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollRegion, 'clientHeight', { value: 200, configurable: true });

  let scrollTopModified = false;
  Object.defineProperty(scrollRegion, 'scrollTop', {
    get: () => 0,
    set: () => {
      scrollTopModified = true;
    },
    configurable: true,
  });

  await fireEvent.pointerDown(scrollRegion, { target: scrollRegion, clientY: 100 });

  expect(scrollTopModified).toBe(true);
});

test('scroll thumb wheel event scrolls the scroll region', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  if (!scrollRegion) return;

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollRegion, 'clientHeight', { value: 200, configurable: true });

  let currentScrollTop = 0;
  Object.defineProperty(scrollRegion, 'scrollTop', {
    get: () => currentScrollTop,
    set: (v: number) => {
      currentScrollTop = v;
    },
    configurable: true,
  });

  await fireEvent.scroll(scrollRegion);
  const thumb = await waitFor(() => {
    const el = document.querySelector('[data-nav-scroll-thumb]');
    if (!el) throw new Error('thumb not visible');
    return el;
  });

  await fireEvent.wheel(thumb, { deltaY: 80 });

  expect(currentScrollTop).toBe(80);
});

test('scroll thumb drag updates scroll position on pointermove', async () => {
  const meta = { url: '/' } as unknown as TinroRouteMeta;
  await fetchNavigationRegistries();
  render(AppNavigation, { meta, exitSettingsCallback: vi.fn() });
  await tick();

  const scrollRegion = document.getElementById('nav-scroll-region');
  if (!scrollRegion) return;

  Object.defineProperty(scrollRegion, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollRegion, 'clientHeight', { value: 200, configurable: true });

  let currentScrollTop = 0;
  Object.defineProperty(scrollRegion, 'scrollTop', {
    get: () => currentScrollTop,
    set: (v: number) => {
      currentScrollTop = v;
    },
    configurable: true,
  });

  await fireEvent.scroll(scrollRegion);
  const thumb = await waitFor(() => {
    const el = document.querySelector('[data-nav-scroll-thumb]');
    if (!el) throw new Error('thumb not visible');
    return el;
  });

  await fireEvent.pointerDown(thumb, { clientY: 50 });
  await fireEvent.pointerMove(window, { clientY: 100 });
  await tick();

  expect(currentScrollTop).toBeGreaterThan(0);
});
