# macOS 26

> **Build a menu bar app in 25 minutes**

## 🎯 What You'll Build

A menu bar utility that:
- ✅ Lives in menu bar
- ✅ Shows quick info
- ✅ Global keyboard shortcuts
- ✅ Native macOS feel

## 🚀 Step 1: Menu Bar App

```swift
import SwiftUI

@main
struct MenuBarApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        Settings {
            SettingsView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var popover: NSPopover?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create menu bar item
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        
        if let button = statusItem?.button {
            button.image = NSImage(systemSymbolName: "cloud.fill", accessibilityDescription: "Weather")
            button.action = #selector(togglePopover)
            button.target = self
        }
        
        // Create popover
        popover = NSPopover()
        popover?.contentSize = NSSize(width: 300, height: 400)
        popover?.behavior = .transient
        popover?.contentViewController = NSHostingController(rootView: PopoverView())
    }
    
    @objc func togglePopover() {
        guard let button = statusItem?.button else { return }
        
        if let popover = popover {
            if popover.isShown {
                popover.performClose(nil)
            } else {
                popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            }
        }
    }
}

struct PopoverView: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("72°")
                .font(.system(size: 60, weight: .bold))
            Text("Sunny")
                .font(.title2)
            
            Divider()
            
            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
        }
        .padding()
    }
}
```

## 🎨 Native macOS UI

### Toolbar

```swift
struct ContentView: View {
    var body: some View {
        NavigationSplitView {
            SidebarView()
        } detail: {
            DetailView()
        }
        .toolbar {
            ToolbarItem(placement: .navigation) {
                Button {
                    NSApp.keyWindow?.firstResponder?.tryToPerform(#selector(NSSplitViewController.toggleSidebar(_:)), with: nil)
                } label: {
                    Image(systemName: "sidebar.left")
                }
            }
            
            ToolbarItem {
                Button("Add") {
                    // Add action
                }
            }
        }
    }
}
```

### Window Management

```swift
struct ContentView: View {
    var body: some View {
        Text("Main Content")
            .frame(minWidth: 600, minHeight: 400)
            .onAppear {
                // Set window properties
                if let window = NSApplication.shared.windows.first {
                    window.title = "My App"
                    window.styleMask.insert(.fullSizeContentView)
                    window.titlebarAppearsTransparent = true
                }
            }
    }
}
```

### Context Menus

```swift
struct ItemView: View {
    let item: Item
    
    var body: some View {
        Text(item.name)
            .contextMenu {
                Button("Edit") {
                    // Edit action
                }
                Button("Duplicate") {
                    // Duplicate action
                }
                Divider()
                Button("Delete", role: .destructive) {
                    // Delete action
                }
            }
    }
}
```

## ⌨️ Keyboard Shortcuts

```swift
struct ContentView: View {
    var body: some View {
        Text("Content")
            .onAppear {
                setupKeyboardShortcuts()
            }
    }
    
    private func setupKeyboardShortcuts() {
        // Command+N for new item
        NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            if event.modifierFlags.contains(.command) && event.charactersIgnoringModifiers == "n" {
                createNewItem()
                return nil
            }
            return event
        }
    }
    
    private func createNewItem() {
        // Create new item
    }
}

// Or use SwiftUI commands
struct ContentView: View {
    var body: some View {
        Text("Content")
    }
}

extension ContentView {
    @CommandsBuilder
    var commands: some Commands {
        CommandMenu("Items") {
            Button("New Item") {
                createNewItem()
            }
            .keyboardShortcut("n", modifiers: .command)
            
            Button("Delete Item") {
                deleteItem()
            }
            .keyboardShortcut(.delete, modifiers: .command)
        }
    }
}
```

## 🎯 File Operations

### Open File

```swift
struct FileOpenerView: View {
    @State private var fileContent = ""
    
    var body: some View {
        VStack {
            Text(fileContent)
            
            Button("Open File") {
                openFile()
            }
        }
    }
    
    private func openFile() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.allowedContentTypes = [.text]
        
        if panel.runModal() == .OK, let url = panel.url {
            fileContent = (try? String(contentsOf: url)) ?? "Error reading file"
        }
    }
}
```

### Save File

```swift
private func saveFile(content: String) {
    let panel = NSSavePanel()
    panel.allowedContentTypes = [.text]
    panel.nameFieldStringValue = "document.txt"
    
    if panel.runModal() == .OK, let url = panel.url {
        try? content.write(to: url, atomically: true, encoding: .utf8)
    }
}
```

## 🎨 Drag and Drop

```swift
struct DropZoneView: View {
    @State private var droppedFiles: [URL] = []
    
    var body: some View {
        VStack {
            Text("Drop files here")
                .frame(width: 300, height: 200)
                .background(.gray.opacity(0.2))
                .cornerRadius(10)
                .onDrop(of: [.fileURL], isTargeted: nil) { providers in
                    handleDrop(providers: providers)
                    return true
                }
            
            List(droppedFiles, id: \.self) { url in
                Text(url.lastPathComponent)
            }
        }
    }
    
    private func handleDrop(providers: [NSItemProvider]) {
        for provider in providers {
            provider.loadItem(forTypeIdentifier: "public.file-url", options: nil) { item, error in
                if let data = item as? Data,
                   let url = URL(dataRepresentation: data, relativeTo: nil) {
                    DispatchQueue.main.async {
                        droppedFiles.append(url)
                    }
                }
            }
        }
    }
}
```

## 🎯 System Integration

### Notifications

```swift
import UserNotifications

func sendNotification() {
    let content = UNMutableNotificationContent()
    content.title = "Task Complete"
    content.body = "Your export is ready"
    content.sound = .default
    
    let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: nil
    )
    
    UNUserNotificationCenter.current().add(request)
}
```

### Dock Badge

```swift
// Set badge
NSApp.dockTile.badgeLabel = "5"

// Clear badge
NSApp.dockTile.badgeLabel = nil
```

### Launch at Login

```swift
import ServiceManagement

func enableLaunchAtLogin() {
    try? SMAppService.mainApp.register()
}

func disableLaunchAtLogin() {
    try? SMAppService.mainApp.unregister()
}

var isLaunchAtLoginEnabled: Bool {
    SMAppService.mainApp.status == .enabled
}
```

## 🎨 Multi-Window Support

```swift
@main
struct MultiWindowApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Window") {
                    openNewWindow()
                }
                .keyboardShortcut("n", modifiers: .command)
            }
        }
    }
    
    private func openNewWindow() {
        let newWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 600, height: 400),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        newWindow.center()
        newWindow.contentView = NSHostingView(rootView: ContentView())
        newWindow.makeKeyAndOrderFront(nil)
    }
}
```

## 🎯 Touch Bar (Legacy)

```swift
extension NSTouchBar.CustomizationIdentifier {
    static let myApp = NSTouchBar.CustomizationIdentifier("com.myapp.touchbar")
}

extension NSTouchBarItem.Identifier {
    static let playButton = NSTouchBarItem.Identifier("com.myapp.play")
}

class TouchBarController: NSObject, NSTouchBarDelegate {
    func makeTouchBar() -> NSTouchBar {
        let touchBar = NSTouchBar()
        touchBar.customizationIdentifier = .myApp
        touchBar.defaultItemIdentifiers = [.playButton]
        touchBar.delegate = self
        return touchBar
    }
    
    func touchBar(_ touchBar: NSTouchBar, makeItemForIdentifier identifier: NSTouchBarItem.Identifier) -> NSTouchBarItem? {
        switch identifier {
        case .playButton:
            let button = NSButtonTouchBarItem(identifier: identifier, title: "Play", target: self, action: #selector(play))
            return button
        default:
            return nil
        }
    }
    
    @objc func play() {
        // Play action
    }
}
```

## 🎨 Mac Catalyst

Convert iOS app to macOS:

```swift
// In target settings:
// General → Deployment Info → Mac (Designed for iPad)

// Platform-specific code
#if targetEnvironment(macCatalyst)
// Mac-specific code
#else
// iOS-specific code
#endif
```

## 💡 Best Practices

### 1. Native macOS Patterns

```swift
// ✅ Use NavigationSplitView (not TabView)
NavigationSplitView {
    SidebarView()
} detail: {
    DetailView()
}

// ✅ Use toolbar (not bottom bar)
.toolbar {
    ToolbarItem {
        Button("Action") { }
    }
}
```

### 2. Keyboard First

```swift
// Add keyboard shortcuts for everything
.keyboardShortcut("n", modifiers: .command)
.keyboardShortcut("w", modifiers: .command)
.keyboardShortcut("q", modifiers: .command)
```

### 3. Window Restoration

```swift
struct ContentView: View {
    @SceneStorage("selectedTab") private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Tabs
        }
    }
}
```

## 📚 Resources

- [macOS Documentation](https://developer.apple.com/documentation/macos-release-notes)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos)
- [WWDC25 - What's New in macOS](https://developer.apple.com/videos/wwdc2025/)

## 🔗 Next Steps

- [iOS 26 →](./ios.md)
- [watchOS 26 →](./watchos.md)

---

**Pro tip**: macOS users expect keyboard shortcuts. Add them everywhere!
