# SwiftData (Data Persistence)

> Modern data persistence with Swift-native APIs

## Overview

SwiftData is Apple's modern framework for data persistence, built on Core Data but with a Swift-first API. It uses macros and property wrappers for a declarative approach to data modeling.

## Basic Setup

### Model Definition
```swift
import SwiftData

@Model
class User {
    var name: String
    var email: String
    var age: Int
    var createdAt: Date
    
    // Relationships
    @Relationship(deleteRule: .cascade)
    var posts: [Post] = []
    
    init(name: String, email: String, age: Int) {
        self.name = name
        self.email = email
        self.age = age
        self.createdAt = Date()
    }
}

@Model
class Post {
    var title: String
    var content: String
    var publishedAt: Date
    
    // Inverse relationship
    var author: User?
    
    init(title: String, content: String, author: User) {
        self.title = title
        self.content = content
        self.publishedAt = Date()
        self.author = author
    }
}
```

### App Configuration
```swift
import SwiftUI
import SwiftData

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [User.self, Post.self])
    }
}
```

## Data Operations

### Creating Data
```swift
struct CreateUserView: View {
    @Environment(\.modelContext) private var context
    @State private var name = ""
    @State private var email = ""
    @State private var age = 18
    
    var body: some View {
        Form {
            TextField("Name", text: $name)
            TextField("Email", text: $email)
            Stepper("Age: \(age)", value: $age, in: 13...120)
            
            Button("Create User") {
                let user = User(name: name, email: email, age: age)
                context.insert(user)
                
                do {
                    try context.save()
                } catch {
                    print("Failed to save: \(error)")
                }
            }
        }
    }
}
```

### Querying Data
```swift
struct UserListView: View {
    @Query private var users: [User]
    
    var body: some View {
        List(users) { user in
            VStack(alignment: .leading) {
                Text(user.name)
                    .font(.headline)
                Text(user.email)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}
```

### Advanced Queries
```swift
struct FilteredUsersView: View {
    @Query(
        filter: #Predicate<User> { user in
            user.age >= 18 && user.name.contains("John")
        },
        sort: \User.createdAt,
        order: .reverse
    ) private var adults: [User]
    
    var body: some View {
        List(adults) { user in
            UserRowView(user: user)
        }
    }
}
```

### Dynamic Queries
```swift
struct SearchableUsersView: View {
    @State private var searchText = ""
    
    var body: some View {
        UserListView(searchText: searchText)
            .searchable(text: $searchText)
    }
}

struct UserListView: View {
    let searchText: String
    
    @Query private var users: [User]
    
    init(searchText: String) {
        self.searchText = searchText
        
        let predicate = #Predicate<User> { user in
            searchText.isEmpty || user.name.localizedStandardContains(searchText)
        }
        
        _users = Query(filter: predicate, sort: \User.name)
    }
    
    var body: some View {
        List(users) { user in
            Text(user.name)
        }
    }
}
```

## Relationships

### One-to-Many
```swift
@Model
class Category {
    var name: String
    
    @Relationship(deleteRule: .cascade, inverse: \Item.category)
    var items: [Item] = []
    
    init(name: String) {
        self.name = name
    }
}

@Model
class Item {
    var title: String
    var category: Category?
    
    init(title: String, category: Category) {
        self.title = title
        self.category = category
    }
}
```

### Many-to-Many
```swift
@Model
class Student {
    var name: String
    
    @Relationship(inverse: \Course.students)
    var courses: [Course] = []
    
    init(name: String) {
        self.name = name
    }
}

@Model
class Course {
    var title: String
    var students: [Student] = []
    
    init(title: String) {
        self.title = title
    }
}
```

## Data Validation

### Custom Validation
```swift
@Model
class Product {
    var name: String {
        didSet {
            if name.isEmpty {
                name = oldValue // Revert invalid change
            }
        }
    }
    
    var price: Decimal {
        didSet {
            if price < 0 {
                price = 0
            }
        }
    }
    
    init(name: String, price: Decimal) {
        self.name = name
        self.price = max(price, 0)
    }
}
```

### Computed Properties
```swift
@Model
class Order {
    var items: [OrderItem] = []
    var taxRate: Decimal = 0.08
    
    var subtotal: Decimal {
        items.reduce(0) { $0 + $1.total }
    }
    
    var tax: Decimal {
        subtotal * taxRate
    }
    
    var total: Decimal {
        subtotal + tax
    }
}
```

## Migration

### Schema Versions
```swift
enum SchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)
    
    static var models: [any PersistentModel.Type] {
        [User.self]
    }
    
    @Model
    class User {
        var name: String
        var email: String
        
        init(name: String, email: String) {
            self.name = name
            self.email = email
        }
    }
}

enum SchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)
    
    static var models: [any PersistentModel.Type] {
        [User.self]
    }
    
    @Model
    class User {
        var name: String
        var email: String
        var age: Int // New field
        
        init(name: String, email: String, age: Int = 0) {
            self.name = name
            self.email = email
            self.age = age
        }
    }
}
```

### Migration Plan
```swift
enum MigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] {
        [SchemaV1.self, SchemaV2.self]
    }
    
    static var stages: [MigrationStage] {
        [migrateV1toV2]
    }
    
    static let migrateV1toV2 = MigrationStage.custom(
        fromVersion: SchemaV1.self,
        toVersion: SchemaV2.self,
        willMigrate: { context in
            // Pre-migration setup
        },
        didMigrate: { context in
            // Post-migration cleanup
        }
    )
}

// App setup with migration
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [User.self], migrationPlan: MigrationPlan.self)
    }
}
```

## Performance Optimization

### Batch Operations
```swift
func createManyUsers() {
    let context = ModelContext(container)
    
    // Batch insert
    for i in 1...1000 {
        let user = User(name: "User \(i)", email: "user\(i)@example.com", age: 25)
        context.insert(user)
    }
    
    // Single save for all
    try? context.save()
}
```

### Fetch Limits
```swift
struct RecentUsersView: View {
    @Query(
        sort: \User.createdAt,
        order: .reverse,
        animation: .default
    ) private var recentUsers: [User]
    
    var body: some View {
        List(recentUsers.prefix(10)) { user in // Limit display
            UserRowView(user: user)
        }
    }
}
```

### Lazy Loading
```swift
struct UserDetailView: View {
    let user: User
    
    var body: some View {
        VStack {
            Text(user.name)
            
            // Posts loaded on demand
            LazyVStack {
                ForEach(user.posts) { post in
                    PostRowView(post: post)
                }
            }
        }
    }
}
```

## Background Processing

### Background Context
```swift
class DataManager {
    let container: ModelContainer
    
    init() {
        container = try! ModelContainer(for: User.self)
    }
    
    func syncDataInBackground() {
        Task.detached {
            let context = ModelContext(self.container)
            
            // Perform background operations
            let users = try await self.fetchUsersFromAPI()
            
            for userData in users {
                let user = User(
                    name: userData.name,
                    email: userData.email,
                    age: userData.age
                )
                context.insert(user)
            }
            
            try context.save()
        }
    }
}
```

## Testing

### In-Memory Store
```swift
class DataManagerTests: XCTestCase {
    var container: ModelContainer!
    var context: ModelContext!
    
    override func setUp() {
        super.setUp()
        
        // In-memory container for testing
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        container = try! ModelContainer(for: User.self, configurations: config)
        context = ModelContext(container)
    }
    
    func testUserCreation() {
        let user = User(name: "Test User", email: "test@example.com", age: 25)
        context.insert(user)
        
        try! context.save()
        
        let descriptor = FetchDescriptor<User>()
        let users = try! context.fetch(descriptor)
        
        XCTAssertEqual(users.count, 1)
        XCTAssertEqual(users.first?.name, "Test User")
    }
}
```

## Best Practices

1. **Use @Model**: Always use the @Model macro for data classes
2. **Define Relationships**: Use @Relationship for proper data modeling
3. **Handle Errors**: Always handle save/fetch errors gracefully
4. **Batch Operations**: Group multiple changes into single saves
5. **Background Processing**: Use background contexts for heavy operations
6. **Migration Planning**: Plan schema changes with proper migration
7. **Test with In-Memory**: Use in-memory stores for unit testing

## Common Patterns

### Repository Pattern
```swift
protocol UserRepository {
    func create(_ user: User) throws
    func fetch(id: UUID) throws -> User?
    func fetchAll() throws -> [User]
    func update(_ user: User) throws
    func delete(_ user: User) throws
}

class SwiftDataUserRepository: UserRepository {
    private let context: ModelContext
    
    init(context: ModelContext) {
        self.context = context
    }
    
    func create(_ user: User) throws {
        context.insert(user)
        try context.save()
    }
    
    func fetch(id: UUID) throws -> User? {
        let descriptor = FetchDescriptor<User>(
            predicate: #Predicate { $0.id == id }
        )
        return try context.fetch(descriptor).first
    }
    
    // ... other methods
}
```

SwiftData provides a modern, Swift-native approach to data persistence with excellent SwiftUI integration.
