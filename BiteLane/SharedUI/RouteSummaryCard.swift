import SwiftUI

struct RouteSummaryCard: View {
    let preferences: RoutePreferences

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "location.north.line")
                .foregroundStyle(BiteLaneTheme.accent)

            VStack(alignment: .leading, spacing: 3) {
                Text("route_card_title")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(preferences.summaryText)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(2)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.bold))
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(BiteLaneTheme.cardBackground, in: RoundedRectangle(cornerRadius: 16))
    }
}
