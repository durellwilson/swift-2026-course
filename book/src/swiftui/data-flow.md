# Data Flow

> **Master state management in 30 minutes**

## 🎯 The 5 Property Wrappers

| Wrapper | Use When | Example |
|---------|----------|---------|
| `@State` | View owns data | Toggle, counter |
| `@Binding` | Two-way connection | Child view editing parent data |
| `@Observable` | Shared state | ViewModel, app state |
| `@Environment` | Global values | Theme, auth status |
| `@AppStorage` | UserDefaults | Settings, preferences |

## 🚀 @State - View-Local Data

```swift
struct CounterView: View {
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
```

**Rule**: Use `@State` for simple values owned by the view.

## 🔗 @Binding - Parent-Child Connection

```swift
struct ParentView: View {
    @State private var isOn = false
    
    var body: some View {
        VStack {
            Text("Switch is \(isOn ? "ON" : "OFF")")
            ChildView(isOn: $isOn)  // Pass binding with $
        }
    }
}

struct ChildView: View {
    @Binding var isOn: Bool
    
    var body: some View {
        Toggle("Toggle", isOn: $isOn)
    }
}
```

**Rule**: Use `@Binding` when child needs to modify parent's data.

## 📦 @Observable - Shared State

```swift
@Observable
class AppState {
    var username: String = ""
    var isLoggedIn: Bool = false
    var items: [Item] = []
    
    func login(username: String) {
        self.username = username
        self.isLoggedIn = true
    }
    
    func logout() {
        username = ""
        isLoggedIn = false
        items = []
    }
}

struct ContentView: View {
    @State private var appState = AppState()
    
    var body: some View {
        VStack {
            if appState.isLoggedIn {
                Text("Welcome, \(appState.username)!")
                Button("Logout") {
                    appState.logout()
                }
            } else {
                LoginView(appState: appState)
            }
        }
    }
}

struct LoginView: View {
    let appState: AppState
    @State private var username = ""
    
    var body: some View {
        VStack {
            TextField("Username", text: $username)
            Button("Login") {
                appState.login(username: username)
            }
        }
    }
}
```

**Rule**: Use `@Observable` for complex state shared across views.

## 🌍 @Environment - Global Values

```swift
// Define environment key
private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.light
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

enum Theme {
    case light, dark
}

// Set in parent
struct RootView: View {
    @State private var theme: Theme = .light
    
    var body: some View {
        ContentView()
            .environment(\.theme, theme)
    }
}

// Read in child
struct ContentView: View {
    @Environment(\.theme) var theme
    
    var body: some View {
        Text("Current theme: \(theme == .light ? "Light" : "Dark")")
    }
}
```

**Rule**: Use `@Environment` for values needed throughout the app.

## 💾 @AppStorage - UserDefaults

```swift
struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("fontSize") private var fontSize = 16.0
    @AppStorage("username") private var username = ""
    
    var body: some View {
        Form {
            Toggle("Dark Mode", isOn: $isDarkMode)
            
            Slider(value: $fontSize, in: 12...24) {
                Text("Font Size: \(Int(fontSize))")
            }
            
            TextField("Username", text: $username)
        }
    }
}
```

**Rule**: Use `@AppStorage` for simple persistent settings.

## 🎯 Complete Example: Todo App

```swift
// Model
struct Todo: Identifiable {
    let id = UUID()
    var title: String
    var isCompleted: Bool
}

// ViewModel
@Observable
class TodoViewModel {
    var todos: [Todo] = []
    var filter: Filter = .all
    
    enum Filter {
        case all, active, completed
    }
    
    var filteredTodos: [Todo] {
        switch filter {
        case .all: return todos
        case .active: return todos.filter { !$0.isCompleted }
        case .completed: return todos.filter { $0.isCompleted }
        }
    }
    
    func addTodo(title: String) {
        todos.append(Todo(title: title, isCompleted: false))
    }
    
    func toggleTodo(_ todo: Todo) {
        guard let index = todos.firstIndex(where: { $0.id == todo.id }) else { return }
        todos[index].isCompleted.toggle()
    }
    
    func deleteTodo(_ todo: Todo) {
        todos.removeAll { $0.id == todo.id }
    }
}

// Main View
struct TodoListView: View {
    @State private var viewModel = TodoViewModel()
    @State private var newTodoTitle = ""
    
    var body: some View {
        NavigationStack {
            VStack {
                // Input
                HStack {
                    TextField("New todo", text: $newTodoTitle)
                    Button("Add") {
                        viewModel.addTodo(title: newTodoTitle)
                        newTodoTitle = ""
                    }
                    .disabled(newTodoTitle.isEmpty)
                }
                .padding()
                
                // Filter
                Picker("Filter", selection: $viewModel.filter) {
                    Text("All").tag(TodoViewModel.Filter.all)
                    Text("Active").tag(TodoViewModel.Filter.active)
                    Text("Completed").tag(TodoViewModel.Filter.completed)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                
                // List
                List {
                    ForEach(viewModel.filteredTodos) { todo in
                        TodoRow(todo: todo, viewModel: viewModel)
                    }
                }
            }
            .navigationTitle("Todos")
        }
    }
}

struct TodoRow: View {
    let todo: Todo
    let viewModel: TodoViewModel
    
    var body: some View {
        HStack {
            Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(todo.isCompleted ? .green : .gray)
                .onTapGesture {
                    viewModel.toggleTodo(todo)
                }
            
            Text(todo.title)
                .strikethrough(todo.isCompleted)
            
            Spacer()
            
            Button {
                viewModel.deleteTodo(todo)
            } label: {
                Image(systemName: "trash")
                    .foregroundStyle(.red)
            }
        }
    }
}
```

## 🔄 Data Flow Patterns

### Pattern 1: Unidirectional Flow

```swift
// State flows down, events flow up
struct ParentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")  // State flows down
            ChildView(onIncrement: { count += 1 })  // Events flow up
        }
    }
}

struct ChildView: View {
    let onIncrement: () -> Void
    
    var body: some View {
        Button("Increment", action: onIncrement)
    }
}
```

### Pattern 2: Shared ViewModel

```swift
@Observable
class SharedViewModel {
    var data: [Item] = []
}

struct ParentView: View {
    @State private var viewModel = SharedViewModel()
    
    var body: some View {
        VStack {
            ChildView1(viewModel: viewModel)
            ChildView2(viewModel: viewModel)
        }
    }
}
```

### Pattern 3: Environment Injection

```swift
@Observable
class AppDependencies {
    let networkClient: NetworkClient
    let database: Database
    
    init() {
        self.networkClient = NetworkClient()
        self.database = Database()
    }
}

@main
struct MyApp: App {
    @State private var dependencies = AppDependencies()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(dependencies)
        }
    }
}

struct ContentView: View {
    @Environment(AppDependencies.self) private var dependencies
    
    var body: some View {
        Text("Ready")
            .task {
                let data = try await dependencies.networkClient.fetch()
            }
    }
}
```

## 🎨 Advanced: Bindable

```swift
@Observable
class FormData {
    var name = ""
    var email = ""
    var age = 0
}

struct FormView: View {
    @Bindable var formData: FormData
    
    var body: some View {
        Form {
            TextField("Name", text: $formData.name)
            TextField("Email", text: $formData.email)
            Stepper("Age: \(formData.age)", value: $formData.age)
        }
    }
}
```

## 🎯 Common Mistakes

### Mistake 1: Unnecessary @State

```swift
// ❌ Bad: Doesn't need @State
struct ProfileView: View {
    @State private var user: User  // Constant, doesn't change
    
    var body: some View {
        Text(user.name)
    }
}

// ✅ Good: Just use let
struct ProfileView: View {
    let user: User
    
    var body: some View {
        Text(user.name)
    }
}
```

### Mistake 2: Passing @State Instead of @Binding

```swift
// ❌ Bad: Can't modify parent's state
struct ChildView: View {
    let isOn: Bool  // Read-only
}

// ✅ Good: Can modify parent's state
struct ChildView: View {
    @Binding var isOn: Bool
}
```

### Mistake 3: Not Using @Observable

```swift
// ❌ Bad: Old ObservableObject pattern
class ViewModel: ObservableObject {
    @Published var items: [Item] = []
}

// ✅ Good: New @Observable
@Observable
class ViewModel {
    var items: [Item] = []
}
```

## 💡 Best Practices

1. **Keep @State private** - Don't expose mutable state
2. **Use @Binding for child views** - Enable two-way data flow
3. **@Observable for ViewModels** - Share complex state
4. **@Environment for dependencies** - Inject services
5. **@AppStorage for settings** - Persist user preferences

## 📚 Resources

- [Managing Model Data](https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app)
- [WWDC23 - Discover Observation](https://developer.apple.com/videos/play/wwdc2023/10149/)
- [Data Flow Through SwiftUI](https://developer.apple.com/documentation/swiftui/managing-user-interface-state)

## 🔗 Next Steps

- [SwiftData →](../frameworks/swiftdata.md)
- [Architecture →](../production/architecture.md)

---

**Remember**: State flows down, events flow up. Keep it simple!
