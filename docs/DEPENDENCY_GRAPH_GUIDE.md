# Task Dependency Graph - User Guide

**Feature:** Visual Dependency Graph  
**Version:** 1.0.0  
**Status:** Production Ready ✅

---

## 📖 Overview

The **Task Dependency Graph** is a powerful visualization tool that shows the relationships between tasks and how they fit within your user stories. It provides a bird's-eye view of task dependencies, helping you understand execution order and identify potential bottlenecks.

### Key Features

✨ **Interactive visualization** of task dependencies  
✨ **Story grouping** - See which tasks belong to which stories  
✨ **Zoom controls** - Navigate large dependency trees  
✨ **Modern design** - Clean, minimalistic interface  
✨ **Color-coded states** - Instantly see task status  
✨ **Smart layout** - Automatic hierarchical arrangement  

---

## 🎯 When to Use

### Perfect For:
- **Understanding dependencies** - See which tasks block others
- **Planning execution order** - Identify what needs to be done first
- **Identifying bottlenecks** - Find tasks with many dependents
- **Story visualization** - See how stories relate through tasks
- **Team communication** - Share visual representation of project structure

### Not Ideal For:
- Simple tasks with no dependencies
- Quick task lookups (use the task list instead)
- Editing task details (use task details page)

---

## 🚀 Accessing the Graph

### Method 1: From Task Details Page
1. Navigate to Tasks page
2. Click on any task to open details
3. Click the **"Relationships"** tab
4. Click **"View Dependency Graph"** button

### Method 2: From Task List
1. Right-click on a task
2. Select **"View Dependencies"** from context menu
3. Graph opens automatically

---

## 🎨 Understanding the Graph

### Visual Elements

#### Task Nodes
Each task appears as a rounded card with:
- **Title** - Task name (truncated if too long)
- **State** - Current task status (Finished, Doing, etc.)
- **Points** - Effort points assigned
- **Color** - Based on current state
- **Border** - Thicker border for the selected/target task

**Example Node:**
```
┌────────────────────┐
│  Implement Login  │  ← Title
│      Doing         │  ← State
│     5 points       │  ← Points
└────────────────────┘
```

#### State Colors
- **Green** (`#43B581`) - Finished
- **Amber** (`#FAA61A`) - Doing/In Progress
- **Blue** (`#5865F2`) - Scheduled
- **Purple** (`#9C27B0`) - Deferred
- **Gray** (`#757575`) - Filed
- **Dark Gray** - Removed

#### Story Groups
Stories appear as:
- **Dashed rectangular containers** wrapping related tasks
- **Story title** with 📖 book icon above the group
- **Color-coded borders** - Each story gets a unique color
- **Semi-transparent background** - Subtle visual grouping

**Story Colors** (6 rotating colors):
1. Blurple (`#5865F2`)
2. Green (`#43B581`)
3. Amber (`#FAA61A`)
4. Purple (`#9C27B0`)
5. Cyan (`#00BCD4`)
6. Deep Orange (`#FF5722`)

#### Dependency Arrows
- **Curved lines** connecting tasks
- **Arrowheads** pointing to dependent tasks
- **Direction:** From prerequisite → to dependent
- **Flow:** Read from bottom to top

**Example:**
```
    Task A
      ↓
    Task B  ← Task B requires Task A to be completed
      ↓
    Task C  ← Task C requires Task B to be completed
```

#### Current Task Indicator
- **Star (★) badge** in top-right corner
- **Glow effect** around the node
- **Thicker border** highlighting the focus
- **Primary color** to stand out

---

## 🎮 Interacting with the Graph

### Zoom Controls

Located in the top-right corner:

| Button | Icon | Function | Shortcut |
|--------|------|----------|----------|
| **Zoom In** | 🔍+ | Increase view by 20% | Click button |
| **Reset** | ⊡ | Return to 100% zoom | Click button |
| **Zoom Out** | 🔍- | Decrease view by 20% | Click button |

**Zoom Range:** 50% to 200%  
**Smooth transitions** between zoom levels (0.2s ease)

### Navigation

- **Scroll** to pan the graph
- **Mouse wheel** to scroll vertically
- **Shift + Mouse wheel** to scroll horizontally (if needed)
- **Zoom buttons** to focus on specific areas

---

## 📐 Graph Layout

### Hierarchical Arrangement

Tasks are automatically arranged in levels:
- **Level 0 (Top)** - Tasks with no prerequisites
- **Level 1** - Tasks depending on Level 0
- **Level 2** - Tasks depending on Level 1
- And so on...

### Spacing

- **Horizontal gap:** 60px between tasks at same level
- **Vertical gap:** 120px between levels
- **Node size:** 200px × 80px
- **Centered alignment** within each level

### Example Layout

```
Level 0:    [ Task A ]  [ Task D ]
               ↓           ↓
Level 1:    [ Task B ]  [ Task E ]
               ↓
Level 2:    [ Task C ]
```

---

## 💡 Reading the Graph

### Understanding Dependencies

**Simple Chain:**
```
  Planning Task
       ↓
  Implementation
       ↓
   Testing
       ↓
  Deployment
```
**Interpretation:** Must complete in order from top to bottom.

**Parallel Work:**
```
  Architecture Design
       ↙    ↘
  Frontend  Backend
       ↘    ↙
   Integration
```
**Interpretation:** Frontend and Backend can work in parallel after Architecture is done.

**Complex Web:**
```
     Planning
    ↙   ↓   ↘
  UI  Logic  DB
   ↘   ↓   ↙
  Integration
       ↓
    Testing
```
**Interpretation:** Multiple dependencies converge at Integration.

---

## 🎯 Story Grouping

### How Stories Appear

Tasks assigned to the same story are:
1. **Visually grouped** with a dashed border container
2. **Labeled** with the story title at the top
3. **Color-coded** with a consistent story color
4. **Background tinted** with the story color (8% opacity)

### Multi-Story Tasks

If a task belongs to **multiple stories**:
- It appears in **all relevant story groups**
- Each story container includes the task
- The task maintains the same visual appearance

### Tasks Without Stories

Tasks not assigned to any story:
- Appear **outside story containers**
- Still show dependencies correctly
- Can be connected to story-grouped tasks

---

## 📊 Legend

At the bottom of the graph:

### States Section
Shows quick reference for task state colors:
- **Finished** - Green chip
- **Doing** - Amber chip
- **Scheduled** - Blue chip
- **Filed** - Gray chip
- (And others as needed)

### Grouping Info
- "Dashed boxes represent user stories"
- Explains the story container visual

### Symbols
- **★ = Current Task** - The task you opened the graph from
- **Arrows: Dependency Flow** - Direction of dependencies

---

## 🔍 Use Cases & Examples

### Use Case 1: Sprint Planning

**Scenario:** You need to plan the order of tasks for a sprint.

**Steps:**
1. Open dependency graph for any sprint task
2. Identify Level 0 tasks (no dependencies)
3. These can start immediately
4. Work down the levels in order
5. Identify parallel work opportunities

**Benefit:** Clear execution order, optimal parallelization

---

### Use Case 2: Identifying Bottlenecks

**Scenario:** Project is delayed, need to find the blocker.

**Steps:**
1. Open graph for a delayed task
2. Look for tasks with many outgoing arrows
3. These are bottleneck tasks
4. Prioritize or parallelize these critical tasks
5. Monitor progress via state colors

**Benefit:** Quickly spot and resolve blocking tasks

---

### Use Case 3: Story Progress Visualization

**Scenario:** Track progress across multiple related stories.

**Steps:**
1. Open graph for a task within story ecosystem
2. See all story groups at once
3. Check state colors within each story
4. Identify stories that are on track (more green)
5. Find stories needing attention (more gray/amber)

**Benefit:** Cross-story progress visibility

---

### Use Case 4: New Team Member Onboarding

**Scenario:** Help new developer understand project structure.

**Steps:**
1. Open graph for main feature task
2. Show how tasks relate to each other
3. Explain story groupings
4. Demonstrate dependency flow
5. Use colors to explain states

**Benefit:** Quick visual project overview

---

## ⚡ Performance Tips

### For Large Graphs (50+ Tasks)

1. **Use zoom controls** - Focus on relevant sections
2. **Filter by story** - View one story at a time
3. **Close and reopen** - Refresh the layout if needed
4. **Use fullscreen** - Maximize screen real estate

### Optimal Viewing

- **Screen size:** 1920x1080 or larger recommended
- **Browser zoom:** 100% (system level)
- **Window size:** Maximize dialog for best experience
- **Color scheme:** Dark mode friendly

---

## 🎨 Design Philosophy

### Clean & Minimalistic

- **Rounded corners** (12px) for modern feel
- **Subtle shadows** for depth
- **Grid background** for context
- **Generous whitespace** for clarity
- **Limited color palette** for focus

### Accessibility

- **High contrast** text on colored backgrounds
- **WCAG AAA compliant** colors
- **Clear labels** on all elements
- **Tooltips** for interactive elements
- **Keyboard accessible** (via zoom buttons)

### Consistent with App

- Matches **Material-UI** design system
- Uses **app theme** colors
- Same **animation timings** as rest of app
- **Familiar interaction patterns**

---

## 🔧 Troubleshooting

### Graph is Empty

**Issue:** No nodes appear in the graph.

**Causes:**
- Task has no dependencies (prerequisite or dependent tasks)
- Data hasn't loaded yet

**Solutions:**
- Check if task has relationships defined
- Wait for loading indicator to complete
- Add dependencies to see the graph

---

### Graph is Too Large

**Issue:** Cannot see all tasks at once.

**Solutions:**
- Use **zoom out** button
- **Scroll** to navigate different areas
- **Filter tasks** to reduce scope
- Use **fullscreen** mode

---

### Tasks Overlap

**Issue:** Nodes appear overlapping or cluttered.

**Causes:**
- Many tasks at same level
- Very wide graph

**Solutions:**
- **Zoom out** to see full picture
- **Scroll** to view different sections
- This is normal for complex dependencies
- Layout is optimized for clarity

---

### Story Colors Confusing

**Issue:** Similar story colors are hard to distinguish.

**Note:** This is intentional - 6 rotating colors provide variety while maintaining consistency.

**Solutions:**
- Refer to **story labels** above each group
- Use **legend** at bottom for reference
- Colors repeat after 6 stories (normal behavior)

---

### Performance Issues

**Issue:** Graph is slow to render or interact with.

**Causes:**
- Very large number of tasks (100+)
- Complex dependency web
- System resources

**Solutions:**
- **Close other apps** to free memory
- **Filter dependencies** to specific stories
- **Restart the app** if needed
- Consider breaking into smaller stories

---

## 📱 Responsive Behavior

### Large Screens (1920x1080+)
- **Full visualization** visible at once
- **Comfortable zoom** levels
- **Clear node spacing**
- **Optimal experience**

### Medium Screens (1366x768)
- **Zoom controls essential** for navigation
- **Scrolling required** for large graphs
- **Still fully functional**

### Small Screens (<1280x720)
- **Zoom out recommended** initially
- **More scrolling needed**
- **Consider using fullscreen**

---

## 🎓 Best Practices

### 1. Keep Dependency Chains Reasonable
- ✅ **Do:** Create logical, necessary dependencies
- ❌ **Don't:** Create overly complex webs
- **Why:** Simpler graphs are easier to understand and maintain

### 2. Use Stories for Grouping
- ✅ **Do:** Organize related tasks into stories
- ❌ **Don't:** Create random task groups
- **Why:** Story grouping makes the graph much more readable

### 3. Review Regularly
- ✅ **Do:** Check dependency graph during planning
- ❌ **Don't:** Only look at it once
- **Why:** Dependencies change as project evolves

### 4. Use for Communication
- ✅ **Do:** Share graph views in team meetings
- ❌ **Don't:** Keep dependency knowledge siloed
- **Why:** Visual communication is clearer than text

### 5. Maintain Current States
- ✅ **Do:** Update task states as work progresses
- ❌ **Don't:** Let states become stale
- **Why:** Color coding only helps if it's accurate

---

## 🆕 Future Enhancements (Roadmap)

Potential future additions:

- [ ] **Export graph** as PNG/SVG
- [ ] **Highlight critical path** in the graph
- [ ] **Task preview on hover** showing full details
- [ ] **Minimap** for large graphs
- [ ] **Filter by state** directly in graph
- [ ] **Collapsible story groups**
- [ ] **Different layout algorithms** (force-directed, etc.)
- [ ] **Timeline view** showing dependencies over time

---

## 📚 Related Documentation

- **[TASK_RELATIONSHIPS_README.md](./TASK_RELATIONSHIPS_README.md)** - How to create dependencies
- **[TASK_FEATURE_README.md](./TASK_FEATURE_README.md)** - General task management
- **[TASK_STATE_RULES_ENGINE.md](./TASK_STATE_RULES_ENGINE.md)** - State color meanings
- **[DEVELOPER.md](./DEVELOPER.md)** - Technical implementation details

---

## ❓ FAQ

**Q: Why isn't my task showing in the graph?**  
A: The graph only shows tasks with dependencies. If a task has no prerequisites and no dependents, it won't appear in the graph.

**Q: Can I edit tasks from the graph?**  
A: No, the graph is read-only. Use the task details page to edit tasks.

**Q: How are story colors chosen?**  
A: Colors are assigned consistently based on story ID using a hash function. The same story always gets the same color.

**Q: What if a task is in multiple stories?**  
A: The task will appear in multiple story containers in the graph.

**Q: Can I rearrange nodes manually?**  
A: No, the layout is automatic based on dependency relationships. Manual arrangement is not currently supported.

**Q: Why are some arrows longer than others?**  
A: Arrow length depends on the vertical distance between levels. Tasks further apart in the dependency chain have longer arrows.

---

## 💬 Feedback

Have suggestions for the dependency graph?

- **Feature requests:** [Open an issue](https://github.com/empyrean-sama/program-planner/issues)
- **Bug reports:** [Report here](https://github.com/empyrean-sama/program-planner/issues)
- **General feedback:** Email sriveer.neerukonda@outlook.com

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅

---

[← Back to Documentation Index](./INDEX.md) | [View Technical Docs](./DEVELOPER.md)
