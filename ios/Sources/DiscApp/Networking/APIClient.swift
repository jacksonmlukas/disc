import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)
}

class APIClient {
    static let shared = APIClient()
    private let baseURL = "http://localhost:5000/api"
    
    func fetchRecommendations() async throws -> AlbumResponse {
        guard let url = URL(string: "\(baseURL)/recommendations") else {
            throw APIError.invalidURL
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(NSError(domain: "", code: -1))
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        do {
            let decoder = JSONDecoder()
            return try decoder.decode(AlbumResponse.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }
}
