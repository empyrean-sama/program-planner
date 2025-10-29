# Quick Create & Schedule Feature

## Overview
This feature adds a new calendar context menu command that allows users to create a new task and schedule it in one seamless workflow, reducing the number of clicks and improving productivity.

## Feature Details

### Context Menu Command
- **ID**: `create-and-schedule`
- **Label**: "Quick Create & Schedule"
- **Icon**: AddTaskIcon from Material-UI
- **Availability**: Always available in the calendar context menu

### User Workflow
1. User right-clicks on a calendar date/time slot
2. User selects "Quick Create & Schedule" from the context menu
3. Task creation dialog opens
4. User fills in task details (title, description, due date, etc.)
5. User clicks "Create Task"
6. Task creation dialog closes
7. Schedule dialog automatically opens with:
   - The newly created task pre-selected
   - The originally clicked date pre-filled
   - The originally clicked hour pre-filled (if applicable)
8. User configures the schedule (start/end time, duration)
9. User clicks "Add Schedule"
10. Calendar refreshes to show the new scheduled task

### Success Messages
- After task creation: "Task created! Now add a schedule." (2 second toast)
- After schedule added: "Schedule entry added successfully" (3 second toast)

## Technical Implementation

### Files Modified

#### 1. `src/components/Pages/Calendar/commands/calendarCommands.ts`
- Added `AddTaskIcon` import from `@mui/icons-material`
- Added new command object to the `calendarCommands` array
- Command invokes `context.openQuickCreateDialog(context.date, context.hour)`

#### 2. `src/components/Pages/Calendar/CalendarPage.tsx`

**New Imports:**
```typescript
import TaskDialog from '../Tasks/TaskDialog';
```

**New State Variables:**
```typescript
const [quickCreateDialogOpen, setQuickCreateDialogOpen] = useState(false);
const [quickCreateDate, setQuickCreateDate] = useState<Dayjs | undefined>(undefined);
const [quickCreateHour, setQuickCreateHour] = useState<number | undefined>(undefined);
```

**New Functions:**
```typescript
// Opens the quick create dialog and stores the date/hour for later
const openQuickCreateDialog = (date?: Dayjs, hour?: number) => {
    setQuickCreateDate(date);
    setQuickCreateHour(hour);
    setQuickCreateDialogOpen(true);
    handleCloseContextMenu();
};

// Callback when task is created - chains to schedule dialog
const handleQuickTaskCreated = () => {
    setQuickCreateDialogOpen(false);
    setTimeout(() => {
        openScheduleDialog(quickCreateDate, quickCreateHour);
        globalState.showToast('Task created! Now add a schedule.', 'success', 2000);
    }, 200);
};
```

**Updated Context:**
```typescript
const contextWithDialog: CalendarContextMenuContext & { 
    openScheduleDialog: (date?: Dayjs, hour?: number) => void;
    openQuickCreateDialog: (date?: Dayjs, hour?: number) => void;  // NEW
    navigate: ReturnType<typeof useNavigate>;
    location: ReturnType<typeof useLocation>;
} = {
    ...contextMenuContext!,
    openScheduleDialog,
    openQuickCreateDialog,  // NEW
    navigate,
    location,
};
```

**New Component:**
```tsx
<TaskDialog
    open={quickCreateDialogOpen}
    onClose={() => setQuickCreateDialogOpen(false)}
    onTaskCreated={handleQuickTaskCreated}
/>
```

## Design Rationale

### Why Two Dialogs?
1. **Separation of Concerns**: Task creation and scheduling are distinct operations
2. **Reusability**: Both dialogs are already used elsewhere in the app
3. **Maintainability**: No need to create a complex combined dialog
4. **User Clarity**: Clear two-step process with visual feedback

### Why 200ms Delay?
- Allows the task creation dialog to fully close before opening the schedule dialog
- Provides a smooth visual transition
- Ensures the task is fully created in the backend before attempting to schedule it

### Success Messages
- First toast confirms task creation and prepares user for next step
- Second toast confirms the entire workflow is complete
- Different durations (2s vs 3s) to avoid message overlap

## Testing Recommendations

### Manual Testing
1. **Basic Flow**: Right-click calendar → Quick Create & Schedule → Create task → Add schedule
2. **Cancel First Dialog**: Verify schedule dialog doesn't open if task creation is cancelled
3. **Cancel Second Dialog**: Verify calendar doesn't break if schedule creation is cancelled
4. **Different Views**: Test in Month, Week, and Day views
5. **Different Times**: Test with and without hour context (month view has no hour)
6. **Validation**: Test with invalid task data to ensure proper error handling

### Edge Cases
- What happens if task creation fails?
- What happens if the user closes the browser mid-workflow?
- What if there are no tasks available when the schedule dialog opens?
- What if the task list changes between dialogs?

## Future Enhancements

### Potential Improvements
1. **Pre-fill Schedule**: Automatically select the newly created task in the schedule dialog
2. **Combined Dialog**: Create a unified "Quick Create" dialog for even faster workflows
3. **Keyboard Shortcut**: Add a hotkey for this common operation
4. **Default Duration**: Use task's estimated time as default schedule duration
5. **Smart Scheduling**: Suggest optimal time slots based on existing schedules

### Related Features
- Task templates for even faster creation
- Recurring task creation with automatic scheduling
- Batch task creation and scheduling
- AI-powered schedule suggestions

## User Documentation

### How to Use
1. Navigate to the Calendar page
2. Right-click on any date or time slot
3. Select "Quick Create & Schedule" from the menu
4. Fill in the task details and click "Create Task"
5. Configure the schedule and click "Add Schedule"
6. Your new task will appear on the calendar!

### Tips
- The selected date and time will be pre-filled in the schedule dialog
- You can still schedule the task for a different time if needed
- This is faster than creating a task from the Tasks page and then scheduling it

## Related Documentation
- [Context Menu Documentation](./CONTEXT_MENU_README.md)
- [Task Feature Documentation](./TASK_FEATURE_README.md)
- [Calendar Task Integration](./CALENDAR_TASK_INTEGRATION.md)
