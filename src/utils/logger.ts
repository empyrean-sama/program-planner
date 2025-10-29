/**
 * Logger utility for production-safe logging
 * 
 * Usage:
 * import { logger } from '@/utils/logger';
 * logger.debug('Debug info'); // Only in development
 * logger.info('Info message'); // Always logs
 * logger.warn('Warning'); // Always logs
 * logger.error('Error', error); // Always logs
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger instance with environment-aware methods
 */
export const logger = {
    /**
     * Debug logging - only enabled in development
     * Use for verbose debugging information
     */
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info logging - enabled in all environments
     * Use for important informational messages
     */
    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },

    /**
     * Warning logging - enabled in all environments
     * Use for potentially problematic situations
     */
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error logging - enabled in all environments
     * Use for error conditions
     */
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Group logging - only enabled in development
     * Use for grouping related log messages
     */
    group: (label: string) => {
        if (isDevelopment) {
            console.group(label);
        }
    },

    /**
     * End group logging - only enabled in development
     */
    groupEnd: () => {
        if (isDevelopment) {
            console.groupEnd();
        }
    },

    /**
     * Table logging - only enabled in development
     * Use for displaying tabular data
     */
    table: (data: any) => {
        if (isDevelopment) {
            console.table(data);
        }
    },

    /**
     * Time logging - only enabled in development
     * Use for performance measurements
     */
    time: (label: string) => {
        if (isDevelopment) {
            console.time(label);
        }
    },

    /**
     * End time logging - only enabled in development
     */
    timeEnd: (label: string) => {
        if (isDevelopment) {
            console.timeEnd(label);
        }
    },
};

/**
 * Performance marker utility - only enabled in development
 */
export const perf = {
    mark: (name: string) => {
        if (isDevelopment && typeof performance !== 'undefined') {
            performance.mark(name);
        }
    },

    measure: (name: string, startMark: string, endMark: string) => {
        if (isDevelopment && typeof performance !== 'undefined') {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                logger.debug(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
            } catch (error) {
                logger.warn('Performance measurement failed:', error);
            }
        }
    },
};

/**
 * Development-only assertion utility
 */
export const devAssert = (condition: boolean, message: string) => {
    if (isDevelopment && !condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
};

/**
 * Development-only warning utility
 */
export const devWarn = (condition: boolean, message: string) => {
    if (isDevelopment && !condition) {
        logger.warn(message);
    }
};

export default logger;
