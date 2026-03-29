import SwiftUI
import SwiftData
import MapKit
import CoreLocation

struct GymMapPickerView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let existingGyms: [Gym]
    let onGymSelected: (Gym) -> Void

    @State private var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
            span: MKCoordinateSpan(latitudeDelta: 0.08, longitudeDelta: 0.08)
        )
    )
    @State private var selectedCoordinate: CLLocationCoordinate2D? = nil
    @State private var gymName: String = ""
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                MapReader { proxy in
                    Map(position: $cameraPosition) {
                        if let selectedCoordinate {
                            Marker("New Gym", coordinate: selectedCoordinate)
                        }

                        ForEach(existingGyms, id: \.id) { gym in
                            Marker(gym.name, coordinate: gym.coordinate)
                                .tint(.orange)
                        }
                    }
                    .mapStyle(.standard(elevation: .realistic))
                    .onTapGesture { point in
                        selectedCoordinate = proxy.convert(point, from: .local)
                        errorMessage = nil
                    }
                }
                .frame(height: 330)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Tap the map to choose a gym location.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    if let nearby = nearbyExistingGym {
                        Text("Existing gym nearby: \(nearby.name). Saving will reuse it.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    TextField("Gym name", text: $gymName)
                        .textFieldStyle(.roundedBorder)

                    if let errorMessage {
                        Text(errorMessage)
                            .font(.subheadline)
                            .foregroundStyle(.red)
                    }
                }
                .padding(.horizontal)

                Spacer()
            }
            .navigationTitle("Select Gym")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save Gym") {
                        saveGym()
                    }
                }
            }
        }
    }

    private var nearbyExistingGym: Gym? {
        guard let selectedCoordinate else { return nil }
        return findExistingGym(near: selectedCoordinate, thresholdMeters: 120)
    }

    private func saveGym() {
        guard let selectedCoordinate else {
            errorMessage = "Please tap the map to select a location."
            return
        }

        if let existing = findExistingGym(near: selectedCoordinate, thresholdMeters: 120) {
            onGymSelected(existing)
            dismiss()
            return
        }

        let trimmedName = gymName.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalName = trimmedName.isEmpty ? "Gym \(existingGyms.count + 1)" : trimmedName

        let gym = Gym(
            name: finalName,
            latitude: selectedCoordinate.latitude,
            longitude: selectedCoordinate.longitude
        )
        modelContext.insert(gym)

        do {
            try modelContext.save()
            onGymSelected(gym)
            dismiss()
        } catch {
            modelContext.delete(gym)
            errorMessage = "Could not save gym: \(error.localizedDescription)"
        }
    }

    private func findExistingGym(
        near coordinate: CLLocationCoordinate2D,
        thresholdMeters: CLLocationDistance
    ) -> Gym? {
        let target = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        let nearest = existingGyms
            .map { gym -> (gym: Gym, distance: CLLocationDistance) in
                let gymLocation = CLLocation(latitude: gym.latitude, longitude: gym.longitude)
                return (gym, target.distance(from: gymLocation))
            }
            .min { $0.distance < $1.distance }

        guard let nearest else { return nil }
        guard nearest.distance <= thresholdMeters else { return nil }
        return nearest.gym
    }
}
