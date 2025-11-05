# SwiftUI Essentials

> **Declarative UI framework for all Apple platforms**

## 🎯 Core Concepts

### Declarative Syntax

SwiftUI uses a declarative approach where you describe *what* the UI should look like, not *how* to build it.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Text("Hello, SwiftUI")
                .font(.largeTitle)
            Button("Tap Me") {
                print("Button tapped")
            }
        }
    }
}
```

**Source**: [Apple Developer - SwiftUI Overview](https://developer.apple.com/xcode/swiftui/)

## 📱 View Protocol

Every SwiftUI view conforms to the `View` protocol.

```swift
protocol View {
    associatedtype Body: View
    @ViewBuilder var body: Self.Body { get }
}
```

### Basic Views

```swift
struct BasicViews: View {
    var body: some View {
        VStack(spacing: 20) {
            // Text
            Text("SwiftUI")
                .font(.title)
                .foregroundStyle(.blue)
            
            // Image
            Image(systemName: "swift")
                .imageScale(.large)
                .foregroundStyle(.orange)
            
            // Button
            Button("Action") {
                // Handle action
            }
            .buttonStyle(.borderedProminent)
            
            // TextField
            TextField("Enter text", text: .constant(""))
                .textFieldStyle(.roundedBorder)
        }
        .padding()
    }
}
```

**Reference**: [SwiftUI Views and Controls](https://developer.apple.com/documentation/swiftui/views-and-controls)

## 🎨 Layout System

### Stack Views

```swift
struct LayoutExample: View {
    var body: some View {
        // Vertical Stack
        VStack(alignment: .leading, spacing: 10) {
            Text("Title")
                .font(.headline)
            Text("Subtitle")
                .font(.subheadline)
        }
        
        // Horizontal Stack
        HStack {
            Image(systemName: "star.fill")
            Text("Featured")
        }
        
        // Depth Stack (overlapping)
        ZStack {
            Color.blue
            Text("Overlay")
                .foregroundStyle(.white)
        }
    }
}
```

### Grid Layout (iOS 16+)

```swift
struct GridExample: View {
    let items = Array(1...20)
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.adaptive(minimum: 100))
            ], spacing: 20) {
                ForEach(items, id: \.self) { item in
                    RoundedRectangle(cornerRadius: 10)
                        .fill(.blue.gradient)
                        .frame(height: 100)
                        .overlay {
                            Text("\(item)")
                                .foregroundStyle(.white)
                        }
                }
            }
            .padding()
        }
    }
}
```

**Documentation**: [Composing Custom Layouts](https://developer.apple.com/documentation/swiftui/composing-custom-layouts-with-swiftui)

## 🔄 State Management

### @State

For simple value types owned by the view.

```swift
struct CounterView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
                .font(.largeTitle)
            
            Button("Increment") {
                count += 1
            }
        }
    }
}
```

### @Binding

For two-way data flow between views.

```swift
struct ParentView: View {
    @State private var isOn = false
    
    var body: some View {
        ToggleView(isOn: $isOn)
    }
}

struct ToggleView: View {
    @Binding var isOn: Bool
    
    var body: some View {
        Toggle("Switch", isOn: $isOn)
    }
}
```

### @Observable (iOS 17+)

Modern observation framework replacing ObservableObject.

```swift
import Observation

@Observable
class AppModel {
    var username: String = ""
    var isLoggedIn: Bool = false
    
    func login() {
        isLoggedIn = true
    }
}

struct LoginView: View {
    @State private var model = AppModel()
    
    var body: some View {
        VStack {
            TextField("Username", text: $model.username)
            
            Button("Login") {
                model.login()
            }
            
            if model.isLoggedIn {
                Text("Welcome, \(model.username)!")
            }
        }
    }
}
```

**WWDC Reference**: [WWDC23 - Discover Observation in SwiftUI](https://developer.apple.com/videos/play/wwdc2023/10149/)

## 🎭 Modifiers

### View Modifiers

```swift
struct ModifierExample: View {
    var body: some View {
        Text("Styled Text")
            .font(.title)
            .foregroundStyle(.blue)
            .padding()
            .background(.gray.opacity(0.2))
            .cornerRadius(10)
            .shadow(radius: 5)
    }
}
```

### Custom Modifiers

```swift
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.white)
            .cornerRadius(10)
            .shadow(radius: 5)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}

// Usage
Text("Card Content")
    .cardStyle()
```

**Guide**: [View Modifiers](https://developer.apple.com/documentation/swiftui/viewmodifier)

## 📋 Lists and Navigation

### List

```swift
struct Item: Identifiable {
    let id = UUID()
    let title: String
}

struct ListView: View {
    let items = [
        Item(title: "First"),
        Item(title: "Second"),
        Item(title: "Third")
    ]
    
    var body: some View {
        List(items) { item in
            Text(item.title)
        }
    }
}
```

### NavigationStack (iOS 16+)

```swift
struct NavigationExample: View {
    var body: some View {
        NavigationStack {
            List(1...10, id: \.self) { number in
                NavigationLink("Item \(number)") {
                    DetailView(number: number)
                }
            }
            .navigationTitle("Items")
        }
    }
}

struct DetailView: View {
    let number: Int
    
    var body: some View {
        Text("Detail for item \(number)")
            .navigationTitle("Item \(number)")
    }
}
```

**Documentation**: [NavigationStack](https://developer.apple.com/documentation/swiftui/navigationstack)

## 🎬 Animations

### Implicit Animations

```swift
struct AnimationExample: View {
    @State private var scale: CGFloat = 1.0
    
    var body: some View {
        Circle()
            .fill(.blue)
            .frame(width: 100 * scale, height: 100 * scale)
            .animation(.spring(response: 0.5, dampingFraction: 0.6), value: scale)
            .onTapGesture {
                scale = scale == 1.0 ? 1.5 : 1.0
            }
    }
}
```

### Explicit Animations

```swift
struct ExplicitAnimation: View {
    @State private var rotation: Double = 0
    
    var body: some View {
        Image(systemName: "arrow.right")
            .font(.largeTitle)
            .rotationEffect(.degrees(rotation))
            .onTapGesture {
                withAnimation(.easeInOut(duration: 1.0)) {
                    rotation += 360
                }
            }
    }
}
```

**WWDC**: [WWDC23 - Animate with Springs](https://developer.apple.com/videos/play/wwdc2023/10158/)

## 🎨 Styling

### Environment Values

```swift
struct ThemedView: View {
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        Text("Theme-aware")
            .foregroundStyle(colorScheme == .dark ? .white : .black)
    }
}
```

### Custom Environment

```swift
private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.default
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

struct Theme {
    let primaryColor: Color
    let secondaryColor: Color
    
    static let `default` = Theme(
        primaryColor: .blue,
        secondaryColor: .gray
    )
}

// Usage
ContentView()
    .environment(\.theme, Theme(primaryColor: .purple, secondaryColor: .pink))
```

## 🔧 Best Practices

### 1. View Composition

```swift
// ❌ Bad: Monolithic view
struct BadView: View {
    var body: some View {
        VStack {
            // 100+ lines of code
        }
    }
}

// ✅ Good: Composed views
struct GoodView: View {
    var body: some View {
        VStack {
            HeaderView()
            ContentView()
            FooterView()
        }
    }
}
```

### 2. Extract Subviews

```swift
struct ProfileView: View {
    var body: some View {
        VStack {
            profileImage
            profileInfo
            actionButtons
        }
    }
    
    private var profileImage: some View {
        Image(systemName: "person.circle.fill")
            .resizable()
            .frame(width: 100, height: 100)
    }
    
    private var profileInfo: some View {
        VStack {
            Text("John Doe")
                .font(.title)
            Text("iOS Developer")
                .font(.subheadline)
        }
    }
    
    private var actionButtons: some View {
        HStack {
            Button("Edit") { }
            Button("Share") { }
        }
    }
}
```

### 3. Performance Optimization

```swift
struct OptimizedList: View {
    let items: [Item]
    
    var body: some View {
        // Use LazyVStack for large lists
        ScrollView {
            LazyVStack {
                ForEach(items) { item in
                    ItemRow(item: item)
                        .id(item.id) // Explicit identity
                }
            }
        }
    }
}
```

**Performance Guide**: [Improving Performance](https://developer.apple.com/documentation/swiftui/improving-performance)

## 📱 Platform-Specific Code

```swift
struct PlatformView: View {
    var body: some View {
        #if os(iOS)
        iOSView()
        #elseif os(macOS)
        macOSView()
        #elseif os(watchOS)
        watchOSView()
        #endif
    }
}
```

## 📚 Official Resources

### Documentation
- [SwiftUI Overview](https://developer.apple.com/xcode/swiftui/)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)
- [SwiftUI API Reference](https://developer.apple.com/documentation/swiftui)

### WWDC Sessions
- [WWDC25 - What's New in SwiftUI](https://developer.apple.com/videos/wwdc2025/)
- [WWDC23 - Discover Observation](https://developer.apple.com/videos/play/wwdc2023/10149/)
- [WWDC22 - The SwiftUI Cookbook](https://developer.apple.com/videos/play/wwdc2022/10052/)

### Sample Code
- [SwiftUI Sample Apps](https://developer.apple.com/sample-code/swiftui/)
- [Food Truck App](https://developer.apple.com/documentation/swiftui/food_truck_building_a_swiftui_multiplatform_app)

## 🔗 Next Steps

- [Advanced Layouts →](./layouts.md)
- [Animations & Transitions →](./animations.md)
- [Data Flow →](./data-flow.md)

---

**Sources**: 
- Apple Developer Documentation (2025)
- WWDC 2023-2025 Sessions
- Swift.org SwiftUI Guidelines
