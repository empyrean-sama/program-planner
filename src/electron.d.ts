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
}

declare global {
    interface Window {
        electron: IElectronAPI;
        taskAPI: ITaskAPI;
    }
}
