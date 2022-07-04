
var advertiserLinkClassNewInterface = "oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl oo9gr5id gpro0wi8 lrazzd5p";
var advertiserLogoClassNewInterface ="oajrlxb2 gs1a9yip g5ia77u1 mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 q9uorilb mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso l9j0dhe7 i1ao9s8h esuyzwwr f1sip0of du4w35lb lzcic4wl abiwlrkh p8dawk7l oo9gr5id";
var menuDivClassNewInterface = "oajrlxb2 gs1a9yip g5ia77u1 mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 pq6dq46d mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso l9j0dhe7 i1ao9s8h esuyzwwr f1sip0of du4w35lb lzcic4wl abiwlrkh p8dawk7l dwo3fsh8 pzggbiyp pkj7ub1o bqnlxs5p kkg9azqs c24pa1uk ln9iyx3p fe6kdd0r ar1oviwq l10q8mi9 sq40qgkc s8quxz6p pdjglbur";
var menuElementDivClassNewInterface = "oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 oi9244e8 oygrvhab h676nmdw cxgpxx05 dflh9lhu sj5x9vvc scb9dxdr i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l bp9cbjyn dwo3fsh8 btwxx1t3 pfnyh3mw du4w35lb"
var carouselNextClassNewInterface = "hu5pjgll m6k467ps sp_D-6eZQK8GT3 sx_dae08a";
var carouselPreviousClassNewInterface = "hu5pjgll m6k467ps sp_D-6eZQK8GT3 sx_126de3";
var minBodyImgSize = 200;

var LIKE_TEXTS = ["Like", "J’aime", "Curtir", "Gosto", "Gefällt mir", "Me gusta"]

function removeMenuListenerNewInterface() {
    let menuItems = document.getElementsByClassName(menuElementDivClassNewInterface);
    if(menuItems !== undefined && menuItems[0] !== undefined) {
        for(let i=0 ; i<menuItems.length ; i++) {
            let new_element = menuItems[i].cloneNode(true);
            menuItems[i].parentNode.replaceChild(new_element, menuItems[i]);
        }
    }
}

function addMenuListenersNewInterface(ad) {
    let menuItems = document.getElementsByClassName(menuElementDivClassNewInterface);
    if(menuItems !== undefined && menuItems[0] !== undefined) {
        for(let i=0; i<menuItems.length ; i++) {
            menuItems[i].addEventListener('click', function () {
                storeAdClickEvent(ad, menuItems[i].innerText.split('\n')[0]);
            });
        }
    }
}


function add_post_to_private_posts_queue(post){
    let nextNum = 0;
    if(Object.keys(POST_QUEUE).length>0){
        nextNum = Math.max.apply(null,Object.keys(POST_QUEUE).map(function (x) {return parseInt(x)})) +1 ;
    }
    markAd(post);
    POST_QUEUE[nextNum] = { 'html_post_id': post.id, 'timestamp': (new Date).getTime(), 'user_id': getUserId(),'visibleDuration':[] };

}

/**
 * Grab all post visible in user view
 * WE ARE NOT USING THIS STARTING FROM VERSION 0.0.0.10 OF CHECKMYNEWS, WE MOVED THE DETECTION OF PRIVATE POSTS TO THE FUNCTION THAT DETECTS NEWS AND PUBLIC POSTS
 */
function grabPostsNewInterface(){
    let nextNum = 0;
    if(Object.keys(POST_QUEUE).length>0){
        nextNum = Math.max.apply(null,Object.keys(POST_QUEUE).map(function (x) {return parseInt(x)})) +1 ;
    }

    if(window.location.href.indexOf('ads/preferences') === -1){
        let allAdsId = Object.keys(FRONTADQUEUE).map(key => FRONTADQUEUE[key]['html_ad_id']);
        let allPostId = Object.keys(POST_QUEUE).map(key => POST_QUEUE[key]['html_post_id']);

        let allDomPosts = document.getElementsByClassName(POST_CLASS_NEW_INTERFACE);
        for (let i = 0; i < allDomPosts.length; i++) {
            if((!allPostId.includes(allDomPosts[i].id) ) && (!allAdsId.includes(allDomPosts[i].id))){
                markAd(allDomPosts[i]);
                POST_QUEUE[nextNum] = { 'html_post_id': allDomPosts[i].id, 'timestamp': (new Date).getTime(), 'user_id': getUserId(),'visibleDuration':[] };
                nextNum++;
            }
        }
    }
}

function addEventListenersNewInterface(ad) {
    let dateForAdvertiserCheckWithHover;

    let frontAd = document.getElementById(ad.html_ad_id);

    let likeButton = undefined
    for(let i=0; i < LIKE_TEXTS.length; i++) {
        likeButton = frontAd.querySelectorAll('[aria-label="' + LIKE_TEXTS[i] + '"]')[0];
        if (likeButton !== undefined) {
            break;
        }
    }


    if(likeButton !== undefined ){
        likeButton.addEventListener('click', function (){
            storeAdClickEvent(ad, LikeButtonAllReactionsEventType);
        })
    }

    let commentButton = frontAd.querySelectorAll('[aria-label="Leave a comment"], [aria-label="Kommentar hinterlassen"]') [0]; //DIFFERENT VALUE ONLY FOR DEUTCH, BUT FOR OTHER LANGUAGES ITS THE ENGLISH VERSION
    if (commentButton !== undefined) {
        commentButton.addEventListener('click', function () {
            storeAdClickEvent(ad, commentButtonClickEventType)
        });

        /** this is useless
        commentButton.addEventListener('mouseleave', function () {
            let frontAdUpdated = document.getElementById(ad.html_ad_id);
            let commentWritingDiv = frontAdUpdated.getElementsByClassName(commentWritingDivClass)[0];
            if (commentWritingDiv !== undefined) {
                commentWritingDiv.addEventListener('DOMSubtreeModified', function () {
                    if (lastEventType !== commentWritingEventType) {
                        storeAdClickEvent(ad, commentWritingEventType);
                    }
                })
            }
        });
         **/
    }


    let shareButton = frontAd.querySelectorAll('[aria-label="Send this to friends or post it on your timeline."], [aria-label="Schicke das an Freunde oder poste es in deiner Chronik."]') [0]; //DIFFERENT VALUE ONLY FOR DEUTCH, BUT FOR OTHER LANGUAGES ITS THE ENGLISH VERSION
    if (shareButton !== undefined) {
        shareButton.addEventListener('click', function () {
            storeAdClickEvent(ad, shareEventType);
        });
    }

    // Listener for advertiser check from the link
    let advertiserLink = frontAd.getElementsByClassName(advertiserLinkClassNewInterface)[0];
    if (advertiserLink !== undefined) {
        advertiserLink.addEventListener('click', function () {
            storeAdClickEvent(ad, advertiserPageCheckType);
        });
        advertiserLink.addEventListener('contextmenu', function () {
            storeAdClickEvent(ad, advertiserPageRightClickType);
        });
        advertiserLink.addEventListener('mouseenter', function () {
            dateForAdvertiserCheckWithHover = Date.now()
        });

        advertiserLink.addEventListener('mouseleave', function () {
            difference = (Date.now() - dateForAdvertiserCheckWithHover);
            if (difference >= minDifferenceForAdvertiserCheck) {
                storeAdClickEvent(ad, advertiserCheck);
            }
        });
    }

    // Listener for advertiser check from the logo
    let advertiserLogo = frontAd.getElementsByClassName(advertiserLogoClassNewInterface)[0];
    if (advertiserLogo !== undefined) {
        advertiserLogo.addEventListener('click', function () {
            storeAdClickEvent(ad, advertiserPageCheckType);
        });

        advertiserLogo.addEventListener('contextmenu', function () {
            storeAdClickEvent(ad, advertiserLogoRightClick);
        });
        advertiserLogo.addEventListener('mouseenter', function () {
            dateForAdvertiserCheckWithHover = Date.now()
        });

        advertiserLogo.addEventListener('mouseleave', function () {
            difference = (Date.now() - dateForAdvertiserCheckWithHover);
            if (difference >= minDifferenceForAdvertiserCheck) {
                storeAdClickEvent(ad, advertiserCheck);
            }
        });

    }

    //Listeners for Hide, Report, Save add and why i'm seeing the ad
    let menu = frontAd.getElementsByClassName(menuDivClassNewInterface)[0];
    if (menu !== undefined) {
        menu.addEventListener('mouseleave', function () {
            removeMenuListenerNewInterface();
            addMenuListenersNewInterface(ad);
        })
    }

    //Landing url check
    let links = frontAd.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
        if (links[i].href !== "#" && links[i].href.indexOf("https://www.facebook") === -1 && links[i].href.indexOf("http://www.facebook") === -1 && links[i].href.indexOf("https://facebook") === -1 && links[i].href.indexOf("http://facebook") === -1) {
            links[i].addEventListener('click', function () {
                storeAdClickEvent(ad, visitingLandingUrlEventType);
            });
            links[i].addEventListener('contextmenu', function () {
                storeAdClickEvent(ad, rightClickOnLandingUrlEventType);
            })
        }
    }

    // AdImage
    let adImgs = frontAd.getElementsByTagName("img");

    for(let i=0; i < adImgs.length; i++) {
        if(adImgs[i].height >= minBodyImgSize && adImgs[i].width >= minBodyImgSize) {
            adImgs[i].addEventListener('click', function () {
                storeAdClickEvent(ad, imageClickedEventType);
            });
            adImgs[i].addEventListener('contextmenu', function () {
                storeAdClickEvent(ad, rightClickOnImage);
            });
        }

    }


    // handle Carousel mouvement
    let nextButton = frontAd.getElementsByClassName(carouselNextClassNewInterface)[0];
    if(nextButton !== undefined) {
        nextButton.addEventListener('click', function () {
            storeAdClickEvent(ad, carouselNextEvent);
            if(previousCarouselListenerAdded === 0) {
                let previousButton = frontAd.getElementsByClassName(carouselPreviousClassNewInterface)[0];
                if(previousButton !== undefined) {
                    previousButton.addEventListener('click', function () {
                        storeAdClickEvent(ad, carouselPreviousEvent);
                    });
                    previousCarouselListenerAdded = 1;
                }
            }
        })
    }
}
