# Migration Guide

**Program Planner - Upgrading to v1.0**

This guide helps you upgrade from pre-release versions to v1.0.0.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Migration Checklist](#pre-migration-checklist)
- [Data Backup](#data-backup)
- [Version-Specific Migrations](#version-specific-migrations)
- [Post-Migration Verification](#post-migration-verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Instructions](#rollback-instructions)

---

## Overview

### Who Needs This Guide?

If you're running **any version before 1.0.0**, this guide is for you.

### What Changed in v1.0?

**Data Structure:**
- ✅ Task-Story relationships (many-to-many)
- ✅ Enhanced task dependency structure
- ✅ Calendar schedule entries
- ✅ Task state validation rules

**Features:**
- 🆕 Dependency graph visualization
- 🆕 Story-based burndown charts
- 🆕 Enhanced metrics dashboard
- 🆕 Context menu system

**Performance:**
- ⚡ React 19 upgrade
- ⚡ Optimized rendering
- ⚡ Improved state management

---

## Pre-Migration Checklist

Before upgrading, complete these steps:

### ✅ Step 1: Check Current Version

1. Open Program Planner
2. Go to **Settings** → **About**
3. Note your current version number

### ✅ Step 2: Read Release Notes

Review the [V1_RELEASE_NOTES.md](./V1_RELEASE_NOTES.md) to understand new features.

### ✅ Step 3: Export Your Data

**Important:** Always backup before upgrading!

See [Data Backup](#data-backup) section below.

### ✅ Step 4: Close Program Planner

Ensure the application is completely closed before upgrading.

---

## Data Backup

### Automatic Backup (Recommended)

The application automatically backs up data before migrations, but manual backup is recommended.

### Manual Backup

#### Windows

```powershell
# Find your data directory
cd %APPDATA%\program-planner

# Create backup
xcopy data data-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2% /E /I
```

**Default location:**
```
C:\Users\[YourName]\AppData\Roaming\program-planner\data\
```

#### macOS

```bash
# Find your data directory
cd ~/Library/Application\ Support/program-planner

# Create backup
cp -r data data-backup-$(date +%Y%m%d)
```

**Default location:**
```
~/Library/Application Support/program-planner/data/
```

#### Linux

```bash
# Find your data directory
cd ~/.config/program-planner

# Create backup
cp -r data data-backup-$(date +%Y%m%d)
```

**Default location:**
```
~/.config/program-planner/data/
```

### What to Backup

These files contain all your data:
- `tasks.json` - All tasks
- `stories.json` - All stories (if exists)
- `settings.json` - User preferences (if exists)

---

## Version-Specific Migrations

### Upgrading from 0.x to 1.0

#### Task-Story Relationship Changes

**Before (0.x):**
```json
{
  "id": "task-1",
  "storyId": "story-abc"
}
```

**After (1.0):**
```json
{
  "id": "task-1",
  "storyIds": ["story-abc", "story-xyz"]
}
```

**Action Required:** ✅ Automatic migration on first launch

#### Task Dependency Structure

**Before (0.x):**
```json
{
  "id": "task-1",
  "dependencies": ["task-2"]
}
```

**After (1.0):**
```json
{
  "id": "task-1",
  "prerequisites": ["task-2"],
  "dependents": ["task-3"]
}
```

**Action Required:** ✅ Automatic migration on first launch

#### New Task States

**Before (0.x):**
- Todo
- InProgress
- Done

**After (1.0):**
- Filed
- Scheduled
- Doing
- Finished

**Action Required:** ✅ Automatic mapping on first launch

State mapping:
- `Todo` → `Filed`
- `InProgress` → `Doing`
- `Done` → `Finished`

---

## Installation & Upgrade

### Windows

1. Download `program-planner-setup-1.0.0.exe`
2. Run the installer
3. Choose **"Upgrade"** when prompted
4. Launch the new version

The installer will:
- Preserve your data
- Update the application
- Run automatic migrations

### macOS

1. Download `program-planner-1.0.0.dmg`
2. Open the DMG file
3. Drag to Applications (replace old version)
4. Launch from Applications

### Linux

**Debian/Ubuntu:**
```bash
sudo dpkg -i program-planner_1.0.0_amd64.deb
```

**Red Hat/Fedora:**
```bash
sudo rpm -Uvh program-planner-1.0.0.x86_64.rpm
```

---

## Post-Migration Verification

### After First Launch

The application will:
1. Detect old data format
2. Create backup (automatic)
3. Run migrations
4. Show migration summary

### Verification Steps

#### ✅ Check Your Tasks

1. Go to **Tasks** page
2. Verify all tasks are present
3. Check task details (priority, deadlines, descriptions)

#### ✅ Check Stories

1. Go to **Stories** page
2. Verify all stories exist
3. Open a story
4. Check task associations

#### ✅ Check Calendar

1. Go to **Calendar** page
2. Verify scheduled tasks appear
3. Check schedule times are correct

#### ✅ Check Dependencies

1. Open a task with dependencies
2. Go to **Relationships** tab
3. Click **"View Dependency Graph"**
4. Verify connections are correct

#### ✅ Test New Features

1. Try creating a new task
2. Test drag-and-drop scheduling
3. Explore the dependency graph
4. View metrics dashboard

---

## Troubleshooting

### Migration Failed

**Symptom:** Error message on launch

**Solution:**
1. Close the application
2. Restore your backup (see [Rollback](#rollback-instructions))
3. Try again
4. If issue persists, see [Support](#getting-help)

### Missing Tasks

**Symptom:** Some tasks don't appear

**Solution:**
1. Check filter settings (top of Tasks page)
2. Clear all filters
3. Search for task by name
4. If still missing, restore backup

### Wrong Task States

**Symptom:** Tasks in unexpected states

**Solution:**
States are automatically mapped:
- Check if mapping is correct
- Manually update states if needed
- Filed = not yet scheduled
- Scheduled = has calendar entry
- Doing = currently working
- Finished = completed

### Dependency Graph Not Working

**Symptom:** Graph doesn't show or crashes

**Solution:**
1. Open browser console (Ctrl+Shift+I)
2. Look for errors
3. Try a different task
4. Clear application cache
5. Reinstall if needed

### Slow Performance

**Symptom:** Application feels slow

**Solution:**
1. Close and restart application
2. Check system resources
3. Clear browser cache
4. Reduce number of visible tasks (use filters)

---

## Rollback Instructions

If you need to revert to your previous version:

### Windows

1. Uninstall v1.0:
   - Settings → Apps → Program Planner → Uninstall
2. Restore data backup:
   ```powershell
   cd %APPDATA%\program-planner
   rmdir data /s /q
   xcopy data-backup data /E /I
   ```
3. Reinstall previous version

### macOS

1. Delete v1.0:
   ```bash
   rm -rf /Applications/Program\ Planner.app
   ```
2. Restore data backup:
   ```bash
   cd ~/Library/Application\ Support/program-planner
   rm -rf data
   cp -r data-backup data
   ```
3. Reinstall previous version

### Linux

1. Uninstall v1.0:
   ```bash
   sudo dpkg -r program-planner  # Debian/Ubuntu
   sudo rpm -e program-planner    # Red Hat/Fedora
   ```
2. Restore data backup:
   ```bash
   cd ~/.config/program-planner
   rm -rf data
   cp -r data-backup data
   ```
3. Reinstall previous version

---

## Data Location Reference

Quick reference for finding your data:

| Platform | Default Data Location |
|----------|----------------------|
| **Windows** | `C:\Users\[User]\AppData\Roaming\program-planner\data` |
| **macOS** | `~/Library/Application Support/program-planner/data` |
| **Linux** | `~/.config/program-planner/data` |

---

## Getting Help

### Resources

- 📖 [Full Documentation](./INDEX.md)
- 🆕 [Release Notes](./V1_RELEASE_NOTES.md)
- ⚡ [Quick Start Guide](../QUICK_START.md)
- 🐛 [GitHub Issues](https://github.com/empyrean-sama/program-planner/issues)

### Before Asking for Help

Include this information:
1. Your operating system
2. Previous version number
3. Error messages (if any)
4. Steps you've already tried
5. Backup availability

### Community Support

- GitHub Discussions (coming soon)
- Issue Tracker: Report bugs and problems

---

## Best Practices

### For Future Upgrades

1. **Always backup before upgrading**
2. **Read release notes first**
3. **Test on a copy if possible**
4. **Keep one backup version**
5. **Document any manual changes**

### Data Management

- Regular backups (weekly recommended)
- Keep backups in a separate location
- Test restore process occasionally
- Export important data periodically

---

## FAQ

**Q: Will I lose my data during upgrade?**  
A: No, data is preserved. Automatic backups are created.

**Q: How long does migration take?**  
A: Usually instant. Large datasets (1000+ tasks) may take a few seconds.

**Q: Can I use both versions?**  
A: Not recommended. They may conflict over data files.

**Q: What if migration fails?**  
A: Restore your backup and contact support.

**Q: Do I need to reconfigure settings?**  
A: No, settings are preserved.

**Q: Will my calendar schedules transfer?**  
A: Yes, all schedules are migrated automatically.

---

## Changes Summary

### Key Improvements in v1.0

✅ **Many-to-many task-story relationships**  
Tasks can belong to multiple stories now.

✅ **Enhanced dependency system**  
Better prerequisite and dependent tracking.

✅ **New state model**  
More intuitive Filed → Scheduled → Doing → Finished flow.

✅ **Dependency graph visualization**  
See task relationships visually.

✅ **Performance optimizations**  
React 19 and rendering improvements.

---

## Version History

| Version | Release Date | Migration Required |
|---------|-------------|-------------------|
| **1.0.0** | October 2025 | ✅ Automatic |
| 0.9.x | - | - |
| 0.8.x | - | - |

---

## Final Checklist

Before considering migration complete:

- [ ] Backup created
- [ ] v1.0 installed
- [ ] First launch successful
- [ ] All tasks present
- [ ] All stories present
- [ ] Calendar schedules intact
- [ ] Dependencies correct
- [ ] New features explored
- [ ] Performance acceptable
- [ ] No error messages

---

**Happy Upgrading! 🚀**

If you encounter any issues, don't hesitate to reach out for support.

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0

[← Back to Documentation](./INDEX.md) | [Release Notes](./V1_RELEASE_NOTES.md) | [Quick Start](../QUICK_START.md)
