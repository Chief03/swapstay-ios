import ExpoModulesCore
import SwiftUI

// Native Swift module for SwapStay functionality
public class SwapstayNativeModule: Module {
    public func definition() -> ModuleDefinition {
        Name("SwapstayNative")
        
        // Native functions that can be called from JavaScript
        AsyncFunction("verifyStudent") { (email: String) -> Bool in
            // Native Swift logic to verify .edu email
            return email.hasSuffix(".edu")
        }
        
        AsyncFunction("calculateSwapMatch") { (listing1: [String: Any], listing2: [String: Any]) -> Double in
            // Native Swift algorithm for matching compatibility
            // This would have complex logic in production
            return Double.random(in: 0.7...1.0)
        }
        
        AsyncFunction("getDeviceInfo") { () -> [String: Any] in
            return [
                "platform": "iOS",
                "version": UIDevice.current.systemVersion,
                "model": UIDevice.current.model
            ]
        }
        
        // Haptic feedback using native iOS APIs
        AsyncFunction("triggerHaptic") { (type: String) in
            let impact = UIImpactFeedbackGenerator()
            switch type {
            case "light":
                impact.impactOccurred(intensity: 0.3)
            case "medium":
                impact.impactOccurred(intensity: 0.6)
            case "heavy":
                impact.impactOccurred(intensity: 1.0)
            default:
                impact.impactOccurred()
            }
        }
        
        // Native date formatter
        AsyncFunction("formatDate") { (timestamp: Double) -> String in
            let date = Date(timeIntervalSince1970: timestamp)
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            formatter.timeStyle = .short
            return formatter.string(from: date)
        }
    }
}

// SwiftUI Views that can be used in React Native
struct SwapStayCard: View {
    let title: String
    let university: String
    let rating: Double
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
            Text(university)
                .font(.subheadline)
                .foregroundColor(.blue)
            HStack {
                Image(systemName: "star.fill")
                    .foregroundColor(.yellow)
                Text(String(format: "%.1f", rating))
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(10)
        .shadow(radius: 5)
    }
}