import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { TaskService } from './services/TaskService';
import {
  CreateTaskInput,
  UpdateTaskInput,
  AddScheduleEntryInput,
  UpdateScheduleEntryInput,
  AddCommentInput,
} from './types/Task';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Initialize TaskService
let taskService: TaskService;

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
  setupTaskIpcHandlers();
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
}
