
/**
 * processes feed ad object adding in the object
 * all the data/meta data that we save in the server (except of explanation of the ad)
 *
 * @param  {object} feedAd DOM element of the front ad
 * @return {object}         object to be send to the server
 */
function processFeedAd(frontAd) {
    let html_ad_id = frontAd.id;
    let  info  =  getAdvertiserId ( frontAd ) ;
    let advertiser_facebook_id = info ? info[0] : "";
    let advertiser_facebook_page = info ? info[1] : "";
    let advertiser_facebook_profile_pic = info ? info[2] : "";
    let raw_ad = frontAd.innerHTML;
    let  timestamp  =  ( new  Date ) . getTime ( ) ;
    let  pos  =  getPos ( frontAd ) ;
    let  offsetX  =  pos.x ;
    let  offsetY  =  pos.y;
    let type = TYPES.frontAd;
    let landing_pages = getLandingPagesFromPost(frontAd)
    let images = getImagesFromPost(frontAd)
    let video  =  isVideo ( frontAd )
    let  video_id  =  ''
    if (video) {
        video_id = getVideoId(frontAd);
        images = getBackgroundUrlImages(frontAd);
    }
    let  user_id  =  getUserId() ;

    return { 'raw_ad': raw_ad, 'html_ad_id': html_ad_id, 'visibleDuration': [], 'timestamp': timestamp, 'offsetX': offsetX, 'offsetY': offsetY, 'type': type, 'landing_pages': landing_pages, 'images': images, 'user_id': user_id, advertiser_facebook_id: advertiser_facebook_id, advertiser_facebook_page: advertiser_facebook_page, advertiser_facebook_profile_pic: advertiser_facebook_profile_pic, video: video, video_id: video_id }
}

/**
 * return the ad div that corresponds to the whole ad object
 *
 * @param  {object} elem DOM element that is a child the ad DOM element
 * @return {object}      DOM element of the whole ad
 */
function getParentAdDiv(elem) {
    if (!elem){
        return undefined
    }

    if ((elem.id.length>0) && (elem.id.indexOf('hyperfeed_story_id')!==-1)){
        return elem;
    }
    return  getParentAdDiv(elem.parentElement);
}

/**
 * Grabs front Ads periodically
 *
 *
 * @return {}
 */
function grabFeedAds() {
    let frontAds = captureErrorContentScript(getFeedAdFrames, [], []);
    for (let i = 0; i < frontAds.length; i++) {
        let adData = captureErrorContentScript(processFeedAd, [frontAds[i]], {});
        if (isEqual(adData, {}) == true) {
            continue;
        }
        addEventListeners(adData);
        MouseTrack(adData);

        frontAds[i].className += " " + COLLECTED;
        adData[MSG_TYPE] = FRONTADINFO;
        captureErrorContentScript(getExplanationUrlFrontAds, [frontAds[i], adData], undefined);
    }
}


function saveAdAndPostToDb(event) {
    let qId = event.data.qId;
    let buttonId = event.data.buttonId
    let adData = getAdFromButton(qId,buttonId);
    adData.fb_id = event.data.adId;
    adData.explanationUrl = EXPLANATIONSURL + event.data.requestParams + '&' + $.param(event.data.asyncParams);
    adData.graphQLAsyncParams = event.data.graphQLAsyncParams;
    adData.clientToken = event.data.clientToken;
    chrome.runtime.sendMessage(adData, function(response) {
        adData['saved'] = response['saved'];
        adData['dbId'] = response['dbId'];
        if(response['saved'] === true){
            adData['raw_ad'] = '';
        }
    });

}

function getAdFromButton(qId,buttonId) {
    for (let i in FRONTADQUEUE) {
        if ((FRONTADQUEUE[i].buttonId===buttonId)) {
            let ad = FRONTADQUEUE[i];
            return ad;
        }
    }
    return NaN
}
