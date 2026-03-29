import SwiftUI
import AVKit

struct LogDetailView: View {
    let log: ClimbLog

    @State private var showingEditSheet = false

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
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            NavigationStack {
                LogClimbView(logToEdit: log)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(log.discipline.title)
                    .font(.title2.bold())
                Spacer()
                Text(log.date, format: .dateTime.month().day().year().hour().minute())
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            }

            HStack(spacing: 10) {
                Text(log.formattedGrade)
                StarRow(rating: .constant(log.rating), isInteractive: false)
            }
            .font(.subheadline)

            Text("Outcome: \(log.outcome.title)")
                .foregroundStyle(.secondary)
                .font(.subheadline)

            if let gym = log.gym {
                Label(gym.name, systemImage: "mappin.and.ellipse")
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            }
        }
    }

    @ViewBuilder
    private var mediaSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Media")
                .font(.headline)

            ForEach(log.media, id: \.id) { item in
                if item.type == .photo {
                    if let image = UIImage(contentsOfFile: item.filePath) {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                } else {
                    VideoPlayer(player: AVPlayer(url: URL(fileURLWithPath: item.filePath)))
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
