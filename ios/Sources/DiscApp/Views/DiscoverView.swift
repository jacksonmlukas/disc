import SwiftUI

struct DiscoverView: View {
    @State private var recommendations: [Album] = []
    @State private var explanation: String = ""
    @State private var isLoading = false
    @State private var error: Error?
    
    var body: some View {
        NavigationView {
            ZStack {
                if isLoading {
                    ProgressView("Loading recommendations...")
                } else {
                    ScrollView {
                        if !explanation.isEmpty {
                            Text(explanation)
                                .padding()
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            ForEach(recommendations) { album in
                                AlbumCard(album: album)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Discover")
            .task {
                await loadRecommendations()
            }
        }
    }
    
    private func loadRecommendations() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let response = try await APIClient.shared.fetchRecommendations()
            recommendations = response.recommendations
            explanation = response.explanation
        } catch {
            self.error = error
            // In a real app, we would show an error alert here
        }
    }
}

struct AlbumCard: View {
    let album: Album
    
    var body: some View {
        VStack(alignment: .leading) {
            AsyncImage(url: URL(string: album.coverUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray
            }
            .frame(height: 160)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(album.title)
                    .font(.headline)
                    .lineLimit(1)
                
                Text(album.artist)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                if let rating = album.rating {
                    HStack {
                        ForEach(0..<5) { index in
                            Image(systemName: index < rating ? "star.fill" : "star")
                                .foregroundColor(.yellow)
                        }
                    }
                }
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(album.genres, id: \.self) { genre in
                            Text(genre)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.secondary.opacity(0.2))
                                .cornerRadius(4)
                        }
                    }
                }
            }
            .padding(.vertical, 8)
        }
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 4)
    }
}
