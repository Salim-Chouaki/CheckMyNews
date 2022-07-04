
/**
 * return the ad div that corresponds to the whole ad object
 *
 * @param  {object} elem DOM element that is a child the ad DOM element
 * @return {object}      DOM element of the whole ad
 */
function getParentAdDivNewInterface(elem) {
    if(elem === null) {
        return
    }
    if (elem.getAttribute('aria-describedby') && (elem.getAttribute('role') && elem.getAttribute('role') === "article")) {
        return elem;
    }
    return getParentAdDivNewInterface(elem.parentElement);
}

/**
 * processes front ad object adding in the object 
 * all the data/meta data that we save in the server (except of explanation of the ad)
 * 
 * @param  {object} frontAd DOM element of the front ad
 * @return {{offsetX: Object.offsetLeft, offsetY: Object.offsetTop, user_id: string, html_ad_id: string, landing_pages: [], raw_ad: string, type: string, visibleDuration: [], adanalyst_ad_id: string, timestamp: number}}         object to be send to the server
 */
function processFeedAdNewInterface(frontAd) {

    let user_id = getUserId();
    let adanalystAdId = markAd(frontAd);
    let html_ad_id = adanalystAdId;
    let raw_ad = frontAd.outerHTML;
    let timestamp = (new Date).getTime();
    let pos = getPos(frontAd);
    let offsetX = pos.x;
    let offsetY = pos.y;
    let type = TYPES.frontAd;
    let images = getImagesFromPost(frontAd)
    let landing_pages = getLandingPagesFromPost(frontAd)

    return {"adanalyst_ad_id":adanalystAdId, "html_ad_id":html_ad_id, "raw_ad":raw_ad, "timestamp":timestamp, 'offsetX':offsetX, 'offsetY':offsetY, 'type':type, "user_id":user_id, 'visibleDuration': [], "images" : images, "landing_pages" : landing_pages}

}

function getSponsoredCandidatesLinks() {
    return document.getElementsByClassName("j1lvzwm4 stjgntxs ni8dbmo4 q9uorilb gpro0wi8");
}


/**
 * Collect ads using the class of the parent of the element containing 'sponsored'
 * It relies on the order attribute in the style element for sponsored letters
 * @returns {[]}
 */
function findAdsWithClassAndSpanElement() {
    let elems = getSponsoredCandidatesLinks();
    let links = [];
    for(let i=0; i<elems.length; i++){

        let second_span = elems[i].getElementsByTagName("span")[0];

        if (second_span === undefined || second_span === null) {
            continue
        }

        let childrens = second_span.children;

        let children_positions = {}
        for(let j=0; j<childrens.length; j++) {
            if(window.getComputedStyle(childrens[j], null).getPropertyValue("position") !== 'absolute' && childrens[j].style.display !== 'none') {
                let child_position = childrens[j].style.order
                children_positions[child_position] = childrens[j].textContent
            }
        }

        let res = ''
        for (const [key, value] of Object.entries(children_positions)) {
            res += value
        }

        for (let j=0; j < SPONSORED.length; j++) {

            if (res.includes(SPONSORED[j])) {
                links.push(elems[i])
            }
        }

    }
    return links;

}

function findAdsWithClassAndBoldElements() {
    let elems = getSponsoredCandidatesLinks();
    let links = [];
    for (let i = 0; i < elems.length; i++) {

        let first_b_element = elems[i].getElementsByTagName("b")[0];

        if (first_b_element === undefined || first_b_element === null) {
            continue
        }

        let res = first_b_element.textContent;

        for (let j = 0; j < SPONSORED.length; j++) {
            if (res.includes(SPONSORED[j])) {
                links.push(elems[i])
            }
        }

    }
    return links;
}


    /**
 * Grabs front Ads periodically
 *
 * @return {}
 */
function grabFeedAdsNewInterface() {
    let frontAds = captureErrorContentScript(getFeedAdFrames,[getParentAdDivNewInterface],[]);
    for (let i=0;i<frontAds.length;i++) {
        let adData = captureErrorContentScript(processFeedAdNewInterface,[frontAds[i]],{});
        if (isEqual(adData,{})==true) {
            continue;
        }
        frontAds[i].className += " " + COLLECTED;
        addEventListeners(adData);
        MouseTrack(adData);
        adData[MSG_TYPE] = FRONTADINFO;
        captureErrorContentScript(notifyOverloadForMoreAdInfo,[adData],undefined);
    }
}

/**
 * Returns True if facebook_page_id is containes in our list of news sources Facebok pages
 * @param facebook_page_id
 * @returns {boolean}
 */
function isNewsOrganisationFacebookPage(facebook_page_id) {
    if (facebook_page_id === '' || facebook_page_id === undefined)
        return false;

    let facebook_ids = getFacebookIdsArray();
    if(facebook_ids === undefined){
        throw "FACEBOOK_PAGE_IDS not defined !"
    }
    for (let i = 0; i < facebook_ids.length; i++) {
        if (facebook_ids[i].toString() === facebook_page_id) {
            return true;
        }
    }
    return false;
}

function saveAdAndPostToDbNewInterface(event) {
    let customId = event.data.customId;
    let adData = getAdFromCustomAdanalystId(customId);

    /**
     //We know that public_post and news post doesn't have id
     //So we put this condition to avoid having ads collected as posts
     if( event.data.adId === - 1 || adData.type === "frontAd") {
     **/
    for (const [key, value] of Object.entries(event.data)) {
        adData[key] = value
    }

    if ((adData.type !== TYPES.newsPost) && isNewsOrganisationFacebookPage(adData.advertiser_facebook_id)) {
        adData.type = TYPES.newsPost
    }

    if(adData.type === TYPES.newsPost) {
        adData.raw_ad = anonymizePostNewInterface(adData.raw_ad, adData.public);
    }
    chrome.runtime.sendMessage(adData, function(response) {
        if(response) {
            adData['saved'] = response['saved'];
            adData['dbId'] = response['dbId'];
            if(response['saved'] === true)  {
                let key = getKeyInFrontadqueue(adData["adanalyst_ad_id"])
                FRONTADQUEUE[key] = {
                    'adanalyst_ad_id' : adData["adanalyst_ad_id"],
                    'html_ad_id' : adData["html_ad_id"],
                    'dbId' : adData["dbId"],
                    'fb_id' : adData["fb_id"],
                    'objId' : adData["objId"],
                    'saved' : adData["saved"],
                    'type' : adData["type"],
                    'clientToken' : adData["clientToken"],
                    'graphQLAsyncParams' : adData["graphQLAsyncParams"],
                    'visibleDuration' : adData["visibleDuration"],
                }
            }
        }
    });

}

function getAdFromCustomAdanalystId(customAdAnalystId) {
    for (let i in FRONTADQUEUE) {
        if ((FRONTADQUEUE[i].adanalyst_ad_id===customAdAnalystId)) {
            let ad = FRONTADQUEUE[i];
            return ad;
        }
    }
    return NaN
}
