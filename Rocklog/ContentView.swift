import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var showingNewLog = false

    var body: some View {
        NavigationView {
            LogListView()
                .navigationTitle("Rock Log")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            showingNewLog = true
                        } label: {
                            Image(systemName: "plus")
                        }
                    }
                }
        }
        .sheet(isPresented: $showingNewLog) {
            NavigationStack {
                LogClimbView()
            }
        }
    }
}

struct LogListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \ClimbLog.date, order: .reverse) private var logs: [ClimbLog]

    var body: some View {
        List {
            if logs.isEmpty {
                ContentUnavailableView (
                    "No climbs logged yet.",
                    systemImage: "figure.climbing",
                    description: Text("Tap the + button to log your first climb.")
                )
            } else {
                ForEach(logs) { log in
                    NavigationLink {
                        LogDetailView(log: log)
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(log.discipline.rawValue.capitalized)
                                    .font(.headline)
                                Spacer()
                                Text(log.date, format: .dateTime.month().day().year())
                                    .foregroundStyle(.secondary)
                                    .font(.subheadline)
                            }

                            HStack(spacing: 10) {
                                Text(displayGrade(log))
                                    .font(.subheadline)

                                StarRow(rating: .constant(log.rating), isInteractive: false)
                            }

                            if !log.notes.trimmingCharacters(in: .whitespacesAndNewLines).isEmpty {
                                Text(log.notes)
                                    .lineLimit(1)
                                    .foregroundStyle(.secondary)
                                    .font(.subheadline)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                .onDelete { indexSet in
                    for i in indexSet {
                        modelContext.delete(logs[i])
                    }
                }
            }
        }
    }

    private func displayGrade(_ log: ClimbLog) -> String {
        let g = log.grade.trimmingCharacters(in: .whitespacesAndNewlines)
        if g.isEmpty { return "No Grade"}
        return "\(log.gradeSystemLabel) \(g)"
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
