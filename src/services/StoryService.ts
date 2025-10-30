import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    Story,
    StoryState,
    CreateStoryInput,
    UpdateStoryInput,
    AddTaskToStoryInput,
    RemoveTaskFromStoryInput,
} from '../types/Story';
import { Task } from '../types/Task';

export class StoryService {
    private storiesFilePath: string;
    private stories: Story[] = [];
    private getTasksFn: () => Task[];

    constructor(getTasksFn: () => Task[]) {
        this.getTasksFn = getTasksFn;
        
        // Use userData directory for storing application data
        const userDataPath = app.getPath('userData');
        const dataDir = path.join(userDataPath, 'data');
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.storiesFilePath = path.join(dataDir, 'stories.json');
        this.loadStories();
    }

    private loadStories(): void {
        try {
            if (fs.existsSync(this.storiesFilePath)) {
                const data = fs.readFileSync(this.storiesFilePath, 'utf-8');
                this.stories = JSON.parse(data);
                
                // Validate and migrate each story
                this.stories.forEach(story => {
                    // Ensure taskIds array exists
                    if (!story.taskIds || !Array.isArray(story.taskIds)) {
                        story.taskIds = [];
                    }
                    
                    // Ensure numeric fields exist with valid values
                    if (typeof story.totalPoints !== 'number') {
                        story.totalPoints = 0;
                    }
                    if (typeof story.completedPoints !== 'number') {
                        story.completedPoints = 0;
                    }
                    if (typeof story.progress !== 'number' || story.progress < 0 || story.progress > 100) {
                        story.progress = 0;
                    }
                    
                    // Apply story rules to recalculate based on actual tasks
                    this.applyStoryRules(story);
                });
                
                this.saveStories();
            } else {
                this.stories = [];
                this.saveStories();
            }
        } catch (error) {
            console.error('Error loading stories:', error);
            this.stories = [];
        }
    }

    private saveStories(): void {
        try {
            fs.writeFileSync(this.storiesFilePath, JSON.stringify(this.stories, null, 2), 'utf-8');
        } catch (error) {
            console.error('Error saving stories:', error);
            throw error;
        }
    }

    /**
     * Apply rule-based state calculation to a story
     */
    private applyStoryRules(story: Story): void {
        const allTasks = this.getTasksFn();
        const tasks = allTasks.filter(task => task.storyIds && task.storyIds.includes(story.id));
        
        // Update story's taskIds to match actual task associations (sync the many-to-many relationship)
        story.taskIds = tasks.map(t => t.id);
        
        // Calculate total points
        story.totalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);
        
        // Calculate completed points (only Finished tasks count)
        story.completedPoints = tasks
            .filter(task => task.state === 'Finished')
            .reduce((sum, task) => sum + (task.points || 0), 0);
        
        // Calculate progress percentage
        story.progress = story.totalPoints > 0 
            ? Math.round((story.completedPoints / story.totalPoints) * 100)
            : 0;
        
        // Determine story state based on tasks
        if (tasks.length === 0) {
            // No tasks = Filed
            story.state = 'Filed';
            story.startedAt = undefined;
            story.finishedAt = undefined;
        } else {
            const hasStartedTask = tasks.some(task => 
                ['Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred'].includes(task.state)
            );
            
            const allTasksFinished = tasks.every(task => task.state === 'Finished');
            const hasFinishedTask = tasks.some(task => task.state === 'Finished');
            
            if (allTasksFinished && tasks.length > 0) {
                // All tasks finished = Story Finished
                story.state = 'Finished';
                
                // Set finishedAt to the latest task completion
                if (!story.finishedAt) {
                    const finishedTasks = tasks.filter(t => t.state === 'Finished');
                    if (finishedTasks.length > 0) {
                        story.finishedAt = new Date().toISOString();
                    }
                }
            } else if (hasStartedTask) {
                // At least one task started but not all finished = Running
                story.state = 'Running';
                
                // Set startedAt if not already set
                if (!story.startedAt) {
                    story.startedAt = new Date().toISOString();
                }
            } else {
                // All tasks are Filed = Story Filed
                story.state = 'Filed';
                story.startedAt = undefined;
                story.finishedAt = undefined;
            }
        }
    }

    /**
     * Create a new story
     */
    createStory(input: CreateStoryInput): Story {
        const now = new Date().toISOString();
        
        const story: Story = {
            id: uuidv4(),
            filingDateTime: now,
            title: input.title,
            description: input.description,
            state: 'Filed',
            taskIds: [],
            totalPoints: 0,
            completedPoints: 0,
            progress: 0,
        };

        this.stories.push(story);
        this.saveStories();
        return story;
    }

    /**
     * Get all stories
     */
    getAllStories(): Story[] {
        // Apply rules before returning
        this.stories.forEach(story => this.applyStoryRules(story));
        this.saveStories();
        return [...this.stories];
    }

    /**
     * Get story by ID
     */
    getStoryById(id: string): Story | undefined {
        const story = this.stories.find(s => s.id === id);
        if (story) {
            this.applyStoryRules(story);
            this.saveStories();
        }
        return story;
    }

    /**
     * Update a story
     */
    updateStory(input: UpdateStoryInput): Story {
        const story = this.stories.find(s => s.id === input.id);
        
        if (!story) {
            throw new Error(`Story with ID ${input.id} not found`);
        }

        if (input.title !== undefined) {
            story.title = input.title;
        }
        if (input.description !== undefined) {
            story.description = input.description;
        }

        this.applyStoryRules(story);
        this.saveStories();
        return story;
    }

    /**
     * Delete a story (removes story but keeps tasks)
     */
    deleteStory(id: string): boolean {
        const initialLength = this.stories.length;
        this.stories = this.stories.filter(story => story.id !== id);
        
        if (this.stories.length < initialLength) {
            this.saveStories();
            return true;
        }
        
        return false;
    }

    /**
     * Add a task to a story
     */
    addTaskToStory(input: AddTaskToStoryInput): Story {
        const story = this.stories.find(s => s.id === input.storyId);
        
        if (!story) {
            throw new Error(`Story with ID ${input.storyId} not found`);
        }

        // Verify the task exists
        const allTasks = this.getTasksFn();
        const taskExists = allTasks.some(t => t.id === input.taskId);
        
        if (!taskExists) {
            throw new Error(`Task with ID ${input.taskId} not found`);
        }

        // Check if task is already in story (redundancy check)
        if (story.taskIds.includes(input.taskId)) {
            // Task already associated, just recalculate and return
            this.applyStoryRules(story);
            this.saveStories();
            return story;
        }

        // Add to story's taskIds (though applyStoryRules will sync this anyway)
        story.taskIds.push(input.taskId);
        this.applyStoryRules(story);
        this.saveStories();
        return story;
    }

    /**
     * Remove a task from a story
     */
    removeTaskFromStory(input: RemoveTaskFromStoryInput): Story {
        const story = this.stories.find(s => s.id === input.storyId);
        
        if (!story) {
            throw new Error(`Story with ID ${input.storyId} not found`);
        }

        story.taskIds = story.taskIds.filter(taskId => taskId !== input.taskId);
        this.applyStoryRules(story);
        this.saveStories();
        return story;
    }

    /**
     * Get all tasks for a story
     */
    getStoryTasks(storyId: string): Task[] {
        const story = this.stories.find(s => s.id === storyId);
        if (!story) {
            throw new Error(`Story with ID ${storyId} not found`);
        }

        const allTasks = this.getTasksFn();
        return allTasks.filter(task => task.storyIds.includes(storyId));
    }

    /**
     * Recalculate story states (called when tasks are updated)
     */
    recalculateStoryStates(): void {
        this.stories.forEach(story => this.applyStoryRules(story));
        this.saveStories();
    }

    /**
     * Export all stories
     */
    exportData(): { success: boolean; filePath?: string; error?: string } {
        try {
            const { dialog } = require('electron');
            const path = require('path');
            
            const result = dialog.showSaveDialogSync({
                title: 'Export Stories Data',
                defaultPath: path.join(require('os').homedir(), 'stories-export.json'),
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
                stories: this.stories
            };

            fs.writeFileSync(result, JSON.stringify(exportData, null, 2), 'utf-8');
            return { success: true, filePath: result };
        } catch (error) {
            console.error('Error exporting stories:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Import stories
     */
    importData(): { success: boolean; error?: string } {
        try {
            const { dialog } = require('electron');
            
            const result = dialog.showOpenDialogSync({
                title: 'Import Stories Data',
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

            if (!importData.stories || !Array.isArray(importData.stories)) {
                return { success: false, error: 'Invalid file format: missing stories array' };
            }

            return this.importFromData(importData.stories);
        } catch (error) {
            console.error('Error importing stories:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Import stories from a data array (used by DataManagementService)
     */
    importFromData(stories: Story[]): { success: boolean; error?: string } {
        try {
            this.stories = stories;
            this.stories.forEach(story => this.applyStoryRules(story));
            this.saveStories();
            return { success: true };
        } catch (error) {
            console.error('Error importing stories from data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Destroy all stories
     */
    destroyAllData(): { success: boolean; error?: string } {
        try {
            this.stories = [];
            this.saveStories();
            return { success: true };
        } catch (error) {
            console.error('Error destroying stories:', error);
            return { success: false, error: (error as Error).message };
        }
    }
}
