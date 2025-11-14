# Podman Desktop Screenshot Tool - MVP Implementation

## Overview

This is the MVP implementation of the Podman Desktop Branded Screenshot Tool. It provides the core backend functionality to capture, process, and brand screenshots of the Podman Desktop application for use across various social media platforms and documentation.

## Implementation Status

### ✅ Completed (MVP)

1. **Core Backend Architecture**
   - `ScreenshotManager.ts` - Window management and capture logic
   - `ImageProcessor.ts` - Image processing with sharp library
   - `ThemeLoader.ts` - Theme and platform configuration loader
   - `types.ts` - TypeScript type definitions
   - `index.ts` - Main entry point and API

2. **Configuration System**
   - `platforms.json` - 17 platform presets (LinkedIn, Twitter, Instagram, etc.)
   - `themes/default.json` - Clean default theme
   - `themes/minimal.json` - Minimal shadow theme
   - `themes/halloween.json` - Halloween themed gradient
   - `themes/red-hat-summit.json` - Red Hat Summit branding

3. **IPC Integration**
   - Main process IPC handlers registered in `packages/main/src/plugin/index.ts`
   - Preload API exposed in `packages/preload/src/index.ts`
   - Available functions:
     - `getScreenshotPlatforms()` - Get all platform presets
     - `getScreenshotThemes()` - Get all themes
     - `validateScreenshotPlatformSize(platformId)` - Validate platform size
     - `generateScreenshotFilename(options)` - Generate suggested filename
     - `captureScreenshot(options)` - Capture and process screenshot

4. **Menu Integration**
   - Added "Take Branded Screenshot..." to Help menu
   - Keyboard shortcut: `Cmd+Shift+Alt+S` (macOS) / `Ctrl+Shift+Alt+S` (Windows/Linux)

5. **Dependencies**
   - Sharp 0.33.0 added to package.json for image processing

### 🚧 Not Implemented (Future Work)

1. **UI Components**
   - ScreenshotDialog.svelte - Configuration dialog
   - PreviewWindow.svelte - Preview window
   - These were deprioritized for MVP due to time constraints

2. **Features**
   - Live window preview during configuration
   - Theme switching integration
   - Retake functionality
   - Save dialog integration
   - Keyboard shortcut handler in renderer

## Usage

### Programmatic API (Renderer Process)

Once the UI is implemented, the renderer can call:

```typescript
// Get available platforms
const platforms = await window.getScreenshotPlatforms();

// Get available themes
const themes = await window.getScreenshotThemes();

// Validate platform size
const validation = await window.validateScreenshotPlatformSize('linkedin-post');
if (!validation.valid) {
  console.warn(validation.warning);
}

// Capture screenshot
const options = {
  platformId: 'linkedin-post',
  themeId: 'default',
  appearance: 'dark',
  format: 'avif'
};

const imageBuffer = await window.captureScreenshot(options);

// Generate filename
const filename = await window.generateScreenshotFilename(options);
// Returns: "podman-desktop-app-linkedinpost-2025-11-14-15-30-45.avif"
```

### Platform Presets

Available platforms with their dimensions:

| Platform | Category | Dimensions |
|----------|----------|------------|
| Current Size | Custom | Uses current window size |
| LinkedIn Post | Social Media | 1200x1200 |
| LinkedIn Article | Social Media | 1200x627 |
| X/Twitter Post | Social Media | 1200x675 |
| Mastodon | Social Media | 1200x630 |
| Facebook Post | Social Media | 1200x630 |
| Reddit | Social Media | 1200x630 |
| Instagram Post | Social Media | 1080x1080 |
| Instagram Story | Video | 1080x1920 |
| YouTube Thumbnail | Video | 1280x720 |
| Blog Hero | Publishing | 1920x1080 |
| Newsletter Header | Publishing | 600x300 |
| Documentation | Publishing | 1600x900 |
| GitHub Social Preview | Publishing | 1280x640 |
| Presentation Slide 16:9 | Presentation | 1920x1080 |
| Presentation Slide 4:3 | Presentation | 1024x768 |
| Product Hunt | Social Media | 1270x760 |

### Theme System

Each theme defines:
- Background (solid color, gradient, or image)
- Window shadow (position, blur, opacity, color)
- Border (radius, width, color)
- Window chrome style
- Padding around the screenshot

Example theme structure:

```json
{
  "id": "default",
  "name": "Default",
  "description": "Clean default style with subtle shadow",
  "background": {
    "type": "solid",
    "color": "#1a1d29"
  },
  "window": {
    "shadow": {
      "x": 0,
      "y": 20,
      "blur": 60,
      "spread": 0,
      "opacity": 0.5,
      "color": "#000000"
    },
    "border": {
      "radius": 12,
      "width": 0,
      "color": "transparent"
    },
    "chrome": "frameless"
  },
  "padding": {
    "top": 80,
    "right": 80,
    "bottom": 80,
    "left": 80
  }
}
```

## Architecture

### File Structure

```
packages/main/src/plugin/screenshot-tool/
├── index.ts                    # Main entry point
├── ScreenshotManager.ts        # Window management and capture
├── ImageProcessor.ts           # Image processing with sharp
├── ThemeLoader.ts              # Configuration loader
├── types.ts                    # TypeScript types
├── platforms.json              # Platform dimension presets
├── themes/
│   ├── default.json
│   ├── minimal.json
│   ├── halloween.json
│   ├── red-hat-summit.json
│   └── backgrounds/            # Future: background images
└── README.md                   # This file
```

### Data Flow

1. **User Triggers Screenshot**
   - Menu click or keyboard shortcut
   - (Future) Opens ScreenshotDialog.svelte

2. **Configuration**
   - User selects platform, theme, appearance, format
   - Window resizes to preview target size
   - Validation warns if size exceeds screen

3. **Capture**
   - `ScreenshotManager.captureScreenshot(options)`
   - Stores original window state
   - Applies configuration (resize window, blur elements)
   - Waits for stabilization (300ms)
   - Captures window at HiDPI resolution

4. **Processing**
   - `ImageProcessor.process(image, format)`
   - Creates background layer (solid/gradient/image)
   - Creates shadow layer (blur, opacity, offset)
   - Applies border/corner radius to screenshot
   - Composites all layers
   - Converts to target format (AVIF/WebP/PNG/JPEG)
   - (Future) Adds GDPR-friendly metadata

5. **Preview & Save**
   - (Future) Shows PreviewWindow.svelte
   - User can retake or save
   - Restores original window state

## Dependencies

### sharp

The screenshot tool uses [`sharp`](https://sharp.pixelplumbing.com/) for high-performance image processing:

- Fast resizing and compositing
- Support for multiple formats (AVIF, WebP, PNG, JPEG)
- SVG rendering for gradients
- Low memory footprint

Sharp is a native module that requires rebuilding for Electron. The postinstall script should handle this automatically.

## Testing

### Manual Testing Steps

1. **Start Podman Desktop**
   ```bash
   pnpm run watch
   ```

2. **Open Developer Console**
   - View > Toggle Developer Tools

3. **Test Platform Loading**
   ```javascript
   await window.getScreenshotPlatforms()
   // Should return array of 17 platforms
   ```

4. **Test Theme Loading**
   ```javascript
   await window.getScreenshotThemes()
   // Should return array of 4 themes
   ```

5. **Test Screenshot Capture**
   ```javascript
   const options = {
     platformId: 'any',  // Use current size
     themeId: 'default',
     appearance: 'dark',
     format: 'png'
   };
   const buffer = await window.captureScreenshot(options);
   console.log('Captured:', buffer.length, 'bytes');
   ```

6. **Save Screenshot to File (Testing Only)**
   ```javascript
   const fs = require('fs');
   fs.writeFileSync('/tmp/test-screenshot.png', buffer);
   ```

### Known Limitations (MVP)

1. **No UI** - Must use developer console for testing
2. **No Save Dialog** - Must manually save buffer in console
3. **No Preview** - Can't see result before saving
4. **No Retake** - Must run capture again
5. **No Theme Switching** - Appearance parameter not fully implemented
6. **No Gradients** - SVG gradient rendering may need testing
7. **No Background Images** - Theme system supports it, but no images provided

## Future Enhancements

See the main implementation instructions document for a comprehensive list of Phase 2 features, including:

- Complete Svelte UI components
- Demo mode (sanitize sensitive data)
- Batch capture multiple views
- Visual theme editor
- Analytics integration
- Custom gradient presets
- Animation/video export
- Template system with text overlays
- Cloud theme sync
- A/B testing support

## Troubleshooting

### Sharp Installation Issues

If sharp fails to install:

```bash
# Clear node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still failing, rebuild sharp manually
pnpm rebuild sharp
```

### TypeScript Errors

If you see TypeScript errors about missing types:

```bash
# Rebuild preload types
pnpm run build:preload:types
```

### Window Not Resizing

- Check that platform has non-null width/height
- Verify screen size is larger than target size
- Check console for validation warnings

### Image Processing Errors

- Ensure sharp is properly installed
- Check that theme JSON is valid
- Verify gradient syntax in theme files
- Check console for detailed error messages

## License

Apache-2.0 (same as Podman Desktop)

## Credits

Implemented as part of the Podman Desktop Screenshot Tool feature request.
