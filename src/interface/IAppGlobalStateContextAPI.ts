export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export default interface IAppGlobalStateContextAPI {
    showToast: (message: string, severity?: ToastSeverity, duration?: number) => void;
}