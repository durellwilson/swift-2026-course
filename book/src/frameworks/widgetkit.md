# WidgetKit

> **Build a weather widget in 20 minutes**

## 🎯 What You'll Build

A home screen widget that:
- ✅ Shows live data
- ✅ Updates automatically
- ✅ Multiple sizes
- ✅ Interactive buttons
- ✅ Deep links to app

## 🚀 Step 1: Create Widget Extension

In Xcode: **File → New → Target → Widget Extension**

Name it: `WeatherWidget`

## 📱 Step 2: Basic Widget

```swift
import WidgetKit
import SwiftUI

struct WeatherWidget: Widget {
    let kind: String = "WeatherWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WeatherWidgetView(entry: entry)
        }
        .configurationDisplayName("Weather")
        .description("Current weather conditions")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct WeatherEntry: TimelineEntry {
    let date: Date
    let temperature: Int
    let condition: String
    let icon: String
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry {
        WeatherEntry(date: Date(), temperature: 72, condition: "Sunny", icon: "sun.max.fill")
    }
    
    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> Void) {
        let entry = WeatherEntry(date: Date(), temperature: 72, condition: "Sunny", icon: "sun.max.fill")
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<WeatherEntry>) -> Void) {
        Task {
            let weather = try await fetchWeather()
            let entry = WeatherEntry(
                date: Date(),
                temperature: weather.temperature,
                condition: weather.condition,
                icon: weather.icon
            )
            
            // Update every 15 minutes
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
    
    private func fetchWeather() async throws -> Weather {
        // Fetch from API
        Weather(temperature: 72, condition: "Sunny", icon: "sun.max.fill")
    }
}

struct WeatherWidgetView: View {
    let entry: WeatherEntry
    
    var body: some View {
        VStack {
            Image(systemName: entry.icon)
                .font(.largeTitle)
            Text("\(entry.temperature)°")
                .font(.title)
            Text(entry.condition)
                .font(.caption)
        }
        .containerBackground(.blue.gradient, for: .widget)
    }
}

struct Weather {
    let temperature: Int
    let condition: String
    let icon: String
}
```

## 🎨 Multiple Sizes

```swift
struct WeatherWidgetView: View {
    let entry: WeatherEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWeatherView(entry: entry)
        case .systemMedium:
            MediumWeatherView(entry: entry)
        case .systemLarge:
            LargeWeatherView(entry: entry)
        default:
            SmallWeatherView(entry: entry)
        }
    }
}

struct SmallWeatherView: View {
    let entry: WeatherEntry
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: entry.icon)
                .font(.system(size: 40))
            Text("\(entry.temperature)°")
                .font(.system(size: 36, weight: .bold))
        }
        .containerBackground(.blue.gradient, for: .widget)
    }
}

struct MediumWeatherView: View {
    let entry: WeatherEntry
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("\(entry.temperature)°")
                    .font(.system(size: 48, weight: .bold))
                Text(entry.condition)
                    .font(.title3)
            }
            
            Spacer()
            
            Image(systemName: entry.icon)
                .font(.system(size: 60))
        }
        .padding()
        .containerBackground(.blue.gradient, for: .widget)
    }
}

struct LargeWeatherView: View {
    let entry: WeatherEntry
    
    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Text("\(entry.temperature)°")
                    .font(.system(size: 72, weight: .bold))
                Image(systemName: entry.icon)
                    .font(.system(size: 72))
            }
            
            Text(entry.condition)
                .font(.title)
            
            // Hourly forecast
            HStack {
                ForEach(0..<5) { hour in
                    VStack {
                        Text("\(hour + 1)h")
                            .font(.caption)
                        Image(systemName: "cloud.fill")
                        Text("70°")
                            .font(.caption)
                    }
                }
            }
        }
        .containerBackground(.blue.gradient, for: .widget)
    }
}
```

## 🔄 Interactive Widgets

```swift
import AppIntents

struct RefreshWeatherIntent: AppIntent {
    static var title: LocalizedStringResource = "Refresh Weather"
    
    func perform() async throws -> some IntentResult {
        // Trigger widget refresh
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct InteractiveWeatherView: View {
    let entry: WeatherEntry
    
    var body: some View {
        VStack {
            Text("\(entry.temperature)°")
                .font(.largeTitle)
            
            Button(intent: RefreshWeatherIntent()) {
                Label("Refresh", systemImage: "arrow.clockwise")
            }
            .buttonStyle(.bordered)
        }
        .containerBackground(.blue.gradient, for: .widget)
    }
}
```

## 🎯 Deep Links

```swift
struct WeatherWidgetView: View {
    let entry: WeatherEntry
    
    var body: some View {
        VStack {
            Text("\(entry.temperature)°")
                .font(.largeTitle)
        }
        .containerBackground(.blue.gradient, for: .widget)
        .widgetURL(URL(string: "myapp://weather")!)
    }
}

// In main app
.onOpenURL { url in
    if url.scheme == "myapp", url.host == "weather" {
        // Navigate to weather screen
    }
}
```

## 📊 App Intent Configuration

```swift
struct WeatherWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: "WeatherWidget",
            intent: WeatherConfigIntent.self,
            provider: Provider()
        ) { entry in
            WeatherWidgetView(entry: entry)
        }
    }
}

struct WeatherConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Weather Location"
    
    @Parameter(title: "City")
    var city: String?
}
```

## 🎨 Lock Screen Widgets

```swift
struct LockScreenWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LockScreen", provider: Provider()) { entry in
            LockScreenView(entry: entry)
        }
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}

struct LockScreenView: View {
    let entry: WeatherEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: Double(entry.temperature), in: 0...100) {
                Image(systemName: entry.icon)
            }
            
        case .accessoryRectangular:
            HStack {
                Image(systemName: entry.icon)
                VStack(alignment: .leading) {
                    Text("\(entry.temperature)°")
                        .font(.headline)
                    Text(entry.condition)
                        .font(.caption)
                }
            }
            
        case .accessoryInline:
            Text("\(entry.temperature)° \(entry.condition)")
            
        default:
            EmptyView()
        }
    }
}
```

## 🔄 Live Activities

```swift
import ActivityKit

struct WeatherActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var temperature: Int
        var condition: String
    }
    
    var city: String
}

// Start activity
func startWeatherActivity() throws {
    let attributes = WeatherActivityAttributes(city: "Detroit")
    let state = WeatherActivityAttributes.ContentState(
        temperature: 72,
        condition: "Sunny"
    )
    
    let activity = try Activity.request(
        attributes: attributes,
        content: .init(state: state, staleDate: nil)
    )
}

// Widget for Live Activity
struct WeatherActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: WeatherActivityAttributes.self) { context in
            // Lock screen UI
            HStack {
                Image(systemName: "sun.max.fill")
                VStack(alignment: .leading) {
                    Text("\(context.state.temperature)°")
                    Text(context.state.condition)
                }
            }
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "sun.max.fill")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.temperature)°")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.condition)
                }
            } compactLeading: {
                Image(systemName: "sun.max.fill")
            } compactTrailing: {
                Text("\(context.state.temperature)°")
            } minimal: {
                Image(systemName: "sun.max.fill")
            }
        }
    }
}
```

## 🎯 Shared Data

```swift
// In app and widget
let sharedDefaults = UserDefaults(suiteName: "group.com.yourapp.weather")!

// Save in app
sharedDefaults.set(72, forKey: "temperature")

// Read in widget
let temperature = sharedDefaults.integer(forKey: "temperature")
```

## 📊 Timeline Strategies

```swift
// Update every hour
let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))

// Update at specific time
let midnight = Calendar.current.startOfDay(for: Date().addingTimeInterval(86400))
let timeline = Timeline(entries: [entry], policy: .after(midnight))

// Never update (static)
let timeline = Timeline(entries: [entry], policy: .never)

// Update ASAP
let timeline = Timeline(entries: [entry], policy: .atEnd)
```

## 🎨 Best Practices

### 1. Keep It Simple

```swift
// ✅ Good: Clear at a glance
Text("\(temperature)°")
    .font(.largeTitle)

// ❌ Bad: Too much info
VStack {
    Text("Temperature: \(temperature)°F")
    Text("Feels like: \(feelsLike)°F")
    Text("Humidity: \(humidity)%")
    Text("Wind: \(wind) mph")
}
```

### 2. Use Placeholders

```swift
func placeholder(in context: Context) -> WeatherEntry {
    WeatherEntry(
        date: Date(),
        temperature: 72,
        condition: "Sunny",
        icon: "sun.max.fill"
    )
}
```

### 3. Handle Errors Gracefully

```swift
func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    Task {
        do {
            let weather = try await fetchWeather()
            let entry = WeatherEntry(from: weather)
            completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(900))))
        } catch {
            // Show cached data or placeholder
            let fallback = WeatherEntry(date: Date(), temperature: 72, condition: "Unavailable", icon: "exclamationmark.triangle")
            completion(Timeline(entries: [fallback], policy: .after(Date().addingTimeInterval(300))))
        }
    }
}
```

## 🚀 Testing

```swift
// Preview
#Preview(as: .systemSmall) {
    WeatherWidget()
} timeline: {
    WeatherEntry(date: Date(), temperature: 72, condition: "Sunny", icon: "sun.max.fill")
    WeatherEntry(date: Date(), temperature: 68, condition: "Cloudy", icon: "cloud.fill")
}
```

## 💡 Performance Tips

1. **Limit network calls** - Cache data
2. **Use App Groups** - Share data efficiently
3. **Optimize images** - Use SF Symbols when possible
4. **Keep timelines short** - 5-10 entries max
5. **Test on device** - Simulator doesn't show true performance

## 📚 Resources

- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [WWDC23 - Bring widgets to life](https://developer.apple.com/videos/play/wwdc2023/10028/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/widgets)

## 🔗 Next Steps

- [AppIntents →](./appintents.md)
- [SwiftData →](./swiftdata.md)

---

**Try it**: Add a widget to your app. Users love home screen widgets!
