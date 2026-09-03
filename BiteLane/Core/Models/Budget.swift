import Foundation

enum Budget: String, CaseIterable, Identifiable, Hashable {
    case any
    case value
    case premium

    var id: Self { self }

    var displayName: String {
        switch self {
        case .any: return String(localized: "budget_any")
        case .value: return String(localized: "budget_value")
        case .premium: return String(localized: "budget_premium")
        }
    }
}
