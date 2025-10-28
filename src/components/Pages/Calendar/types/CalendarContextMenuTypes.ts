import { Dayjs } from 'dayjs';

export interface CalendarContextMenuPosition {
    mouseX: number;
    mouseY: number;
}

export interface CalendarContextMenuContext {
    date: Dayjs;
    hour?: number;
    view: 'month' | 'week' | 'day';
}

export interface CalendarContextMenuCommand {
    id: string;
    label: string;
    icon?: React.ReactNode;
    action: (context: CalendarContextMenuContext) => void;
    disabled?: (context: CalendarContextMenuContext) => boolean;
    divider?: boolean;
}
