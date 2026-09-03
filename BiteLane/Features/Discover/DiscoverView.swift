import SwiftUI

struct DiscoverView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("discover_eyebrow")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(BiteLaneTheme.accent)
                        Text("discover_heading")
                            .font(.largeTitle.bold())
                        Text("discover_supporting_text")
                            .foregroundStyle(.secondary)
                    }

                    RouteSummaryCard(preferences: store.routePreferences)

                    VStack(alignment: .leading, spacing: 12) {
                        Text("recommendations_heading")
                            .font(.title2.bold())

                        ForEach(store.recommendations) { meal in
                            NavigationLink {
                                MealDetailView(meal: meal)
                            } label: {
                                MealCard(
                                    meal: meal,
                                    isSaved: store.isSaved(meal),
                                    onToggleSaved: { store.toggleSaved(meal) }
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding()
            }
            .background(BiteLaneTheme.pageBackground)
            .navigationTitle("app_name")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        store.refreshRecommendations()
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .accessibilityLabel(Text("accessibility_refresh"))
                }
            }
        }
    }
}

private struct MealDetailView: View {
    @EnvironmentObject private var store: AppStore
    let meal: Meal

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Image(systemName: meal.symbolName)
                    .font(.system(size: 64))
                    .foregroundStyle(BiteLaneTheme.accent)
                    .frame(maxWidth: .infinity)
                    .frame(height: 180)
                    .background(BiteLaneTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 24))

                VStack(alignment: .leading, spacing: 8) {
                    Text(meal.name)
                        .font(.largeTitle.bold())
                    Text(meal.venue)
                        .font(.headline)
                    Text(meal.cuisine)
                        .foregroundStyle(.secondary)
                }

                Label(meal.matchReason, systemImage: "sparkles")
                    .foregroundStyle(BiteLaneTheme.accent)

                HStack {
                    Label(meal.distanceText, systemImage: "figure.walk")
                    Spacer()
                    Text(meal.priceText)
                }
                .foregroundStyle(.secondary)

                Button {
                    store.toggleSaved(meal)
                } label: {
                    Label(
                        store.isSaved(meal) ? "saved_remove" : "saved_add",
                        systemImage: store.isSaved(meal) ? "bookmark.fill" : "bookmark"
                    )
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(BiteLaneTheme.accent)
            }
            .padding()
        }
        .background(BiteLaneTheme.pageBackground)
        .navigationTitle("meal_detail_title")
        .navigationBarTitleDisplayMode(.inline)
    }
}
