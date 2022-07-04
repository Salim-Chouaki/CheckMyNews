var POST_TEXT_CLASS_OLD_INTERFACE = "_5pbx userContent _3576";
var POST_COMMENTS_CLASS = "_7791";
var TYPE_OF_POST_CLASS = "uiStreamPrivacy inlineBlock fbStreamPrivacy fbPrivacyAudienceIndicator _5pcq";
var POST_USER_NAME = "fwb fcg";
var GROUP_NAME ="_wpv";
var LIKES_CLASS = "_81hb";


function collectPost(domPost, postData) {
    addEventListeners(postData);
    MouseTrack(postData);
    captureErrorContentScript(getExplanationUrlFrontAds, [domPost, postData], undefined);
}


function removeCommentsFromPost(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let comments = element.getElementsByClassName(POST_COMMENTS_CLASS);
    for(let i=0; i < comments.length; i++) {
        comments[i].parentNode.removeChild(comments[i]);
    }
    return element.innerHTML;
}

function removeTextFromPost(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(POST_TEXT_CLASS_OLD_INTERFACE);
    for(let i=0; i < texts.length; i++) {
        texts[i].parentNode.removeChild(texts[i]);
    }
    return element.innerHTML;
}

function removeAdvertiserName(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(POST_USER_NAME);
    for(let i=0; i < texts.length; i++) {
        texts[i].innerText = texts[i].innerText.hashCode()
    }
    return element.innerHTML;
}

function removeGroupName(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(GROUP_NAME);
    for(let i=0; i < texts.length; i++) {
        texts[i].innerText = texts[i].innerText.hashCode()
    }
    return element.innerHTML;
}

function removeLikes(raw_ad) {
    let element = document.createElement( 'div' );
    element.innerHTML = raw_ad;
    let texts = element.getElementsByClassName(LIKES_CLASS);
    for(let i=0; i < texts.length; i++) {
        texts[i].innerText = texts[i].innerText.hashCode()
    }
    return element.innerHTML;
}


function isPublicPost(raw_ad) {
    let element = document.createElement('div');
    element.innerHTML = raw_ad;
    let typeLink = element.getElementsByClassName(TYPE_OF_POST_CLASS);

    if(typeLink.length > 0 ) {
        typeLink = typeLink[0];
        if(typeLink.getAttribute("aria-label")) {
            if(PUBLIC_LABELS.includes(typeLink.getAttribute("aria-label"))) {
                return true;
            }
        }
    }

    return false
}


/**
 * This function    anonymises a collected post by removing comments and private text
 * @param raw_ad
 * @param is_public True if the post is public
 * @constructor
 * @return {string}
 */
function anonymizePostOldInterface(raw_ad, is_public = false) {
    raw_ad = removeCommentsFromPost(raw_ad);
    raw_ad = removeLikes(raw_ad);
    if(!is_public){
        raw_ad = removeTextFromPost(raw_ad);
        raw_ad = removeAdvertiserName(raw_ad);
        raw_ad = removeGroupName(raw_ad);
    }
    return raw_ad;
}


function processNewsPostOldInterface(frontAd) {

    let html_ad_id = frontAd.id;
    ADSA = frontAd
    let info = getAdvertiserId(frontAd);
    let advertiser_facebook_id = info ? info[0] : "";
    let advertiser_facebook_page = info ? info[1] : "";
    let advertiser_facebook_profile_pic = info ? info[2] : "";

    let raw_ad = frontAd.innerHTML;

    raw_ad = anonymizePostOldInterface(raw_ad);

    let timestamp = (new Date).getTime();
    let pos = getPos(frontAd);
    let offsetX = pos.x;
    let offsetY = pos.y;
    let type = TYPES.newsPost;
    let landing_pages = getLandingPagesFromPost(frontAd);
    let images = getImagesFromPost(frontAd);
    let video = isVideo(frontAd)
    let video_id = ''
    if (video) {
        video_id = getVideoId(frontAd);
        images = getBackgroundUrlImages(frontAd);

    }

    let user_id = getUserId();



    return { 'raw_ad': raw_ad, 'html_ad_id': html_ad_id, 'visibleDuration': [], 'timestamp': timestamp, 'offsetX': offsetX, 'offsetY': offsetY, 'type': type, 'landing_pages': landing_pages, 'images': images, 'user_id': user_id, advertiser_facebook_id: advertiser_facebook_id, advertiser_facebook_page: advertiser_facebook_page, advertiser_facebook_profile_pic: advertiser_facebook_profile_pic, video: video, video_id: video_id }

}

/**
 * Grab News Posts from user view
 */
function grabNewsPostsOldInterface() {

    let allAdsId = Object.keys(FRONTADQUEUE).map(key => FRONTADQUEUE[key]['html_ad_id']);
    let allDomPosts = $('div[id*="' + HTML_POST_ID + '"]');
    for (let i = 0; i < allDomPosts.length; i++) {
        if (!allAdsId.includes(allDomPosts[i].id)) {
            if (allDomPosts[i].className.indexOf(POST_COLLECTED) !== -1) {
                continue;
            }

            let postData = processNewsPostOldInterface(allDomPosts[i]);
            if (isEqual(postData, {}) == true || postData['landing_pages'].length == 0) {
                continue; }

            let collected = false;
            postData[MSG_TYPE] = FRONTADINFO;
            //Extract landing domain from post HTML
            for (let j = 0; j < postData['landing_pages'].length; j++) {
                landing_domain = url_domain(postData['landing_pages'][j]);
                shortcut_domain = getShortcutNewsDomain(landing_domain);
                if (landing_domain == '' || landing_domain === undefined)
                    continue;
                if (isNewsDomain(landing_domain) || shortcut_domain !== '') {
                    allDomPosts[i].className += " " + POST_COLLECTED;
                    if (shortcut_domain !== '')
                        postData['landing_pages'].push(shortcut_domain);
                    else
                        postData['landing_pages'].push(landing_domain);
                    collectPost(allDomPosts[i], postData);
                    collected = true;
                    break;
                }
            }
            if(collected === false) {
                if(isPublicPost(postData['raw_ad'])) {
                    postData["type"] = TYPES.publicPost;
                    collectPost(allDomPosts[i], postData);
                }
            }

        }
    }
}

