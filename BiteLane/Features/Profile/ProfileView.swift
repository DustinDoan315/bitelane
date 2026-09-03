import SwiftUI

struct ProfileView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("profile_section_preferences") {
                    Label("profile_language", systemImage: "globe")
                    Label("profile_notifications", systemImage: "bell")
                }

                Section("profile_section_about") {
                    Label("profile_help", systemImage: "questionmark.circle")
                    Label("profile_privacy", systemImage: "hand.raised")
                }
            }
            .navigationTitle("tab_profile")
        }
    }
}
