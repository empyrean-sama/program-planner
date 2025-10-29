import { Dayjs } from 'dayjs';
import IAppGlobalStateContextAPI from '../../../../interface/IAppGlobalStateContextAPI';
import { Task } from '../../../../types/Task';

export interface CalendarContextMenuPosition {
    mouseX: number;
    mouseY: number;
}

export interface CalendarContextMenuContext {
    date: Dayjs;
    hour?: number;
    view: 'month' | 'week' | 'day';
    globalState: IAppGlobalStateContextAPI;
    task?: Task; // Optional task if right-clicked on a task card
    scheduleEntryId?: string; // Optional schedule entry ID
}

export interface CalendarContextMenuCommand {
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: (context: CalendarContextMenuContext) => void;
    disabled?: (context: CalendarContextMenuContext) => boolean;
    hidden?: (context: CalendarContextMenuContext) => boolean;
    divider?: boolean;
}
