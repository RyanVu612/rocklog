import SwiftUI
import SwiftData

@main
struct RockLogApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [ClimbLog.self, MediaItem.self])
    }
}
