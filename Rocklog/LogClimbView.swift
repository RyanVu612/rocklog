import SwiftUI
import SwiftData
import PhotosUI
import CoreLocation

struct LogClimbView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @Query private var gyms: [Gym]

    private let logToEdit: ClimbLog?

    @State private var date = Date()
    @State private var discipline: ClimbDiscipline = .boulder
    @State private var gradeSystem: GradeSystem = .vScale
    @State private var grade = ""
    @State private var rating = 0
    @State private var outcome: Outcome = .attempt
    @State private var notes = ""
    @State private var selectedGymID: UUID? = nil

    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedVideo: PhotosPickerItem? = nil
    @State private var mediaIDsToDelete: Set<UUID> = []
    @State private var showingGymMapPicker = false
    @StateObject private var locationProvider = LocationProvider()
    @State private var autoSelectedGymID: UUID? = nil

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

            Section("Location") {
                Picker("Climbing Gym", selection: $selectedGymID) {
                    Text("No gym selected").tag(UUID?.none)
                    ForEach(sortedGyms, id: \.id) { gym in
                        Text(gym.name).tag(UUID?.some(gym.id))
                    }
                }

                if let autoGym = autoSelectedGym {
                    Text("Nearest gym auto-selected: \(autoGym.name)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Button {
                    showingGymMapPicker = true
                } label: {
                    Label("Select Gym on Map", systemImage: "map")
                }
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
            if !isEditing {
                locationProvider.requestAuthorizationAndLocation()
                autoSelectNearestGymIfPossible()
            }
        }
        .onChange(of: gyms.count) { _, _ in
            autoSelectNearestGymIfPossible()
        }
        .onChange(of: selectedGymID) { _, newValue in
            if newValue != autoSelectedGymID {
                autoSelectedGymID = nil
            }
        }
        .onReceive(locationProvider.$lastLocation) { _ in
            autoSelectNearestGymIfPossible()
        }
        .sheet(isPresented: $showingGymMapPicker) {
            GymMapPickerView(existingGyms: sortedGyms) { selectedGym in
                selectedGymID = selectedGym.id
                autoSelectedGymID = nil
            }
        }
    }

    private var sortedGyms: [Gym] {
        gyms.sorted { lhs, rhs in
            lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
    }

    private var selectedGym: Gym? {
        guard let selectedGymID else { return nil }
        return gyms.first { $0.id == selectedGymID }
    }

    private var autoSelectedGym: Gym? {
        guard let autoSelectedGymID, autoSelectedGymID == selectedGymID else { return nil }
        return selectedGym
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
        selectedGymID = log.gym?.id
        didLoadInitialValues = true
    }

    private func autoSelectNearestGymIfPossible() {
        guard !isEditing else { return }
        guard autoSelectedGymID == nil else { return }
        guard selectedGymID == nil else { return }
        guard let currentLocation = locationProvider.lastLocation else { return }
        guard !gyms.isEmpty else { return }

        let nearestEntry = gyms
            .map { gym -> (gym: Gym, distance: CLLocationDistance) in
                let distance = currentLocation.distance(
                    from: CLLocation(latitude: gym.latitude, longitude: gym.longitude)
                )
                return (gym, distance)
            }
            .min { $0.distance < $1.distance }

        guard let nearestEntry else { return }

        // Avoid selecting obviously unrelated gyms if user is far from all saved locations.
        let maxAutoSelectDistance: CLLocationDistance = 50_000
        guard nearestEntry.distance <= maxAutoSelectDistance else { return }

        selectedGymID = nearestEntry.gym.id
        autoSelectedGymID = nearestEntry.gym.id
    }

    private func markMediaForDeletion(_ item: MediaItem) {
        mediaIDsToDelete.insert(item.id)
    }

    @MainActor
    private func saveLog() async {
        errorMessage = nil
        isSaving = true
        defer { isSaving = false }

        let isNewLog = logToEdit == nil
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

        let previousDate = targetLog.date
        let previousDiscipline = targetLog.discipline
        let previousGradeSystem = targetLog.gradeSystem
        let previousGrade = targetLog.grade
        let previousRating = targetLog.rating
        let previousOutcome = targetLog.outcome
        let previousNotes = targetLog.notes
        let previousGym = targetLog.gym

        targetLog.date = date
        targetLog.discipline = discipline
        targetLog.gradeSystem = gradeSystem
        targetLog.grade = grade
        targetLog.rating = min(max(rating, 0), 5)
        targetLog.outcome = outcome
        targetLog.notes = notes
        targetLog.gym = selectedGym

        var newlySavedMediaPaths: [String] = []
        var newlyAddedMediaIDs: [UUID] = []
        var deletedItems: [MediaItem] = []

        do {
            for item in selectedPhotos {
                if let data = try await item.loadTransferable(type: Data.self) {
                    let path = try MediaStorage.save(data: data, preferredExtension: "jpg")
                    newlySavedMediaPaths.append(path)
                    let media = MediaItem(type: .photo, filePath: path)
                    newlyAddedMediaIDs.append(media.id)
                    targetLog.media.append(media)
                }
            }

            if let videoItem = selectedVideo,
               let url = try await videoItem.loadTransferable(type: URL.self) {
                let path = try MediaStorage.saveFile(from: url, preferredExtension: "mov")
                newlySavedMediaPaths.append(path)
                let media = MediaItem(type: .video, filePath: path)
                newlyAddedMediaIDs.append(media.id)
                targetLog.media.append(media)
            }

            if isNewLog {
                modelContext.insert(targetLog)
            }

            deletedItems = targetLog.media.filter { mediaIDsToDelete.contains($0.id) }
            targetLog.media.removeAll { mediaIDsToDelete.contains($0.id) }

            try modelContext.save()

            for deletedItem in deletedItems {
                MediaStorage.deleteFile(atPath: deletedItem.filePath)
            }
            mediaIDsToDelete.removeAll()

            dismiss()
        } catch {
            for path in newlySavedMediaPaths {
                MediaStorage.deleteFile(atPath: path)
            }
            if !newlyAddedMediaIDs.isEmpty {
                targetLog.media.removeAll { newlyAddedMediaIDs.contains($0.id) }
            }
            if !deletedItems.isEmpty {
                targetLog.media.append(contentsOf: deletedItems)
            }
            if isNewLog {
                modelContext.delete(targetLog)
            } else {
                targetLog.date = previousDate
                targetLog.discipline = previousDiscipline
                targetLog.gradeSystem = previousGradeSystem
                targetLog.grade = previousGrade
                targetLog.rating = previousRating
                targetLog.outcome = previousOutcome
                targetLog.notes = previousNotes
                targetLog.gym = previousGym
            }
            errorMessage = "Failed to save climb: \(error.localizedDescription)"
        }
    }
}
