// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import {
    CreateTaskInput,
    UpdateTaskInput,
    AddScheduleEntryInput,
    AddCommentInput,
    Task,
} from './types/Task';

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
    removeScheduleEntry: (taskId: string, entryId: string) => 
        ipcRenderer.invoke('task:removeScheduleEntry', taskId, entryId),
    addComment: (input: AddCommentInput) => ipcRenderer.invoke('task:addComment', input),
    getTasksByState: (state: string) => ipcRenderer.invoke('task:getByState', state),
});
