
var PUBLIC_LABELS = ["Shared with Public", "Partagé avec Public", "Conteúdo partilhado com: Público", "Compartilhado com Público", "Mit Öffentlich geteilt", "Compartido con: Público"] // English (US + UK), France (FR + CA), Portuguese (PT), Portuguese (BR), Deutch (DE), Spanish (Spain)


 /**
 * Check whether a given domain is a shortcut of news domain
 */
function getShortcutNewsDomain(landing_domain) {
    if (landing_domain === '' || landing_domain === undefined) {
        return '';
    }
    if (Object.keys(DOMAIN_SHORTCUT).includes(landing_domain)) {
        return DOMAIN_SHORTCUT[landing_domain]
    }
    return '';
}

/**
 * Collects news posts from the Facebook feed
 */
function grabNewsPosts() {
    let facebookInterfaceVersion = getFacebookInterfaceVersionFromParsedDoc(document);
    if (facebookInterfaceVersion=== INTERFACE_VERSIONS.old) {
        captureErrorContentScript(grabNewsPostsOldInterface,[],{});
    } else if (facebookInterfaceVersion=== INTERFACE_VERSIONS.new) {
        captureErrorContentScript(grabNewsPostsNewInterface,[],{});
    }
    setTimeout(grabNewsPosts, INTERVAL);
}

/**
 * Returns true if the domain is a news source (is in our list of news sources)
 * @param landing_domain
 * @returns {boolean}
 */
function isNewsDomain(landing_domain) {
    if (landing_domain === '' || landing_domain === undefined)
        return false;

    let domains = getNewsDomainsArray();

    if(domains === undefined) {
        throw "NEWS DOMAINS AND SHORT DOMAINS ARE UNDEFINED !";
    }

    for (let i = 0; i < domains.length; i++) {
        if (domains[i] === landing_domain) {
            return true;
        }
    }
    return false;
}

/**
 * Extracts domain form URL
 * @param data
 * @returns {string}
 */
function url_domain(data) {
    let a = document.createElement('a');
    a.href = data;
    return a.hostname.replace('www.', '');
}
