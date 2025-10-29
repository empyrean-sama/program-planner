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
    AddRelationshipInput,
    RemoveRelationshipInput,
    ScheduleHistoryEntry,
    TaskComment,
    TaskRelationship,
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
                
                // Migrate tasks that don't have relationships field
                this.tasks.forEach(task => {
                    if (!task.relationships) {
                        task.relationships = [];
                    }
                    TaskStateRulesEngine.applyRules(task);
                });
                
                // Save if any states were updated or migrations were applied
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
            relationships: [],
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

        // Update in-progress entries and remove future entries when task enters a final state
        if (isBecomingFinal) {
            const now = new Date();
            const finalStateTime = now.toISOString();
            
            // Process each schedule entry
            task.scheduleHistory = task.scheduleHistory
                .map(entry => {
                    const entryStart = new Date(entry.startTime);
                    const entryEnd = new Date(entry.endTime);
                    
                    // If entry is in progress (started but not ended), update its end time
                    if (entryStart <= now && entryEnd > now) {
                        const updatedDuration = Math.floor((now.getTime() - entryStart.getTime()) / (1000 * 60));
                        return {
                            ...entry,
                            endTime: finalStateTime,
                            duration: updatedDuration,
                        };
                    }
                    
                    // Keep the entry as-is if it's already completed
                    return entry;
                })
                .filter(entry => {
                    // Remove purely future entries (those that haven't started yet)
                    const entryStart = new Date(entry.startTime);
                    return entryStart <= now;
                });
            
            // Recalculate elapsed time after modifications
            task.elapsedTime = this.calculateElapsedTime(task.scheduleHistory);
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

    /**
     * Add a relationship between tasks
     */
    addRelationship(input: AddRelationshipInput): Task {
        const task = this.getTaskById(input.taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        const relatedTask = this.getTaskById(input.relatedTaskId);
        
        if (!relatedTask) {
            throw new Error(`Related task with ID ${input.relatedTaskId} not found`);
        }

        // Check if relationship already exists
        const existingRelationship = task.relationships.find(
            rel => rel.relatedTaskId === input.relatedTaskId && rel.type === input.type
        );

        if (existingRelationship) {
            throw new Error(`Relationship already exists`);
        }

        // Check for cycles (DAG validation)
        if (this.wouldCreateCycle(input.taskId, input.relatedTaskId, input.type)) {
            throw new Error(`Cannot add relationship: would create a cycle in the task graph`);
        }

        const relationship: TaskRelationship = {
            id: uuidv4(),
            type: input.type,
            relatedTaskId: input.relatedTaskId,
            createdAt: new Date().toISOString(),
        };

        task.relationships.push(relationship);

        // Add reciprocal relationship
        const reciprocalType = input.type === 'predecessor' ? 'successor' : 'predecessor';
        const reciprocalRelationship: TaskRelationship = {
            id: uuidv4(),
            type: reciprocalType,
            relatedTaskId: input.taskId,
            createdAt: new Date().toISOString(),
        };

        relatedTask.relationships.push(reciprocalRelationship);

        this.saveTasks();
        return task;
    }

    /**
     * Remove a relationship
     */
    removeRelationship(input: RemoveRelationshipInput): Task {
        const task = this.getTaskById(input.taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        const relationshipIndex = task.relationships.findIndex(rel => rel.id === input.relationshipId);
        
        if (relationshipIndex === -1) {
            throw new Error(`Relationship with ID ${input.relationshipId} not found`);
        }

        const relationship = task.relationships[relationshipIndex];
        
        // Remove the relationship
        task.relationships.splice(relationshipIndex, 1);

        // Remove reciprocal relationship
        const relatedTask = this.getTaskById(relationship.relatedTaskId);
        if (relatedTask) {
            const reciprocalType = relationship.type === 'predecessor' ? 'successor' : 'predecessor';
            relatedTask.relationships = relatedTask.relationships.filter(
                rel => !(rel.relatedTaskId === input.taskId && rel.type === reciprocalType)
            );
        }

        this.saveTasks();
        return task;
    }

    /**
     * Check if adding a relationship would create a cycle (for DAG validation)
     */
    private wouldCreateCycle(taskId: string, relatedTaskId: string, type: 'predecessor' | 'successor'): boolean {
        // If we're adding a predecessor, check if relatedTask already depends on taskId
        // If we're adding a successor, check if taskId already depends on relatedTask
        
        const targetId = type === 'predecessor' ? taskId : relatedTaskId;
        const sourceId = type === 'predecessor' ? relatedTaskId : taskId;

        return this.hasPath(sourceId, targetId);
    }

    /**
     * Check if there's a path from source to target through predecessors
     */
    private hasPath(sourceId: string, targetId: string, visited: Set<string> = new Set()): boolean {
        if (sourceId === targetId) {
            return true;
        }

        if (visited.has(sourceId)) {
            return false;
        }

        visited.add(sourceId);

        const sourceTask = this.getTaskById(sourceId);
        if (!sourceTask) {
            return false;
        }

        // Follow predecessor relationships (dependencies)
        const predecessors = sourceTask.relationships.filter(rel => rel.type === 'predecessor');
        
        for (const predecessor of predecessors) {
            if (this.hasPath(predecessor.relatedTaskId, targetId, visited)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get task dependency graph for a specific task (all predecessors recursively)
     */
    getTaskDependencyGraph(taskId: string): { nodes: Task[]; edges: { from: string; to: string }[] } {
        const task = this.getTaskById(taskId);
        
        if (!task) {
            throw new Error(`Task with ID ${taskId} not found`);
        }

        const nodes: Task[] = [];
        const edges: { from: string; to: string }[] = [];
        const visited = new Set<string>();

        const traverse = (currentTaskId: string) => {
            if (visited.has(currentTaskId)) {
                return;
            }

            visited.add(currentTaskId);
            const currentTask = this.getTaskById(currentTaskId);
            
            if (!currentTask) {
                return;
            }

            nodes.push(currentTask);

            // Get all predecessors
            const predecessors = currentTask.relationships.filter(rel => rel.type === 'predecessor');
            
            for (const predecessor of predecessors) {
                edges.push({ from: predecessor.relatedTaskId, to: currentTaskId });
                traverse(predecessor.relatedTaskId);
            }
        };

        traverse(taskId);

        return { nodes, edges };
    }
}
