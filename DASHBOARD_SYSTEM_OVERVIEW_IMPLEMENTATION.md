# Dashboard System Overview - Implementation Summary

**Branch**: `dashboard-wip`  
**Status**: Prototype implementation complete, ready for review  
**Date**: January 30, 2026

## Overview

A new Dashboard section called "System Overview" has been implemented to provide users with a quick glance at their container environment status, including Podman machines, Kubernetes clusters, and resource metrics.

## Implementation Status

✅ **COMPLETE** - All files created and build succeeds  
✅ **REACTIVITY FIX** - Toggle buttons properly update UI using Svelte 5 `$state`  
✅ **EXPANDABLE HEADER** - Collapsible section matching "Explore Features" pattern  
✅ **PODMAN ICON** - Using proper `PodIcon` component  
✅ **TESTING BUTTONS** - Relocated to bottom with clear label

## Files Changed

### New Files (7)

1. **`SYSTEM_OVERVIEW_TESTING.md`**  
   - Comprehensive testing guide with detailed instructions
   - Documents all 7 UI states and expected behaviors
   - Visual checklist for verification
   - Known limitations and next steps

2. **`packages/renderer/src/lib/dashboard/SystemOverviewCard.svelte`**  
   - Main wrapper component with expandable header
   - Toggle buttons for testing different states
   - State persistence using configuration properties
   - Integrates with Expandable component pattern

3. **`packages/renderer/src/lib/dashboard/SystemOverviewContent.svelte`**  
   - Main content renderer displaying system status
   - Shows Podman Machine, Kind Cluster, Developer Sandbox
   - Resource metrics with progress bars (CPU, Memory, Disk)
   - Action buttons: Start Machine, See Details in Resources, View
   - Error messages with styled red backgrounds
   - Welcome message for onboarding state

4. **`packages/renderer/src/lib/dashboard/SystemOverviewSection.svelte`**  
   - Simple wrapper component for dashboard registry
   - Imports and renders SystemOverviewCard

5. **`packages/renderer/src/stores/dashboard/system-overview-state.svelte.ts`**  
   - State management using Svelte 5 `$state` runes
   - 7 test states: Live, Machine Stopped, Machine Error, Multiple Errors, Starting, Onboarding, All Running
   - Live state reads from actual `providerInfos` store
   - Mock data generators for each test state
   - Type definitions: `SystemOverviewState`, `MachineStatus`, `SystemStat`, `SystemOverviewData`
   - Helper functions: `getCurrentState()`, `setCurrentState()`, `getSystemOverviewData()`, `getLiveProviderConnection()`

6. **`packages/renderer/src/stores/dashboard/dashboard-page-registry-system-overview.svelte.ts`**  
   - Registry entry factory function
   - Sets System Overview as first section (originalOrder: 0)

### Modified Files (1)

1. **`packages/renderer/src/stores/dashboard/dashboard-page-registry.svelte.ts`**  
   - Added import for `createSystemOverview()`
   - Added System Overview to registry array as first entry
   - Section appears at top of Dashboard

## Key Features

### Live Integration
- **Live Mode**: Reads actual Podman provider status from `providerInfos` store
- **Real Actions**: "Start Machine" button calls actual Podman Desktop API in Live mode
- **Navigation**: "See Details in Resources" navigates to `/preferences/resources`

### 7 Testing States
1. **Live Podman Desktop State** (default) - Shows actual system status
2. **Machine Stopped** - Podman stopped, Kind running
3. **Machine Error** - Podman error with WSL message
4. **Multiple Errors** - All systems showing errors
5. **Starting** - Podman machine starting with spinner
6. **Onboarding** - Welcome message with running systems
7. **All Running** - All systems running with warning on memory usage

### UI Components
- **Status Indicators**: Green glowing dots (running), red dots (error), gray dots (stopped), spinners (starting)
- **Resource Metrics**: Progress bars with color coding (green=normal, orange=warning, red=critical)
- **Error Messages**: Red background boxes with error icons and detailed messages
- **Action Buttons**: Primary (Start Machine), Secondary (View, See Details)
- **Icons**: PodIcon for Podman, KubernetesIcon for clusters
- **Expandable Header**: Collapse/expand with persistence across reloads

### State Management
```typescript
// Reactive state using Svelte 5
const state = $state<{ current: SystemOverviewState }>({ current: 'live' });

// Getter/setter for reactivity
export function getCurrentState(): SystemOverviewState
export function setCurrentState(newState: SystemOverviewState): void

// Data provider
export function getSystemOverviewData(providers: ProviderInfo[]): SystemOverviewData
```

## Architecture & Design Patterns

### Follows Podman Desktop Conventions
- Uses Svelte 5 `$state`, `$derived`, and `$effect` runes
- Integrates with existing stores (`providerInfos`, configuration properties)
- Uses `@podman-desktop/ui-svelte` components (Button, Expandable, Spinner)
- Matches dashboard section styling and layout patterns
- Uses existing color variables (`--pd-content-card-bg`, `--pd-status-running`, etc.)
- Proper TypeScript typing throughout

### Component Structure
```
SystemOverviewSection (wrapper)
  └─ SystemOverviewCard (expandable + toggle buttons)
      └─ SystemOverviewContent (main display)
          ├─ Podman Machine status
          ├─ Resource metrics (CPU, Memory, Disk)
          ├─ Kind Cluster status
          ├─ Developer Sandbox status (in error states)
          └─ Onboarding message
```

### Data Flow
```
providerInfos store (Svelte store)
  └─> system-overview-state.svelte.ts (state management)
      └─> SystemOverviewContent.svelte (reactive display)
          └─> UI updates automatically via $derived
```

## How to Test

### Start Development Mode
```bash
cd /Users/vancura/Repos/_REDHAT_/podman-desktop
pnpm run watch
```

### Navigate & Test
1. Open Podman Desktop
2. Go to Dashboard (home page)
3. System Overview appears as **first section** at top
4. Use toggle buttons at bottom to switch between states
5. Click action buttons to test navigation and API calls
6. Collapse/expand section to test state persistence

### Expected Behaviors
- **Live Mode**: Shows actual Podman status, "Start Machine" works if stopped
- **Mock Modes**: Display different scenarios, buttons disabled except navigation
- **State Resets**: Returns to "Live" mode on page reload
- **Persistence**: Expanded/collapsed state persists across reloads

## Known Limitations (As Expected)

1. **Resource Metrics in Live Mode**: Shows "N/A" - CPU/Memory/Disk usage not available in current Podman Desktop API
2. **Mock State Actions**: "Start Machine" button disabled in mock modes (only functional in Live mode)
3. **Developer Sandbox**: Only appears in "Multiple Errors" state - not detected in Live mode currently
4. **No Real-time Updates**: Resource metrics would need polling/websocket for live updates

## Technical Details

### Type Definitions
```typescript
type SystemOverviewState = 
  | 'live' 
  | 'machine-stopped' 
  | 'machine-error' 
  | 'multiple-errors'
  | 'starting' 
  | 'onboarding' 
  | 'all-running';

type MachineStatus = 'running' | 'stopped' | 'starting' | 'error';

interface SystemStat {
  label: string;
  value: number | null;
  detail: string;
  status: 'normal' | 'warning' | 'critical';
}

interface SystemOverviewData {
  podmanStatus: MachineStatus;
  podmanMachineName?: string;
  podmanVersion?: string;
  podmanError?: string;
  kindStatus?: MachineStatus;
  kindClusterName?: string;
  kindError?: string;
  sandboxStatus?: MachineStatus;
  sandboxError?: string;
  systemStats?: SystemStat[];
  showOnboarding?: boolean;
}
```

### State Management Pattern
The implementation uses Svelte 5's reactive state:
- State stored in module-level `$state()` object
- Accessed via getter/setter functions for encapsulation
- Components use `$derived()` to automatically react to state changes
- No state persistence across reloads (intentional - defaults to Live mode)

### Integration Points
- **Provider Store**: `packages/renderer/src/stores/providers.ts`
- **Dashboard Registry**: `packages/renderer/src/stores/dashboard/dashboard-page-registry.svelte.ts`
- **Configuration**: `window.getConfigurationValue()`, `window.updateConfigurationValue()`
- **Navigation**: `router.goto()` from tinro
- **API Calls**: `window.startProviderConnectionLifecycle()`

## Next Steps for Production

### Must-Have for Production
1. **Add Real Resource Metrics**: Extend Podman Desktop API to expose CPU/Memory/Disk usage from machine
2. **Remove Testing Buttons**: Or hide behind developer mode flag
3. **Add Unit Tests**: Component tests, state management tests
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
5. **Error Handling**: Better error messages, retry logic

### Nice-to-Have Enhancements
1. **Real-time Updates**: Poll or subscribe to resource metrics
2. **Multiple Machines**: Support for multiple Podman machines
3. **Better Kind Detection**: Distinguish Kind from other Kubernetes providers
4. **Developer Sandbox Integration**: Actual OpenShift sandbox detection
5. **Animation Polish**: Smooth transitions between states
6. **Performance Metrics**: Historical charts or trends

### Code Quality
1. **Tests**: Add Vitest unit tests for components and stores
2. **Documentation**: JSDoc comments on public functions
3. **i18n**: Internationalization for all user-facing strings
4. **Accessibility Audit**: WCAG 2.1 AA compliance
5. **Performance**: Lazy loading, memo optimization

## Design Decisions

### Why First Position?
System Overview provides the most critical at-a-glance information, so it appears before Release Notes and Explore Features.

### Why Toggle Buttons?
Testing buttons allow team to review all UI states without needing to manually create error conditions or special system configurations.

### Why Separate State Management?
Isolating state in its own store keeps components clean and makes it easy to swap mock data with live API data later.

### Why Expandable?
Matches existing Dashboard pattern from Explore Features, allows users to hide section if not needed.

### Why No Persistence of Test State?
Always defaulting to Live mode ensures users see their actual system status on reload, avoiding confusion from lingering test states.

## Visual Design

### Layout
- Card-based design with rounded corners
- Consistent padding and spacing (p-4, gap-3/gap-4)
- Responsive grid for resource metrics (grid-cols-3)
- Flex layout for horizontal elements

### Colors
- **Running**: Green with glow effect (`--pd-status-running`)
- **Error**: Red background and borders (`--pd-status-terminated`)
- **Warning**: Orange for high resource usage (`orange-500`)
- **Stopped**: Gray (`--pd-status-stopped`)
- **Background**: Uses theme variables (`--pd-content-card-bg`, `--pd-content-bg`)

### Typography
- **Section Title**: 1.125rem (text-lg), semibold
- **Machine Names**: Base size, medium weight
- **Status Labels**: Small (text-sm)
- **Resource Details**: Extra small (text-xs)
- **Testing Label**: Extra small, light color

## Success Criteria

✅ **Functional**
- All 7 states render correctly with proper data
- Toggle buttons switch between states smoothly
- "Start Machine" calls API in Live mode
- "See Details in Resources" navigates correctly
- Build succeeds without errors or warnings

✅ **Visual**
- Design matches Podman Desktop patterns
- Status indicators display correctly
- Progress bars animate smoothly
- Error messages are clear and styled properly
- Responsive on different screen sizes

✅ **Integration**
- Appears as first section on Dashboard
- Expandable state persists across reloads
- Integrates with existing provider store
- No conflicts with other dashboard sections

## Questions for Team Review

1. **Position**: Should System Overview stay as first section, or move after Release Notes?
2. **Testing Buttons**: Keep them visible, hide behind dev flag, or remove entirely?
3. **Resource Metrics**: Priority for API implementation? Which metrics are most valuable?
4. **Multiple Machines**: Handle multiple Podman machines in UI, or show only first/primary?
5. **Kubernetes Detection**: How to distinguish Kind vs other K8s? Should we show all clusters?
6. **Error Recovery**: Auto-retry for failed connections? Refresh button?
7. **Notifications**: Toast notifications for state changes (machine started/stopped)?

## Related Files to Review

For full context, review these existing files:
- `packages/renderer/src/lib/dashboard/ExploreFeaturesSection.svelte` (similar expandable pattern)
- `packages/renderer/src/stores/providers.ts` (provider data source)
- `packages/renderer/src/stores/configurationProperties.ts` (configuration management)
- `packages/renderer/src/lib/ui/Button.svelte` (button component styles)

## Git Information

**Current Branch**: `dashboard-wip`  
**Files to Commit**: 7 files (6 new, 1 modified)

```bash
# View changes
git status
git diff

# Commit when ready
git add packages/renderer/src/lib/dashboard/System*.svelte
git add packages/renderer/src/stores/dashboard/system-overview-state.svelte.ts
git add packages/renderer/src/stores/dashboard/dashboard-page-registry-system-overview.svelte.ts
git add packages/renderer/src/stores/dashboard/dashboard-page-registry.svelte.ts
git add SYSTEM_OVERVIEW_TESTING.md
git commit -m "Add System Overview section to Dashboard"
```

---

**Document Purpose**: Context for AI agents and team review  
**Last Updated**: January 30, 2026  
**Contact**: See branch author for questions
