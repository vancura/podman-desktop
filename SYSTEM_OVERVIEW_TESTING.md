# System Overview Implementation - Testing Guide

## ✅ Implementation Complete

All files have been created and the build succeeds. The System Overview section has been successfully ported from the prototype to Podman Desktop.

**✅ REACTIVITY FIX APPLIED**: Toggle buttons now properly update the UI when clicked. The state management uses Svelte 5's `$state` with getter/setter functions to ensure reactive updates.

**✅ EXPANDABLE HEADER ADDED**: System Overview now uses the same collapsible header component as Explore Features, with proper title case "System Overview" and expand/collapse functionality that persists user preference.

**✅ PODMAN ICON UPDATED**: Replaced the generic circle icon with the proper PodIcon component that matches Podman's branding.

**✅ TESTING BUTTONS RELOCATED**: Toggle buttons moved to the bottom of the section with a "Testing States:" label, keeping them accessible but out of the way of the main content.

## Files Created

### New Files (5)
1. `/packages/renderer/src/stores/dashboard/system-overview-state.svelte.ts` - State management and mock data
2. `/packages/renderer/src/stores/dashboard/dashboard-page-registry-system-overview.svelte.ts` - Registry entry
3. `/packages/renderer/src/lib/dashboard/SystemOverviewSection.svelte` - Wrapper component
4. `/packages/renderer/src/lib/dashboard/SystemOverviewCard.svelte` - Card with toggle buttons
5. `/packages/renderer/src/lib/dashboard/SystemOverviewContent.svelte` - Main content display

### Modified Files (1)
1. `/packages/renderer/src/stores/dashboard/dashboard-page-registry.svelte.ts` - Added System Overview to registry

## How to Test

### 1. Start Podman Desktop in Dev Mode

```bash
cd /Users/vancura/Repos/_REDHAT_/podman-desktop
pnpm run watch
```

### 2. Navigate to Dashboard

- Open Podman Desktop
- Go to the Dashboard page (home)
- System Overview should be the **first section** at the top

### 3. Test State Toggles

At the **bottom** of the System Overview section, you should see:
- Label: "Testing States:"
- 7 toggle buttons below it:

1. **Live Podman Desktop State** (default)
2. **Machine Stopped**
3. **Machine Error**
4. **Multiple Errors**
5. **Starting**
6. **Onboarding**
7. **All Running**

Click each button to switch between states.

### 4. Expected Behavior for Each State

#### Live Podman Desktop State
- ✅ Shows actual Podman machine status from system
- ✅ Resource metrics show "N/A" (not yet available in API)
- ✅ "Start Machine" button works (calls real API)
- ✅ "See Details in Resources" navigates to `/preferences/resources`

#### Machine Stopped
- ✅ Podman Machine shows as "Stopped"
- ✅ "Start Machine" button visible (disabled - mock mode only)
- ✅ Kind Cluster shows as "Running"

#### Machine Error
- ✅ Podman Machine shows "Error" status with red background
- ✅ Error message: "Connection failed: WSL distribution 'podman-machine-default' not responding"
- ✅ "See Details in Resources" button visible
- ✅ Kind Cluster shows as "Stopped"

#### Multiple Errors
- ✅ Podman Machine shows error
- ✅ Kind Cluster shows error with message
- ✅ Developer Sandbox shows error
- ✅ All three systems have red backgrounds and error messages

#### Starting
- ✅ Podman Machine shows "Starting" status
- ✅ Spinner animation displays next to status
- ✅ No resource metrics shown while starting

#### Onboarding
- ✅ Podman Machine shows "Running"
- ✅ Resource metrics displayed (CPU: 40%, Memory: 70%, Disk: 20%)
- ✅ Welcome message at bottom: "🎉 Welcome to Podman Desktop!"

#### All Running
- ✅ Podman Machine shows "Running"
- ✅ Resource metrics displayed with WARNING: Memory at 92% (orange color)
- ✅ CPU: 40%, Disk: 20% (normal - green)

### Visual Elements to Verify

### Header and Expandable
- ✅ Title shows "System Overview" (title case, not ALL CAPS)
- ✅ Expandable arrow button (matches Explore Features)
- ✅ Click arrow to collapse/expand section
- ✅ Expanded state persists across page reloads
- ✅ Text styling matches other dashboard sections (1.125rem, semibold)

### Testing Buttons (Bottom of Section)
- ✅ "Testing States:" label above buttons
- ✅ 7 toggle buttons in a row (wraps on narrow screens)
- ✅ Buttons have border separator line above them
- ✅ Selected button has highlighted state (tab style)

### Status Indicators
- ✅ Green glowing dot for "Running" status
- ✅ Red dot for "Error" status
- ✅ Gray dot for "Stopped" status
- ✅ Spinner for "Starting" status

### Progress Bars (Resource Metrics)
- ✅ Green bars for normal usage
- ✅ Orange bar for warning (92% memory)
- ✅ Progress bars animate/transition smoothly
- ✅ Percentage and actual values displayed

### Error Messages
- ✅ Red background with border for error states
- ✅ Error icon visible
- ✅ Error text readable and properly formatted

### Buttons
- ✅ "Start Machine" - primary blue button
- ✅ "See Details in Resources" - secondary button with border
- ✅ "View" - secondary button
- ✅ "Manage" link in header navigates to Resources
- ✅ Disabled state for buttons in mock modes (except See Details)

### Icons
- ✅ Podman icon (pod/container icon) for Podman Machine
- ✅ Kubernetes icon for Kind Cluster
- ✅ Kubernetes icon for Developer Sandbox

## Interactive Testing Checklist

- [ ] **Expand/Collapse**: Click the arrow to expand and collapse System Overview
- [ ] **State Persistence**: Collapse section, reload page - should stay collapsed
- [ ] **Expand State Persistence**: Expand section, reload page - should stay expanded
- [ ] Toggle between all 7 states - UI updates correctly
- [ ] In Live mode, click "Start Machine" (if machine stopped) - calls API
- [ ] Click "See Details in Resources" - navigates to `/preferences/resources`
- [ ] Reload page - state resets to "Live Podman Desktop State" (default)
- [ ] Verify styling matches Podman Desktop design (dark theme, consistent spacing)
- [ ] Check responsive behavior on different window sizes
- [ ] Verify toggle buttons scroll horizontally on narrow screens

## Known Limitations (As Expected)

1. **Resource Metrics in Live Mode**: Shows "N/A" because CPU/Memory/Disk usage is not available in current Podman Desktop API
2. **Mock State Actions**: "Start Machine" button is disabled in mock modes (only functional in Live mode)
3. **Developer Sandbox**: Only appears in "Multiple Errors" state (not detected in Live mode currently)

## Design Adaptations from Prototype

The implementation adapts the prototype design to match Podman Desktop's existing design language:

- Uses Podman Desktop's color variables (`--pd-content-card-bg`, `--pd-status-running`, etc.)
- Uses Podman Desktop's Button component with correct types (primary, secondary, tab)
- Uses existing StatusIcon patterns for consistent status display
- Matches existing dashboard section spacing and layout
- Uses Podman Desktop's existing icon library

## Next Steps for Production

If this prototype is approved by the team:

1. **Add Real Resource Metrics**: Extend Podman Desktop API to expose CPU/Memory/Disk usage
2. **Improve Kind Detection**: Better logic to detect Kind clusters vs other Kubernetes
3. **Add Tests**: Unit tests for state management and component rendering
4. **Add Developer Sandbox Support**: Integrate with OpenShift/sandbox provider detection
5. **Accessibility**: Add ARIA labels and keyboard navigation
6. **Animation Polish**: Add smooth transitions between states

## Troubleshooting

### System Overview not appearing?
- Check browser console for errors
- Verify dashboard registry includes System Overview
- Rebuild: `pnpm run build:renderer`

### Toggle buttons not working?
- Check state management store is properly imported
- Verify no console errors when clicking buttons

### Styling looks wrong?
- CSS variables may not be defined - check theme
- Clear browser cache and reload

## Success Criteria

✅ **Implementation Complete When:**
- All 7 states render correctly
- Toggle buttons switch between states smoothly
- "Start Machine" works in Live mode
- "See Details in Resources" navigates correctly
- Build succeeds without errors
- System Overview appears as first section on Dashboard
- Visual design matches Podman Desktop patterns

---

**Status**: Ready for team review and testing
**Branch**: `dashboard-wip`
**Prototype Purpose**: Demonstration for team feedback, not production-ready
