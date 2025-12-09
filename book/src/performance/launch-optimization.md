# Launch Time Optimization

> Target: <400ms cold launch for exceptional user experience

## Overview

App launch time is the first impression users have of your app. Studies show that 80% of users will uninstall an app that crashes or performs poorly during launch. Optimizing launch time is critical for user retention and App Store ratings.

**Industry Standards**:
- Excellent: <400ms
- Good: 400-800ms
- Acceptable: 800-1200ms
- Poor: >1200ms

## Measuring Launch Time

### Using Instruments

**App Launch Template**:
1. Open Xcode → Product → Profile (⌘I)
2. Select "App Launch" template
3. Record app launch
4. Analyze time breakdown

**Key Metrics**:
- **Total Time**: Process creation to first frame
- **Pre-main Time**: Dynamic linking, initializers
- **Main Time**: `main()` to `applicationDidFinishLaunching`
- **First Frame**: Initial UI render

### MetricKit Integration

```swift
import MetricKit

class MetricsManager: NSObject, MXMetricManagerSubscriber {
    static let shared = MetricsManager()
    
    override init() {
        super.init()
        MXMetricManager.shared.add(self)
    }
    
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            if let launchMetrics = payload.applicationLaunchMetrics {
                let avgLaunch = launchMetrics.histogrammedTimeToFirstDraw
                    .averageBucketValue()
                print("Average launch: \(avgLaunch)ms")
            }
        }
    }
}
```

### XCTest Performance Measurement

```swift
func testLaunchPerformance() {
    measure(metrics: [XCTApplicationLaunchMetric()]) {
        XCUIApplication().launch()
    }
}
```

## Pre-Main Optimization

### Reduce Dynamic Libraries

```swift
// ❌ Many dynamic frameworks
import FrameworkA
import FrameworkB
import FrameworkC
// Each adds ~50-100ms

// ✅ Merge or use static linking
// Build Settings → Mach-O Type → Static Library
```

**Impact**: Each dynamic framework adds 50-100ms to pre-main time.

### Minimize +load Methods

```swift
// ❌ Avoid +load (Objective-C)
@objc class MyClass: NSObject {
    @objc override class func load() {
        // Runs at launch - blocks startup
    }
}

// ✅ Use +initialize or lazy initialization
@objc class MyClass: NSObject {
    @objc override class func initialize() {
        // Runs on first use
    }
}
```

### Optimize Static Initializers

```swift
// ❌ Heavy computation at startup
let expensiveGlobal = computeExpensiveValue()

// ✅ Lazy initialization
lazy var expensiveValue: Value = {
    computeExpensiveValue()
}()
```

## Main Thread Optimization

### Defer Non-Critical Work

```swift
func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
) -> Bool {
    
    // ✅ Critical: Window setup
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.rootViewController = MainViewController()
    window?.makeKeyAndVisible()
    
    // ✅ Defer analytics
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        Analytics.initialize()
    }
    
    // ✅ Background: Database migration
    Task.detached(priority: .utility) {
        await DatabaseManager.migrate()
    }
    
    return true
}
```

### Lazy Load Dependencies

```swift
class AppCoordinator {
    // ❌ Eager initialization
    let networkManager = NetworkManager()
    let cacheManager = CacheManager()
    let analyticsManager = AnalyticsManager()
    
    // ✅ Lazy initialization
    lazy var networkManager = NetworkManager()
    lazy var cacheManager = CacheManager()
    lazy var analyticsManager = AnalyticsManager()
}
```

### Optimize View Hierarchy

```swift
// ❌ Complex initial view
class LaunchViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        setupComplexUI()  // Blocks first frame
        loadData()
        configureAnimations()
    }
}

// ✅ Minimal initial view
class LaunchViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        setupMinimalUI()  // Fast first frame
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        loadData()  // After first frame
        configureAnimations()
    }
}
```

## SwiftUI Launch Optimization

### Minimize @main Body Work

```swift
@main
struct MyApp: App {
    // ❌ Heavy initialization
    @StateObject var store = Store()  // Blocks launch
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}

// ✅ Lazy initialization
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(Store.shared)  // Lazy singleton
        }
    }
}

class Store: ObservableObject {
    static let shared = Store()
    private init() {}  // Lazy initialization
}
```

### Defer Heavy Views

```swift
struct ContentView: View {
    @State private var isReady = false
    
    var body: some View {
        if isReady {
            ComplexView()  // Heavy view
        } else {
            SplashView()  // Lightweight
                .onAppear {
                    Task {
                        await prepareData()
                        isReady = true
                    }
                }
        }
    }
}
```

## Network Optimization

### Defer API Calls

```swift
// ❌ Block launch with network
func application(...) -> Bool {
    let config = try await fetchConfig()  // Blocks!
    return true
}

// ✅ Use cached config, update async
func application(...) -> Bool {
    ConfigManager.useCached()
    
    Task {
        await ConfigManager.fetchLatest()
    }
    
    return true
}
```

### Parallel Loading

```swift
func loadInitialData() async {
    // ❌ Sequential loading
    let user = await fetchUser()
    let settings = await fetchSettings()
    let content = await fetchContent()
    
    // ✅ Parallel loading
    async let user = fetchUser()
    async let settings = fetchSettings()
    async let content = fetchContent()
    
    let (userData, settingsData, contentData) = await (user, settings, content)
}
```

## Image Optimization

### Lazy Image Loading

```swift
// ❌ Load all images at launch
let images = [
    UIImage(named: "image1")!,
    UIImage(named: "image2")!,
    UIImage(named: "image3")!
]

// ✅ Load on demand
func image(named: String) -> UIImage {
    UIImage(named: named) ?? placeholderImage
}
```

### Use Asset Catalogs

- Enable "Preserve Vector Data" for scalable assets
- Use "On Demand Resources" for large assets
- Compress images appropriately

## Database Optimization

### Defer Migrations

```swift
class DatabaseManager {
    static func initialize() {
        // ✅ Open database quickly
        openDatabase()
        
        // ✅ Migrate in background
        Task.detached(priority: .utility) {
            await runMigrations()
        }
    }
}
```

### Use WAL Mode (SQLite)

```swift
// Enable Write-Ahead Logging for better concurrency
try db.execute("PRAGMA journal_mode=WAL")
```

## Third-Party SDK Optimization

### Audit SDK Impact

```swift
// Measure SDK initialization time
let start = CFAbsoluteTimeGetCurrent()
Firebase.configure()
let duration = CFAbsoluteTimeGetCurrent() - start
print("Firebase init: \(duration * 1000)ms")
```

### Defer SDK Initialization

```swift
func application(...) -> Bool {
    // ✅ Critical SDKs only
    CrashReporter.initialize()
    
    // ✅ Defer analytics
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        Analytics.initialize()
        AdSDK.initialize()
    }
    
    return true
}
```

## Benchmarking

### Baseline Measurement

```swift
class LaunchBenchmark {
    static var launchStart: CFAbsoluteTime = 0
    
    static func recordLaunchStart() {
        launchStart = CFAbsoluteTimeGetCurrent()
    }
    
    static func recordFirstFrame() {
        let duration = CFAbsoluteTimeGetCurrent() - launchStart
        print("Launch time: \(duration * 1000)ms")
        
        // Send to analytics
        Analytics.track("app_launch_time", value: duration)
    }
}

// In AppDelegate
func application(...) -> Bool {
    LaunchBenchmark.recordLaunchStart()
    // ... setup
    return true
}

// In first view controller
override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    LaunchBenchmark.recordFirstFrame()
}
```

## Best Practices

1. **Measure First**: Use Instruments to identify bottlenecks
2. **Defer Everything**: Only critical UI setup in launch path
3. **Lazy Load**: Initialize on first use, not at launch
4. **Background Work**: Move heavy tasks off main thread
5. **Cache Aggressively**: Use cached data, update async
6. **Minimize Dependencies**: Fewer frameworks = faster launch
7. **Profile Regularly**: Track launch time in CI/CD

## Common Pitfalls

### Pitfall 1: Synchronous Network Calls

```swift
// ❌ Never do this
func application(...) -> Bool {
    let config = URLSession.shared.dataTask(...)  // Blocks!
    return true
}
```

### Pitfall 2: Heavy View Controllers

```swift
// ❌ Complex initial VC
class InitialVC: UIViewController {
    let tableView = UITableView()
    let collectionView = UICollectionView()
    let mapView = MKMapView()
    // All initialized at launch!
}
```

### Pitfall 3: Eager Singletons

```swift
// ❌ Initialized at launch
class Manager {
    static let shared = Manager()  // Runs immediately
    
    init() {
        // Heavy setup
    }
}
```

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cold Launch | <400ms | Instruments |
| Warm Launch | <200ms | Instruments |
| Pre-main | <100ms | Instruments |
| First Frame | <16ms | MetricKit |

## Monitoring in Production

```swift
class PerformanceMonitor {
    static func trackLaunch() {
        MXMetricManager.shared.add(self)
    }
    
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            if let launch = payload.applicationLaunchMetrics {
                let p50 = launch.histogrammedTimeToFirstDraw
                    .bucketEnumerator
                    .percentile(50)
                
                if p50 > 400 {
                    // Alert: Launch time degraded
                    alertTeam("Launch time: \(p50)ms")
                }
            }
        }
    }
}
```

## Resources

- [Apple: Reducing Your App's Launch Time](https://developer.apple.com/documentation/xcode/reducing-your-app-s-launch-time)
- [WWDC: App Startup Time](https://developer.apple.com/videos/)
- [Instruments User Guide](https://help.apple.com/instruments/)

## Next Steps

Continue to [Memory Management](./memory-optimization.md) to optimize memory usage.

---

*Content rephrased for compliance with licensing restrictions. Based on Apple documentation and industry best practices.*
