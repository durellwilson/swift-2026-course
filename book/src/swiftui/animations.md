# Animations & Transitions

> **Build a Tinder-style card swipe in 20 minutes**

## 🎯 What You'll Build

A swipeable card interface with:
- ✅ Drag gestures
- ✅ Spring animations
- ✅ Card rotation
- ✅ Like/Nope indicators
- ✅ Smooth transitions

## 🚀 Step 1: Card Model

```swift
struct Card: Identifiable {
    let id = UUID()
    let name: String
    let age: Int
    let image: String
    let bio: String
}

extension Card {
    static let samples = [
        Card(name: "Alex", age: 28, image: "person.1", bio: "Love hiking"),
        Card(name: "Sam", age: 25, image: "person.2", bio: "Coffee enthusiast"),
        Card(name: "Jordan", age: 30, image: "person.3", bio: "Tech geek")
    ]
}
```

## 📱 Step 2: Swipeable Card

```swift
struct SwipeableCard: View {
    let card: Card
    let onSwipe: (SwipeDirection) -> Void
    
    @State private var offset = CGSize.zero
    @State private var rotation: Double = 0
    
    var body: some View {
        ZStack {
            // Card content
            cardContent
            
            // Like/Nope overlays
            overlays
        }
        .offset(offset)
        .rotationEffect(.degrees(rotation))
        .gesture(
            DragGesture()
                .onChanged { gesture in
                    offset = gesture.translation
                    rotation = Double(gesture.translation.width / 20)
                }
                .onEnded { gesture in
                    handleSwipeEnd(gesture)
                }
        )
    }
    
    private var cardContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: card.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(height: 400)
                .clipped()
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(card.name)
                        .font(.title)
                        .fontWeight(.bold)
                    Text("\(card.age)")
                        .font(.title2)
                }
                
                Text(card.bio)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .background(.white)
        .cornerRadius(20)
        .shadow(radius: 10)
    }
    
    private var overlays: some View {
        ZStack {
            // Like overlay
            Text("LIKE")
                .font(.system(size: 60, weight: .bold))
                .foregroundStyle(.green)
                .opacity(offset.width > 50 ? Double(offset.width / 100) : 0)
                .rotationEffect(.degrees(-30))
                .padding()
            
            // Nope overlay
            Text("NOPE")
                .font(.system(size: 60, weight: .bold))
                .foregroundStyle(.red)
                .opacity(offset.width < -50 ? Double(-offset.width / 100) : 0)
                .rotationEffect(.degrees(30))
                .padding()
        }
    }
    
    private func handleSwipeEnd(_ gesture: DragGesture.Value) {
        let threshold: CGFloat = 100
        
        if gesture.translation.width > threshold {
            // Swipe right (like)
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                offset = CGSize(width: 500, height: 0)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                onSwipe(.right)
            }
        } else if gesture.translation.width < -threshold {
            // Swipe left (nope)
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                offset = CGSize(width: -500, height: 0)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                onSwipe(.left)
            }
        } else {
            // Return to center
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                offset = .zero
                rotation = 0
            }
        }
    }
}

enum SwipeDirection {
    case left, right
}
```

## 🎨 Step 3: Card Stack

```swift
struct CardStackView: View {
    @State private var cards = Card.samples
    
    var body: some View {
        ZStack {
            ForEach(cards) { card in
                SwipeableCard(card: card) { direction in
                    removeCard(card)
                }
                .zIndex(Double(cards.count - (cards.firstIndex(where: { $0.id == card.id }) ?? 0)))
            }
        }
        .padding()
    }
    
    private func removeCard(_ card: Card) {
        withAnimation {
            cards.removeAll { $0.id == card.id }
        }
    }
}
```

## ⚡ Animation Types

### 1. Spring Animation (Natural Feel)

```swift
Button("Bounce") {
    withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
        scale = scale == 1.0 ? 1.5 : 1.0
    }
}
```

**Parameters**:
- `response`: Duration (lower = faster)
- `dampingFraction`: Bounciness (lower = more bounce)

### 2. Easing Animations

```swift
// Ease in (slow start)
withAnimation(.easeIn(duration: 0.5)) {
    opacity = 1.0
}

// Ease out (slow end)
withAnimation(.easeOut(duration: 0.5)) {
    opacity = 1.0
}

// Ease in-out (smooth both ends)
withAnimation(.easeInOut(duration: 0.5)) {
    opacity = 1.0
}
```

### 3. Linear Animation

```swift
withAnimation(.linear(duration: 1.0)) {
    rotation += 360
}
```

## 🎯 Common Animations

### Fade In/Out

```swift
struct FadeView: View {
    @State private var isVisible = false
    
    var body: some View {
        Text("Hello")
            .opacity(isVisible ? 1 : 0)
            .onAppear {
                withAnimation(.easeIn(duration: 0.5)) {
                    isVisible = true
                }
            }
    }
}
```

### Scale Effect

```swift
struct PulseButton: View {
    @State private var isPulsing = false
    
    var body: some View {
        Button("Tap Me") { }
            .scaleEffect(isPulsing ? 1.2 : 1.0)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.0).repeatForever()) {
                    isPulsing = true
                }
            }
    }
}
```

### Slide In

```swift
struct SlideInView: View {
    @State private var offset: CGFloat = -300
    
    var body: some View {
        Text("Slide In")
            .offset(x: offset)
            .onAppear {
                withAnimation(.spring(response: 0.6)) {
                    offset = 0
                }
            }
    }
}
```

### Rotation

```swift
struct SpinningView: View {
    @State private var rotation: Double = 0
    
    var body: some View {
        Image(systemName: "arrow.clockwise")
            .rotationEffect(.degrees(rotation))
            .onTapGesture {
                withAnimation(.linear(duration: 1.0)) {
                    rotation += 360
                }
            }
    }
}
```

## 🎨 Transitions

### Slide Transition

```swift
struct ContentView: View {
    @State private var showDetail = false
    
    var body: some View {
        VStack {
            Button("Show Detail") {
                showDetail.toggle()
            }
            
            if showDetail {
                DetailView()
                    .transition(.slide)
            }
        }
    }
}
```

### Custom Transition

```swift
extension AnyTransition {
    static var scaleAndFade: AnyTransition {
        .asymmetric(
            insertion: .scale.combined(with: .opacity),
            removal: .scale.combined(with: .opacity)
        )
    }
}

// Usage
if showView {
    MyView()
        .transition(.scaleAndFade)
}
```

### Move Transition

```swift
if showView {
    MyView()
        .transition(.move(edge: .bottom))
}
```

## 🎯 Advanced: Matched Geometry

```swift
struct ExpandableCard: View {
    @State private var isExpanded = false
    @Namespace private var animation
    
    var body: some View {
        if isExpanded {
            // Expanded view
            VStack {
                Image(systemName: "photo")
                    .matchedGeometryEffect(id: "image", in: animation)
                    .frame(height: 400)
                
                Text("Details")
                    .matchedGeometryEffect(id: "text", in: animation)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.white)
            .onTapGesture {
                withAnimation(.spring(response: 0.6)) {
                    isExpanded = false
                }
            }
        } else {
            // Compact view
            HStack {
                Image(systemName: "photo")
                    .matchedGeometryEffect(id: "image", in: animation)
                    .frame(width: 60, height: 60)
                
                Text("Details")
                    .matchedGeometryEffect(id: "text", in: animation)
            }
            .padding()
            .background(.white)
            .cornerRadius(10)
            .onTapGesture {
                withAnimation(.spring(response: 0.6)) {
                    isExpanded = true
                }
            }
        }
    }
}
```

## 🎬 Animation Modifiers

### Delay

```swift
withAnimation(.easeIn.delay(0.5)) {
    opacity = 1.0
}
```

### Repeat

```swift
withAnimation(.linear(duration: 1.0).repeatForever(autoreverses: true)) {
    scale = 1.5
}
```

### Speed

```swift
withAnimation(.easeIn.speed(2.0)) {
    offset = 100
}
```

## 🚀 Performance Tips

### 1. Use `.animation()` Modifier Carefully

```swift
// ❌ Bad: Animates everything
.animation(.spring(), value: someValue)

// ✅ Good: Specific animation
.scaleEffect(scale)
.animation(.spring(), value: scale)
```

### 2. Avoid Animating Expensive Operations

```swift
// ❌ Bad: Animating blur is expensive
.blur(radius: isBlurred ? 10 : 0)
.animation(.default, value: isBlurred)

// ✅ Good: Use opacity instead
.opacity(isBlurred ? 0.5 : 1.0)
.animation(.default, value: isBlurred)
```

### 3. Use Hardware Acceleration

```swift
// These are GPU-accelerated (fast):
.opacity()
.scaleEffect()
.rotationEffect()
.offset()

// These are CPU-bound (slower):
.blur()
.shadow()
```

## 🎯 Real-World Examples

### Loading Spinner

```swift
struct LoadingSpinner: View {
    @State private var isAnimating = false
    
    var body: some View {
        Circle()
            .trim(from: 0, to: 0.7)
            .stroke(lineWidth: 5)
            .frame(width: 50, height: 50)
            .rotationEffect(.degrees(isAnimating ? 360 : 0))
            .onAppear {
                withAnimation(.linear(duration: 1.0).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}
```

### Pull to Refresh

```swift
struct PullToRefreshView: View {
    @State private var offset: CGFloat = 0
    @State private var isRefreshing = false
    
    var body: some View {
        ScrollView {
            VStack {
                // Refresh indicator
                if isRefreshing {
                    ProgressView()
                        .padding()
                }
                
                // Content
                ForEach(0..<20) { i in
                    Text("Item \(i)")
                        .padding()
                }
            }
        }
        .refreshable {
            await refresh()
        }
    }
    
    private func refresh() async {
        isRefreshing = true
        try? await Task.sleep(for: .seconds(2))
        isRefreshing = false
    }
}
```

### Skeleton Loading

```swift
struct SkeletonView: View {
    @State private var isAnimating = false
    
    var body: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(.gray.opacity(0.3))
            .frame(height: 100)
            .overlay {
                GeometryReader { geometry in
                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(
                                colors: [.clear, .white.opacity(0.5), .clear],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .offset(x: isAnimating ? geometry.size.width : -geometry.size.width)
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    isAnimating = true
                }
            }
    }
}
```

## 💡 Pro Tips

1. **Spring animations feel natural** - Use them for user interactions
2. **Linear for continuous** - Use for loading spinners, progress bars
3. **Match real-world physics** - Bouncy buttons, smooth slides
4. **Don't over-animate** - Too many animations = distracting
5. **Test on device** - Simulator doesn't show true performance

## 🔗 Next Steps

- [Data Flow →](./data-flow.md)
- [SwiftData →](../frameworks/swiftdata.md)

---

**Try it**: Copy the swipeable card code and run it. Adjust spring parameters to feel the difference!
