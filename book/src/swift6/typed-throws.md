# Typed Throws

> Swift 6 brings type safety to error handling with typed throws

## Overview

Typed throws (SE-0413) allows functions to specify exact error types they can throw, eliminating the need for generic catch-all clauses and enabling compile-time error checking.

**Before Swift 6**: All errors were type-erased to `any Error`  
**Swift 6**: Specify precise error types for better safety and clarity

## Basic Syntax

### Traditional Throws

```swift
// Swift 5: Type-erased errors
func fetchData() throws -> Data {
    throw NetworkError.timeout  // Could be any Error
}

// Must catch all possible errors
do {
    let data = try fetchData()
} catch {
    // 'error' is type-erased 'any Error'
    print(error)
}
```

### Typed Throws

```swift
// Swift 6: Typed errors
enum NetworkError: Error {
    case timeout
    case invalidURL
    case serverError(Int)
}

func fetchData() throws(NetworkError) -> Data {
    throw NetworkError.timeout  // ✅ Type-safe
}

// Exhaustive error handling
do {
    let data = try fetchData()
} catch NetworkError.timeout {
    // Retry logic
} catch NetworkError.invalidURL {
    // Fix URL
} catch NetworkError.serverError(let code) {
    // Handle server error
}
// ✅ No generic catch needed - all cases covered
```

## Error Type Specifications

### Single Error Type

```swift
enum ValidationError: Error {
    case empty
    case tooShort
    case invalidFormat
}

func validate(_ input: String) throws(ValidationError) {
    guard !input.isEmpty else {
        throw ValidationError.empty
    }
    guard input.count >= 3 else {
        throw ValidationError.tooShort
    }
}
```

### Never Throws

```swift
// Function that never throws
func safeOperation() throws(Never) -> Int {
    return 42  // ✅ Guaranteed not to throw
}

// Can call without try
let result = safeOperation()
```

### Generic Error Types

```swift
protocol APIError: Error {
    var statusCode: Int { get }
}

func request<E: APIError>() throws(E) -> Response {
    // Implementation
}
```

## Error Composition

### Multiple Error Sources

```swift
enum DatabaseError: Error {
    case connectionFailed
    case queryFailed
}

enum CacheError: Error {
    case expired
    case corrupted
}

// Combine errors with enum
enum DataError: Error {
    case database(DatabaseError)
    case cache(CacheError)
}

func loadData() throws(DataError) -> Data {
    do {
        return try fetchFromCache()
    } catch let error as CacheError {
        throw DataError.cache(error)
    }
}
```

### Error Chains

```swift
enum AppError: Error {
    case network(NetworkError)
    case validation(ValidationError)
    case unknown(any Error)
}

func processRequest() throws(AppError) {
    do {
        try validateInput()
    } catch let error as ValidationError {
        throw AppError.validation(error)
    } catch {
        throw AppError.unknown(error)
    }
}
```

## Async Typed Throws

```swift
enum APIError: Error {
    case unauthorized
    case notFound
    case serverError
}

func fetchUser(id: String) async throws(APIError) -> User {
    guard !id.isEmpty else {
        throw APIError.notFound
    }
    
    let response = await makeRequest("/users/\(id)")
    
    guard response.statusCode == 200 else {
        throw APIError.serverError
    }
    
    return try decode(response.data)
}

// Usage
Task {
    do {
        let user = try await fetchUser(id: "123")
        print(user.name)
    } catch APIError.unauthorized {
        // Show login
    } catch APIError.notFound {
        // Show not found
    } catch APIError.serverError {
        // Show error
    }
}
```

## Result Type Integration

```swift
enum ParseError: Error {
    case invalidFormat
    case missingData
}

func parse(_ json: String) throws(ParseError) -> Model {
    // Implementation
}

// Convert to Result
let result: Result<Model, ParseError> = Result {
    try parse(jsonString)
}

// Pattern matching
switch result {
case .success(let model):
    print(model)
case .failure(.invalidFormat):
    print("Invalid format")
case .failure(.missingData):
    print("Missing data")
}
```

## Rethrowing with Types

```swift
func transform<T, E: Error>(
    _ value: T,
    using: (T) throws(E) -> T
) rethrows(E) -> T {
    try using(value)
}

// Usage
let result = try transform("hello") { input in
    guard !input.isEmpty else {
        throw ValidationError.empty
    }
    return input.uppercased()
}
```

## Migration Strategies

### Gradual Adoption

**Step 1**: Define error enums
```swift
enum MyError: Error {
    case case1
    case case2
}
```

**Step 2**: Add type to throws
```swift
// Before
func operation() throws -> Value

// After
func operation() throws(MyError) -> Value
```

**Step 3**: Update call sites
```swift
// Before
do {
    try operation()
} catch {
    // Generic handling
}

// After
do {
    try operation()
} catch MyError.case1 {
    // Specific handling
} catch MyError.case2 {
    // Specific handling
}
```

### Backward Compatibility

```swift
// Support both typed and untyped
func legacyAPI() throws -> Data {
    try modernAPI()  // ✅ Typed throws can be used as untyped
}

func modernAPI() throws(NetworkError) -> Data {
    // Implementation
}
```

## Best Practices

### 1. Use Specific Error Types

```swift
// ❌ Too generic
enum AppError: Error {
    case error(String)
}

// ✅ Specific cases
enum AppError: Error {
    case networkTimeout
    case invalidCredentials
    case insufficientStorage
}
```

### 2. Compose Errors Hierarchically

```swift
enum RootError: Error {
    case network(NetworkError)
    case storage(StorageError)
    case validation(ValidationError)
}
```

### 3. Document Error Cases

```swift
/// Fetches user data from the API
/// - Throws: `APIError.unauthorized` if token is invalid
/// - Throws: `APIError.notFound` if user doesn't exist
/// - Throws: `APIError.serverError` for server issues
func fetchUser() throws(APIError) -> User {
    // Implementation
}
```

### 4. Avoid Over-Specification

```swift
// ❌ Too many error types
func process() throws(Error1) throws(Error2) throws(Error3)

// ✅ Combine related errors
enum ProcessError: Error {
    case type1(Error1)
    case type2(Error2)
    case type3(Error3)
}

func process() throws(ProcessError)
```

## Performance

Typed throws has **zero runtime overhead** compared to traditional throws. Error type checking happens at compile time.

```swift
// Both have identical runtime performance
func untyped() throws -> Int { 42 }
func typed() throws(MyError) -> Int { 42 }
```

## Testing

```swift
func testTypedThrows() {
    XCTAssertThrowsError(
        try operation(),
        "Should throw ValidationError"
    ) { error in
        XCTAssertTrue(error is ValidationError)
        if case ValidationError.empty = error {
            // ✅ Correct error thrown
        } else {
            XCTFail("Wrong error type")
        }
    }
}
```

## Common Patterns

### Pattern 1: Network Layer

```swift
enum NetworkError: Error {
    case noConnection
    case timeout
    case invalidResponse
    case httpError(Int)
}

func request(_ endpoint: String) async throws(NetworkError) -> Data {
    // Implementation
}
```

### Pattern 2: Validation

```swift
enum ValidationError: Error {
    case required(field: String)
    case invalid(field: String, reason: String)
    case outOfRange(field: String, min: Int, max: Int)
}

func validate(_ form: Form) throws(ValidationError) {
    // Validation logic
}
```

### Pattern 3: File Operations

```swift
enum FileError: Error {
    case notFound(path: String)
    case permissionDenied
    case corrupted
}

func readFile(_ path: String) throws(FileError) -> Data {
    // File reading
}
```

## Resources

- [Swift Evolution SE-0413](https://github.com/apple/swift-evolution/blob/main/proposals/0413-typed-throws.md)
- [Swift Documentation: Error Handling](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/)

## Next Steps

Continue to [Noncopyable Types](./noncopyable.md) to learn about Swift 6's ownership features.

---

*Content rephrased for compliance with licensing restrictions. Based on Swift Evolution proposals and official documentation.*
