import SwiftUI

struct MealCard: View {
    let meal: Meal
    let isSaved: Bool
    let onToggleSaved: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: meal.symbolName)
                    .font(.title2)
                    .foregroundStyle(BiteLaneTheme.accent)
                    .frame(width: 48, height: 48)
                    .background(BiteLaneTheme.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: 14))

                VStack(alignment: .leading, spacing: 4) {
                    Text(meal.name)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(meal.cuisine)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(meal.venue)
                        .font(.subheadline.weight(.medium))
                }

                Spacer(minLength: 8)

                Button(action: onToggleSaved) {
                    Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                        .foregroundStyle(BiteLaneTheme.accent)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(isSaved ? "accessibility_remove_saved" : "accessibility_save_meal"))
            }

            Text(meal.matchReason)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack {
                Label(meal.distanceText, systemImage: "figure.walk")
                Spacer()
                Text(meal.priceText)
                    .fontWeight(.semibold)
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding()
        .background(BiteLaneTheme.cardBackground, in: RoundedRectangle(cornerRadius: 20))
    }
}
