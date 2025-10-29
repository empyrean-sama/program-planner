# Program Planner Documentation

## 📚 Documentation Index

Welcome to the Program Planner documentation. This index helps you find the right documentation for your needs.

---

## Quick Start

- **New Developer?** Start with [DEVELOPER.md](./DEVELOPER.md)
- **Want to understand tasks?** Read [TASK_FEATURE_README.md](./TASK_FEATURE_README.md)
- **Using the calendar?** See [CALENDAR_TASK_INTEGRATION.md](./CALENDAR_TASK_INTEGRATION.md)

---

## Core Documentation

### [DEVELOPER.md](./DEVELOPER.md) - 🎯 Main Developer Guide
**Start here for complete project overview**

Contents:
- Project architecture and tech stack
- Setup and installation instructions
- Complete project structure
- Component documentation
- State management patterns
- Services and utilities guide
- Styling and theming
- Performance optimizations
- Error handling strategies
- Build and deployment
- Coding standards
- Troubleshooting guide

**Audience**: New developers, contributors, maintainers

---

## Feature Documentation

### [TASK_FEATURE_README.md](./TASK_FEATURE_README.md) - Task Management System
**Complete guide to the task management features**

Contents:
- Task properties and structure
- State machine and transitions
- CRUD operations
- Comments system
- Schedule entries
- Task dialogs and forms

**Audience**: Developers working on task features

---

### [TASK_FILTERING_README.md](./TASK_FILTERING_README.md) - Task Filtering & Search
**Advanced filtering and search capabilities**

Contents:
- Filter types and options
- Search functionality
- Sorting mechanisms
- Filter combinations
- Performance considerations
- UI components

**Audience**: Developers working on search/filter features

---

### [CALENDAR_TASK_INTEGRATION.md](./CALENDAR_TASK_INTEGRATION.md) - Calendar Integration
**How tasks integrate with the calendar system**

Contents:
- Calendar views (Month, Week, Day)
- Task scheduling
- Schedule entries
- Context menus
- Date/time selection
- Visual indicators

**Audience**: Developers working on calendar features

---

## Technical Documentation

### [TASK_STATE_RULES_ENGINE.md](./TASK_STATE_RULES_ENGINE.md) - State Rules Engine
**Business logic for task state transitions**

Contents:
- State machine definition
- Allowed transitions
- State validation rules
- Edge cases
- Error handling

**Audience**: Developers working on task states

---

### [TASK_CARD_RULES_ENGINE.md](./TASK_CARD_RULES_ENGINE.md) - Visual Rules Engine
**Rules for task card appearance and warnings**

Contents:
- Visual styling rules
- Warning conditions
- Color coding
- Border styles
- Warning messages
- Priority indicators

**Audience**: Developers working on task UI

---

### [TASK_CARD_RULES_QUICK_REFERENCE.md](./TASK_CARD_RULES_QUICK_REFERENCE.md) - Quick Reference
**Quick lookup for task card rules**

Contents:
- Warning types table
- Visual appearance table
- Quick examples

**Audience**: All developers (reference)

---

## Component-Specific Documentation

### Calendar Components

#### [CONTEXT_MENU_README.md](./src/components/Pages/Calendar/CONTEXT_MENU_README.md) - Context Menu System
**Right-click menus in calendar views**

Contents:
- Context menu architecture
- Command pattern
- Menu items and actions
- Context data structure
- Extensibility guide

**Audience**: Developers working on calendar interactions

---

## Code Organization

### Source Code Structure

\`\`\`
src/
├── components/     → React components (see DEVELOPER.md)
├── services/       → Business logic (see Technical Documentation)
├── utils/          → Utility functions (see DEVELOPER.md)
├── types/          → TypeScript types (see TASK_FEATURE_README.md)
├── hooks/          → Custom React hooks (see DEVELOPER.md)
└── context/        → React contexts (see DEVELOPER.md)
\`\`\`

---

## Documentation by Role

### For New Developers
1. Read [DEVELOPER.md](./DEVELOPER.md) - Complete overview
2. Set up development environment (see DEVELOPER.md § Getting Started)
3. Review [Project Structure](./DEVELOPER.md#project-structure)
4. Understand [Architecture](./DEVELOPER.md#architecture)
5. Review [Coding Standards](./DEVELOPER.md#coding-standards)

### For Feature Development
1. **Task Features**: [TASK_FEATURE_README.md](./TASK_FEATURE_README.md)
2. **Calendar Features**: [CALENDAR_TASK_INTEGRATION.md](./CALENDAR_TASK_INTEGRATION.md)
3. **Filtering**: [TASK_FILTERING_README.md](./TASK_FILTERING_README.md)
4. **Rules Engines**: [TASK_STATE_RULES_ENGINE.md](./TASK_STATE_RULES_ENGINE.md), [TASK_CARD_RULES_ENGINE.md](./TASK_CARD_RULES_ENGINE.md)

### For UI/UX Work
1. [Styling & Theming](./DEVELOPER.md#styling--theming)
2. [Task Card Rules](./TASK_CARD_RULES_ENGINE.md)
3. [Component Documentation](./DEVELOPER.md#component-documentation)
4. [Animation Utils](./DEVELOPER.md#animationsts)

### For Performance Optimization
1. [Performance Optimizations](./DEVELOPER.md#performance-optimizations)
2. [State Management](./DEVELOPER.md#state-management)
3. Review component patterns in DEVELOPER.md

### For Bug Fixing
1. [Troubleshooting](./DEVELOPER.md#troubleshooting)
2. [Error Handling](./DEVELOPER.md#error-handling)
3. Check relevant feature documentation

---

## Documentation Standards

### When to Update Documentation

- **Feature Addition**: Update relevant README and DEVELOPER.md
- **API Changes**: Update affected documentation
- **New Components**: Add to Component Documentation section
- **Bug Fixes**: Update Troubleshooting if notable
- **Architecture Changes**: Update Architecture section

### Documentation Format

- Use Markdown for all documentation
- Include code examples where applicable
- Keep table of contents updated
- Add visual diagrams for complex concepts
- Link between related documents

---

## Contributing to Documentation

1. Follow existing formatting style
2. Keep technical accuracy high
3. Include practical examples
4. Update this index when adding new docs
5. Review related docs for consistency

---

## Quick Reference

| Need | Documentation |
|------|---------------|
| Project setup | [DEVELOPER.md](./DEVELOPER.md#getting-started) |
| Architecture overview | [DEVELOPER.md](./DEVELOPER.md#architecture) |
| Component list | [DEVELOPER.md](./DEVELOPER.md#component-documentation) |
| Task structure | [TASK_FEATURE_README.md](./TASK_FEATURE_README.md) |
| State transitions | [TASK_STATE_RULES_ENGINE.md](./TASK_STATE_RULES_ENGINE.md) |
| Visual rules | [TASK_CARD_RULES_ENGINE.md](./TASK_CARD_RULES_ENGINE.md) |
| Calendar integration | [CALENDAR_TASK_INTEGRATION.md](./CALENDAR_TASK_INTEGRATION.md) |
| Filtering/Search | [TASK_FILTERING_README.md](./TASK_FILTERING_README.md) |
| Context menus | [CONTEXT_MENU_README.md](./src/components/Pages/Calendar/CONTEXT_MENU_README.md) |
| Coding standards | [DEVELOPER.md](./DEVELOPER.md#coding-standards) |
| Troubleshooting | [DEVELOPER.md](./DEVELOPER.md#troubleshooting) |

---

## External Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Day.js Documentation](https://day.js.org/)

---

**Maintained by**: [Your Team/Name]  
**Last Updated**: October 29, 2025  
**Version**: 1.0.0

---

## 📝 Need Help?

- **Can't find what you need?** Check [DEVELOPER.md](./DEVELOPER.md) - it's the most comprehensive guide
- **Found an error?** Please report it or submit a PR
- **Documentation unclear?** Open an issue with suggestions

**Happy coding! 🚀**
