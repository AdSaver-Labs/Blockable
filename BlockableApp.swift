import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {
  var window: NSWindow!
  var webView: WKWebView?
  func applicationDidFinishLaunching(_ notification: Notification) {
    let webView = WKWebView(frame: .zero)
    self.webView = webView
    webView.setValue(false, forKey: "drawsBackground")
    guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else { return }
    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 430, height: 820), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
    window.title = "Blockable"
    window.contentView = webView
    window.center()
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

  func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
    guard let webView else { return .terminateNow }
    webView.evaluateJavaScript("window.dispatchEvent(new Event('pagehide'))") { _, _ in
      sender.reply(toApplicationShouldTerminate: true)
    }
    return .terminateLater
  }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
let menu = NSMenu()
let applicationItem = NSMenuItem()
let applicationMenu = NSMenu()
applicationMenu.addItem(withTitle: "Quit Blockable", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
applicationItem.submenu = applicationMenu
menu.addItem(applicationItem)
app.mainMenu = menu
app.run()
