/**
 * UI Constants for consistent design patterns across the application
 */

/**
 * Standard dialog sizes for consistent modal dimensions
 */
export const DIALOG_SIZES = {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl',
} as const;

/**
 * Button variants for consistent button styling
 */
export const BUTTON_VARIANTS = {
    PRIMARY: 'contained',
    SECONDARY: 'outlined',
    TERTIARY: 'text',
} as const;

/**
 * Standard spacing values (in theme spacing units, typically 8px)
 */
export const SPACING = {
    /** Compact spacing for dense layouts */
    COMPACT: 1,
    /** Small spacing for closely related elements */
    SMALL: 2,
    /** Medium spacing - default for most use cases */
    MEDIUM: 3,
    /** Large spacing for section separation */
    LARGE: 4,
    /** Extra large spacing for major sections */
    EXTRA_LARGE: 6,
    
    // Specific use cases
    DIALOG_PADDING: 3,
    CARD_PADDING: 2,
    SECTION_SPACING: 3,
    PAGE_PADDING: 3,
    BUTTON_GAP: 1,
    FORM_FIELD_SPACING: 2,
} as const;

/**
 * Z-index values for proper layering
 * Based on Material-UI defaults with custom additions
 */
export const Z_INDEX = {
    // Material-UI defaults (for reference)
    MOBILE_STEPPER: 1000,
    FAB: 1050,
    SPEED_DIAL: 1050,
    APP_BAR: 1100,
    DRAWER: 1200,
    MODAL: 1300,
    SNACKBAR: 1400,
    TOOLTIP: 1500,
    
    // Custom application layers
    CONTEXT_MENU: 1500,
    DRAG_PREVIEW: 100,
    RESIZE_PREVIEW: 101,
    TIME_INDICATOR: 102,
    CALENDAR_EVENT: 10,
    CALENDAR_EVENT_HOVER: 20,
    STICKY_HEADER: 999,
    LOADING_OVERLAY: 1250,
} as const;

/**
 * Border radius values for consistent corner rounding
 */
export const BORDER_RADIUS = {
    NONE: 0,
    SMALL: 1,
    MEDIUM: 2,
    LARGE: 3,
    ROUND: '50%',
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
    INSTANT: 0,
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
} as const;

/**
 * Transition easings for smooth animations
 */
export const TRANSITION_EASING = {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/**
 * Icon sizes for consistent icon dimensions
 */
export const ICON_SIZE = {
    SMALL: 16,
    MEDIUM: 24,
    LARGE: 32,
    EXTRA_LARGE: 48,
} as const;

/**
 * Common breakpoint values (in pixels)
 * Matches Material-UI breakpoints
 */
export const BREAKPOINTS = {
    XS: 0,
    SM: 600,
    MD: 900,
    LG: 1200,
    XL: 1536,
} as const;

/**
 * Task card constants
 */
export const TASK_CARD = {
    MIN_HEIGHT: 100,
    MAX_WIDTH: 400,
    BORDER_WIDTH: 1,
    HOVER_ELEVATION: 4,
} as const;

/**
 * Calendar constants
 */
export const CALENDAR = {
    HOUR_HEIGHT: 60,
    TIME_COLUMN_WIDTH: 80,
    MIN_EVENT_HEIGHT: 20,
    MIN_EVENT_DURATION_MINUTES: 15,
    SNAP_MINUTES: 10,
    MONTH_VIEW_DAY_HEIGHT: 120,
} as const;

/**
 * Form constants
 */
export const FORM = {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_PASSWORD_LENGTH: 8,
    DEBOUNCE_DELAY_MS: 300,
} as const;

/**
 * Loading states
 */
export const LOADING = {
    SKELETON_ANIMATION: 'wave',
    SPINNER_SIZE_SMALL: 20,
    SPINNER_SIZE_MEDIUM: 40,
    SPINNER_SIZE_LARGE: 60,
    MIN_LOADING_TIME_MS: 500, // Minimum time to show loading to prevent flicker
} as const;

/**
 * Error display constants
 */
export const ERROR_DISPLAY = {
    TOAST_DURATION_MS: 5000,
    TOAST_AUTO_HIDE_DURATION_MS: 6000,
    MAX_ERROR_MESSAGE_LENGTH: 500,
} as const;

/**
 * Typography constants
 */
export const TYPOGRAPHY = {
    HEADING_1: 'h3',
    HEADING_2: 'h4',
    HEADING_3: 'h5',
    HEADING_4: 'h6',
    BODY: 'body1',
    BODY_SMALL: 'body2',
    CAPTION: 'caption',
    OVERLINE: 'overline',
} as const;

/**
 * Color opacity values (alpha channel)
 */
export const OPACITY = {
    TRANSPARENT: 0,
    SUBTLE: 0.05,
    LIGHT: 0.1,
    MEDIUM: 0.3,
    STRONG: 0.5,
    VERY_STRONG: 0.7,
    ALMOST_OPAQUE: 0.9,
    OPAQUE: 1,
} as const;

/**
 * Shadow elevations (Material-UI elevation values)
 */
export const ELEVATION = {
    NONE: 0,
    SUBTLE: 1,
    LOW: 2,
    MEDIUM: 4,
    HIGH: 8,
    VERY_HIGH: 16,
    MAXIMUM: 24,
} as const;

/**
 * Grid and layout constants
 */
export const LAYOUT = {
    MAX_CONTENT_WIDTH: 1440,
    SIDEBAR_WIDTH: 240,
    SIDEBAR_COLLAPSED_WIDTH: 72,
    NAVBAR_HEIGHT: 64,
    FOOTER_HEIGHT: 48,
} as const;

// Type exports for TypeScript
export type DialogSize = typeof DIALOG_SIZES[keyof typeof DIALOG_SIZES];
export type ButtonVariant = typeof BUTTON_VARIANTS[keyof typeof BUTTON_VARIANTS];
export type TypographyVariant = typeof TYPOGRAPHY[keyof typeof TYPOGRAPHY];
