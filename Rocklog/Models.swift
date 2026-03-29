import Foundation
import SwiftData
import CoreLocation

enum ClimbDiscipline: String, Codable, CaseIterable, Identifiable {
    case boulder, sport, trad, topRope
    var id: String { rawValue }

    var title: String {
        switch self {
        case .boulder:
            return "Boulder"
        case .sport:
            return "Sport"
        case .trad:
            return "Trad"
        case .topRope:
            return "Top Rope"
        }
    }
}

enum GradeSystem: String, Codable, CaseIterable, Identifiable {
    case vScale, font, yds, french, uiAA
    var id: String { rawValue }

    var title: String {
        switch self {
        case .vScale:
            return "V-Scale"
        case .font:
            return "Font"
        case .yds:
            return "YDS"
        case .french:
            return "French"
        case .uiAA:
            return "UIAA"
        }
    }

    var shortLabel: String {
        switch self {
        case .vScale:
            return "V"
        case .font:
            return "Font"
        case .yds:
            return "YDS"
        case .french:
            return "French"
        case .uiAA:
            return "UIAA"
        }
    }
}

enum Outcome: String, Codable, CaseIterable, Identifiable {
    case send, flash, redpoint, onSight, attempt, project
    var id: String { rawValue }

    var title: String {
        switch self {
        case .onSight:
            return "Onsight"
        default:
            return rawValue.capitalized
        }
    }
}

enum MediaType: String, Codable, CaseIterable, Identifiable {
    case photo, video
    var id: String { rawValue }
}

@Model
final class MediaItem {
    var id: UUID = UUID()

    var typeRaw: String
    var filePath: String
    var createdAt: Date

    init(type: MediaType, filePath: String, createdAt: Date = .now) {
        self.id = UUID()
        self.typeRaw = type.rawValue
        self.filePath = filePath
        self.createdAt = createdAt
    }

    var type: MediaType {
        get { MediaType(rawValue: typeRaw) ?? .photo }
        set { typeRaw = newValue.rawValue }
    }
}

@Model
final class ClimbLog {
    var date: Date

    var disciplineRaw: String
    var gradeSystemRaw: String
    var grade: String

    var rating: Int
    var outcomeRaw: String
    var notes: String

    @Relationship var gym: Gym?
    @Relationship(deleteRule: .cascade) var media: [MediaItem] = []

    init(
        date: Date = .now,
        discipline: ClimbDiscipline,
        gradeSystem: GradeSystem,
        grade: String,
        rating: Int,
        outcome: Outcome,
        gym: Gym? = nil,
        notes: String = ""
    ) {
        self.date = date
        self.disciplineRaw = discipline.rawValue
        self.gradeSystemRaw = gradeSystem.rawValue
        self.grade = grade
        self.rating = rating
        self.outcomeRaw = outcome.rawValue
        self.gym = gym
        self.notes = notes
    }

    var discipline: ClimbDiscipline {
        get { ClimbDiscipline(rawValue: disciplineRaw) ?? .sport }
        set { disciplineRaw = newValue.rawValue }
    }

    var gradeSystem: GradeSystem {
        get { GradeSystem(rawValue: gradeSystemRaw) ?? .yds }
        set { gradeSystemRaw = newValue.rawValue }
    }
    
    var outcome: Outcome {
        get { Outcome(rawValue: outcomeRaw) ?? .attempt }
        set { outcomeRaw = newValue.rawValue }
    }

    var sanitizedGrade: String {
        grade.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    var formattedGrade: String {
        guard !sanitizedGrade.isEmpty else { return "No grade" }
        return "\(gradeSystem.shortLabel) \(sanitizedGrade)"
    }
}

@Model
final class Gym {
    var id: UUID = UUID()
    var name: String
    var latitude: Double
    var longitude: Double
    var createdAt: Date

    @Relationship(inverse: \ClimbLog.gym) var logs: [ClimbLog] = []

    init(name: String, latitude: Double, longitude: Double, createdAt: Date = .now) {
        self.id = UUID()
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.createdAt = createdAt
    }

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}
