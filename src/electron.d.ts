export interface IElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
}

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}
