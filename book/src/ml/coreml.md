# Core ML

> **On-device machine learning for Apple platforms**

## 🎯 Overview

Core ML optimizes on-device performance for machine learning models across all Apple platforms.

**Official**: [Core ML Documentation](https://developer.apple.com/documentation/coreml)

## 🚀 Quick Start

### 1. Add Model to Project

```swift
// Drag .mlmodel or .mlpackage into Xcode
// Xcode automatically generates Swift interface
```

### 2. Basic Prediction

```swift
import CoreML

class ImageClassifier {
    private let model: MobileNetV2
    
    init() throws {
        model = try MobileNetV2(configuration: .init())
    }
    
    func classify(image: UIImage) throws -> String {
        // Convert to CVPixelBuffer
        guard let pixelBuffer = image.pixelBuffer(
            width: 224,
            height: 224
        ) else {
            throw ClassificationError.invalidImage
        }
        
        // Predict
        let output = try model.prediction(image: pixelBuffer)
        return output.classLabel
    }
}

enum ClassificationError: Error {
    case invalidImage
}
```

**Tutorial**: [Integrating a Core ML Model](https://developer.apple.com/documentation/coreml/integrating-a-core-ml-model-into-your-app)

## 🔧 Model Configuration

### Compute Units

```swift
let config = MLModelConfiguration()

// Neural Engine + CPU (recommended)
config.computeUnits = .cpuAndNeuralEngine

// All available (GPU + Neural Engine + CPU)
config.computeUnits = .all

// CPU only
config.computeUnits = .cpuOnly

let model = try await YourModel.load(configuration: config)
```

### Performance Options

```swift
let config = MLModelConfiguration()

// Allow lower precision for better performance
config.allowLowPrecisionAccumulationOnGPU = true

// Prefer Metal for GPU operations
config.preferredMetalDevice = MTLCreateSystemDefaultDevice()

// Model deployment options
config.modelDisplayName = "My ML Model"
```

**Reference**: [MLModelConfiguration](https://developer.apple.com/documentation/coreml/mlmodelconfiguration)

## 📊 Model Types

### Image Classification

```swift
import Vision
import CoreML

class VisionClassifier {
    private let model: VNCoreMLModel
    
    init() throws {
        let mlModel = try MobileNetV2(configuration: .init()).model
        model = try VNCoreMLModel(for: mlModel)
    }
    
    func classify(image: CGImage) async throws -> [VNClassificationObservation] {
        let request = VNCoreMLRequest(model: model)
        let handler = VNImageRequestHandler(cgImage: image)
        
        try handler.perform([request])
        
        guard let results = request.results as? [VNClassificationObservation] else {
            return []
        }
        
        return results.sorted { $0.confidence > $1.confidence }
    }
}
```

### Object Detection

```swift
class ObjectDetector {
    private let model: VNCoreMLModel
    
    init() throws {
        let mlModel = try YOLOv8(configuration: .init()).model
        model = try VNCoreMLModel(for: mlModel)
    }
    
    func detect(in image: CGImage) async throws -> [VNRecognizedObjectObservation] {
        let request = VNCoreMLRequest(model: model)
        request.imageCropAndScaleOption = .scaleFill
        
        let handler = VNImageRequestHandler(cgImage: image)
        try handler.perform([request])
        
        guard let results = request.results as? [VNRecognizedObjectObservation] else {
            return []
        }
        
        return results.filter { $0.confidence > 0.5 }
    }
}
```

**Guide**: [Classifying Images with Vision and Core ML](https://developer.apple.com/documentation/vision/classifying-images-with-vision-and-core-ml)

### Text Classification

```swift
import NaturalLanguage

class SentimentAnalyzer {
    private let model: NLModel
    
    init() throws {
        guard let modelURL = Bundle.main.url(
            forResource: "SentimentClassifier",
            withExtension: "mlmodelc"
        ) else {
            throw AnalyzerError.modelNotFound
        }
        
        model = try NLModel(contentsOf: modelURL)
    }
    
    func analyzeSentiment(text: String) -> String? {
        model.predictedLabel(for: text)
    }
}
```

## 🎯 Async Predictions

### Single Prediction

```swift
actor ModelPredictor {
    private let model: MLModel
    
    init(model: MLModel) {
        self.model = model
    }
    
    func predict(input: MLFeatureProvider) async throws -> MLFeatureProvider {
        try await model.prediction(from: input)
    }
}

// Usage
let predictor = ModelPredictor(model: yourModel)
let result = try await predictor.predict(input: inputFeatures)
```

### Batch Predictions

```swift
actor BatchPredictor {
    private let model: MLModel
    
    func predictBatch(_ inputs: [MLFeatureProvider]) async throws -> [MLFeatureProvider] {
        let batchProvider = MLArrayBatchProvider(array: inputs)
        let results = try await model.predictions(from: batchProvider)
        
        return (0..<results.count).map { results.features(at: $0) }
    }
}
```

**Documentation**: [Making Predictions with Core ML](https://developer.apple.com/documentation/coreml/making-predictions-with-core-ml)

## 🔄 Model Updates

### On-Device Training

```swift
class PersonalizedModel {
    private var model: MLModel
    private let modelURL: URL
    
    init(modelURL: URL) throws {
        self.modelURL = modelURL
        self.model = try MLModel(contentsOf: modelURL)
    }
    
    func update(with trainingData: MLBatchProvider) async throws {
        let updateTask = try MLUpdateTask(
            forModelAt: modelURL,
            trainingData: trainingData,
            configuration: MLModelConfiguration(),
            completionHandler: { context in
                if context.task.state == .completed {
                    print("Training completed")
                }
            }
        )
        
        updateTask.resume()
        
        // Wait for completion
        for await progress in updateTask.progress {
            print("Progress: \(progress.fractionCompleted)")
        }
        
        // Load updated model
        self.model = try MLModel(contentsOf: modelURL)
    }
}
```

**WWDC**: [WWDC19 - Training Models on Device](https://developer.apple.com/videos/play/wwdc2019/228/)

## 🎨 Model Conversion

### From PyTorch

```python
import torch
import coremltools as ct

# Load PyTorch model
model = YourPyTorchModel()
model.eval()

# Trace model
example_input = torch.rand(1, 3, 224, 224)
traced_model = torch.jit.trace(model, example_input)

# Convert to Core ML
mlmodel = ct.convert(
    traced_model,
    inputs=[ct.ImageType(
        name="input",
        shape=(1, 3, 224, 224),
        scale=1/255.0
    )],
    outputs=[ct.TensorType(name="output")],
    compute_precision=ct.precision.FLOAT16
)

# Add metadata
mlmodel.author = "Your Name"
mlmodel.short_description = "Model description"
mlmodel.version = "1.0"

# Save
mlmodel.save("YourModel.mlpackage")
```

### From TensorFlow

```python
import tensorflow as tf
import coremltools as ct

# Load TensorFlow model
model = tf.keras.models.load_model('model.h5')

# Convert
mlmodel = ct.convert(
    model,
    inputs=[ct.ImageType(shape=(1, 224, 224, 3))],
    compute_precision=ct.precision.FLOAT16
)

mlmodel.save("TFModel.mlpackage")
```

**Tools**: [Core ML Tools](https://coremltools.readme.io/)

## ⚡ Performance Optimization

### 1. Quantization

```python
# Quantize to INT8
mlmodel_quantized = ct.models.neural_network.quantization_utils.quantize_weights(
    mlmodel,
    nbits=8
)
```

### 2. Model Pruning

```python
# Prune weights
from coremltools.optimize.torch import pruning

config = pruning.MagnitudePrunerConfig(
    target_sparsity=0.5,
    granularity="per_channel"
)

pruner = pruning.MagnitudePruner(model, config)
pruned_model = pruner.compress()
```

### 3. Neural Engine Optimization

```swift
// Ensure model uses Neural Engine
let config = MLModelConfiguration()
config.computeUnits = .cpuAndNeuralEngine

// Check if Neural Engine is being used
let model = try await YourModel.load(configuration: config)
print("Using Neural Engine: \(model.configuration.computeUnits == .cpuAndNeuralEngine)")
```

**Guide**: [Optimizing Model Performance](https://developer.apple.com/documentation/coreml/optimizing-model-performance)

## 📱 Platform-Specific Features

### iOS

```swift
#if os(iOS)
import UIKit

extension UIImage {
    func pixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        let attrs = [
            kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
            kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue
        ] as CFDictionary
        
        var pixelBuffer: CVPixelBuffer?
        let status = CVPixelBufferCreate(
            kCFAllocatorDefault,
            width,
            height,
            kCVPixelFormatType_32ARGB,
            attrs,
            &pixelBuffer
        )
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
        
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        )
        
        context?.draw(cgImage!, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        return buffer
    }
}
#endif
```

### macOS

```swift
#if os(macOS)
import AppKit

class MacMLProcessor {
    func processImage(_ image: NSImage) async throws -> String {
        guard let cgImage = image.cgImage(
            forProposedRect: nil,
            context: nil,
            hints: nil
        ) else {
            throw ProcessingError.invalidImage
        }
        
        // Process with Core ML
        let classifier = try ImageClassifier()
        return try classifier.classify(cgImage: cgImage)
    }
}
#endif
```

## 🔒 Privacy

### On-Device Processing

```swift
actor PrivateMLProcessor {
    private let model: MLModel
    
    // All data stays on device
    func processPrivateData(_ data: Data) async throws -> Result {
        let input = try prepareInput(data)
        let output = try await model.prediction(from: input)
        return parseOutput(output)
    }
    
    // Never send data to server
    private func prepareInput(_ data: Data) throws -> MLFeatureProvider {
        // Local processing only
        fatalError("Implement input preparation")
    }
}
```

**Privacy Guide**: [User Privacy and Data Use](https://developer.apple.com/documentation/coreml/user-privacy-and-data-use)

## 📊 Benchmarking

```swift
import CoreML

class ModelBenchmark {
    func benchmark(model: MLModel, iterations: Int = 100) async throws -> TimeInterval {
        let input = try createSampleInput()
        
        let start = Date()
        
        for _ in 0..<iterations {
            _ = try await model.prediction(from: input)
        }
        
        let elapsed = Date().timeIntervalSince(start)
        let average = elapsed / Double(iterations)
        
        print("Average inference time: \(average * 1000)ms")
        return average
    }
    
    private func createSampleInput() throws -> MLFeatureProvider {
        // Create sample input
        fatalError("Implement sample input")
    }
}
```

## 📚 Official Resources

### Documentation
- [Core ML Framework](https://developer.apple.com/documentation/coreml)
- [Core ML Tools](https://coremltools.readme.io/)
- [Model Gallery](https://developer.apple.com/machine-learning/models/)

### WWDC Sessions
- [WWDC25 - What's New in Core ML](https://developer.apple.com/videos/wwdc2025/)
- [WWDC23 - Optimize Core ML Performance](https://developer.apple.com/videos/play/wwdc2023/10049/)
- [WWDC22 - Get to Know Core ML](https://developer.apple.com/videos/play/wwdc2022/10027/)

### Sample Code
- [Classifying Images](https://developer.apple.com/documentation/vision/classifying-images-with-vision-and-core-ml)
- [Detecting Objects](https://developer.apple.com/documentation/vision/detecting-objects-in-still-images)

## 🔗 Next Steps

- [Create ML →](./createml.md)
- [Vision Framework →](./vision.md)
- [Foundation Models →](./foundation-models.md)

---

**Sources**:
- Apple Developer Documentation (2025)
- Core ML Tools Documentation
- WWDC 2022-2025 Sessions
- [Core ML Survival Guide](https://github.com/hollance/CoreML-Survival-Guide)
