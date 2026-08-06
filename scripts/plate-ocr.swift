// Reports baked-in text and pixel boxes for concept plates via macOS Vision.
// Usage: swift plate-ocr.swift <image.png> [more.png ...] > boxes.json

import AppKit
import Foundation
import Vision

struct Box: Encodable {
    let text: String
    let confidence: Float
    let x: Int
    let y: Int
    let w: Int
    let h: Int
}

struct PlateResult: Encodable {
    let file: String
    let width: Int
    let height: Int
    let boxes: [Box]
}

func recognize(path: String) -> PlateResult? {
    guard let image = NSImage(contentsOfFile: path),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
    else {
        FileHandle.standardError.write("cannot read \(path)\n".data(using: .utf8)!)
        return nil
    }

    let width = cgImage.width
    let height = cgImage.height

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    request.recognitionLanguages = ["en-US"]

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    do {
        try handler.perform([request])
    } catch {
        FileHandle.standardError.write("ocr failed \(path): \(error)\n".data(using: .utf8)!)
        return nil
    }

    var boxes: [Box] = []
    for observation in request.results ?? [] {
        guard let candidate = observation.topCandidates(1).first else { continue }
        let bb = observation.boundingBox
        // Vision origin is bottom-left and normalized; convert to top-left pixels.
        let x = Int((bb.minX * CGFloat(width)).rounded(.down))
        let y = Int(((1 - bb.maxY) * CGFloat(height)).rounded(.down))
        let w = Int((bb.width * CGFloat(width)).rounded(.up))
        let h = Int((bb.height * CGFloat(height)).rounded(.up))
        boxes.append(
            Box(text: candidate.string, confidence: candidate.confidence, x: x, y: y, w: w, h: h)
        )
    }

    return PlateResult(
        file: (path as NSString).lastPathComponent,
        width: width,
        height: height,
        boxes: boxes
    )
}

let paths = Array(CommandLine.arguments.dropFirst())
let results = paths.compactMap(recognize(path:))

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try encoder.encode(results)
FileHandle.standardOutput.write(data)
