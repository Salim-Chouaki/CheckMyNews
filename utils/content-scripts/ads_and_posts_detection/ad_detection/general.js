
/**
 * filter out ads and posts that have already been marked as collected
 * @param posts a list of posts (collected and not collected)
 * @returns {[]} a list of non collected posts
 */
function filterCollectedAdsAndPosts(posts) {
    let filteredAdsAndPosts = [];
    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        if ((post.className.indexOf(COLLECTED) !== -1) || (post.className.indexOf(POST_COLLECTED) !== -1)) {
            continue
        }
        if (post.getAttribute('adan')) {
            continue
        }
        filteredAdsAndPosts.push(post);
    }
    return filteredAdsAndPosts;
}

/**
 * get all front ad DOM elements. Since several methods have been employed over the years,
 * and Facebook is known to return to old methods from time to time, we use all methods in conjuction
 *
 * @return {array} array containing all front adsu
 */
function getFeedAdFrames(funParent=getParentAdDiv) {
    let links = []
    links = filterCollectedAdsAndPosts(links);
    Array.prototype.push.apply(links,findAdsWithClassAndSpanElement()); // THIS IS FOR NEW INTERFACE, I REMOVED THE ONE FOR OLD INTERFACE SINCE IT DOES NOT EXIST ANYMORE
    Array.prototype.push.apply(links,findAdsWithClassAndBoldElements()); // THIS IS FOR NEW INTERFACE, I REMOVED THE ONE FOR OLD INTERFACE SINCE IT DOES NOT EXIST ANYMORE
    links = uniqueArray(links);
    let already_in_list = new Set([]);
    let frontAds = [];
    for (let i=0;i<links.length;i++) {
        let link = links[i];
        let frame = funParent(link);
        if (frame===undefined || frame === null || already_in_list.has(frame.id)) {
            continue
        }
        frontAds.push(frame);
        already_in_list.add(frame.id)
    }
    frontAds = uniqueArray(frontAds);
    frontAds = filterCollectedAdsAndPosts(frontAds);
    return frontAds;
}


function grabAllAds(){
    let facebookInterfaceVersion = getFacebookInterfaceVersionFromParsedDoc(document);
    if (facebookInterfaceVersion=== INTERFACE_VERSIONS.old) {
       // captureErrorContentScript(grabSideAds,[],{});
        captureErrorContentScript(grabFeedAds,[],{});
    } else if (facebookInterfaceVersion=== INTERFACE_VERSIONS.new) {
        captureErrorContentScript(grabFeedAdsNewInterface,[],{});
    }
    setTimeout(grabAllAds, INTERVAL);
}



