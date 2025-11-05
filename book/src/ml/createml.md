# Create ML

> **Train a custom image classifier in 15 minutes**

## 🎯 What You'll Build

A custom ML model that:
- ✅ Classifies your own images
- ✅ Runs on-device
- ✅ Works offline
- ✅ No coding required for training

## 🚀 Step 1: Prepare Training Data

### Folder Structure

```
TrainingData/
├── cats/
│   ├── cat1.jpg
│   ├── cat2.jpg
│   └── cat3.jpg (at least 10 images)
├── dogs/
│   ├── dog1.jpg
│   ├── dog2.jpg
│   └── dog3.jpg (at least 10 images)
└── birds/
    ├── bird1.jpg
    ├── bird2.jpg
    └── bird3.jpg (at least 10 images)
```

**Requirements**:
- Minimum 10 images per category
- More images = better accuracy
- Diverse images (different angles, lighting)

## 📱 Step 2: Train in Create ML App

1. Open **Create ML** app (in Xcode)
2. Choose **Image Classification**
3. Drag training folder
4. Click **Train**
5. Wait 5-10 minutes
6. Export `.mlmodel` file

**That's it!** No code needed.

## 💻 Step 3: Use in Your App

```swift
import CoreML
import Vision
import UIKit

class ImageClassifier {
    private let model: VNCoreMLModel
    
    init() throws {
        // Load your trained model
        let mlModel = try PetClassifier(configuration: .init()).model
        model = try VNCoreMLModel(for: mlModel)
    }
    
    func classify(image: UIImage) async throws -> String {
        guard let cgImage = image.cgImage else {
            throw ClassificationError.invalidImage
        }
        
        let request = VNCoreMLRequest(model: model)
        let handler = VNImageRequestHandler(cgImage: cgImage)
        
        try handler.perform([request])
        
        guard let results = request.results as? [VNClassificationObservation],
              let topResult = results.first else {
            throw ClassificationError.noResults
        }
        
        return "\(topResult.identifier) (\(Int(topResult.confidence * 100))%)"
    }
}

enum ClassificationError: Error {
    case invalidImage
    case noResults
}

// SwiftUI View
struct ClassifierView: View {
    @State private var selectedImage: UIImage?
    @State private var result = ""
    @State private var showingPicker = false
    
    var body: some View {
        VStack(spacing: 20) {
            if let image = selectedImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 300)
            }
            
            Button("Select Image") {
                showingPicker = true
            }
            .buttonStyle(.borderedProminent)
            
            if !result.isEmpty {
                Text(result)
                    .font(.title2)
                    .fontWeight(.bold)
            }
        }
        .sheet(isPresented: $showingPicker) {
            ImagePicker(image: $selectedImage)
        }
        .onChange(of: selectedImage) { _, newImage in
            if let image = newImage {
                classifyImage(image)
            }
        }
    }
    
    private func classifyImage(_ image: UIImage) {
        Task {
            do {
                let classifier = try ImageClassifier()
                result = try await classifier.classify(image: image)
            } catch {
                result = "Error: \(error.localizedDescription)"
            }
        }
    }
}
```

## 🎯 Training Tips

### 1. Data Quality Matters

```
✅ Good training data:
- 50+ images per category
- Varied angles and lighting
- Different backgrounds
- Clear subject

❌ Bad training data:
- < 10 images per category
- All similar photos
- Blurry images
- Watermarks
```

### 2. Augmentation

Create ML automatically applies:
- Rotation
- Flipping
- Cropping
- Color adjustment

**Result**: 10 images → 100+ training variations

### 3. Validation Split

Create ML uses:
- 80% for training
- 20% for validation

**Check validation accuracy** - should be > 90%

## 📊 Model Evaluation

### Confusion Matrix

```
Predicted:  Cat   Dog   Bird
Actual:
Cat         45    3     2     (90% accurate)
Dog         2     48    0     (96% accurate)
Bird        1     1     48    (96% accurate)
```

**Read it**: 
- Diagonal = correct predictions
- Off-diagonal = mistakes

### Metrics

```swift
// In Create ML app, check:
Training Accuracy: 95%
Validation Accuracy: 92%

// If validation << training:
// → Overfitting (need more data)
```

## 🎨 Advanced: Custom Training

```swift
import CreateML

// Programmatic training
let trainingData = try MLImageClassifier.DataSource.labeledDirectories(
    at: URL(fileURLWithPath: "/path/to/training")
)

let validationData = try MLImageClassifier.DataSource.labeledDirectories(
    at: URL(fileURLWithPath: "/path/to/validation")
)

let classifier = try MLImageClassifier(
    trainingData: trainingData,
    validationData: validationData,
    parameters: .init(
        maxIterations: 25,
        augmentation: [.crop, .rotate, .flip]
    )
)

// Save model
try classifier.write(to: URL(fileURLWithPath: "/path/to/model.mlmodel"))

// Check accuracy
let evaluation = classifier.evaluation(on: validationData)
print("Accuracy: \(evaluation.classificationError)")
```

## 🔄 Transfer Learning

Create ML uses **transfer learning**:
1. Starts with pre-trained model (ResNet, MobileNet)
2. Replaces last layer with your categories
3. Fine-tunes on your data

**Benefit**: Great accuracy with small datasets

## 🎯 Other Model Types

### Text Classification

```swift
import CreateML

let data = try MLDataTable(contentsOf: csvURL)

let classifier = try MLTextClassifier(
    trainingData: data,
    textColumn: "text",
    labelColumn: "label"
)

try classifier.write(to: modelURL)
```

**Use case**: Spam detection, sentiment analysis

### Tabular Classification

```swift
let classifier = try MLClassifier(
    trainingData: data,
    targetColumn: "price"
)
```

**Use case**: Price prediction, recommendation

### Sound Classification

```swift
let classifier = try MLSoundClassifier(
    trainingData: soundData
)
```

**Use case**: Voice commands, sound detection

## 🚀 Optimization

### Model Size

```swift
// In Create ML:
Model Size: 5.2 MB

// Reduce size:
1. Use MobileNet (smaller than ResNet)
2. Quantize to INT8
3. Prune unused layers
```

### Inference Speed

```
iPhone 16 Pro:
- MobileNet: 20ms
- ResNet: 50ms
- Custom CNN: 100ms

Choose based on accuracy vs speed needs
```

## 💡 Real-World Example: Food Classifier

### 1. Collect Data

```
FoodData/
├── pizza/      (50 images)
├── burger/     (50 images)
├── sushi/      (50 images)
└── salad/      (50 images)
```

### 2. Train Model

- Open Create ML
- Drag FoodData folder
- Train (10 minutes)
- Validation accuracy: 94%

### 3. Integrate

```swift
struct FoodScannerView: View {
    @State private var result = ""
    
    var body: some View {
        VStack {
            CameraView { image in
                classifyFood(image)
            }
            
            Text(result)
                .font(.title)
        }
    }
    
    private func classifyFood(_ image: UIImage) {
        Task {
            let classifier = try FoodClassifier()
            result = try await classifier.classify(image: image)
        }
    }
}
```

### 4. Add Nutrition Info

```swift
let nutritionData: [String: NutritionInfo] = [
    "pizza": NutritionInfo(calories: 285, protein: 12),
    "burger": NutritionInfo(calories: 354, protein: 17),
    "sushi": NutritionInfo(calories: 200, protein: 9),
    "salad": NutritionInfo(calories: 150, protein: 5)
]

struct NutritionInfo {
    let calories: Int
    let protein: Int
}
```

## 🎯 Best Practices

### 1. Start Simple

```
First model:
- 3-5 categories
- 50 images each
- Test accuracy

Then expand:
- Add more categories
- Collect more data
- Improve accuracy
```

### 2. Test on Real Data

```swift
// Don't just test on training data!
let testImages = [
    "real_photo_1.jpg",
    "real_photo_2.jpg",
    "real_photo_3.jpg"
]

for image in testImages {
    let result = try await classifier.classify(image: image)
    print("\(image): \(result)")
}
```

### 3. Handle Edge Cases

```swift
func classify(image: UIImage) async throws -> String {
    let result = try await classifier.classify(image: image)
    
    // Check confidence
    if result.confidence < 0.7 {
        return "Not sure - please try another photo"
    }
    
    return result.label
}
```

## 📚 Resources

- [Create ML Documentation](https://developer.apple.com/documentation/createml)
- [WWDC23 - Create ML](https://developer.apple.com/videos/play/wwdc2023/10043/)
- [Sample Datasets](https://www.kaggle.com/datasets)

## 🔗 Next Steps

- [Core ML →](./coreml.md) - Deploy your model
- [Vision Framework →](./vision.md) - Image processing
- [Foundation Models →](./foundation-models.md) - Advanced ML

---

**Try it**: Train a classifier for your own use case. Takes 15 minutes!
