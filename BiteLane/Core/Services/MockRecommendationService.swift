import Foundation

struct MockRecommendationService: RecommendationProviding {
    func recommendations(for preferences: RoutePreferences) -> [Meal] {
        [
            Meal(
                id: UUID(uuidString: "00000000-0000-0000-0000-000000000001")!,
                name: "Cơm tấm sườn nướng",
                cuisine: "Vietnamese · Rice",
                venue: "Bếp Nhà Lane",
                distanceText: "4 min detour",
                priceText: "₫₫",
                matchReason: "Fast, filling, and close to your route",
                symbolName: "takeoutbag.and.cup.and.straw"
            ),
            Meal(
                id: UUID(uuidString: "00000000-0000-0000-0000-000000000002")!,
                name: "Bún bò Huế",
                cuisine: "Vietnamese · Noodles",
                venue: "Món Ngon Corner",
                distanceText: "7 min detour",
                priceText: "₫₫",
                matchReason: "A warm, spicy pick for a low-key lunch",
                symbolName: "flame"
            ),
            Meal(
                id: UUID(uuidString: "00000000-0000-0000-0000-000000000003")!,
                name: "Salmon grain bowl",
                cuisine: "Healthy · Bowl",
                venue: "Green Stop",
                distanceText: "9 min detour",
                priceText: "₫₫₫",
                matchReason: "A lighter option with a premium feel",
                symbolName: "leaf"
            )
        ]
    }
}
