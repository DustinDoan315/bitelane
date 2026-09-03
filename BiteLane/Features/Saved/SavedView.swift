import SwiftUI

struct SavedView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        NavigationStack {
            Group {
                if store.savedMeals.isEmpty {
                    EmptyStateView(
                        titleKey: "saved_empty_title",
                        messageKey: "saved_empty_message"
                    )
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(store.savedMeals) { meal in
                                MealCard(
                                    meal: meal,
                                    isSaved: true,
                                    onToggleSaved: { store.toggleSaved(meal) }
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .background(BiteLaneTheme.pageBackground)
            .navigationTitle("tab_saved")
        }
    }
}
