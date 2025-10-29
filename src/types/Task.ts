export type TaskState = 'Filed' | 'Scheduled' | 'Doing' | 'Finished' | 'Failed' | 'Deferred' | 'Removed';

export interface ScheduleHistoryEntry {
    id: string;
    startTime: string; // ISO 8601 format
    endTime: string; // ISO 8601 format
    duration: number; // in minutes
    createdAt: string; // ISO 8601 format
}

export interface TaskComment {
    id: string;
    text: string;
    createdAt: string; // ISO 8601 format
}

export interface TaskRelationship {
    id: string; // UUID of the relationship
    type: 'predecessor' | 'successor';
    relatedTaskId: string; // UUID of the related task
    createdAt: string; // ISO 8601 format
}

export interface Task {
    // System-generated fields
    id: string; // UUID
    filingDateTime: string; // ISO 8601 format
    
    // User-editable fields
    title: string;
    description: string;
    state: TaskState;
    dueDateTime?: string; // ISO 8601 format, optional
    
    // Estimated time in minutes (cannot be edited after creation)
    estimatedTime?: number;
    
    // Schedule history and elapsed time
    scheduleHistory: ScheduleHistoryEntry[];
    elapsedTime: number; // Calculated field, sum of all schedule history durations
    
    // Points (calculated based on estimated time using Fibonacci-like sequence)
    points: number;
    
    // Comments
    comments: TaskComment[];
    
    // Relationships (predecessors and successors)
    relationships: TaskRelationship[];
}

export interface CreateTaskInput {
    title: string;
    description: string;
    dueDateTime?: string;
    estimatedTime?: number;
}

export interface UpdateTaskInput {
    id: string;
    title?: string;
    description?: string;
    state?: TaskState;
    dueDateTime?: string;
}

export interface AddScheduleEntryInput {
    taskId: string;
    startTime: string;
    endTime: string;
}

export interface UpdateScheduleEntryInput {
    taskId: string;
    entryId: string;
    startTime: string;
    endTime: string;
}

export interface AddCommentInput {
    taskId: string;
    text: string;
}

export interface AddRelationshipInput {
    taskId: string;
    relatedTaskId: string;
    type: 'predecessor' | 'successor';
}

export interface RemoveRelationshipInput {
    taskId: string;
    relationshipId: string;
}
