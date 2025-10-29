// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import {
    CreateTaskInput,
    UpdateTaskInput,
    AddScheduleEntryInput,
    UpdateScheduleEntryInput,
    AddCommentInput,
    AddRelationshipInput,
    RemoveRelationshipInput,
    Task,
} from './types/Task';
import {
    CreateStoryInput,
    UpdateStoryInput,
    AddTaskToStoryInput,
    RemoveTaskFromStoryInput,
    Story,
} from './types/Story';

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
});

contextBridge.exposeInMainWorld('taskAPI', {
    createTask: (input: CreateTaskInput) => ipcRenderer.invoke('task:create', input),
    getAllTasks: () => ipcRenderer.invoke('task:getAll'),
    getTaskById: (id: string) => ipcRenderer.invoke('task:getById', id),
    updateTask: (input: UpdateTaskInput) => ipcRenderer.invoke('task:update', input),
    deleteTask: (id: string) => ipcRenderer.invoke('task:delete', id),
    addScheduleEntry: (input: AddScheduleEntryInput) => ipcRenderer.invoke('task:addScheduleEntry', input),
    updateScheduleEntry: (input: UpdateScheduleEntryInput) => ipcRenderer.invoke('task:updateScheduleEntry', input),
    removeScheduleEntry: (taskId: string, entryId: string) => 
        ipcRenderer.invoke('task:removeScheduleEntry', taskId, entryId),
    addComment: (input: AddCommentInput) => ipcRenderer.invoke('task:addComment', input),
    getTasksByState: (state: string) => ipcRenderer.invoke('task:getByState', state),
    destroyAllData: () => ipcRenderer.invoke('task:destroyAllData'),
    exportData: () => ipcRenderer.invoke('task:exportData'),
    importData: () => ipcRenderer.invoke('task:importData'),
    addRelationship: (input: AddRelationshipInput) => ipcRenderer.invoke('task:addRelationship', input),
    removeRelationship: (input: RemoveRelationshipInput) => ipcRenderer.invoke('task:removeRelationship', input),
    getDependencyGraph: (taskId: string) => ipcRenderer.invoke('task:getDependencyGraph', taskId),
    setStory: (taskId: string, storyId: string | undefined) => ipcRenderer.invoke('task:setStory', taskId, storyId),
});

contextBridge.exposeInMainWorld('storyAPI', {
    createStory: (input: CreateStoryInput) => ipcRenderer.invoke('story:create', input),
    getAllStories: () => ipcRenderer.invoke('story:getAll'),
    getStoryById: (id: string) => ipcRenderer.invoke('story:getById', id),
    updateStory: (input: UpdateStoryInput) => ipcRenderer.invoke('story:update', input),
    deleteStory: (id: string) => ipcRenderer.invoke('story:delete', id),
    addTask: (input: AddTaskToStoryInput) => ipcRenderer.invoke('story:addTask', input),
    removeTask: (input: RemoveTaskFromStoryInput) => ipcRenderer.invoke('story:removeTask', input),
    getTasks: (storyId: string) => ipcRenderer.invoke('story:getTasks', storyId),
    exportData: () => ipcRenderer.invoke('story:exportData'),
    importData: () => ipcRenderer.invoke('story:importData'),
    destroyAllData: () => ipcRenderer.invoke('story:destroyAllData'),
});
