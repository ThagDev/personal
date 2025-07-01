# 🚀 Git Workflow Guide - Hướng dẫn Git từ A-Z

> **Tác giả**: GitHub Copilot Assistant  
> **Ngày tạo**: 01/07/2025  
> **Mục đích**: Hướng dẫn toàn diện về Git workflow cho dự án NestJS

---

## 📋 **Mục lục**
1. [Kiểm tra trạng thái](#1-kiểm-tra-trạng-thái)
2. [Quy trình commit cơ bản](#2-quy-trình-commit-cơ-bản)
3. [Xử lý conflicts và merge](#3-xử-lý-conflicts-và-merge)
4. [Branching strategy](#4-branching-strategy)
5. [Push và Pull](#5-push-và-pull)
6. [Emergency commands](#6-emergency-commands)
7. [Best practices](#7-best-practices)

---

## 1. 📊 **Kiểm tra trạng thái**

### Các lệnh kiểm tra cơ bản:
```bash
# Kiểm tra trạng thái hiện tại
git status

# Xem lịch sử commit
git log --oneline -10

# Xem thay đổi chưa được staged
git diff

# Xem thay đổi đã được staged
git diff --cached

# Kiểm tra remote repositories
git remote -v

# Kiểm tra branch hiện tại và các branch khác
git branch -a
```

### Kiểm tra trước khi làm việc:
```bash
# Luôn kiểm tra trước khi bắt đầu
git status
git log --oneline -5
git branch
```

---

## 2. 🔄 **Quy trình commit cơ bản**

### Workflow chuẩn:
```bash
# 1. Kiểm tra trạng thái
git status

# 2. Xem thay đổi (optional)
git diff

# 3. Add files cụ thể
git add src/modules/auth/auth.service.ts
git add src/modules/users/users.controller.ts

# Hoặc add tất cả
git add .

# 4. Commit với message rõ ràng
git commit -m "feat: Add JWT authentication service

- Implement JWT token generation and validation
- Add user authentication middleware
- Update auth controller with login/logout endpoints
- Add proper error handling for invalid tokens"

# 5. Push lên remote
git push origin branch-name
```

### Template commit message:
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `refactor`: Refactor code
- `perf`: Cải thiện performance
- `docs`: Cập nhật documentation
- `test`: Thêm/sửa tests
- `chore`: Công việc maintenance

### Ví dụ commit message tốt:
```bash
git commit -m "feat: Implement file upload with validation

- Add multer configuration for file handling
- Implement file type and size validation
- Add GridFS integration for large file storage
- Create upload endpoints with proper error handling
- Add comprehensive file upload tests

Closes #123"
```

---

## 3. 🔀 **Xử lý conflicts và merge**

### Khi có conflicts:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Nếu có conflict, Git sẽ báo
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt

# 3. Mở file và sửa conflicts (tìm <<<<<<< ======= >>>>>>>)

# 4. Sau khi sửa xong
git add .
git commit -m "resolve: Fix merge conflicts in auth module"

# 5. Push
git push origin branch-name
```

### Merge branch:
```bash
# Checkout về branch chính
git checkout main

# Pull latest
git pull origin main

# Merge feature branch
git merge feature/authentication

# Push merged changes
git push origin main
```

---

## 4. 🌿 **Branching strategy**

### Tạo và làm việc với branches:
```bash
# Tạo branch mới từ main
git checkout main
git pull origin main
git checkout -b feature/user-management

# Hoặc tạo từ branch hiện tại
git checkout -b hotfix/fix-login-bug

# Đổi branch
git checkout main
git checkout feature/user-management

# Xóa branch (sau khi merge)
git branch -d feature/user-management

# Xóa branch trên remote
git push origin --delete feature/user-management
```

### Git Flow chuẩn:
```
main (production)
  ├── develop (development)
      ├── feature/auth-system
      ├── feature/file-upload
      └── hotfix/security-patch
```

---

## 5. 📤 **Push và Pull**

### Push code:
```bash
# Push branch hiện tại
git push origin branch-name

# Push và set upstream (lần đầu)
git push -u origin feature/new-feature

# Push tất cả branches
git push --all origin

# Force push (cẩn thận!)
git push --force origin branch-name
```

### Pull code:
```bash
# Pull branch hiện tại
git pull origin branch-name

# Pull và rebase
git pull --rebase origin main

# Fetch tất cả thông tin
git fetch --all

# Pull từ upstream
git pull upstream main
```

### Sync với remote:
```bash
# Cập nhật thông tin remote
git fetch origin

# Xem sự khác biệt
git log HEAD..origin/main --oneline

# Pull nếu cần
git pull origin main
```

---

## 6. 🚨 **Emergency commands**

### Undo commits:
```bash
# Undo commit cuối (giữ changes)
git reset --soft HEAD~1

# Undo commit cuối (xóa changes)
git reset --hard HEAD~1

# Undo nhiều commits
git reset --hard HEAD~3

# Revert commit (tạo commit mới)
git revert HEAD
git revert commit-hash
```

### Stash (tạm lưu changes):
```bash
# Lưu changes tạm thời
git stash

# Lưu với message
git stash push -m "WIP: working on auth feature"

# Xem danh sách stash
git stash list

# Apply stash
git stash apply
git stash apply stash@{1}

# Apply và xóa stash
git stash pop

# Xóa stash
git stash drop stash@{0}
```

### Recovery:
```bash
# Tìm lost commits
git reflog

# Khôi phục từ reflog
git checkout commit-hash
git cherry-pick commit-hash

# Reset về commit cụ thể
git reset --hard commit-hash
```

---

## 7. ✨ **Best Practices**

### Trước khi commit:
```bash
# 1. Kiểm tra trạng thái
git status

# 2. Review changes
git diff

# 3. Build và test
npm run build
npm run test

# 4. Commit nếu OK
git add .
git commit -m "descriptive message"
```

### Trước khi push:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Resolve conflicts nếu có

# 3. Test lại
npm run build

# 4. Push
git push origin branch-name
```

### Daily workflow:
```bash
# Morning routine
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main  # hoặc rebase

# Khi làm việc
git add .
git commit -m "wip: implement user validation"

# End of day
git push origin feature/my-feature
```

---

## 8. 🛠️ **Troubleshooting**

### Lỗi thường gặp:

#### "Your branch is ahead of origin by X commits"
```bash
# Push commits lên remote
git push origin branch-name
```

#### "Please commit your changes or stash them"
```bash
# Option 1: Commit changes
git add .
git commit -m "save current work"

# Option 2: Stash changes
git stash
# ... do something ...
git stash pop
```

#### "Merge conflict"
```bash
# 1. Mở file có conflict
# 2. Tìm và sửa <<<<<<< ======= >>>>>>>
# 3. Save file
# 4. Add và commit
git add .
git commit -m "resolve merge conflicts"
```

#### "Permission denied (publickey)"
```bash
# Kiểm tra SSH key
ssh -T git@github.com

# Tạo SSH key mới nếu cần
ssh-keygen -t ed25519 -C "your_email@example.com"
```

---

## 9. 📊 **Useful aliases**

Thêm vào `.gitconfig`:
```bash
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit
    pl = pull
    ps = push
    lg = log --oneline --graph --decorate --all
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
```

Sử dụng:
```bash
git st          # thay vì git status
git co main     # thay vì git checkout main
git cm -m "msg" # thay vì git commit -m "msg"
git lg          # đẹp hơn git log
```

---

## 10. 🔍 **Kiểm tra trước khi deploy**

### Checklist production:
```bash
# 1. Đảm bảo trên branch đúng
git branch

# 2. Pull latest
git pull origin main

# 3. Kiểm tra clean working directory
git status

# 4. Build thành công
npm run build

# 5. Test pass
npm run test

# 6. Check dependencies
npm audit

# 7. Tag version nếu cần
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

---

## 📞 **Liên hệ và hỗ trợ**

Nếu gặp vấn đề với Git:
1. Đọc lại guide này
2. Tìm trên Google: "git [vấn đề] stackoverflow"
3. Kiểm tra `git help <command>`
4. Hỏi team hoặc GitHub Copilot

---

**🎉 Happy coding with Git!**

> **Lưu ý**: Luôn backup code quan trọng và cẩn thận với `--force` commands!
