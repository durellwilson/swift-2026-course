# Swift Testing Framework

> Modern testing with Swift's new testing framework introduced in Xcode 16

## 🧪 Introduction

Swift Testing is Apple's modern testing framework that provides:
- Cleaner syntax with `@Test` macro
- Better error messages and diagnostics  
- Parallel test execution
- Improved Xcode integration

## 🚀 Basic Testing

### Simple Tests
```swift
import Testing

@Test func basicMath() {
    #expect(2 + 2 == 4)
    #expect(10 - 5 == 5)
}

@Test func stringOperations() {
    let text = "Hello, Swift!"
    #expect(text.contains("Swift"))
    #expect(text.count == 13)
}
```

### Parameterized Tests
```swift
@Test(arguments: [
    (input: 0, expected: 1),
    (input: 1, expected: 1), 
    (input: 5, expected: 120)
])
func factorial(input: Int, expected: Int) {
    #expect(factorial(input) == expected)
}

func factorial(_ n: Int) -> Int {
    guard n > 1 else { return 1 }
    return n * factorial(n - 1)
}
```

## 🔧 Advanced Features

### Async Testing
```swift
@Test func networkRequest() async throws {
    let url = URL(string: "https://httpbin.org/json")!
    let (data, response) = try await URLSession.shared.data(from: url)
    
    #expect(data.count > 0)
    
    let httpResponse = try #require(response as? HTTPURLResponse)
    #expect(httpResponse.statusCode == 200)
}
```

### Error Testing
```swift
enum ValidationError: Error {
    case invalidEmail
    case tooShort
}

func validateEmail(_ email: String) throws {
    guard email.contains("@") else {
        throw ValidationError.invalidEmail
    }
}

@Test func errorHandling() {
    #expect(throws: ValidationError.invalidEmail) {
        try validateEmail("invalid-email")
    }
    
    #expect(throws: Never.self) {
        try validateEmail("valid@example.com")
    }
}
```

### Conditional Tests
```swift
@Test(.enabled(if: ProcessInfo.processInfo.environment["CI"] == nil))
func localOnlyTest() {
    // This test only runs locally, not in CI
    #expect(true)
}
```

## 📱 SwiftUI Testing

### View Testing
```swift
import Testing
import SwiftUI

struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") {
                count += 1
            }
        }
    }
}

@Test @MainActor 
func contentViewTest() {
    let view = ContentView()
    // Basic view creation test
    #expect(view.body != nil)
}
```

### Model Testing
```swift
@Observable
class Counter {
    var value = 0
    
    func increment() {
        value += 1
    }
    
    func decrement() {
        value -= 1
    }
}

@Test func counterModel() {
    let counter = Counter()
    
    #expect(counter.value == 0)
    
    counter.increment()
    #expect(counter.value == 1)
    
    counter.decrement()
    #expect(counter.value == 0)
}
```

## 🎯 Real-World Testing Patterns

### Service Testing with Mocks
```swift
protocol NetworkService {
    func fetchUser(id: Int) async throws -> User
}

struct User: Codable, Equatable {
    let id: Int
    let name: String
}

class MockNetworkService: NetworkService {
    var shouldFail = false
    
    func fetchUser(id: Int) async throws -> User {
        if shouldFail {
            throw URLError(.notConnectedToInternet)
        }
        return User(id: id, name: "Test User")
    }
}

class UserRepository {
    private let networkService: NetworkService
    
    init(networkService: NetworkService) {
        self.networkService = networkService
    }
    
    func getUser(id: Int) async throws -> User {
        return try await networkService.fetchUser(id: id)
    }
}

@Test func userRepositorySuccess() async throws {
    let mockService = MockNetworkService()
    let repository = UserRepository(networkService: mockService)
    
    let user = try await repository.getUser(id: 1)
    
    #expect(user.id == 1)
    #expect(user.name == "Test User")
}

@Test func userRepositoryFailure() async {
    let mockService = MockNetworkService()
    mockService.shouldFail = true
    let repository = UserRepository(networkService: mockService)
    
    await #expect(throws: URLError.self) {
        try await repository.getUser(id: 1)
    }
}
```

### Core Data Testing
```swift
import CoreData

@Test func coreDataOperations() throws {
    // Create in-memory store for testing
    let container = NSPersistentContainer(name: "DataModel")
    let description = NSPersistentStoreDescription()
    description.type = NSInMemoryStoreType
    container.persistentStoreDescriptions = [description]
    
    container.loadPersistentStores { _, error in
        #expect(error == nil)
    }
    
    let context = container.viewContext
    
    // Create test entity (assuming you have a Person entity)
    let person = NSEntityDescription.insertNewObject(forEntityName: "Person", into: context)
    person.setValue("John Doe", forKey: "name")
    person.setValue(30, forKey: "age")
    
    try context.save()
    
    // Fetch and verify
    let request = NSFetchRequest<NSManagedObject>(entityName: "Person")
    let results = try context.fetch(request)
    
    #expect(results.count == 1)
    #expect(results.first?.value(forKey: "name") as? String == "John Doe")
}
```

## 🔍 Test Organization

### Test Suites
```swift
@Suite("Authentication Tests")
struct AuthenticationTests {
    
    @Test func validLogin() async throws {
        let auth = AuthService()
        let result = try await auth.login(email: "test@example.com", password: "password123")
        #expect(result.isSuccess)
    }
    
    @Test func invalidCredentials() async {
        let auth = AuthService()
        await #expect(throws: AuthError.invalidCredentials) {
            try await auth.login(email: "test@example.com", password: "wrong")
        }
    }
}

class AuthService {
    func login(email: String, password: String) async throws -> LoginResult {
        // Simulate authentication
        if email == "test@example.com" && password == "password123" {
            return LoginResult(isSuccess: true, token: "abc123")
        } else {
            throw AuthError.invalidCredentials
        }
    }
}

struct LoginResult {
    let isSuccess: Bool
    let token: String?
}

enum AuthError: Error {
    case invalidCredentials
}
```

### Setup and Teardown
```swift
@Suite("Database Tests") 
struct DatabaseTests {
    let database: TestDatabase
    
    init() throws {
        database = try TestDatabase()
    }
    
    @Test func insertRecord() throws {
        let record = TestRecord(id: 1, name: "Test")
        try database.insert(record)
        
        let retrieved = try database.fetch(id: 1)
        #expect(retrieved?.name == "Test")
    }
    
    @Test func deleteRecord() throws {
        let record = TestRecord(id: 2, name: "Delete Me")
        try database.insert(record)
        try database.delete(id: 2)
        
        let retrieved = try database.fetch(id: 2)
        #expect(retrieved == nil)
    }
}

class TestDatabase {
    private var records: [Int: TestRecord] = [:]
    
    func insert(_ record: TestRecord) throws {
        records[record.id] = record
    }
    
    func fetch(id: Int) throws -> TestRecord? {
        return records[id]
    }
    
    func delete(id: Int) throws {
        records.removeValue(forKey: id)
    }
}

struct TestRecord: Equatable {
    let id: Int
    let name: String
}
```

## 📊 Performance Testing

### Timing Tests
```swift
@Test func performanceTest() {
    let startTime = CFAbsoluteTimeGetCurrent()
    
    // Perform operation
    let result = expensiveOperation()
    
    let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
    
    #expect(timeElapsed < 1.0) // Should complete within 1 second
    #expect(result.count > 0)
}

func expensiveOperation() -> [Int] {
    return (0..<100_000).map { $0 * 2 }
}
```

## 🛠 Migration from XCTest

### Assertion Mapping
```swift
// XCTest -> Swift Testing
XCTAssertEqual(a, b)           // #expect(a == b)
XCTAssertTrue(condition)       // #expect(condition)
XCTAssertFalse(condition)      // #expect(!condition)
XCTAssertNil(value)           // #expect(value == nil)
XCTAssertNotNil(value)        // #expect(value != nil)
XCTAssertThrowsError(try f()) // #expect(throws: Error.self) { try f() }
```

### Class-based to Function-based
```swift
// XCTest (old)
class MyTests: XCTestCase {
    func testExample() {
        XCTAssertEqual(2 + 2, 4)
    }
}

// Swift Testing (new)
@Test func example() {
    #expect(2 + 2 == 4)
}
```

## 🎓 Best Practices

### 1. Descriptive Test Names
```swift
@Test("User can create account with valid email and password")
func userAccountCreation() {
    // Test implementation
}
```

### 2. Arrange-Act-Assert Pattern
```swift
@Test func shoppingCartTotal() {
    // Arrange
    let cart = ShoppingCart()
    cart.add(Item(price: 10.00))
    cart.add(Item(price: 15.50))
    
    // Act
    let total = cart.calculateTotal()
    
    // Assert
    #expect(total == 25.50)
}
```

### 3. Test Data Builders
```swift
struct UserBuilder {
    private var name = "Default Name"
    private var email = "default@example.com"
    
    func withName(_ name: String) -> UserBuilder {
        var builder = self
        builder.name = name
        return builder
    }
    
    func withEmail(_ email: String) -> UserBuilder {
        var builder = self
        builder.email = email
        return builder
    }
    
    func build() -> User {
        return User(name: name, email: email)
    }
}

@Test func userValidation() {
    let user = UserBuilder()
        .withName("John Doe")
        .withEmail("john@example.com")
        .build()
    
    #expect(user.isValid)
}
```

---

*Swift Testing provides a modern, clean way to test your Swift code with better tooling and syntax.*
