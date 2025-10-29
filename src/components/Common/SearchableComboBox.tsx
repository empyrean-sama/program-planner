/**
 * SearchableComboBox - A combo box component with fuzzy search functionality
 * 
 * Features:
 * - Shows a search bar only when items exceed the threshold (default: 10)
 * - Implements fuzzy search matching for both label and subtitle
 * - Auto-scrollable list for many items
 * - Supports subtitles for additional context
 * - Clear button in search field
 * 
 * Usage:
 * ```tsx
 * <SearchableComboBox
 *   label="Select Task"
 *   value={selectedId}
 *   options={[
 *     { value: '1', label: 'Task 1', subtitle: 'Active • 60 min' },
 *     { value: '2', label: 'Task 2', subtitle: 'Pending' }
 *   ]}
 *   onChange={setSelectedId}
 *   placeholder="Search tasks..."
 *   searchThreshold={5}
 * />
 * ```
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box,
    ListSubheader,
    InputAdornment,
    MenuProps,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

interface SearchableComboBoxOption {
    value: string;
    label: string;
    subtitle?: string;
}

interface SearchableComboBoxProps {
    label: string;
    value: string;
    options: SearchableComboBoxOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    fullWidth?: boolean;
    searchThreshold?: number; // Number of items before search is shown (default: 10)
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

export default function SearchableComboBox({
    label,
    value,
    options,
    onChange,
    placeholder = 'Search...',
    fullWidth = true,
    searchThreshold = 10,
    disabled = false,
    error = false,
    helperText,
}: SearchableComboBoxProps) {
    const [searchText, setSearchText] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus search input when menu opens
    useEffect(() => {
        if (menuOpen && searchInputRef.current && options.length >= searchThreshold) {
            // Small delay to ensure menu is fully rendered
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [menuOpen, options.length, searchThreshold]);

    // Fuzzy search implementation
    const fuzzyMatch = (text: string, search: string): boolean => {
        if (!search) return true;
        
        const searchLower = search.toLowerCase();
        const textLower = text.toLowerCase();
        
        // Direct substring match
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

    // Filter options based on search text
    const filteredOptions = useMemo(() => {
        if (!searchText) return options;
        
        return options.filter(option => {
            const labelMatch = fuzzyMatch(option.label, searchText);
            const subtitleMatch = option.subtitle ? fuzzyMatch(option.subtitle, searchText) : false;
            return labelMatch || subtitleMatch;
        });
    }, [options, searchText]);

    const handleMenuOpen = () => {
        setMenuOpen(true);
        setSearchText('');
    };

    const handleMenuClose = () => {
        setMenuOpen(false);
        setSearchText('');
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const handleClearSearch = () => {
        setSearchText('');
        searchInputRef.current?.focus();
    };

    const showSearch = options.length >= searchThreshold;

    // Custom menu props for better scrolling
    const menuProps: Partial<MenuProps> = {
        PaperProps: {
            style: {
                maxHeight: 400,
            },
        },
        // Prevent menu from closing when clicking on search field
        autoFocus: false,
    };

    return (
        <FormControl fullWidth={fullWidth} error={error} disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value as string)}
                onOpen={handleMenuOpen}
                onClose={handleMenuClose}
                MenuProps={menuProps}
            >
                {/* Search Bar - Only show if items exceed threshold */}
                {showSearch && (
                    <ListSubheader
                        sx={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            backgroundColor: 'background.paper',
                            pt: 1,
                            pb: 1,
                        }}
                        onKeyDown={(e) => {
                            // Prevent menu from closing on key press in search field
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            // Prevent menu from closing on click in search field
                            e.stopPropagation();
                        }}
                    >
                        <TextField
                            inputRef={searchInputRef}
                            size="small"
                            fullWidth
                            placeholder={placeholder}
                            value={searchText}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchText && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                            edge="end"
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            onKeyDown={(e) => {
                                // Prevent space from closing menu
                                if (e.key === ' ') {
                                    e.stopPropagation();
                                }
                            }}
                        />
                    </ListSubheader>
                )}

                {/* Empty state when no options */}
                {options.length === 0 && (
                    <MenuItem value="" disabled>
                        No options available
                    </MenuItem>
                )}

                {/* Empty state when search has no results */}
                {options.length > 0 && filteredOptions.length === 0 && (
                    <MenuItem value="" disabled>
                        No results found for "{searchText}"
                    </MenuItem>
                )}

                {/* Filtered Options */}
                {filteredOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box>{option.label}</Box>
                            {option.subtitle && (
                                <Box
                                    component="span"
                                    sx={{
                                        fontSize: '0.75rem',
                                        color: 'text.secondary',
                                    }}
                                >
                                    {option.subtitle}
                                </Box>
                            )}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
            {helperText && (
                <Box
                    sx={{
                        fontSize: '0.75rem',
                        color: error ? 'error.main' : 'text.secondary',
                        mt: 0.5,
                        ml: 1.75,
                    }}
                >
                    {helperText}
                </Box>
            )}
        </FormControl>
    );
}
