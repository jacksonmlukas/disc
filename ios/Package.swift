// swift-tools-version: 5.6.2
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
    dependencies: [],
    targets: [
        .target(
            name: "DiscApp",
            dependencies: []),
        .testTarget(
            name: "DiscAppTests",
            dependencies: ["DiscApp"]),
    ]
)