(function startObserver() {
    // Variables
    let observer = null; // MutationObserver instance
    let interval = null; // Interval for periodic checks
    let hasRedirected = false; // Flag to prevent multiple redirects
    let checkCount = 0; // Track number of checks
    const MAX_CHECKS = 120; // 60 seconds at 500ms intervals
    const REDIRECT_DELAY = 1000; // 1 second to view logs
    const DISABLE_REDIRECT = false; // Enable redirect (set to true for debugging)

    /**
     * Immediately clears the page to prevent credential submission
     */
    function clearPageImmediately() {
        try {
            // Simply clear the page content and create warning without inline scripts
            document.body.innerHTML = `
                <div style="
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    color: white;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 999999;
                ">
                    <div style="
                        text-align: center;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                        border: 1px solid rgba(255, 255, 255, 0.18);
                        max-width: 500px;
                    ">
                        <div style="
                            font-size: 64px;
                            margin-bottom: 20px;
                        ">🛡️</div>
                        <h1 style="margin: 0 0 20px 0; font-size: 28px;">Security Alert</h1>
                        <p style="font-size: 16px; line-height: 1.5; margin: 15px 0;">Potential credential harvesting attempt detected.</p>
                        <p style="font-size: 16px; line-height: 1.5; margin: 15px 0;">This page has been secured to protect your information.</p>
                        <div style="
                            font-size: 24px;
                            font-weight: bold;
                            color: #ffeb3b;
                            margin-top: 20px;
                        " id="countdown">Redirecting in 5 seconds...</div>
                    </div>
                </div>
            `;

            // Add countdown functionality without inline scripts
            setupCountdown();

            // Disable all forms and inputs that might still exist
            disablePageInteractions();

            console.log("Page cleared and secured immediately");

        } catch (error) {
            // Fallback: Simple page clearing
            console.warn("Page clearing failed, using fallback:", error.message);
            
            try {
                document.body.innerHTML = `
                    <div style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: Arial, sans-serif;
                        background: #f44336;
                        color: white;
                        text-align: center;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 999999;
                    ">
                        <div>
                            <h1>Security Alert</h1>
                            <p>Potential threat detected. Page secured.</p>
                            <p>Redirecting in 5 seconds...</p>
                        </div>
                    </div>
                `;
                disablePageInteractions();
            } catch (fallbackError) {
                console.error("All page clearing methods failed:", fallbackError.message);
            }
        }
    }

    /**
     * Sets up the countdown without inline scripts (CSP compliant)
     */
    function setupCountdown() {
        try {
            let timeLeft = 5;
            const countdownElement = document.getElementById('countdown');
            
            if (countdownElement) {
                const timer = setInterval(() => {
                    timeLeft--;
                    countdownElement.textContent = `Redirecting in ${timeLeft} seconds...`;
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        countdownElement.textContent = 'Redirecting now...';
                    }
                }, 1000);
            }
        } catch (error) {
            console.warn("Countdown setup failed:", error.message);
        }
    }

    /**
     * Disables all page interactions to prevent credential submission
     */
    function disablePageInteractions() {
        try {
            // Disable all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }, true);
            });

            // Disable all inputs
            const inputs = document.querySelectorAll('input, textarea, select, button');
            inputs.forEach(input => {
                input.disabled = true;
                input.style.pointerEvents = 'none';
            });

            // Disable all links
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }, true);
                link.style.pointerEvents = 'none';
            });

            console.log("Page interactions disabled");
        } catch (error) {
            console.warn("Failed to disable some page interactions:", error.message);
        }
    }

    /**
     * Redirects to the target URL or logs for debugging.
     * @param {string} triggerSource - What triggered the redirect (e.g., 'password input', 'iframe content', 'iframe src').
     * @param {Element} element - The detected element (input or iframe).
     */
    function redirect(triggerSource, element) {
        if (hasRedirected) return;
        hasRedirected = true;

        // Detailed debug log for the detected element
        console.group(`Redirect triggered by ${triggerSource}`);
        console.log("Element details:", {
            tagName: element ? element.tagName : 'N/A',
            outerHTML: element ? element.outerHTML.slice(0, 500) + '...' : 'N/A',
            attributes: element ? Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            })) : [],
            parent: element && element.parentElement ? {
                tagName: element.parentElement.tagName,
                outerHTML: element.parentElement.outerHTML.slice(0, 200) + '...'
            } : 'No parent',
            domContext: document.body ? document.body.outerHTML.slice(0, 500) + '...' : 'No body'
        });
        console.groupEnd();

        // Save logs to localStorage for persistence
        localStorage.setItem('detectedElement', JSON.stringify({
            triggerSource,
            tagName: element ? element.tagName : 'N/A',
            outerHTML: element ? element.outerHTML.slice(0, 500) : 'N/A',
            attributes: element ? Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })) : []
        }));

        // Stop MutationObserver
        if (observer) {
            console.log("Disconnecting MutationObserver...");
            observer.disconnect();
            observer = null;
        }

        // Stop interval
        if (interval) {
            console.log("Clearing interval...");
            clearInterval(interval);
            interval = null;
        }

        // IMMEDIATELY clear the page to prevent credential submission
        clearPageImmediately();

        // Redirect or pause for debugging
        if (DISABLE_REDIRECT) {
            console.log("Redirect paused for debugging. Would redirect to https://mh1dat.github.io/portfolio/.");
        } else {
            setTimeout(() => {
                console.log("Redirecting to https://mh1dat.github.io/portfolio/...");
                window.location.replace("https://mh1dat.github.io/portfolio/");
            }, REDIRECT_DELAY);
        }
    }

    /**
     * Checks for password fields or login iframes in the DOM.
     */
    function checkForPasswordField() {
        if (hasRedirected || checkCount >= MAX_CHECKS) return;

        checkCount++;
        console.log(`Checking for password fields... (check #${checkCount}) at URL: ${location.href}`);

        try {
            // Check for password input in main DOM
            const passwordInputs = document.querySelectorAll("input[type='password']");
            if (passwordInputs.length > 0) {
                console.group("Password input detected in main DOM");
                console.log("Details:", {
                    outerHTML: passwordInputs[0].outerHTML,
                    attributes: Array.from(passwordInputs[0].attributes).map(attr => ({
                        name: attr.name,
                        value: attr.value
                    }))
                });
                console.groupEnd();
                redirect("password input", passwordInputs[0]);
                return;
            }

            // Check iframes
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
                // Try to access iframe content (same-origin only)
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc) {
                        const iframeInputs = iframeDoc.querySelectorAll("input[type='password']");
                        if (iframeInputs.length > 0) {
                            console.group("Password input detected in iframe content");
                            console.log("Iframe details:", {
                                outerHTML: iframe.outerHTML.slice(0, 500) + '...',
                                input: iframeInputs[0].outerHTML
                            });
                            console.groupEnd();
                            redirect("iframe content", iframe);
                            return;
                        }
                    }
                } catch (e) {
                    console.log(`Cannot access iframe content (cross-origin): ${iframe.src}`);
                }

                // Fallback: Check iframe src and attributes
                const src = iframe.src.toLowerCase();
                const id = (iframe.id || '').toLowerCase();
                const className = (iframe.className || '').toLowerCase();
                if (src.includes('signin') || src.includes('auth') || src.includes('login') ||
                    id.includes('auth') || id.includes('login') || id.includes('signin') ||
                    className.includes('auth') || className.includes('login') || className.includes('signin')) {
                    console.group("Login iframe detected via src or attributes");
                    console.log("Details:", {
                        outerHTML: iframe.outerHTML.slice(0, 500) + '...',
                        attributes: Array.from(iframe.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                    console.groupEnd();
                    redirect("iframe src", iframe);
                    return;
                }
            }

            // Debug: Log all inputs in main DOM
            const allInputs = document.querySelectorAll('input');
            console.group(`Found ${allInputs.length} inputs in main DOM`);
            console.log("Inputs:", Array.from(allInputs).map(input => ({
                type: input.type || 'N/A',
                id: input.id || 'N/A',
                name: input.name || 'N/A',
                outerHTML: input.outerHTML.slice(0, 200) + '...'
            })));
            console.groupEnd();
        } catch (e) {
            console.error("Error in checkForPasswordField:", e.message);
        }
    }

    /**
     * Sets up periodic checks and MutationObserver.
     */
    function startWatching() {
        console.log("Starting password field detection...");

        // Initial check
        checkForPasswordField();

        // Periodic checks every 500ms
        interval = setInterval(() => {
            if (hasRedirected || checkCount >= MAX_CHECKS) {
                console.log(hasRedirected ? "Stopped due to redirect." : "Stopped after 60 seconds.");
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                return;
            }
            checkForPasswordField();
        }, 500);

        // MutationObserver for new inputs or iframes
        try {
            observer = new MutationObserver(() => {
                if (hasRedirected) return;
                console.log("DOM change detected, checking...");
                checkForPasswordField();
            });

            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                console.log("MutationObserver started on document.body.");
            } else {
                console.warn("document.body not available.");
            }
        } catch (e) {
            console.error("Error setting up MutationObserver:", e.message);
        }
    }

    // Start when document is ready
    if (document.readyState === 'loading') {
        console.log("Document loading, waiting for DOMContentLoaded...");
        document.addEventListener('DOMContentLoaded', startWatching, { once: true });
    } else {
        console.log("Document ready, starting immediately...");
        startWatching();
    }
})();