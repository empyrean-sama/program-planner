export type StoryState = 'Filed' | 'Running' | 'Finished';

export interface Story {
    // System-generated fields
    id: string; // UUID
    filingDateTime: string; // ISO 8601 format
    
    // User-editable fields
    title: string;
    description: string;
    
    // Rule-based state (automatically calculated)
    state: StoryState;
    
    // Story metadata
    taskIds: string[]; // UUIDs of tasks in this story
    
    // Calculated fields (derived from tasks)
    totalPoints: number; // Sum of points from all tasks
    completedPoints: number; // Sum of points from finished tasks
    progress: number; // Percentage (0-100)
    
    // Timestamps
    startedAt?: string; // ISO 8601 format - when first task started
    finishedAt?: string; // ISO 8601 format - when all tasks finished
}

export interface CreateStoryInput {
    title: string;
    description: string;
}

export interface UpdateStoryInput {
    id: string;
    title?: string;
    description?: string;
}

export interface AddTaskToStoryInput {
    storyId: string;
    taskId: string;
}

export interface RemoveTaskFromStoryInput {
    storyId: string;
    taskId: string;
}
