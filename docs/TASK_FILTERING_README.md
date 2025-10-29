# Task Filtering and Sorting System

## Overview
A comprehensive, high-performance filtering and sorting system for the Tasks page with fuzzy search capabilities.

## Architecture

### Components

#### 1. **TaskFilterBar.tsx**
The UI component that provides all filtering controls:
- **Fuzzy Search**: Real-time search across title, description, and comments
- **Sort Options**: 12 different sorting options including date, title, state, points, and elapsed time
- **State Filters**: Multi-select dropdown for filtering by task states
- **Date Range Filter**: Filter by filing date, due date, or completion date
- **Advanced Filters**: 
  - Has Deadline (Yes/No/Any)
  - Has Schedule (Yes/No/Any)
  - Has Comments (Yes/No/Any)
  - Points Range (Min/Max)

#### 2. **taskFiltering.ts**
Core filtering and sorting logic with performance optimizations:
- **fuzzySearch()**: Implements fuzzy matching algorithm
- **applyFilters()**: Applies all active filters to a task
- **sortTasks()**: Sorts tasks based on selected option
- **filterAndSortTasks()**: Main function that combines filtering and sorting

#### 3. **TasksPage.tsx**
Redesigned to use the new filtering system:
- Uses `useMemo` for performance optimization
- Removed tab-based filtering in favor of advanced filter bar
- Displays filtered task count

## Features

### Fuzzy Search
The search algorithm matches tasks using:
1. **Direct substring matching** (fast path)
2. **Fuzzy character matching** - Characters must appear in order but not necessarily consecutive
   - Example: "prj tsk" matches "Project Task"
   - Example: "act" matches "Active Task"

Searches across:
- Task title
- Task description
- All comments

### Sorting Options

| Option | Description |
|--------|-------------|
| Filing Date (Newest First) | Most recently filed tasks first |
| Filing Date (Oldest First) | Oldest filed tasks first |
| Due Date (Latest First) | Tasks with latest deadlines first |
| Due Date (Earliest First) | Tasks with earliest deadlines first |
| Title (A-Z) | Alphabetical by title |
| Title (Z-A) | Reverse alphabetical by title |
| State (A-Z) | Alphabetical by state |
| State (Z-A) | Reverse alphabetical by state |
| Points (High to Low) | Most complex tasks first |
| Points (Low to High) | Simplest tasks first |
| Elapsed Time (Most First) | Most time spent first |
| Elapsed Time (Least First) | Least time spent first |

### Filter Types

1. **Text Search**: Fuzzy search across multiple fields
2. **State Filter**: Multi-select from 7 task states
3. **Date Range**: 
   - Choose date field (filing/due/completion)
   - Select start and/or end date
4. **Boolean Filters**:
   - Tasks with/without deadlines
   - Tasks with/without schedules
   - Tasks with/without comments
5. **Range Filters**:
   - Points range (min/max)

## Performance Optimizations

1. **Memoization**: 
   - `useMemo` in TasksPage ensures filtering only runs when tasks or filters change
   - Prevents unnecessary re-renders

2. **Efficient Algorithms**:
   - Fuzzy search uses early exit on substring match
   - Filter functions short-circuit on first failed condition
   - Sort uses native JavaScript array methods

3. **Single Pass Filtering**:
   - All filters applied in one iteration
   - Sort happens only once after filtering

4. **Optimized Search**:
   - Direct substring match before fuzzy match
   - Character-by-character fuzzy match with early exit

## Usage Examples

### Search for active tasks with deadlines
```
1. Type "act" in search bar
2. Select "Scheduled" or "Doing" in state filter
3. Set "Has Deadline" to "Yes"
```

### Find completed tasks in a date range
```
1. Select "Finished" in state filter
2. Choose "Completion Date" in date field
3. Set date range (From/To)
```

### Sort by urgency
```
1. Sort by "Due Date (Earliest First)"
2. Optionally filter by "Has Deadline: Yes"
```

### Find high-point tasks with no progress
```
1. Set "Min Points" to 8 or higher
2. Set "Has Schedule" to "No"
3. Sort by "Points (High to Low)"
```

## Filter State Structure

```typescript
interface TaskFilters {
    searchText: string;              // Fuzzy search text
    states: TaskState[];             // Selected states
    sortBy: SortOption;              // Sort option
    dateRangeStart?: Dayjs | null;   // Start date
    dateRangeEnd?: Dayjs | null;     // End date
    dateRangeField: 'filing' | 'due' | 'completion';
    hasDeadline?: boolean;           // Undefined = any
    hasSchedule?: boolean;           // Undefined = any
    hasComments?: boolean;           // Undefined = any
    minPoints?: number;              // Minimum points
    maxPoints?: number;              // Maximum points
}
```

## Visual Indicators

- **Active Filter Count**: Shows number of active filters in button badge
- **Clear Filters**: Button appears when any filter is active
- **Result Count**: "Showing X of Y tasks" displays filter effectiveness
- **State Chips**: Visual representation of selected states

## Future Enhancements

Potential improvements:
1. Save filter presets
2. Export filtered tasks
3. Filter by tags (when implemented)
4. Filter by assignee (when implemented)
5. Advanced search syntax (AND/OR/NOT)
6. Search history
7. Filter combinations as saved views
