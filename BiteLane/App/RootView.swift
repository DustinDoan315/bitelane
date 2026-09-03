import SwiftUI

struct RootView: View {
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var selectedTab: AppTab = .discover

    var body: some View {
        Group {
            if hasCompletedOnboarding {
                MainTabView(selectedTab: $selectedTab)
            } else {
                OnboardingView {
                    hasCompletedOnboarding = true
                }
            }
        }
    }
}

private struct MainTabView: View {
    @Binding var selectedTab: AppTab

    var body: some View {
        TabView(selection: $selectedTab) {
            DiscoverView()
                .tabItem {
                    Label("tab_discover", systemImage: "fork.knife")
                }
                .tag(AppTab.discover)

            RouteView()
                .tabItem {
                    Label("tab_route", systemImage: "point.topleft.down.to.point.bottomright.curvepath")
                }
                .tag(AppTab.route)

            SavedView()
                .tabItem {
                    Label("tab_saved", systemImage: "bookmark")
                }
                .tag(AppTab.saved)

            ProfileView()
                .tabItem {
                    Label("tab_profile", systemImage: "person.crop.circle")
                }
                .tag(AppTab.profile)
        }
        .tint(BiteLaneTheme.accent)
    }
}
