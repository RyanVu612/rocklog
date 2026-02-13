import Foundation
import SwiftData

enum ClimbDiscipline: String, Codable, CaseIterable, Identifiable {
    case boulder, sport, trad, topRope
    var id: String { rawValue }
}

enum GradeSystem: String, Codable, CaseIterable, Identifiable {
    case vScale, font, yds, french, uiAA
    var id: String { rawValue }
}

enum Outcome: String, Codable, CaseIterable, Identifiable {
    case send, flash, redpoint, onSight, attempt, project
    var id: String { rawValue }
}

enum MediaType: String, Codable, CaseIterable, Identifiable {
    case photo, video
    var id: String { rawValue }
}

@Model
final class MediaItem {
    var typeRaw: String
    var filePath: String
    var createdAt: Date

    init(type: MediaType, filePath: String, createdAt: Date = .now) {
        self.typeRaw = type.rawValue
        self.filePath = filePath
        self.createdAt = createdAt
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

    @Relationship(deleteRule: .cascade) var media: [MediaItem] = []

    init(
        date: Date = .now,
        discipline: ClimbDiscipline,
        gradeSystem: GradeSystem,
        grade: String,
        rating: Int,
        outcome: Outcome,
        notes: String = ""
    ) {
        self.date = date
        self.disciplineRaw = discipline.rawValue
        self.gradeSystemRaw = gradeSystem.rawValue
        self.grade = grade
        self.rating = rating
        self.outcomeRaw = outcome.rawValue
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
}
