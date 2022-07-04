

const BROWSERS = {CHROME:'chrome',FIREFOX:'firefox'}


/**
 * Detect which of the supported browsers are being used.
 */
function Browser_detection() {

    if (navigator.userAgent.search("Chrome") >= 0) {
        return BROWSERS.CHROME;

    }
    if (navigator.userAgent.search("Firefox") >= 0) {
        return BROWSERS.FIREFOX;
    }
    return NaN;
}

