import dayjs from 'dayjs';
import { Task, TaskState } from '../types/Task';
import { TaskFilters, SortOption } from '../components/Pages/Tasks/TaskFilterBar';

/**
 * Fuzzy search implementation for task filtering
 * Searches in title, description, and comments
 */
export function fuzzySearch(task: Task, searchText: string): boolean {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    
    // Helper function for fuzzy matching
    const fuzzyMatch = (text: string): boolean => {
        const textLower = text.toLowerCase();
        
        // Direct substring match (faster)
        if (textLower.includes(searchLower)) return true;
        
        // Fuzzy match - check if all characters in search appear in order
        let searchIndex = 0;
        for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
            if (textLower[i] === searchLower[searchIndex]) {
                searchIndex++;
            }
        }
        return searchIndex === searchLower.length;
    };
    
    // Search in title
    if (fuzzyMatch(task.title)) return true;
    
    // Search in description
    if (fuzzyMatch(task.description)) return true;
    
    // Search in comments
    for (const comment of task.comments) {
        if (fuzzyMatch(comment.text)) return true;
    }
    
    return false;
}

/**
 * Apply all filters to a task
 */
export function applyFilters(task: Task, filters: TaskFilters): boolean {
    // Fuzzy search
    if (!fuzzySearch(task, filters.searchText)) {
        return false;
    }
    
    // State filter
    if (filters.states.length > 0 && !filters.states.includes(task.state)) {
        return false;
    }
    
    // Date range filter
    if (filters.dateRangeStart || filters.dateRangeEnd) {
        let dateToCheck: string | undefined;
        
        switch (filters.dateRangeField) {
            case 'filing':
                dateToCheck = task.filingDateTime;
                break;
            case 'due':
                dateToCheck = task.dueDateTime;
                break;
            case 'completion':
                // Check if task is in a final state and use the last schedule entry
                const finalStates: TaskState[] = ['Finished', 'Failed', 'Deferred', 'Removed'];
                if (finalStates.includes(task.state) && task.scheduleHistory.length > 0) {
                    const lastSchedule = task.scheduleHistory[task.scheduleHistory.length - 1];
                    dateToCheck = lastSchedule.endTime;
                } else {
                    return false; // Not completed
                }
                break;
        }
        
        if (!dateToCheck) return false;
        
        const date = dayjs(dateToCheck);
        
        if (filters.dateRangeStart && date.isBefore(filters.dateRangeStart, 'day')) {
            return false;
        }
        
        if (filters.dateRangeEnd && date.isAfter(filters.dateRangeEnd, 'day')) {
            return false;
        }
    }
    
    // Has deadline filter
    if (filters.hasDeadline !== undefined) {
        const hasDeadline = !!task.dueDateTime;
        if (hasDeadline !== filters.hasDeadline) {
            return false;
        }
    }
    
    // Has schedule filter
    if (filters.hasSchedule !== undefined) {
        const hasSchedule = task.scheduleHistory.length > 0;
        if (hasSchedule !== filters.hasSchedule) {
            return false;
        }
    }
    
    // Has comments filter
    if (filters.hasComments !== undefined) {
        const hasComments = task.comments.length > 0;
        if (hasComments !== filters.hasComments) {
            return false;
        }
    }
    
    // Points range filter
    if (filters.minPoints !== undefined && task.points < filters.minPoints) {
        return false;
    }
    
    if (filters.maxPoints !== undefined && task.points > filters.maxPoints) {
        return false;
    }
    
    return true;
}

/**
 * Sort tasks based on the selected sort option
 */
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
    const sorted = [...tasks];
    
    switch (sortBy) {
        case 'filingDate-desc':
            return sorted.sort((a, b) => 
                dayjs(b.filingDateTime).valueOf() - dayjs(a.filingDateTime).valueOf()
            );
            
        case 'filingDate-asc':
            return sorted.sort((a, b) => 
                dayjs(a.filingDateTime).valueOf() - dayjs(b.filingDateTime).valueOf()
            );
            
        case 'dueDate-desc':
            return sorted.sort((a, b) => {
                if (!a.dueDateTime && !b.dueDateTime) return 0;
                if (!a.dueDateTime) return 1;
                if (!b.dueDateTime) return -1;
                return dayjs(b.dueDateTime).valueOf() - dayjs(a.dueDateTime).valueOf();
            });
            
        case 'dueDate-asc':
            return sorted.sort((a, b) => {
                if (!a.dueDateTime && !b.dueDateTime) return 0;
                if (!a.dueDateTime) return 1;
                if (!b.dueDateTime) return -1;
                return dayjs(a.dueDateTime).valueOf() - dayjs(b.dueDateTime).valueOf();
            });
            
        case 'title-asc':
            return sorted.sort((a, b) => 
                a.title.localeCompare(b.title)
            );
            
        case 'title-desc':
            return sorted.sort((a, b) => 
                b.title.localeCompare(a.title)
            );
            
        case 'state-asc':
            return sorted.sort((a, b) => 
                a.state.localeCompare(b.state)
            );
            
        case 'state-desc':
            return sorted.sort((a, b) => 
                b.state.localeCompare(a.state)
            );
            
        case 'points-desc':
            return sorted.sort((a, b) => b.points - a.points);
            
        case 'points-asc':
            return sorted.sort((a, b) => a.points - b.points);
            
        case 'elapsedTime-desc':
            return sorted.sort((a, b) => b.elapsedTime - a.elapsedTime);
            
        case 'elapsedTime-asc':
            return sorted.sort((a, b) => a.elapsedTime - b.elapsedTime);
            
        default:
            return sorted;
    }
}

/**
 * Main function to filter and sort tasks
 * Optimized for performance with memoization-friendly structure
 */
export function filterAndSortTasks(tasks: Task[], filters: TaskFilters): Task[] {
    // First filter
    const filtered = tasks.filter(task => applyFilters(task, filters));
    
    // Then sort
    return sortTasks(filtered, filters.sortBy);
}
