# A/B Testing Framework

> Data-driven optimization for maximum revenue conversion

## Overview

A/B testing is essential for optimizing monetization. Small changes in paywall design, pricing, or messaging can dramatically impact conversion rates and revenue.

## Testing Infrastructure

### A/B Testing Framework
```swift
import Foundation

protocol ABTestable {
    var testID: String { get }
    var variant: String { get }
}

class ABTestManager {
    static let shared = ABTestManager()
    private var activeTests: [String: ABTest] = [:]
    
    func getVariant(for testID: String) -> String {
        if let test = activeTests[testID] {
            return test.getVariant(for: getCurrentUserID())
        }
        return "control"
    }
    
    func trackEvent(_ event: String, testID: String, properties: [String: Any] = [:]) {
        let variant = getVariant(for: testID)
        
        var eventProperties = properties
        eventProperties["test_id"] = testID
        eventProperties["variant"] = variant
        
        Analytics.track(event, properties: eventProperties)
    }
}

struct ABTest {
    let id: String
    let variants: [String: Double] // variant: traffic %
    let startDate: Date
    let endDate: Date
    
    func getVariant(for userID: String) -> String {
        let hash = userID.hash
        let bucket = abs(hash) % 100
        
        var cumulative = 0.0
        for (variant, percentage) in variants {
            cumulative += percentage * 100
            if Double(bucket) < cumulative {
                return variant
            }
        }
        return "control"
    }
}
```

### Test Configuration
```swift
// Remote config for easy updates
struct TestConfig: Codable {
    let paywallPriceTest: ABTest
    let paywallDesignTest: ABTest
    let trialLengthTest: ABTest
    let onboardingTest: ABTest
}

class RemoteConfigManager {
    func fetchTestConfig() async throws -> TestConfig {
        let url = URL(string: "https://api.yourapp.com/ab-tests")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(TestConfig.self, from: data)
    }
}
```

## Paywall Testing

### Price Point Testing
```swift
struct PaywallPriceTest: ABTestable {
    let testID = "paywall_price_v1"
    let variant: String
    
    var pricing: PricingTier {
        switch variant {
        case "low_price":
            return PricingTier(monthly: 4.99, yearly: 39.99)
        case "medium_price":
            return PricingTier(monthly: 7.99, yearly: 59.99)
        case "high_price":
            return PricingTier(monthly: 9.99, yearly: 79.99)
        default: // control
            return PricingTier(monthly: 6.99, yearly: 49.99)
        }
    }
}

struct PricingTier {
    let monthly: Double
    let yearly: Double
    
    var yearlyDiscount: Double {
        let monthlyAnnual = monthly * 12
        return (monthlyAnnual - yearly) / monthlyAnnual
    }
}
```

### Paywall Design Variants
```swift
enum PaywallDesign: String, CaseIterable {
    case control = "control"
    case minimal = "minimal"
    case feature_focused = "feature_focused"
    case social_proof = "social_proof"
    case urgency = "urgency"
}

struct PaywallView: View {
    let design: PaywallDesign
    let pricing: PricingTier
    
    var body: some View {
        switch design {
        case .control:
            StandardPaywallView(pricing: pricing)
        case .minimal:
            MinimalPaywallView(pricing: pricing)
        case .feature_focused:
            FeaturePaywallView(pricing: pricing)
        case .social_proof:
            SocialProofPaywallView(pricing: pricing)
        case .urgency:
            UrgencyPaywallView(pricing: pricing)
        }
    }
}
```

### Trial Length Testing
```swift
struct TrialTest: ABTestable {
    let testID = "trial_length_v2"
    let variant: String
    
    var trialDays: Int {
        switch variant {
        case "short_trial":
            return 3
        case "medium_trial":
            return 7
        case "long_trial":
            return 14
        default: // control
            return 7
        }
    }
    
    var trialCopy: String {
        switch trialDays {
        case 3:
            return "3-Day Free Trial"
        case 7:
            return "Free 7-Day Trial"
        case 14:
            return "14 Days Free"
        default:
            return "Free Trial"
        }
    }
}
```

## Messaging & Copy Testing

### Value Proposition Testing
```swift
enum ValueProposition: String, CaseIterable {
    case time_saving = "Save 2+ hours daily"
    case results_focused = "Get results 3x faster"
    case expert_guidance = "Expert-designed workouts"
    case community = "Join 1M+ active users"
}

struct MessageTest: ABTestable {
    let testID = "value_prop_v1"
    let variant: String
    
    var headline: String {
        switch variant {
        case "time_saving":
            return "Save 2+ Hours Daily with AI Workouts"
        case "results_focused":
            return "Get Fit 3x Faster with Personalized Plans"
        case "expert_guidance":
            return "Expert-Designed Workouts for Every Level"
        case "community":
            return "Join 1M+ Users Transforming Their Lives"
        default:
            return "Transform Your Fitness Journey"
        }
    }
}
```

### CTA Button Testing
```swift
struct CTATest: ABTestable {
    let testID = "cta_button_v1"
    let variant: String
    
    var buttonText: String {
        switch variant {
        case "start_trial":
            return "Start Free Trial"
        case "get_premium":
            return "Get Premium"
        case "unlock_features":
            return "Unlock All Features"
        case "join_now":
            return "Join Now"
        default:
            return "Subscribe Now"
        }
    }
    
    var buttonColor: Color {
        switch variant {
        case "green":
            return .green
        case "orange":
            return .orange
        case "purple":
            return .purple
        default:
            return .blue
        }
    }
}
```

## Onboarding Testing

### Onboarding Flow Variants
```swift
enum OnboardingFlow: String, CaseIterable {
    case short = "short" // 2 screens
    case standard = "standard" // 4 screens  
    case detailed = "detailed" // 6 screens
    case interactive = "interactive" // 5 screens with interactions
}

struct OnboardingTest: ABTestable {
    let testID = "onboarding_v3"
    let variant: String
    
    var flow: OnboardingFlow {
        OnboardingFlow(rawValue: variant) ?? .standard
    }
    
    var screens: [OnboardingScreen] {
        switch flow {
        case .short:
            return [.welcome, .permissions]
        case .standard:
            return [.welcome, .goals, .experience, .permissions]
        case .detailed:
            return [.welcome, .goals, .experience, .preferences, .notifications, .permissions]
        case .interactive:
            return [.welcome, .goalSetting, .quickWorkout, .results, .permissions]
        }
    }
}
```

### Permission Timing Test
```swift
struct PermissionTest: ABTestable {
    let testID = "permission_timing_v1"
    let variant: String
    
    var requestTiming: PermissionTiming {
        switch variant {
        case "immediate":
            return .onLaunch
        case "after_onboarding":
            return .afterOnboarding
        case "contextual":
            return .whenNeeded
        default:
            return .afterOnboarding
        }
    }
}

enum PermissionTiming {
    case onLaunch
    case afterOnboarding
    case whenNeeded
}
```

## Feature Gate Testing

### Feature Access Testing
```swift
struct FeatureGateTest: ABTestable {
    let testID = "feature_gate_v1"
    let variant: String
    
    var freeFeatureLimit: Int {
        switch variant {
        case "generous":
            return 10 // 10 free workouts
        case "limited":
            return 3  // 3 free workouts
        case "freemium":
            return 5  // 5 free workouts
        default:
            return 5
        }
    }
    
    var gateMessage: String {
        switch variant {
        case "soft_gate":
            return "Unlock unlimited workouts with Premium"
        case "hard_gate":
            return "Subscribe to continue your fitness journey"
        case "value_gate":
            return "Get 50+ premium workouts for just $6.99/month"
        default:
            return "Upgrade to Premium for unlimited access"
        }
    }
}
```

## Analytics & Measurement

### Conversion Funnel Tracking
```swift
struct ConversionFunnel {
    let testID: String
    let variant: String
    
    func trackStep(_ step: FunnelStep, properties: [String: Any] = [:]) {
        ABTestManager.shared.trackEvent(
            step.rawValue,
            testID: testID,
            properties: properties
        )
    }
}

enum FunnelStep: String {
    case paywallShown = "paywall_shown"
    case priceSelected = "price_selected"
    case purchaseStarted = "purchase_started"
    case purchaseCompleted = "purchase_completed"
    case subscriptionActivated = "subscription_activated"
}
```

### Revenue Metrics
```swift
struct RevenueMetrics {
    let testID: String
    let variant: String
    let conversionRate: Double
    let averageRevenuePerUser: Double
    let lifetimeValue: Double
    let churnRate: Double
    
    var revenuePerVisitor: Double {
        conversionRate * averageRevenuePerUser
    }
    
    var statisticalSignificance: Double {
        // Calculate using proper statistical methods
        return calculateSignificance()
    }
}
```

### Statistical Analysis
```swift
class StatisticalAnalyzer {
    func calculateSignificance(
        controlConversions: Int,
        controlVisitors: Int,
        testConversions: Int,
        testVisitors: Int
    ) -> (pValue: Double, isSignificant: Bool) {
        
        let controlRate = Double(controlConversions) / Double(controlVisitors)
        let testRate = Double(testConversions) / Double(testVisitors)
        
        // Z-test for proportions
        let pooledRate = Double(controlConversions + testConversions) / Double(controlVisitors + testVisitors)
        let standardError = sqrt(pooledRate * (1 - pooledRate) * (1.0/Double(controlVisitors) + 1.0/Double(testVisitors)))
        
        let zScore = (testRate - controlRate) / standardError
        let pValue = 2 * (1 - normalCDF(abs(zScore)))
        
        return (pValue, pValue < 0.05)
    }
    
    private func normalCDF(_ x: Double) -> Double {
        // Approximation of normal CDF
        return 0.5 * (1 + erf(x / sqrt(2)))
    }
}
```

## Test Management

### Test Lifecycle
```swift
enum TestStatus {
    case draft
    case running
    case paused
    case completed
    case archived
}

struct TestManager {
    func createTest(_ test: ABTest) throws {
        // Validate test configuration
        guard test.variants.values.reduce(0, +) == 1.0 else {
            throw TestError.invalidTrafficAllocation
        }
        
        // Check for conflicts with existing tests
        try validateNoConflicts(test)
        
        // Save test configuration
        saveTest(test)
    }
    
    func pauseTest(_ testID: String) {
        // Pause test but keep collecting data
        updateTestStatus(testID, status: .paused)
    }
    
    func completeTest(_ testID: String, winningVariant: String) {
        // Mark test complete and implement winner
        updateTestStatus(testID, status: .completed)
        implementWinner(testID, variant: winningVariant)
    }
}
```

### Sample Size Calculator
```swift
struct SampleSizeCalculator {
    func calculateSampleSize(
        baselineConversion: Double,
        minimumDetectableEffect: Double,
        power: Double = 0.8,
        significance: Double = 0.05
    ) -> Int {
        
        let alpha = significance
        let beta = 1 - power
        
        let p1 = baselineConversion
        let p2 = baselineConversion * (1 + minimumDetectableEffect)
        
        let pooledP = (p1 + p2) / 2
        let pooledVariance = pooledP * (1 - pooledP)
        
        let zAlpha = 1.96 // For 95% confidence
        let zBeta = 0.84  // For 80% power
        
        let numerator = pow(zAlpha + zBeta, 2) * 2 * pooledVariance
        let denominator = pow(p2 - p1, 2)
        
        return Int(ceil(numerator / denominator))
    }
}
```

## Best Practices

### Test Design
1. **Single Variable**: Test one element at a time
2. **Statistical Power**: Ensure adequate sample size
3. **Duration**: Run tests for full business cycles
4. **Segmentation**: Consider user segments
5. **Documentation**: Record hypotheses and learnings

### Implementation
```swift
// Example: Proper test implementation
class PaywallViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let testVariant = ABTestManager.shared.getVariant(for: "paywall_design_v2")
        let design = PaywallDesign(rawValue: testVariant) ?? .control
        
        setupPaywall(design: design)
        
        // Track exposure
        ABTestManager.shared.trackEvent("paywall_shown", testID: "paywall_design_v2")
    }
    
    @IBAction func subscribeButtonTapped() {
        ABTestManager.shared.trackEvent("subscribe_clicked", testID: "paywall_design_v2")
        // Handle subscription
    }
}
```

### Common Pitfalls
- **Peeking**: Don't stop tests early based on interim results
- **Multiple Testing**: Adjust significance levels for multiple comparisons
- **Seasonal Effects**: Account for time-based variations
- **Sample Ratio Mismatch**: Ensure proper traffic allocation
- **Novelty Effect**: Consider user adaptation to changes

A/B testing is crucial for optimizing monetization, but requires proper statistical rigor and systematic implementation.
