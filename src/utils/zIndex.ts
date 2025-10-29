/**
 * Z-Index Management System
 * 
 * Centralized z-index values to prevent layering conflicts.
 * Values are organized by layer hierarchy from lowest to highest.
 */

export const Z_INDEX = {
    // Base layers (0-99)
    BASE: 0,
    CALENDAR_GRID: 2,
    CALENDAR_EVENT: 5,
    
    // UI Elements (100-999)
    DROPDOWN: 100,
    STICKY_HEADER: 200,
    SIDEBAR: 300,
    
    // Overlays (1000-9999)
    CALENDAR_TIME_MARKER: 1000,
    CALENDAR_HOVER_CARD: 1500,
    CONTEXT_MENU: 2000,
    TOOLTIP: 3000,
    
    // Modals and Dialogs (10000+)
    MODAL_BACKDROP: 10000,
    MODAL: 10001,
    TOAST: 10100,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
