# Design Adherence Audit Report

**Date:** October 29, 2025  
**Auditor:** GitHub Copilot  
**Scope:** Full project architecture review focusing on data management

---

## Executive Summary

This audit identified **critical design violations** in the data management layer, specifically around the "Destroy All Data" functionality and data persistence architecture.

### Critical Issues Found

1. ✅ **CRITICAL BUG**: Destroy All Data does not delete Stories
2. ⚠️ **DESIGN INCONSISTENCY**: Separate storage for Tasks and Stories without unified management
3. ⚠️ **INCOMPLETE IMPLEMENTATION**: Export/Import functionality is also separated

---

## Issue #1: Destroy All Data Does Not Delete Stories

### Severity: CRITICAL 🔴

### Description
The "Destroy All Data" button in Settings only deletes tasks but leaves all stories intact. This violates user expectations and can lead to:
- Orphaned stories referencing non-existent tasks
- Data inconsistency
- Confused users who think all data was deleted

### Current Implementation

**Location:** `src/components/Pages/Settings/SettingsPage.tsx`

```typescript
const handleDestroyData = async () => {
    try {
        const result = await window.taskAPI.destroyAllData(); // ❌ Only deletes tasks
        if (result.success) {
            globalState.showToast('All data has been successfully destroyed', 'success', 4000);
        } else {
            globalState.showToast('Failed to destroy data: ' + result.error, 'error', 5000);
        }
    } catch (error) {
        globalState.showToast('Error destroying data: ' + (error as Error).message, 'error', 5000);
    }
    setDeleteDialogOpen(false);
};
```

### What Should Happen
Both `taskAPI.destroyAllData()` AND `storyAPI.destroyAllData()` should be called to completely wipe all application data.

### Evidence of Available APIs

**Both APIs exist and are properly exposed:**

```typescript
// src/electron.d.ts
interface ITaskAPI {
    destroyAllData: () => Promise<{ success: boolean; error?: string }>;
}

interface IStoryAPI {
    destroyAllData: () => Promise<{ success: boolean; error?: string }>; // ✅ Available but unused
}
```

**Both services implement the functionality:**

```typescript
// src/services/TaskService.ts
destroyAllData(): { success: boolean; error?: string } {
    try {
        this.tasks = [];
        this.saveTasks();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// src/services/StoryService.ts
destroyAllData(): { success: boolean; error?: string } {
    try {
        this.stories = [];
        this.saveStories();
        return { success: true };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}
```

### Impact

**User Impact:**
- Users believe all data is deleted but stories remain
- Orphaned stories reference deleted tasks (broken `task.storyIds` references)
- Confusion when stories appear after "destroying all data"

**Data Integrity:**
- Broken many-to-many relationships between tasks and stories
- Invalid `story.taskIds` arrays pointing to deleted tasks
- Inconsistent application state

### Recommended Fix

```typescript
const handleDestroyData = async () => {
    try {
        // Delete both tasks and stories
        const [taskResult, storyResult] = await Promise.all([
            window.taskAPI.destroyAllData(),
            window.storyAPI.destroyAllData(),
        ]);
        
        if (taskResult.success && storyResult.success) {
            globalState.showToast('All data has been successfully destroyed', 'success', 4000);
        } else {
            const errors = [];
            if (!taskResult.success) errors.push(`Tasks: ${taskResult.error}`);
            if (!storyResult.success) errors.push(`Stories: ${storyResult.error}`);
            globalState.showToast(`Failed to destroy data: ${errors.join(', ')}`, 'error', 5000);
        }
    } catch (error) {
        globalState.showToast('Error destroying data: ' + (error as Error).message, 'error', 5000);
    }
    setDeleteDialogOpen(false);
};
```

---

## Issue #2: Separate Data Storage Without Unified Management

### Severity: DESIGN ISSUE ⚠️

### Description
Tasks and Stories are stored in completely separate JSON files with no unified management layer.

### Current Architecture

```
Data Storage Layer:
├── tasks.json         (TaskService manages)
└── stories.json       (StoryService manages)
    
Services Layer:
├── TaskService        (Independent operations)
└── StoryService       (Independent operations, depends on TaskService for queries)
    
IPC Layer:
├── taskAPI.*          (Task operations)
└── storyAPI.*         (Story operations)
```

### Relationships

**Tasks → Stories: Many-to-Many**
- Each `Task` has `storyIds: string[]`
- Each `Story` has `taskIds: string[]` (derived, not stored)
- `StoryService` queries `TaskService` to get tasks for rules calculation

**Dependency Direction:**
```
StoryService → TaskService (via getTasksFn callback)
```

### Design Questions

1. **Should there be a unified DataService?**
   - Pros: Single source of truth, atomic operations
   - Cons: More complex, harder to test individual entities
   
2. **Should data be in one file or separate files?**
   - Current: Separate files
   - Alternative: Single `app-data.json` with tasks and stories

3. **Should destroy/export/import be unified operations?**
   - Current: Separate operations per entity
   - Recommended: Unified operations that handle all entities

### Recommendations

**Option A: Keep Separate Services, Add Unified Operations**
```typescript
// Add to a new DataManagementService
class DataManagementService {
    constructor(
        private taskService: TaskService,
        private storyService: StoryService
    ) {}
    
    destroyAllData(): { success: boolean; error?: string } {
        const taskResult = this.taskService.destroyAllData();
        const storyResult = this.storyService.destroyAllData();
        
        if (!taskResult.success || !storyResult.success) {
            return { 
                success: false, 
                error: `Task: ${taskResult.error}, Story: ${storyResult.error}` 
            };
        }
        return { success: true };
    }
    
    exportAllData(): { success: boolean; filePath?: string; error?: string } {
        // Export both tasks and stories to a single file
    }
    
    importAllData(): { success: boolean; error?: string } {
        // Import both tasks and stories from a single file
    }
}
```

**Option B: Merge into Single DataService** (More invasive)
```typescript
class DataService {
    private tasks: Task[] = [];
    private stories: Story[] = [];
    
    // All operations in one place
}
```

---

## Issue #3: Export/Import Also Separated

### Severity: DESIGN ISSUE ⚠️

### Description
Export and Import functionality is also separated by entity type, leading to:
- Users can only export/import tasks OR stories, not both
- No way to backup complete application state
- Risk of data inconsistency when importing partial data

### Current Implementation

**SettingsPage.tsx:**
```typescript
const handleExportData = async () => {
    const result = await window.taskAPI.exportData(); // ❌ Only exports tasks
    // ...
};

const handleImportData = async () => {
    const result = await window.taskAPI.importData(); // ❌ Only imports tasks
    // ...
};
```

### Recommended Solution

**Unified Export:**
```json
{
    "exportDate": "2025-10-29T...",
    "version": "1.0",
    "tasks": [...],
    "stories": [...]
}
```

**Implementation:**
```typescript
const handleExportData = async () => {
    // Could be implemented in main.ts as a new handler
    const result = await window.appAPI.exportAllData();
    // Exports both tasks and stories to single file
};

const handleImportData = async () => {
    const result = await window.appAPI.importAllData();
    // Imports both tasks and stories from single file
};
```

---

## Architecture Compliance Review

### ✅ Properly Implemented Patterns

1. **IPC Communication**
   - Main/Renderer process separation: ✅ Correct
   - Preload bridge: ✅ Properly implemented
   - Type safety: ✅ Full TypeScript definitions

2. **Service Layer**
   - TaskService: ✅ Well-structured
   - StoryService: ✅ Well-structured
   - Rule engines: ✅ Properly separated

3. **Data Relationships**
   - Many-to-many Task-Story: ✅ Correctly implemented
   - Migration from old format: ✅ Backward compatible

4. **File Storage**
   - JSON persistence: ✅ Works correctly
   - userData directory: ✅ Proper location

### ❌ Design Violations

1. **Incomplete Multi-Entity Operations**
   - Destroy All Data: ❌ Only destroys tasks
   - Export Data: ❌ Only exports tasks
   - Import Data: ❌ Only imports tasks

2. **No Unified Data Management API**
   - Missing: Atomic operations across entities
   - Missing: Transaction-like behavior
   - Missing: Rollback capability

3. **UI Misleading User**
   - Button says "Destroy All Data"
   - Only destroys tasks
   - No indication that stories survive

---

## Recommended Changes

### Priority 1: Fix Critical Bug (IMMEDIATE)

**File:** `src/components/Pages/Settings/SettingsPage.tsx`

**Change:** Update `handleDestroyData` to delete both tasks and stories

**Estimated Effort:** 5 minutes

**Risk:** Low - Both APIs exist and work

### Priority 2: Update UI Labels (IMMEDIATE)

If unified destroy is not implemented immediately, update the UI to be honest:

```tsx
<Button>Destroy All Tasks</Button>
<Typography>Permanently delete all tasks (stories will be preserved)</Typography>
```

### Priority 3: Unified Export/Import (HIGH)

**Approach:**
1. Create new IPC handlers: `app:exportAllData`, `app:importAllData`
2. Create unified export format with both tasks and stories
3. Update SettingsPage to use new handlers

**Estimated Effort:** 2-3 hours

**Risk:** Medium - Need to handle backward compatibility

### Priority 4: Consider DataManagementService (MEDIUM)

**Approach:**
1. Create new `DataManagementService` class
2. Inject TaskService and StoryService
3. Provide unified operations
4. Update main.ts to use it

**Estimated Effort:** 4-6 hours

**Risk:** Low - Additive change, doesn't break existing code

---

## Testing Recommendations

### Test Cases for Destroy All Data

1. **Test: Destroy with only tasks**
   - Create tasks, no stories
   - Click "Destroy All Data"
   - Verify tasks.json is empty
   - Verify stories.json is empty (or doesn't exist)

2. **Test: Destroy with only stories**
   - Create stories, no tasks
   - Click "Destroy All Data"
   - Verify both files are empty

3. **Test: Destroy with tasks and stories linked**
   - Create tasks
   - Create stories
   - Link tasks to stories
   - Click "Destroy All Data"
   - Verify both files are empty
   - No orphaned references

4. **Test: Partial failure handling**
   - Simulate failure in one destroy operation
   - Verify user gets proper error message
   - Verify data consistency (both or neither deleted)

### Test Cases for Export/Import

1. **Test: Export with both entities**
   - Create tasks and stories
   - Export data
   - Verify JSON contains both arrays

2. **Test: Import with both entities**
   - Import file with tasks and stories
   - Verify both are created
   - Verify relationships are preserved

3. **Test: Backward compatibility**
   - Import old format (tasks only)
   - Verify tasks are imported
   - Verify no errors for missing stories

---

## Documentation Updates Needed

1. **DEVELOPER.md**
   - Update data management section
   - Document unified operations
   - Add destroy/export/import patterns

2. **TASK_STORY_MANY_TO_MANY_MIGRATION.md**
   - Add section on data management implications
   - Document orphaned reference prevention

3. **New: DATA_MANAGEMENT_README.md**
   - Document all data operations
   - Explain storage architecture
   - Provide backup/restore procedures

---

## Issue #4: Story Deletion Leaves Orphaned References

### Severity: CRITICAL 🔴

### Description
When a story is deleted, the `task.storyIds` arrays in tasks are not updated, leaving orphaned references to non-existent stories.

### Current Implementation

**Location:** `src/services/StoryService.ts`

```typescript
deleteStory(id: string): boolean {
    const initialLength = this.stories.length;
    this.stories = this.stories.filter(story => story.id !== id);
    
    if (this.stories.length < initialLength) {
        this.saveStories();
        return true; // ❌ Doesn't clean up task.storyIds
    }
    
    return false;
}
```

**Location:** `src/main.ts`

```typescript
ipcMain.handle('story:delete', async (_, id: string) => {
    try {
        const result = storyService.deleteStory(id);
        return { success: result, error: result ? undefined : 'Story not found' };
        // ❌ Doesn't update tasks
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});
```

### Impact

**Data Integrity:**
- Tasks contain references to deleted stories
- Filtering/displaying tasks by story will fail
- Many-to-many relationship is broken on one side

**User Impact:**
- Tasks show non-existent stories in UI
- Clicking on story from task may cause errors
- Confusion about what stories a task belongs to

### Recommended Fix

**Option 1: Update StoryService**
```typescript
deleteStory(id: string): boolean {
    const story = this.stories.find(s => s.id === id);
    if (!story) return false;
    
    // Get all tasks associated with this story
    const tasks = this.getTasksFn().filter(task => task.storyIds.includes(id));
    
    // Remove story from each task's storyIds
    tasks.forEach(task => {
        task.storyIds = task.storyIds.filter(storyId => storyId !== id);
    });
    
    // Delete the story
    this.stories = this.stories.filter(s => s.id !== id);
    this.saveStories();
    
    return true;
}
```

**Option 2: Update IPC Handler in main.ts**
```typescript
ipcMain.handle('story:delete', async (_, id: string) => {
    try {
        // Get all tasks in this story before deleting
        const tasksInStory = taskService.getAllTasks().filter(
            task => task.storyIds.includes(id)
        );
        
        // Remove story from all tasks
        tasksInStory.forEach(task => {
            taskService.removeTaskFromStory(task.id, id);
        });
        
        // Delete the story
        const result = storyService.deleteStory(id);
        return { success: result, error: result ? undefined : 'Story not found' };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
});
```

**Recommendation:** Use Option 2 (main.ts) because:
- StoryService shouldn't modify tasks (separation of concerns)
- IPC handler already handles cross-service coordination (see addTask/removeTask)
- Follows existing pattern in the codebase

---

## Conclusion

The project has a **solid architectural foundation** with proper separation of concerns, type safety, and well-structured services. However, there are **critical gaps in multi-entity operations** that need immediate attention.

**Immediate Actions Required:**
1. ✅ Fix destroy all data to include stories (COMPLETED)
2. ❌ Fix story deletion to clean up task references (CRITICAL)
3. Update export/import to be unified (2-3 hours)

**Long-term Recommendations:**
1. Create DataManagementService for unified operations
2. Add transaction-like behavior for atomic operations
3. Implement proper rollback for failed operations
4. Add comprehensive testing suite

---

**Audit Status:** ✅ Complete  
**Critical Issues:** 2 (1 Fixed, 1 Remaining)  
**Design Issues:** 2  
**Recommendations:** 4

**Next Steps:** 
1. ✅ Destroy all data fix - COMPLETED
2. Fix story deletion orphaned references - HIGH PRIORITY
3. Address export/import unification
