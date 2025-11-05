# iOS 26

> **Latest features and APIs for iPhone development**

## 🎯 What's New in iOS 26

### System Requirements
- Xcode 26+
- Swift 6.0+
- Deployment target: iOS 26.0+

**Official**: [iOS 26 Release Notes](https://developer.apple.com/documentation/ios-ipados-release-notes)

## 📱 New Frameworks

### 1. Enhanced SwiftData

```swift
import SwiftData

@Model
final class Task {
    var title: String
    var isCompleted: Bool
    var priority: Priority
    var dueDate: Date?
    
    // iOS 26: Computed properties with @Transient
    @Transient
    var isOverdue: Bool {
        guard let dueDate else { return false }
        return dueDate < Date() && !isCompleted
    }
    
    init(title: String, priority: Priority = .medium) {
        self.title = title
        self.isCompleted = false
        self.priority = priority
    }
}

enum Priority: String, Codable {
    case low, medium, high
}

// Usage in SwiftUI
struct TaskListView: View {
    @Query(sort: \Task.dueDate) private var tasks: [Task]
    @Environment(\.modelContext) private var context
    
    var body: some View {
        List {
            ForEach(tasks) { task in
                TaskRow(task: task)
            }
            .onDelete(perform: deleteTasks)
        }
    }
    
    private func deleteTasks(at offsets: IndexSet) {
        for index in offsets {
            context.delete(tasks[index])
        }
    }
}
```

**Documentation**: [SwiftData](https://developer.apple.com/documentation/swiftdata)

### 2. App Intents 2.0

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
        let task = Task(title: title, priority: priority)
        // Save task
        
        return .result(dialog: "Added task: \(title)")
    }
}

// Shortcuts support
struct TaskAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Create task in \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle"
        )
    }
}
```

**WWDC**: [WWDC25 - App Intents Deep Dive](https://developer.apple.com/videos/wwdc2025/)

### 3. Live Activities Enhancement

```swift
import ActivityKit

struct TaskActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var completedCount: Int
        var totalCount: Int
        var currentTask: String
    }
    
    var projectName: String
}

// Start Live Activity
func startTaskActivity() throws {
    let attributes = TaskActivityAttributes(projectName: "Work Project")
    let initialState = TaskActivityAttributes.ContentState(
        completedCount: 0,
        totalCount: 10,
        currentTask: "Review code"
    )
    
    let activity = try Activity.request(
        attributes: attributes,
        content: .init(state: initialState, staleDate: nil)
    )
}

// Update Live Activity
func updateActivity(_ activity: Activity<TaskActivityAttributes>) async {
    let updatedState = TaskActivityAttributes.ContentState(
        completedCount: 5,
        totalCount: 10,
        currentTask: "Write tests"
    )
    
    await activity.update(
        .init(state: updatedState, staleDate: nil)
    )
}
```

**Guide**: [Live Activities](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities)

## 🎨 UI Enhancements

### Dynamic Island Integration

```swift
struct TaskActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TaskActivityAttributes.self) { context in
            // Lock screen/banner UI
            HStack {
                Image(systemName: "checkmark.circle.fill")
                VStack(alignment: .leading) {
                    Text(context.state.currentTask)
                        .font(.headline)
                    Text("\(context.state.completedCount)/\(context.state.totalCount) completed")
                        .font(.caption)
                }
            }
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "list.bullet")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.completedCount)/\(context.state.totalCount)")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.currentTask)
                }
            } compactLeading: {
                Image(systemName: "checkmark.circle")
            } compactTrailing: {
                Text("\(context.state.completedCount)")
            } minimal: {
                Image(systemName: "checkmark")
            }
        }
    }
}
```

### StoreKit 3 Views

```swift
import StoreKit

struct SubscriptionView: View {
    @State private var subscriptions: [Product] = []
    
    var body: some View {
        SubscriptionStoreView(groupID: "premium_features") {
            // Custom marketing content
            VStack {
                Image("premium_icon")
                Text("Unlock Premium Features")
                    .font(.title)
            }
        }
        .subscriptionStoreButtonLabel(.multiline)
        .subscriptionStorePickerItemBackground(.thinMaterial)
        .storeButton(.visible, for: .restorePurchases)
    }
}
```

**Documentation**: [StoreKit Views](https://developer.apple.com/documentation/storekit/storekitviews)

## 🔐 Privacy & Security

### App Privacy Report

```swift
import AppTrackingTransparency

class PrivacyManager {
    func requestTracking() async -> Bool {
        await ATTrackingManager.requestTrackingAuthorization() == .authorized
    }
    
    func checkStatus() -> ATTrackingManager.AuthorizationStatus {
        ATTrackingManager.trackingAuthorizationStatus
    }
}
```

### Sensitive Content Analysis

```swift
import SensitiveContentAnalysis

actor ContentAnalyzer {
    private let analyzer = SCSensitivityAnalyzer()
    
    func analyzeImage(_ image: UIImage) async throws -> Bool {
        let policy = SCSensitivityAnalysisPolicy()
        
        let result = try await analyzer.analyzeImage(
            image.cgImage!,
            policy: policy
        )
        
        return result.isSensitive
    }
}
```

**Privacy Guide**: [User Privacy and Data Use](https://developer.apple.com/documentation/uikit/protecting-the-user-s-privacy)

## 📊 Performance

### MetricKit 2.0

```swift
import MetricKit

class MetricsManager: NSObject, MXMetricManagerSubscriber {
    override init() {
        super.init()
        MXMetricManager.shared.add(self)
    }
    
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            // CPU metrics
            if let cpuMetrics = payload.cpuMetrics {
                print("CPU Time: \(cpuMetrics.cumulativeCPUTime)")
            }
            
            // Memory metrics
            if let memoryMetrics = payload.memoryMetrics {
                print("Peak Memory: \(memoryMetrics.peakMemoryUsage)")
            }
            
            // Network metrics
            if let networkMetrics = payload.networkTransferMetrics {
                print("Cellular: \(networkMetrics.cumulativeCellularDownload)")
            }
        }
    }
}
```

**WWDC**: [WWDC25 - Optimize App Performance](https://developer.apple.com/videos/wwdc2025/)

## 🎮 Gaming

### Game Controller Support

```swift
import GameController

class GameControllerManager: ObservableObject {
    @Published var isConnected = false
    
    init() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(controllerConnected),
            name: .GCControllerDidConnect,
            object: nil
        )
    }
    
    @objc private func controllerConnected(_ notification: Notification) {
        guard let controller = notification.object as? GCController else {
            return
        }
        
        isConnected = true
        setupController(controller)
    }
    
    private func setupController(_ controller: GCController) {
        controller.extendedGamepad?.buttonA.valueChangedHandler = { button, value, pressed in
            if pressed {
                print("Button A pressed")
            }
        }
    }
}
```

## 📱 Device Features

### iPhone 16 Pro Features

```swift
import UIKit

class DeviceCapabilities {
    static var supportsProMotion: Bool {
        UIScreen.main.maximumFramesPerSecond >= 120
    }
    
    static var supportsAlwaysOn: Bool {
        // Check for always-on display support
        if #available(iOS 26, *) {
            return UIDevice.current.userInterfaceIdiom == .phone
        }
        return false
    }
    
    static var hasActionButton: Bool {
        // iPhone 15 Pro and later
        return UIDevice.current.model.contains("iPhone16")
    }
}
```

### Camera Control API

```swift
import AVFoundation

class CameraController: NSObject {
    private let captureSession = AVCaptureSession()
    
    func setupCamera() throws {
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
            throw CameraError.deviceNotAvailable
        }
        
        let input = try AVCaptureDeviceInput(device: camera)
        
        if captureSession.canAddInput(input) {
            captureSession.addInput(input)
        }
        
        // Configure for high quality
        captureSession.sessionPreset = .photo
        
        // Enable ProRAW if available
        if camera.activeFormat.isAppleProRAWSupported {
            camera.activeFormat.isAppleProRAWEnabled = true
        }
    }
}

enum CameraError: Error {
    case deviceNotAvailable
}
```

## 🌐 Networking

### URLSession Enhancements

```swift
import Foundation

actor NetworkManager {
    func fetchData<T: Decodable>(from url: URL) async throws -> T {
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    // Upload with progress
    func upload(data: Data, to url: URL) async throws -> Double {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let (_, response) = try await URLSession.shared.upload(for: request, from: data)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.uploadFailed
        }
        
        return 1.0
    }
}

enum NetworkError: Error {
    case invalidResponse
    case uploadFailed
}
```

## 🎯 Best Practices

### 1. Adopt Latest APIs

```swift
// ✅ Use modern async/await
func loadData() async throws -> [Item] {
    try await fetchItems()
}

// ❌ Avoid completion handlers
func loadData(completion: @escaping ([Item]) -> Void) {
    // Old style
}
```

### 2. Support Dark Mode

```swift
struct ThemedView: View {
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        Text("Adaptive")
            .foregroundStyle(colorScheme == .dark ? .white : .black)
            .background(Color(uiColor: .systemBackground))
    }
}
```

### 3. Optimize for Battery

```swift
import UIKit

class BatteryOptimizer {
    func optimizeForLowPower() {
        if ProcessInfo.processInfo.isLowPowerModeEnabled {
            // Reduce animations
            UIView.setAnimationsEnabled(false)
            
            // Reduce network requests
            // Pause background tasks
        }
    }
}
```

## 📚 Official Resources

### Documentation
- [iOS Developer Documentation](https://developer.apple.com/documentation/ios-ipados-release-notes)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### WWDC Sessions
- [WWDC25 - Platforms State of the Union](https://developer.apple.com/videos/wwdc2025/)
- [WWDC25 - What's New in iOS](https://developer.apple.com/videos/wwdc2025/)
- [WWDC25 - Design for iOS](https://developer.apple.com/videos/wwdc2025/)

### Sample Code
- [iOS Sample Apps](https://developer.apple.com/sample-code/ios/)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui)

## 🔗 Next Steps

- [macOS 26 →](./macos.md)
- [watchOS 26 →](./watchos.md)
- [iPadOS 26 →](./ipados.md)

---

**Sources**:
- Apple Developer Documentation (2025)
- iOS 26 Release Notes
- WWDC 2025 Sessions
- Human Interface Guidelines
