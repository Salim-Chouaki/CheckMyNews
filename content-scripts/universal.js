function universalOnMessageFunction(msg,sender,sendResponse) {
        if (!sender.tab) {
        if (msg.type === 'getInterests'){
            data = {grabInterests:true}
            window.postMessage(data,"*")
        }

        if (msg.type === 'getAdvertisers'){
            data = {grabAdvertisers:true}
            window.postMessage(data,"*")
        }

        if (msg.type === 'getAdActivity'){
            data = {'grabAdActivity':true,'lastItem':msg.lastItem}
            window.postMessage(data,'*')
        }

        if (msg.type === 'getAdBlockerStatus'){
            let data = {'getAdBlockerStatus':true};
            window.postMessage(data,'*');
        }


        if (msg.type === 'getExplanation') {
            msg.userId = getUserId();
            window.postMessage(msg,'*');
        }

        if (msg.type === 'isValidTab') {
            sendResponse({"validTabResponse":'yes'})
        }

    }


}

function universalCommunicationWithInjections(event) {


    if (event.data.type && (event.data.type === 'advertisersData')){
        let data = event.data
        data['user_id'] =getUserId()
        data['timestamp'] = (new Date).getTime();
        chrome.runtime.sendMessage(data);
        return;
    }

    else if (event.data.type && (event.data.type === 'demographicsNewInterface')){
        let data = event.data
        data['user_id'] =getUserId()
        data['timestamp'] = (new Date).getTime();
        chrome.runtime.sendMessage(data);   
        return;
    }

    else if (event.data.type && (event.data.type === 'interestsData')){
        let data = event.data
        data['user_id'] =getUserId()
        data['timestamp'] = (new Date).getTime();
        chrome.runtime.sendMessage(data);
        return;
    }

    else if (event.data.type && (event.data.type === 'adActivityList')) {
        let data = event.data
        data['user_id'] = getUserId()
        data['timestamp'] = (new Date).getTime();

        chrome.runtime.sendMessage(data);

        if (data['hasmore'] === true) {
            let lastItem = data['lastItem']
            data = { 'grabAdActivity': true, 'lastItem': lastItem };
            window.postMessage(data, '*');
        }

        return;
        
    }

    else if (event.data.type && (event.data.type === 'adActivityData')) {
        let data = event.data;
        data['user_id'] = getUserId();
        data['timestamp'] = (new Date).getTime();
        chrome.runtime.sendMessage(data); 
        return;      
    }

    else if (event.data.type && (event.data.type === 'statusAdBlocker')) {
        let data = event.data;
        chrome.runtime.sendMessage(data);
        return;
    }

    else if (event.data.type && (event.data.type === 'explanationReply')) {
        let data = event.data;
        data['message_type']=data.type;
        delete data.type;
        chrome.runtime.sendMessage(data);   
        return ;    
    }

}

function injectUniversalScripts() {

    let s = document.createElement("script");
    s.src = chrome.extension.getURL("injections/error_handling.js");
    (document.head||document.documentElement).appendChild(s);


    let s1 = document.createElement("script");
    s1.src = chrome.extension.getURL("injections/ad_block_detection.js");
    (document.head || document.documentElement).appendChild(s1);


    let s2 = document.createElement("script");
    s2.src = chrome.extension.getURL("injections/preference_crawl.js");
    (document.head||document.documentElement).appendChild(s2);


    let s3 = document.createElement("script");
    s3.src = chrome.extension.getURL("injections/ad_activity_crawl.js");
    (document.head||document.documentElement).appendChild(s3);


    let s4 = document.createElement("script");
    s4.src = chrome.extension.getURL("injections/explanation_crawl.js");
    (document.head||document.documentElement).appendChild(s4);


    let s5 = document.createElement("script");
    s5.src = chrome.extension.getURL("injections/universal.js");
    (document.head||document.documentElement).appendChild(s5);


}
