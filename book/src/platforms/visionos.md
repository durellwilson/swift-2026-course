# visionOS 26

> **Build spatial computing apps for Apple Vision Pro**

## 🎯 What Makes visionOS Different

- **3D Space**: Apps exist in physical space
- **Spatial Input**: Eyes, hands, voice
- **Immersion**: From windows to full immersion
- **Depth**: Real depth perception

## 🚀 Your First visionOS App (10 min)

```swift
import SwiftUI
import RealityKit

@main
struct HelloVisionApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: 30) {
            Text("Hello, Vision Pro!")
                .font(.extraLargeTitle)
            
            Model3D(named: "Scene") { model in
                model
                    .resizable()
                    .scaledToFit()
            } placeholder: {
                ProgressView()
            }
            .frame(depth: 300)
        }
        .padding()
    }
}
```

**New**: `.frame(depth:)` adds 3D depth!

## 🎨 Windows, Volumes, and Spaces

### 1. Window (2D Content)

```swift
WindowGroup {
    ContentView()
}
```

**Use for**: Settings, lists, forms

### 2. Volume (3D Content)

```swift
WindowGroup(id: "model") {
    Model3DView()
}
.windowStyle(.volumetric)
.defaultSize(width: 0.5, height: 0.5, depth: 0.5, in: .meters)
```

**Use for**: 3D models, games, visualizations

### 3. Immersive Space (Full Immersion)

```swift
ImmersiveSpace(id: "immersive") {
    ImmersiveView()
}
.immersionStyle(selection: .constant(.full), in: .full)
```

**Use for**: Games, experiences, meditation apps

## 🎯 Complete Example: 3D Gallery

```swift
import SwiftUI
import RealityKit

@main
struct GalleryApp: App {
    var body: some Scene {
        WindowGroup {
            GalleryView()
        }
        
        ImmersiveSpace(id: "gallery") {
            ImmersiveGalleryView()
        }
    }
}

struct GalleryView: View {
    @Environment(\.openImmersiveSpace) var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) var dismissImmersiveSpace
    @State private var isImmersive = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("3D Art Gallery")
                .font(.extraLargeTitle)
            
            Button(isImmersive ? "Exit Gallery" : "Enter Gallery") {
                Task {
                    if isImmersive {
                        await dismissImmersiveSpace()
                    } else {
                        await openImmersiveSpace(id: "gallery")
                    }
                    isImmersive.toggle()
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct ImmersiveGalleryView: View {
    var body: some View {
        RealityView { content in
            // Create 3D scene
            let artwork1 = createArtwork(at: SIMD3(x: -1, y: 1.5, z: -2))
            let artwork2 = createArtwork(at: SIMD3(x: 0, y: 1.5, z: -2))
            let artwork3 = createArtwork(at: SIMD3(x: 1, y: 1.5, z: -2))
            
            content.add(artwork1)
            content.add(artwork2)
            content.add(artwork3)
        }
    }
    
    private func createArtwork(at position: SIMD3<Float>) -> Entity {
        let mesh = MeshResource.generateBox(width: 0.5, height: 0.7, depth: 0.05)
        let material = SimpleMaterial(color: .blue, isMetallic: false)
        let entity = ModelEntity(mesh: mesh, materials: [material])
        entity.position = position
        return entity
    }
}
```

## 👁️ Spatial Input

### Eye Tracking

```swift
struct InteractiveView: View {
    @State private var isLookedAt = false
    
    var body: some View {
        RealityView { content in
            let entity = ModelEntity(mesh: .generateSphere(radius: 0.1))
            entity.components.set(InputTargetComponent())
            entity.components.set(HoverEffectComponent())
            content.add(entity)
        }
        .onContinuousHover { phase in
            switch phase {
            case .active:
                isLookedAt = true
            case .ended:
                isLookedAt = false
            }
        }
    }
}
```

### Hand Gestures

```swift
struct GestureView: View {
    @State private var scale: Float = 1.0
    
    var body: some View {
        RealityView { content in
            let entity = ModelEntity(mesh: .generateBox(size: 0.2))
            entity.components.set(InputTargetComponent())
            content.add(entity)
        }
        .gesture(
            MagnifyGesture()
                .onChanged { value in
                    scale = Float(value.magnification)
                }
        )
    }
}
```

## 🎮 RealityKit Basics

### Create 3D Objects

```swift
// Sphere
let sphere = ModelEntity(
    mesh: .generateSphere(radius: 0.1),
    materials: [SimpleMaterial(color: .red, isMetallic: true)]
)

// Box
let box = ModelEntity(
    mesh: .generateBox(size: 0.2),
    materials: [SimpleMaterial(color: .blue, isMetallic: false)]
)

// Custom mesh
let mesh = MeshResource.generateBox(width: 0.3, height: 0.2, depth: 0.1)
let entity = ModelEntity(mesh: mesh)
```

### Positioning

```swift
entity.position = SIMD3(x: 0, y: 1.5, z: -2)
entity.orientation = simd_quatf(angle: .pi / 4, axis: [0, 1, 0])
entity.scale = SIMD3(repeating: 1.5)
```

### Animation

```swift
var transform = entity.transform
transform.translation.y += 0.5

entity.move(
    to: transform,
    relativeTo: nil,
    duration: 1.0,
    timingFunction: .easeInOut
)
```

## 🌍 Spatial Anchors

### Place Objects in Real World

```swift
import ARKit

struct AnchoredView: View {
    var body: some View {
        RealityView { content in
            // Create anchor
            let anchor = AnchorEntity(.plane(.horizontal, classification: .floor, minimumBounds: [0.5, 0.5]))
            
            // Add object to anchor
            let entity = ModelEntity(mesh: .generateBox(size: 0.2))
            anchor.addChild(entity)
            
            content.add(anchor)
        }
    }
}
```

## 🎯 Practical Example: Solar System

```swift
struct SolarSystemView: View {
    var body: some View {
        RealityView { content in
            // Sun
            let sun = createPlanet(radius: 0.3, color: .yellow)
            sun.position = [0, 1.5, -2]
            content.add(sun)
            
            // Earth
            let earth = createPlanet(radius: 0.1, color: .blue)
            earth.position = [0.8, 1.5, -2]
            content.add(earth)
            
            // Orbit animation
            animateOrbit(earth, around: sun)
        }
    }
    
    private func createPlanet(radius: Float, color: UIColor) -> ModelEntity {
        let mesh = MeshResource.generateSphere(radius: radius)
        let material = SimpleMaterial(color: color, isMetallic: false)
        return ModelEntity(mesh: mesh, materials: [material])
    }
    
    private func animateOrbit(_ planet: ModelEntity, around center: ModelEntity) {
        // Circular orbit animation
        let duration: TimeInterval = 10.0
        
        Timer.scheduledTimer(withTimeInterval: 0.016, repeats: true) { _ in
            let angle = Float(Date().timeIntervalSince1970.truncatingRemainder(dividingBy: duration) / duration * 2 * .pi)
            planet.position.x = center.position.x + 0.8 * cos(angle)
            planet.position.z = center.position.z + 0.8 * sin(angle)
        }
    }
}
```

## 🎨 Materials and Lighting

### Physical Materials

```swift
var material = PhysicallyBasedMaterial()
material.baseColor = .init(tint: .blue)
material.roughness = 0.3
material.metallic = 0.8

let entity = ModelEntity(mesh: mesh, materials: [material])
```

### Image-Based Lighting

```swift
// Add environment lighting
let environment = try await EnvironmentResource(named: "studio")
entity.components.set(ImageBasedLightComponent(source: .single(environment)))
```

## 🎯 Passthrough and Immersion

```swift
@main
struct ImmersiveApp: App {
    @State private var immersionLevel: ImmersionStyle = .mixed
    
    var body: some Scene {
        ImmersiveSpace(id: "space") {
            ContentView()
        }
        .immersionStyle(selection: $immersionLevel, in: .mixed, .progressive, .full)
    }
}
```

**Levels**:
- `.mixed`: See real world + virtual objects
- `.progressive`: Gradually fade real world
- `.full`: Complete virtual environment

## 🎮 Game Example: Catch the Balls

```swift
struct CatchGameView: View {
    @State private var score = 0
    
    var body: some View {
        RealityView { content in
            // Spawn balls
            Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { _ in
                let ball = createBall()
                content.add(ball)
                animateFall(ball)
            }
        } update: { content in
            // Update score display
        }
        .overlay(alignment: .top) {
            Text("Score: \(score)")
                .font(.extraLargeTitle)
                .padding()
        }
    }
    
    private func createBall() -> ModelEntity {
        let ball = ModelEntity(
            mesh: .generateSphere(radius: 0.1),
            materials: [SimpleMaterial(color: .red, isMetallic: false)]
        )
        ball.position = SIMD3(
            x: Float.random(in: -1...1),
            y: 2,
            z: -2
        )
        ball.components.set(InputTargetComponent())
        return ball
    }
    
    private func animateFall(_ ball: ModelEntity) {
        var transform = ball.transform
        transform.translation.y = 0
        
        ball.move(to: transform, relativeTo: nil, duration: 3.0)
    }
}
```

## 💡 Best Practices

### 1. Comfortable Viewing Distance

```swift
// Place content 1-3 meters away
entity.position.z = -2.0  // 2 meters
```

### 2. Appropriate Scale

```swift
// Real-world scale
let chair = ModelEntity(mesh: chairMesh)
chair.scale = SIMD3(repeating: 1.0)  // 1:1 scale
```

### 3. Performance

```swift
// Use LOD (Level of Detail)
entity.components.set(ModelComponent(
    mesh: mesh,
    materials: materials
))

// Limit polygon count
// Target: < 100K polygons per scene
```

### 4. Accessibility

```swift
// Add accessibility labels
entity.accessibilityLabel = "Red sphere"
entity.accessibilityHint = "Tap to interact"
```

## 🎯 Testing

### Simulator

```bash
# Run in visionOS Simulator
xcodebuild -scheme YourApp \
  -destination 'platform=visionOS Simulator,name=Apple Vision Pro'
```

### Device

- Requires Apple Vision Pro
- Use Xcode wireless debugging
- Test with real spatial input

## 📚 Resources

- [visionOS Documentation](https://developer.apple.com/documentation/visionos)
- [RealityKit](https://developer.apple.com/documentation/realitykit)
- [WWDC23 - Meet visionOS](https://developer.apple.com/videos/play/wwdc2023/10066/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos)

## 🔗 Next Steps

- [iOS 26 →](./ios.md)
- [SwiftUI Essentials →](../swiftui/essentials.md)

---

**Remember**: Think in 3D space. Design for comfort. Test on device.
