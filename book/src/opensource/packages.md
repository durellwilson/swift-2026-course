# Swift Packages

> **Create and publish your first package in 15 minutes**

## 🎯 What You'll Build

A reusable Swift package that:
- ✅ Works on iOS, macOS, watchOS
- ✅ Has tests
- ✅ Published on GitHub
- ✅ Others can use

## 🚀 Step 1: Create Package

```bash
mkdir MyAwesomePackage
cd MyAwesomePackage
swift package init --type library
```

**Created**:
```
MyAwesomePackage/
├── Package.swift
├── Sources/
│   └── MyAwesomePackage/
│       └── MyAwesomePackage.swift
└── Tests/
    └── MyAwesomePackageTests/
        └── MyAwesomePackageTests.swift
```

## 📦 Step 2: Package.swift

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "MyAwesomePackage",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .watchOS(.v10),
        .tvOS(.v17),
        .visionOS(.v1)
    ],
    products: [
        .library(
            name: "MyAwesomePackage",
            targets: ["MyAwesomePackage"]
        ),
    ],
    dependencies: [
        // Add dependencies here
    ],
    targets: [
        .target(
            name: "MyAwesomePackage",
            dependencies: []
        ),
        .testTarget(
            name: "MyAwesomePackageTests",
            dependencies: ["MyAwesomePackage"]
        ),
    ]
)
```

## 💻 Step 3: Write Code

```swift
// Sources/MyAwesomePackage/MyAwesomePackage.swift

/// A simple string extension package
public extension String {
    /// Checks if string is a valid email
    var isValidEmail: Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let predicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return predicate.evaluate(with: self)
    }
    
    /// Truncates string to specified length
    func truncated(to length: Int, trailing: String = "...") -> String {
        guard count > length else { return self }
        return prefix(length) + trailing
    }
}
```

## 🧪 Step 4: Add Tests

```swift
// Tests/MyAwesomePackageTests/MyAwesomePackageTests.swift
import Testing
@testable import MyAwesomePackage

@Test
func testValidEmail() {
    #expect("test@example.com".isValidEmail == true)
    #expect("invalid-email".isValidEmail == false)
}

@Test
func testTruncate() {
    let text = "Hello, World!"
    #expect(text.truncated(to: 5) == "Hello...")
    #expect(text.truncated(to: 20) == "Hello, World!")
}
```

## 🚀 Step 5: Build and Test

```bash
# Build
swift build

# Test
swift test

# Generate Xcode project (optional)
swift package generate-xcodeproj
```

## 📱 Real Example: Network Client

```swift
// Sources/NetworkClient/NetworkClient.swift
import Foundation

public actor NetworkClient {
    public init() {}
    
    public func fetch<T: Decodable>(
        _ type: T.Type,
        from url: URL
    ) async throws -> T {
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
}

public enum NetworkError: Error {
    case invalidResponse
}
```

**Package.swift**:
```swift
let package = Package(
    name: "NetworkClient",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "NetworkClient", targets: ["NetworkClient"]),
    ],
    targets: [
        .target(name: "NetworkClient"),
        .testTarget(name: "NetworkClientTests", dependencies: ["NetworkClient"]),
    ]
)
```

## 🎯 Add Dependencies

```swift
dependencies: [
    .package(url: "https://github.com/apple/swift-nio.git", from: "2.0.0"),
],
targets: [
    .target(
        name: "MyAwesomePackage",
        dependencies: [
            .product(name: "NIO", package: "swift-nio"),
        ]
    ),
]
```

## 📚 Documentation

```swift
/// A network client for making HTTP requests
///
/// Use this client to fetch data from REST APIs:
///
/// ```swift
/// let client = NetworkClient()
/// let user = try await client.fetch(User.self, from: url)
/// ```
///
/// - Note: All methods are async and actor-isolated for thread safety
public actor NetworkClient {
    
    /// Fetches and decodes JSON data
    ///
    /// - Parameters:
    ///   - type: The type to decode
    ///   - url: The URL to fetch from
    /// - Returns: Decoded object
    /// - Throws: `NetworkError` if request fails
    public func fetch<T: Decodable>(
        _ type: T.Type,
        from url: URL
    ) async throws -> T {
        // Implementation
    }
}
```

## 🎨 Multiple Products

```swift
let package = Package(
    name: "MyPackage",
    products: [
        .library(name: "Core", targets: ["Core"]),
        .library(name: "UI", targets: ["UI"]),
        .executable(name: "CLI", targets: ["CLI"]),
    ],
    targets: [
        .target(name: "Core"),
        .target(name: "UI", dependencies: ["Core"]),
        .executableTarget(name: "CLI", dependencies: ["Core"]),
    ]
)
```

## 🔧 Resources

```swift
targets: [
    .target(
        name: "MyPackage",
        resources: [
            .process("Resources/Assets.xcassets"),
            .copy("Resources/data.json"),
        ]
    ),
]
```

**Access in code**:
```swift
let url = Bundle.module.url(forResource: "data", withExtension: "json")!
```

## 🚀 Publish to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/username/MyAwesomePackage.git
git push -u origin main

# Tag version
git tag 1.0.0
git push --tags
```

## 📦 Use in Projects

### Xcode
1. File → Add Package Dependencies
2. Enter GitHub URL
3. Select version
4. Add to target

### Package.swift
```swift
dependencies: [
    .package(url: "https://github.com/username/MyAwesomePackage.git", from: "1.0.0"),
],
targets: [
    .target(
        name: "MyApp",
        dependencies: ["MyAwesomePackage"]
    ),
]
```

## 🎯 Versioning

```bash
# Semantic versioning: MAJOR.MINOR.PATCH

# Bug fix (1.0.0 → 1.0.1)
git tag 1.0.1

# New feature (1.0.1 → 1.1.0)
git tag 1.1.0

# Breaking change (1.1.0 → 2.0.0)
git tag 2.0.0

git push --tags
```

## 🧪 Local Development

```swift
// In your app's Package.swift
dependencies: [
    .package(path: "../MyAwesomePackage"),
]
```

## 🎨 Binary Targets

```swift
targets: [
    .binaryTarget(
        name: "MyFramework",
        url: "https://example.com/MyFramework.xcframework.zip",
        checksum: "abc123..."
    ),
]
```

## 📊 Best Practices

### 1. Clear API

```swift
// ✅ Good: Clear, focused
public extension String {
    var isValidEmail: Bool { }
}

// ❌ Bad: Too generic
public extension String {
    func validate() -> Bool { }
}
```

### 2. Minimal Dependencies

```swift
// ✅ Good: No dependencies
public struct Logger {
    public func log(_ message: String) {
        print(message)
    }
}

// ❌ Bad: Heavy dependencies for simple task
import Alamofire
import SwiftyJSON
```

### 3. Platform Support

```swift
// ✅ Good: Support all platforms
platforms: [
    .iOS(.v17),
    .macOS(.v14),
    .watchOS(.v10),
    .tvOS(.v17)
]

// ❌ Bad: Unnecessary restrictions
platforms: [.iOS(.v18)]
```

## 🚀 Real Package: Logger

```swift
// Package.swift
let package = Package(
    name: "SimpleLogger",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "SimpleLogger", targets: ["SimpleLogger"]),
    ],
    targets: [
        .target(name: "SimpleLogger"),
        .testTarget(name: "SimpleLoggerTests", dependencies: ["SimpleLogger"]),
    ]
)

// Sources/SimpleLogger/Logger.swift
import Foundation

public enum LogLevel: String {
    case debug = "🔍"
    case info = "ℹ️"
    case warning = "⚠️"
    case error = "❌"
}

public struct Logger {
    public static let shared = Logger()
    
    public func log(_ message: String, level: LogLevel = .info) {
        let timestamp = Date().formatted(date: .omitted, time: .standard)
        print("\(level.rawValue) [\(timestamp)] \(message)")
    }
}

// Usage
import SimpleLogger

Logger.shared.log("App started", level: .info)
Logger.shared.log("Something went wrong", level: .error)
```

## 📚 README Template

```markdown
# MyAwesomePackage

Brief description of what your package does.

## Installation

### Swift Package Manager

```swift
dependencies: [
    .package(url: "https://github.com/username/MyAwesomePackage.git", from: "1.0.0")
]
```

## Usage

```swift
import MyAwesomePackage

let result = MyAwesomePackage.doSomething()
```

## Requirements

- iOS 17+
- macOS 14+
- Swift 6.0+

## License

MIT
```

## 🎯 Testing Locally

```bash
# In your package directory
swift test

# With coverage
swift test --enable-code-coverage

# Specific test
swift test --filter testValidEmail
```

## 📚 Resources

- [Swift Package Manager](https://swift.org/package-manager/)
- [Creating a Package](https://developer.apple.com/documentation/xcode/creating-a-standalone-swift-package-with-xcode)
- [Package Registry](https://www.swift.org/blog/package-registry-service/)

## 🔗 Next Steps

- [Contributing to Swift →](./contributing.md)
- [Popular Libraries →](./libraries.md)

---

**Pro tip**: Start small. Solve one problem well. Iterate based on feedback.
