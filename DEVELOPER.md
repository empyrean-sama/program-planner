# Program Planner - Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Key Features](#key-features)
6. [Component Documentation](#component-documentation)
7. [State Management](#state-management)
8. [Services & Utils](#services--utils)
9. [Styling & Theming](#styling--theming)
10. [Performance Optimizations](#performance-optimizations)
11. [Error Handling](#error-handling)
12. [Testing](#testing)
13. [Build & Deployment](#build--deployment)
14. [Coding Standards](#coding-standards)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Program Planner** is a desktop application built with Electron, React, and TypeScript for managing tasks with advanced scheduling, metrics tracking, and calendar integration.

### Tech Stack
- **Framework**: Electron 39.0.0
- **UI Library**: React 19.2.0 with TypeScript 5.7.3
- **Component Library**: Material-UI (MUI) v7.3.4
- **State Management**: React Context API + useState/useEffect
- **Date Handling**: Day.js v1.11.13
- **Build Tool**: Vite + Electron Forge
- **Package Manager**: npm

### Key Technologies
- **IPC Communication**: Electron's main/renderer process communication
- **File Storage**: JSON-based local file system
- **Routing**: React Router v7.1.1
- **Icons**: Material-UI Icons + Custom SVG

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- Windows/macOS/Linux

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd program-planner
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start development server:
\`\`\`bash
npm run start
\`\`\`

4. Package the application:
\`\`\`bash
npm run package
\`\`\`

### Development Scripts

\`\`\`json
{
  "start": "electron-forge start",           // Start dev server
  "package": "electron-forge package",       // Package for current platform
  "make": "electron-forge make",             // Create distributables
  "publish": "electron-forge publish",       // Publish to GitHub
  "lint": "eslint ."                        // Run ESLint
}
\`\`\`

---

## Architecture

### Application Architecture

\`\`\`
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  - Window Management                    │
│  - IPC Handlers                         │
│  - File System Operations               │
│  - TaskService (Backend Logic)          │
└──────────────┬──────────────────────────┘
               │ IPC Communication
┌──────────────▼──────────────────────────┐
│       Electron Renderer Process         │
│  - React Application                    │
│  - UI Components                        │
│  - Router                               │
│  - Context Providers                    │
└─────────────────────────────────────────┘
\`\`\`

### Process Communication (IPC)

**Main Process** (`src/main.ts`):
- Manages application lifecycle
- Creates browser windows
- Handles file operations via TaskService
- Exposes APIs to renderer via IPC

**Preload Script** (`src/preload.ts`):
- Bridges main and renderer processes
- Exposes `window.taskAPI` for safe IPC calls
- Prevents direct access to Node.js APIs in renderer

**Renderer Process** (`src/renderer.tsx`):
- React application
- UI rendering
- User interactions
- Calls `window.taskAPI` for data operations

### Data Flow

\`\`\`
User Action → Component → window.taskAPI → IPC → Main Process
                                                        ↓
                                                   TaskService
                                                        ↓
                                                  File System
                                                        ↓
User Action ← Component ← IPC Response ← Main Process
\`\`\`

---

## Project Structure

\`\`\`
program-planner/
├── src/
│   ├── main.ts                    # Electron main process
│   ├── preload.ts                 # IPC bridge
│   ├── renderer.tsx               # React entry point
│   ├── electron.d.ts              # TypeScript declarations
│   │
│   ├── components/                # React components
│   │   ├── App/                   # App-level components
│   │   │   ├── App.tsx
│   │   │   ├── AppLayout.tsx      # Router configuration
│   │   │   ├── AppGlobalStateProvider.tsx
│   │   │   └── AppThemeProvider.tsx
│   │   │
│   │   ├── Common/                # Reusable components
│   │   │   ├── TitleBar.tsx
│   │   │   ├── AppIcon.tsx
│   │   │   ├── SearchableComboBox.tsx
│   │   │   ├── MarkdownTextarea.tsx
│   │   │   ├── LoadingSkeletons.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   │
│   │   └── Pages/                 # Page components
│   │       ├── PageEnclosure.tsx  # Layout wrapper
│   │       ├── Sidebar.tsx        # Navigation
│   │       ├── Home/
│   │       ├── Tasks/
│   │       ├── Calendar/
│   │       ├── Metrics/
│   │       └── Error/
│   │
│   ├── context/                   # React contexts
│   │
│   ├── hooks/                     # Custom React hooks
│   │   └── useAppGlobalState.ts
│   │
│   ├── interface/                 # TypeScript interfaces
│   │   └── IAppGlobalStateContextAPI.ts
│   │
│   ├── services/                  # Business logic
│   │   ├── TaskService.ts         # Task CRUD operations
│   │   ├── TaskStateRulesEngine.ts
│   │   └── TaskCardRulesEngine.ts
│   │
│   ├── types/                     # Type definitions
│   │   └── Task.ts
│   │
│   └── utils/                     # Utility functions
│       ├── taskFiltering.ts
│       ├── metricsCalculation.ts
│       ├── animations.ts
│       └── zIndex.ts
│
├── data/                          # Application data
│   └── tasks.json                 # Task storage
│
├── assets/                        # Static assets
│   └── icons/                     # Application icons
│
├── scripts/                       # Build scripts
│   ├── generate-icons.js
│   ├── generate-ico.js
│   └── generate-icns.js
│
├── docs/                          # Additional documentation
│   ├── TASK_FEATURE_README.md
│   ├── TASK_FILTERING_README.md
│   ├── CALENDAR_TASK_INTEGRATION.md
│   └── ...
│
├── forge.config.ts                # Electron Forge config
├── vite.main.config.mts           # Vite config for main
├── vite.preload.config.mts        # Vite config for preload
├── vite.renderer.config.mts       # Vite config for renderer
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
\`\`\`

---

## Key Features

### 1. Task Management
- **CRUD Operations**: Create, read, update, delete tasks
- **State Machine**: Tracked, InProgress, Done, Failed, Removed
- **Properties**: Title, description, points, deadlines, filing dates
- **Comments**: Add timestamped comments to tasks
- **Schedule Entries**: Link tasks to calendar events

### 2. Calendar Integration
- **Multiple Views**: Month, Week, Day
- **Task Scheduling**: Drag tasks onto calendar
- **Time Slots**: Hourly scheduling in day/week views
- **Context Menus**: Quick actions on dates/times
- **Visual Indicators**: Color-coded task states

### 3. Metrics & Analytics
- **Statistics**: Completion rates, velocity, adherence
- **Charts**: Velocity, state distribution, deadline performance
- **Insights**: AI-like productivity recommendations
- **Time Tracking**: Average completion times
- **Workload Analysis**: Active points, estimated completion

### 4. Filtering & Search
- **Text Search**: Search by title/description
- **State Filters**: Filter by task states
- **Date Ranges**: Filter by filing/deadline dates
- **Property Filters**: Has deadline, comments, schedule
- **Points Range**: Min/max point filtering
- **Sorting**: Multiple sort options

### 5. UI/UX Features
- **Dark Mode**: System theme detection
- **Masonry Layout**: Variable-height task cards
- **Loading States**: Skeleton screens
- **Animations**: Subtle fade-ins and transitions
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: Non-blocking feedback
- **Custom Title Bar**: Frameless window with controls

---

## Component Documentation

### Core Components

#### AppLayout (`src/components/App/AppLayout.tsx`)
**Purpose**: Configures React Router and defines application routes

**Routes**:
- `/` - HomePage
- `/calendar` - CalendarPage
- `/tasks` - TasksPage
- `/tasks/:taskId` - TaskDetailsPage
- `/metrics` - MetricsPage
- `*` - NotFoundErrorPage

**Usage**:
\`\`\`tsx
import AppLayout from './components/App/AppLayout';
<AppLayout />
\`\`\`

#### AppGlobalStateProvider
**Purpose**: Global state management for toast notifications

**API**:
- `showToast(message, severity, duration)` - Display notification

**Features**:
- Auto-dismiss with countdown
- Max 3 simultaneous toasts
- Stacked display with animations
- Severity levels: success, error, warning, info

#### ErrorBoundary
**Purpose**: Catch and handle React component errors

**Usage**:
\`\`\`tsx
<ErrorBoundary fallback={<CustomErrorUI />}>
  <Component />
</ErrorBoundary>
\`\`\`

**Features**:
- Displays error message
- Shows component stack in development
- Retry button to reset error state
- Custom fallback UI support

### Page Components

#### TasksPage
**State**:
- `tasks`: Array of all tasks
- `loading`: Boolean for loading state
- `filters`: Current filter/sort settings
- `createDialogOpen`: Dialog visibility

**Performance**:
- `useMemo` for filtered tasks
- `useCallback` for stable function references
- Skeleton loading during data fetch

#### MetricsPage
**Features**:
- 8 stat cards with key metrics
- 3 interactive charts
- Productivity insights panel
- Responsive grid layout
- Staggered fade-in animations

**Performance**:
- All calculations in `useMemo`
- Lazy loading for heavy computations
- Skeleton screens during loading

#### CalendarPage
**Views**:
- Month: 5-week grid
- Week: Hourly time slots
- Day: Detailed hourly view

**Features**:
- Context menu for quick actions
- Double-click to zoom into day
- Schedule dialog for adding entries
- View state persists across navigation

### Common Components

#### LoadingSkeletons
**Variants**:
- `TaskCardSkeleton` - Single task card placeholder
- `TaskCardGridSkeleton` - Grid of placeholders
- `StatCardSkeleton` - Metric card placeholder
- `ChartSkeleton` - Chart placeholder
- `CalendarSkeleton` - Calendar grid placeholder
- `TaskDetailsSkeleton` - Full page placeholder

**Usage**:
\`\`\`tsx
{loading ? <TaskCardGridSkeleton count={8} /> : <TaskCardGrid tasks={tasks} />}
\`\`\`

#### SearchableComboBox
**Purpose**: Autocomplete dropdown with search

**Props**:
- `options`: Array of selectable options
- `value`: Current selection
- `onChange`: Selection handler
- `placeholder`: Input placeholder text

---

## State Management

### Global State (Context API)

**AppGlobalStateContext**:
\`\`\`tsx
interface IAppGlobalStateContextAPI {
  showToast: (message: string, severity?: ToastSeverity, duration?: number) => void;
}
\`\`\`

**Usage**:
\`\`\`tsx
const globalState = useAppGlobalState();
globalState.showToast('Task created!', 'success', 3000);
\`\`\`

### Local State (Component Level)

**Best Practices**:
- Use `useState` for UI state
- Use `useMemo` for derived data
- Use `useCallback` for event handlers
- Avoid prop drilling with context
- Keep state close to where it's used

### Data Fetching Pattern

\`\`\`tsx
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);

const loadData = useCallback(async () => {
  try {
    setLoading(true);
    const result = await window.taskAPI.method();
    if (result.success && result.data) {
      setData(result.data);
    }
  } catch (error) {
    console.error('Failed to load:', error);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  loadData();
}, [loadData]);
\`\`\`

---

## Services & Utils

### TaskService (`src/services/TaskService.ts`)
**Purpose**: Main backend logic for task operations (runs in main process)

**Methods**:
- `getAllTasks()` - Fetch all tasks
- `getTaskById(id)` - Fetch single task
- `createTask(task)` - Create new task
- `updateTask(id, updates)` - Update existing task
- `deleteTask(id)` - Delete task
- `addComment(taskId, comment)` - Add comment
- `addScheduleEntry(taskId, entry)` - Add schedule

**Storage**: JSON file at `data/tasks.json`

### TaskStateRulesEngine
**Purpose**: Enforce state transition rules

**Rules**:
- Tracked → InProgress, Removed
- InProgress → Done, Failed, Tracked
- Done → InProgress (reopen)
- Failed → InProgress (retry)
- Removed → Tracked (restore)

### TaskCardRulesEngine
**Purpose**: Determine task card visual appearance

**Warnings**:
- Overdue deadlines
- No deadline set
- No schedule entries
- Long time in progress
- Many comments

**Visual Rules**:
- Background colors by state
- Border styles for warnings
- Opacity for removed tasks
- Gradient backgrounds for special states

### Utilities

#### animations.ts
**Constants**:
- `ANIMATION_DURATION`: Fast (150ms), Normal (300ms), Slow (500ms)
- `EASING`: Cubic bezier timing functions

**Keyframes**:
- `fadeIn`, `fadeInUp`, `fadeInDown`
- `slideInRight`, `slideInLeft`
- `scaleIn`, `pulse`, `shimmer`

**Transition Presets**:
- `transitions.fadeIn`
- `transitions.hover` - Lift on hover
- `transitions.hoverScale` - Scale on hover

#### zIndex.ts
**Purpose**: Centralized z-index management

**Layers** (ordered):
\`\`\`typescript
{
  BASE: 0,
  CALENDAR_GRID: 2,
  CALENDAR_EVENT: 5,
  DROPDOWN: 100,
  STICKY_HEADER: 200,
  SIDEBAR: 300,
  CALENDAR_TIME_MARKER: 1000,
  CALENDAR_HOVER_CARD: 1500,
  CONTEXT_MENU: 2000,
  TOOLTIP: 3000,
  MODAL_BACKDROP: 10000,
  MODAL: 10001,
  TOAST: 10100,
}
\`\`\`

#### taskFiltering.ts
**Purpose**: Filter and sort tasks based on criteria

**Function**: `filterAndSortTasks(tasks, filters)`

#### metricsCalculation.ts
**Purpose**: Calculate analytics metrics

**Functions**:
- `calculateMetrics(tasks)` - 23 different metrics
- `generateVelocityData(tasks, period)` - Time series data
- `generateDeadlineStats(tasks)` - Deadline performance
- `generateInsights(tasks, metrics)` - Recommendations

---

## Styling & Theming

### MUI Theme

**Dark Mode**: Automatically detects system preference

**Custom Theme**:
\`\`\`tsx
// src/components/App/AppThemeProvider.tsx
const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
  },
});
\`\`\`

### Styling Approaches

1. **SX Prop** (Preferred):
\`\`\`tsx
<Box sx={{ p: 3, bgcolor: 'background.paper' }} />
\`\`\`

2. **Styled Components**:
\`\`\`tsx
import { styled } from '@mui/material/styles';
const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));
\`\`\`

3. **CSS Animations**:
\`\`\`tsx
import { fadeInUp } from '../utils/animations';
<Box sx={{ animation: \`\${fadeInUp} 300ms ease-out\` }} />
\`\`\`

### Responsive Design

**Breakpoints**:
- `xs`: 0px
- `sm`: 600px
- `md`: 900px
- `lg`: 1200px
- `xl`: 1536px

**Usage**:
\`\`\`tsx
<Box sx={{
  width: { xs: '100%', md: '50%' },
  p: { xs: 2, md: 3 },
}} />
\`\`\`

---

## Performance Optimizations

### React Optimizations

1. **Memoization**:
\`\`\`tsx
const filtered = useMemo(() => filterTasks(tasks), [tasks]);
const handleClick = useCallback(() => {}, [deps]);
const MemoComponent = React.memo(Component);
\`\`\`

2. **Code Splitting** (Future):
\`\`\`tsx
const MetricsPage = React.lazy(() => import('./Pages/Metrics/MetricsPage'));
\`\`\`

3. **Virtual Lists** (For large datasets):
Consider `react-window` for 100+ items

### Rendering Optimizations

- Skeleton screens prevent layout shift
- Staggered animations for perceived performance
- Debounced search inputs
- Throttled scroll handlers

### Bundle Optimizations

- Tree shaking enabled in Vite
- Code splitting by route
- Icon optimization (only used icons)
- Production builds minified

---

## Error Handling

### Error Boundaries

Wrap components prone to errors:
\`\`\`tsx
<ErrorBoundary>
  <DataComponent />
</ErrorBoundary>
\`\`\`

### Async Error Handling

\`\`\`tsx
try {
  const result = await window.taskAPI.method();
  if (!result.success) {
    throw new Error(result.error);
  }
} catch (error) {
  console.error('Operation failed:', error);
  globalState.showToast('Operation failed', 'error');
}
\`\`\`

### IPC Error Handling

All IPC responses use this pattern:
\`\`\`typescript
{
  success: boolean;
  data?: T;
  error?: string;
}
\`\`\`

---

## Testing

### Unit Tests (Future)
- Jest + React Testing Library
- Test utilities and services
- Component snapshot tests

### Integration Tests (Future)
- Playwright for E2E
- Test IPC communication
- Test file operations

### Manual Testing Checklist
- [ ] Create/update/delete tasks
- [ ] State transitions
- [ ] Calendar scheduling
- [ ] Metrics calculations
- [ ] Theme switching
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Route navigation

---

## Build & Deployment

### Development Build
\`\`\`bash
npm run start
\`\`\`

### Production Package
\`\`\`bash
npm run package
\`\`\`

### Create Distributable
\`\`\`bash
npm run make
\`\`\`

### Platform-Specific Icons

Icons auto-generated from SVG:
- `assets/icons/icon.png` (Linux)
- `assets/icons/icon.ico` (Windows)
- `assets/icons/icon.icns` (macOS)

Regenerate:
\`\`\`bash
node scripts/generate-icons.js
node scripts/generate-ico.js
node scripts/generate-icns.js
\`\`\`

---

## Coding Standards

### TypeScript

- **Strict Mode**: Enable in `tsconfig.json`
- **No Any**: Avoid `any`, use `unknown` or proper types
- **Interfaces**: Prefix with `I` (e.g., `ITask`)
- **Types**: Use for unions and complex types
- **Enums**: Use string enums for readability

### React

- **Function Components**: Use exclusively
- **Hooks**: Follow Rules of Hooks
- **Props**: Destructure in parameter
- **Default Props**: Use default parameters
- **Prop Types**: Use TypeScript interfaces

### File Organization

- One component per file
- Co-locate related files
- Index files for public API
- Separate types from implementation

### Naming Conventions

- **Components**: PascalCase (`TaskCard.tsx`)
- **Hooks**: camelCase starting with `use` (`useAppGlobalState.ts`)
- **Utils**: camelCase (`taskFiltering.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase with `I` prefix

### Comments

\`\`\`tsx
/**
 * Component description
 * 
 * @param props - Props description
 * @returns JSX element
 */
export function Component(props: Props) {
  // Implementation comment
}
\`\`\`

---

## Troubleshooting

### Common Issues

**Issue**: `__dirname is not defined`
**Solution**: Use IPC, don't import Node modules in renderer

**Issue**: Tasks not loading
**Solution**: Check `data/tasks.json` exists and is valid JSON

**Issue**: Icons not showing
**Solution**: Ensure icon files exist in `assets/icons/`

**Issue**: Z-index conflicts
**Solution**: Use constants from `src/utils/zIndex.ts`

**Issue**: Performance issues with many tasks
**Solution**: Implement virtualization or pagination

### Debug Mode

Enable detailed logging:
\`\`\`typescript
// Add to main.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode enabled');
}
\`\`\`

### Dev Tools

- React DevTools: Inspect component tree
- Redux DevTools: Not used (using Context)
- Electron DevTools: Built-in Chrome DevTools

---

## Additional Resources

### Related Documentation
- [Task Feature README](./TASK_FEATURE_README.md)
- [Task Filtering README](./TASK_FILTERING_README.md)
- [Calendar Integration](./CALENDAR_TASK_INTEGRATION.md)
- [Task State Rules Engine](./TASK_STATE_RULES_ENGINE.md)
- [Task Card Rules Engine](./TASK_CARD_RULES_ENGINE.md)

### External Links
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [MUI Documentation](https://mui.com/)
- [Day.js Documentation](https://day.js.org/)

### Contributing
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests if applicable
5. Submit pull request

### License
[Add license information]

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0
**Maintainer**: [Your Name/Team]
