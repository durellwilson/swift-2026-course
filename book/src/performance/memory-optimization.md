# Memory Management

> Target: <50MB baseline, zero leaks, efficient allocation patterns

## ARC Fundamentals

### Strong References
```swift
class Person {
    let name: String
    var apartment: Apartment?
    
    init(name: String) {
        self.name = name
    }
}

class Apartment {
    let unit: String
    var tenant: Person?
    
    init(unit: String) {
        self.unit = unit
    }
}

// Strong reference cycle - memory leak!
let john = Person(name: "John")
let unit4A = Apartment(unit: "4A")
john.apartment = unit4A
unit4A.tenant = john
// Neither will be deallocated
```

### Weak References
```swift
class Apartment {
    let unit: String
    weak var tenant: Person? // Breaks the cycle
    
    init(unit: String) {
        self.unit = unit
    }
}
```

### Unowned References
```swift
class Customer {
    let name: String
    var card: CreditCard?
    
    init(name: String) {
        self.name = name
    }
}

class CreditCard {
    let number: UInt64
    unowned let customer: Customer // Always has a customer
    
    init(number: UInt64, customer: Customer) {
        self.number = number
        self.customer = customer
    }
}
```

## Closure Memory Management

### Capture Lists
```swift
class ViewController: UIViewController {
    var name = "ViewController"
    
    func setupTimer() {
        // Strong reference cycle
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            print(self.name) // Captures self strongly
        }
        
        // Fixed with weak self
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            print(self?.name ?? "Unknown")
        }
        
        // Unowned when self is guaranteed to exist
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [unowned self] _ in
            print(self.name)
        }
    }
}
```

### Value Capture
```swift
func createClosure() -> () -> Void {
    let largeData = Data(count: 1_000_000) // 1MB
    
    // Captures entire largeData
    return {
        print(largeData.count)
    }
    
    // Better: capture only what's needed
    let count = largeData.count
    return {
        print(count) // Only captures Int
    }
}
```

## Memory Profiling

### Using Instruments
1. Product → Profile (⌘I)
2. Select "Leaks" or "Allocations" template
3. Look for:
   - Memory leaks (red bars)
   - Growing allocations
   - Large object graphs

### Debug Memory Graph
```swift
// In Xcode debugger
// Debug → View Debugging → Capture Memory Graph
// Look for purple warnings (leaks)
```

### Memory Warnings
```swift
class ViewController: UIViewController {
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        
        // Clear caches
        imageCache.removeAll()
        
        // Release non-essential data
        cachedData = nil
    }
}
```

## Efficient Data Structures

### Choose Right Collection
```swift
// Array: Ordered, indexed access O(1), insertion O(n)
var items: [String] = []

// Set: Unique items, membership test O(1)
var uniqueItems: Set<String> = []

// Dictionary: Key-value pairs, lookup O(1)
var lookup: [String: User] = [:]

// For large datasets with frequent lookups
let userLookup = Dictionary(uniqueKeysWithValues: users.map { ($0.id, $0) })
```

### Memory-Efficient Strings
```swift
// Avoid string concatenation in loops
var result = ""
for item in items {
    result += item // Creates new string each time
}

// Use array joining
let result = items.joined()

// Or string interpolation
let result = "\(item1)\(item2)\(item3)"
```

### Lazy Collections
```swift
let numbers = 1...1_000_000

// Eager evaluation - uses memory
let doubled = numbers.map { $0 * 2 }

// Lazy evaluation - computed on demand
let lazyDoubled = numbers.lazy.map { $0 * 2 }
```

## Image Memory Management

### Downsample Images
```swift
func downsample(imageAt url: URL, to pointSize: CGSize, scale: CGFloat) -> UIImage? {
    let imageSourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
    guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, imageSourceOptions) else {
        return nil
    }
    
    let maxDimensionInPixels = max(pointSize.width, pointSize.height) * scale
    let downsampleOptions = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: maxDimensionInPixels
    ] as CFDictionary
    
    guard let downsampledImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, downsampleOptions) else {
        return nil
    }
    
    return UIImage(cgImage: downsampledImage)
}
```

### Image Caching
```swift
class ImageCache {
    private let cache = NSCache<NSURL, UIImage>()
    
    init() {
        cache.countLimit = 100
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
    }
    
    func image(for url: URL) -> UIImage? {
        return cache.object(forKey: url as NSURL)
    }
    
    func setImage(_ image: UIImage, for url: URL) {
        let cost = image.size.width * image.size.height * 4 // RGBA
        cache.setObject(image, forKey: url as NSURL, cost: Int(cost))
    }
}
```

## Memory Monitoring

### Runtime Monitoring
```swift
import os

func logMemoryUsage() {
    let info = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
    
    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
        $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
            task_info(mach_task_self_,
                     task_flavor_t(MACH_TASK_BASIC_INFO),
                     $0,
                     &count)
        }
    }
    
    if kerr == KERN_SUCCESS {
        let memoryUsage = info.resident_size / 1024 / 1024 // MB
        os_log("Memory usage: %d MB", memoryUsage)
    }
}
```

### Automated Alerts
```swift
class MemoryMonitor {
    private var timer: Timer?
    
    func startMonitoring() {
        timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            let usage = self.getCurrentMemoryUsage()
            if usage > 200 { // 200MB threshold
                self.handleHighMemoryUsage()
            }
        }
    }
    
    private func handleHighMemoryUsage() {
        // Clear caches
        URLCache.shared.removeAllCachedResponses()
        
        // Notify observers
        NotificationCenter.default.post(name: .memoryWarning, object: nil)
    }
}
```

## Best Practices

1. **Use weak/unowned**: Break reference cycles
2. **Profile regularly**: Use Instruments to find leaks
3. **Cache wisely**: Set limits on NSCache
4. **Lazy loading**: Load data when needed
5. **Downsample images**: Don't load full resolution unnecessarily
6. **Monitor in production**: Track memory usage metrics
7. **Handle memory warnings**: Clear non-essential data

## Common Memory Issues

### Delegate Cycles
```swift
// Problem
class Parent {
    var child: Child?
}

class Child {
    var delegate: Parent? // Strong reference cycle
}

// Solution
class Child {
    weak var delegate: Parent?
}
```

### Timer Cycles
```swift
// Problem
class ViewController: UIViewController {
    var timer: Timer?
    
    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.updateUI() // Retains self
        }
    }
}

// Solution
timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
    self?.updateUI()
}
```

### Large Object Retention
```swift
// Problem: Retaining large objects unnecessarily
class DataProcessor {
    var rawData: Data? // Potentially large
    var processedResult: ProcessedData?
    
    func process() {
        processedResult = processRawData(rawData!)
        // rawData still retained!
    }
}

// Solution: Clear when done
func process() {
    processedResult = processRawData(rawData!)
    rawData = nil // Release immediately
}
```

## Memory Targets

| App Type | Baseline | Peak | Limit |
|----------|----------|------|-------|
| Utility | <30MB | <100MB | 150MB |
| Social | <50MB | <200MB | 300MB |
| Games | <100MB | <500MB | 1GB |
| Media | <80MB | <400MB | 600MB |

Exceeding these limits may result in app termination by iOS.
