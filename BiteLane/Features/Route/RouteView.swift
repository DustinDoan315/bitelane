import SwiftUI

struct RouteView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("route_origin_placeholder", text: $store.routePreferences.origin)
                        .textContentType(.fullStreetAddress)
                    TextField("route_destination_placeholder", text: $store.routePreferences.destination)
                        .textContentType(.fullStreetAddress)
                } header: {
                    Text("route_section_header")
                } footer: {
                    Text("route_section_footer")
                }

                Section("route_preferences_header") {
                    Picker("route_budget_label", selection: $store.routePreferences.budget) {
                        ForEach(Budget.allCases) { budget in
                            Text(budget.displayName).tag(budget)
                        }
                    }

                    TextField("route_mood_placeholder", text: $store.routePreferences.mood)
                }

                Section {
                    Button("route_update_button") {
                        store.refreshRecommendations()
                    }
                    .disabled(!store.routePreferences.hasRoute)
                }
            }
            .navigationTitle("tab_route")
        }
    }
}
