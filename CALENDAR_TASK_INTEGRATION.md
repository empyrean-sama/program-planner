# Calendar-Task Integration

## Overview
The calendar views now display task schedules and deadlines, providing a comprehensive visual overview of task timelines across month, week, and day views.

## Features Implemented

### 1. Month View
- **Deadline Count Display**: Each day cell shows a red chip with the count of task deadlines on that day
- **Color**: Red background (`error.main`) to highlight deadlines
- **Interaction**: Double-clicking a day navigates to the day view for that date
- **Location**: Deadline count appears in the bottom-right corner of each month grid cell

### 2. Week View
- **Day Headers**: Show task chips for all tasks scheduled that day
- **Task Schedule Boxes**: Display task schedule entries as colored boxes in time slots
- **Deadline Indicators**: Red horizontal lines at the exact time of task deadlines
- **Tooltips**: Hover over tasks or deadlines to see detailed information
- **Navigation**: Click any task element to navigate to the task details page

### 3. Day View
- **Task Schedule Boxes**: Larger, more detailed view of scheduled tasks
- **Time-Based Positioning**: Tasks positioned based on their schedule entry start/end times
- **Deadline Lines**: Red indicator lines with arrow markers at deadline times
- **Tooltips**: Comprehensive task information on hover
- **Navigation**: Click any task element to navigate to the task details page

## Component Architecture

### New Utility File: `calendarTaskUtils.ts`
Location: `src/components/Pages/Calendar/utils/calendarTaskUtils.ts`

**Key Functions:**
- `getTaskDeadlinesForDate(tasks, date)`: Filters tasks with deadlines on the specified date
- `getTaskSchedulesForDate(tasks, date)`: Finds all schedule entries for tasks on the date
- `calculateEventPosition(event, day, hourHeight)`: Calculates top position and height for schedule boxes
- `getTaskColor(state)`: Returns color based on task state
- `formatTaskTimeRange(start, end)`: Formats time range for display
- `getDeadlineUrgency(dueDate)`: Calculates urgency level (overdue, today, upcoming, future)
- `getDeadlineColor(urgency)`: Returns color based on urgency

**Types:**
- `TaskCalendarEvent`: Represents a task schedule entry with calculated times
- `TaskDeadline`: Represents a task deadline with calculated due date/time
- `DeadlineUrgency`: Enum for urgency levels

### Modified Components

#### `MonthView.tsx`
- Added `useState<Task[]>` to load tasks
- Added `useEffect` to load tasks on mount
- Uses `getTaskDeadlinesForDate` to count deadlines per day
- Displays red chip with deadline count when > 0

#### `TimeSlotColumn.tsx`
- Added task loading with `useState` and `useEffect`
- Renders schedule boxes with absolute positioning
- Renders deadline indicator lines with tooltips
- Handles click events to navigate to task details
- Shows dashed borders for events that span multiple days

#### `DayHeader.tsx`
- Added task loading functionality
- Displays task chips for scheduled tasks
- Shows unique tasks (prevents duplicates if task has multiple entries)
- Task chips are clickable and navigate to task details
- Tooltips show task title, state, and estimated time

## Visual Design

### Task Schedule Boxes
- **Background Color**: Determined by task state
  - Filed: Blue (`info.main`)
  - Scheduled: Blue (`info.main`)
  - Doing: Orange (`warning.main`)
  - Finished: Green (`success.main`)
  - Failed: Red (`error.main`)
  - Deferred: Gray (`grey[500]`)
  - Removed: Light Gray (`grey[400]`)
- **Text**: White for contrast
- **Borders**: 
  - Dashed top border if event starts before the day
  - Dashed bottom border if event ends after the day
- **Hover Effect**: Reduces opacity and increases z-index
- **Size**: Height calculated based on duration (using `hourHeight`)

### Deadline Indicators
- **Color**: Based on urgency
  - Overdue: Dark red (`#d32f2f`)
  - Today: Red (`#f44336`)
  - Upcoming (within 3 days): Orange (`#ff9800`)
  - Future: Gray (`#9e9e9e`)
- **Visual**: 3px horizontal line with upward-pointing triangle marker
- **Hover Effect**: Expands to 5px height
- **Position**: Exact time of deadline

### Month View Deadline Chips
- **Background**: Red (`error.main`)
- **Text**: White
- **Size**: Small chip in bottom-right corner
- **Format**: Shows number (e.g., "2" for 2 deadlines)

### Day Header Task Chips
- **Background**: Task state color
- **Text**: White
- **Size**: Small (0.6rem font, 20px height)
- **Scrollable**: Container has max height with overflow auto
- **Spacing**: 0.5 gap between chips

## User Interactions

### Navigation
- **Click Task Box/Chip/Line**: Navigate to task details page (`/tasks/:taskId`)
- **Double-Click Month Cell**: Navigate to day view for that date
- **Double-Click Day Header**: Navigate to day view (in week view)

### Tooltips
All task-related elements show tooltips on hover:

**Schedule Box Tooltip:**
- Task title (bold)
- Time range (formatted)
- Current state

**Deadline Line Tooltip:**
- "DEADLINE: " + Task title (bold, colored)
- Due time (formatted)
- Current state

**Day Header Chip Tooltip:**
- Task title (bold)
- Current state
- Estimated time (if available)

## Data Flow

1. **Component Mount**: Each calendar component loads all tasks via `window.taskAPI.getAllTasks()`
2. **Date Filtering**: Utility functions filter tasks based on the date being rendered
3. **Position Calculation**: `calculateEventPosition` determines absolute positioning for schedule boxes
4. **Rendering**: Components render task elements with tooltips and click handlers
5. **Navigation**: Click events use `react-router` to navigate to task details

## Performance Considerations

- **Task Loading**: Tasks loaded once per component mount
- **Filtering**: Efficient filtering using dayjs date comparison
- **Unique Tasks**: Day headers deduplicate tasks to avoid showing the same task multiple times
- **Absolute Positioning**: Uses absolute positioning for efficient rendering of overlapping events

## Future Enhancements

Potential improvements:
- Task filtering by state in calendar views
- Color customization for task states
- Drag-and-drop to reschedule tasks
- Multi-day event spanning in month view
- Conflict detection for overlapping schedules
- Bulk scheduling from calendar
- Calendar export (iCal format)

## Dependencies

- `dayjs`: Date manipulation and formatting
- `@mui/material`: UI components (Tooltip, Chip, Paper, Typography, Box)
- `react-router`: Navigation to task details
- Task API: IPC communication for task data retrieval
