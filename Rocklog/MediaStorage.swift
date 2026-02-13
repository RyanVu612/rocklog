import Foundation

enum MediaStorage {
    static func mediaDirectoryURL() throws -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dir = base.appendingPathComponent("Media", isDirectory: true)
        if !FileManager.default.fileExists(atPath: dir.path) {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        return dir
    }

    static func save(data: Data, preferredExtension: String) throws -> String {
        let dir = try mediaDirectoryURL()
        let filename = UUID().uuidString + "." + preferredExtension
        let url = dir.appendingPathComponent(filename)
        try data.write(to: url, options: .atomic)
        return url.path
    }
}
