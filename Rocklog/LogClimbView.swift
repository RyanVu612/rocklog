import SwiftUI
import SwiftData
import PhotosUI

struct LogClimbView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    private let logToEdit: ClimbLog?

    @State private var date = Date()
    @State private var discipline: ClimbDiscipline = .boulder
    @State private var gradeSystem: GradeSystem = .vScale
    @State private var grade = ""
    @State private var rating = 0
    @State private var outcome: Outcome = .attempt
    @State private var notes = ""

    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedVideo: PhotosPickerItem? = nil
    @State private var mediaIDsToDelete: Set<UUID> = []

    @State private var isSaving = false
    @State private var errorMessage: String? = nil
    @State private var didLoadInitialValues = false

    init(logToEdit: ClimbLog? = nil) {
        self.logToEdit = logToEdit
    }

    private var isEditing: Bool { logToEdit != nil }

    var body: some View {
        Form {
            Section("Climb") {
                DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])

                Picker("Discipline", selection: $discipline) {
                    ForEach(ClimbDiscipline.allCases) { d in
                        Text(d.title).tag(d)
                    }
                }

                Picker("Grade System", selection: $gradeSystem) {
                    ForEach(GradeSystem.allCases) { s in
                        Text(s.title).tag(s)
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
                        Text(o.title).tag(o)
                    }
                }
            }

            Section("Notes") {
                TextEditor(text: $notes)
                    .frame(minHeight: 100)
            }

            if let logToEdit, !logToEdit.media.isEmpty {
                Section("Current Media") {
                    ForEach(logToEdit.media.filter { !mediaIDsToDelete.contains($0.id) }, id: \.id) { item in
                        HStack {
                            Label(item.type == .photo ? "Photo" : "Video", systemImage: item.type == .photo ? "photo" : "video")
                            Spacer()
                            Button("Remove", role: .destructive) {
                                markMediaForDeletion(item)
                            }
                        }
                    }
                }
            }

            Section("Add Media") {
                PhotosPicker(
                    selection: $selectedPhotos,
                    maxSelectionCount: 5,
                    matching: .images
                ) {
                    Label("Add photos", systemImage: "photo.on.rectangle")
                }

                PhotosPicker(
                    selection: $selectedVideo,
                    matching: .videos
                ) {
                    Label("Add a video", systemImage: "video")
                }

                if !mediaIDsToDelete.isEmpty {
                    Text("\(mediaIDsToDelete.count) media item(s) will be deleted when you save.")
                        .foregroundStyle(.secondary)
                        .font(.subheadline)
                }
            }

            if let errorMessage {
                Section {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                }
            }

            if isSaving {
                Section {
                    HStack {
                        ProgressView()
                        Text("Saving...")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle(isEditing ? "Edit Climb" : "Log Climb")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button(isEditing ? "Update" : "Save") {
                    Task { await saveLog() }
                }
                .disabled(isSaving)
            }
        }
        .onAppear {
            loadExistingValuesIfNeeded()
        }
    }

    private func loadExistingValuesIfNeeded() {
        guard !didLoadInitialValues, let log = logToEdit else { return }
        date = log.date
        discipline = log.discipline
        gradeSystem = log.gradeSystem
        grade = log.grade
        rating = log.rating
        outcome = log.outcome
        notes = log.notes
        didLoadInitialValues = true
    }

    private func markMediaForDeletion(_ item: MediaItem) {
        mediaIDsToDelete.insert(item.id)
    }

    private func saveLog() async {
        errorMessage = nil
        isSaving = true
        defer { isSaving = false }

        let targetLog: ClimbLog
        if let logToEdit {
            targetLog = logToEdit
        } else {
            targetLog = ClimbLog(
                date: date,
                discipline: discipline,
                gradeSystem: gradeSystem,
                grade: grade,
                rating: rating,
                outcome: outcome,
                notes: notes
            )
        }

        targetLog.date = date
        targetLog.discipline = discipline
        targetLog.gradeSystem = gradeSystem
        targetLog.grade = grade
        targetLog.rating = min(max(rating, 0), 5)
        targetLog.outcome = outcome
        targetLog.notes = notes

        do {
            for item in selectedPhotos {
                if let data = try await item.loadTransferable(type: Data.self) {
                    let path = try MediaStorage.save(data: data, preferredExtension: "jpg")
                    targetLog.media.append(MediaItem(type: .photo, filePath: path))
                }
            }

            if let videoItem = selectedVideo,
               let url = try await videoItem.loadTransferable(type: URL.self) {
                let data = try Data(contentsOf: url)
                let path = try MediaStorage.save(data: data, preferredExtension: "mov")
                targetLog.media.append(MediaItem(type: .video, filePath: path))
            }

            if logToEdit == nil {
                modelContext.insert(targetLog)
            }

            let deletedItems = targetLog.media.filter { mediaIDsToDelete.contains($0.id) }
            targetLog.media.removeAll { mediaIDsToDelete.contains($0.id) }

            try modelContext.save()

            for deletedItem in deletedItems {
                MediaStorage.deleteFile(atPath: deletedItem.filePath)
            }
            mediaIDsToDelete.removeAll()

            dismiss()
        } catch {
            errorMessage = "Failed to save climb: \(error.localizedDescription)"
        }
    }
}
