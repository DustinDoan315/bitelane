import Foundation

struct RoutePreferences: Equatable {
    var origin = ""
    var destination = ""
    var budget: Budget = .any
    var mood = ""

    var hasRoute: Bool {
        !origin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !destination.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var summaryText: String {
        guard hasRoute else { return String(localized: "route_summary_empty") }
        return "\(origin) → \(destination)"
    }
}
