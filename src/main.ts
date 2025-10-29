import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { TaskService } from './services/TaskService';
import { StoryService } from './services/StoryService';
import {
  CreateTaskInput,
  UpdateTaskInput,
  AddScheduleEntryInput,
  UpdateScheduleEntryInput,
  AddCommentInput,
  AddRelationshipInput,
  RemoveRelationshipInput,
} from './types/Task';
import {
  CreateStoryInput,
  UpdateStoryInput,
  AddTaskToStoryInput,
  RemoveTaskFromStoryInput,
} from './types/Story';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Initialize services
let taskService: TaskService;
let storyService: StoryService;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open DevTools only in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html'),
    );
  }

  // Window control handlers
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    mainWindow.close();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  taskService = new TaskService();
  storyService = new StoryService(() => taskService.getAllTasksInternal());
  
  // Set up bidirectional communication
  taskService.setStoryStateCallback(() => storyService.recalculateStoryStates());
  
  setupTaskIpcHandlers();
  setupStoryIpcHandlers();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Setup Task IPC handlers
function setupTaskIpcHandlers() {
  // Create task
  ipcMain.handle('task:create', async (_, input: CreateTaskInput) => {
    try {
      return { success: true, data: taskService.createTask(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get all tasks
  ipcMain.handle('task:getAll', async () => {
    try {
      return { success: true, data: taskService.getAllTasks() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get task by ID
  ipcMain.handle('task:getById', async (_, id: string) => {
    try {
      const task = taskService.getTaskById(id);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }
      return { success: true, data: task };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update task
  ipcMain.handle('task:update', async (_, input: UpdateTaskInput) => {
    try {
      return { success: true, data: taskService.updateTask(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete task
  ipcMain.handle('task:delete', async (_, id: string) => {
    try {
      const result = taskService.deleteTask(id);
      return { success: result, error: result ? undefined : 'Task not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Add schedule entry
  ipcMain.handle('task:addScheduleEntry', async (_, input: AddScheduleEntryInput) => {
    try {
      return { success: true, data: taskService.addScheduleEntry(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update schedule entry
  ipcMain.handle('task:updateScheduleEntry', async (_, input: UpdateScheduleEntryInput) => {
    try {
      return { success: true, data: taskService.updateScheduleEntry(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Remove schedule entry
  ipcMain.handle('task:removeScheduleEntry', async (_, taskId: string, entryId: string) => {
    try {
      return { success: true, data: taskService.removeScheduleEntry(taskId, entryId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Add comment
  ipcMain.handle('task:addComment', async (_, input: AddCommentInput) => {
    try {
      return { success: true, data: taskService.addComment(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get tasks by state
  ipcMain.handle('task:getByState', async (_, state: string) => {
    try {
      return { success: true, data: taskService.getTasksByState(state) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Export data
  ipcMain.handle('task:exportData', async () => {
    try {
      return taskService.exportData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Import data
  ipcMain.handle('task:importData', async () => {
    try {
      return taskService.importData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Destroy all data
  ipcMain.handle('task:destroyAllData', async () => {
    try {
      return taskService.destroyAllData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Add relationship
  ipcMain.handle('task:addRelationship', async (_, input: AddRelationshipInput) => {
    try {
      return { success: true, data: taskService.addRelationship(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Remove relationship
  ipcMain.handle('task:removeRelationship', async (_, input: RemoveRelationshipInput) => {
    try {
      return { success: true, data: taskService.removeRelationship(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get task dependency graph
  ipcMain.handle('task:getDependencyGraph', async (_, taskId: string) => {
    try {
      return { success: true, data: taskService.getTaskDependencyGraph(taskId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Set task story
  ipcMain.handle('task:setStory', async (_, taskId: string, storyId: string | undefined) => {
    try {
      return { success: true, data: taskService.setTaskStory(taskId, storyId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

// Setup Story IPC handlers
function setupStoryIpcHandlers() {
  // Create story
  ipcMain.handle('story:create', async (_, input: CreateStoryInput) => {
    try {
      return { success: true, data: storyService.createStory(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get all stories
  ipcMain.handle('story:getAll', async () => {
    try {
      return { success: true, data: storyService.getAllStories() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get story by ID
  ipcMain.handle('story:getById', async (_, id: string) => {
    try {
      const story = storyService.getStoryById(id);
      if (!story) {
        return { success: false, error: 'Story not found' };
      }
      return { success: true, data: story };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Update story
  ipcMain.handle('story:update', async (_, input: UpdateStoryInput) => {
    try {
      return { success: true, data: storyService.updateStory(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Delete story
  ipcMain.handle('story:delete', async (_, id: string) => {
    try {
      const result = storyService.deleteStory(id);
      return { success: result, error: result ? undefined : 'Story not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Add task to story
  ipcMain.handle('story:addTask', async (_, input: AddTaskToStoryInput) => {
    try {
      const story = await storyService.addTaskToStory(input);
      // Update the task's storyId
      await taskService.setTaskStory(input.taskId, input.storyId);
      return { success: true, data: story };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Remove task from story
  ipcMain.handle('story:removeTask', async (_, input: RemoveTaskFromStoryInput) => {
    try {
      const story = await storyService.removeTaskFromStory(input);
      // Remove the task's storyId
      await taskService.setTaskStory(input.taskId, undefined);
      return { success: true, data: story };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Get story tasks
  ipcMain.handle('story:getTasks', async (_, storyId: string) => {
    try {
      return { success: true, data: storyService.getStoryTasks(storyId) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Export stories
  ipcMain.handle('story:exportData', async () => {
    try {
      return storyService.exportData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Import stories
  ipcMain.handle('story:importData', async () => {
    try {
      return storyService.importData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Destroy all stories
  ipcMain.handle('story:destroyAllData', async () => {
    try {
      return storyService.destroyAllData();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
