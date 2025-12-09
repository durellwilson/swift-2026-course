# Concurrency & Data Race Safety

> Swift 6 eliminates data races through compile-time checking

## Overview

Swift 6 introduces complete data-race safety as a core language feature. The compiler now prevents data races at compile time through strict concurrency checking, isolation domains, and the Sendable protocol.

**Key Innovation**: Data race prevention moves from runtime to compile-time, eliminating entire classes of concurrency bugs before code runs.

## Strict Concurrency Checking

### Enabling in Swift 5 Mode

```swift
// Build Settings
// -strict-concurrency=complete
```

Gradually adopt strict concurrency:
- `minimal`: Basic checking
- `targeted`: Module-level opt-in
- `complete`: Full data-race safety (Swift 6 default)

### Swift 6 Default Behavior

In Swift 6 language mode, strict concurrency is always enabled. Non-sendable types cannot cross isolation boundaries.

## Isolation Domains

### Actor Isolation

```swift
actor DataStore {
    private var cache: [String: Data] = [:]
    
    func store(_ data: Data, for key: String) {
        cache[key] = data  // ✅ Safe: isolated to actor
    }
    
    func retrieve(_ key: String) -> Data? {
        cache[key]  // ✅ Safe: isolated to actor
    }
}

// Usage
let store = DataStore()
await store.store(data, for: "key")  // Async call required
```

### MainActor for UI

```swift
@MainActor
class ViewModel: ObservableObject {
    @Published var items: [Item] = []
    
    func loadItems() async {
        // ✅ Already on main actor
        let data = await fetchData()
        items = processData(data)  // UI update on main thread
    }
}
```

### Global Actors

```swift
@globalActor
struct DatabaseActor {
    static let shared = DatabaseActorInstance()
}

@DatabaseActor
class DatabaseManager {
    private var connection: Connection?
    
    func query(_ sql: String) -> [Row] {
        // ✅ All access serialized through DatabaseActor
        connection?.execute(sql) ?? []
    }
}
```

## Sendable Protocol

### What is Sendable?

Types conforming to `Sendable` can safely cross isolation boundaries. The compiler verifies thread safety.

```swift
// ✅ Value types are implicitly Sendable
struct User: Sendable {
    let id: UUID
    let name: String
}

// ✅ Immutable classes can be Sendable
final class Configuration: Sendable {
    let apiKey: String
    let baseURL: URL
    
    init(apiKey: String, baseURL: URL) {
        self.apiKey = apiKey
        self.baseURL = baseURL
    }
}

// ❌ Mutable classes are not Sendable
class MutableCache {  // Error: cannot conform to Sendable
    var data: [String: Any] = [:]
}
```

### @unchecked Sendable

Use when you've manually ensured thread safety:

```swift
final class ThreadSafeCache: @unchecked Sendable {
    private let lock = NSLock()
    private var storage: [String: Data] = [:]
    
    func get(_ key: String) -> Data? {
        lock.lock()
        defer { lock.unlock() }
        return storage[key]
    }
    
    func set(_ data: Data, for key: String) {
        lock.lock()
        defer { lock.unlock() }
        storage[key] = data
    }
}
```

**Warning**: Only use `@unchecked Sendable` when you've implemented proper synchronization. Incorrect usage leads to data races.

## Sendable Closures

### @Sendable Attribute

```swift
func performAsync(operation: @Sendable () -> Void) {
    Task {
        operation()  // ✅ Safe to call from any isolation domain
    }
}

// Usage
let value = 42
performAsync {
    print(value)  // ✅ Value types captured safely
}

var mutableArray = [1, 2, 3]
performAsync {
    mutableArray.append(4)  // ❌ Error: mutable capture
}
```

## Sending and Nonsending Parameters

Swift 6 introduces `sending` and `nonsending` for fine-grained control:

```swift
func transfer(sending data: Data) async {
    // 'data' ownership transferred to this function
    await processInBackground(data)
}

func borrow(nonsending data: Data) async {
    // 'data' borrowed, caller retains ownership
    await validate(data)
}
```

## Migration Strategies

### Gradual Adoption

**Step 1**: Enable warnings
```swift
// Build Settings: -strict-concurrency=targeted
```

**Step 2**: Fix isolation issues
```swift
// Before
class ViewModel {
    var data: [Item] = []
}

// After
@MainActor
class ViewModel {
    var data: [Item] = []
}
```

**Step 3**: Make types Sendable
```swift
// Before
struct Response {
    var items: [Item]
}

// After
struct Response: Sendable {
    let items: [Item]  // Immutable
}
```

### Common Patterns

**Pattern 1: Actor for Mutable State**
```swift
actor Counter {
    private var value = 0
    
    func increment() -> Int {
        value += 1
        return value
    }
}
```

**Pattern 2: Sendable Value Types**
```swift
struct Message: Sendable {
    let id: UUID
    let content: String
    let timestamp: Date
}
```

**Pattern 3: MainActor for UI**
```swift
@MainActor
final class AppState: ObservableObject {
    @Published var isLoading = false
    @Published var error: Error?
}
```

## Performance Considerations

### Actor Overhead

```swift
// ❌ Excessive actor calls
for item in items {
    await actor.process(item)  // N async calls
}

// ✅ Batch processing
await actor.processBatch(items)  // 1 async call
```

### Sendable Checking Cost

Compile-time only - zero runtime overhead. The compiler verifies safety during build.

## Best Practices

1. **Default to Value Types**: Structs and enums are automatically Sendable
2. **Use Actors for Mutable State**: Serialize access to shared mutable state
3. **MainActor for UI**: All UI updates must happen on main thread
4. **Minimize Isolation Crossings**: Batch operations to reduce async overhead
5. **Avoid @unchecked Sendable**: Only use when absolutely necessary with proper synchronization

## Common Errors

### Non-Sendable Type Crossing Boundary

```swift
class NonSendable {
    var value: Int = 0
}

Task {
    let obj = NonSendable()
    await someActor.process(obj)  // ❌ Error: NonSendable cannot cross
}
```

**Fix**: Make type Sendable or use actor isolation

### Mutable Capture in @Sendable Closure

```swift
var counter = 0
Task {
    counter += 1  // ❌ Error: mutable capture
}
```

**Fix**: Use actor or immutable capture

## Testing Concurrency

```swift
actor TestActor {
    var value = 0
    
    func increment() {
        value += 1
    }
}

func testConcurrency() async {
    let actor = TestActor()
    
    await withTaskGroup(of: Void.self) { group in
        for _ in 0..<1000 {
            group.addTask {
                await actor.increment()
            }
        }
    }
    
    let final = await actor.value
    XCTAssertEqual(final, 1000)  // ✅ No data races
}
```

## Resources

- [Swift Concurrency Documentation](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
- [WWDC 2024: Swift Concurrency Updates](https://developer.apple.com/videos/)
- [Swift Evolution: Complete Concurrency](https://github.com/apple/swift-evolution)

## Next Steps

Continue to [Typed Throws](./typed-throws.md) to learn about Swift 6's improved error handling.

---

*Content rephrased for compliance with licensing restrictions. Based on official Swift documentation and community resources.*
