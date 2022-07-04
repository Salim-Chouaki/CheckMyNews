
function getExplanationUrlFrontAds(frontAd,adData) {
    let buttonId = getButtonId(frontAd)
    adData.buttonId = buttonId;
    addToFrontAdQueue(adData);
    hoverOverButton(frontAd);
    return true;
}

/**
 * hover over the front ad's "More" button. This triggers the an ajax request to Facebook
 * which retrieves the more button contents, including the parameters
 * embeded in the "Why Am I Seiing This?" button.
 *
 * @param  {object} adFrame DOM element of the front ad
 * @return
 */
function hoverOverButton(adFrame) {
    let moreButton = getMoreButtonFrontAd(adFrame);
    moreButton.dispatchEvent(new MouseEvent('mouseover'));
}

/**
 * return the id of the "More" button to be used to match it with the more button in the overloaded script
 * @param  {object} adFrame DOM element of the front ad
 * @return {string}         id of the "More" button
 */
function getButtonId(adFrame) {
    let moreButton = getMoreButtonFrontAd(adFrame);
    return moreButton.parentElement.id;
}

/**
 * get the DOM element that cprresponds to the more button of the (TODO: make sure it is only front) ad
 *
 *
 * @param  {object} adFrame DOM element of the ad
 * @return {object}         more button DOM element
 */
function getMoreButtonFrontAd(adFrame) {
    let links = adFrame.getElementsByTagName('a');
    for (let i=0;i<links.length;i++) {
        if (MORE_LINK_FRONT_LABEL.indexOf(links[i].getAttribute("aria-label"))>=0) {
            return links[i]
        }
    }
}

/**
 * return the image urls of background elements. Essentially grabs the preview snapshot of a video.
 * @param  {object} frontAd DOM element of front ad
 * @return {[array]}        array of background image urls
 */
function getBackgroundUrlImages(frontAd) {
    let images = [];
    let additionalImages = frontAd.getElementsByTagName('img');
    for (let i=0;i<additionalImages.length;i++) {
        if (additionalImages[i].outerHTML.indexOf("background-image: url")>-1) {
            let backgroundImage = additionalImages[i].style.backgroundImage.replace('url("','')
            backgroundImage = backgroundImage.slice(0,backgroundImage.length-2)
            images.push(backgroundImage);
        }
    }
    return images;
}

/**
 * get video id of front ad video
 *
 * @param  {object} frontAd DOM element of front ad
 * @return {string(TODO: check if number)}         video id of front ad
 */
function getVideoId(frontAd) {
    let videoId=null;
    inputs = frontAd.getElementsByTagName('input');
    for (let i=0;i<inputs.length;i++) {
        if (inputs[i].getAttribute('name') === 'ft_ent_identifier') {
            videoId = inputs[i].getAttribute('value');
        }
    }
    return videoId
}


/**
 * check if front ad contains a video
 *
 * @param  {object}  frontAd DOM element of front ad
 * @return {Boolean}         true if front ad has a video, else false
 */
function isVideo(frontAd) {
    return frontAd.getElementsByTagName('video').length>0
}

/**
 * return advertiser id from the front ad
 *
 *
 * @param  {object} frontAd DOM element of the front ad
 * @return {string}         advertiser id
 */
function getAdvertiserId(frontAd) {
    let links = frontAd.getElementsByTagName('a');
    let link = null
    for  (let i=0;i<links.length;i++) {
        if (links[i].hasAttribute('data-hovercard') && (links[i].getElementsByTagName('img').length>0)) {
            link = links[i];
            break
        }
    }

    if (!link) {
        links = frontAd.getElementsByClassName("oajrlxb2 gs1a9yip g5ia77u1 mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 q9uorilb mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso l9j0dhe7 i1ao9s8h esuyzwwr f1sip0of du4w35lb lzcic4wl abiwlrkh p8dawk7l oo9gr5id");
        for(let i=0; i < links.length; i++) {
            if((links[i].tagName === 'A') && (links[i].getElementsByTagName('img').length > 0 || links[i].getElementsByTagName('image').length > 0)) {
                link = links[i];
                let advertiserId = '-1';
                let facebookPage = link.href.substring(0, link.href.indexOf('?'));

                let advertiserImage = link.getElementsByTagName('img');
                if(advertiserImage.length > 0 ) {
                    advertiserImage = advertiserImage[0].src;
                    return [advertiserId,facebookPage,advertiserImage];
                }
                return "";
            }
        }
        if(!link) {
            return
        }

    }

    let advertiserId = '-1';
    try {
        let hovercard = link.getAttribute('data-hovercard')
        advertiserId = hovercard.match(/id=?[0-9]+/)[0].match(/[0-9]+/)[0]
        if (!isNumeric(advertiserId)) {
            advertiserId ='-1';
        }

    } catch (e) {
        debugLog(e)
    }

    let facebookPage = link.href.substring(0, link.href.indexOf('?'));
    let advertiserImage = link.getElementsByTagName('img')[0].src
    return [advertiserId,facebookPage,advertiserImage]

}

