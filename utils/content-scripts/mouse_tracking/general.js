var MOUSE_CLICK_DATA = 'mouse_click_data';
var MOUSE_MOVE_DATA = 'mouse_move_data';
var AD_VISIBILITY_DATA = 'ad_visibility_data';
var POST_VISIBILITY_DATA = 'post_visibility_data';
var LikeButtonAllReactionsEventType = "LikeButtonAllReactionsEventType";
var commentButtonClickEventType = "CommentButtonClick";
var commentWritingEventType = "CommentWriting";
var shareEventType = "Share";
var advertiserPageCheckType = "AdvertiserPageCheck";
var advertiserPageRightClickType = "RightClickOnAdvertiser";
var advertiserLogoRightClick = "RightClickOnAdvertiserLogo";
var advertiserCheck = "AdvertiserCheck";
var visitingLandingUrlEventType = "VisitingLandingURL";
var rightClickOnLandingUrlEventType = "RightClickOnLandingUrl";
var minDifferenceForAdvertiserCheck = 1000; // 1 second
var imageClickedEventType = "ImageClicked";
var rightClickOnImage = "RightClickOnImage";
var carouselNextEvent = "AdCarouselNext";
var carouselPreviousEvent = "AdCarouselPrevious";
var previousCarouselListenerAdded = 0;
var lastEventType = "";
var commentWritingDivClass = "notranslate _5rpu";
var POST_QUEUE= {};
var Ad_Visible_INTERVAL = 500;
var Post_Visible_INTERVAL = 500;


chrome.storage.sync.set({"last_time": new Date().getTime()});


function storeAdClickEvent(ad, type, trial = 0, time = Date.now()) {

    lastEventType = type;
    let eventData = {
        'ts' : time,
        'dbId' : ad.dbId,
        'user_id': getUserId(),
        'type' : type
    };
    eventData[MSG_TYPE] = MOUSE_CLICK_DATA;

    if(eventData['dbId'] !== undefined)  {
        chrome.runtime.sendMessage(eventData);
    } else {
        if (trial < 3){
            setTimeout(function () {storeAdClickEvent(ad, type,trial+1, time)},3000);
        }
    }



}

function storeAdVisibilityEvent(ad, start_ts, end_ts, trial = 0){

    let eventData = {
        'dbId':ad.dbId,
        'user_id':getUserId(),
        'started_ts': start_ts,
        'end_ts': end_ts
    };
    eventData[MSG_TYPE] = AD_VISIBILITY_DATA;


    if (eventData['dbId'] !== undefined) {
        chrome.runtime.sendMessage(eventData);
    } else {
        if (trial < 3) {
            setTimeout( function () {storeAdVisibilityEvent(ad, start_ts, end_ts,trial + 1)},3000);
        }
    }
}

function storePostVisibilityEvent(post_id,start_ts,end_ts,) {
    let eventData = {
        'html_post_id':post_id,
        'user_id': getUserId(),
        'started_ts': start_ts,
        'end_ts': end_ts
    };
    eventData[MSG_TYPE] = POST_VISIBILITY_DATA;


    chrome.runtime.sendMessage(eventData);

}

function storeAdMouseMove(ad, mouseData, trial = 0){
    let eventData = {
        'dbId': ad.dbId,
        'user_id': getUserId(),
        'timeElapsed': mouseData.timeElapsed,
        'frames':JSON.stringify(mouseData.frames),
        'window':JSON.stringify(mouseData.window),
        'lastAdPosition':JSON.stringify(mouseData.lastAdPosition),
        'imagePostion':JSON.stringify(mouseData.imagePosition)
    };

    eventData[MSG_TYPE] = MOUSE_MOVE_DATA  ;

    if (eventData['dbId'] !== undefined) {
        chrome.runtime.sendMessage(eventData);
    } else {
        if (trial < 3) {
            setTimeout(function () {storeAdMouseMove(ad, mouseData, trial + 1)},2000);
        }
    }
}

function MouseTrack(ad) {
    let ad_extract = document.getElementById(ad.html_ad_id);
    ad_extract.addEventListener('mouseenter', function () {
        mus.record();
    });

    ad_extract.addEventListener('mouseleave', function () {
        mus.stop();
        let mouseData = { ...mus.getData() };
        //compute relative coordinates of the ad
        let p = toRelativeCoordinate(getElementCoordinate(this));
        if (p != undefined) {
            mouseData['lastAdPosition'] = p;
        }
        //compute relative coordinates of image inside this ad

        let mediaClassNames = ['uiScaledImageContainer', '_1ktf', '_5cq3', '_3chq', '_m54', '_kvn', 'scaledImageFitWidth img'];
        let ad_image_extract = undefined;
        for (let i in mediaClassNames) {
            ad_image_extract = this.getElementsByClassName(mediaClassNames[i]);
            if (ad_image_extract.length > 0) { break; }
        }

        if (ad_image_extract[0] != undefined) {
            //ad_image_extract.addEventListener("mouseenter", function () {
            //if(ad_image_extract[0] != undefined){
            let pImg = toRelativeCoordinate(getElementCoordinate(ad_image_extract[0]));
            if (pImg != undefined) {
                mouseData['imagePosition'] = pImg;
            }
        }

        storeAdMouseMove(ad,mouseData);
        mus.release(); //Clear all old data

    });

}

/**
 * convert static coordinates to relative coordinate
 * @param {Array} array of [top,lef, bottom,right] static coordinate
 * @return {Array} [top, left,bottom,right] relative coordinate
 */
function toRelativeCoordinate(coordinates) {
    if (coordinates === undefined) {
        return undefined;
    }

    let A = coordinates.slice();
    let elmHeight = A[2] - A[0];
    let screen = getUserView();

    if ((A[2] <= screen[1]) && (A[0] >= screen[0])) {
        A[0] -= screen[0];
        A[2] = A[0] + elmHeight
        return  A
    }

    else if (A[0] > screen[1] || A[2] < screen[0]) {
        return undefined
    }
    else {
        if (A[0] >= screen[0]) { //upper part is visible
            A[0] -= screen[0];
            A[2] = screen[1] - screen[0];
            return  A
        }
        else if (A[2] <= screen[1]) { //lower part is visible
            A[0] = 0;
            A[2] = A[2] - screen[0];
            return  A
        }
        else {
            return undefined
        }
    }
}


function getElementCoordinate(elem) {
    if (elem === undefined || isHidden(elem)) {
        return undefined
    }

    let elemTop = $(elem).offset().top;
    let elemLeft = $(elem).offset().left;
    let  elemBottom  =  elemTop  +  $ ( elem ).height ( ) ;
    let elemRight = elemLeft + $(elem).width();

    return [elemTop, elemLeft, elemBottom, elemRight]
}

/**
 *
 * @param {Array} ralative_coordinates of element
 * @return {Array} [visible height , invisible height, visible_state] of elm
 *                   visible_state: -1 : upper part visible, 1 - lower part visible, 0: visible all
 */
function getVisibleHeight(elm) {
    let  domPos  =  getElementCoordinate ( elm ) ;
    let  relPos  =  toRelativeCoordinate ( domPos ) ;
    if (relPos === undefined)
        return undefined

    let state = undefined

    if (relPos[2] - relPos[0] === domPos[2] - domPos[0]) {
        state = 0
    }
    else if (relPos[0] == 0) {
        state = -1
    }
    else {
        state = 1
    }
    return [relPos[2] - relPos[0], domPos[2] - domPos[0], state]
}

/**
 * Checking for visible ads:
 * - set start_visible_timestamp
 * - setTimeout to checkAdInvisible(ads)
 */
function checkAdVisibleDuration() {
    let currTs = (new Date()).getTime();

    for (let i in FRONTADQUEUE) {

        if ((isNaN(i) || i === "NaN") || (!("visibleDuration" in FRONTADQUEUE[i])) || (FRONTADQUEUE[i] === {}) || (Object.keys(FRONTADQUEUE[i]).length === 0))  {
            continue
        }

        let ad = document.getElementById(FRONTADQUEUE[i]['html_ad_id']);
        if (ad === undefined) {
            FRONTADQUEUE[i] = {};
            continue;
        }

        let visible_state = getVisibleHeight(ad);

        let visible_fraction = undefined
        if (visible_state  !== undefined) {
            visible_fraction = (visible_state[0] / visible_state[1]);
        }

        let l = FRONTADQUEUE[i]['visibleDuration'].length;

        if ((visible_state === undefined) || (visible_fraction < 0.3 && visible_state[0] < 350))  {  //update ts_end when ad become invisible
            if (l > 0 && FRONTADQUEUE[i]['visibleDuration'][l - 1]['ts_end'] === -1) {
                FRONTADQUEUE[i]['visibleDuration'][l - 1]['ts_end'] = currTs;
                storeAdVisibilityEvent(FRONTADQUEUE[i], FRONTADQUEUE[i]['visibleDuration'][l - 1]['ts_start'], currTs);
            }
        }
        else if ((l === 0) || (l > 0 && FRONTADQUEUE[i]['visibleDuration'][l - 1]['ts_end'] !== -1)) {//set ts_start when ad visilbe
                FRONTADQUEUE[i]['visibleDuration'].push({ 'ts_start': currTs, 'ts_end': -1 })
            }
    }

    setTimeout(checkAdVisibleDuration, Ad_Visible_INTERVAL);
}

function checkPostVisibleDuration() {

    let currTs = (new Date()).getTime();
    for (let i in POST_QUEUE) {

        if ((isNaN(i) || i === "NaN") || (!("visibleDuration" in POST_QUEUE[i])) || (POST_QUEUE[i] === {}) || (Object.keys(POST_QUEUE[i]).length === 0))  {
            continue
        }

        let post=document.getElementById(POST_QUEUE[i]['html_post_id']);

        if (post === undefined) {
            POST_QUEUE[i] = {};
            continue;
        }

        let visible_state = getVisibleHeight(post);
        let visible_fraction = undefined
        if (visible_state  !== undefined) {
            visible_fraction = (visible_state[0] / visible_state[1]);
        }
        let l = POST_QUEUE[i]['visibleDuration'].length;

        if ((visible_state === undefined) || (visible_fraction < 0.3 && visible_state[0] < 350))  {  //update ts_end when ad become invisible
            if (l > 0 && POST_QUEUE[i]['visibleDuration'][l - 1]['ts_end'] === -1) {
                POST_QUEUE[i]['visibleDuration'][l - 1]['ts_end'] = currTs;
                storePostVisibilityEvent(POST_QUEUE[i].html_post_id, POST_QUEUE[i]['visibleDuration'][l - 1]['ts_start'], currTs);
            }
        }

        else if ((l === 0) || (l > 0 && POST_QUEUE[i]['visibleDuration'][l - 1]['ts_end'] !== -1)) {
                POST_QUEUE[i]['visibleDuration'].push({ 'ts_start': currTs, 'ts_end': -1 })
        }
    }
    setTimeout(checkPostVisibleDuration, Post_Visible_INTERVAL);
}


function addEventListeners(ad) {
    let facebookInterfaceVersion = getFacebookInterfaceVersionFromParsedDoc(document);
    if (facebookInterfaceVersion=== INTERFACE_VERSIONS.old) {
        addEventListenersOldInterface(ad)
    } else if (facebookInterfaceVersion=== INTERFACE_VERSIONS.new) {
        addEventListenersNewInterface(ad)
    }
}

// WE ARE NOT USING THIS STARTING FROM VERSION 0.0.0.10 OF CHECKMYNEWS, WE MOVED THE DETECTION OF PRIVATE POSTS TO THE FUNCTION THAT DETECTS NEWS AND PUBLIC POSTS
// WE DID THIS ONLY FOR NEW INTERFACE AS THE OLD ONE IS NO LONGER AVAILABLE
function grabPosts() {
    let facebookInterfaceVersion = getFacebookInterfaceVersionFromParsedDoc(document);
    if (facebookInterfaceVersion === INTERFACE_VERSIONS.old) {
        captureErrorContentScript(grabPostsOldInterface, [], {});
    } else if (facebookInterfaceVersion === INTERFACE_VERSIONS.new) {
        captureErrorContentScript(grabPostsNewInterface, [], {});
    }
    setTimeout(grabPosts, INTERVAL);
}
