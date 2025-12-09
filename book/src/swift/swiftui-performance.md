# SwiftUI Performance

> Build butter-smooth 120fps interfaces

## Overview

SwiftUI's declarative nature makes UI development faster, but requires understanding of its rendering model to achieve optimal performance. This guide covers techniques to maintain 60fps (120fps on ProMotion) even with complex UIs.

## View Identity and Diffing

### Stable Identity

```swift
// ❌ Unstable identity - recreates view
ForEach(items) { item in
    Text(item.name)
}

// ✅ Stable identity with id
ForEach(items, id: \.id) { item in
    Text(item.name)
}
```

### Avoid Anonymous Views

```swift
// ❌ Anonymous view - hard to optimize
var body: some View {
    VStack {
        if condition {
            Text("A")
        } else {
            Text("B")
        }
    }
}

// ✅ Named view - better diffing
var body: some View {
    VStack {
        conditionalText
    }
}

@ViewBuilder
var conditionalText: some View {
    if condition {
        Text("A")
    } else {
        Text("B")
    }
}
```

## State Management

### Minimize @State

```swift
// ❌ Too much state - unnecessary updates
struct ContentView: View {
    @State private var text = ""
    @State private var count = 0
    @State private var isLoading = false
    @State private var error: Error?
    
    var body: some View {
        // Every state change triggers full body re-evaluation
    }
}

// ✅ Group related state
struct ContentView: View {
    @StateObject private var viewModel = ViewModel()
    
    var body: some View {
        // Only updates when viewModel publishes
    }
}

@MainActor
class ViewModel: ObservableObject {
    @Published var text = ""
    @Published var count = 0
    @Published var isLoading = false
    @Published var error: Error?
}
```

### Use @Published Selectively

```swift
class ViewModel: ObservableObject {
    // ❌ Publishes every change
    @Published var items: [Item] = []
    
    // ✅ Batch updates
    private var items: [Item] = []
    
    func updateItems(_ newItems: [Item]) {
        items = newItems
        objectWillChange.send()  // Single update
    }
}
```

## List Performance

### LazyVStack vs VStack

```swift
// ❌ VStack - renders all items immediately
ScrollView {
    VStack {
        ForEach(1...1000, id: \.self) { i in
            ItemView(index: i)  // All 1000 created!
        }
    }
}

// ✅ LazyVStack - renders on demand
ScrollView {
    LazyVStack {
        ForEach(1...1000, id: \.self) { i in
            ItemView(index: i)  // Only visible items
        }
    }
}
```

### List Optimization

```swift
struct OptimizedList: View {
    let items: [Item]
    
    var body: some View {
        List(items) { item in
            ItemRow(item: item)
                .id(item.id)  // Stable identity
        }
        .listStyle(.plain)  // Simpler than default
    }
}

struct ItemRow: View {
    let item: Item
    
    var body: some View {
        HStack {
            Text(item.title)
            Spacer()
            Text(item.subtitle)
        }
    }
    
    // ✅ Implement Equatable for better diffing
    static func == (lhs: ItemRow, rhs: ItemRow) -> Bool {
        lhs.item.id == rhs.item.id
    }
}
```

## View Extraction

### Extract Subviews

```swift
// ❌ Monolithic view - full re-render
struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
            
            // Complex view that doesn't depend on count
            VStack {
                ForEach(items) { item in
                    ComplexItemView(item: item)
                }
            }
        }
    }
}

// ✅ Extracted view - isolated updates
struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
            ItemListView(items: items)  // Doesn't re-render
        }
    }
}

struct ItemListView: View {
    let items: [Item]
    
    var body: some View {
        ForEach(items) { item in
            ComplexItemView(item: item)
        }
    }
}
```

## Expensive Operations

### Defer Heavy Computation

```swift
struct DataView: View {
    let data: [DataPoint]
    
    // ❌ Computed every render
    var body: some View {
        let processed = processData(data)  // Expensive!
        ChartView(data: processed)
    }
}

// ✅ Cache computation
struct DataView: View {
    let data: [DataPoint]
    
    private var processedData: [ProcessedPoint] {
        // Memoized or computed once
        ProcessingCache.shared.process(data)
    }
    
    var body: some View {
        ChartView(data: processedData)
    }
}
```

### Use Task for Async Work

```swift
struct AsyncView: View {
    @State private var data: Data?
    
    var body: some View {
        content
            .task {
                data = await fetchData()
            }
    }
    
    @ViewBuilder
    var content: some View {
        if let data {
            DataView(data: data)
        } else {
            ProgressView()
        }
    }
}
```

## Image Performance

### Async Image Loading

```swift
// ❌ Synchronous loading
struct ImageView: View {
    let url: URL
    
    var body: some View {
        if let data = try? Data(contentsOf: url),
           let uiImage = UIImage(data: data) {
            Image(uiImage: uiImage)
        }
    }
}

// ✅ Async loading
struct ImageView: View {
    let url: URL
    
    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                image.resizable()
            case .failure:
                placeholderImage
            case .empty:
                ProgressView()
            @unknown default:
                EmptyView()
            }
        }
    }
}
```

### Image Caching

```swift
class ImageCache {
    static let shared = ImageCache()
    private var cache = NSCache<NSURL, UIImage>()
    
    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url as NSURL)
    }
    
    func store(_ image: UIImage, for url: URL) {
        cache.setObject(image, forKey: url as NSURL)
    }
}
```

## Animation Performance

### Prefer Implicit Animations

```swift
// ✅ Implicit animation - optimized
struct AnimatedView: View {
    @State private var scale: CGFloat = 1.0
    
    var body: some View {
        Circle()
            .scaleEffect(scale)
            .animation(.spring(), value: scale)
            .onTapGesture {
                scale = scale == 1.0 ? 1.5 : 1.0
            }
    }
}
```

### Use drawingGroup for Complex Animations

```swift
struct ComplexAnimation: View {
    @State private var phase: CGFloat = 0
    
    var body: some View {
        Canvas { context, size in
            // Complex drawing
        }
        .drawingGroup()  // Offload to Metal
        .onAppear {
            withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                phase = 1.0
            }
        }
    }
}
```

## Geometry Reader Optimization

### Minimize GeometryReader Usage

```swift
// ❌ GeometryReader triggers layout
struct ContentView: View {
    var body: some View {
        GeometryReader { geometry in
            VStack {
                Text("Width: \(geometry.size.width)")
            }
        }
    }
}

// ✅ Use frame preferences
struct ContentView: View {
    @State private var width: CGFloat = 0
    
    var body: some View {
        VStack {
            Text("Width: \(width)")
        }
        .background(
            GeometryReader { geometry in
                Color.clear.preference(
                    key: WidthKey.self,
                    value: geometry.size.width
                )
            }
        )
        .onPreferenceChange(WidthKey.self) { width = $0 }
    }
}

struct WidthKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
```

## Profiling SwiftUI

### Instruments Integration

```swift
import os.signpost

let log = OSLog(subsystem: "com.app", category: "SwiftUI")

struct ProfiledView: View {
    var body: some View {
        let _ = os_signpost(.begin, log: log, name: "Render")
        defer { os_signpost(.end, log: log, name: "Render") }
        
        return content
    }
    
    var content: some View {
        // View content
    }
}
```

### View Render Counting

```swift
struct DebugView: View {
    static var renderCount = 0
    
    var body: some View {
        let _ = Self.renderCount += 1
        let _ = print("Rendered \(Self.renderCount) times")
        
        return content
    }
}
```

## Best Practices

1. **Extract Subviews**: Break large views into smaller, reusable components
2. **Use Lazy Stacks**: For long lists, always use LazyVStack/LazyHStack
3. **Minimize State**: Group related state, avoid unnecessary @State
4. **Stable IDs**: Always provide stable identifiers for ForEach
5. **Cache Expensive Work**: Memoize heavy computations
6. **Profile Regularly**: Use Instruments to identify bottlenecks
7. **Batch Updates**: Combine multiple state changes into single update

## Performance Checklist

- [ ] Lists use LazyVStack/LazyHStack
- [ ] ForEach has stable IDs
- [ ] Heavy computation is cached
- [ ] Images load asynchronously
- [ ] State is minimized and grouped
- [ ] Subviews are extracted
- [ ] Animations use implicit style
- [ ] GeometryReader usage is minimal
- [ ] Profile shows 60fps+ scrolling

## Resources

- [Apple: SwiftUI Performance](https://developer.apple.com/documentation/swiftui)
- [WWDC: SwiftUI Performance](https://developer.apple.com/videos/)

## Next Steps

Continue to [Error Handling](./error-handling.md) for robust error management.

---

*Content rephrased for compliance with licensing restrictions.*
