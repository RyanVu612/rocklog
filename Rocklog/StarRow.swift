import SwiftUI

struct StarRow: View {
    @Binding var rating: Int
    var isInteractive: Bool

    private let maxRating = 5

    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...maxRating, id: \.self) { i in
                Image(systemName: i <= rating ? "star.fill" : "star")
                    .font(.title3)
                    .onTapGesture {
                        guard isInteractive else { return }
                        rating = i
                    }
                    .accessibilityLabel("\(i) star")
            }
        }
    }
}