# Quick Create & Schedule - Auto-Select Enhancement

## Overview
Enhanced the "Quick Create & Schedule" feature so that when a task is created, the schedule dialog automatically opens with the newly created task pre-selected and the task combo box in readonly state.

## User Experience Improvement

### Before
1. User creates a task via "Quick Create & Schedule"
2. Schedule dialog opens
3. User must manually search for and select the newly created task
4. User could accidentally select a different task

### After
1. User creates a task via "Quick Create & Schedule"
2. Schedule dialog opens
3. **Newly created task is automatically selected**
4. **Task combo box is disabled/readonly**
5. User only needs to confirm/adjust the time and click "Add Schedule"

## Technical Implementation

### Files Modified

#### 1. `src/components/Pages/Tasks/TaskDialog.tsx`

**Updated Interface:**
```typescript
interface TaskDialogProps {
    open: boolean;
    onClose: () => void;
    onTaskCreated: (taskId?: string) => void;  // Now accepts optional taskId
}
```

**Updated Task Creation:**
```typescript
const result = await window.taskAPI.createTask(input);
if (result.success) {
    handleClose();
    onTaskCreated(result.data?.id);  // Pass the created task ID
}
```

#### 2. `src/components/Pages/Calendar/AddTaskScheduleDialog.tsx`

**Updated Interface:**
```typescript
interface AddTaskScheduleDialogProps {
    open: boolean;
    initialDate?: Dayjs;
    initialHour?: number;
    initialTaskId?: string;        // NEW: Pre-select this task
    taskReadonly?: boolean;        // NEW: Make task selection readonly
    onClose: () => void;
    onEntryAdded: () => void;
}
```

**Updated useEffect:**
```typescript
useEffect(() => {
    if (open) {
        loadTasks();
        
        // Set initial task if provided
        if (initialTaskId) {
            setSelectedTaskId(initialTaskId);
        }
        
        // ... rest of initialization
    }
}, [open, initialDate, initialHour, initialTaskId]);
```

**Updated SearchableComboBox:**
```typescript
<SearchableComboBox
    label=""
    value={selectedTaskId}
    options={taskOptions}
    onChange={setSelectedTaskId}
    placeholder="Search for a task..."
    searchThreshold={5}
    error={!!error && !selectedTaskId}
    disabled={taskReadonly}  // NEW: Disable when readonly
/>
```

#### 3. `src/components/Pages/Calendar/CalendarPage.tsx`

**New State Variables:**
```typescript
const [scheduleDialogTaskId, setScheduleDialogTaskId] = useState<string | undefined>(undefined);
const [scheduleDialogTaskReadonly, setScheduleDialogTaskReadonly] = useState(false);
```

**Updated Quick Create Callback:**
```typescript
const handleQuickTaskCreated = (taskId?: string) => {
    setQuickCreateDialogOpen(false);
    setTimeout(() => {
        setScheduleDialogTaskId(taskId);           // Set the task ID
        setScheduleDialogTaskReadonly(true);       // Make it readonly
        openScheduleDialog(quickCreateDate, quickCreateHour);
        globalState.showToast('Task created! Now add a schedule.', 'success', 2000);
    }, 200);
};
```

**Updated Schedule Dialog Component:**
```typescript
<AddTaskScheduleDialog
    open={scheduleDialogOpen}
    initialDate={scheduleDialogDate}
    initialHour={scheduleDialogHour}
    initialTaskId={scheduleDialogTaskId}           // NEW
    taskReadonly={scheduleDialogTaskReadonly}      // NEW
    onClose={() => {
        setScheduleDialogOpen(false);
        setScheduleDialogTaskId(undefined);        // Reset on close
        setScheduleDialogTaskReadonly(false);      // Reset on close
    }}
    onEntryAdded={handleScheduleAdded}
/>
```

**Updated handleScheduleAdded:**
```typescript
const handleScheduleAdded = () => {
    setRefreshKey(prev => prev + 1);
    setScheduleDialogOpen(false);
    setScheduleDialogTaskId(undefined);            // Reset after success
    setScheduleDialogTaskReadonly(false);          // Reset after success
    globalState.showToast('Schedule entry added successfully', 'success', 3000);
};
```

#### 4. `src/components/Pages/Tasks/TasksPage.tsx`

**Updated Callback (for compatibility):**
```typescript
const handleTaskCreated = (taskId?: string) => {  // Accept optional taskId
    setCreateDialogOpen(false);
    loadTasks();
};
```

## State Management Flow

### Quick Create & Schedule Workflow

1. **User initiates**: Right-clicks calendar → "Quick Create & Schedule"
   - `setQuickCreateDate(date)`
   - `setQuickCreateHour(hour)`
   - `setQuickCreateDialogOpen(true)`

2. **User creates task**: Fills form → "Create Task"
   - `taskAPI.createTask()` returns task with ID
   - `onTaskCreated(taskId)` called with new task ID

3. **Task dialog closes, schedule dialog opens**:
   - `setQuickCreateDialogOpen(false)`
   - `setScheduleDialogTaskId(taskId)` ✨
   - `setScheduleDialogTaskReadonly(true)` ✨
   - `openScheduleDialog(date, hour)`

4. **Schedule dialog renders**:
   - `useEffect` detects `initialTaskId`
   - `setSelectedTaskId(initialTaskId)` auto-selects task
   - SearchableComboBox renders with `disabled={true}`

5. **User adds schedule**: Adjusts time → "Add Schedule"
   - Schedule created for the pre-selected task
   - Both task ID and readonly state reset

6. **User cancels**: Clicks X or "Cancel"
   - Both task ID and readonly state reset

### Normal Schedule Workflow (unchanged)

1. User right-clicks → "Add Task Schedule"
2. Schedule dialog opens with:
   - `initialTaskId = undefined`
   - `taskReadonly = false`
3. User can freely search and select any task
4. User adds schedule

## Error Handling

### Edge Cases Handled

1. **Task creation fails**: 
   - Schedule dialog never opens
   - State remains clean

2. **User cancels schedule dialog**:
   - `onClose()` resets `scheduleDialogTaskId` and `scheduleDialogTaskReadonly`
   - Next dialog opening works correctly

3. **Task not found in list**:
   - If the newly created task doesn't appear in filtered list (shouldn't happen)
   - SearchableComboBox shows the ID but no preview
   - User would see validation error

4. **Multiple quick creates**:
   - Each workflow is independent
   - State properly resets between operations

## Benefits

### User Experience
- **Faster workflow**: One less step (no manual task selection)
- **Error prevention**: Can't accidentally schedule wrong task
- **Visual clarity**: Readonly state makes it obvious which task is being scheduled
- **Consistent behavior**: Same pattern as other "create then associate" flows

### Code Quality
- **Backward compatible**: Existing "Add Task Schedule" functionality unchanged
- **Clean state management**: Proper reset on all exit paths
- **Type safe**: Full TypeScript support with optional parameters
- **Maintainable**: Clear separation between quick create and normal workflows

## Testing Recommendations

### Test Cases

1. **Happy Path - Quick Create**:
   - Create task → Verify auto-selection → Add schedule → Verify calendar updated

2. **Cancel After Task Creation**:
   - Create task → Close schedule dialog → Verify state reset

3. **Normal Schedule Flow**:
   - Use "Add Task Schedule" → Verify combo box is NOT readonly

4. **Multiple Quick Creates**:
   - Create task A → Cancel schedule
   - Create task B → Verify task B selected (not task A)

5. **Task Creation Failure**:
   - Force validation error → Verify schedule dialog doesn't open

6. **Empty Task List**:
   - Filter all tasks to final states → Create new task → Verify it appears

## Future Enhancements

### Potential Improvements

1. **Highlight New Task**: Add visual indicator (badge, animation) on newly created task in preview
2. **Smart Duration**: Use task's estimated time as default schedule duration
3. **Validation**: Prevent scheduling task that's already scheduled at that time
4. **Undo**: Allow user to unlock task selection if they want to schedule a different task
5. **Batch Create**: Create multiple tasks and schedule them all at once

## Related Features

- Quick Create & Schedule (base feature)
- Task Creation Dialog
- Schedule Dialog
- Calendar Context Menu

## Related Documentation

- [Quick Create & Schedule Feature](./QUICK_CREATE_SCHEDULE_FEATURE.md)
- [Context Menu Documentation](./CONTEXT_MENU_README.md)
- [Calendar Task Integration](./CALENDAR_TASK_INTEGRATION.md)
