# SwiftData - Modern Data Persistence

> Apple's declarative data modeling framework for Swift applications

## 🎯 What is SwiftData?

SwiftData is Apple's modern replacement for Core Data, providing:
- **Declarative syntax** with Swift macros
- **Type safety** at compile time
- **Automatic CloudKit sync** capabilities
- **SwiftUI integration** out of the box

## 🚀 Getting Started

### Basic Model Definition
```swift
import SwiftData

@Model
class Task {
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    var priority: Priority
    
    init(title: String, priority: Priority = .medium) {
        self.title = title
        self.isCompleted = false
        self.createdAt = Date()
        self.priority = priority
    }
}

enum Priority: String, Codable, CaseIterable {
    case low, medium, high
}
```

### App Setup
```swift
import SwiftUI
import SwiftData

@main
struct TaskApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: Task.self)
    }
}
```

## 📱 SwiftUI Integration

### Querying Data
```swift
struct TaskListView: View {
    @Query private var tasks: [Task]
    @Environment(\.modelContext) private var context
    
    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRow(task: task)
            }
            .onDelete(perform: deleteTasks)
        }
    }
    
    private func deleteTasks(offsets: IndexSet) {
        for index in offsets {
            context.delete(tasks[index])
        }
    }
}
```

### Adding Data
```swift
struct AddTaskView: View {
    @Environment(\.modelContext) private var context
    @State private var title = ""
    
    var body: some View {
        NavigationView {
            Form {
                TextField("Task Title", text: $title)
                
                Button("Save") {
                    let task = Task(title: title)
                    context.insert(task)
                    try? context.save()
                }
            }
        }
    }
}
```

## 🔗 Relationships

### One-to-Many
```swift
@Model
class Project {
    var name: String
    var tasks: [Task] = []
    
    init(name: String) {
        self.name = name
    }
}

@Model
class Task {
    var title: String
    var project: Project?
    
    init(title: String, project: Project? = nil) {
        self.title = title
        self.project = project
    }
}
```

### Many-to-Many
```swift
@Model
class Tag {
    var name: String
    var tasks: [Task] = []
    
    init(name: String) {
        self.name = name
    }
}

@Model
class Task {
    var title: String
    var tags: [Tag] = []
    
    init(title: String) {
        self.title = title
    }
}
```

## 🔍 Advanced Querying

### Filtered Queries
```swift
struct CompletedTasksView: View {
    @Query(filter: #Predicate<Task> { $0.isCompleted })
    private var completedTasks: [Task]
    
    var body: some View {
        List(completedTasks) { task in
            Text(task.title)
        }
    }
}
```

### Sorted Queries
```swift
struct TaskListView: View {
    @Query(sort: \Task.createdAt, order: .reverse)
    private var tasks: [Task]
    
    var body: some View {
        List(tasks) { task in
            TaskRow(task: task)
        }
    }
}
```

### Dynamic Queries
```swift
struct FilteredTasksView: View {
    let searchText: String
    
    var body: some View {
        FilteredTasksList(searchText: searchText)
    }
}

struct FilteredTasksList: View {
    @Query private var tasks: [Task]
    
    init(searchText: String) {
        let predicate = #Predicate<Task> { task in
            searchText.isEmpty || task.title.localizedStandardContains(searchText)
        }
        _tasks = Query(filter: predicate, sort: \Task.createdAt)
    }
    
    var body: some View {
        List(tasks) { task in
            Text(task.title)
        }
    }
}
```

## ☁️ CloudKit Integration

### Enable CloudKit Sync
```swift
@main
struct TaskApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: Task.self) { result in
            switch result {
            case .success(let container):
                // Enable CloudKit sync
                container.mainContext.cloudKitContainer = CKContainer.default()
            case .failure(let error):
                print("Failed to create container: \(error)")
            }
        }
    }
}
```

### CloudKit Configuration
```swift
// In your model
@Model
class Task {
    @Attribute(.unique) var id: UUID
    var title: String
    var isCompleted: Bool
    
    init(title: String) {
        self.id = UUID()
        self.title = title
        self.isCompleted = false
    }
}
```

## 🎯 Best Practices

### Model Design
```swift
@Model
class Task {
    // Use @Attribute for special configurations
    @Attribute(.unique) var id: UUID
    @Attribute(.spotlight) var title: String
    
    // Use relationships for complex data
    @Relationship(deleteRule: .cascade) var subtasks: [Subtask] = []
    
    // Computed properties for derived data
    var isOverdue: Bool {
        guard let dueDate = dueDate else { return false }
        return dueDate < Date() && !isCompleted
    }
    
    init(title: String) {
        self.id = UUID()
        self.title = title
    }
}
```

### Performance Optimization
```swift
// Use batch operations for large datasets
extension ModelContext {
    func batchDelete<T: PersistentModel>(_ type: T.Type, predicate: Predicate<T>) throws {
        let descriptor = FetchDescriptor<T>(predicate: predicate)
        let objects = try fetch(descriptor)
        
        for object in objects {
            delete(object)
        }
        
        try save()
    }
}
```

### Error Handling
```swift
class DataManager: ObservableObject {
    let container: ModelContainer
    
    init() {
        do {
            container = try ModelContainer(for: Task.self)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }
    
    func saveContext() {
        do {
            try container.mainContext.save()
        } catch {
            print("Failed to save context: \(error)")
        }
    }
}
```

## 📊 Migration from Core Data

### Model Conversion
```swift
// Core Data (old)
@NSManaged public var title: String?
@NSManaged public var isCompleted: Bool

// SwiftData (new)
var title: String
var isCompleted: Bool
```

### Context Usage
```swift
// Core Data (old)
let context = persistentContainer.viewContext
let task = Task(context: context)

// SwiftData (new)
@Environment(\.modelContext) private var context
let task = Task(title: "New Task")
context.insert(task)
```

## 🔧 Testing SwiftData

### Unit Testing
```swift
import Testing
import SwiftData

@Test func testTaskCreation() throws {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try ModelContainer(for: Task.self, configurations: config)
    let context = container.mainContext
    
    let task = Task(title: "Test Task")
    context.insert(task)
    
    #expect(task.title == "Test Task")
    #expect(task.isCompleted == false)
}
```

---

*SwiftData provides a modern, Swift-native approach to data persistence with seamless SwiftUI integration.*
