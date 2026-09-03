import XCTest
@testable import BiteLane

final class MockRecommendationServiceTests: XCTestCase {
    func testMockServiceReturnsStarterRecommendations() {
        let service = MockRecommendationService()

        let meals = service.recommendations(for: RoutePreferences())

        XCTAssertEqual(meals.count, 3)
        XCTAssertEqual(meals.first?.name, "Cơm tấm sườn nướng")
    }

    @MainActor
    func testStoreCanToggleSavedMeals() {
        let store = AppStore()
        let meal = try! XCTUnwrap(store.recommendations.first)

        XCTAssertFalse(store.isSaved(meal))
        store.toggleSaved(meal)
        XCTAssertTrue(store.isSaved(meal))
        store.toggleSaved(meal)
        XCTAssertFalse(store.isSaved(meal))
    }
}
