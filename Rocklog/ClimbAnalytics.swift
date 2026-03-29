import Foundation

enum LogSortOption: String, CaseIterable, Identifiable {
    case newestFirst
    case oldestFirst
    case ratingHighToLow
    case ratingLowToHigh

    var id: String { rawValue }

    var title: String {
        switch self {
        case .newestFirst:
            return "Newest First"
        case .oldestFirst:
            return "Oldest First"
        case .ratingHighToLow:
            return "Rating High-Low"
        case .ratingLowToHigh:
            return "Rating Low-High"
        }
    }
}

struct ClimbSummaryStats {
    var totalLogs: Int = 0
    var sends: Int = 0
    var flashes: Int = 0
    var averageRating: Double = 0
    var topDiscipline: ClimbDiscipline? = nil
}

enum ClimbAnalytics {
    static func filtered(
        logs: [ClimbLog],
        query: String,
        discipline: ClimbDiscipline?,
        outcome: Outcome?,
        sort: LogSortOption
    ) -> [ClimbLog] {
        var result = logs

        if let discipline {
            result = result.filter { $0.discipline == discipline }
        }

        if let outcome {
            result = result.filter { $0.outcome == outcome }
        }

        let trimmedQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedQuery.isEmpty {
            let normalized = trimmedQuery.lowercased()
            result = result.filter { log in
                log.discipline.title.lowercased().contains(normalized) ||
                log.formattedGrade.lowercased().contains(normalized) ||
                log.notes.lowercased().contains(normalized) ||
                log.outcome.title.lowercased().contains(normalized)
            }
        }

        return sortLogs(result, by: sort)
    }

    static func summary(for logs: [ClimbLog]) -> ClimbSummaryStats {
        guard !logs.isEmpty else { return ClimbSummaryStats() }

        let sends = logs.filter { $0.outcome == .send || $0.outcome == .redpoint || $0.outcome == .onSight }.count
        let flashes = logs.filter { $0.outcome == .flash }.count
        let ratings = logs.map(\.rating)
        let averageRating = Double(ratings.reduce(0, +)) / Double(ratings.count)

        var disciplineCounts: [ClimbDiscipline: Int] = [:]
        for log in logs {
            disciplineCounts[log.discipline, default: 0] += 1
        }
        let topDiscipline = disciplineCounts.max(by: { $0.value < $1.value })?.key

        return ClimbSummaryStats(
            totalLogs: logs.count,
            sends: sends,
            flashes: flashes,
            averageRating: averageRating,
            topDiscipline: topDiscipline
        )
    }

    private static func sortLogs(_ logs: [ClimbLog], by option: LogSortOption) -> [ClimbLog] {
        switch option {
        case .newestFirst:
            return logs.sorted { $0.date > $1.date }
        case .oldestFirst:
            return logs.sorted { $0.date < $1.date }
        case .ratingHighToLow:
            return logs.sorted {
                if $0.rating == $1.rating { return $0.date > $1.date }
                return $0.rating > $1.rating
            }
        case .ratingLowToHigh:
            return logs.sorted {
                if $0.rating == $1.rating { return $0.date > $1.date }
                return $0.rating < $1.rating
            }
        }
    }
}
