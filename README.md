<div align="center">
  <img src="assets/icons/icon.png" alt="Program Planner Logo" width="128" height="128">
  
  # Program Planner
  
  **Your all-in-one desktop task and schedule management application**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
  [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/empyrean-sama/program-planner)
  [![Release](https://img.shields.io/badge/release-October%202025-blue.svg)](docs/V1_RELEASE_NOTES.md)
  
  [⚡ Quick Start](QUICK_START.md) • [Features](#-features) • [Download](#-download--installation) • [Screenshots](#-screenshots) • [For Developers](#-for-developers)
</div>

---

## 📖 Overview

**Program Planner** is a powerful desktop application designed to help you manage your tasks, projects, and schedules with ease. Built with modern technologies like Electron and React, it provides a beautiful, intuitive interface for organizing your work and life.

### Why Program Planner?

- ✅ **All-in-one solution** - Tasks, stories, calendar, and metrics in one place
- 🎯 **Intuitive interface** - Clean, modern Material-UI design
- 📅 **Flexible scheduling** - Month, week, and day calendar views
- 🔄 **Smart task states** - Automatic state transitions and validations
- 📊 **Visual insights** - Built-in metrics and performance tracking
- 💾 **Local-first** - Your data stays on your computer
- 🚀 **Fast & responsive** - Optimized performance with React 19
- 🎨 **Beautiful UI** - Polished interface with smooth animations

---

## ✨ Features

### 📋 Task Management

- **Complete task lifecycle** - From planning to completion
- **Smart state machine** - Automatic validation of state transitions
- **Rich descriptions** - Markdown support for detailed notes
- **Comments & discussions** - Add comments to track conversations
- **Priority levels** - Organize by importance
- **Deadlines & tracking** - Never miss a due date
- **Visual warnings** - Color-coded alerts for overdue tasks
- **Task dependencies** - Define prerequisite relationships
- **Dependency graph** - 🆕 Visual dependency tree with story grouping

### 📅 Calendar Integration

- **Multiple views** - Month, week, and day layouts
- **Drag & drop scheduling** - Easily schedule tasks on the calendar
- **Quick task creation** - Create tasks directly from calendar slots
- **Schedule management** - Set specific time blocks for tasks
- **Context menus** - Right-click for quick actions
- **Visual indicators** - See task status at a glance

### 📖 Story Management

- **Group related tasks** - Organize tasks into user stories
- **Many-to-many relationships** - Tasks can belong to multiple stories
- **Progress tracking** - See story completion status
- **Burndown charts** - Visualize story progress
- **Flexible organization** - Structure work your way

### 🔍 Advanced Filtering

- **Multiple filter types** - By status, priority, deadline, story
- **Smart search** - Find tasks instantly
- **Custom combinations** - Mix and match filters
- **Saved views** - Quick access to common filters

### 📊 Metrics & Insights

- **Deadline adherence** - Track on-time completion rates
- **Task distribution** - Visualize work breakdown
- **Performance trends** - See your productivity over time
- **Velocity tracking** - Measure completion rates
- **Story metrics** - Burndown and progress charts

### 🎨 Visual Features (v1.0)

- **Modern dependency graph** - 🆕 Interactive visualization with story grouping
- **Zoom controls** - Navigate complex task trees
- **Color-coded states** - Instantly recognize task status
- **Grid backgrounds** - Clean, professional design
- **Smooth animations** - Polished user experience

---

## 💻 Download & Installation

### Windows

1. Download the latest `.exe` installer from [Releases](https://github.com/empyrean-sama/program-planner/releases)
2. Run the installer
3. Launch Program Planner from Start Menu

### macOS

1. Download the latest `.dmg` file from [Releases](https://github.com/empyrean-sama/program-planner/releases)
2. Open the DMG and drag Program Planner to Applications
3. Launch from Applications folder

### Linux

**Debian/Ubuntu:**
```bash
# Download the .deb file from releases
sudo dpkg -i program-planner_1.0.0_amd64.deb
```

**Red Hat/Fedora:**
```bash
# Download the .rpm file from releases
sudo rpm -i program-planner-1.0.0.x86_64.rpm
```

### System Requirements

- **OS:** Windows 10/11, macOS 10.13+, or modern Linux distribution
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 200MB free space
- **Display:** 1280x720 minimum resolution

---

## 📸 Screenshots

### Home Dashboard
![Home Dashboard](docs/screenshots/home-dashboard.png)
*Quick access to all your tasks, stories, and calendar from the home page*

### Calendar View
![Calendar View](docs/screenshots/calendar-view.png)
*Visualize your schedule with month, week, and day views*

### Task Management
![Task Management](docs/screenshots/task-management.png)
*Create, edit, and organize tasks with an intuitive interface*

### Task Details
![Task Details](docs/screenshots/task-details.png)
*Rich task information with descriptions, comments, and metadata*

### Metrics Dashboard
![Metrics](docs/screenshots/metrics.png)
*Track your productivity with visual charts and insights*

---

## 🚀 Getting Started

### First Launch

1. **Welcome** - On first launch, you'll see the home dashboard
2. **Create a task** - Click "Tasks" in the sidebar, then click "Add Task"
3. **Schedule it** - Navigate to "Calendar" and drag your task to a time slot
4. **Track progress** - Update task status as you work
5. **Review metrics** - Check your productivity in the Metrics page

### Quick Tips

💡 **Right-click on calendar** - Access quick actions and task creation  
💡 **Use keyboard shortcuts** - Navigate quickly (see Help menu)  
💡 **Filter tasks** - Use the search bar to find specific tasks  
💡 **Create stories** - Group related tasks into user stories  
💡 **Check warnings** - Red borders indicate tasks needing attention

### Common Workflows

#### Creating and Scheduling a Task
1. Go to Tasks page
2. Click "Add Task" button
3. Fill in title, description, priority, and deadline
4. Click "Create"
5. Switch to Calendar view
6. Drag task from sidebar to desired time slot

#### Managing Task States
Tasks flow through these states:
```
Planning → In Progress → Review → Done
           ↓
        Blocked (if needed)
```

The app automatically validates transitions and shows warnings for invalid states.

#### Organizing with Stories
1. Go to Stories page
2. Click "Add Story" button
3. Create your story
4. When creating/editing tasks, assign them to stories
5. Track story progress on Stories page

---

## 🎯 Key Concepts

### Task States

| State | Description | Visual Indicator |
|-------|-------------|------------------|
| **Planning** | Task is being planned | Gray border |
| **In Progress** | Actively being worked on | Blue border |
| **Review** | Completed, awaiting review | Orange border |
| **Blocked** | Cannot progress due to issues | Red border |
| **Done** | Completed and reviewed | Green border |

### Task Warnings

The app automatically detects issues with your tasks:

- 🔴 **Red border** - Task has warnings (overdue, blocked without reason, etc.)
- ⚠️ **Warning icon** - Hover to see specific issues
- 📅 **Deadline badges** - Color-coded based on urgency

### Calendar Scheduling

- **Schedule entries** - Assign specific time blocks to tasks
- **Multiple schedules** - Same task can have multiple time blocks
- **Drag & drop** - Move scheduled tasks between time slots
- **Quick create** - Right-click calendar to create tasks

---

## 💡 Tips & Tricks

### Productivity Tips

1. **Start your day** - Check the calendar view each morning
2. **Use priorities** - Focus on high-priority tasks first
3. **Set realistic deadlines** - The app will warn you if tasks are overdue
4. **Review regularly** - Use the metrics page to track patterns
5. **Group related work** - Create stories for projects

### Power User Features

- **Quick actions** - Right-click tasks and calendar slots for context menus
- **Bulk operations** - Select multiple tasks for batch updates
- **Keyboard navigation** - Arrow keys work in calendar views
- **Search operators** - Use filters for advanced queries
- **Export data** - Tasks are stored in JSON format (see data folder)

---

## 🆘 Troubleshooting

### Common Issues

**Q: My task won't change state**  
A: The app validates state transitions. For example, you can't mark a task "Done" if it's still in "Planning". Move it to "In Progress" first, then "Review", then "Done".

**Q: Task has a red border**  
A: This indicates a warning. Common causes:
- Task is overdue
- Task is blocked without a blocked reason
- Invalid state combination
- Missing required fields

Hover over the warning icon to see the specific issue.

**Q: Calendar isn't showing my tasks**  
A: Make sure:
- Tasks have schedule entries (drag them onto the calendar)
- You're viewing the correct date range
- Filters aren't hiding tasks

**Q: Data not saving**  
A: Program Planner auto-saves to `data/tasks.json`. Check:
- The app has write permissions
- Disk space is available
- File isn't locked by another program

**Q: App performance is slow**  
A: Try:
- Closing unused tasks/stories
- Clearing old completed tasks
- Restarting the application
- Checking system resources

---

## 🔒 Privacy & Data

### Your Data is Yours

- ✅ **100% local** - All data stored on your computer
- ✅ **No cloud sync** - No external servers involved
- ✅ **No tracking** - Zero analytics or telemetry
- ✅ **No internet required** - Works completely offline

### Data Location

**Windows:** `C:\Users\[YourName]\AppData\Roaming\program-planner\data\`  
**macOS:** `~/Library/Application Support/program-planner/data/`  
**Linux:** `~/.config/program-planner/data/`

### Backup Your Data

Your tasks are stored in JSON format. To backup:

1. Close Program Planner
2. Copy the entire `data` folder
3. Store it somewhere safe (external drive, cloud storage, etc.)

To restore:
1. Close Program Planner
2. Replace the `data` folder with your backup
3. Restart the app

---

## 🤝 Support & Community

### Get Help

- 📖 **Documentation** - Check the [Developer Docs](#-for-developers) section below
- 🐛 **Report bugs** - [Open an issue](https://github.com/empyrean-sama/program-planner/issues)
- 💡 **Feature requests** - [Suggest new features](https://github.com/empyrean-sama/program-planner/issues)
- 📧 **Contact** - Email: sriveer.neerukonda@outlook.com

### Contributing

We welcome contributions! See the [For Developers](#-for-developers) section below to get started.

---

## 📜 License

Program Planner is released under the **MIT License**.

```
MIT License

Copyright (c) 2025 Sriveer Neerukonda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

---

# 👨‍💻 For Developers

The following section is for developers who want to contribute to or customize Program Planner.

## 🛠️ Tech Stack

- **Framework:** Electron 39.0.0 (Desktop app framework)
- **Frontend:** React 19.2.0 with TypeScript 4.5.4
- **UI Library:** Material-UI (MUI) v7.3.4
- **Build Tool:** Vite 5.4.21
- **Date Library:** Day.js 1.11.18
- **Styling:** Emotion (CSS-in-JS)

## 🏗️ Architecture

```
program-planner/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script
│   ├── renderer.tsx         # React app entry
│   ├── components/          # React components
│   │   ├── App/            # App shell & providers
│   │   ├── Common/         # Reusable components
│   │   └── Pages/          # Page components
│   ├── services/           # Business logic
│   │   ├── TaskService.ts
│   │   ├── StoryService.ts
│   │   └── *RulesEngine.ts
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── hooks/              # Custom React hooks
│   └── constants/          # App constants
├── assets/                 # Icons and images
├── data/                   # Local data storage
└── docs/                   # Documentation
```

## 🚀 Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- A code editor (VS Code recommended)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/empyrean-sama/program-planner.git
   cd program-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run start
   ```
   
   The app will launch with hot-reload enabled.

4. **Build for production**
   ```bash
   npm run make
   ```
   
   Distributable files will be in `out/make/`

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start development server with hot reload |
| `npm run package` | Package app without creating installers |
| `npm run make` | Build production installers for current platform |
| `npm run publish` | Publish to configured distribution channel |
| `npm run lint` | Run ESLint on TypeScript files |

## 📚 Developer Documentation

Comprehensive documentation for developers is available in the `docs/` folder:

### Essential Reading

1. **[docs/DEVELOPER.md](./docs/DEVELOPER.md)** - 🎯 **START HERE**
   - Complete developer guide
   - Architecture overview
   - Component documentation
   - Coding standards
   - Best practices

2. **[docs/INDEX.md](./docs/INDEX.md)** - Documentation index
   - Quick navigation to all docs
   - Documentation by role
   - Quick reference tables

### Feature Documentation

- **[docs/TASK_FEATURE_README.md](./docs/TASK_FEATURE_README.md)** - Task management system
- **[docs/TASK_FILTERING_README.md](./docs/TASK_FILTERING_README.md)** - Search & filtering
- **[docs/CALENDAR_TASK_INTEGRATION.md](./docs/CALENDAR_TASK_INTEGRATION.md)** - Calendar integration
- **[docs/CONTEXT_MENU_README.md](./docs/CONTEXT_MENU_README.md)** - Context menu system

### Technical Documentation

- **[docs/TASK_STATE_RULES_ENGINE.md](./docs/TASK_STATE_RULES_ENGINE.md)** - State machine rules
- **[docs/TASK_CARD_RULES_ENGINE.md](./docs/TASK_CARD_RULES_ENGINE.md)** - Visual styling rules
- **[docs/TASK_CARD_RULES_QUICK_REFERENCE.md](./docs/TASK_CARD_RULES_QUICK_REFERENCE.md)** - Quick reference

### Recent Updates

- **[docs/REFACTORING_FINAL_SUMMARY.md](./docs/REFACTORING_FINAL_SUMMARY.md)** - Complete refactoring summary
- **[docs/PRODUCTION_OPTIMIZATION.md](./docs/PRODUCTION_OPTIMIZATION.md)** - Production optimizations

## 🎨 Project Structure

### Key Components

**App Shell:**
- `App.tsx` - Main app component
- `AppLayout.tsx` - Layout with sidebar
- `AppThemeProvider.tsx` - MUI theme configuration
- `AppGlobalStateProvider.tsx` - Global state management

**Pages:**
- `HomePage.tsx` - Dashboard landing page
- `TasksPage.tsx` - Task management
- `CalendarPage.tsx` - Calendar views (month/week/day)
- `StoriesPage.tsx` - Story management
- `MetricsPage.tsx` - Analytics & insights

**Services:**
- `TaskService.ts` - Task CRUD operations
- `StoryService.ts` - Story CRUD operations
- `TaskStateRulesEngine.ts` - State transition validation
- `TaskCardRulesEngine.ts` - Visual appearance rules

### Data Storage

Tasks and stories are stored in JSON format:
- `data/tasks.json` - All task data
- Services handle reading/writing with atomic operations
- Auto-save on all modifications

## 🔧 Development Guidelines

### Code Style

- **TypeScript** - Strict mode enabled
- **React Hooks** - Functional components preferred
- **Material-UI** - Use MUI components consistently
- **Emotion** - Styled components for custom styling
- **ESLint** - Run `npm run lint` before committing

### State Management

- **Local state** - `useState` for component-level state
- **Global state** - React Context for app-wide state
- **Services** - Business logic separated from components
- **Immutability** - Never mutate state directly

### Performance

- **React.memo** - Applied to expensive components
- **Lazy loading** - Code splitting for routes
- **Optimized re-renders** - Proper dependency arrays
- **Production builds** - StrictMode disabled in production

### Testing

- Manual testing required currently
- Test all state transitions
- Verify calendar drag & drop
- Check edge cases in rules engines

## 🐛 Debugging

### Development Tools

1. **React DevTools** - Inspect component tree and state
2. **Electron DevTools** - Full Chrome DevTools available
3. **Console logging** - Use `logger` utility (see [PRODUCTION_OPTIMIZATION.md](./docs/PRODUCTION_OPTIMIZATION.md))
4. **VS Code debugger** - Attach to Electron process

### Common Development Issues

**Issue: App won't start**
- Check Node version (18+ required)
- Delete `node_modules` and reinstall
- Clear Vite cache: `rm -rf .vite`

**Issue: Hot reload not working**
- Restart dev server
- Check Vite config
- Ensure files are saved

**Issue: TypeScript errors**
- Run `npm run lint` to see all errors
- Check type definitions in `src/types/`
- Verify import paths

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow coding standards
   - Update documentation
   - Test thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Await review

### Contribution Guidelines

- ✅ Follow existing code style
- ✅ Update documentation for new features
- ✅ Add comments for complex logic
- ✅ Test edge cases
- ✅ Keep commits focused and atomic
- ✅ Write clear commit messages

## 📞 Developer Support

- **Documentation issues?** Open an issue or PR
- **Architecture questions?** Check [docs/DEVELOPER.md](./docs/DEVELOPER.md)
- **Need help?** Email: sriveer.neerukonda@outlook.com

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Material-UI](https://mui.com/) - Component library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Day.js](https://day.js.org/) - Date manipulation

---

<div align="center">
  
  **Made with ❤️ by Sriveer Neerukonda**
  
  [⭐ Star on GitHub](https://github.com/empyrean-sama/program-planner) • [Report Bug](https://github.com/empyrean-sama/program-planner/issues) • [Request Feature](https://github.com/empyrean-sama/program-planner/issues)
  
</div>
```
