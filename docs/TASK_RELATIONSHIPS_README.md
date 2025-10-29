# Task Relationships and Dependency Graph

## Overview

Tasks can now be linked to each other using **predecessor** and **successor** relationships, forming a Directed Acyclic Graph (DAG). This allows you to visualize dependencies and understand what tasks need to be completed before achieving a specific goal.

## Features

### 1. Task Relationships

#### Relationship Types

- **Predecessor**: A task that must be completed before the current task can start
- **Successor**: A task that depends on the current task being completed

Relationships are **bidirectional** - when you add a predecessor to Task A, Task A is automatically added as a successor to the predecessor task.

#### Managing Relationships

In the task details view (either page or dialog), you'll find a "Task Relationships" section with:

- **Predecessors Table**: Lists all tasks that must be completed before this one
- **Successors Table**: Lists all tasks that depend on this one
- **Add Relationship Button**: Opens a dialog to add a new relationship
- **View Graph Button**: Opens the dependency graph visualization (enabled when task has predecessors)

#### Adding a Relationship

1. Click "Add Relationship" button
2. Select relationship type (Predecessor or Successor)
3. Search and select the related task
4. Click "Add"

The system will prevent:
- Duplicate relationships
- Circular dependencies (maintains DAG property)
- Relationships with final state tasks (Finished, Failed, Removed, Deferred)

#### Removing a Relationship

Click the delete icon next to any relationship in the tables. Both the relationship and its reciprocal will be removed.

### 2. Dependency Graph Visualization

The dependency graph shows a **visual representation** of all tasks that must be completed to achieve a specific goal.

#### Features

- **Automatic Layout**: Tasks are arranged in levels based on their dependency depth
- **Color Coding**: 
  - Blue (Bold border): Target task
  - Green: Finished tasks
  - Orange: Tasks in progress (Doing)
  - Light Blue: Scheduled tasks
  - Gray: Filed tasks
- **Arrows**: Point from prerequisite tasks to dependent tasks
- **Task Information**: Each node shows title, state, and points

#### Opening the Graph

1. Navigate to a task's details page
2. Click "View Graph" button in the Task Relationships section
3. The graph will display all predecessors recursively

#### Interpreting the Graph

- **Bottom Level**: Tasks with no prerequisites (can start immediately)
- **Middle Levels**: Tasks dependent on lower-level tasks
- **Top Level**: Your target task

The graph shows the complete path of dependencies, helping you understand:
- What needs to be done first
- The order of task execution
- Which tasks are blocking others

### 3. DAG (Directed Acyclic Graph) Validation

The system enforces DAG properties:

- **Directed**: Relationships have a direction (predecessor → successor)
- **Acyclic**: No circular dependencies allowed

When you try to add a relationship that would create a cycle, the system will show an error:
```
Cannot add relationship: would create a cycle in the task graph
```

This ensures you can always determine a valid execution order for your tasks.

## Technical Details

### Data Structure

Each task now has a `relationships` array:

```typescript
interface TaskRelationship {
    id: string;                          // UUID of the relationship
    type: 'predecessor' | 'successor';   // Relationship type
    relatedTaskId: string;               // UUID of the related task
    createdAt: string;                   // ISO 8601 timestamp
}
```

### API Methods

New IPC methods available:

- `window.taskAPI.addRelationship(input)`: Add a relationship
- `window.taskAPI.removeRelationship(input)`: Remove a relationship
- `window.taskAPI.getDependencyGraph(taskId)`: Get full dependency graph

### Graph Algorithm

The dependency graph uses:
- **BFS (Breadth-First Search)** for level assignment
- **Topological ordering** to ensure valid task execution order
- **Cycle detection** using depth-first path traversal

## Use Cases

### Project Planning

Break down large projects into dependent tasks:
```
Project Completion
  ↑
  ├─ Testing Phase
  │    ↑
  │    └─ Development Phase
  │         ↑
  │         └─ Design Phase
  │              ↑
  │              └─ Requirements Gathering
```

### Learning Paths

Create prerequisite chains for learning:
```
Advanced Algorithm Design
  ↑
  ├─ Data Structures
  │    ↑
  │    └─ Programming Basics
  └─ Discrete Mathematics
       ↑
       └─ Basic Mathematics
```

### Sequential Workflows

Define clear execution order for workflows:
```
Deploy to Production
  ↑
  ├─ Code Review
  │    ↑
  │    └─ Write Tests
  │         ↑
  │         └─ Implement Feature
  └─ Update Documentation
       ↑
       └─ Implement Feature
```

## Migration

Existing tasks will automatically have an empty `relationships` array added when the app loads. No data loss will occur.

## Limitations

- Only active tasks (not in final states) can be linked
- Maximum graph depth is limited by stack size (practically unlimited for reasonable use)
- Graph visualization works best with up to ~20-30 related tasks for readability

## Future Enhancements

Potential future features:
- Critical path highlighting
- Automatic scheduling based on dependencies
- Progress calculation through dependency chain
- Gantt chart view
- Parallel execution path identification
