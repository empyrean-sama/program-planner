# Task Management System

This document describes the Task management feature implemented in the Program Planner application.

## Overview

The Task management system allows users to create, track, and manage tasks with comprehensive properties and state management. Tasks are persisted to disk as JSON files in the application's user data directory.

## Task Properties

Each task has the following properties:

### System-Generated Fields (Read-Only)

1. **UUID (id)**: A unique identifier automatically generated for each task
   - Cannot be modified by the user
   - Displayed in a read-only field in the UI

2. **Filing Date & Time (filingDateTime)**: Timestamp when the task was created
   - Automatically set when the task is filed
   - Cannot be modified by the user
   - Displayed in ISO 8601 format

### User-Editable Fields

3. **Title**: Short descriptive name for the task
   - Required field
   - Can be edited at any time

4. **Description**: Detailed description of the task
   - Required field
   - Can be edited at any time

5. **Due Date & Time (dueDateTime)**: Optional deadline for task completion
   - Can be set or modified at any time
   - Uses MUI DateTimePicker component

6. **State**: Current status of the task
   - Options: Filed, Scheduled, Doing, Finished, Failed, Deferred, Removed
   - Initially set to "Filed" when created
   - Can be changed at any time

### Special Fields

7. **Estimated Time (estimatedTime)**: Time estimate in minutes
   - Can only be specified when filing a task
   - Cannot be edited after task creation
   - Optional field

8. **Schedule History**: Table of time entries
   - Each entry contains:
     - Start Time
     - End Time
     - Duration (automatically calculated in minutes)
     - Created At timestamp
   - Users can add new entries at any time
   - Entries can be removed

9. **Elapsed Time (elapsedTime)**: Calculated field
   - Automatically aggregates all durations from Schedule History
   - Read-only, updates automatically when schedule entries change

10. **Points**: Fibonacci-based difficulty score
    - Automatically calculated from Estimated Time
    - 20 mins = 1 point
    - Uses Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144
    - Higher points indicate exponentially more difficult/time-consuming work
    - Read-only field

11. **Comments**: List of user comments
    - Each comment includes:
      - Comment text
      - Timestamp when added
    - Can be added at any time
    - Cannot be modified once created

## User Interface

### Tasks Page

The Tasks Page (`/tasks`) provides:

- **Tab Navigation**: Filter tasks by state (All, Filed, Scheduled, Doing, etc.)
- **Task Counter**: Shows number of tasks in each state
- **Create Button**: Opens dialog to create new tasks
- **Task List**: Displays all tasks with summary information

### Task List

Each task in the list shows:
- Title with state chip
- Points badge
- Description preview
- Due date (if set)
- Estimated time and elapsed time

### Create Task Dialog

Form fields:
- Title (required)
- Description (required)
- Due Date & Time (optional)
- Estimated Time in minutes (optional, cannot be changed later)

### Task Details Dialog

Comprehensive view with:
- All task properties (editable and read-only)
- State selector dropdown
- Schedule History table with add/remove functionality
- Comments section with add functionality
- Save and Delete buttons

### Schedule Entry Dialog

Allows adding time entries:
- Start Time picker
- End Time picker
- Automatic duration calculation
- Validation to ensure end time is after start time

### Comment Dialog

Simple form to add comments:
- Multi-line text input
- Timestamp automatically added

## Backend Architecture

### TaskService

Located in `src/services/TaskService.ts`, provides:

- **Storage**: JSON file persistence in app's userData directory
- **CRUD Operations**:
  - `createTask()`: Create new task with initial state "Filed"
  - `getAllTasks()`: Retrieve all tasks
  - `getTaskById()`: Get specific task
  - `updateTask()`: Update task properties
  - `deleteTask()`: Remove task
  - `getTasksByState()`: Filter tasks by state

- **Additional Operations**:
  - `addScheduleEntry()`: Add time entry to schedule history
  - `removeScheduleEntry()`: Remove time entry
  - `addComment()`: Add comment to task

- **Calculations**:
  - `calculatePoints()`: Fibonacci-based point calculation
  - `calculateElapsedTime()`: Sum of schedule history durations

### IPC Communication

**Main Process** (`src/main.ts`):
- Initializes TaskService on app ready
- Sets up IPC handlers for all task operations
- Returns standardized response: `{ success: boolean, data?: T, error?: string }`

**Preload Script** (`src/preload.ts`):
- Exposes `taskAPI` to renderer process
- Type-safe interface for all task operations

**Renderer Process**:
- Accesses via `window.taskAPI`
- Full TypeScript support with interfaces

## Data Persistence

- **Location**: `{userData}/tasks.json`
- **Format**: JSON array of Task objects
- **Auto-save**: All operations immediately persist to disk
- **Error Handling**: Try-catch blocks with error logging

## Type Definitions

Located in `src/types/Task.ts`:

- `TaskState`: Union type of valid states
- `Task`: Complete task interface
- `ScheduleHistoryEntry`: Time entry interface
- `TaskComment`: Comment interface
- `CreateTaskInput`: Input for creating tasks
- `UpdateTaskInput`: Input for updating tasks
- `AddScheduleEntryInput`: Input for schedule entries
- `AddCommentInput`: Input for adding comments

## Points Calculation Algorithm

The Fibonacci-like sequence ensures that higher estimates result in exponentially higher points:

```
Estimated Time → Points
0-20 mins      → 1 point
21-40 mins     → 2 points
41-60 mins     → 3 points
61-100 mins    → 5 points
101-160 mins   → 8 points
161-260 mins   → 13 points
261-420 mins   → 21 points
...and so on
```

This reflects that longer tasks are not just linearly more work, but exponentially more complex.

## Usage Examples

### Creating a Task

1. Click "New Task" button
2. Fill in required fields (Title, Description)
3. Optionally set Due Date/Time and Estimated Time
4. Click "Create"

### Updating Task State

1. Click on a task in the list
2. Select new state from dropdown
3. Click "Save Changes"

### Adding Schedule Entry

1. Open task details
2. Click "Add Entry" in Schedule History section
3. Set start and end times
4. Click "Add"

### Adding Comments

1. Open task details
2. Click "Add Comment" in Comments section
3. Type comment text
4. Click "Add"

## Future Enhancements

Possible improvements:
- Task search and filtering
- Task dependencies and subtasks
- Task templates
- Export/import functionality
- Task analytics and reporting
- Recurring tasks
- Task attachments
