import SwiftUI
import SwiftData

struct ContentView: View {
    @State private var showingNewLog = false

    var body: some View {
        TabView {
            NavigationStack {
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
            .tabItem {
                Label("Logs", systemImage: "list.bullet")
            }

            NavigationStack {
                InsightsView()
                    .navigationTitle("Insights")
            }
            .tabItem {
                Label("Insights", systemImage: "chart.bar.xaxis")
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
    @Query private var logs: [ClimbLog]

    @State private var searchText = ""
    @State private var selectedDiscipline: ClimbDiscipline? = nil
    @State private var selectedOutcome: Outcome? = nil
    @State private var sortOption: LogSortOption = .newestFirst
    @State private var editingLog: ClimbLog? = nil

    private var filteredLogs: [ClimbLog] {
        ClimbAnalytics.filtered(
            logs: logs,
            query: searchText,
            discipline: selectedDiscipline,
            outcome: selectedOutcome,
            sort: sortOption
        )
    }

    var body: some View {
        List {
            filtersSection

            if filteredLogs.isEmpty {
                ContentUnavailableView(
                    "No climbs match your filters.",
                    systemImage: "figure.climbing",
                    description: Text("Adjust filters or log your next climb.")
                )
            } else {
                ForEach(filteredLogs, id: \.persistentModelID) { log in
                    NavigationLink {
                        LogDetailView(log: log)
                    } label: {
                        LogRowView(log: log)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button(role: .destructive) {
                            deleteLog(log)
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }

                        Button {
                            editingLog = log
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        .tint(.blue)
                    }
                }
            }
        }
        .searchable(text: $searchText, prompt: "Search grade, notes, discipline")
        .sheet(
            isPresented: Binding(
                get: { editingLog != nil },
                set: { isPresented in
                    if !isPresented { editingLog = nil }
                }
            )
        ) {
            if let log = editingLog {
                NavigationStack {
                    LogClimbView(logToEdit: log)
                }
            }
        }
    }

    private var filtersSection: some View {
        Section("Filters") {
            Picker("Sort", selection: $sortOption) {
                ForEach(LogSortOption.allCases) { option in
                    Text(option.title).tag(option)
                }
            }

            Picker("Discipline", selection: $selectedDiscipline) {
                Text("All").tag(ClimbDiscipline?.none)
                ForEach(ClimbDiscipline.allCases) { discipline in
                    Text(discipline.title).tag(ClimbDiscipline?.some(discipline))
                }
            }

            Picker("Outcome", selection: $selectedOutcome) {
                Text("All").tag(Outcome?.none)
                ForEach(Outcome.allCases) { outcome in
                    Text(outcome.title).tag(Outcome?.some(outcome))
                }
            }
        }
    }

    private func deleteLog(_ log: ClimbLog) {
        let mediaPaths = log.media.map(\.filePath)
        modelContext.delete(log)
        do {
            try modelContext.save()
            for path in mediaPaths {
                MediaStorage.deleteFile(atPath: path)
            }
        } catch {
            // Keep media files intact when persistence fails.
        }
    }
}

private struct LogRowView: View {
    let log: ClimbLog

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(log.discipline.title)
                    .font(.headline)
                Spacer()
                Text(log.date, format: .dateTime.month().day().year())
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            }

            HStack(spacing: 10) {
                Text(log.formattedGrade)
                    .font(.subheadline)

                StarRow(rating: .constant(log.rating), isInteractive: false)
            }

            if let gym = log.gym {
                Label(gym.name, systemImage: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(log.outcome.title)
                .font(.caption)
                .foregroundStyle(.secondary)

            if !log.notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text(log.notes)
                    .lineLimit(1)
                    .foregroundStyle(.secondary)
                    .font(.subheadline)
            }
        }
        .padding(.vertical, 4)
    }
}

private struct InsightsView: View {
    @Query private var logs: [ClimbLog]

    private var summary: ClimbSummaryStats {
        ClimbAnalytics.summary(for: logs)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if logs.isEmpty {
                    ContentUnavailableView(
                        "No insights yet",
                        systemImage: "chart.bar.xaxis",
                        description: Text("Start logging climbs to see your trends.")
                    )
                } else {
                    statCard(title: "Total Logs", value: "\(summary.totalLogs)", systemImage: "number.square")
                    statCard(title: "Sends", value: "\(summary.sends)", systemImage: "checkmark.circle")
                    statCard(title: "Flashes", value: "\(summary.flashes)", systemImage: "bolt")
                    statCard(
                        title: "Average Rating",
                        value: String(format: "%.1f / 5", summary.averageRating),
                        systemImage: "star"
                    )

                    if let topDiscipline = summary.topDiscipline {
                        statCard(title: "Top Discipline", value: topDiscipline.title, systemImage: "figure.climbing")
                    }
                }
            }
            .padding()
        }
    }

    private func statCard(title: String, value: String, systemImage: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: systemImage)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title2.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
