import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  func applicationDidFinishLaunching(_ notification: Notification) {
    let webView = WKWebView(frame: .zero)
    webView.setValue(false, forKey: "drawsBackground")
    guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else { return }
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 430, height: 820), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
    window.title = "Blockable"
    window.contentView = webView
    window.center()
    window.makeKeyAndOrderFront(nil)
  }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
