# Changelog

All notable changes to Focus Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2024-12-11

### Added

- **Status Indicators**: Added blinking status indicators in the profile dialog to show when Activity Monitor and Auto-Stop timer are active
  - Activity Monitor indicator (primary color) displays when monitoring is enabled
  - Auto-Stop timer indicator (accent color) displays when auto-stop is enabled
  - Icons appear inline to the left of the profile avatar with proper spacing
- **Quit Prevention**: Implemented smart quit prevention to protect active tracking sessions
  - App prevents quitting when trackers are running
  - Displays warning dialog: "You have active time trackers running!"
  - Users can choose to "Stop All & Quit" or "Cancel"
  - Automatically stops all trackers before quitting if user confirms
- **System Suspend Protection**: Added protection for system sleep/hibernate events
  - Detects when system is going to sleep or hibernate
  - Shows alert notification if trackers are running
  - Prevents data loss from unexpected system suspension
- **Active Tracker Communication**: Enhanced IPC communication between main process and renderer
  - Dashboard now notifies main process about active tracker status in real-time
  - Main process maintains accurate state of running trackers
  - Enables intelligent quit prevention and suspend handling

### Fixed

- **UI Re-render Issue**: Fixed critical bug where UI didn't update when auto-stop timer triggered
  - TimeTracker component now properly syncs `isRunning` state with `session` prop
  - When session is removed (e.g., by auto-stop), component updates local state correctly
  - `stopAllActiveSessions` now properly fetches fresh data from server
  - Removed unnecessary state clearing that prevented proper updates
  - UI now seamlessly reflects tracker state changes without manual refresh

### Improved

- **Code Quality**: Removed all debug console logs from renderer processes

  - Cleaned up ProfileDialog component
  - Cleaned up TimeTrackingDashboard component
  - Kept only essential error logging for debugging
  - Improved code readability and performance

- **User Experience**: Enhanced profile dialog with visual status feedback
  - Status indicators provide at-a-glance visibility of active features
  - Smooth animations and transitions for status changes
  - Compact, non-intrusive design that doesn't clutter the UI

### Technical Details

#### Modified Files

- `src/electron/main.cts`: Added dialog and powerMonitor imports, quit prevention logic, and suspend handling
- `src/electron/preload.cts`: Added IPC methods for active tracker status and event subscriptions
- `types.d.ts`: Added new event types and window definitions for tracker communication
- `src/components/ProfileDialog.tsx`: Added status indicators and removed debug logs
- `src/components/time-tracking-dashboard.tsx`: Fixed state sync, added IPC communication, removed debug logs
- `src/components/time-tracker.tsx`: Fixed session state synchronization for proper re-rendering

#### New IPC Events

- `active-trackers-status`: Sends active tracker status from renderer to main process
- `stop-all-trackers`: Main process event to request stopping all trackers
- `system-suspending`: Notification event when system is suspending

#### Architecture Changes

- Main process now maintains `hasActiveTrackers` state variable
- Dashboard communicates tracker status changes in real-time
- Power monitor integration for system event detection
- Enhanced dialog system for user confirmations

---

## [1.2.9] - 2024-12-06

### Improved

- Enhanced activity monitor with system sleep/wake handling
- Added enhanced debugging capabilities for activity monitoring

## [1.2.8] - 2024-12-01

### Improved

- Enhanced offline state handling in trackers and archives tabs
- Updated error messages for better clarity
- Standardized code formatting across dashboard components

## [1.2.7] - 2024-10-09

### Added

- Confirmation dialog for tracker archival
- Form validation for tracker editing
- UI components for improved tracker management

### Changed

- Updated titlebar layout (removed clock icon)
- Set GitHub releases to draft mode in electron-builder config

## [1.2.6] - 2024-10-05

### Changed

- Made tray and window minimize behavior Windows-specific for better platform integration

## [1.2.5] - 2024-09-29

### Added

- Platform-specific title bar styling for macOS and Windows/Linux
- Linux-specific protocol handler registration
- Desktop integration settings for Linux

### Improved

- Optimized state initialization in StatisticsView component
- Updated electron-builder desktop configuration format

## [1.2.4] - 2024-09-29

### Fixed

- Corrected Node.js version typo in release workflow

### Improved

- Added environment file generation in CI/CD with Supabase configs

## [1.2.3] - 2024-09-29

### Added

- CI/CD workflow for cross-platform app releases
- localStorage persistence for selected tabs, tracker, and time range preferences

### Improved

- Expanded package.json author field with contact details
- Migrated release workflow to PNPM package manager
- Updated app icon to 512x512 resolution
- Fixed loading skeleton scaling issues

## [1.2.2] - 2024-09-18

### Added

- Today's statistics in statistics tab

## [1.2.1] - 2024-09-18

### Changed

- Minor improvements and bug fixes

## [1.2.0] - 2024-09-12

### Added

- Integrated productivity trend API endpoint with real backend data visualization
- Integrated daily totals API endpoint for DailyHoursChart
- Task distribution chart with backend data integration
- Total target hours visualization in statistics view
- Unarchive feature for archived trackers
- Work days tracking in graphs

### Fixed

- ESLint 'any' type errors in chart components
- TypeScript tooltip error in DailyHoursChart
- Pie chart tracker filtering to hide 0-hour trackers
- Sign-in flow for development mode

### Improved

- Enhanced TaskDistributionChart with dual-mode functionality
- Improved custom tooltip UI with modern glass morphism styling
- Better target hours calculation

## [1.1.12] - 2024-09-11

### Changed

- Updated idle threshold to 3 minutes

## [1.1.10] - 2024-08-21

### Fixed

- Sign-out functionality in production builds (resolved 403 error)
- Added safe web fallback for authentication

## [1.1.9] - 2024-08-21

### Fixed

- Eliminated OAuth listener memory leak
- Improved cleanup with proper unsubscribe from preload API

## [1.1.8] - 2024-08-21

### Fixed

- Authentication flow debugging and improvements

## [1.1.7] - 2024-08-21

### Fixed

- Authentication flow debugging

## [1.1.6] - 2024-08-21

### Fixed

- Authentication flow issues

## [1.1.5] - 2024-08-21

### Fixed

- Redirect URL configuration

## [1.1.4] - 2024-08-21

### Fixed

- Login redirect in production app

## [1.1.3] - 2024-08-21

### Fixed

- Login bug in production build

## [1.1.2] - 2024-08-21

### Fixed

- Preload file not found issue

## [1.1.1] - 2024-08-20

### Fixed

- Minor bug fixes and improvements

## [1.1.0] - 2024-08-20

### Added

- Auto-updater with electron-updater
- Automatic OTA (Over-The-Air) update functionality
