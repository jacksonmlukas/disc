import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
    case serverError(Int)
    case authenticationRequired
}

class APIClient {
    static let shared = APIClient()
    private let baseURL = "http://localhost:5000/api"
    private var authToken: String?

    func login(username: String, password: String) async throws -> Bool {
        guard let url = URL(string: "\(baseURL)/login") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let credentials = ["username": username, "password": password]
        request.httpBody = try JSONEncoder().encode(credentials)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(NSError(domain: "", code: -1))
        }

        return httpResponse.statusCode == 200
    }

    func fetchRecommendations() async throws -> AlbumResponse {
        guard let url = URL(string: "\(baseURL)/recommendations") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(NSError(domain: "", code: -1))
        }

        if httpResponse.statusCode == 401 {
            throw APIError.authenticationRequired
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

    func submitReview(_ review: ReviewRequest) async throws {
        guard let url = URL(string: "\(baseURL)/reviews") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(review)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(NSError(domain: "", code: -1))
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(httpResponse.statusCode)
        }
    }
}