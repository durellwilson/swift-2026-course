// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="introduction.html">Introduction</a></li><li class="chapter-item expanded affix "><li class="part-title">Apple&#39;s Develop in Swift Framework</li><li class="chapter-item expanded "><a href="apple-framework/getting-started.html"><strong aria-hidden="true">1.</strong> Getting Started with Swift</a></li><li class="chapter-item expanded "><a href="apple-framework/2025-updates.html"><strong aria-hidden="true">2.</strong> 2025 Developer Updates</a></li><li class="chapter-item expanded "><a href="apple-framework/playgrounds.html"><strong aria-hidden="true">3.</strong> Swift Playgrounds Integration</a></li><li class="chapter-item expanded "><a href="apple-framework/learning-path.html"><strong aria-hidden="true">4.</strong> Apple&#39;s Learning Path</a></li><li class="chapter-item expanded affix "><li class="part-title">Swift Fundamentals (Apple Curriculum)</li><li class="chapter-item expanded "><a href="swift/basics.html"><strong aria-hidden="true">5.</strong> Swift Language Basics</a></li><li class="chapter-item expanded "><a href="swift/collections.html"><strong aria-hidden="true">6.</strong> Collections &amp; Control Flow</a></li><li class="chapter-item expanded "><a href="swift/functions.html"><strong aria-hidden="true">7.</strong> Functions &amp; Closures</a></li><li class="chapter-item expanded "><a href="swift/structures.html"><strong aria-hidden="true">8.</strong> Structures &amp; Classes</a></li><li class="chapter-item expanded "><a href="swift/protocols.html"><strong aria-hidden="true">9.</strong> Protocols &amp; Generics</a></li><li class="chapter-item expanded "><a href="swift/concurrency.html"><strong aria-hidden="true">10.</strong> Concurrency &amp; Actors</a></li><li class="chapter-item expanded affix "><li class="part-title">iOS App Development (Apple Tutorials)</li><li class="chapter-item expanded "><a href="ios-dev/first-app.html"><strong aria-hidden="true">11.</strong> Your First iOS App</a></li><li class="chapter-item expanded "><a href="ios-dev/swiftui-essentials.html"><strong aria-hidden="true">12.</strong> SwiftUI Essentials</a></li><li class="chapter-item expanded "><a href="ios-dev/navigation.html"><strong aria-hidden="true">13.</strong> Navigation &amp; User Input</a></li><li class="chapter-item expanded "><a href="ios-dev/data.html"><strong aria-hidden="true">14.</strong> Working with Data</a></li><li class="chapter-item expanded "><a href="ios-dev/networking.html"><strong aria-hidden="true">15.</strong> Networking &amp; APIs</a></li><li class="chapter-item expanded affix "><li class="part-title">Apple Intelligence &amp; AI (2025)</li><li class="chapter-item expanded "><a href="ai/apple-intelligence.html"><strong aria-hidden="true">16.</strong> Apple Intelligence Integration</a></li><li class="chapter-item expanded "><a href="ai/coreml-8.html"><strong aria-hidden="true">17.</strong> Core ML 8 Features</a></li><li class="chapter-item expanded "><a href="ai/on-device.html"><strong aria-hidden="true">18.</strong> On-Device Processing</a></li><li class="chapter-item expanded "><a href="ai/siri-intents.html"><strong aria-hidden="true">19.</strong> Siri App Intents</a></li><li class="chapter-item expanded affix "><li class="part-title">Apple Frameworks Integration</li><li class="chapter-item expanded "><a href="frameworks/swiftdata.html"><strong aria-hidden="true">20.</strong> SwiftData (Data Persistence)</a></li><li class="chapter-item expanded "><a href="frameworks/cloudkit.html"><strong aria-hidden="true">21.</strong> CloudKit (Cloud Services)</a></li><li class="chapter-item expanded "><a href="frameworks/coreml.html"><strong aria-hidden="true">22.</strong> Core ML (Machine Learning)</a></li><li class="chapter-item expanded "><a href="frameworks/widgetkit.html"><strong aria-hidden="true">23.</strong> WidgetKit (Home Screen Widgets)</a></li><li class="chapter-item expanded "><a href="frameworks/appintents.html"><strong aria-hidden="true">24.</strong> AppIntents (Siri &amp; Shortcuts)</a></li><li class="chapter-item expanded "><a href="frameworks/swiftcharts.html"><strong aria-hidden="true">25.</strong> SwiftCharts (Data Visualization)</a></li><li class="chapter-item expanded affix "><li class="part-title">Swift 6.0 &amp; Modern Development</li><li class="chapter-item expanded "><a href="swift6/testing.html"><strong aria-hidden="true">26.</strong> Swift Testing Framework</a></li><li class="chapter-item expanded "><a href="swift6/concurrency.html"><strong aria-hidden="true">27.</strong> Concurrency &amp; Data Race Safety</a></li><li class="chapter-item expanded "><a href="swift6/typed-throws.html"><strong aria-hidden="true">28.</strong> Typed Throws</a></li><li class="chapter-item expanded "><a href="swift6/noncopyable.html"><strong aria-hidden="true">29.</strong> Noncopyable Types</a></li><li class="chapter-item expanded affix "><li class="part-title">Accessibility &amp; Inclusive Design</li><li class="chapter-item expanded "><a href="accessibility/guidelines.html"><strong aria-hidden="true">30.</strong> Apple&#39;s Accessibility Guidelines</a></li><li class="chapter-item expanded "><a href="accessibility/voiceover.html"><strong aria-hidden="true">31.</strong> VoiceOver Integration</a></li><li class="chapter-item expanded "><a href="accessibility/dynamic-type.html"><strong aria-hidden="true">32.</strong> Dynamic Type Support</a></li><li class="chapter-item expanded "><a href="accessibility/color-contrast.html"><strong aria-hidden="true">33.</strong> Color &amp; Contrast</a></li><li class="chapter-item expanded affix "><li class="part-title">Platform-Specific Development</li><li class="chapter-item expanded "><a href="platforms/ios.html"><strong aria-hidden="true">34.</strong> iOS 18+ Features</a></li><li class="chapter-item expanded "><a href="platforms/macos.html"><strong aria-hidden="true">35.</strong> macOS Sequoia</a></li><li class="chapter-item expanded "><a href="platforms/watchos.html"><strong aria-hidden="true">36.</strong> watchOS 11</a></li><li class="chapter-item expanded "><a href="platforms/visionos.html"><strong aria-hidden="true">37.</strong> visionOS 2</a></li><li class="chapter-item expanded affix "><li class="part-title">Apple Development Workflow</li><li class="chapter-item expanded "><a href="workflow/xcode.html"><strong aria-hidden="true">38.</strong> Xcode 16+ Best Practices</a></li><li class="chapter-item expanded "><a href="workflow/swift-testing.html"><strong aria-hidden="true">39.</strong> Swift Testing</a></li><li class="chapter-item expanded "><a href="workflow/debugging.html"><strong aria-hidden="true">40.</strong> Debugging Techniques</a></li><li class="chapter-item expanded "><a href="workflow/performance.html"><strong aria-hidden="true">41.</strong> Performance Optimization</a></li><li class="chapter-item expanded "><a href="workflow/xcode-cloud.html"><strong aria-hidden="true">42.</strong> Xcode Cloud CI/CD</a></li><li class="chapter-item expanded affix "><li class="part-title">App Store &amp; Distribution</li><li class="chapter-item expanded "><a href="app-store/guidelines.html"><strong aria-hidden="true">43.</strong> App Store Guidelines</a></li><li class="chapter-item expanded "><a href="app-store/review.html"><strong aria-hidden="true">44.</strong> App Review Process</a></li><li class="chapter-item expanded "><a href="app-store/storekit.html"><strong aria-hidden="true">45.</strong> StoreKit &amp; Monetization</a></li><li class="chapter-item expanded "><a href="app-store/testflight.html"><strong aria-hidden="true">46.</strong> TestFlight Beta Testing</a></li><li class="chapter-item expanded affix "><li class="part-title">Advanced Topics</li><li class="chapter-item expanded "><a href="advanced/spm.html"><strong aria-hidden="true">47.</strong> Swift Package Manager 6.0</a></li><li class="chapter-item expanded "><a href="advanced/frameworks.html"><strong aria-hidden="true">48.</strong> Custom Frameworks</a></li><li class="chapter-item expanded "><a href="advanced/profiling.html"><strong aria-hidden="true">49.</strong> Performance Profiling</a></li><li class="chapter-item expanded "><a href="advanced/security.html"><strong aria-hidden="true">50.</strong> Security Best Practices</a></li><li class="chapter-item expanded affix "><li class="part-title">Apple Sample Projects</li><li class="chapter-item expanded "><a href="projects/scrumdinger.html"><strong aria-hidden="true">51.</strong> Scrumdinger (Meeting App)</a></li><li class="chapter-item expanded "><a href="projects/landmarks.html"><strong aria-hidden="true">52.</strong> Landmarks (SwiftUI Tutorial)</a></li><li class="chapter-item expanded "><a href="projects/earthquake.html"><strong aria-hidden="true">53.</strong> Earthquake (Data Visualization)</a></li><li class="chapter-item expanded "><a href="projects/ml-classifier.html"><strong aria-hidden="true">54.</strong> ML Classifier (Core ML)</a></li><li class="chapter-item expanded affix "><li class="part-title">2025 Video Resources</li><li class="chapter-item expanded "><a href="videos/apple-intelligence.html"><strong aria-hidden="true">55.</strong> Apple Intelligence Deep Dive</a></li><li class="chapter-item expanded "><a href="videos/swiftui-performance.html"><strong aria-hidden="true">56.</strong> SwiftUI Performance Tips</a></li><li class="chapter-item expanded "><a href="videos/concurrency.html"><strong aria-hidden="true">57.</strong> Concurrency Best Practices</a></li><li class="chapter-item expanded "><a href="videos/cross-platform.html"><strong aria-hidden="true">58.</strong> Cross-Platform Development</a></li><li class="chapter-item expanded affix "><li class="part-title">Resources &amp; Community</li><li class="chapter-item expanded "><a href="resources/apple-resources.html"><strong aria-hidden="true">59.</strong> Apple Developer Resources</a></li><li class="chapter-item expanded "><a href="resources/wwdc.html"><strong aria-hidden="true">60.</strong> WWDC Session References</a></li><li class="chapter-item expanded "><a href="resources/community.html"><strong aria-hidden="true">61.</strong> Swift Community</a></li><li class="chapter-item expanded "><a href="resources/certification.html"><strong aria-hidden="true">62.</strong> Certification Preparation</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
