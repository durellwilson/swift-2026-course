# CI/CD

> **Automate testing and deployment with GitHub Actions**

## 🎯 What You'll Build

A complete CI/CD pipeline that:
- ✅ Runs tests on every PR
- ✅ Builds app automatically
- ✅ Deploys to TestFlight
- ✅ Sends notifications

**Time**: 30 minutes setup, saves hours weekly

## 🚀 Step 1: Basic Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: macos-14
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.0.app
      
      - name: Run Tests
        run: |
          xcodebuild test \
            -scheme YourApp \
            -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
            -enableCodeCoverage YES
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
```

**What it does**:
- Runs on every PR and push
- Tests on iPhone 16 Pro simulator
- Uploads code coverage

## 📱 Step 2: Build and Archive

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: macos-14
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Install Certificates
        env:
          CERTIFICATE_BASE64: ${{ secrets.CERTIFICATE_BASE64 }}
          P12_PASSWORD: ${{ secrets.P12_PASSWORD }}
        run: |
          echo $CERTIFICATE_BASE64 | base64 --decode > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P $P12_PASSWORD -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
          security list-keychains -s build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p "" build.keychain
      
      - name: Install Provisioning Profile
        env:
          PROVISIONING_PROFILE_BASE64: ${{ secrets.PROVISIONING_PROFILE_BASE64 }}
        run: |
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          echo $PROVISIONING_PROFILE_BASE64 | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/profile.mobileprovision
      
      - name: Build Archive
        run: |
          xcodebuild archive \
            -scheme YourApp \
            -archivePath ./build/YourApp.xcarchive \
            -configuration Release \
            CODE_SIGN_STYLE=Manual
      
      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath ./build/YourApp.xcarchive \
            -exportPath ./build \
            -exportOptionsPlist ExportOptions.plist
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: YourApp.ipa
          path: ./build/YourApp.ipa
```

## 🚀 Step 3: Deploy to TestFlight

Add to `build.yml`:

```yaml
      - name: Upload to TestFlight
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          xcrun altool --upload-app \
            -f ./build/YourApp.ipa \
            -t ios \
            --apiKey $APP_STORE_CONNECT_API_KEY \
            --apiIssuer ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
```

## 🔐 Setup Secrets

### 1. Export Certificate

```bash
# Export from Keychain
security find-identity -v -p codesigning

# Export as .p12
# Then convert to base64
base64 -i certificate.p12 | pbcopy
```

### 2. Add to GitHub

Go to: **Settings → Secrets → Actions**

Add:
- `CERTIFICATE_BASE64`: Paste base64 certificate
- `P12_PASSWORD`: Certificate password
- `PROVISIONING_PROFILE_BASE64`: Base64 provisioning profile
- `APP_STORE_CONNECT_API_KEY`: API key from App Store Connect

## 🎯 Complete Workflow

```yaml
name: CI/CD

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Tests
        run: |
          xcodebuild test \
            -scheme YourApp \
            -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
  
  lint:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: SwiftLint
        run: |
          brew install swiftlint
          swiftlint --strict
  
  build:
    needs: [test, lint]
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and Deploy
        run: |
          # Build steps here
          echo "Building version ${{ github.ref_name }}"
  
  notify:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "New build deployed: ${{ github.ref_name }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 📊 Matrix Testing

Test on multiple iOS versions:

```yaml
jobs:
  test:
    runs-on: macos-14
    strategy:
      matrix:
        destination:
          - 'platform=iOS Simulator,name=iPhone 16 Pro,OS=18.0'
          - 'platform=iOS Simulator,name=iPhone 15 Pro,OS=17.0'
          - 'platform=iOS Simulator,name=iPad Pro 13-inch,OS=18.0'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Test on ${{ matrix.destination }}
        run: |
          xcodebuild test \
            -scheme YourApp \
            -destination '${{ matrix.destination }}'
```

## 🎨 SwiftLint Integration

Create `.swiftlint.yml`:

```yaml
disabled_rules:
  - trailing_whitespace
  
opt_in_rules:
  - empty_count
  - explicit_init
  
included:
  - Sources
  
excluded:
  - Pods
  - .build
  
line_length: 120

identifier_name:
  min_length: 2
  max_length: 40
```

Add to workflow:

```yaml
- name: SwiftLint
  run: |
    brew install swiftlint
    swiftlint lint --strict
```

## 🚀 Fastlane Integration

Install Fastlane:

```bash
brew install fastlane
cd your-project
fastlane init
```

Create `Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Run tests"
  lane :test do
    run_tests(
      scheme: "YourApp",
      devices: ["iPhone 16 Pro"]
    )
  end
  
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(scheme: "YourApp")
    upload_to_testflight
    slack(message: "New beta build uploaded!")
  end
  
  desc "Deploy to App Store"
  lane :release do
    increment_version_number
    build_app(scheme: "YourApp")
    upload_to_app_store
    slack(message: "New version released!")
  end
end
```

GitHub Actions with Fastlane:

```yaml
- name: Deploy to TestFlight
  run: fastlane beta
  env:
    FASTLANE_USER: ${{ secrets.APPLE_ID }}
    FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
```

## 📱 Xcode Cloud Alternative

Create `.xcode-cloud.yml`:

```yaml
version: 1.0

workflows:
  test:
    name: Test
    trigger:
      - pull_request
    actions:
      - name: Test
        scheme: YourApp
        destination: iPhone 16 Pro
  
  deploy:
    name: Deploy
    trigger:
      - tag: v*
    actions:
      - name: Archive
        scheme: YourApp
      - name: TestFlight
        destination: TestFlight
```

**Pros**: Native Apple integration  
**Cons**: Costs money, less flexible

## 🎯 Best Practices

### 1. Cache Dependencies

```yaml
- name: Cache SPM
  uses: actions/cache@v3
  with:
    path: .build
    key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
```

### 2. Parallel Jobs

```yaml
jobs:
  test-ios:
    runs-on: macos-14
  
  test-macos:
    runs-on: macos-14
  
  lint:
    runs-on: ubuntu-latest
```

### 3. Conditional Deployment

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: fastlane beta
```

## 📊 Monitoring

### Build Status Badge

Add to README:

```markdown
![Tests](https://github.com/username/repo/workflows/Tests/badge.svg)
```

### Slack Notifications

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Build failed: ${{ github.sha }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🚀 Release Automation

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: Create Release Notes
        run: |
          echo "## What's New" > release_notes.md
          git log --pretty=format:"- %s" $(git describe --tags --abbrev=0 @^)..@ >> release_notes.md
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: release_notes.md
```

## 💡 Quick Setup Checklist

- [ ] Create `.github/workflows/test.yml`
- [ ] Add secrets to GitHub
- [ ] Test workflow on PR
- [ ] Add build workflow
- [ ] Setup TestFlight upload
- [ ] Add Slack notifications
- [ ] Configure SwiftLint
- [ ] Add status badges

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Fastlane Docs](https://docs.fastlane.tools/)
- [Xcode Cloud](https://developer.apple.com/xcode-cloud/)

## 🔗 Next Steps

- [Testing →](./testing.md) - Write better tests
- [Security →](./security.md) - Secure your pipeline

---

**Bottom line**: 30 minutes setup saves hours every week. Automate everything!
