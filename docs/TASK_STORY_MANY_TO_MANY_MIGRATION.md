# Task-Story Many-to-Many Relationship Migration

## Overview
This document details the architectural change that allows tasks to be associated with multiple stories simultaneously, migrating from a one-to-many relationship to a many-to-many relationship.

## Migration Date
Implemented: [Current Session]

## Change Summary
**Before:** Each task could belong to at most one story (`task.storyId?: string`)  
**After:** Each task can belong to multiple stories (`task.storyIds: string[]`)

## Data Model Changes

### Task Type (`src/types/Task.ts`)
```typescript
// BEFORE
export interface Task {
    // ... other fields
    storyId?: string;
}

export interface CreateTaskInput {
    // ... other fields
    storyId?: string;
}

// AFTER
export interface Task {
    // ... other fields
    storyIds: string[];
}

export interface CreateTaskInput {
    // ... other fields
    storyIds?: string[];
}
```

## Backend Changes

### TaskService (`src/services/TaskService.ts`)

#### Migration Logic
Added automatic migration in `loadTasks()` to convert old data format:
```typescript
// Migrate from single storyId to multiple storyIds
if ('storyId' in task && !(task as any).storyIds) {
    (task as any).storyIds = (task as any).storyId ? [(task as any).storyId] : [];
    delete (task as any).storyId;
}
```

#### Removed Methods
- `setTaskStory(taskId: string, storyId: string | null)` - Replaced by new methods

#### Added Methods
```typescript
// Add a task to a story (if not already associated)
addTaskToStory(taskId: string, storyId: string): Task

// Remove a task from a story
removeTaskFromStory(taskId: string, storyId: string): Task

// Replace all story associations for a task
setTaskStories(taskId: string, storyIds: string[]): Task
```

#### Updated Methods
- `createTask()` - Now accepts `storyIds` array instead of single `storyId`

### StoryService (`src/services/StoryService.ts`)

#### Updated Methods
```typescript
// BEFORE
private applyStoryRules(story: Story): void {
    const tasks = this.getTasksFn().filter(task => task.storyId === story.id);
    // ...
}

getStoryTasks(storyId: string): Task[] {
    return allTasks.filter(task => task.storyId === storyId);
}

// AFTER
private applyStoryRules(story: Story): void {
    const tasks = this.getTasksFn().filter(task => task.storyIds.includes(story.id));
    // ...
}

getStoryTasks(storyId: string): Task[] {
    return allTasks.filter(task => task.storyIds.includes(storyId));
}
```

### IPC Handlers (`src/main.ts`)

#### Removed Handlers
- `task:setStory` - No longer needed

#### Added Handlers
```typescript
// Add task to a story
ipcMain.handle('task:addToStory', async (_, taskId: string, storyId: string))

// Remove task from a story
ipcMain.handle('task:removeFromStory', async (_, taskId: string, storyId: string))

// Replace all story associations
ipcMain.handle('task:setStories', async (_, taskId: string, storyIds: string[]))
```

#### Updated Handlers
```typescript
// story:addTask - Now uses addTaskToStory()
ipcMain.handle('story:addTask', async (_, input: AddTaskToStoryInput) => {
    await taskService.addTaskToStory(input.taskId, input.storyId);
    // ...
})

// story:removeTask - Now uses removeTaskFromStory()
ipcMain.handle('story:removeTask', async (_, input: RemoveTaskFromStoryInput) => {
    await taskService.removeTaskFromStory(input.taskId, input.storyId);
    // ...
})
```

### Type Definitions (`src/electron.d.ts`)

```typescript
interface ITaskAPI {
    // Removed
    // setStory: (taskId: string, storyId: string | null) => Promise<{ success: boolean; ... }>;
    
    // Added
    setStories: (taskId: string, storyIds: string[]) => Promise<{ success: boolean; ... }>;
    addToStory: (taskId: string, storyId: string) => Promise<{ success: boolean; ... }>;
    removeFromStory: (taskId: string, storyId: string) => Promise<{ success: boolean; ... }>;
}
```

### Preload Bridge (`src/preload.ts`)

```typescript
taskAPI: {
    // Removed
    // setStory: (taskId: string, storyId: string | null) => ...
    
    // Added
    setStories: (taskId: string, storyIds: string[]) => ipcRenderer.invoke('task:setStories', taskId, storyIds),
    addToStory: (taskId: string, storyId: string) => ipcRenderer.invoke('task:addToStory', taskId, storyId),
    removeFromStory: (taskId: string, storyId: string) => ipcRenderer.invoke('task:removeFromStory', taskId, storyId),
}
```

## Frontend Changes

### TaskDialog (`src/components/Pages/Tasks/TaskDialog.tsx`)

Complete redesign for multi-select story assignment:

```typescript
// BEFORE - Single select
const [storyId, setStoryId] = useState('');

<Select value={storyId} onChange={(e) => setStoryId(e.target.value)}>
    {stories.map((story) => (
        <MenuItem key={story.id} value={story.id}>
            {story.title} ({story.state})
        </MenuItem>
    ))}
</Select>

// AFTER - Multi-select with checkboxes
const [selectedStories, setSelectedStories] = useState<string[]>([]);

<Select 
    multiple
    value={selectedStories}
    onChange={(e) => setSelectedStories(typeof e.target.value === 'string' 
        ? e.target.value.split(',') 
        : e.target.value
    )}
    renderValue={(selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
                const story = stories.find(s => s.id === value);
                return story ? (
                    <Chip key={value} label={story.title} size="small" />
                ) : null;
            })}
        </Box>
    )}
>
    {stories.map((story) => (
        <MenuItem key={story.id} value={story.id}>
            <Checkbox checked={selectedStories.indexOf(story.id) > -1} />
            <ListItemText primary={`${story.title} (${story.state})`} />
        </MenuItem>
    ))}
</Select>
```

**New Imports Added:**
- `Chip` - For displaying selected stories
- `Checkbox` - For multi-select UI
- `ListItemText` - For story labels

### TaskDetailsPage (`src/components/Pages/Tasks/TaskDetailsPage.tsx`)

Major redesign of story management UI:

#### New State
```typescript
const [stories, setStories] = useState<Story[]>([]); // Stores full Story objects
```

#### New Functions
```typescript
// Add task to a story
const handleAddToStory = async (storyId: string) => {
    const result = await window.taskAPI.addToStory(task.id, storyId);
    if (result.success) {
        showToast('Task added to story', 'success');
        reloadTask();
    }
};

// Remove task from a story
const handleRemoveFromStory = async (storyId: string) => {
    const result = await window.taskAPI.removeFromStory(task.id, storyId);
    if (result.success) {
        showToast('Task removed from story', 'success');
        reloadTask();
    }
};

// Load multiple stories by IDs
const loadStories = async (storyIds: string[]) => {
    const promises = storyIds.map(id => 
        window.storyAPI.getStory(id)
    );
    const results = await Promise.all(promises);
    const loadedStories = results
        .filter(r => r.success && r.data)
        .map(r => r.data!);
    setStories(loadedStories);
};
```

#### Updated UI
```typescript
// BEFORE - Single story badge
{task.storyId && (
    <Chip label={storyTitle} onClick={handleAssignToStory} />
)}

// AFTER - Multiple story chips with manage button
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    {stories.map((story) => (
        <Chip
            key={story.id}
            label={story.title}
            onClick={() => navigate(`/stories/${story.id}`)}
            color="primary"
            variant="outlined"
        />
    ))}
    <Button
        variant="outlined"
        size="small"
        onClick={() => setIsStoryDialogOpen(true)}
    >
        Manage
    </Button>
</Box>
```

#### Story Management Dialog
```typescript
// Dialog shows:
// 1. Current stories with remove buttons
// 2. Dropdown to add more stories (filtered to exclude current ones)

<Dialog open={isStoryDialogOpen} onClose={() => setIsStoryDialogOpen(false)}>
    <DialogTitle>Manage Stories</DialogTitle>
    <DialogContent>
        {/* Current Stories Section */}
        <Typography variant="subtitle2">Current Stories</Typography>
        <List>
            {stories.map((story) => (
                <ListItem key={story.id}>
                    <ListItemText primary={story.title} secondary={story.state} />
                    <IconButton onClick={() => handleRemoveFromStory(story.id)}>
                        <Delete />
                    </IconButton>
                </ListItem>
            ))}
        </List>
        
        {/* Add Story Section */}
        <Select
            value=""
            onChange={(e) => handleAddToStory(e.target.value)}
            displayEmpty
        >
            <MenuItem value="" disabled>Select a story to add...</MenuItem>
            {allStories
                .filter((s) => !task.storyIds.includes(s.id))
                .map((story) => (
                    <MenuItem key={story.id} value={story.id}>
                        {story.title} ({story.state})
                    </MenuItem>
                ))}
        </Select>
    </DialogContent>
</Dialog>
```

### AddTasksToStoryDialog (`src/components/Pages/Stories/AddTasksToStoryDialog.tsx`)

```typescript
// BEFORE
if (showOnlyUnassigned && task.storyId) return false;

// AFTER
if (showOnlyUnassigned && task.storyIds && task.storyIds.length > 0) return false;
```

### CreateTaskFromStoryDialog (`src/components/Pages/Stories/CreateTaskFromStoryDialog.tsx`)

```typescript
// BEFORE
await window.taskAPI.createTask({
    title,
    description,
    // ...
    storyId, // Single story ID
});

// AFTER
await window.taskAPI.createTask({
    title,
    description,
    // ...
    storyIds: [storyId], // Array with single story ID
});
```

## Backward Compatibility

### Data Migration
The migration is **fully backward compatible**. Old tasks with `storyId` field are automatically converted to the new format when loaded:

1. If a task has an old `storyId` field and no `storyIds` field:
   - Create `storyIds` array with the old `storyId` value (if present)
   - Delete the old `storyId` field
2. Empty/undefined `storyId` becomes empty `storyIds` array

### Example Migration
```typescript
// Old data format
{
    id: "task-1",
    title: "Fix bug",
    storyId: "story-123"
}

// Automatically converted to
{
    id: "task-1",
    title: "Fix bug",
    storyIds: ["story-123"]
}
```

## Testing Recommendations

### Unit Tests
1. Test `addTaskToStory()` - ensure no duplicates
2. Test `removeTaskFromStory()` - ensure clean removal
3. Test `setTaskStories()` - verify array replacement
4. Test migration logic with old data format
5. Test StoryService methods with many-to-many relationship

### Integration Tests
1. Create task with multiple stories
2. Add existing task to multiple stories
3. Remove task from some stories (not all)
4. Remove task from all stories
5. Verify story metrics update correctly with shared tasks

### UI Tests
1. Create task with multiple stories selected
2. Add/remove stories from TaskDetailsPage
3. Verify multi-select checkboxes work correctly
4. Verify story chips display properly
5. Test "Manage Stories" dialog functionality

### Migration Tests
1. Load old data file with `storyId` field
2. Verify automatic conversion to `storyIds`
3. Verify old `storyId` field is removed
4. Verify app functions correctly after migration

## Known Limitations

1. **Story Order**: Tasks don't maintain any specific order of their associated stories
2. **Circular Dependencies**: No validation prevents complex story-task relationships
3. **Performance**: Large numbers of stories per task may impact UI performance

## Future Enhancements

1. **Task Priority per Story**: Allow tasks to have different priorities in different stories
2. **Story-Specific Task State**: Consider allowing tasks to have different states in different stories
3. **Story Tags**: Add tags to categorize which stories a task belongs to
4. **Bulk Operations**: Add UI for bulk story assignments
5. **Story Dependency Graphs**: Visualize relationships between tasks and stories

## Files Modified

### Types
- `src/types/Task.ts` - Updated Task and CreateTaskInput interfaces

### Services
- `src/services/TaskService.ts` - Added new methods, migration logic
- `src/services/StoryService.ts` - Updated filter logic

### IPC Layer
- `src/main.ts` - Added/removed IPC handlers
- `src/electron.d.ts` - Updated ITaskAPI interface
- `src/preload.ts` - Updated IPC bridge

### UI Components
- `src/components/Pages/Tasks/TaskDialog.tsx` - Multi-select story UI
- `src/components/Pages/Tasks/TaskDetailsPage.tsx` - Story management UI
- `src/components/Pages/Stories/AddTasksToStoryDialog.tsx` - Filter logic
- `src/components/Pages/Stories/CreateTaskFromStoryDialog.tsx` - Updated to use storyIds

## Rollback Plan

If issues are discovered, rollback requires:

1. **Database Rollback**: Restore backup of `tasks.json` from before migration
2. **Code Rollback**: Revert all files listed in "Files Modified" section
3. **Clear App State**: Users should clear local storage/cache

⚠️ **Warning**: Rolling back after users have created tasks with multiple stories will result in data loss (only the first story association will be preserved).

## Documentation Updates

This migration makes the following documentation obsolete:
- Any references to single story assignment
- UI screenshots showing single story selection
- API examples using `storyId` field

Documentation that needs updating:
- [ ] User manual - Task creation section
- [ ] User manual - Story management section
- [ ] API documentation
- [ ] Developer onboarding guide

---

**Migration Status**: ✅ Complete  
**Compilation Status**: ✅ No Errors  
**Backward Compatibility**: ✅ Fully Compatible
