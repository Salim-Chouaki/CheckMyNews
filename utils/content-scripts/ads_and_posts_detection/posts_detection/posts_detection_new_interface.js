var COMMENTS_CLASS_NEW_INTERFACE = "l9j0dhe7 ecm0bbzt qt6c0cv9 dati1w0a j83agx80 btwxx1t3 lzcic4wl";
var POST_TEXT_CLASS_NEW_INTERFACE = "ecm0bbzt hv4rvrfc ihqw7lf3 dati1w0a";
var LIKES_CLASS_NEW_INTERFACE = "gpro0wi8 cwj9ozl2 bzsjyuwj ja2t1vim";
var POST_USER_NAME_NEW_INTERFACE = "oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl oo9gr5id gpro0wi8 lrazzd5p";


/**
 * Removes comments from the Post object
 * @param raw_ad html object of the post before removing comments
 * @returns {string} html object after removing comments
 */
function removeCommentsFromPostNewInterface(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let comments = element.getElementsByClassName(COMMENTS_CLASS_NEW_INTERFACE);
    while (comments.length > 0 ) {
        let list = comments[0].closest("ul");
        list.parentNode.removeChild(list);
        comments = element.getElementsByClassName(COMMENTS_CLASS_NEW_INTERFACE);
    }
    return element.innerHTML;
}

/**
 * Removes text from the Post object
 * @param raw_ad html object of the post before removing text
 * @returns {string} html object after removing text
 */
function removeTextFromPostNewInterface(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(POST_TEXT_CLASS_NEW_INTERFACE);
    for(let i=0; i < texts.length; i++) {
        texts[i].parentNode.removeChild(texts[i]);
    }
    return element.innerHTML;
}

/**
 * Removes advertiser_name from the Post object
 * @param raw_ad html object of the post before removing advertiser
 * @returns {string} html object after removing advertiser
 */
function removeAdvertiserNameNewInterface(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(POST_USER_NAME_NEW_INTERFACE);
    for(let i=0; i < texts.length; i++) {
        texts[i].innerText = texts[i].innerText.hashCode()
    }
    return element.innerHTML;
}

/**
 * Removes the name of users who liked from the Post object
 * @param raw_ad html object of the post before removing the names
 * @returns {string} html object after removing the names
 */
function removeLikesNewInterface(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(LIKES_CLASS_NEW_INTERFACE);
    for(let i=0; i < texts.length; i++) {
        texts[i].innerText = texts[i].innerText.hashCode()
    }
    return element.innerHTML;
}

/**
 * returns True if the post is public, false instead
 * @param raw_ad html object of the post
 * @returns {boolean}
 */
function isPublicPostNewInterface(raw_ad) {

    let allSvgs = raw_ad.getElementsByTagName("svg");
    for(let i = 0; i < allSvgs.length; i++) {
        if(allSvgs[i].getAttribute("title")) {
            if(PUBLIC_LABELS.includes(allSvgs[i].getAttribute("title"))) {
                return true
            }
        }


        let title_elements_inside_svg = allSvgs[i].getElementsByTagName("title")
        if(title_elements_inside_svg.length > 0) {
            if(PUBLIC_LABELS.includes(title_elements_inside_svg[0].textContent)) {
                return true
            }
        }

    }

    return false;
}

/**
 * returns posts that we did not consider yet from dom
 * @returns {Array} array of posts
 */
function getNewHtmlPosts() {

    //First we select the parent div of the post (because this one seem to be more stable compared to the post div directly)
    let allDomPostsParent = document.getElementsByClassName(POST_CLASS_NEW_INTERFACE);

    // For each selected div, select the post inside using the role = 'article'
    let allDomPosts = []
    for (let i = 0; i<allDomPostsParent.length; i++) {
        try{
            allDomPosts.push(allDomPostsParent[i].querySelectorAll("div[role=article]")[0])
        }
        catch (error){
            continue
        }
    }

    //In case the selector of the post div changed, we still use the parent div
    if (allDomPosts.length === 0) {
        allDomPosts = allDomPostsParent;
    }

    // Remove the posts that were already collected
    allDomPosts = filterCollectedAdsAndPosts(allDomPosts)

    return allDomPosts
}

/**
 * Returns True if the post is a news post (landing url to a news domain). We handle the other condition (post published by news source) later when we get the publisher id
 * @param postData object containing the landing pages of the post
 * @returns {boolean}
 */
function isNewsPost(postData) {

    for (let j = 0; j < postData['landing_pages'].length; j++) {
        let landing_domain = url_domain(postData['landing_pages'][j]);
        let shortcut_domain = getShortcutNewsDomain(landing_domain);
        if (landing_domain === '' || landing_domain === undefined)
            continue;

        if (isNewsDomain(landing_domain) || shortcut_domain !== '') {
            return true;
        }
    }
    return false;

}

/**
 * Retreives all post information for storing in db
 * @param postData object containing some info of the post
 * @param html_post html object of the post
 * @returns {*} the final post object
 */
function getExtraPostData(postData, html_post) {
    let pos = getPos(html_post);

    if(html_post.id) {
        postData["adanalyst_ad_id"] = html_post.id
    }
    else {
        postData["adanalyst_ad_id"] = markAd(html_post);
    }

    postData["html_ad_id"] = postData["adanalyst_ad_id"]
    postData[MSG_TYPE] = FRONTADINFO;
    postData["user_id"] = getUserId();
    postData["raw_ad"] = html_post.outerHTML;
    postData["timestamp"] = (new Date).getTime();
    postData['offsetX'] = pos.x;
    postData['offsetY'] = pos.y;
    postData['visibleDuration'] = [];
    postData["images"] = getImagesFromPost(html_post)

    return postData;

}

/**
 * This function anonymises a collected post by removing comments and private text
 * @param raw_ad html object of the post
 * @param is_public is true if the post is public
 * @constructor
 * @return {string}
 */
function anonymizePostNewInterface(raw_ad, is_public) {
    raw_ad = removeCommentsFromPostNewInterface(raw_ad);
    raw_ad = removeLikesNewInterface(raw_ad);
    if(!is_public) {
        raw_ad = removeTextFromPostNewInterface(raw_ad);
        raw_ad = removeAdvertiserNameNewInterface(raw_ad);
    }
    return raw_ad;
}

/**
 * Add events listeners and mousetrackers to the post, and sends it for collection
 * @param postData
 */
function collectPostNewInterface(postData) {
    addEventListeners(postData);
    MouseTrack(postData);
    captureErrorContentScript(notifyOverloadForMoreAdInfo,  [postData], undefined);
}


/**
 * collect news posts and public posts from users news feed for the new interface
 */
function grabNewsPostsNewInterface() {
    let allDomPosts = getNewHtmlPosts()

    for (let i = 0; i < allDomPosts.length; i++) {
        let postData = { 'landing_pages': getLandingPagesFromPost(allDomPosts[i]) }
        postData["public"] = isPublicPostNewInterface(allDomPosts[i])


        if (isNewsPost(postData)) {
            allDomPosts[i].className += " " + POST_COLLECTED;
            postData["type"] = TYPES.newsPost;
            postData = getExtraPostData(postData, allDomPosts[i])
            collectPostNewInterface(postData);
        }

        else if (postData["public"]) {
            allDomPosts[i].className += " " + POST_COLLECTED;
            postData["type"] = TYPES.publicPost;
            postData = getExtraPostData(postData, allDomPosts[i])
            collectPostNewInterface(postData);
        }

        else{
            allDomPosts[i].className += " " + POST_COLLECTED;
            add_post_to_private_posts_queue(allDomPosts[i])
        }
    }

}


