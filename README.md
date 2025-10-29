# Program Planner Documentation

## 📚 Documentation Index

Welcome to the Program Planner documentation. All documentation is now centralized in the **[docs/](./docs/)** folder.

**👉 [Browse all documentation in docs/INDEX.md](./docs/INDEX.md)**

---

## Quick Start

- **New Developer?** Start with [docs/DEVELOPER.md](./docs/DEVELOPER.md)
- **Want to understand tasks?** Read [docs/TASK_FEATURE_README.md](./docs/TASK_FEATURE_README.md)
- **Using the calendar?** See [docs/CALENDAR_TASK_INTEGRATION.md](./docs/CALENDAR_TASK_INTEGRATION.md)

---

## Core Documentation

### [docs/DEVELOPER.md](./docs/DEVELOPER.md) - 🎯 Main Developer Guide
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

### [docs/TASK_FEATURE_README.md](./docs/TASK_FEATURE_README.md) - Task Management System
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

### [docs/TASK_FILTERING_README.md](./docs/TASK_FILTERING_README.md) - Task Filtering & Search
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

### [docs/CALENDAR_TASK_INTEGRATION.md](./docs/CALENDAR_TASK_INTEGRATION.md) - Calendar Integration
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

### [docs/TASK_STATE_RULES_ENGINE.md](./docs/TASK_STATE_RULES_ENGINE.md) - State Rules Engine
**Business logic for task state transitions**

Contents:
- State machine definition
- Allowed transitions
- State validation rules
- Edge cases
- Error handling

**Audience**: Developers working on task states

---

### [docs/TASK_CARD_RULES_ENGINE.md](./docs/TASK_CARD_RULES_ENGINE.md) - Visual Rules Engine
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

### [docs/TASK_CARD_RULES_QUICK_REFERENCE.md](./docs/TASK_CARD_RULES_QUICK_REFERENCE.md) - Quick Reference
**Quick lookup for task card rules**

Contents:
- Warning types table
- Visual appearance table
- Quick examples

**Audience**: All developers (reference)

---

## Component-Specific Documentation

### Calendar Components

#### [docs/CONTEXT_MENU_README.md](./docs/CONTEXT_MENU_README.md) - Context Menu System
**Right-click menus in calendar views**

Contents:
- Context menu architecture
- Command pattern
- Menu items and actions
- Context data structure
- Extensibility guide

**Audience**: Developers working on calendar interactions

---

## Refactoring Documentation

### [docs/REFACTORING_SUMMARY.md](./docs/REFACTORING_SUMMARY.md) - Recent Improvements
**Complete summary of October 2025 refactoring**

Contents:
- Performance optimizations
- Loading skeletons
- Animation system
- Z-index management
- Error handling
- Documentation improvements
- Migration guide

**Audience**: All developers

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
1. Read [docs/DEVELOPER.md](./docs/DEVELOPER.md) - Complete overview
2. Set up development environment (see docs/DEVELOPER.md § Getting Started)
3. Review [Project Structure](./docs/DEVELOPER.md#project-structure)
4. Understand [Architecture](./docs/DEVELOPER.md#architecture)
5. Review [Coding Standards](./docs/DEVELOPER.md#coding-standards)

### For Feature Development
1. **Task Features**: [docs/TASK_FEATURE_README.md](./docs/TASK_FEATURE_README.md)
2. **Calendar Features**: [docs/CALENDAR_TASK_INTEGRATION.md](./docs/CALENDAR_TASK_INTEGRATION.md)
3. **Filtering**: [docs/TASK_FILTERING_README.md](./docs/TASK_FILTERING_README.md)
4. **Rules Engines**: [docs/TASK_STATE_RULES_ENGINE.md](./docs/TASK_STATE_RULES_ENGINE.md), [docs/TASK_CARD_RULES_ENGINE.md](./docs/TASK_CARD_RULES_ENGINE.md)

### For UI/UX Work
1. [Styling & Theming](./docs/DEVELOPER.md#styling--theming)
2. [Task Card Rules](./docs/TASK_CARD_RULES_ENGINE.md)
3. [Component Documentation](./docs/DEVELOPER.md#component-documentation)
4. [Animation Utils](./docs/DEVELOPER.md#animationsts)

### For Performance Optimization
1. [Performance Optimizations](./docs/DEVELOPER.md#performance-optimizations)
2. [State Management](./docs/DEVELOPER.md#state-management)
3. Review component patterns in docs/DEVELOPER.md

### For Bug Fixing
1. [Troubleshooting](./docs/DEVELOPER.md#troubleshooting)
2. [Error Handling](./docs/DEVELOPER.md#error-handling)
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
| Project setup | [docs/DEVELOPER.md](./docs/DEVELOPER.md#getting-started) |
| Architecture overview | [docs/DEVELOPER.md](./docs/DEVELOPER.md#architecture) |
| Component list | [docs/DEVELOPER.md](./docs/DEVELOPER.md#component-documentation) |
| Task structure | [docs/TASK_FEATURE_README.md](./docs/TASK_FEATURE_README.md) |
| State transitions | [docs/TASK_STATE_RULES_ENGINE.md](./docs/TASK_STATE_RULES_ENGINE.md) |
| Visual rules | [docs/TASK_CARD_RULES_ENGINE.md](./docs/TASK_CARD_RULES_ENGINE.md) |
| Calendar integration | [docs/CALENDAR_TASK_INTEGRATION.md](./docs/CALENDAR_TASK_INTEGRATION.md) |
| Filtering/Search | [docs/TASK_FILTERING_README.md](./docs/TASK_FILTERING_README.md) |
| Context menus | [docs/CONTEXT_MENU_README.md](./docs/CONTEXT_MENU_README.md) |
| Coding standards | [docs/DEVELOPER.md](./docs/DEVELOPER.md#coding-standards) |
| Troubleshooting | [docs/DEVELOPER.md](./docs/DEVELOPER.md#troubleshooting) |
| Recent improvements | [docs/REFACTORING_SUMMARY.md](./docs/REFACTORING_SUMMARY.md) |

---

## External Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Day.js Documentation](https://day.js.org/)

---

**Maintained by**: Sriveer Neerukonda 
**Last Updated**: October 29, 2025  
**Version**: 1.0.0

---

## 📝 Need Help?

- **Can't find what you need?** Check [docs/DEVELOPER.md](./docs/DEVELOPER.md) - it's the most comprehensive guide
- **Found an error?** Please report it or submit a PR
- **Documentation unclear?** Open an issue with suggestions

**Happy coding! 🚀**
