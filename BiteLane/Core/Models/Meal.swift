import Foundation

struct Meal: Identifiable, Hashable {
    let id: UUID
    let name: String
    let cuisine: String
    let venue: String
    let distanceText: String
    let priceText: String
    let matchReason: String
    let symbolName: String

    init(
        id: UUID = UUID(),
        name: String,
        cuisine: String,
        venue: String,
        distanceText: String,
        priceText: String,
        matchReason: String,
        symbolName: String
    ) {
        self.id = id
        self.name = name
        self.cuisine = cuisine
        self.venue = venue
        self.distanceText = distanceText
        self.priceText = priceText
        self.matchReason = matchReason
        self.symbolName = symbolName
    }
}
