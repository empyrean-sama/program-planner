# Quick Start Guide

**Program Planner v1.0.0**

Welcome! This guide will get you up and running with Program Planner in 5 minutes.

---

## 📥 Installation

### Step 1: Download

Choose your platform:
- **Windows:** Download `program-planner-setup-1.0.0.exe`
- **macOS:** Download `program-planner-1.0.0.dmg`
- **Linux:** Download `.deb` or `.rpm` file

### Step 2: Install

**Windows:**
```
1. Double-click the .exe file
2. Follow the installer prompts
3. Launch from Start Menu
```

**macOS:**
```
1. Open the .dmg file
2. Drag Program Planner to Applications
3. Launch from Applications folder
```

**Linux (Debian/Ubuntu):**
```bash
sudo dpkg -i program-planner_1.0.0_amd64.deb
```

**Linux (Red Hat/Fedora):**
```bash
sudo rpm -i program-planner-1.0.0.x86_64.rpm
```

---

## 🚀 First Launch

### What You'll See

1. **Home Dashboard** - Your starting point
2. **Sidebar** - Navigation menu on the left
3. **Main Content Area** - Where the magic happens

### Navigation Options
- 🏠 **Home** - Dashboard overview
- ✅ **Tasks** - Task management
- 📅 **Calendar** - Schedule view
- 📖 **Stories** - Story management
- 📊 **Metrics** - Analytics
- ⚙️ **Settings** - Configuration

---

## ✅ Create Your First Task

### Method 1: From Tasks Page

1. Click **"Tasks"** in the sidebar
2. Click the **"+ Add Task"** button
3. Fill in the details:
   - **Title:** "My first task"
   - **Description:** Optional notes (Markdown supported!)
   - **Priority:** Low, Medium, or High
   - **Deadline:** Pick a date (optional)
   - **State:** Leave as "Filed" (default)
4. Click **"Create"**

### Method 2: From Calendar

1. Click **"Calendar"** in the sidebar
2. Choose a view (Month/Week/Day)
3. **Right-click** on a time slot
4. Select **"Create Task Here"**
5. Fill in details and save

---

## 📅 Schedule a Task

### Drag & Drop Method

1. Go to **Calendar** page
2. Find your task in the sidebar
3. **Drag** the task to a time slot
4. **Drop** to schedule
5. Edit time if needed

### Manual Scheduling

1. Open task details
2. Click **"Add Schedule"**
3. Pick date and time
4. Click **"Save"**

---

## 📖 Organize with Stories

### Create a Story

1. Go to **Stories** page
2. Click **"+ Add Story"**
3. Enter story details:
   - **Title:** "Feature X Development"
   - **Description:** Story overview
4. Click **"Create"**

### Add Tasks to Story

1. Open task details
2. Click **"Stories"** tab
3. Select one or more stories
4. Click **"Save"**

---

## 🔄 Update Task Status

Tasks flow through these states:

```
Filed → Scheduled → Doing → Finished
```

### How to Change State

1. Open task details
2. Find the **"State"** dropdown
3. Select new state
4. Click **"Update"**

### State Guide

- **Filed:** Just created, not yet scheduled
- **Scheduled:** Has a calendar schedule
- **Doing:** Currently working on it
- **Finished:** Completed

---

## 🔍 Find Tasks Quickly

### Using Search

1. Go to **Tasks** page
2. Type in the **search box** at the top
3. Results filter in real-time

### Using Filters

1. Click **filter icons** in the toolbar
2. Choose criteria:
   - State (Finished, Doing, etc.)
   - Priority (High, Medium, Low)
   - Story assignment
   - Deadline range
3. Combine multiple filters

---

## 📊 View Dependency Graph

### See Task Relationships

1. Open any task details
2. Click **"Relationships"** tab
3. Click **"View Dependency Graph"**
4. Explore the visual tree!

### Graph Features

- **Zoom controls** - Top right corner
- **Story grouping** - Dashed containers
- **Color coding** - States shown by color
- **Star indicator** - Shows current task

---

## 💡 Pro Tips

### Keyboard Shortcuts

- **Esc** - Close dialogs
- **Ctrl/Cmd + Click** - Multi-select (where applicable)

### Right-Click Menus

Try right-clicking on:
- Tasks in the list
- Calendar slots
- Task cards

### Quick Actions

- **Calendar:** Right-click for instant task creation
- **Tasks:** Click state chip to filter by state
- **Stories:** Click to see all tasks in that story

---

## 📈 Track Your Progress

### View Metrics

1. Go to **Metrics** page
2. See:
   - Deadline adherence
   - Task distribution
   - Completion trends
   - State breakdown

### Story Progress

1. Go to **Stories** page
2. Open a story
3. View:
   - Progress percentage
   - Burndown chart
   - Task breakdown

---

## 🔧 Common Tasks

### Add Task Dependencies

1. Open task details
2. Go to **"Relationships"** tab
3. Click **"Add Prerequisite"**
4. Select tasks that must finish first
5. Click **"Save"**

### Comment on Tasks

1. Open task details
2. Go to **"Comments"** tab
3. Type your comment
4. Click **"Add Comment"**

### Set Task Priority

1. Open task details
2. Find **"Priority"** dropdown
3. Choose Low, Medium, or High
4. Click **"Update"**

---

## 🆘 Need Help?

### Resources

- 📖 **Full Documentation:** [docs/INDEX.md](./docs/INDEX.md)
- 🆕 **What's New:** [docs/V1_RELEASE_NOTES.md](./docs/V1_RELEASE_NOTES.md)
- 📊 **Dependency Graph Guide:** [docs/DEPENDENCY_GRAPH_GUIDE.md](./docs/DEPENDENCY_GRAPH_GUIDE.md)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/empyrean-sama/program-planner/issues)

### Common Questions

**Q: Where is my data stored?**  
A: On your computer in JSON format. No cloud, no internet needed.

**Q: How do I backup?**  
A: Copy the `data` folder from your app directory.

**Q: Can I use this offline?**  
A: Yes! 100% offline application.

**Q: How do I export tasks?**  
A: Export feature coming in v1.1. Currently data is in JSON format.

---

## 🎯 Next Steps

Now that you know the basics:

1. ✅ Create a few tasks
2. 📅 Schedule them on the calendar
3. 📖 Organize into stories
4. 🔄 Add some dependencies
5. 📊 View the dependency graph
6. 📈 Check out the metrics

### Learn More

- Read the [full README](../README.md)
- Explore [feature documentation](./docs/INDEX.md)
- Check out [keyboard shortcuts](./docs/DEVELOPER.md)

---

## 🎉 You're Ready!

Congratulations! You now know the essentials of Program Planner.

**Happy Planning! 🚀**

---

**Version:** 1.0.0  
**Last Updated:** October 30, 2025

[← Back to README](../README.md) | [View Full Docs](./docs/INDEX.md) | [Release Notes](./docs/V1_RELEASE_NOTES.md)
