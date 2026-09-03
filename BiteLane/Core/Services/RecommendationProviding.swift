import Foundation

protocol RecommendationProviding {
    func recommendations(for preferences: RoutePreferences) -> [Meal]
}
