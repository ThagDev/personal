# 🚀 Git Quick Reference - Cheat Sheet

## 📋 **Commands thường dùng hàng ngày**

### Kiểm tra trạng thái
```bash
git status                    # Trạng thái hiện tại
git log --oneline -5         # 5 commit gần nhất
git diff                     # Xem thay đổi
git branch                   # Xem branches
```

### Commit workflow
```bash
git add .                    # Add tất cả
git add file.ts              # Add file cụ thể
git commit -m "message"      # Commit với message
git push origin branch       # Push lên remote
```

### Branch operations
```bash
git checkout -b new-branch   # Tạo branch mới
git checkout main            # Chuyển branch
git merge feature-branch     # Merge branch
git branch -d old-branch     # Xóa branch
```

### Sync với remote
```bash
git pull origin main         # Pull từ remote
git fetch origin            # Fetch thông tin
git push origin branch      # Push code
```

### Emergency fixes
```bash
git stash                   # Lưu tạm changes
git stash pop              # Khôi phục stash
git reset --soft HEAD~1    # Undo commit (giữ code)
git reset --hard HEAD~1    # Undo commit (xóa code)
```

## 🎯 **Workflow chuẩn mỗi ngày**

```bash
# 1. Bắt đầu ngày
git status
git pull origin main

# 2. Tạo feature branch
git checkout -b feature/new-feature

# 3. Code và commit
git add .
git commit -m "feat: implement new feature"

# 4. Push code
git push origin feature/new-feature

# 5. Kết thúc (merge)
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

## ⚠️ **Lưu ý quan trọng**

- **Luôn `git status` trước khi làm gì**
- **`git pull` trước khi push**
- **Build test trước khi commit**
- **Không force push trên main branch**
- **Backup code quan trọng**

## 🔧 **Khắc phục lỗi thường gặp**

```bash
# Ahead of origin by X commits
git push origin branch-name

# Merge conflicts
# 1. Sửa file conflicts (<<<< ==== >>>>)
# 2. git add .
# 3. git commit -m "resolve conflicts"

# Uncommitted changes
git stash              # Lưu tạm
# hoặc
git add . && git commit -m "wip"

# Wrong branch
git stash
git checkout correct-branch
git stash pop
```

---
**💡 Tip**: Bookmark file này để tham khảo nhanh!
