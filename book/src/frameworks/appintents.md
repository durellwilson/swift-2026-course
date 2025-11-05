# App Intents

> **Add Siri and Shortcuts support in 15 minutes**

## 🎯 What You'll Build

An app that works with:
- ✅ Siri voice commands
- ✅ Shortcuts app
- ✅ Spotlight search
- ✅ Control Center widgets

## 🚀 Your First Intent (5 min)

```swift
import AppIntents

struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    static var description = IntentDescription("Adds a new task to your list")
    
    @Parameter(title: "Task Title")
    var title: String
    
    @Parameter(title: "Priority", default: .medium)
    var priority: Priority
    
    @MainActor
    func perform() async throws -> some IntentResult {
        // Add task to your app
        let task = Task(title: title, priority: priority)
        TaskManager.shared.add(task)
        
        return .result(dialog: "Added '\(title)' to your tasks")
    }
}

enum Priority: String, AppEnum {
    case low, medium, high
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Priority")
    static var caseDisplayRepresentations: [Priority: DisplayRepresentation] = [
        .low: "Low",
        .medium: "Medium",
        .high: "High"
    ]
}
```

**That's it!** Now users can say: *"Hey Siri, add task Buy milk in MyApp"*

## 📱 Register Shortcuts

```swift
struct TaskAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Create task in \(.applicationName)",
                "New task in \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle"
        )
    }
}
```

## 🎯 Complete Example: Coffee Order

```swift
import AppIntents

// Coffee size enum
enum CoffeeSize: String, AppEnum {
    case small, medium, large
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Size")
    static var caseDisplayRepresentations: [CoffeeSize: DisplayRepresentation] = [
        .small: DisplayRepresentation(title: "Small", subtitle: "8 oz"),
        .medium: DisplayRepresentation(title: "Medium", subtitle: "12 oz"),
        .large: DisplayRepresentation(title: "Large", subtitle: "16 oz")
    ]
}

// Order intent
struct OrderCoffeeIntent: AppIntent {
    static var title: LocalizedStringResource = "Order Coffee"
    static var description = IntentDescription("Order your favorite coffee")
    static var openAppWhenRun: Bool = false  // Runs in background
    
    @Parameter(title: "Coffee Type")
    var coffeeType: String
    
    @Parameter(title: "Size", default: .medium)
    var size: CoffeeSize
    
    @Parameter(title: "Add milk", default: false)
    var addMilk: Bool
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Place order
        let order = CoffeeOrder(
            type: coffeeType,
            size: size,
            addMilk: addMilk
        )
        
        try await CoffeeService.shared.placeOrder(order)
        
        let response = "Your \(size.rawValue) \(coffeeType) is being prepared"
        return .result(dialog: IntentDialog(response))
    }
}

// Shortcuts
struct CoffeeShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OrderCoffeeIntent(),
            phrases: [
                "Order coffee in \(.applicationName)",
                "Get me a coffee from \(.applicationName)",
                "I need coffee from \(.applicationName)"
            ],
            shortTitle: "Order Coffee",
            systemImageName: "cup.and.saucer.fill"
        )
    }
}
```

**Usage**: *"Hey Siri, order coffee latte large with milk in CoffeeApp"*

## 🎨 Entity Queries

```swift
// Define entity
struct TaskEntity: AppEntity {
    var id: UUID
    var title: String
    var isCompleted: Bool
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Task")
    
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(title)",
            subtitle: isCompleted ? "Completed" : "Pending"
        )
    }
}

// Query provider
struct TaskQuery: EntityQuery {
    func entities(for identifiers: [UUID]) async throws -> [TaskEntity] {
        TaskManager.shared.tasks.filter { identifiers.contains($0.id) }
    }
    
    func suggestedEntities() async throws -> [TaskEntity] {
        Array(TaskManager.shared.tasks.prefix(5))
    }
}

// Use in intent
struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    
    @Parameter(title: "Task")
    var task: TaskEntity
    
    func perform() async throws -> some IntentResult {
        TaskManager.shared.complete(task.id)
        return .result(dialog: "Marked '\(task.title)' as complete")
    }
}
```

## 🔍 Spotlight Integration

```swift
import CoreSpotlight

extension TaskEntity: IndexedEntity {
    var attributeSet: CSSearchableItemAttributeSet {
        let attributes = CSSearchableItemAttributeSet(contentType: .text)
        attributes.title = title
        attributes.contentDescription = isCompleted ? "Completed" : "Pending"
        return attributes
    }
}

// Index tasks
func indexTasks() {
    let items = TaskManager.shared.tasks.map { task in
        CSSearchableItem(
            uniqueIdentifier: task.id.uuidString,
            domainIdentifier: "tasks",
            attributeSet: task.attributeSet
        )
    }
    
    CSSearchableIndex.default().indexSearchableItems(items)
}
```

## 🎯 Interactive Widgets

```swift
import WidgetKit
import AppIntents

struct ToggleTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Task"
    
    @Parameter(title: "Task ID")
    var taskID: String
    
    func perform() async throws -> some IntentResult {
        TaskManager.shared.toggle(UUID(uuidString: taskID)!)
        return .result()
    }
}

// In widget
struct TaskWidgetView: View {
    let task: Task
    
    var body: some View {
        HStack {
            Text(task.title)
            
            Spacer()
            
            Button(intent: ToggleTaskIntent(taskID: task.id.uuidString)) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
            }
            .buttonStyle(.plain)
        }
    }
}
```

## 🎨 Focus Filters

```swift
struct WorkFocusFilter: SetFocusFilterIntent {
    static var title: LocalizedStringResource = "Work Focus"
    
    @Parameter(title: "Show Work Tasks")
    var showWorkTasks: Bool
    
    func perform() async throws -> some IntentResult {
        TaskManager.shared.filterByWork = showWorkTasks
        return .result()
    }
}
```

## 🚀 Live Activities

```swift
struct TaskActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var completedCount: Int
        var totalCount: Int
    }
    
    var projectName: String
}

struct UpdateTaskProgressIntent: AppIntent {
    static var title: LocalizedStringResource = "Update Progress"
    
    func perform() async throws -> some IntentResult {
        // Update Live Activity
        let activity = Activity<TaskActivityAttributes>.activities.first
        await activity?.update(
            .init(state: .init(completedCount: 5, totalCount: 10), staleDate: nil)
        )
        
        return .result()
    }
}
```

## 🎯 Parameter Summaries

```swift
struct SendMessageIntent: AppIntent {
    static var title: LocalizedStringResource = "Send Message"
    
    @Parameter(title: "Recipient")
    var recipient: String
    
    @Parameter(title: "Message")
    var message: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Send \(\.$message) to \(\.$recipient)")
    }
    
    func perform() async throws -> some IntentResult {
        // Send message
        return .result(dialog: "Message sent to \(recipient)")
    }
}
```

## 🎨 Custom Dialogs

```swift
struct BookFlightIntent: AppIntent {
    static var title: LocalizedStringResource = "Book Flight"
    
    @Parameter(title: "Destination")
    var destination: String
    
    @Parameter(title: "Date")
    var date: Date
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let flight = try await FlightService.search(to: destination, on: date)
        
        // Custom dialog with options
        let dialog = IntentDialog(
            "Found a flight to \(destination) for $\(flight.price). Book it?",
            options: ["Yes", "No", "Show alternatives"]
        )
        
        return .result(dialog: dialog)
    }
}
```

## 🎯 Error Handling

```swift
enum OrderError: Error, CustomLocalizedStringResourceConvertible {
    case outOfStock
    case invalidPayment
    
    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .outOfStock:
            return "Sorry, that item is out of stock"
        case .invalidPayment:
            return "Payment method declined"
        }
    }
}

struct OrderIntent: AppIntent {
    func perform() async throws -> some IntentResult {
        guard ItemService.isInStock(item) else {
            throw OrderError.outOfStock
        }
        
        // Process order
        return .result(dialog: "Order placed!")
    }
}
```

## 💡 Best Practices

### 1. Clear Phrases

```swift
// ✅ Good: Natural language
"Order coffee in MyApp"
"Get me a coffee from MyApp"

// ❌ Bad: Robotic
"Execute coffee order function"
```

### 2. Sensible Defaults

```swift
@Parameter(title: "Size", default: .medium)  // ✅
@Parameter(title: "Size")  // ❌ User must specify
```

### 3. Background Execution

```swift
// For quick actions
static var openAppWhenRun: Bool = false

// For complex UI
static var openAppWhenRun: Bool = true
```

### 4. Helpful Descriptions

```swift
static var description = IntentDescription(
    "Adds a new task to your list",
    categoryName: "Tasks",
    searchKeywords: ["todo", "reminder", "task"]
)
```

## 🎯 Testing

### Shortcuts App

1. Open Shortcuts app
2. Create new shortcut
3. Search for your app
4. Add your intent
5. Test with different parameters

### Siri

```
"Hey Siri, add task Buy milk in MyApp"
"Hey Siri, order coffee in CoffeeApp"
```

### Xcode

```swift
// Test in code
let intent = AddTaskIntent()
intent.title = "Test Task"
intent.priority = .high

let result = try await intent.perform()
print(result)
```

## 📚 Resources

- [App Intents Documentation](https://developer.apple.com/documentation/appintents)
- [WWDC23 - Dive into App Intents](https://developer.apple.com/videos/play/wwdc2023/10032/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/siri)

## 🔗 Next Steps

- [WidgetKit →](./widgetkit.md)
- [SwiftData →](./swiftdata.md)

---

**Pro tip**: Start with 1-2 simple intents. Add more based on user feedback.
