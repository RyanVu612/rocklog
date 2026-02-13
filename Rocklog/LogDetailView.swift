import SwiftUI
import AVKit

import SwiftUI
import AVKit

struct LogDetailView: View {
    let log: ClimbLog

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                header

                if !log.media.isEmpty {
                    mediaSection
                }

                if !log.notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Text(log.notes)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(.thinMaterial)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding()
        }
        .navigationTitle("Climb")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(log.discipline.rawValue.capitalized)
                    .font(.title2).bold()
                Spacer()
                Text(log.date, format: .dateTime.month().day().year().hour().minute())
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            }

            HStack(spacing: 10) {
                Text(displayGrade)
                StarRow(rating: .constant(log.rating), isInteractive: false)
            }
            .font(.subheadline)

            Text("Outcome: \(log.outcome.rawValue.capitalized)")
                .foregroundStyle(.secondary)
                .font(.subheadline)
        }
    }

    private var displayGrade: String {
        let g = log.grade.trimmingCharacters(in: .whitespacesAndNewlines)
        if g.isEmpty { return "No grade" }
        return "\(log.gradeSystemLabel) \(g)"
    }

    @ViewBuilder
    private var mediaSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Media").font(.headline)

            ForEach(log.media, id: \.id) { item in
                if item.type == .photo {
                    if let img = UIImage(contentsOfFile: item.filePath) {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                } else {
                    let url = URL(fileURLWithPath: item.filePath)
                    VideoPlayer(player: AVPlayer(url: url))
                        .frame(height: 240)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private extension ClimbLog {
    var gradeSystemLabel: String {
        switch gradeSystem {
        case .vScale: return "V"
        case .font: return "Font"
        case .yds: return "YDS"
        case .french: return "French"
        case .uiAA: return "UIAA"
        }
    }
}
