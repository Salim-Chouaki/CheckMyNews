
//interval  sets how often a the content script will be searching for ads
var INTERVAL = 5000;

//*********VARIABLES TO PUT IN THE MESSAGES COMMUNICATING WITH THE BACKGROUND SCRIPT*********************
var MSG_TYPE = 'message_type';
var GET_SPONSORED_TEXTS = 'get_sponsored_texts';
var UPDATE_NUMBER_OF_SURVEYS = "update_number_surveys";
var IMG_CLASS_NEW_INTERFACE_CLASS = "i09qtzwb n7fi1qx3 datstx6m pmk7jnqg j9ispegn kr520xx4 k4urcfbm bixrwtb6";

var SPONSORED = ['Sponsored', 'Sponsorisé', 'Commandité', 'Patrocinado' , 'Gesponsert', 'Publicidad'] // English (US + UK), France (FR), France (CA), Portuguese (PT + BR), Deutch (DE), Spanish (Spain)


// QUEEUE OF FRONT ADS THAT ARE CAPTURED. AFTERWARDS THE SCRIPT WILL HOVER OVER THEIR BUTTON IN ORDER TO RETRIEVE THE MORE BUTTON PARAMETERS (INCLUDING THE AD ID)
var FRONTADQUEUE= {};


function injectAdGrabberScripts() {
    let s = document.createElement("script");
    s.src = chrome.extension.getURL("injections/ads_new_interface.js");
    (document.head||document.documentElement).appendChild(s);


    let s1 = document.createElement("script");
    s1.src = chrome.extension.getURL("injections/xhr_overload_buttons.js");
    (document.head || document.documentElement).appendChild(s1);

}

function addToFrontAdQueue(ad) {
    if (Object.keys(FRONTADQUEUE).length<=0) {
        FRONTADQUEUE[0] = ad;
    }
    else {
        let nextNum = Math.max.apply(null,Object.keys(FRONTADQUEUE).map(function (x) {return parseInt(x)})) +1
        FRONTADQUEUE[nextNum] = ad;
    }
    return true;
}

function getKeyInFrontadqueue(customAdAnalystId) {
    for (let i in FRONTADQUEUE) {
        if ((FRONTADQUEUE[i].adanalyst_ad_id===customAdAnalystId)) {
            return i;
        }
    }
    return NaN
}


function update_surveys_number(){
    const updateNumberOfSurveyData = {};
    updateNumberOfSurveyData[MSG_TYPE] = UPDATE_NUMBER_OF_SURVEYS;
    chrome.runtime.sendMessage(updateNumberOfSurveyData);
}


function permissionToGrab() {

    if (window.location.pathname === "/") {
        msg = {};
        msg[MSG_TYPE] = 'consent';
        chrome.runtime.sendMessage(msg, function (response) {
            if (response.consent) {

                captureErrorContentScript(update_surveys_number, [], {})
                captureErrorContentScript(grabAllAds, [], {});
                captureErrorContentScript(grabNewsPosts, [], {});
                captureErrorContentScript(checkAdVisibleDuration, [], {});

// WE ARE NOT USING THIS STARTING FROM VERSION 0.0.0.10 OF CHECKMYNEWS, WE MOVED THE DETECTION OF PRIVATE POSTS TO THE FUNCTION THAT DETECTS NEWS AND PUBLIC POSTS
//                captureErrorContentScript(grabPosts, [], {});



                captureErrorContentScript(checkPostVisibleDuration, [], {});

                return true
            } else {
                setTimeout(permissionToGrab, INTERVAL);
            }
        })

    }
}

function update_sponsored_text(){
    let msg = {};
    msg[MSG_TYPE] = GET_SPONSORED_TEXTS;
    chrome.runtime.sendMessage(msg, function(response) {

        if (response['Status'] === "Error" ){
            setTimeout(captureErrorContentScript,30000, update_sponsored_text,[],{});
            return;
        }

        if(response['SponsoredTexts'] !== undefined){
            let lstSponsoredText = response['SponsoredTexts'].split(',')
            lstSponsoredText = lstSponsoredText.concat(SPONSORED);
            SPONSORED =  [...new Set(lstSponsoredText)];
        }

        if(response['PublicTexts'] !== undefined){
            let lstPublicText = response['PublicTexts'].split(',')
            lstPublicText = lstPublicText.concat(PUBLIC_LABELS);
            PUBLIC_LABELS =  [...new Set(lstPublicText)];
        }

        if(response['LikeTexts'] !== undefined){
            let lstLikeText = response['LikeTexts'].split(',')
            lstLikeText = lstLikeText.concat(LIKE_TEXTS);
            LIKE_TEXTS =  [...new Set(lstLikeText)];
        }

    });
}

function onMessageFunction(msg,sender,sendResponse) {

    /** adgrabber specific messages */
    if (!sender.tab) {
        if (msg.type === 'showInfoPopup'){
            captureErrorContentScript(createDialog, [dialogHtml], undefined);
            return
        }
    }

    /**     global messages */
    universalOnMessageFunction(msg,sender,sendResponse);
}

function addMessageListeners() {

    if (Browser_detection()=== BROWSERS.CHROME) {
        chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
            onMessageFunction(msg,sender,sendResponse)
        });
    }

    if (Browser_detection()=== BROWSERS.FIREFOX) {
        browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            onMessageFunction(msg,sender,sendResponse)
        });
    }
}

function addWidnowEventListeners() {

    window.addEventListener("message", function(event) {
        // We only accept messages from ourselves
        if (event.source !== window)
            return;

        else if (event.data.asyncParamsReady) {
            setAsynchParams(event);
        }

        else if (event.data.newInterface && event.data.ad_communication) {
            saveAdAndPostToDbNewInterface(event)
            return;
        }

        else if (event.data.adButton) {
            saveAdAndPostToDb(event)
            return;
        }

        universalCommunicationWithInjections(event);

    });

}


$(document).ready(function() {

    setTimeout(captureErrorContentScript,500, addWidnowEventListeners,[],{});
    setTimeout(captureErrorContentScript,500, addMessageListeners,[],{});
    setTimeout(captureErrorContentScript,500, update_sponsored_text,[],{});
    setTimeout(captureErrorContentScript, 3000,permissionToGrab,[],{});

    captureErrorContentScript(injectUniversalScripts,[],undefined);
    captureErrorContentScript(injectAdGrabberScripts,[],undefined);
//    captureErrorContentScript(updateAsyncParams,[],undefined);

    if ((window.location.href.indexOf('facebook.com/ads/manager')>-1) || (window.location.href.indexOf('facebook.com/adsmanager')>-1)) {
        throw new Error("Ads Manager");
    }

    if ((window.location.href.indexOf('www.facebook.com/ads/library/')>-1) ) {
        throw new Error("Ads Library");
    }

    if ((window.location.href.indexOf('facebook.com/ds/preferences')>-1) || (window.location.href.indexOf('facebook.com/ads/preferences')>-1)) {
        throw new Error("Ads Preference Page");
    }

});















