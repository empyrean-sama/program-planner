import {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    AddScheduleEntryInput,
    UpdateScheduleEntryInput,
    AddCommentInput,
    AddRelationshipInput,
    RemoveRelationshipInput,
} from './types/Task';
import {
    Story,
    CreateStoryInput,
    UpdateStoryInput,
    AddTaskToStoryInput,
    RemoveTaskFromStoryInput,
} from './types/Story';

export interface IElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
}

export interface ITaskAPI {
    createTask: (input: CreateTaskInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    getAllTasks: () => Promise<{ success: boolean; data?: Task[]; error?: string }>;
    getTaskById: (id: string) => Promise<{ success: boolean; data?: Task; error?: string }>;
    updateTask: (input: UpdateTaskInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>;
    addScheduleEntry: (input: AddScheduleEntryInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    updateScheduleEntry: (input: UpdateScheduleEntryInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    removeScheduleEntry: (taskId: string, entryId: string) => Promise<{ success: boolean; data?: Task; error?: string }>;
    addComment: (input: AddCommentInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    getTasksByState: (state: string) => Promise<{ success: boolean; data?: Task[]; error?: string }>;
    destroyAllData: () => Promise<{ success: boolean; error?: string }>;
    exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
    importData: () => Promise<{ success: boolean; error?: string }>;
    addRelationship: (input: AddRelationshipInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    removeRelationship: (input: RemoveRelationshipInput) => Promise<{ success: boolean; data?: Task; error?: string }>;
    getDependencyGraph: (taskId: string) => Promise<{ success: boolean; data?: { nodes: Task[]; edges: { from: string; to: string }[] }; error?: string }>;
    setStories: (taskId: string, storyIds: string[]) => Promise<{ success: boolean; data?: Task; error?: string }>;
    addToStory: (taskId: string, storyId: string) => Promise<{ success: boolean; data?: Task; error?: string }>;
    removeFromStory: (taskId: string, storyId: string) => Promise<{ success: boolean; data?: Task; error?: string }>;
}

export interface IStoryAPI {
    createStory: (input: CreateStoryInput) => Promise<{ success: boolean; data?: Story; error?: string }>;
    getAllStories: () => Promise<{ success: boolean; data?: Story[]; error?: string }>;
    getStoryById: (id: string) => Promise<{ success: boolean; data?: Story; error?: string }>;
    updateStory: (input: UpdateStoryInput) => Promise<{ success: boolean; data?: Story; error?: string }>;
    deleteStory: (id: string) => Promise<{ success: boolean; error?: string }>;
    addTask: (input: AddTaskToStoryInput) => Promise<{ success: boolean; data?: Story; error?: string }>;
    removeTask: (input: RemoveTaskFromStoryInput) => Promise<{ success: boolean; data?: Story; error?: string }>;
    getTasks: (storyId: string) => Promise<{ success: boolean; data?: Task[]; error?: string }>;
    exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
    importData: () => Promise<{ success: boolean; error?: string }>;
    destroyAllData: () => Promise<{ success: boolean; error?: string }>;
}

export interface IAppAPI {
    exportAllData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
    importAllData: () => Promise<{ success: boolean; error?: string; warnings?: string[] }>;
    getDataStatistics: () => Promise<{ 
        success: boolean; 
        data?: {
            tasks: { total: number; byState: Record<string, number> };
            stories: { total: number; byState: Record<string, number> };
        }; 
        error?: string 
    }>;
}

declare global {
    interface Window {
        electron: IElectronAPI;
        taskAPI: ITaskAPI;
        storyAPI: IStoryAPI;
        appAPI: IAppAPI;
    }
}
