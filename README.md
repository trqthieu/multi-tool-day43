# Bài Tập 2: Multi-Tool Security Pipeline

## 🎯 Mục Tiêu
Xây dựng security pipeline với 3 tools chạy tuần tự:
1. **Gitleaks:** Scan secrets (nhanh, < 30s)
2. **npm audit:** Scan dependencies (~1 min)
3. **Trivy:** Scan container (~2 min)

## 📋 Yêu Cầu
- [ ] 3 jobs chạy tuần tự: secrets → dependencies → container
- [ ] Container scan chỉ chạy nếu secrets + dependencies pass
- [ ] Mỗi job fail nếu phát hiện vulnerabilities/secrets
- [ ] Upload tất cả results lên GitHub Security

## 🏗️ Cấu Trúc Thư Mục

```
bai2-multi-tool-pipeline/
├── README.md                      # File này
├── .github/
│   └── workflows/
│       └── security-pipeline.yml  # TODO: Multi-tool pipeline
├── src/
│   ├── app.js                     # Sample app
│   └── config.js                  # Config với secrets (intentional)
├── package.json                   # Vulnerable dependencies
├── Dockerfile
└── .gitignore
```

## 🚨 Vulnerabilities Có Chủ Ý

**App này có CHỦ Ý chứa các issues để practice:**
1. **Secrets:** API key hardcoded trong `src/config.js`
2. **Dependencies:** Outdated packages với CVEs
3. **Container:** Base image cũ với vulnerabilities

**Flow mong đợi:**
```
secrets job → FAIL (detect API key)
             ↓
             Skip dependencies + container
             (save time)

After fixing secret:
secrets → PASS
        ↓
dependencies → FAIL (vulnerable deps)
             ↓
             Skip container

After fixing deps:
secrets → PASS
        ↓
dependencies → PASS
             ↓
container → FAIL (vulnerable base image)

After fixing all:
All jobs PASS ✅
```

## 🚀 Các Bước Thực Hiện

### Bước 1: Tạo Multi-Tool Workflow

File `.github/workflows/security-pipeline.yml`:

```yaml
name: Security Pipeline

on:
  push:
    branches: [main]
  pull_request:

jobs:
  # Job 1: Secret scanning (fastest)
  secrets:
    runs-on: ubuntu-latest
    steps:
      # TODO: Checkout với full history
      - uses: actions/checkout@v4
        # with:
        #   fetch-depth: 0    # Full history for secret detection

      # TODO: Run Gitleaks
      - name: Run Gitleaks
        # uses: gitleaks/gitleaks-action@v2
        # env:
        #   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # Job 2: Dependency scanning
  dependencies:
    # TODO: needs secrets job
    runs-on: ubuntu-latest
    steps:
      # TODO: Checkout code

      # TODO: Setup Node.js

      # TODO: Install dependencies
      - name: Install dependencies
        # run: npm ci

      # TODO: Run npm audit
      - name: Audit dependencies
        # run: npm audit --audit-level=high

  # Job 3: Container scanning
  container:
    # TODO: needs secrets AND dependencies jobs
    runs-on: ubuntu-latest
    steps:
      # TODO: Checkout code

      # TODO: Build Docker image

      # TODO: Scan with Trivy
      - name: Scan container
        # uses: aquasecurity/trivy-action@master
        # with:
        #   image-ref: myapp:test
        #   format: 'table'
        #   exit-code: '1'
        #   severity: 'CRITICAL,HIGH'

      # TODO: Upload SARIF results
```

### Bước 2: Understand Orchestration

```yaml
# Pattern 1: Linear dependency
jobs:
  job1:
    steps: [...]

  job2:
    needs: job1        # Wait for job1
    steps: [...]

  job3:
    needs: job2        # Wait for job2
    steps: [...]

# Pattern 2: Multiple dependencies
jobs:
  job1:
    steps: [...]

  job2:
    steps: [...]

  job3:
    needs: [job1, job2]    # Wait for BOTH
    steps: [...]
```

### Bước 3: Test Pipeline

**Test 1: Với secrets (expect fail immediately)**

```bash
git init
git add .
git commit -m "test: security pipeline with secrets"
git push

# Expected:
# ✗ secrets (25s) → FAIL (API key detected)
# - dependencies → SKIPPED
# - container → SKIPPED
```

**Test 2: Fix secrets, keep vulnerable deps**

```bash
# Remove hardcoded secret from src/config.js
# Use environment variables instead

git add .
git commit -m "fix: remove hardcoded secret"
git push

# Expected:
# ✓ secrets (28s)
# ✗ dependencies (1m 05s) → FAIL (vulnerable packages)
# - container → SKIPPED
```

**Test 3: Fix deps, keep vulnerable base image**

```bash
# Update packages in package.json

git add .
git commit -m "fix: update vulnerable dependencies"
git push

# Expected:
# ✓ secrets (27s)
# ✓ dependencies (1m 02s)
# ✗ container (2m 10s) → FAIL (base image CVEs)
```

**Test 4: Fix everything**

```bash
# Update Dockerfile base image

git add .
git commit -m "fix: update base image"
git push

# Expected:
# ✓ secrets (29s)
# ✓ dependencies (58s)
# ✓ container (2m 05s)
# Total: ~3.5 minutes ✅
```

## ✅ Kết Quả Mong Đợi

### Initial Run (với vulnerabilities):

```
Security Pipeline
├─ ✗ secrets (25s)
│    Finding: AWS-like key pattern
│    File: src/config.js:3
│    Secret: sk-1234567890abcdef
│
├─ ⊘ dependencies (skipped)
└─ ⊘ container (skipped)

Time saved: ~3 minutes (by failing fast)
```

### After Fixing Secrets:

```
Security Pipeline
├─ ✓ secrets (28s)
│
├─ ✗ dependencies (1m 05s)
│    found 5 high severity vulnerabilities
│    express: 4.17.1 → 4.18.2
│    axios: 0.21.1 → 0.21.4
│
└─ ⊘ container (skipped)

Time saved: ~2 minutes
```

### After Fixing All:

```
Security Pipeline
├─ ✓ secrets (27s)
├─ ✓ dependencies (1m 02s)
└─ ✓ container (2m 15s)

Total: 3m 44s ✅
```

## 💡 Gợi Ý

### Job Dependencies

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps: [...]

  job2:
    needs: job1              # Linear dependency
    runs-on: ubuntu-latest
    steps: [...]

  job3:
    needs: [job1, job2]      # Multiple dependencies
    runs-on: ubuntu-latest
    steps: [...]
```

### Gitleaks Action

```yaml
- uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### npm audit

```yaml
- run: npm ci
- run: npm audit --audit-level=high    # Fail if HIGH or above
```

## 🎓 Kiến Thức Cần Biết

- GitHub Actions job orchestration với `needs:`
- Fail-fast strategy (fail early để save time)
- Multiple security scanning tools
- Trade-offs: thoroughness vs speed

## 🌟 Bonus Challenge

1. **Add timing report:**
   ```yaml
   - name: Report timing
     run: echo "Job completed in ${{ job.duration }}"
   ```

2. **Parallel SAST:**
   Thêm CodeQL job chạy song song (không depend vào secrets/deps):
   ```yaml
   sast:
     # No needs → runs parallel
     runs-on: ubuntu-latest
     steps:
       - uses: github/codeql-action/init@v3
       # ...
   ```

3. **Notification:**
   Thêm Slack notification khi pipeline fails

Chúc bạn làm bài tốt! 🔐
