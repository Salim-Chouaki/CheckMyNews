
var FB_LINKS = ['www.facebook.com', 'fbcdn.net'] // used to remove URLs that are not landingURL
var HTML_POST_ID ="hyperfeed_story_id";
var POST_CLASS_NEW_INTERFACE = "du4w35lb k4urcfbm l9j0dhe7 sjgh65i0";
const COLLECTED = 'ad_collected'; //inserted to an ad to signify it was collected
const TYPES = {"frontAd" : "frontAd", "sideAd" : "sideAd", "newsPost": "newsPost", "publicPost" : "publicPost"}; // possible types of ads ad analyst collects
//PREABLE OF THE URL THAT FETCHES EXPLANATIONS
// var EXPLANATIONSURL = 'https://www.facebook.com/ads/preferences/dialog/?'; (DEPRECATED)
var EXPLANATIONSURL = 'https://www.facebook.com/waist_content/dialog/?'


/**
 * replace all occurences of pattern to string
 *
 * @param  {stirng} search      string substring to be replaced
 * @param  {string} replacement string substring to be used as a replacement
 * @return {string}             new string
 */
String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};

/**
 * return an array with each element appearing only once
 *
 * @return {object} array that contains each element of the initial array only once
 */
Array.prototype.unique = function unique() {
    let self = this;
    return self.filter(function(a) {
        let that = this;
        return !that[a] ? that[a] = true : false;
    },{});}

/**
 * extend an array adding the elements of another array. (similar to python extend)
 *
 * @param  {object} other_array array whose elements will be added to the initial array
 * @return
 */
Array.prototype.extend = function (other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {this.push(v)}, this);
}

/**
 * Hash a string
 */
Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
        let hash = 0, i, chr;
        for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }
});


/**
 * check whether two objects are contain the same elements
 *
 * @param  {object}  value first object
 * @param  {object}  other second object
 * @return {Boolean}       true if both objects contain the same elements, else false
 */
function isEqual(value, other) {

    // Get the value type
    let type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

    // Compare the length of the length of the two items
    let valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    let otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;

    // Compare two items
    let compare = function (item1, item2) {
        // Code will go here...
    };

    // Compare properties
    let match;
    if (type === '[object Array]') {
        for (let i = 0; i < valueLen; i++) {
            compare(value[i], other[i]);
        }
    } else {
        for (let key in value) {
            if (value.hasOwnProperty(key)) {
                compare(value[key], other[key]);
            }
        }
    }

    // If nothing failed, return true
    return true;

};

/**
 * return a list of unique html elements from a list of html elements
 * @param list
 * @returns {[]}
 */
function uniqueArray(list) {
    let result = [];
    list.forEach(function (element) {
        found = false;
        for(let i=0 ; i < result.length; i++) {
            if(element.isSameNode(result[i])) {
                found = true;
                break;
            }
        }
        if(!found) result.push(element);
    });
    return result;
}

/**
 * Check whether string is a number
 *
 * @param  {string}  value value which is being checked whether it is a number
 * @return {Boolean}       true if number, else false
 */
function isNumeric(value) {
    return /^\d+$/.test(value);
}

/**
 * return x,y coordinates of a DOM element
 * @param  {object} el DOM element
 * @return {object}    x,y coordinates of el
 */
function getPos(el) {
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

/**
 * retreives all urls that are going outside Facebook from a string using a regex
 * @param html the html code of a post as a string
 * @returns {*} returns a list of unique urls
 */
function getURLsFromString(html) {
    let regex = /(https?:\/\/[^ ]*)/gm;
    let URLs = [];
    while ((m = regex.exec(html)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            match = match.replace(`"`, ``).replace(`'`, ``);
            if (!isFacebookURL(match)) {
                URLs.push(match);
            }
        });
    }
    return URLs.unique();
}


/**
 * Returns True if the url given is a Facebook one
 * @param url the given url
 * @returns {boolean}
 */
function isFacebookURL(url) {
    for (let i = 0; i < FB_LINKS.length; i++) {
        if (url.indexOf(FB_LINKS[i]) !== -1) {
            return true;
        }
    }
    return false;
}

/** Perform percent decoding URL
 * @param {string} url to decode
 * @return {string} decode_url
 */
function percentDecodeURL(url) {
    let C = ['!', '#', '$', '&', `'`, '(', ')', '*', '+', ',', '/', ':', ';', '=', '?', '@', '[', ']'];
    let R = ['%21', '%23', '%24', '%26', '%27', '%28', '%29', '%2A', '%2B', '%2C', '%2F', '%3A', '%3B', '%3D', '%3F', '%40', '%5B', '%5D'];
    for (let i = 0; i < R.length; i++) {
        url = url.replaceAll(R[i], C[i])
    }
    return url
}

/** Get n-th indexOf sub-string
 *
 * @param {string} str string to process
 * @param {string} pat sub-string searching for
 * @param {number} n n-th occurence of pat
 * @return {number} the nth index of pat | -1 if not found
 */
function nthIndex(str, pat, n) {
    let L = str.length, i = -1;
    while (n-- && i++ < L) {
        i = str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}


/**
 * get the limit of user view
 *
 *
 * @param  {object}  elem DOM element to be examined
 * @return {Array}   return [top,bottom] of user view
 */
function getUserView() {

    let docViewTop = $(window).scrollTop();
    let docViewBottom = docViewTop + $(window).height();

    return [docViewTop, docViewBottom]

}



/**
 * check if DOM element is hidden
 *
 *
 * @param  {object}  el DOM element to be examined
 * @return {Boolean}    true if DOM element is hidden, else false
 */
function isHidden(el) {
    return (el.offsetParent === null)
}











