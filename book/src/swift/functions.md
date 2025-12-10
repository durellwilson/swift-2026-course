# Functions & Closures

## Basic Functions

```swift
func greet(name: String) -> String {
    return "Hello, \(name)!"
}

func add(_ a: Int, _ b: Int) -> Int {
    a + b // Implicit return
}

func processData(_ data: [Int], using processor: (Int) -> Int) -> [Int] {
    return data.map(processor)
}
```

## Parameter Labels

```swift
func move(from start: Point, to end: Point) -> Double {
    // External labels: from, to
    // Internal names: start, end
}

let distance = move(from: Point(0, 0), to: Point(3, 4))
```

## Default Parameters

```swift
func createUser(name: String, age: Int = 18, isActive: Bool = true) -> User {
    User(name: name, age: age, isActive: isActive)
}

let user1 = createUser(name: "Alice")
let user2 = createUser(name: "Bob", age: 25)
```

## Variadic Parameters

```swift
func average(_ numbers: Double...) -> Double {
    let sum = numbers.reduce(0, +)
    return sum / Double(numbers.count)
}

let avg = average(1.0, 2.0, 3.0, 4.0, 5.0)
```

## In-Out Parameters

```swift
func swapValues<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

var x = 5
var y = 10
swapValues(&x, &y) // x = 10, y = 5
```

## Closures

### Basic Syntax
```swift
let multiply = { (a: Int, b: Int) -> Int in
    return a * b
}

// Simplified
let add = { $0 + $1 }
```

### Trailing Closures
```swift
let numbers = [1, 2, 3, 4, 5]

// Traditional syntax
let doubled = numbers.map({ $0 * 2 })

// Trailing closure
let tripled = numbers.map { $0 * 3 }

// Multiple trailing closures
UIView.animate(withDuration: 0.3) {
    view.alpha = 0.5
} completion: { _ in
    print("Animation complete")
}
```

### Capturing Values
```swift
func makeIncrementer(incrementAmount: Int) -> () -> Int {
    var total = 0
    return {
        total += incrementAmount
        return total
    }
}

let incrementByTwo = makeIncrementer(incrementAmount: 2)
print(incrementByTwo()) // 2
print(incrementByTwo()) // 4
```

### Escaping Closures
```swift
class NetworkManager {
    var completionHandlers: [() -> Void] = []
    
    func fetchData(completion: @escaping () -> Void) {
        completionHandlers.append(completion)
    }
}
```

## Higher-Order Functions

### Map, Filter, Reduce
```swift
let numbers = [1, 2, 3, 4, 5]

let squared = numbers.map { $0 * $0 }
let evens = numbers.filter { $0 % 2 == 0 }
let sum = numbers.reduce(0) { $0 + $1 }

// Chaining
let result = numbers
    .filter { $0 > 2 }
    .map { $0 * 2 }
    .reduce(0, +)
```

### CompactMap
```swift
let strings = ["1", "2", "three", "4", "five"]
let numbers = strings.compactMap { Int($0) } // [1, 2, 4]
```

### FlatMap
```swift
let arrays = [[1, 2], [3, 4], [5, 6]]
let flattened = arrays.flatMap { $0 } // [1, 2, 3, 4, 5, 6]
```

## Function Types

```swift
typealias MathOperation = (Int, Int) -> Int

let operations: [String: MathOperation] = [
    "add": { $0 + $1 },
    "subtract": { $0 - $1 },
    "multiply": { $0 * $1 }
]

func calculate(_ a: Int, _ b: Int, using operation: MathOperation) -> Int {
    return operation(a, b)
}
```

## Async Functions

```swift
func fetchUserData(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Usage
Task {
    do {
        let user = try await fetchUserData(id: "123")
        print(user.name)
    } catch {
        print("Error: \(error)")
    }
}
```

## Throwing Functions

```swift
enum ValidationError: Error {
    case tooShort
    case tooLong
    case invalidCharacters
}

func validatePassword(_ password: String) throws -> Bool {
    guard password.count >= 8 else {
        throw ValidationError.tooShort
    }
    
    guard password.count <= 128 else {
        throw ValidationError.tooLong
    }
    
    return true
}

// Usage
do {
    try validatePassword("abc")
} catch ValidationError.tooShort {
    print("Password too short")
} catch {
    print("Other error: \(error)")
}
```
