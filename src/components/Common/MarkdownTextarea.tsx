import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { marked } from 'marked';

interface MarkdownTextareaProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    minRows?: number;
    maxRows?: number;
    fullWidth?: boolean;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

export default function MarkdownTextarea({
    value,
    onChange,
    label,
    placeholder,
    multiline = true,
    rows = 4,
    minRows,
    maxRows,
    fullWidth = true,
    disabled = false,
    error = false,
    helperText,
}: MarkdownTextareaProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentLine, setCurrentLine] = useState(0);
    const [editableLines, setEditableLines] = useState<Set<number>>(new Set());
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [cursorPosition, setCursorPosition] = useState(0);

    // Configure marked for safe rendering
    useEffect(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    const lines = value.split('\n');

    const handleFocus = () => {
        setIsEditing(true);
        updateCurrentLine();
    };

    const handleBlur = () => {
        // Don't immediately exit editing mode, let the line change handler do it
        setTimeout(() => {
            setIsEditing(false);
            setEditableLines(new Set());
        }, 100);
    };

    const updateCurrentLine = () => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lineNumber = textBeforeCursor.split('\n').length - 1;
        
        setCurrentLine(lineNumber);
        setCursorPosition(cursorPos);
        
        // Mark this line as editable
        setEditableLines(prev => new Set(prev).add(lineNumber));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // Small delay to let cursor position update
            setTimeout(updateCurrentLine, 0);
        }
    };

    const handleClick = () => {
        updateCurrentLine();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
        updateCurrentLine();
    };

    const renderMarkdownLine = (line: string, index: number): React.ReactNode => {
        if (isEditing && (index === currentLine || editableLines.has(index))) {
            // Show raw markdown for current line and recently edited lines
            return (
                <Typography
                    component="pre"
                    sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: 'text.primary',
                        backgroundColor: 'action.hover',
                        padding: '2px 4px',
                        borderRadius: '4px',
                    }}
                >
                    {line || '\u00A0'}
                </Typography>
            );
        }

        // Render markdown for other lines
        if (!line.trim()) {
            return <Typography component="div" sx={{ minHeight: '1.5em' }}>&nbsp;</Typography>;
        }

        try {
            const html = marked.parse(line, { async: false }) as string;
            return (
                <Typography
                    component="div"
                    sx={{
                        '& p': { margin: 0 },
                        '& h1, & h2, & h3, & h4, & h5, & h6': { 
                            margin: '0.5em 0',
                            fontWeight: 600,
                        },
                        '& code': {
                            backgroundColor: 'action.selected',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.875em',
                        },
                        '& pre': {
                            backgroundColor: 'action.selected',
                            padding: '8px',
                            borderRadius: '4px',
                            overflow: 'auto',
                        },
                        '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'divider',
                            paddingLeft: '1em',
                            margin: '0.5em 0',
                            color: 'text.secondary',
                        },
                        '& ul, & ol': {
                            margin: '0.5em 0',
                            paddingLeft: '2em',
                        },
                        '& a': {
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        },
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            );
        } catch (error) {
            // Fallback to plain text if markdown parsing fails
            return <Typography component="div">{line}</Typography>;
        }
    };

    if (!isEditing && value) {
        // Show fully rendered markdown when not editing
        return (
            <Box
                onClick={() => {
                    if (!disabled) {
                        setIsEditing(true);
                        setTimeout(() => textareaRef.current?.focus(), 0);
                    }
                }}
                sx={{
                    position: 'relative',
                    cursor: disabled ? 'default' : 'text',
                }}
            >
                {label && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5,
                        }}
                    >
                        {label}
                    </Typography>
                )}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        minHeight: rows ? `${rows * 1.5}em` : '4em',
                        '&:hover': disabled ? {} : {
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    {lines.map((line, index) => (
                        <Box key={index}>{renderMarkdownLine(line, index)}</Box>
                    ))}
                </Paper>
                {helperText && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: error ? 'error.main' : 'text.secondary',
                            display: 'block',
                            mt: 0.5,
                            ml: 1.75,
                        }}
                    >
                        {helperText}
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <TextField
            inputRef={textareaRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            label={label}
            placeholder={placeholder}
            multiline={multiline}
            rows={rows}
            minRows={minRows}
            maxRows={maxRows}
            fullWidth={fullWidth}
            disabled={disabled}
            error={error}
            helperText={helperText}
            sx={{
                '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                },
            }}
        />
    );
}
