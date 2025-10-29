# Task Card Visual Rules - Quick Reference

## State-Based Styling

| State | Background | Border | Opacity | Text Decoration | Chip Color |
|-------|-----------|--------|---------|-----------------|------------|
| **Filed** | Grey `rgba(0,0,0,0.04)` | None (Warning if approaching deadline) | 1.0 | None | Default (Grey) |
| **Scheduled** | Gradient (progress-based) | None/Warning/Error | 1.0 | None | Info (Blue) |
| **Doing** | Blue gradient | Primary (2px solid) | 1.0 | None | Primary (Blue) |
| **Finished** | Green gradient | Success (1px solid) | 1.0 | None | Success (Green) |
| **Failed** | Red gradient | Error (1px solid) | 1.0 | None | Error (Red) |
| **Deferred** | Amber gradient | None | 0.85 | None | Warning (Orange) |
| **Removed** | Very light grey | None | 0.6 | **Strikethrough** | Default (Grey) |

## Scheduled State Gradients

| Progress | Gradient Color | Progress Bar Color | Meaning |
|----------|---------------|-------------------|---------|
| 0-50% | Green | Green | On track, early progress |
| 50-80% | Yellow | Yellow | On track, mid progress |
| 80-100% | Orange | Orange | Nearly complete |
| >100% | Red | Red | **Exceeded estimate** |
| No estimate | Light blue | N/A | No tracking available |

## Warning Conditions

| Warning Type | Trigger | Icon Color | Border | Message |
|-------------|---------|------------|--------|---------|
| **Overdue** | Now > Due date (not finished) | Error (Red) | 2px solid red | "Overdue by X days" |
| **Schedule Beyond Due Date** | Any schedule starts/ends after due date (not finished) | Error (Red) | 2px solid red | "X schedule(s) beyond due date" |
| **Exceeded Estimate** | Elapsed > Estimated (not finished) | Warning (Orange) | 2px dashed orange | "Exceeded estimate by X min" |
| **No Progress** | Has deadline, no schedule, filed, due ≤3 days | Info (Blue) | 2px solid orange | "Due in X days with no progress" |
| **Stalled** | Has schedule, >7 days since last, not finished | Warning (Orange) | 1px dashed | "No activity for X days" |

## Visual Elements

### Progress Bar (Scheduled/Doing with estimates)
```
Progress
60m / 120m (50%)
[==============         ] 50%
```
- Green: 0-80%
- Yellow: 80-100%
- Red: >100%

### Warning Icon
- Displayed in card header (top right)
- Tooltip shows all warning messages
- Color matches most severe warning

### Strikethrough (Removed only)
- Applied to: Title, Description, All metadata
- Opacity: 0.6
- No warnings shown

## Border Priority Rules

When multiple border conditions apply:

1. **Overdue or Schedule Beyond Due Date** → Red solid (highest priority)
2. **Exceeded Estimate** → Orange dashed
3. **No Progress** → Orange solid
4. **Stalled** → Dashed (if no other border)
5. **State Default** → State-specific border

## Color Codes

```css
/* Success/Green */
rgba(76, 175, 80, 0.15-0.3)

/* Warning/Yellow-Orange */
rgba(255, 193, 7, 0.1-0.4)    /* Yellow */
rgba(255, 152, 0, 0.1-0.5)    /* Orange */

/* Error/Red */
rgba(244, 67, 54, 0.1-0.45)

/* Info/Blue */
rgba(33, 150, 243, 0.1-0.3)

/* Grey */
rgba(0, 0, 0, 0.02-0.04)
```

## Metrics Displayed

### On Card
- Due date (red if overdue)
- Estimated time
- Elapsed time (red if exceeds estimate)
- Points
- Progress bar (if applicable)
- Warning messages (at bottom)

### On Details Page
- All card metrics
- Progress tracking section (large)
- Warning alerts (at top)
- Color-coded indicators

## Decision Flow

```
Task → Get State → Apply Base Style
              ↓
         Has Estimate? → Calculate Progress → Apply Gradient
              ↓
         Check Deadlines → Apply Border Overrides
              ↓
         Check Activity → Add Warning Indicators
              ↓
         Apply Final Opacity/Decoration
              ↓
         Render Card
```

## Implementation

```typescript
// Get all appearance rules
const appearance = getTaskCardAppearance(task);

// Access components
appearance.styles          // All CSS styles
appearance.warnings        // Warning flags & messages
appearance.metrics         // Calculated metrics
appearance.showWarningIcon // Boolean
appearance.warningIconColor // 'error' | 'warning' | 'info'
appearance.chipColor       // State chip color
```

## Key Functions

```typescript
getTaskCardAppearance(task: Task): TaskCardAppearance
getWarningMessages(warnings: TaskCardWarnings): string[]
```
