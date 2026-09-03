import SwiftUI

struct OnboardingView: View {
    let onContinue: () -> Void

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            Image(systemName: "fork.knife.circle.fill")
                .font(.system(size: 88))
                .foregroundStyle(BiteLaneTheme.accent)

            VStack(spacing: 12) {
                Text("app_name")
                    .font(.largeTitle.bold())
                Text("onboarding_subtitle")
                    .font(.title3.weight(.medium))
                    .multilineTextAlignment(.center)
                Text("onboarding_body")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()

            Button(action: onContinue) {
                Text("onboarding_cta")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(BiteLaneTheme.accent)
            .padding(.horizontal)
            .padding(.bottom)
        }
        .padding()
    }
}
