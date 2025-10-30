import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { TaskService } from './TaskService';
import { StoryService } from './StoryService';

/**
 * DataManagementService provides unified operations across multiple data entities
 * (tasks and stories) ensuring data consistency and atomic operations.
 */
export class DataManagementService {
    constructor(
        private taskService: TaskService,
        private storyService: StoryService
    ) {}

    /**
     * Destroy all application data (tasks and stories)
     * This is an atomic operation - both succeed or both fail
     */
    destroyAllData(): { success: boolean; error?: string } {
        try {
            const taskResult = this.taskService.destroyAllData();
            const storyResult = this.storyService.destroyAllData();

            if (!taskResult.success || !storyResult.success) {
                const errors = [];
                if (!taskResult.success) errors.push(`Tasks: ${taskResult.error}`);
                if (!storyResult.success) errors.push(`Stories: ${storyResult.error}`);
                return { success: false, error: errors.join('; ') };
            }

            return { success: true };
        } catch (error) {
            console.error('Error destroying all data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Export all application data (tasks and stories) to a single JSON file
     */
    exportAllData(): { success: boolean; filePath?: string; error?: string } {
        try {
            const result = dialog.showSaveDialogSync({
                title: 'Export All Data',
                defaultPath: path.join(app.getPath('documents'), `program-planner-export-${new Date().toISOString().split('T')[0]}.json`),
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
                appVersion: app.getVersion(),
                tasks: this.taskService.getAllTasks(),
                stories: this.storyService.getAllStories()
            };

            fs.writeFileSync(result, JSON.stringify(exportData, null, 2), 'utf-8');
            return { success: true, filePath: result };
        } catch (error) {
            console.error('Error exporting all data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Import all application data (tasks and stories) from a JSON file
     * Supports both new format (v2.0) and legacy formats (tasks-only or stories-only)
     */
    importAllData(): { success: boolean; error?: string; warnings?: string[] } {
        try {
            const result = dialog.showOpenDialogSync({
                title: 'Import All Data',
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

            const warnings: string[] = [];

            // Detect file format and import accordingly
            if (importData.version === '1.0' || importData.version === '2.0') {
                // Unified format (v1.0 or v2.0 compatible)
                if (importData.tasks && Array.isArray(importData.tasks)) {
                    const taskResult = this.taskService.importFromData(importData.tasks);
                    if (!taskResult.success) {
                        return { success: false, error: `Failed to import tasks: ${taskResult.error}` };
                    }
                } else {
                    warnings.push('No tasks found in import file');
                }

                if (importData.stories && Array.isArray(importData.stories)) {
                    const storyResult = this.storyService.importFromData(importData.stories);
                    if (!storyResult.success) {
                        return { success: false, error: `Failed to import stories: ${storyResult.error}` };
                    }
                } else {
                    warnings.push('No stories found in import file');
                }
            } else if (importData.tasks && Array.isArray(importData.tasks)) {
                // Legacy tasks-only format
                const taskResult = this.taskService.importFromData(importData.tasks);
                if (!taskResult.success) {
                    return { success: false, error: `Failed to import tasks: ${taskResult.error}` };
                }
                warnings.push('Imported tasks only (legacy format)');
            } else if (importData.stories && Array.isArray(importData.stories)) {
                // Legacy stories-only format
                const storyResult = this.storyService.importFromData(importData.stories);
                if (!storyResult.success) {
                    return { success: false, error: `Failed to import stories: ${storyResult.error}` };
                }
                warnings.push('Imported stories only (legacy format)');
            } else {
                return { success: false, error: 'Invalid file format: no recognized data structure found' };
            }

            return { 
                success: true, 
                warnings: warnings.length > 0 ? warnings : undefined 
            };
        } catch (error) {
            console.error('Error importing all data:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * Get statistics about all application data
     */
    getDataStatistics(): {
        tasks: {
            total: number;
            byState: Record<string, number>;
        };
        stories: {
            total: number;
            byState: Record<string, number>;
        };
    } {
        const tasks = this.taskService.getAllTasks();
        const stories = this.storyService.getAllStories();

        // Count tasks by state
        const tasksByState: Record<string, number> = {};
        tasks.forEach(task => {
            tasksByState[task.state] = (tasksByState[task.state] || 0) + 1;
        });

        // Count stories by state
        const storiesByState: Record<string, number> = {};
        stories.forEach(story => {
            storiesByState[story.state] = (storiesByState[story.state] || 0) + 1;
        });

        return {
            tasks: {
                total: tasks.length,
                byState: tasksByState
            },
            stories: {
                total: stories.length,
                byState: storiesByState
            }
        };
    }
}
