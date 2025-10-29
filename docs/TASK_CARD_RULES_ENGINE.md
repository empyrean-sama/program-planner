# Task Card Appearance Rules Engine

## Overview
A sophisticated rules-based engine that determines the visual appearance of task cards based on task state, progress, deadlines, and other contextual factors. This engine provides consistent, informative visual feedback across the application.

## Architecture

### Core Components

#### 1. **TaskCardRulesEngine.ts**
The main rules engine service that calculates:
- **Styles**: Background, borders, opacity, text decoration
- **Warnings**: Overdue, exceeded estimates, stalled tasks, no progress
- **Metrics**: Progress percentage, deadline status, activity tracking
- **Visual Indicators**: Warning icons, colors, gradients

#### 2. **TaskCard.tsx** (Updated)
Enhanced task card component that:
- Uses rules engine for all styling decisions
- Displays progress bars for scheduled tasks
- Shows warning icons and messages
- Applies state-specific visual treatments

#### 3. **TaskDetailsPage.tsx** (Updated)
Task details page with:
- Warning alerts at the top
- Progress tracking metrics
- Color-coded warnings for overdue/exceeded tasks

## Visual Rules by State

### 📋 Filed (Grey Background)
**Appearance:**
- Light grey background: `rgba(0, 0, 0, 0.04)`
- Default chip color
- Standard opacity

**Special Cases:**
- **Warning border** (orange, 2px solid) if approaching deadline with no progress (≤3 days)

**Logic:**
```typescript
if (state === 'Filed') {
    backgroundColor = 'rgba(0, 0, 0, 0.04)';
    if (dueDate <= 3 days && noSchedule) {
        borderColor = 'warning.main';
        borderWidth = 2;
    }
}
```

---

### 📅 Scheduled (Gradient Based on Progress)
**Appearance:**
- **Dynamic gradient** based on elapsed time vs estimated time
- Progress bar showing completion percentage
- Info chip color (blue)

**Gradient Rules:**

1. **With Estimate & Schedule:**
   - **0-50% Progress**: Green gradient
     ```
     linear-gradient(135deg, 
         rgba(76, 175, 80, 0.1) 0%, 
         rgba(76, 175, 80, 0.15-0.3) 100%)
     ```
   
   - **50-80% Progress**: Yellow gradient
     ```
     linear-gradient(135deg, 
         rgba(255, 193, 7, 0.1) 0%, 
         rgba(255, 193, 7, 0.15-0.4) 100%)
     ```
   
   - **80-100% Progress**: Orange gradient
     ```
     linear-gradient(135deg, 
         rgba(255, 152, 0, 0.1) 0%, 
         rgba(255, 152, 0, 0.2-0.5) 100%)
     ```
   
   - **>100% Progress** (Exceeded Estimate): Red gradient
     ```
     linear-gradient(135deg, 
         rgba(244, 67, 54, 0.1) 0%, 
         rgba(244, 67, 54, 0.2-0.45) 100%)
     ```

2. **Without Estimate**: Light blue gradient
   ```
   linear-gradient(135deg, 
       rgba(33, 150, 243, 0.1) 0%, 
       rgba(33, 150, 243, 0.2) 100%)
   ```

**Special Cases:**
- **Overdue**: Red border (2px solid)
- **Exceeded Estimate**: Orange dashed border (2px)

---

### 🔄 Doing (Active Blue)
**Appearance:**
- Vibrant blue gradient with solid border
- Primary chip color
- Enhanced visibility

**Styling:**
```css
backgroundImage: linear-gradient(135deg, 
    rgba(33, 150, 243, 0.15) 0%, 
    rgba(33, 150, 243, 0.3) 100%);
borderColor: primary.main;
borderWidth: 2px;
borderStyle: solid;
```

**Special Cases:**
- **Overdue**: Border changes to red

---

### ✅ Finished (Success Green)
**Appearance:**
- Green gradient background
- Green border (1px solid)
- Success chip color

**Styling:**
```css
backgroundImage: linear-gradient(135deg, 
    rgba(76, 175, 80, 0.15) 0%, 
    rgba(76, 175, 80, 0.25) 100%);
borderColor: success.main;
borderWidth: 1px;
```

**No warnings displayed** for finished tasks.

---

### ❌ Failed (Error Red)
**Appearance:**
- Red gradient background
- Red border (1px solid)
- Error chip color

**Styling:**
```css
backgroundImage: linear-gradient(135deg, 
    rgba(244, 67, 54, 0.15) 0%, 
    rgba(244, 67, 54, 0.25) 100%);
borderColor: error.main;
borderWidth: 1px;
```

---

### ⏸️ Deferred (Amber/Orange)
**Appearance:**
- Amber/orange gradient
- Slightly reduced opacity (0.85)
- Warning chip color

**Styling:**
```css
backgroundImage: linear-gradient(135deg, 
    rgba(255, 152, 0, 0.1) 0%, 
    rgba(255, 152, 0, 0.2) 100%);
opacity: 0.85;
```

---

### 🗑️ Removed (Strikethrough Grey)
**Appearance:**
- Very light grey background
- Reduced opacity (0.6)
- **All text strikethrough** (title, description, metadata)
- Default chip color (grey)

**Styling:**
```css
backgroundColor: rgba(0, 0, 0, 0.02);
opacity: 0.6;
textDecoration: line-through; // Applied to all text elements
```

**No warnings displayed** for removed tasks.

---

## Warning System

### Warning Types

#### 1. ⚠️ Overdue Warning
**Triggers when:**
- Current date > due date
- Task is NOT in final state (Finished/Failed/Removed)

**Display:**
- Error severity (red)
- Red border on card
- Warning icon on card
- Message: "Overdue by X day(s)"

**Icon Color:** Error (red)

---

#### 2. 🗓️ Schedule Beyond Due Date Warning
**Triggers when:**
- Task has a due date
- One or more schedule entries start or end after the due date
- Task is NOT in final state (Finished/Failed/Removed)

**Display:**
- Error severity (red)
- Red border on card (same as overdue)
- Warning icon on card
- Message: "X schedule(s) beyond due date"

**Icon Color:** Error (red)

**Note:** This warning indicates that work was scheduled or performed after the task was supposed to be completed, which is a critical planning issue.

---

#### 3. ⏱️ Exceeded Estimate Warning
**Triggers when:**
- Elapsed time > estimated time
- Task is NOT finished

**Display:**
- Warning severity (orange)
- Dashed orange border
- Progress bar turns red
- Message: "Exceeded estimate by X minutes"

**Icon Color:** Warning (orange)

---

#### 4. 📊 No Progress Warning
**Triggers when:**
- Has deadline
- No schedule entries
- State is 'Filed'
- Due within 3 days

**Display:**
- Warning severity (orange)
- Orange border on card
- Message: "Due in X day(s) with no progress"

**Icon Color:** Info (blue)

---

#### 5. 💤 Stalled Warning
**Triggers when:**
- Has schedule history
- Latest schedule > 7 days old
- NOT in final state

**Display:**
- Dashed border (if no other border)
- Warning severity
- Message: "No activity for X days"

**Icon Color:** Warning (orange)

---

## Progress Tracking

### Progress Bar
**Shown for:**
- Scheduled or Doing tasks
- With both estimate and schedule history

**Visual Indicators:**

| Progress | Color | Meaning |
|----------|-------|---------|
| 0-80% | Green | On track |
| 80-100% | Yellow/Orange | Nearly complete |
| >100% | Red | Over estimate |

**Display:**
```
Progress
Est: 120m / Elapsed: 90m (75%)
[============================        ] 75%
```

---

## Metrics Calculation

### Progress Percentage
```typescript
progressPercentage = min(100, (elapsedTime / estimatedTime) * 100)
```

### Days Until Due
```typescript
daysUntilDue = dayjs(dueDateTime).diff(dayjs(), 'day')
```

### Is Stalled
```typescript
isStalled = hasSchedule && 
           daysSinceLastSchedule > 7 && 
           !isFinalState
```

### Exceeds Estimate
```typescript
exceedsEstimate = hasEstimate && 
                 elapsedTime > estimatedTime
```

---

## Visual Examples

### Example 1: Scheduled Task (50% Progress)
```
┌────────────────────────────────┐
│ 📝 Implement Feature X    [i] │  ← Info chip (blue)
│                                │
│ Create new feature...          │
│                                │
│ Progress                       │
│ 60m / 120m (50%)              │
│ [==============         ] 50%  │  ← Yellow/orange bar
│                                │
│ 🎯 5 pts                       │
│ 📅 Due: Oct 30, 2025 5:00 PM  │
│ ⏱️ Est: 120m • Elapsed: 60m   │
└────────────────────────────────┘
Background: Yellow gradient (50-80% zone)
Border: None (on track)
```

### Example 2: Overdue Scheduled Task
```
┌────────────────────────────────┐
│ 📝 Fix Bug #123      ⚠️    [i]│  ← Warning icon (red)
│                                │
│ Critical bug in...             │
│                                │
│ Progress                       │
│ 45m / 60m (75%)               │
│ [==================    ] 75%   │  ← Orange bar
│                                │
│ 🎯 3 pts                       │
│ 📅 Due: Oct 27, 2025 2:00 PM  │  ← Red text
│ ⏱️ Est: 60m • Elapsed: 45m    │
│                                │
│ ⚠ Overdue by 2 days           │  ← Warning message (red)
└────────────────────────────────┘
Background: Orange gradient
Border: 2px solid red
```

### Example 3: Removed Task
```
┌────────────────────────────────┐
│ 📝̶ ̶C̶a̶n̶c̶e̶l̶l̶e̶d̶ ̶T̶a̶s̶k̶      [×] │  ← Grey chip
│                                │
│ N̶o̶ ̶l̶o̶n̶g̶e̶r̶ ̶n̶e̶e̶d̶e̶d̶.̶.̶.̶        │  ← Strikethrough
│                                │
│ 🎯̶ ̶2̶ ̶p̶t̶s̶                       │  ← All text struck
│ 📅̶ ̶D̶u̶e̶:̶ ̶O̶c̶t̶ ̶2̶8̶,̶ ̶2̶0̶2̶5̶        │
│ ⏱̶️̶ ̶E̶s̶t̶:̶ ̶3̶0̶m̶                   │
└────────────────────────────────┘
Background: Very light grey
Opacity: 0.6 (faded)
```

---

## Integration Points

### 1. Task Card Component
```typescript
const appearance = getTaskCardAppearance(task);

// Apply styles
<Card sx={appearance.styles}>
  // Card content
</Card>

// Show warnings
{appearance.showWarningIcon && (
  <WarningAmberIcon color={appearance.warningIconColor} />
)}

// Display warning messages
{warningMessages.map(msg => (
  <Typography color="warning">{msg}</Typography>
))}
```

### 2. Task Details Page
```typescript
const appearance = getTaskCardAppearance(task);
const warningMessages = getWarningMessages(appearance.warnings);

// Show alert
{warningMessages.length > 0 && (
  <Alert severity={appearance.warnings.overdue ? 'error' : 'warning'}>
    {warningMessages.map(msg => <div>• {msg}</div>)}
  </Alert>
)}

// Show progress bar
{appearance.metrics.hasEstimate && (
  <ProgressBar percentage={appearance.metrics.progressPercentage} />
)}
```

### 3. Calendar View (Future)
```typescript
// Apply color to calendar events
const appearance = getTaskCardAppearance(task);
<CalendarEvent 
  backgroundColor={appearance.styles.backgroundColor}
  borderColor={appearance.styles.borderColor}
/>
```

---

## Rule Priority

When multiple rules apply, they are combined:

1. **Base style** (determined by state)
2. **Progress gradient** (for Scheduled/Doing)
3. **Border override** (overdue takes precedence)
4. **Warning indicators** (all applicable warnings shown)
5. **Opacity/decoration** (applied last)

Example: Overdue Scheduled Task with Exceeded Estimate
- Base: Scheduled (gradient)
- Progress: Red gradient (>100%)
- Border: Red solid (overdue takes precedence over exceeded)
- Warnings: Both "Overdue" and "Exceeded estimate" shown

---

## Performance Considerations

1. **Memoization**: Results can be memoized in React components
2. **Calculation**: All metrics calculated once per render
3. **Pure Functions**: All functions are pure (no side effects)
4. **Early Exit**: Warning calculations short-circuit when not applicable

---

## Accessibility

1. **Color + Text**: Never rely on color alone
2. **Warning Messages**: Always include text descriptions
3. **Icons**: Accompanied by tooltips
4. **Contrast**: All gradients maintain readable text contrast

---

## Future Enhancements

1. **Custom Rules**: Allow users to define custom appearance rules
2. **Themes**: Different color schemes for different themes
3. **Animations**: Pulse effect for active/overdue tasks
4. **Priority Levels**: Visual indicators for task priority
5. **Tags**: Color coding based on tags
6. **Categories**: Group-based styling
7. **User Preferences**: Customizable warning thresholds
