# Refactoring & Optimization Plan

## Executive Summary
Comprehensive audit results for performance optimization, loading states, design adherence, and bug fixes.

---

## 🔍 Issues Identified

### 1. **Performance Issues**

#### Calendar Components
- **TimeSlotColumn.tsx** - Heavy re-renders on every drag/resize
- **CalendarPage.tsx** - Too many state variables (15+), causing unnecessary re-renders
- **MonthView/WeekView/DayView** - Re-fetch tasks on every refresh, no caching

#### Missing Optimizations
- No `React.memo` on expensive components
- No `useMemo` for filtered/sorted data in calendar views
- No `useCallback` for event handlers passed as props
- Missing debouncing on drag operations

### 2. **Missing Loading States**

#### Components Without Loading Indicators
1. **CalendarPage** - No loading state during initial task fetch
2. **AddTaskScheduleDialog** - No loading when fetching tasks
3. **EditScheduleDialog** - No loading feedback during update
4. **TaskDialog** - No loading when fetching stories
5. **StoryDetailsPage** - Has loading but UI could be improved
6. **Metrics Pages** - Missing skeleton screens

### 3. **Design Adherence Issues**

#### Inconsistent Patterns
- **Dialog sizes**: Some use "sm", some "md", inconsistent
- **Button styles**: Mix of variant="contained" and variant="outlined"
- **Spacing**: Inconsistent padding (px: 2 vs px: 3)
- **Error handling**: Some show toasts, some show inline errors
- **Loading states**: Mix of CircularProgress and custom skeletons

#### Missing Design Elements
- No empty states in calendar when no tasks
- No error boundaries around major components
- Inconsistent z-index values (hardcoded throughout)

### 4. **Bugs Found**

#### Critical
1. **Calendar State Management** - Too many state variables, potential race conditions
2. **Memory Leaks** - Event listeners in TimeSlotColumn not always cleaned up
3. **Drag/Drop** - dragPreview not cleared on drag cancel (only on drop)

#### Medium
1. **CalendarPage** - Excessive state updates on context menu actions
2. **TimeSlotColumn** - currentDragY ref might not update before calculations
3. **Task Filtering** - No memoization, recalculates on every render

#### Minor
1. **Console warnings** - Missing keys in some map functions
2. **Type safety** - Some `any` types in context menu commands
3. **Accessibility** - Missing ARIA labels on drag handles

---

## 🎯 Refactoring Plan

### Phase 1: Performance Optimization (High Priority)

#### 1.1 Calendar State Consolidation
**File:** `CalendarPage.tsx`

**Problem:** 15+ separate state variables
```typescript
// BEFORE
const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
const [scheduleDialogDate, setScheduleDialogDate] = useState<Dayjs | undefined>(undefined);
const [scheduleDialogHour, setScheduleDialogHour] = useState<number | undefined>(undefined);
const [scheduleDialogTaskId, setScheduleDialogTaskId] = useState<string | undefined>(undefined);
const [scheduleDialogTaskReadonly, setScheduleDialogTaskReadonly] = useState(false);
// ... 10 more states
```

**Solution:** Consolidate into structured state objects
```typescript
// AFTER
const [dialogState, setDialogState] = useState({
  schedule: { open: false, date: undefined, hour: undefined, taskId: undefined, readonly: false },
  quickCreate: { open: false, date: undefined, hour: undefined },
  editSchedule: { open: false, taskId: null, entryId: null, startTime: null, endTime: null }
});
```

#### 1.2 Component Memoization
**Files:** Calendar components, Task cards

```typescript
// Wrap expensive components
const TimeSlotColumn = React.memo(TimeSlotColumnComponent);
const TaskCard = React.memo(TaskCardComponent);
const CalendarEvent = React.memo(CalendarEventComponent);
```

#### 1.3 Callback Optimization
**File:** `CalendarPage.tsx`

```typescript
// Wrap handlers in useCallback
const handleContextMenu = useCallback((event, date, hour, task, scheduleEntryId) => {
  // ...
}, []);

const handleScheduleDeleted = useCallback(async (taskId, entryId) => {
  // ...
}, [refreshKey]);
```

#### 1.4 Data Caching
**New File:** `src/hooks/useTasksCache.ts`

```typescript
// Cache tasks to avoid unnecessary API calls
export function useTasksCache() {
  const [cache, setCache] = useState<Map<string, Task[]>>(new Map());
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const getTasks = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetch < 30000) { // 30s cache
      return cache.get('all') || [];
    }
    // Fetch and update cache
  }, [cache, lastFetch]);
  
  return { getTasks, invalidateCache };
}
```

### Phase 2: Loading States (High Priority)

#### 2.1 Calendar Loading State
**File:** `CalendarPage.tsx`

```typescript
const [loading, setLoading] = useState(true);

// Show skeleton on initial load
{loading ? (
  <CalendarSkeleton view={view} />
) : (
  <Box sx={{ flex: 1, minHeight: 0 }}>
    {/* Calendar views */}
  </Box>
)}
```

#### 2.2 Dialog Loading States
**Files:** `AddTaskScheduleDialog.tsx`, `EditScheduleDialog.tsx`, `TaskDialog.tsx`

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<Button 
  onClick={handleSubmit} 
  variant="contained"
  disabled={isSubmitting}
>
  {isSubmitting ? <CircularProgress size={20} /> : 'Save'}
</Button>
```

#### 2.3 Create Skeleton Components
**New File:** `src/components/Common/CalendarSkeleton.tsx`

```typescript
export function CalendarSkeleton({ view }: { view: CalendarView }) {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
      <Grid container spacing={1}>
        {Array.from({ length: view === 'month' ? 35 : 7 }).map((_, i) => (
          <Grid item xs={view === 'month' ? 12/7 : 12} key={i}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
```

### Phase 3: Design Adherence (Medium Priority)

#### 3.1 Standardize Dialog Patterns
**Create:** `src/constants/uiConstants.ts`

```typescript
export const UI_CONSTANTS = {
  DIALOG_SIZES: {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
  },
  BUTTON_VARIANTS: {
    PRIMARY: 'contained',
    SECONDARY: 'outlined',
    TERTIARY: 'text',
  },
  SPACING: {
    DIALOG_PADDING: 3,
    CARD_PADDING: 2,
    SECTION_SPACING: 3,
  },
  Z_INDEX: {
    DRAWER: 1200,
    MODAL: 1300,
    TOOLTIP: 1400,
    CONTEXT_MENU: 1500,
    DRAG_PREVIEW: 100,
    RESIZE_PREVIEW: 101,
    TIME_INDICATOR: 102,
  },
} as const;
```

#### 3.2 Unified Error Handling
**New File:** `src/hooks/useErrorHandler.ts`

```typescript
export function useErrorHandler() {
  const globalState = useAppGlobalState();
  
  return useCallback((error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    const fullMessage = context ? `${context}: ${message}` : message;
    
    console.error(fullMessage, error);
    globalState.showToast(fullMessage, 'error', 5000);
  }, [globalState]);
}
```

#### 3.3 Empty States
**New File:** `src/components/Common/EmptyState.tsx`

```typescript
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
```

### Phase 4: Bug Fixes (Critical Priority)

#### 4.1 Fix TimeSlotColumn Event Cleanup
**File:** `TimeSlotColumn.tsx`

```typescript
useEffect(() => {
  const handleMouseMove = (event: MouseEvent) => { /* ... */ };
  const handleMouseUp = async () => { /* ... */ };

  if (resizingEvent) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  return () => {
    // ALWAYS clean up
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setResizingEvent(null);
    setResizePreview(null);
  };
}, [resizingEvent, /* ... */]);
```

#### 4.2 Fix Drag Cancel
**File:** `TimeSlotColumn.tsx`

```typescript
const handleDragEnd = (event: React.DragEvent) => {
  setDraggedEvent(null);
  setDragPreview(null);
};

// Add to container
<Box
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragEnd={handleDragEnd} // NEW
  onDragLeave={handleDragEnd} // NEW
>
```

#### 4.3 Fix Type Safety in Commands
**File:** `calendarCommands.ts`

```typescript
// Remove all `any` types
action: (context: CalendarContextMenuContext & {
  openScheduleDialog: (date?: Dayjs, hour?: number) => void;
  openQuickCreateDialog: (date?: Dayjs, hour?: number) => void;
  onScheduleDeleted: (taskId: string, entryId: string) => Promise<void>;
  onEditSchedule: (taskId: string, entryId: string) => void;
  onDuplicateSchedule: (taskId: string) => void;
  onChangeTaskState: (taskId: string, newState: string) => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
}) => void;
```

---

## 📊 Implementation Priority

### Sprint 1 (Week 1)
- [ ] Fix critical bugs (Phase 4)
- [ ] Add loading states to dialogs (Phase 2.2)
- [ ] Consolidate CalendarPage state (Phase 1.1)

### Sprint 2 (Week 2)
- [ ] Add calendar loading state (Phase 2.1)
- [ ] Create skeleton components (Phase 2.3)
- [ ] Implement component memoization (Phase 1.2)

### Sprint 3 (Week 3)
- [ ] Add callback optimization (Phase 1.3)
- [ ] Implement data caching (Phase 1.4)
- [ ] Standardize UI constants (Phase 3.1)

### Sprint 4 (Week 4)
- [ ] Add empty states (Phase 3.3)
- [ ] Unified error handling (Phase 3.2)
- [ ] Final testing and polish

---

## 📈 Expected Improvements

### Performance
- **50% reduction** in unnecessary re-renders
- **3x faster** calendar view switches with caching
- **Smoother** drag/drop operations with debouncing

### User Experience
- **Clear feedback** during all async operations
- **Professional** empty states
- **Consistent** error handling
- **Faster** perceived performance with skeletons

### Code Quality
- **Fewer bugs** with consolidated state
- **Easier maintenance** with standardized patterns
- **Better type safety** with removed `any` types
- **Cleaner code** with extracted hooks

---

## 🧪 Testing Checklist

### After Each Phase
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All features work as before
- [ ] Loading states appear correctly
- [ ] Error handling works
- [ ] Performance improvements measurable

### Final Integration Test
- [ ] Create task workflow
- [ ] Schedule task workflow  
- [ ] Edit schedule workflow
- [ ] Delete schedule workflow
- [ ] Calendar view switching
- [ ] Drag and drop
- [ ] Resize events
- [ ] Context menu operations
- [ ] Error scenarios

---

## 📝 Notes

### Breaking Changes
None - all refactoring maintains backward compatibility

### Migration Guide
Not needed - internal refactoring only

### Monitoring
- Add performance marks for calendar render time
- Log cache hit/miss rates
- Track dialog open/close times

