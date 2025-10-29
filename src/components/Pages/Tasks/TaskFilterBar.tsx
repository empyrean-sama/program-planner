import React, { useState } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    InputAdornment,
    Paper,
    Typography,
    SelectChangeEvent,
    Button,
    Menu,
    Checkbox,
    ListItemText,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { TaskState } from '../../../types/Task';

export type SortOption = 
    | 'filingDate-desc' 
    | 'filingDate-asc'
    | 'dueDate-desc'
    | 'dueDate-asc'
    | 'title-asc'
    | 'title-desc'
    | 'state-asc'
    | 'state-desc'
    | 'points-desc'
    | 'points-asc'
    | 'elapsedTime-desc'
    | 'elapsedTime-asc';

export interface TaskFilters {
    searchText: string;
    states: TaskState[];
    sortBy: SortOption;
    dateRangeStart?: Dayjs | null;
    dateRangeEnd?: Dayjs | null;
    dateRangeField: 'filing' | 'due' | 'completion';
    hasDeadline?: boolean;
    hasSchedule?: boolean;
    hasComments?: boolean;
    minPoints?: number;
    maxPoints?: number;
}

interface TaskFilterBarProps {
    filters: TaskFilters;
    onChange: (filters: TaskFilters) => void;
    taskCount: number;
    filteredCount: number;
}

const allStates: TaskState[] = ['Filed', 'Scheduled', 'Doing', 'Finished', 'Failed', 'Deferred', 'Removed'];

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'filingDate-desc', label: 'Filing Date (Newest First)' },
    { value: 'filingDate-asc', label: 'Filing Date (Oldest First)' },
    { value: 'dueDate-desc', label: 'Due Date (Latest First)' },
    { value: 'dueDate-asc', label: 'Due Date (Earliest First)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'state-asc', label: 'State (A-Z)' },
    { value: 'state-desc', label: 'State (Z-A)' },
    { value: 'points-desc', label: 'Points (High to Low)' },
    { value: 'points-asc', label: 'Points (Low to High)' },
    { value: 'elapsedTime-desc', label: 'Elapsed Time (Most First)' },
    { value: 'elapsedTime-asc', label: 'Elapsed Time (Least First)' },
];

export default function TaskFilterBar({ filters, onChange, taskCount, filteredCount }: TaskFilterBarProps) {
    const [advancedMenuAnchor, setAdvancedMenuAnchor] = useState<null | HTMLElement>(null);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...filters, searchText: event.target.value });
    };

    const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
        onChange({ ...filters, sortBy: event.target.value as SortOption });
    };

    const handleStatesChange = (event: SelectChangeEvent<TaskState[]>) => {
        const value = event.target.value;
        onChange({ 
            ...filters, 
            states: typeof value === 'string' ? [] : value 
        });
    };

    const handleDateRangeFieldChange = (event: SelectChangeEvent<'filing' | 'due' | 'completion'>) => {
        onChange({ ...filters, dateRangeField: event.target.value as 'filing' | 'due' | 'completion' });
    };

    const handleClearFilters = () => {
        onChange({
            searchText: '',
            states: [],
            sortBy: 'filingDate-desc',
            dateRangeStart: null,
            dateRangeEnd: null,
            dateRangeField: 'filing',
            hasDeadline: undefined,
            hasSchedule: undefined,
            hasComments: undefined,
            minPoints: undefined,
            maxPoints: undefined,
        });
    };

    const hasActiveFilters = 
        filters.searchText !== '' ||
        filters.states.length > 0 ||
        filters.dateRangeStart !== null ||
        filters.dateRangeEnd !== null ||
        filters.hasDeadline !== undefined ||
        filters.hasSchedule !== undefined ||
        filters.hasComments !== undefined ||
        filters.minPoints !== undefined ||
        filters.maxPoints !== undefined;

    const activeFilterCount = [
        filters.searchText !== '',
        filters.states.length > 0,
        filters.dateRangeStart !== null || filters.dateRangeEnd !== null,
        filters.hasDeadline !== undefined,
        filters.hasSchedule !== undefined,
        filters.hasComments !== undefined,
        filters.minPoints !== undefined || filters.maxPoints !== undefined,
    ].filter(Boolean).length;

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Primary Row: Search and Sort */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Fuzzy Search */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search tasks by title, description, or comments..."
                        value={filters.searchText}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: filters.searchText && (
                                <InputAdornment position="end">
                                    <Button
                                        size="small"
                                        onClick={() => onChange({ ...filters, searchText: '' })}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Sort By */}
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={filters.sortBy}
                            label="Sort By"
                            onChange={handleSortChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <SortIcon fontSize="small" />
                                </InputAdornment>
                            }
                        >
                            {sortOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Advanced Filters Button */}
                    <Button
                        variant={hasActiveFilters ? 'contained' : 'outlined'}
                        startIcon={<FilterListIcon />}
                        onClick={(e) => setAdvancedMenuAnchor(e.currentTarget)}
                    >
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="text"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            size="small"
                        >
                            Clear
                        </Button>
                    )}
                </Box>

                {/* Secondary Row: State Filter Chips */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by State</InputLabel>
                        <Select<TaskState[]>
                            multiple
                            value={filters.states}
                            onChange={handleStatesChange}
                            label="Filter by State"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as TaskState[]).map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {allStates.map((state) => (
                                <MenuItem key={state} value={state}>
                                    <Checkbox checked={filters.states.indexOf(state) > -1} />
                                    <ListItemText primary={state} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Date Range */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Date Field</InputLabel>
                            <Select
                                value={filters.dateRangeField}
                                label="Date Field"
                                onChange={handleDateRangeFieldChange}
                                size="small"
                            >
                                <MenuItem value="filing">Filing Date</MenuItem>
                                <MenuItem value="due">Due Date</MenuItem>
                                <MenuItem value="completion">Completion Date</MenuItem>
                            </Select>
                        </FormControl>

                        <DatePicker
                            label="From Date"
                            value={filters.dateRangeStart}
                            onChange={(value) => onChange({ ...filters, dateRangeStart: value })}
                            slotProps={{
                                textField: { size: 'small', sx: { minWidth: 150 } }
                            }}
                        />

                        <DatePicker
                            label="To Date"
                            value={filters.dateRangeEnd}
                            onChange={(value) => onChange({ ...filters, dateRangeEnd: value })}
                            slotProps={{
                                textField: { size: 'small', sx: { minWidth: 150 } }
                            }}
                        />
                    </LocalizationProvider>

                    {/* Results Count */}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        Showing {filteredCount} of {taskCount} tasks
                    </Typography>
                </Box>
            </Box>

            {/* Advanced Filters Menu */}
            <Menu
                anchorEl={advancedMenuAnchor}
                open={Boolean(advancedMenuAnchor)}
                onClose={() => setAdvancedMenuAnchor(null)}
                PaperProps={{
                    sx: { width: 350, p: 2 }
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Advanced Filters
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Boolean Filters */}
                    <FormControl size="small">
                        <InputLabel>Has Deadline</InputLabel>
                        <Select<string>
                            value={filters.hasDeadline === undefined ? '' : filters.hasDeadline ? 'yes' : 'no'}
                            label="Has Deadline"
                            onChange={(e) => {
                                const value = e.target.value as string;
                                onChange({
                                    ...filters,
                                    hasDeadline: value === '' ? undefined : value === 'yes'
                                });
                            }}
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small">
                        <InputLabel>Has Schedule</InputLabel>
                        <Select<string>
                            value={filters.hasSchedule === undefined ? '' : filters.hasSchedule ? 'yes' : 'no'}
                            label="Has Schedule"
                            onChange={(e) => {
                                const value = e.target.value as string;
                                onChange({
                                    ...filters,
                                    hasSchedule: value === '' ? undefined : value === 'yes'
                                });
                            }}
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small">
                        <InputLabel>Has Comments</InputLabel>
                        <Select<string>
                            value={filters.hasComments === undefined ? '' : filters.hasComments ? 'yes' : 'no'}
                            label="Has Comments"
                            onChange={(e) => {
                                const value = e.target.value as string;
                                onChange({
                                    ...filters,
                                    hasComments: value === '' ? undefined : value === 'yes'
                                });
                            }}
                        >
                            <MenuItem value="">Any</MenuItem>
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </Select>
                    </FormControl>

                    <Divider />

                    {/* Points Range */}
                    <Typography variant="caption" color="text.secondary">
                        Points Range
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            label="Min Points"
                            type="number"
                            value={filters.minPoints ?? ''}
                            onChange={(e) => onChange({
                                ...filters,
                                minPoints: e.target.value ? Number(e.target.value) : undefined
                            })}
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            size="small"
                            label="Max Points"
                            type="number"
                            value={filters.maxPoints ?? ''}
                            onChange={(e) => onChange({
                                ...filters,
                                maxPoints: e.target.value ? Number(e.target.value) : undefined
                            })}
                            inputProps={{ min: 0 }}
                        />
                    </Box>
                </Box>
            </Menu>
        </Paper>
    );
}
