import SwiftUI

struct EmptyStateView: View {
    let titleKey: LocalizedStringKey
    let messageKey: LocalizedStringKey

    var body: some View {
        ContentUnavailableView {
            Label(titleKey, systemImage: "bookmark")
        } description: {
            Text(messageKey)
        }
    }
}
