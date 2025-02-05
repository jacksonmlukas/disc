import Foundation

struct Album: Identifiable, Codable {
    let id: String
    let title: String
    let artist: String
    let coverUrl: String
    let genres: [String]
    var rating: Int?

    // Match the backend API response format
    enum CodingKeys: String, CodingKey {
        case id = "albumId"
        case title
        case artist = "artistName"
        case coverUrl
        case genres
        case rating
    }
}

// Match the recommendations endpoint response
struct AlbumResponse: Codable {
    let recommendations: [Album]
    let explanation: String
}

// For review creation
struct ReviewRequest: Codable {
    let albumId: String
    let rating: Int
    let review: String
}