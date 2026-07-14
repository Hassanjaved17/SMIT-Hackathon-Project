# MaintainIQ Setup & Deployment Guide

## Admin Account Setup

Your admin account has been created with the following credentials:

**Email:** `hassandeveloper341@gmail.com`
**Password:** `admin123`
**Role:** Administrator

You can now log in to the application with these credentials. The app is in demo mode using local browser storage.

---

## How to Sync Latest Changes from v0 to Your Local Computer

Follow these steps to pull the latest changes from this chat into your local repository:

### Step 1: Open Terminal/Command Prompt in Your Project Folder

```bash
cd path/to/your/SMIT-Hackathon-Project
```

### Step 2: Check Current Branch

```bash
git branch
```

You should see `kai-tracking-tool` branch listed or you should be on it.

### Step 3: Update Your Branch with Latest Changes

```bash
git pull origin kai-tracking-tool
```

This will download all the latest files and changes that were made in v0.

### Step 4: Install Any New Dependencies (if needed)

```bash
npm install
```

### Step 5: Run the Development Server

```bash
npm run dev
```

Your application should now be running with all the latest improvements.

---

## Understanding the Git Repository Structure

- **Main Branch:** `main` - The stable production code
- **Your Working Branch:** `kai-tracking-tool` - Contains all the improvements made in this chat
  - Edit asset functionality
  - Role-based UI enforcement
  - Preventive maintenance recommendations
  - Enhanced history tracking
  - IssueReceipt enhancements

---

## Changes Made in This Chat

All improvements are committed to the `kai-tracking-tool` branch. Here's what was added:

### 1. Asset Edit Functionality
- Admins can now edit asset details (name, category, location, condition)
- Navigate to any asset and click "Edit asset" button

### 2. Role-Based Access Control
- **Admins** can assign issues and mark assets out of service
- **Technicians** can only act on assigned issues
- UI automatically hides unauthorized actions

### 3. Preventive Maintenance Recommendations
- Automatically analyzes asset history
- Suggests maintenance based on category and service dates
- Shows on asset detail page with amber accent

### 4. Enhanced History Tracking
- All asset updates are now logged
- Public pages show formatted recent activity timeline
- Timestamps included for transparency

### 5. IssueReceipt Improvements
- Displays full maintenance records
- Shows technician notes, parts used, and costs
- Better formatting for printing

---

## GitHub Workflow

### View Changes on GitHub

Visit: https://github.com/Hassanjaved17/SMIT-Hackathon-Project

Go to the **kai-tracking-tool** branch to see all changes.

### To Create a Pull Request (Optional)

1. Go to GitHub repository
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select base: `main`, compare: `kai-tracking-tool`
5. Add title: "Hackathon improvements and enhancements"
6. Click "Create pull request"
7. Request review from team members

---

## Demo Login Credentials

In demo mode (when Supabase is not configured), use these credentials:

| Email | Password | Role |
|-------|----------|------|
| hassandeveloper341@gmail.com | admin123 | Admin |
| admin@maintainiq.app | admin123 | Admin |
| tech@maintainiq.app | tech123 | Technician |

---

## File Structure Overview

```
src/
├── components/
│   ├── EditAssetModal.tsx        (NEW - Asset editor)
│   ├── IssueReceipt.tsx          (UPDATED - Enhanced)
│   └── ...
├── pages/
│   ├── AssetDetail.tsx           (UPDATED - With recommendations)
│   ├── PublicAsset.tsx           (UPDATED - Better activity)
│   └── ...
├── lib/
│   ├── store.ts                  (UPDATED - Asset update function)
│   ├── aiTriage.ts               (UPDATED - New recommendations)
│   └── ...
└── context/
    └── AuthContext.tsx           (UPDATED - New admin user)
```

---

## Troubleshooting

### Changes not showing after git pull?

1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules` (or `rmdir /s node_modules` on Windows)
3. Reinstall: `npm install`
4. Restart dev server: `npm run dev`

### Git merge conflicts?

If you have local changes that conflict:

```bash
git status                    # See which files conflict
git checkout --theirs .       # Take our (v0) changes
npm install                   # Reinstall deps
npm run dev                   # Restart
```

### Port 5175 already in use?

```bash
# Find and kill the process on that port
# On Mac/Linux:
lsof -ti:5175 | xargs kill -9

# On Windows:
netstat -ano | findstr :5175
taskkill /PID <PID> /F
```

---

## Next Steps

1. ✅ Sync the latest code with `git pull origin kai-tracking-tool`
2. ✅ Test login with your admin credentials
3. ✅ Explore all the new features
4. ✅ When ready, merge to main or deploy to production

---

## Support

All improvements are documented in `IMPROVEMENTS.md` in the project root.
For any issues, check the console logs in your browser's developer tools.

**Happy tracking with MaintainIQ! 🚀**
