//
//  RocklogTests.swift
//  RocklogTests
//
//  Created by Ryan Vu on 2/12/26.
//

import Testing
@testable import Rocklog

struct RocklogTests {
    @Test func summaryCalculatesTotalsAndAverages() {
        let logs = sampleLogs()
        let summary = ClimbAnalytics.summary(for: logs)

        #expect(summary.totalLogs == 4)
        #expect(summary.sends == 2)
        #expect(summary.flashes == 1)
        #expect(summary.averageRating == 3.5)
        #expect(summary.topDiscipline == .boulder)
    }

    @Test func filteringMatchesTextOutcomeAndSort() {
        let logs = sampleLogs()
        let filtered = ClimbAnalytics.filtered(
            logs: logs,
            query: "v",
            discipline: .boulder,
            outcome: .flash,
            sort: .oldestFirst
        )

        #expect(filtered.count == 1)
        #expect(filtered[0].outcome == .flash)
        #expect(filtered[0].discipline == .boulder)
    }

    @Test func formattedGradeUsesShortSystemLabel() {
        let log = ClimbLog(
            discipline: .sport,
            gradeSystem: .yds,
            grade: "5.11b",
            rating: 4,
            outcome: .send
        )

        #expect(log.formattedGrade == "YDS 5.11b")
    }

    private func sampleLogs() -> [ClimbLog] {
        [
            ClimbLog(
                date: Date(timeIntervalSince1970: 200),
                discipline: .boulder,
                gradeSystem: .vScale,
                grade: "5",
                rating: 4,
                outcome: .flash,
                notes: "Strong session"
            ),
            ClimbLog(
                date: Date(timeIntervalSince1970: 100),
                discipline: .boulder,
                gradeSystem: .vScale,
                grade: "6",
                rating: 5,
                outcome: .send,
                notes: "Tough but clean"
            ),
            ClimbLog(
                date: Date(timeIntervalSince1970: 400),
                discipline: .sport,
                gradeSystem: .yds,
                grade: "5.11a",
                rating: 3,
                outcome: .project,
                notes: "Need better endurance"
            ),
            ClimbLog(
                date: Date(timeIntervalSince1970: 300),
                discipline: .trad,
                gradeSystem: .french,
                grade: "6a",
                rating: 2,
                outcome: .redpoint,
                notes: "Placement practice"
            )
        ]
    }
}
