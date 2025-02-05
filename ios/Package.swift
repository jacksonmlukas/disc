// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DiscApp",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "DiscApp",
            targets: ["DiscApp"]),
    ],
    targets: [
        .target(
            name: "DiscApp",
            dependencies: []),
        .testTarget(
            name: "DiscAppTests",
            dependencies: ["DiscApp"]),
    ]
)
