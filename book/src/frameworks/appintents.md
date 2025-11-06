# App Intents - Siri & Shortcuts Integration

> Connect your app to Siri, Shortcuts, and system intelligence

## 🎯 What are App Intents?

App Intents allow your app to:
- **Expose functionality** to Siri and Shortcuts
- **Provide voice control** for key features
- **Enable automation** workflows
- **Integrate with system intelligence**

## 🚀 Basic App Intent

### Simple Intent
```swift
import AppIntents

struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    static var description = IntentDescription("Add a new task to your list")
    
    @Parameter(title: "Task Title")
    var taskTitle: String
    
    func perform() async throws -> some IntentResult {
        // Add task to your data store
        let task = Task(title: taskTitle)
        await TaskManager.shared.addTask(task)
        
        return .result(dialog: "Added '\(taskTitle)' to your tasks")
    }
}
```

### Register Intent
```swift
@main
struct TaskApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
    
    init() {
        // Register app intents
        AppDependencyManager.shared.add(dependency: TaskManager.shared)
    }
}
```

## 📱 Parameter Types

### String Parameters
```swift
struct SearchTasksIntent: AppIntent {
    static var title: LocalizedStringResource = "Search Tasks"
    
    @Parameter(title: "Search Query")
    var query: String
    
    func perform() async throws -> some IntentResult & ReturnsValue<[TaskEntity]> {
        let tasks = await TaskManager.shared.searchTasks(query: query)
        return .result(value: tasks.map(TaskEntity.init))
    }
}
```

### Enum Parameters
```swift
enum TaskPriority: String, AppEnum {
    case low = "Low"
    case medium = "Medium"
    case high = "High"
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Priority")
    static var caseDisplayRepresentations: [TaskPriority: DisplayRepresentation] = [
        .low: "Low Priority",
        .medium: "Medium Priority",
        .high: "High Priority"
    ]
}

struct CreateTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Task"
    
    @Parameter(title: "Task Title")
    var title: String
    
    @Parameter(title: "Priority", default: .medium)
    var priority: TaskPriority
    
    func perform() async throws -> some IntentResult {
        let task = Task(title: title, priority: priority)
        await TaskManager.shared.addTask(task)
        
        return .result(dialog: "Created \(priority.rawValue.lowercased()) priority task: \(title)")
    }
}
```

### Entity Parameters
```swift
struct TaskEntity: AppEntity {
    let id: UUID
    let title: String
    let isCompleted: Bool
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Task")
    
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)")
    }
    
    static var defaultQuery = TaskEntityQuery()
}

struct TaskEntityQuery: EntityQuery {
    func entities(for identifiers: [UUID]) async throws -> [TaskEntity] {
        return await TaskManager.shared.tasks(with: identifiers).map(TaskEntity.init)
    }
    
    func suggestedEntities() async throws -> [TaskEntity] {
        return await TaskManager.shared.recentTasks().map(TaskEntity.init)
    }
}
```

## 🎙️ Advanced Features

### Dynamic Options
```swift
struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    @Parameter(title: "Task")
    var task: TaskEntity
    
    static var parameterSummary: some ParameterSummary {
        Summary("Complete \(\.$task)")
    }
    
    func perform() async throws -> some IntentResult {
        await TaskManager.shared.completeTask(id: task.id)
        return .result(dialog: "Completed '\(task.title)'")
    }
}
```

### Confirmation Dialog
```swift
struct DeleteAllTasksIntent: AppIntent {
    static var title: LocalizedStringResource = "Delete All Tasks"
    static var isDiscoverable = false // Hide from suggestions
    
    func perform() async throws -> some IntentResult {
        let taskCount = await TaskManager.shared.taskCount()
        
        // Request confirmation for destructive action
        try await requestConfirmation(
            result: .result(dialog: "Are you sure you want to delete all \(taskCount) tasks?")
        )
        
        await TaskManager.shared.deleteAllTasks()
        return .result(dialog: "Deleted all tasks")
    }
}
```

### Progress Reporting
```swift
struct ExportTasksIntent: AppIntent {
    static var title: LocalizedStringResource = "Export Tasks"
    
    func perform() async throws -> some IntentResult & ReturnsValue<IntentFile> {
        let tasks = await TaskManager.shared.allTasks()
        
        // Report progress for long operations
        let progress = Progress(totalUnitCount: Int64(tasks.count))
        
        var exportData = ""
        for (index, task) in tasks.enumerated() {
            exportData += "\(task.title)\n"
            progress.completedUnitCount = Int64(index + 1)
            
            // Update progress every 10 items
            if index % 10 == 0 {
                try await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
            }
        }
        
        let data = exportData.data(using: .utf8)!
        let file = IntentFile(data: data, filename: "tasks.txt", type: .plainText)
        
        return .result(value: file, dialog: "Exported \(tasks.count) tasks")
    }
}
```

## 🔧 Shortcuts Integration

### Shortcut Phrases
```swift
struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    
    // Suggested phrases for Siri
    static var openAppWhenRun: Bool = false
    
    @Parameter(title: "Task Title")
    var taskTitle: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$taskTitle) to my tasks")
    }
    
    func perform() async throws -> some IntentResult {
        let task = Task(title: taskTitle)
        await TaskManager.shared.addTask(task)
        
        return .result(dialog: "Added '\(taskTitle)' to your task list")
    }
}
```

### App Shortcuts
```swift
struct TaskAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Create new task in \(.applicationName)",
                "Add \(\.$taskTitle) to \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle"
        )
    }
}
```

## 📊 Widget Integration

### Interactive Widgets
```swift
struct TaskWidgetIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Task"
    
    @Parameter(title: "Task ID")
    var taskId: String
    
    func perform() async throws -> some IntentResult {
        await TaskManager.shared.toggleTask(id: UUID(uuidString: taskId)!)
        
        // Update widget timeline
        WidgetCenter.shared.reloadTimelines(ofKind: "TaskWidget")
        
        return .result()
    }
}

// In your widget
struct TaskWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "TaskWidget", provider: TaskProvider()) { entry in
            TaskWidgetView(entry: entry)
        }
        .configurationDisplayName("Tasks")
        .description("View and complete your tasks")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

## 🎯 Best Practices

### Error Handling
```swift
enum TaskIntentError: Swift.Error, CustomLocalizedStringResourceConvertible {
    case taskNotFound
    case networkUnavailable
    
    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .taskNotFound:
            return "Task not found"
        case .networkUnavailable:
            return "Network connection required"
        }
    }
}

struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    @Parameter(title: "Task")
    var task: TaskEntity
    
    func perform() async throws -> some IntentResult {
        guard await TaskManager.shared.taskExists(id: task.id) else {
            throw TaskIntentError.taskNotFound
        }
        
        do {
            await TaskManager.shared.completeTask(id: task.id)
            return .result(dialog: "Completed '\(task.title)'")
        } catch {
            throw TaskIntentError.networkUnavailable
        }
    }
}
```

### Performance Optimization
```swift
struct TaskManager {
    // Cache frequently accessed data
    private var cachedTasks: [Task] = []
    private var lastCacheUpdate = Date.distantPast
    
    func recentTasks() async -> [Task] {
        // Return cached data if recent
        if Date().timeIntervalSince(lastCacheUpdate) < 60 {
            return Array(cachedTasks.prefix(10))
        }
        
        // Refresh cache
        cachedTasks = await loadAllTasks()
        lastCacheUpdate = Date()
        
        return Array(cachedTasks.prefix(10))
    }
}
```

### Localization
```swift
struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    
    @Parameter(title: "Task Title")
    var taskTitle: String
    
    func perform() async throws -> some IntentResult {
        let task = Task(title: taskTitle)
        await TaskManager.shared.addTask(task)
        
        // Localized response
        let message = LocalizedStringResource("task.added", 
                                            defaultValue: "Added '\(taskTitle)' to your tasks")
        
        return .result(dialog: IntentDialog(stringLiteral: String(localized: message)))
    }
}
```

## 🧪 Testing App Intents

### Unit Testing
```swift
import Testing
@testable import TaskApp

@Test func testAddTaskIntent() async throws {
    let intent = AddTaskIntent()
    intent.taskTitle = "Test Task"
    
    let result = try await intent.perform()
    
    // Verify task was added
    let tasks = await TaskManager.shared.allTasks()
    #expect(tasks.contains { $0.title == "Test Task" })
}
```

---

*App Intents make your app more accessible and integrated with the iOS ecosystem, enabling voice control and automation.*
