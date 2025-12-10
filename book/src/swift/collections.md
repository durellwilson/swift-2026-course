# Collections & Control Flow

## Arrays

```swift
var numbers = [1, 2, 3, 4, 5]
numbers.append(6)
numbers.insert(0, at: 0)
numbers.remove(at: 1)

// Iteration
for number in numbers {
    print(number)
}

// Functional methods
let doubled = numbers.map { $0 * 2 }
let evens = numbers.filter { $0 % 2 == 0 }
let sum = numbers.reduce(0, +)
```

## Sets

```swift
var fruits: Set<String> = ["apple", "banana", "orange"]
fruits.insert("grape")
fruits.remove("banana")

let vegetables: Set = ["carrot", "broccoli", "spinach"]
let intersection = fruits.intersection(vegetables)
let union = fruits.union(vegetables)
```

## Dictionaries

```swift
var scores = ["Alice": 95, "Bob": 87, "Charlie": 92]
scores["David"] = 88
scores.updateValue(90, forKey: "Alice")

for (name, score) in scores {
    print("\(name): \(score)")
}

let names = Array(scores.keys)
let values = Array(scores.values)
```

## Control Flow

### If Statements
```swift
let temperature = 25

if temperature > 30 {
    print("Hot")
} else if temperature > 20 {
    print("Warm")
} else {
    print("Cool")
}
```

### Switch Statements
```swift
let grade = "A"

switch grade {
case "A":
    print("Excellent")
case "B", "C":
    print("Good")
case "D":
    print("Pass")
default:
    print("Fail")
}

// Pattern matching
let point = (2, 3)
switch point {
case (0, 0):
    print("Origin")
case (_, 0):
    print("On x-axis")
case (0, _):
    print("On y-axis")
case (-2...2, -2...2):
    print("Inside box")
default:
    print("Outside")
}
```

### Loops
```swift
// For-in loops
for i in 1...5 {
    print(i)
}

for i in stride(from: 0, to: 10, by: 2) {
    print(i) // 0, 2, 4, 6, 8
}

// While loops
var count = 0
while count < 5 {
    print(count)
    count += 1
}

// Repeat-while
repeat {
    print("At least once")
} while false
```

## Advanced Collection Operations

### Chaining Operations
```swift
let words = ["hello", "world", "swift", "programming"]
let result = words
    .filter { $0.count > 4 }
    .map { $0.uppercased() }
    .sorted()
    .joined(separator: ", ")
```

### Lazy Evaluation
```swift
let numbers = 1...1000000
let result = numbers
    .lazy
    .filter { $0 % 2 == 0 }
    .map { $0 * $0 }
    .prefix(10)
```

### Custom Collections
```swift
struct Queue<T> {
    private var items: [T] = []
    
    mutating func enqueue(_ item: T) {
        items.append(item)
    }
    
    mutating func dequeue() -> T? {
        return items.isEmpty ? nil : items.removeFirst()
    }
    
    var isEmpty: Bool {
        return items.isEmpty
    }
}
```
