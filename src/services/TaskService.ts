import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    AddScheduleEntryInput,
    UpdateScheduleEntryInput,
    AddCommentInput,
    ScheduleHistoryEntry,
    TaskComment,
} from '../types/Task';
import { TaskStateRulesEngine } from './TaskStateRulesEngine';

export class TaskService {
    private tasksFilePath: string;
    private tasks: Task[] = [];

    constructor() {
        // Use userData directory for storing application data
        const userDataPath = app.getPath('userData');
        const dataDir = path.join(userDataPath, 'data');
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.tasksFilePath = path.join(dataDir, 'tasks.json');
        this.loadTasks();
    }

    private loadTasks(): void {
        try {
            if (fs.existsSync(this.tasksFilePath)) {
                const data = fs.readFileSync(this.tasksFilePath, 'utf-8');
                this.tasks = JSON.parse(data);
                // Apply rules engine to all loaded tasks
                this.tasks.forEach(task => TaskStateRulesEngine.applyRules(task));
                // Save if any states were updated
                this.saveTasks();
            } else {
                this.tasks = [];
                this.saveTasks();
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    private saveTasks(): void {
        try {
            fs.writeFileSync(this.tasksFilePath, JSON.stringify(this.tasks, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error saving tasks:', error);
            throw error;
        }
    }

    /**
     * Calculate points based on estimated time using Fibonacci-like sequence
     * 20 mins = 1 point
     * 40 mins = 2 points
     * 60 mins = 3 points
     * 100 mins = 5 points
     * 160 mins = 8 points
     * and so on...
     */
    private calculatePoints(estimatedTime?: number): number {
        if (!estimatedTime || estimatedTime <= 0) {
            return 0;
        }

        // Convert to base units (20 mins = 1 unit)
        const units = estimatedTime / 20;

        // Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
        const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
        
        // Find the closest Fibonacci number
        for (let i = 0; i < fibonacci.length; i++) {
            if (units <= fibonacci[i]) {
                return fibonacci[i];
            }
        }

        // If exceeds our sequence, return the last value
        return fibonacci[fibonacci.length - 1];
    }

    /**
     * Calculate elapsed time from schedule history
     * Only includes entries where the end time is in the past
     */
    private calculateElapsedTime(scheduleHistory: ScheduleHistoryEntry[]): number {
        const now = new Date();
        return scheduleHistory.reduce((total, entry) => {
            const endTime = new Date(entry.endTime);
            // Only count entries that have already ended
            if (endTime <= now) {
                return total + entry.duration;
            }
            return total;
        }, 0);
    }

    /**
     * Create a new task
     */
    createTask(input: CreateTaskInput): Task {
        const now = new Date().toISOString();
        
        const task: Task = {
            id: uuidv4(),
            filingDateTime: now,
            title: input.title,
            description: input.description,
            state: 'Filed',
            dueDateTime: input.dueDateTime,
            estimatedTime: input.estimatedTime,
            scheduleHistory: [],
            elapsedTime: 0,
            points: this.calculatePoints(input.estimatedTime),
            comments: [],
        };

        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    /**
     * Get all tasks (with rules engine applied)
     */
    getAllTasks(): Task[] {
        // Apply rules engine to all tasks before returning
        this.tasks.forEach(task => TaskStateRulesEngine.applyRules(task));
        this.saveTasks();
        return [...this.tasks];
    }

    /**
     * Get a task by ID (with rules engine applied)
     */
    getTaskById(id: string): Task | undefined {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            TaskStateRulesEngine.applyRules(task);
            this.saveTasks();
        }
        return task;
    }

    /**
     * Update a task
     */
    updateTask(input: UpdateTaskInput): Task {
        const taskIndex = this.tasks.findIndex(task => task.id === input.id);
        
        if (taskIndex === -1) {
            throw new Error(`Task with ID ${input.id} not found`);
        }

        const task = this.tasks[taskIndex];
        const finalStates = ['Removed', 'Finished', 'Deferred', 'Failed'];
        const isBecomingFinal = input.state !== undefined && 
                                finalStates.includes(input.state) && 
                                !finalStates.includes(task.state);

        // Validate state changes
        if (input.state !== undefined && input.state !== task.state) {
            if (!TaskStateRulesEngine.canUserSetState(task.state, input.state)) {
                throw new Error(
                    `Cannot change state from ${task.state} to ${input.state}. ` +
                    `User can only set: ${TaskStateRulesEngine.getAvailableUserStates(task).join(', ')}`
                );
            }
        }

        if (input.title !== undefined) {
            task.title = input.title;
        }
        if (input.description !== undefined) {
            task.description = input.description;
        }
        if (input.state !== undefined) {
            task.state = input.state;
        }
        if (input.dueDateTime !== undefined) {
            task.dueDateTime = input.dueDateTime;
        }

        // Remove all future schedule entries when task enters a final state
        if (isBecomingFinal) {
            const now = new Date();
            task.scheduleHistory = task.scheduleHistory.filter(entry => {
                const entryEnd = new Date(entry.endTime);
                return entryEnd <= now;
            });
        }

        // Apply rules engine (but don't override user-set final states)
        TaskStateRulesEngine.applyRules(task);

        this.saveTasks();
        return task;
    }

    /**
     * Delete a task
     * NOTE: Tasks cannot be deleted once created as per requirements.
     * This method is kept for potential future use but should not be called.
     */
    deleteTask(id: string): boolean {
        // Commenting out delete functionality - tasks cannot be deleted
        // const initialLength = this.tasks.length;
        // this.tasks = this.tasks.filter(task => task.id !== id);
        // 
        // if (this.tasks.length < initialLength) {
        //     this.saveTasks();
        //     return true;
        // }
        
        throw new Error('Tasks cannot be deleted once created');
    }

    /**
     * Add a schedule history entry
     */
    addScheduleEntry(input: AddScheduleEntryInput): Task {
        const task = this.getTaskById(input.taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        const startTime = new Date(input.startTime);
        const endTime = new Date(input.endTime);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes

        const entry: ScheduleHistoryEntry = {
            id: uuidv4(),
            startTime: input.startTime,
            endTime: input.endTime,
            duration,
            createdAt: new Date().toISOString(),
        };

        task.scheduleHistory.push(entry);
        task.elapsedTime = this.calculateElapsedTime(task.scheduleHistory);

        // Apply rules engine after adding schedule entry
        TaskStateRulesEngine.applyRules(task);

        this.saveTasks();
        return task;
    }

    /**
     * Update a schedule history entry
     */
    updateScheduleEntry(input: UpdateScheduleEntryInput): Task {
        const task = this.getTaskById(input.taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        const entryIndex = task.scheduleHistory.findIndex(entry => entry.id === input.entryId);
        
        if (entryIndex === -1) {
            throw new Error(`Schedule entry with ID ${input.entryId} not found`);
        }

        const startTime = new Date(input.startTime);
        const endTime = new Date(input.endTime);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes

        task.scheduleHistory[entryIndex] = {
            ...task.scheduleHistory[entryIndex],
            startTime: input.startTime,
            endTime: input.endTime,
            duration,
        };

        task.elapsedTime = this.calculateElapsedTime(task.scheduleHistory);

        // Apply rules engine after updating schedule entry
        TaskStateRulesEngine.applyRules(task);

        this.saveTasks();
        return task;
    }

    /**
     * Remove a schedule history entry
     */
    removeScheduleEntry(taskId: string, entryId: string): Task {
        const task = this.getTaskById(taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${taskId} not found`);
        }

        task.scheduleHistory = task.scheduleHistory.filter(entry => entry.id !== entryId);
        task.elapsedTime = this.calculateElapsedTime(task.scheduleHistory);

        // Apply rules engine after removing schedule entry
        TaskStateRulesEngine.applyRules(task);

        this.saveTasks();
        return task;
    }

    /**
     * Add a comment to a task
     */
    addComment(input: AddCommentInput): Task {
        const task = this.getTaskById(input.taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        const comment: TaskComment = {
            id: uuidv4(),
            text: input.text,
            createdAt: new Date().toISOString(),
        };

        task.comments.push(comment);
        this.saveTasks();
        return task;
    }

    /**
     * Get tasks by state (with rules engine applied)
     */
    getTasksByState(state: string): Task[] {
        // Apply rules to all tasks first
        this.tasks.forEach(task => TaskStateRulesEngine.applyRules(task));
        this.saveTasks();
        return this.tasks.filter(task => task.state === state);
    }

    /**
     * Export all data to a JSON file
     */
    exportData(): { success: boolean; filePath?: string; error?: string } {
        try {
            const { dialog } = require('electron');
            const path = require('path');
            
            // Show save dialog
            const result = dialog.showSaveDialogSync({
                title: 'Export Tasks Data',
                defaultPath: path.join(require('os').homedir(), 'tasks-export.json'),
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (!result) {
                return { success: false, error: 'Export cancelled by user' };
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                tasks: this.tasks
            };

            fs.writeFileSync(result, JSON.stringify(exportData, null, 2), 'utf-8');
            return { success: true, filePath: result };
        } catch (error) {
            console.error('Error exporting data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Import data from a JSON file
     */
    importData(): { success: boolean; error?: string } {
        try {
            const { dialog } = require('electron');
            
            // Show open dialog
            const result = dialog.showOpenDialogSync({
                title: 'Import Tasks Data',
                filters: [
                    { name: 'JSON Files', extensions: ['json'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (!result || result.length === 0) {
                return { success: false, error: 'Import cancelled by user' };
            }

            const filePath = result[0];
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const importData = JSON.parse(fileContent);

            // Validate import data structure
            if (!importData.tasks || !Array.isArray(importData.tasks)) {
                return { success: false, error: 'Invalid file format: missing tasks array' };
            }

            // Replace current tasks with imported tasks
            this.tasks = importData.tasks;
            
            // Apply rules engine to all imported tasks
            this.tasks.forEach(task => TaskStateRulesEngine.applyRules(task));
            
            this.saveTasks();
            return { success: true };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Destroy all data (permanently delete all tasks)
     */
    destroyAllData(): { success: boolean; error?: string } {
        try {
            this.tasks = [];
            this.saveTasks();
            return { success: true };
        } catch (error) {
            console.error('Error destroying data:', error);
            return { success: false, error: (error as Error).message };
        }
    }
}
