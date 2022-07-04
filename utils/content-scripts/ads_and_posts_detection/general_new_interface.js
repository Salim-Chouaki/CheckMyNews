
function notifyOverloadForMoreAdInfo(adData) {
    window.postMessage({grabNewInterface:true,customId:adData.adanalyst_ad_id, type:adData.type},"*")
    addToFrontAdQueue(adData);
    return true;
}


/**
 * mark an ad or post with an id for attributes id and adan
 * @param frontAd the ad or post object
 * @returns {string} the value of the id
 */
function markAd(frontAd){
    if (frontAd.getAttribute('adan')) {
        return frontAd.getAttribute('adan');
    }

    let mark  = document.createAttribute('adan');
    mark.value = generateUniqueId();
    frontAd.setAttributeNode(mark);

    /********************** For mouse tracking *************/
    let addedId = document.createAttribute('id');
    addedId.value = mark.value;
    frontAd.setAttributeNode(addedId);


    return mark.value;
}


/**
 * generate a unique string id with 'AdAn' as prefix. users performance.now() function
 *  which counts number of microseconds since page load as well as randomnumber making it exteremely hard
 *  to have collisions
 * @return {strint} unique string id
 */
function generateUniqueId(){
    let randomNum = Math.random().toString(36);
    let timeSincePageLoad = performance.now().toString(36);
    let time = new Date().getTime().toString(36);
    return 'AdAn'+randomNum+timeSincePageLoad+time;
}

