//************ PATTERNS TO DETECT ELEMENTS REQUIRED FOR EXPLANATION URL
var QID_PATT = /qid.[0-9]+/;
var NUMBER_TAG = /[0-9]+/;

// var AJAXIFYPATTERN = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/ OLD PATTERN (DEPRECATED)
var AJAXIFYPATTERN = /ajaxify":"\\\/waist_content\\\/dialog\S+?"/;
var AJAXIFYPATTERN_POST = /ajaxify":"\\\/ajax\\\/feed\\\/filter_action\\\/dialog_direct_action\S+?"/;
var ADIDPATTERN = /id=[0-9]+/;
var CLIENTTOKEN_PATTERN = /client_token=(.*?)&/
var BUTTON_ID_PATT = /button_id=\S+?&/;



function getQid(url) {
  try {
    return url.match(QID_PATT)[0].match(NUMBER_TAG)[0];
  } catch (exp) {
    debugLog("Exception in getQid:");
    debugLog(exp);
  }
  return NaN;
}

function getButtonId(url) {
  try {
    return url
        .match(BUTTON_ID_PATT)[0]
        .replace("button_id=", "")
        .replace("&", "");
  } catch (exp) {
    debugLog("Exception in getButtonId:");
    debugLog(exp);
  }
  return NaN;
}

function getAdIdParams(response) {
  try {
    patt = response.match(AJAXIFYPATTERN)[0].replace();
  } catch (exp) {
    debugLog("Exception in getAdIdParams:");
    debugLog(exp);
  }
  return NaN;
}

(function() {
  let XHR = XMLHttpRequest.prototype;
  // Remember references to original methods
  let open = XHR.open;
  let send = XHR.send;

  // Overwrite native methods
  // Collect data:
  XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    return open.apply(this, arguments);
  };

  function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
          return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
  }

  // Implement "ajaxSuccess" functionality
  XHR.send = function(postData) {
    this.addEventListener("load", function() {
      if (
          this._url &&
          this._url.indexOf &&
          this._url.indexOf("options_menu/?button_id=") > -1
      ) {
        //                lala = this;

        let qId = getQid(this._url);
        let buttonId = getButtonId(this._url);

        if (!qId || !buttonId) {
          //                    not relevant
          return true;
        }

        debugLog(qId, buttonId);

        let requestParams = '';
        let clientToken = '';
        let adId = '';
        try{
          requestParams = this.responseText
              .match(AJAXIFYPATTERN)[0]
              .replace('ajaxify":"\\/waist_content\\/dialog\\/?', "");

          requestParams = requestParams.slice(0, requestParams.length - 1);
          requestParams = decodeURIComponent(unicodeToChar(requestParams));
          debugLog(requestParams);
          clientToken = requestParams.match(CLIENTTOKEN_PATTERN)[1];
          adId = requestParams.match(ADIDPATTERN)[0].match(NUMBER_TAG)[0];
        }
        catch{
          requestParams = this.responseText
              .match(AJAXIFYPATTERN_POST)[0]
              .replace('ajaxify":"\\/ajax\\/feed\\/filter_action\\/dialog_direct_action\\/?', "");
          requestParams = requestParams.slice(0, requestParams.length - 1);
          requestParams = decodeURIComponent(unicodeToChar(requestParams));
        }



        let asyncParams = require("getAsyncParams")("GET");
        let graphQLAsyncParams = require("getAsyncParams")("POST");




        data = {
          qId: qId,
          buttonId: buttonId,
          requestParams: requestParams,
          adId: adId,
          adButton: true,
          asyncParams: asyncParams,
          clientToken: clientToken,
          graphQLAsyncParams: graphQLAsyncParams

        };

        window.postMessage(data, "*");
        return;
      }

    });

    try {
     return send.apply(this, arguments);
    }catch (e){
      debugLog(e)
    }
  };
})();


window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) return;

  if (event.data.grabNewInterface) {
    processAd(event.data.customId, event.data.type);
    return true;
  }

   handleUniversalCommunication(event);
});
