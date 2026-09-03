import Foundation
import Combine

@MainActor
final class AppStore: ObservableObject {
    @Published var routePreferences: RoutePreferences
    @Published private(set) var recommendations: [Meal]
    @Published private(set) var savedMealIDs: Set<UUID>

    private let recommendationService: any RecommendationProviding

    init(
        routePreferences: RoutePreferences = RoutePreferences(),
        recommendationService: any RecommendationProviding = MockRecommendationService()
    ) {
        self.routePreferences = routePreferences
        self.recommendationService = recommendationService
        self.recommendations = recommendationService.recommendations(for: routePreferences)
        self.savedMealIDs = []
    }

    var savedMeals: [Meal] {
        recommendations.filter { savedMealIDs.contains($0.id) }
    }

    func refreshRecommendations() {
        recommendations = recommendationService.recommendations(for: routePreferences)
    }

    func toggleSaved(_ meal: Meal) {
        if savedMealIDs.contains(meal.id) {
            savedMealIDs.remove(meal.id)
        } else {
            savedMealIDs.insert(meal.id)
        }
    }

    func isSaved(_ meal: Meal) -> Bool {
        savedMealIDs.contains(meal.id)
    }
}
