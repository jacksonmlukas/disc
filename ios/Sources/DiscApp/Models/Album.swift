import Foundation

struct Album: Identifiable, Codable {
    let id: String
    let title: String
    let artist: String
    let coverUrl: String
    let genres: [String]
    var rating: Int?
    
    enum CodingKeys: String, CodingKey {
        case id = "albumId"
        case title
        case artist = "artistName"
        case coverUrl
        case genres
        case rating
    }
}

struct AlbumResponse: Codable {
    let recommendations: [Album]
    let explanation: String
}
