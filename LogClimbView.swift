import SwiftUI
import SwiftData
import PhotosUI
import UniformTypeIdentifiers

struct LogClimbView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var discipline: ClimbType = .boulder
    @State private var gradeSystem: GradeSystem = .vScale
    @State private var grade = ""
    @State private var rating = 0
    @State private var outcome: Outcome = .attempt
    @State private var notes = ""

    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedVideos: [PhotosPickerItem] = []
    @State private var isSavingMedia = false
    @State private var mediaError: String? = nil

    var body: some View {
        Form {
            Section("Climb") {
                DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])

                Picker("Discipline", selection: $discipline) {
                    ForEach(ClimbDiscipline.allCases) { d in
                        Text(d.rawValue.capitalized).tag(d)
                    }
                }

                Picker("Grade System", selection: $gradeSystem) {
                    ForEach(GradeSystem.allCases) { s in
                        Text(label(for: s)).tag(s)
                    }
                }

                TextField("Grade (e.g. V5 / 6a / 5.12)", text: $grade)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }

            Section("Rating") {
                StarRow(rating: $rating, isInteractive: true)

                Picker("Outcome", selection: $outcome) {
                    ForEach(Outcome.allCases) { o in
                        Text(o.rawValue.capitalized).tag(o)
                    }
                }
            }

            Section("Notes") {
                TextEditor(text: $notes)
                    .frame(minHeight: 100)
            }

            Section("Media") {
                PhotosPicker(
                    selection: $selectedPhotos,
                    maxSelectionCount: 5,
                    matching: .images
                ) {
                    Label("Add photos", systemImage: "photo.on.rectangle")
                }
                
                PhotosPicker(
                    selection: $selectedVideos,
                    maxSelectionCount: 5,
                    matching: .videos
                ) {
                    Label("Add videos", systemImage: "video.badge.plus")
                }

                if let mediaError {
                    Text(mediaError)
                        .foregroundStyle(.red)
                }
            }

            if isSavingMedia {
                Section {
                    HStack {
                        ProgressView()
                        Text("Saving media...")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Log Climb")
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") {
                    Task { await saveLog() }
                }
            }
            .disabled(isSavingMedia)
        }
    }

    private func label(for system: GradeSystem) -> String {
        switch system {
            case.vScale: return "V-Scale"
            case .font: return "Font"
            case .yds: return "YDS"
            case .french: return "French"
            case .uiAA: return "UIAA"
        }
    }

    private func saveLog() async {
        mediaError = nil
        isSavingMedia = true
        defer { isSavingMedia = false }

        let log = ClimbLog(
            date: date,
            discipline: discipline,
            gradeSystem: gradeSystem,
            grade: grade,
            rating: rating,
            outcome: outcome,
            notes: notes
        )

        do {
            // Save photos
            for item in selectedPhotos {
                if let data = try await item.loadTransferable(type: Data.self) {
                    let path = try MediaStorage.save(data: data, preferredExtension: "jpg")
                    log.media.append(MediaItem(type: .photo, filePath: path))
                }
            }

            // Save videos
            for item in selectedVideos {
                if let videoItem = selectedVideo, let url = try await videoItem.loadTransferable(type: URL.self) {
                    let data = try Data(contentsOf: url)
                    let path = try MediaStorage.save(data: data, preferredExtension: "mov")
                    log.media.append(MediaItem(type: .video, filePath: path))
                }
                modelContext.insert(log)
                try modelContext.save()
                dismiss()
            }
        } catch {
            mediaError = "Failed to save media: \(error.localizedDescription)"
        }
    }
}