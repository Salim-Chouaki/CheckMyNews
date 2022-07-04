
var ONMOUSEOVER = 'onmouseover'; // attributes whose values store actual links for landing pagesm, for some links and not facebook's ones for parsing landing pages in frontads
var SWAPINGFUNCTION = /"[\s\S]*"/; // related to getting landing urls
var LINKSHIMASYNCLINK = 'LinkshimAsyncLink';
var LINK_TAG = 'a';
var FRONTADINFO = 'front_ad_info';
var POST_COLLECTED = "post_collected";


/**
 * returns all the images contained in a post
 * @param html_post the html object of the post
 * @returns {*} list of the images
 */
function getImagesFromPost(html_post) {

    let links = html_post.getElementsByTagName(LINK_TAG)

    let images = []
    for (let i = 0; i < links.length; i++) {

        let link = links[i];

        let imgs = link.getElementsByTagName('img');
        for (let j = 0; j < imgs.length; j++) {
            if (imgs[j].src) {
                images.push(imgs[j].src)
            }
        }
    }

    let additionalImages = html_post.getElementsByClassName('scaledImageFitWidth');
    for (let i = 0; i < additionalImages.length; i++) {
        images.push(additionalImages[i].src);
    }

    additionalImages = html_post.getElementsByClassName('scaledImageFitHeight');
    for (let i = 0; i < additionalImages.length; i++) {
        images.push(additionalImages[i].src);
    }

    additionalImages = html_post.getElementsByClassName('_kvn img');
    for (let i = 0; i < additionalImages.length; i++) {
        images.push(additionalImages[i].src);
    }

    additionalImages = html_post.getElementsByClassName(IMG_CLASS_NEW_INTERFACE_CLASS);
    for (let i = 0; i < additionalImages.length; i++) {
        images.push(additionalImages[i].src);
    }

    return images.unique()

}


/**
 * returns all the landing urls contained in a post
 * @param html_post the html object of the post
 * @returns {*} a list of the landing urls
 */
function getLandingPagesFromPost(html_post) {

    let links = html_post.getElementsByTagName(LINK_TAG)
    let landingPages = getURLsFromString(html_post.outerHTML);

    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let onmouseover = link.getAttribute(ONMOUSEOVER);

        if ((!onmouseover) || (onmouseover.indexOf(LINKSHIMASYNCLINK) === -1)) {
            continue
        }
        let urls = onmouseover.match(SWAPINGFUNCTION);
        if (!urls) {
            continue
        }
        landingPages.extend(urls);
    }

    for (let ix = 0; ix < landingPages.length; ix++) {
        if (landingPages[ix].indexOf('l.php?u=https%3A') !== -1 || landingPages[ix].indexOf('l.php?u=http%3A') !== -1) {
            let begIdx = nthIndex(landingPages[ix], 'http', 2);
            if (begIdx !== -1) {
                landingPages[ix] = percentDecodeURL(landingPages[ix].substring(begIdx))
            }
        }
    }

    landingPages = cleanLandingPages(landingPages);
    return landingPages.unique()
}


/**
 * clean urls
 * @param landingPages a list of landing urls
 * @returns {[]} a list of cleaned landing urls
 */
function cleanLandingPages(landingPages) {
    let res = [];
    for(let i=0; i<landingPages.length; i++ ) {
        let domain = landingPages[i].replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
        if(domain !== 'w3.org') {
            res.push(landingPages[i]);
        }
    }
    return res;
}


