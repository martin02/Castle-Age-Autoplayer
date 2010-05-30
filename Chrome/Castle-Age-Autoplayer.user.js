// ==UserScript==
// @name           Castle Age Autoplayer
// @namespace      caap
// @description    Auto player for Castle Age
// @version        140.23.26
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/jquery-ui-1.8.1/js/jquery-ui-1.8.1.custom.min.js
// @require        http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/farbtastic12/farbtastic/farbtastic.min.js
// @include        http*://apps.*facebook.com/castle_age/*
// @include        http://www.facebook.com/common/error.html
// @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// @include        http://www.facebook.com/home.php
// @include        http://www.facebook.com/*filter=app_46755028429*
// @exclude        *#iframe*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  Firefox 3.0+, Chrome 4+, Flock 2.0+
// ==/UserScript==

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage */

var caapVersion = "140.23.26";

///////////////////////////
//       Prototypes
///////////////////////////

String.prototype.ucFirst = function () {
    var firstLetter = this.substr(0, 1);
    return firstLetter.toUpperCase() + this.substr(1);
};

String.prototype.stripHTML = function (html) {
    return this.replace(new RegExp('<[^>]+>', 'g'), '').replace(/&nbsp;/g, '');
};

///////////////////////////
//       Objects
///////////////////////////
var global = {};
var gm = {};
var nHtml = {};
var caap = {};

///////////////////////////
// Define our global object
///////////////////////////

global = {
    gameName: 'castle_age',

    discussionURL: 'http://senses.ws/caap/index.php',

    debug: false,

    newVersionAvailable: false,

    documentTitle: document.title,

    is_chrome: navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

    is_firefox: navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

    // Object separator - used to separate objects
    os: '\n',

    // Value separator - used to separate name/values within the objects
    vs: '\t',

    // Label separator - used to separate the name from the value
    ls: '\f',

    AddCSS: function () {
        try {
            if (!$('link[href*="jquery-ui-1.8.1.custom.css"').length) {
                $("<link>").appendTo("head").attr({
                    rel: "stylesheet",
                    type: "text/css",
                    href: "http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/jquery-ui-1.8.1/css/smoothness/jquery-ui-1.8.1.custom.css"
                });
            }

            if (!$('link[href*="farbtastic.css"').length) {
                $("<link>").appendTo("head").attr({
                    rel: "stylesheet",
                    type: "text/css",
                    href: "http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/farbtastic12/farbtastic/farbtastic.css"
                });
            }

            return true;
        } catch (err) {
            gm.log("ERROR in AddCSS: " + err);
            return false;
        }
    },

    alert_id: 0,

    alert: function (message) {
        try {
            global.alert_id += 1;
            var id = global.alert_id;
            $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(document.body);
            $("#alert_" + id).dialog({
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return true;
        } catch (err) {
            gm.log("ERROR in alert: " + err);
            return false;
        }
    },

    hashStr: [
        '41030325072',
        '4200014995461306',
        '2800013751923752',
        '55577219620',
        '65520919503',
        '2900007233824090',
        '2900007233824090',
        '3100017834928060',
        '3500032575830770',
        '32686632448',
        '2700017666913321'
    ]
};
/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    // use to log stuff
    log: function (mess) {
        var now = new Date();
        var t_hour = now.getHours();
        var t_min = now.getMinutes();
        var t_sec = now.getSeconds();

        t_hour = t_hour + "";
        if (t_hour.length === 1) {
            t_hour = "0" + t_hour;
        }

        t_min = t_min + "";
        if (t_min.length === 1) {
            t_min = "0" + t_min;
        }

        t_sec = t_sec + "";
        if (t_sec.length === 1) {
            t_sec = "0" + t_sec;
        }

        var time = t_hour + ':' + t_min + ':' + t_sec;
        GM_log('v' + caapVersion + ' (' + time + ') : ' + mess);
    },

    debug: function (mess) {
        if (global.debug) {
            this.log(mess);
        }
    },

    isInt: function (value) {
        try {
            var y = parseInt(value, 10);
            if (isNaN(y)) {
                return false;
            }

            return value == y && value.toString() == y.toString();
        } catch (err) {
            gm.log("ERROR in gm.isInt: " + err);
            return false;
        }
    },

    // use these to set/get values in a way that prepends the game's name
    setValue: function (n, v) {
        try {
            this.debug('Set ' + n + ' to ' + v);
            if (this.isInt(v)) {
                if (v > 999999999 && !global.is_chrome) {
                    v = v + '';
                } else {
                    v = Number(v);
                }
            }

            GM_setValue(global.gameName + "__" + n, v);
            return v;
        } catch (err) {
            gm.log("ERROR in gm.setValue: " + err);
            return null;
        }
    },

    getValue: function (n, v) {
        var ret = GM_getValue(global.gameName + "__" + n, v);
        this.debug('Get ' + n + ' value ' + ret);
        return ret;
    },

    deleteValue: function (n) {
        this.debug('Delete ' + n + ' value ');
        GM_deleteValue(global.gameName + "__" + n);
    },

    setList: function (n, v) {
        if (!$.isArray(v)) {
            this.log('Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        GM_setValue(global.gameName + "__" + n, v.join(global.os));
        return v;
    },

    getList: function (n) {
        var getTheList = GM_getValue(global.gameName + "__" + n, '');
        this.debug('GetList ' + n + ' value ' + getTheList);
        var ret = [];
        if (getTheList !== '') {
            ret = getTheList.split(global.os);
        }

        return ret;
    },

	// Takes a list of comma or return separated values, and returns a list with valid entries
    getListFromText: function (n) {
        var getTheList = gm.getValue(n).split(/[\n,]/);
        this.debug('GetList ' + n + ' value ' + getTheList);
        var ret = getTheList.filter(function (item) {
            return item.trim() || false;
        });
        return ret;
    },

    listAddBefore: function (listName, addList) {
        var newList = addList.concat(this.getList(listName));
        this.setList(listName, newList);
        return newList;
    },

    listPop: function (listName) {
        var popList = this.getList(listName);
        if (!popList.length) {
            return null;
        }

        var popItem = popList.pop();
        this.setList(listName, popList);
        return popItem;
    },

    listPush: function (listName, pushItem, max) {
        var list = this.getList(listName);

        // Only add if it isn't already there.
        if (list.indexOf(pushItem) != -1) {
            return;
        }

        list.push(pushItem);
        if (max > 0) {
            while (max < list.length) {
                pushItem = list.shift();
                this.debug('Removing ' + pushItem + ' from ' + listName + '.');
            }
        }

        this.setList(listName, list);
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        this.debug('List: ' + list + ' prefix ' + prefix + ' filtered ' + itemList);
        if (itemList.length) {
            return itemList[0];
        }

        return null;
    },

    setObjVal: function (objName, label, value) {
        var objStr = this.getValue(objName);
        if (!objStr) {
            this.setValue(objName, label + global.ls + value);
            return;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setValue(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        var objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setValue(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr = null;
        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getValue(objName);
        } else {
            objStr = objName;
        }

        if (!objStr) {
            return defaultValue;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        return itemStr.split(global.ls)[1];
    },

    getListObjVal: function (listName, objName, label, defaultValue) {
        var gLOVlist = this.getList(listName);
        if (!(gLOVlist.length)) {
            return defaultValue;
        }

        this.debug('have list ' + gLOVlist);
        var objStr = this.listFindItemByPrefix(gLOVlist, objName + global.vs);
        if (!objStr) {
            return defaultValue;
        }

        this.debug('have obj ' + objStr);
        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        this.debug('have val ' + itemStr);
        return itemStr.split(global.ls)[1];
    },

    setListObjVal: function (listName, objName, label, value, max) {
        var objList = this.getList(listName);
        if (!(objList.length)) {
            this.setValue(listName, objName + global.vs + label + global.ls + value);
            return;
        }

        var objStr = this.listFindItemByPrefix(objList, objName + global.vs);
        if (!objStr) {
            this.listPush(listName, objName + global.vs + label + global.ls + value, max);
            return;
        }

        var valList = objStr.split(global.vs);
        var valStr = this.listFindItemByPrefix(valList, label + global.ls);
        if (!valStr) {
            valList.push(label + global.ls + value);
            objList.splice(objList.indexOf(objStr), 1, objStr + global.vs + label + global.ls + value);
            this.setList(listName, objList);
            return;
        }

        valList.splice(valList.indexOf(valStr), 1, label + global.ls + value);
        objList.splice(objList.indexOf(objStr), 1, valList.join(global.vs));
        this.setList(listName, objList);
    },

    deleteListObj: function (listName, objName) {
        var objList = this.getList(listName);
        if (!(objList.length)) {
            return;
        }

        var objStr = this.listFindItemByPrefix(objList, objName);
        if (objStr) {
            objList.splice(objList.indexOf(objStr), 1);
            this.setList(listName, objList);
        }
    },

    getNumber: function (name, defaultValue) {
        try {
            var value = this.getValue(name);
            var number = null;
            if ((!value && value !== 0) || isNaN(value)) {
                if ((!defaultValue && defaultValue !== 0) || isNaN(defaultValue)) {
                    throw "Value of " + name + " and defaultValue are not numbers: " +
                        "'" + value + "', '" + defaultValue + "'";
                } else {
                    number = defaultValue;
                }
            } else {
                number = value;
            }

            //alert("Name: " + name + " Number: " + number + " Default: " + defaultValue);
            return Number(number);
        } catch (err) {
            this.log("ERROR in GetNumber: " + err);
            return '';
        }
    }
};
/////////////////////////////////////////////////////////////////////
//                          HTML TOOLS
// this object contains general methods for wading through the DOM and dealing with HTML
/////////////////////////////////////////////////////////////////////

nHtml = {
    xpath: {
        string : XPathResult.STRING_TYPE,
        unordered: XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        first : XPathResult.FIRST_ORDERED_NODE_TYPE
    },

    FindByAttrContains: function (obj, tag, attr, className, subDocument, nodeNum) {
        if (attr == "className") {
            attr = "class";
        }

        if (!subDocument) {
            subDocument = document;
        }

        if (nodeNum) {
            var p = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

            if (p) {
                if (nodeNum < p.snapshotLength) {
                    return p.snapshotItem(nodeNum);
                } else if (nodeNum >= p.snapshotLength) {
                    return p.snapshotItem(p.snapshotLength - 1);
                }
            }
        } else {
            var q = subDocument.evaluate(".//" + tag + "[contains(translate(@" +
                attr + ",'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'" +
                className.toLowerCase() + "')]", obj, null, this.xpath.first, null);

            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }
        }

        return null;
    },

    FindByAttrXPath: function (obj, tag, className, subDocument) {
        var q = null;
        var xp = ".//" + tag + "[" + className + "]";
        try {
            if (obj === null) {
                gm.log('Trying to find xpath with null obj:' + xp);
                return null;
            }

            if (!subDocument) {
                subDocument = document;
            }

            q = subDocument.evaluate(xp, obj, null, this.xpath.first, null);
        } catch (err) {
            gm.log("XPath Failed:" + xp + "," + err);
        }

        if (q && q.singleNodeValue) {
            return q.singleNodeValue;
        }

        return null;
    },

    FindByAttr: function (obj, tag, attr, className, subDocument) {
        if (className.exec === undefined) {
            if (attr == "className") {
                attr = "class";
            }

            if (!subDocument) {
                subDocument = document;
            }

            var q = subDocument.evaluate(".//" + tag + "[@" + attr + "='" + className + "']", obj, null, this.xpath.first, null);
            if (q && q.singleNodeValue) {
                return q.singleNodeValue;
            }

            return null;
        }

        var divs = obj.getElementsByTagName(tag);
        for (var d = 0; d < divs.length; d += 1) {
            var div = divs[d];
            if (className.exec !== undefined) {
                if (className.exec(div[attr])) {
                    return div;
                }
            } else if (div[attr] == className) {
                return div;
            }
        }

        return null;
    },

    FindByClassName: function (obj, tag, className) {
        return this.FindByAttr(obj, tag, "className", className);
    },

    spaceTags: {
        'td': 1,
        'br': 1,
        'hr': 1,
        'span': 1,
        'table': 1
    },

    GetText: function (obj) {
        var txt = ' ';
        if (obj.tagName !== undefined && this.spaceTags[obj.tagName.toLowerCase()]) {
            txt += " ";
        }

        if (obj.nodeName == "#text") {
            return txt + obj.textContent;
        }

        for (var o = 0; o < obj.childNodes.length; o += 1) {
            var child = obj.childNodes[o];
            txt += this.GetText(child);
        }

        return txt;
    },

    timeouts: {},

    setTimeout: function (func, millis) {
        var t = window.setTimeout(function () {
            func();
            nHtml.timeouts[t] = undefined;
        }, millis);

        this.timeouts[t] = 1;
    },

    clearTimeouts: function () {
        for (var t in this.timeouts) {
            if (this.timeouts.hasOwnProperty(t)) {
                window.clearTimeout(t);
            }
        }

        this.timeouts = {};
    },

    getX: function (path, parent, type) {
        var evaluate = null;
        switch (type) {
        case this.xpath.string :
            evaluate = document.evaluate(path, parent, null, type, null).stringValue;
            break;
        case this.xpath.first :
            evaluate = document.evaluate(path, parent, null, type, null).singleNodeValue;
            break;
        case this.xpath.unordered :
            evaluate = document.evaluate(path, parent, null, type, null);
            break;
        default :
        }

        return evaluate;
    },

    getHTMLPredicate: function (HTML) {
        for (var x = HTML.length; x > 1; x -= 1) {
            if (HTML.substr(x, 1) == '/') {
                return HTML.substr(x + 1);
            }
        }

        return HTML;
    },

    OpenInIFrame: function (url, key) {
        //if (!iframe = document.getElementById(key))
        var iframe = document.createElement("iframe");
        //gm.log ("Navigating iframe to " + url);
        iframe.setAttribute("src", url);
        iframe.setAttribute("id", key);
        iframe.setAttribute("style", "width:0;height:0;");
        document.documentElement.appendChild(iframe);
    },

    ResetIFrame: function (key) {
        var iframe = document.getElementById(key);
        if (iframe) {
            gm.log("Deleting iframe = " + key);
            iframe.parentNode.removeChild(iframe);
        } else {
            gm.log("Frame not found = " + key);
        }

        if (document.getElementById(key)) {
            gm.log("Found iframe");
        }
    },

    Gup: function (name, href) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(href);
        if (results === null) {
            return "";
        } else {
            return results[1];
        }
    },

    ScrollToBottom: function () {
        //gm.log("Scroll Height: " + document.body.scrollHeight);
        if (document.body.scrollHeight) {
            if (global.is_chrome) {
                var dh = document.body.scrollHeight;
                var ch = document.body.clientHeight;
                if (dh > ch) {
                    var moveme = dh - ch;
                    gm.log("Scrolling down by: " + moveme + "px");
                    window.scroll(0, moveme);
                    gm.log("Scrolled ok");
                } else {
                    gm.log("Not scrolling to bottom. Client height is greater than document height!");
                }
            } else {
                window.scrollBy(0, document.body.scrollHeight);
            }
        }// else if (screen.height) {}
    },

    ScrollToTop: function () {
        if (global.is_chrome) {
            gm.log("Scrolling to top");
            window.scroll(0, 0);
            gm.log("Scrolled ok");
        } else {
            window.scrollByPages(-1000);
        }
    },

    CountInstances: function (string, word) {
        var substrings = string.split(word);
        return substrings.length - 1;
    }
};
////////////////////////////////////////////////////////////////////
//                          caap OBJECT
// this is the main object for the game, containing all methods, globals, etc.
/////////////////////////////////////////////////////////////////////

caap = {
    stats: {},
    lastReload: new Date(),
    waitingForDomLoad : false,
    node_trigger : null,
    newLevelUpMode : false,
    autoReloadMilliSecs: 15 * 60 * 1000,

    userRe       : new RegExp("(userId=|user=|/profile/|uid=)([0-9]+)"),
    levelRe      : new RegExp('Level\\s*:\\s*([0-9]+)', 'i'),
    rankRe       : new RegExp(',\\s*level\\s*:?\\s*[0-9]+\\s+([a-z ]+)', 'i'),
    armyRe       : new RegExp('My Army\\s*\\(?([0-9]+)', 'i'),
    statusRe     : new RegExp('([0-9\\.]+)\\s*/\\s*([0-9]+)', 'i'),
    energyRe     : new RegExp("([0-9]+)\\s+(energy)", "i"),
    experienceRe : new RegExp("\\+([0-9]+)"),
    influenceRe  : new RegExp("([0-9]+)%"),
    moneyRe      : new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i"),

    caapDivObject: null,

    caapTopObject: null,

    init: function () {
        try {
            gm.deleteValue("statsMatch");
            gm.deleteValue(this.friendListType.gifta.name + 'Requested');
            gm.deleteValue(this.friendListType.giftb.name + 'Requested');
            gm.deleteValue(this.friendListType.giftc.name + 'Requested');
            gm.deleteValue(this.friendListType.facebook.name + 'Requested');
            // Get rid of those ads now! :P
            if (gm.getValue('HideAds', false)) {
                $('.UIStandardFrame_SidebarAds').css('display', 'none');
            }

            // Can create a blank space above the game to host the dashboard if wanted.
            // Dashboard currently uses '185px'
            var shiftDown = gm.getValue('ShiftDown', '');
            if (shiftDown) {
                $(this.controlXY.selector).css('padding-top', shiftDown);
            }

            this.AddControl();
            this.AddColorWheels();
            this.AddDashboard();
            this.AddListeners();
            this.CheckResults();
            return true;
        } catch (err) {
            gm.log("ERROR in init: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          UTILITY FUNCTIONS
    // Small functions called a lot to reduce duplicate code
    /////////////////////////////////////////////////////////////////////

    VisitUrl: function (url, loadWaitTime) {
        try {
            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            window.location.href = url;
            return true;
        } catch (err) {
            gm.log("ERROR in VisitUrl: " + err);
            return false;
        }
    },

    Click: function (obj, loadWaitTime) {
        try {
            if (!obj) {
                throw 'Null object passed to Click';
            }

            if (this.waitingForDomLoad === false) {
                this.JustDidIt('clickedOnSomething');
                this.waitingForDomLoad = true;
            }

            this.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 5000;
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            /*
            Return Value: boolean
            The return value of dispatchEvent indicates whether any of the listeners
            which handled the event called preventDefault. If preventDefault was called
            the value is false, else the value is true.
            */
            return !obj.dispatchEvent(evt);
        } catch (err) {
            gm.log("ERROR in Click: " + err);
            return undefined;
        }
    },

    ClickAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to Click Ajax';
            }

            if (gm.getValue('clickUrl', '').indexOf(link) < 0) {
                gm.setValue('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
                this.waitingForDomLoad = false;
            }

            return this.VisitUrl("javascript:void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))", loadWaitTime);
        } catch (err) {
            gm.log("ERROR in ClickAjax: " + err);
            return false;
        }
    },

    ClickWait: function (obj, loadWaitTime) {
        try {
            this.setTimeout(function () {
                this.Click(obj, loadWaitTime);
            }, 1000 + Math.floor(Math.random() * 1000));

            return true;
        } catch (err) {
            gm.log("ERROR in ClickWait: " + err);
            return false;
        }
    },

    generalList: [],

    standardGeneralList: [
        'Idle',
        'Monster',
        'Fortify',
        'Battle',
        'SubQuest',
		'Buy',
		'Income'
    ],

    BuildGeneralLists: function () {
        try {
            this.generalList = [
                'Best',
                'Use Current',
                'Under Level 4'
            ].concat(gm.getList('AllGenerals'));

            var crossList = function (checkItem) {
                return (caap.generalList.indexOf(checkItem) >= 0);
            };

            return true;
        } catch (err) {
            gm.log("ERROR in BuildGeneralLists: " + err);
            return false;
        }
    },

    ClearGeneral: function (whichGeneral) {
        try {
            gm.log('Setting ' + whichGeneral + ' to "Use Current"');
            gm.setValue(whichGeneral, 'Use Current');
            this.BuildGeneralLists();
            for (var generalType in this.standardGeneralList) {
                if (this.standardGeneralList.hasOwnProperty(generalType)) {
                    this.ChangeDropDownList(this.standardGeneralList[generalType] + 'General', this.generalList, gm.getValue(this.standardGeneralList[generalType] + 'General', 'Use Current'));
                }
            }

            this.ChangeDropDownList('BuyGeneral', this.generalList, gm.getValue('BuyGeneral', 'Use Current'));
            this.ChangeDropDownList('IncomeGeneral', this.generalList, gm.getValue('IncomeGeneral', 'Use Current'));
            this.ChangeDropDownList('BankingGeneral', this.generalList, gm.getValue('BankingGeneral', 'Use Current'));
            this.ChangeDropDownList('LevelUpGeneral', this.generalList, gm.getValue('LevelUpGeneral', 'Use Current'));
            return true;
        } catch (err) {
            gm.log("ERROR in ClearGeneral: " + err);
            return false;
        }
    },

    SelectGeneral: function (whichGeneral) {
		if (!Generals.to(Generals.best(whichGeneral))) {
            return true;
        }

        return false;
    },

    oneMinuteUpdate: function (funcName) {
        try {
            if (!gm.getValue('reset' + funcName) && !this.WhileSinceDidIt(funcName + 'Timer', 60)) {
                return false;
            }

            this.JustDidIt(funcName + 'Timer');
            gm.setValue('reset' + funcName, false);
            return true;
        } catch (err) {
            gm.log("ERROR in oneMinuteUpdate: " + err);
            return false;
        }
    },

    NavigateTo: function (pathToPage, imageOnPage) {
        try {
            var content = document.getElementById('content');
            if (!content) {
                gm.log('No content to Navigate to ' + imageOnPage + ' using ' + pathToPage);
                return false;
            }

            if (imageOnPage && this.CheckForImage(imageOnPage)) {
                return false;
            }

            var pathList = pathToPage.split(",");
            for (var s = pathList.length - 1; s >= 0; s -= 1) {
                var a = nHtml.FindByAttrXPath(content, 'a', "contains(@href,'/" + pathList[s] + ".php') and not(contains(@href,'" + pathList[s] + ".php?'))");
                if (a) {
                    gm.log('Go to ' + pathList[s]);
                    gm.setValue('clickUrl', 'http://apps.facebook.com/castle_age/' + pathList[s] + '.php');
                    this.Click(a);
                    return true;
                }

                var imageTest = pathList[s];
                if (imageTest.indexOf(".") == -1) {
                    imageTest = imageTest + '.';
                }

                var input = nHtml.FindByAttrContains(document.body, "input", "src", imageTest);
                if (input) {
                    gm.log('Click on image ' + input.src.match(/[\w.]+$/));
                    this.Click(input);
                    return true;
                }

                var img = nHtml.FindByAttrContains(document.body, "img", "src", imageTest);
                if (img) {
                    gm.log('Click on image ' + img.src.match(/[\w.]+$/));
                    this.Click(img);
                    return true;
                }
            }

            gm.log('Unable to Navigate to ' + imageOnPage + ' using ' + pathToPage);
            return false;
        } catch (err) {
            gm.log("ERROR in NavigateTo: " + imageOnPage + ' using ' + pathToPage + ' : ' + err);
            return false;
        }
    },

    CheckForImage: function (image, webSlice, subDocument, nodeNum) {
        try {
            if (!webSlice) {
                if (!subDocument) {
                    webSlice = document.body;
                } else {
                    webSlice = subDocument.body;
                }
            }

            var imageSlice = nHtml.FindByAttrContains(webSlice, 'input', 'src', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            imageSlice = nHtml.FindByAttrContains(webSlice, 'img', 'src', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            imageSlice = nHtml.FindByAttrContains(webSlice, 'div', 'style', image, subDocument, nodeNum);
            if (imageSlice) {
                return imageSlice;
            }

            return null;
        } catch (err) {
            gm.log("ERROR in CheckForImage: " + err);
            return null;
        }
    },

    WhileSinceDidIt: function (nameOrNumber, seconds) {
        try {
            if (!/\d+/.test(nameOrNumber)) {
                nameOrNumber = gm.getValue(nameOrNumber, 0);
            }

            var now = (new Date().getTime());
            return (parseInt(nameOrNumber, 10) < (now - 1000 * seconds));
        } catch (err) {
            gm.log("ERROR in WhileSinceDidIt: " + err);
            return false;
        }
    },

    JustDidIt: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var now = (new Date().getTime());
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            gm.log("ERROR in JustDidIt: " + err);
            return false;
        }
    },

    DeceiveDidIt: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            gm.log("Deceive Did It");
            var now = (new Date().getTime()) - 6500000;
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            gm.log("ERROR in DeceiveDidIt: " + err);
            return false;
        }
    },

    // Returns true if timer is passed, or undefined
    CheckTimer: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var nameTimer = gm.getValue(name),
                now       = new Date().getTime();

            if (!nameTimer) {
                return true;
            }

            return (nameTimer < now);
        } catch (err) {
            gm.log("ERROR in CheckTimer: " + err);
            return false;
        }
    },

    FormatTime: function (time) {
        try {
            var d_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                t_day   = time.getDay(),
                t_hour  = time.getHours(),
                t_min   = time.getMinutes(),
                a_p     = "PM";

            if (gm.getValue("use24hr", true)) {
                t_hour = t_hour + "";
                if (t_hour.length === 1) {
                    t_hour = "0" + t_hour;
                }

                t_min = t_min + "";
                if (t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min;
            } else {
                if (t_hour < 12) {
                    a_p = "AM";
                }

                if (t_hour === 0) {
                    t_hour = 12;
                }

                if (t_hour > 12) {
                    t_hour = t_hour - 12;
                }

                t_min = t_min + "";
                if (t_min.length === 1) {
                    t_min = "0" + t_min;
                }

                return d_names[t_day] + " " + t_hour + ":" + t_min + " " + a_p;
            }
        } catch (err) {
            gm.log("ERROR in FormatTime: " + err);
            return "Time Err";
        }
    },

    DisplayTimer: function (name) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            var nameTimer = gm.getValue(name),
                newTime   = new Date();

            if (!nameTimer) {
                return false;
            }

            newTime.setTime(parseInt(nameTimer, 10));
            return this.FormatTime(newTime);
        } catch (err) {
            gm.log("ERROR in DisplayTimer: " + err);
            return false;
        }
    },

    SetTimer: function (name, time) {
        try {
            if (!name) {
                throw "name not provided!";
            }

            if (!time) {
                throw "time not provided!";
            }

            var now = (new Date().getTime());
            now += time * 1000;
            gm.setValue(name, now.toString());
            return true;
        } catch (err) {
            gm.log("ERROR in SetTimer: " + err);
            return false;
        }
    },

    NumberOnly: function (num) {
        try {
            var numOnly = parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
            //gm.log("NumberOnly: " + numOnly);
            return numOnly;
        } catch (err) {
            gm.log("ERROR in NumberOnly: " + err);
            return null;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            gm.log("ERROR in RemoveHtmlJunk: " + err);
            return null;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          DISPLAY FUNCTIONS
    // these functions set up the control applet and allow it to be changed
    /////////////////////////////////////////////////////////////////////

    AppendTextToDiv: function (divName, text) {
        try {
            $('#' + divName).append(text);
            return true;
        } catch (err) {
            gm.log("ERROR in AppendTextToDiv: " + err);
            return false;
        }
    },

    defaultDropDownOption: "<option disabled='disabled' value='not selected'>Choose one</option>",

    MakeDropDown: function (idName, dropDownList, instructions, formatParms) {
        try {
            var selectedItem = gm.getValue(idName, 'defaultValue');
            if (selectedItem == 'defaultValue') {
                selectedItem = gm.setValue(idName, dropDownList[0]);
            }

            var count = 0;
            for (var itemcount in dropDownList) {
                if (dropDownList.hasOwnProperty(itemcount)) {
                    if (selectedItem == dropDownList[itemcount]) {
                        break;
                    }

                    count += 1;
                }
            }

            var htmlCode = "<select id='caap_" + idName + "' " + ((instructions[count]) ? " title='" + instructions[count] + "' " : '') + formatParms + ">";
            htmlCode += this.defaultDropDownOption;
            for (var item in dropDownList) {
                if (dropDownList.hasOwnProperty(item)) {
                    if (instructions) {
                        htmlCode += "<option value='" + dropDownList[item] +
                            "'" + ((selectedItem == dropDownList[item]) ? " selected='selected'" : '') +
                            ((instructions[item]) ? " title='" + instructions[item] + "'" : '') + ">" +
                            dropDownList[item] + "</option>";
                    } else {
                        htmlCode += "<option value='" + dropDownList[item] +
                            "'" + ((selectedItem == dropDownList[item]) ? " selected='selected'" : '') + ">" +
                            dropDownList[item] + "</option>";
                    }
                }
            }

            htmlCode += '</select>';
            return htmlCode;
        } catch (err) {
            gm.log("ERROR in MakeDropDown: " + err);
            return '';
        }
    },

    /*-------------------------------------------------------------------------------------\
    DBDropDown is used to make our drop down boxes for dash board controls.  These require
    slightly different HTML from the side controls.
    \-------------------------------------------------------------------------------------*/
    DBDropDown: function (idName, dropDownList, instructions, formatParms) {
        try {
            var selectedItem = gm.getValue(idName, 'defaultValue');
            if (selectedItem == 'defaultValue') {
                selectedItem = gm.setValue(idName, dropDownList[0]);
            }

            var htmlCode = " <select id='caap_" + idName + "' " + formatParms + "'><option>" + selectedItem;
            for (var item in dropDownList) {
                if (dropDownList.hasOwnProperty(item)) {
                    if (selectedItem != dropDownList[item]) {
                        if (instructions) {
                            htmlCode += "<option value='" + dropDownList[item] + "' " + ((instructions[item]) ? " title='" + instructions[item] + "'" : '') + ">"  + dropDownList[item];
                        } else {
                            htmlCode += "<option value='" + dropDownList[item] + "'>" + dropDownList[item];
                        }
                    }
                }
            }

            htmlCode += '</select>';
            return htmlCode;
        } catch (err) {
            gm.log("ERROR in DBDropDown: " + err);
            return '';
        }
    },

    MakeCheckBox: function (idName, defaultValue, varClass, instructions, tableTF) {
        try {
            var checkItem = gm.getValue(idName, 'defaultValue');
            if (checkItem == 'defaultValue') {
                gm.setValue(idName, defaultValue);
            }

            var htmlCode = "<input type='checkbox' id='caap_" + idName + "' title=" + '"' + instructions + '"' + ((varClass) ? " class='" + varClass + "'" : '') + (gm.getValue(idName) ? 'checked' : '') + ' />';
            if (varClass) {
                if (tableTF) {
                    htmlCode += "</td></tr></table>";
                } else {
                    htmlCode += '<br />';
                }

                htmlCode += this.AddCollapsingDiv(idName, varClass);
            }

            return htmlCode;
        } catch (err) {
            gm.log("ERROR in MakeCheckBox: " + err);
            return '';
        }
    },

    MakeNumberForm: function (idName, instructions, initDefault, formatParms) {
        try {
            if (gm.getValue(idName, 'defaultValue') == 'defaultValue') {
                gm.setValue(idName, initDefault);
            }

            if (!initDefault) {
                initDefault = '';
            }

            if (!formatParms) {
                formatParms = "size='4'";
            }

            var htmlCode = " <input type='text' id='caap_" + idName + "' " + formatParms + " title=" + '"' + instructions + '" ' + "value='" + gm.getValue(idName, '') + "' />";
            return htmlCode;
        } catch (err) {
            gm.log("ERROR in MakeNumberForm: " + err);
            return '';
        }
    },

    MakeCheckTR: function (text, idName, defaultValue, varClass, instructions, tableTF) {
        try {
            var htmlCode = "<tr><td style='width: 90%'>" + text +
                "</td><td style='width: 10%; text-align: right'>" +
                this.MakeCheckBox(idName, defaultValue, varClass, instructions, tableTF);
            if (!tableTF) {
                htmlCode += "</td></tr>";
            }

            return htmlCode;
        } catch (err) {
            gm.log("ERROR in MakeCheckTR: " + err);
            return '';
        }
    },

    AddCollapsingDiv: function (parentId, subId) {
        try {
            var htmlCode = "<div id='caap_" + subId + "' style='display: " +
                (gm.getValue(parentId, false) ? 'block' : 'none') + "'>";
            return htmlCode;
        } catch (err) {
            gm.log("ERROR in AddCollapsingDiv: " + err);
            return '';
        }
    },

    ToggleControl: function (controlId, staticText) {
        try {
            var currentDisplay = gm.getValue('Control_' + controlId, "none");
            var displayChar = "-";
            if (currentDisplay == "none") {
                displayChar = "+";
            }

            var toggleCode = '<b><a id="caap_Switch_' + controlId +
                '" href="javascript:;" style="text-decoration: none;"> ' +
                displayChar + ' ' + staticText + '</a></b><br />' +
                "<div id='caap_" + controlId + "' style='display: " + currentDisplay + "'>";
            return toggleCode;
        } catch (err) {
            gm.log("ERROR in ToggleControl: " + err);
            return '';
        }
    },

    MakeTextBox: function (idName, instructions, formatParms) {
        try {
            var htmlCode = "<textarea title=" + '"' + instructions + '"' + " type='text' id='caap_" + idName + "' " + formatParms + ">" + gm.getValue(idName, '') + "</textarea>";
            return htmlCode;
        } catch (err) {
            gm.log("ERROR in MakeTextBox: " + err);
            return '';
        }
    },

    SaveBoxText: function (idName) {
        try {
            var boxText = $("#caap_" + idName).val();
            if (typeof boxText != 'string') {
                throw "Value of the textarea id='caap_" + idName + "' is not a string: " + boxText;
            }

            gm.setValue(idName, boxText);
            return true;
        } catch (err) {
            gm.log("ERROR in SaveBoxText: " + err);
            return false;
        }
    },

    SetDivContent: function (idName, mess) {
        try {
            if (gm.getValue('SetTitle', false) && gm.getValue('SetTitleAction', false) && idName == "activity_mess") {
                var DocumentTitle = mess.replace("Activity: ", '') + " - ";

                if (gm.getValue('SetTitleName', false)) {
                    DocumentTitle += gm.getValue('PlayerName', 'CAAP') + " - ";
                }

                document.title = DocumentTitle + global.documentTitle;
            }

            $('#caap_' + idName).html(mess);
        } catch (err) {
            gm.log("ERROR in SetDivContent: " + err);
        }
    },

    questWhenList: [
        'Energy Available',
        'At Max Energy',
        'At X Energy',
        'Not Fortifying',
        'Never'
    ],

    questWhenInst: [
        'Energy Available - will quest whenever you have enough energy.',
        'At Max Energy - will quest when energy is at max and will burn down all energy when able to level up.',
        'At X Energy - (EXPERIMENTAL) allows you to set maximum and minimum energy values to start and stop questing. Will burn down all energy when able to level up.',
        'Not Fortifying - will quest only when your fortify settings are matched.',
        'Never - disables questing.'
    ],

    questAreaList: [
        'Quest',
        'Demi Quests',
        'Atlantis'
    ],

    landQuestList: [
        'Land of Fire',
        'Land of Earth',
        'Land of Mist',
        'Land of Water',
        'Demon Realm',
        'Undead Realm',
        'Underworld',
        'Kingdom of Heaven'
    ],

    demiQuestList: [
        'Ambrosia',
        'Malekus',
        'Corvintheus',
        'Aurora',
        'Azeron'
    ],

    atlantisQuestList: [
        'Atlantis'
    ],

    questForList: [
        'Advancement',
        'Max Influence',
        'Max Gold',
        'Max Experience',
        'Manual'
    ],

    SelectDropOption: function (idName, value) {
        try {
            $("#caap_" + idName + " option").removeAttr('selected');
            $("#caap_" + idName + " option[value='" + value + "']").attr('selected', 'selected');
            return true;
        } catch (err) {
            gm.log("ERROR in SelectDropOption: " + err);
            return false;
        }
    },

    ShowAutoQuest: function () {
        try {
            $("#stopAutoQuest").text("Stop auto quest: " + gm.getObjVal('AutoQuest', 'name') + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
            $("#stopAutoQuest").css('display', 'block');
            return true;
        } catch (err) {
            gm.log("ERROR in ShowAutoQuest: " + err);
            return false;
        }
    },

    ClearAutoQuest: function () {
        try {
            $("#stopAutoQuest").text("");
            $("#stopAutoQuest").css('display', 'none');
            return true;
        } catch (err) {
            gm.log("ERROR in ClearAutoQuest: " + err);
            return false;
        }
    },

    ManualAutoQuest: function () {
        try {
            this.SelectDropOption('WhyQuest', 'Manual');
            this.ClearAutoQuest();
            return true;
        } catch (err) {
            gm.log("ERROR in ManualAutoQuest: " + err);
            return false;
        }
    },

    ChangeDropDownList: function (idName, dropList, option) {
        try {
            $("#caap_" + idName + " option").remove();
            $("#caap_" + idName).append(this.defaultDropDownOption);
            for (var item in dropList) {
                if (dropList.hasOwnProperty(item)) {
                    if (item == '0' && !option) {
                        gm.setValue(idName, dropList[item]);
                        gm.log("Saved: " + idName + "  Value: " + dropList[item]);
                    }

                    $("#caap_" + idName).append("<option value='" + dropList[item] + "'>" + dropList[item] + "</option>");
                }
            }

            if (option) {
                $("#caap_" + idName + " option[value='" + option + "']").attr('selected', 'selected');
            } else {
                $("#caap_" + idName + " option:eq(1)").attr('selected', 'selected');
            }
            return true;
        } catch (err) {
            gm.log("ERROR in ChangeDropDownList: " + err);
            return false;
        }
    },

    divList: [
        'banner',
        'activity_mess',
        'idle_mess',
        'quest_mess',
        'battle_mess',
        'monster_mess',
        'fortify_mess',
        'heal_mess',
        'demipoint_mess',
        'demibless_mess',
        'level_mess',
        'exp_mess',
        'arena_mess',
        'debug1_mess',
        'debug2_mess',
        'control'
    ],

    controlXY: {
        selector : '.UIStandardFrame_Content',
        x        : 0,
        y        : 0
    },

    GetControlXY: function (reset) {
        try {
            var newTop  = 0,
                newLeft = 0;

            if (reset) {
                newTop = $(this.controlXY.selector).offset().top;
            } else {
                newTop = this.controlXY.y;
            }

            if (this.controlXY.x === '' || reset) {
                newLeft = $(this.controlXY.selector).offset().left + $(this.controlXY.selector).width() + 10;
            } else {
                newLeft = $(this.controlXY.selector).offset().left + this.controlXY.x;
            }

            return {x: newLeft, y: newTop};
        } catch (err) {
            gm.log("ERROR in GetControlXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveControlXY: function () {
        try {
            var refOffset = $(this.controlXY.selector).offset();
            gm.setValue('caap_div_menuTop', caap.caapDivObject.offset().top);
            gm.setValue('caap_div_menuLeft', caap.caapDivObject.offset().left - refOffset.left);
            gm.setValue('caap_top_zIndex', '1');
            gm.setValue('caap_div_zIndex', '2');
        } catch (err) {
            gm.log("ERROR in SaveControlXY: " + err);
        }
    },

    dashboardXY: {
        selector : '#app46755028429_app_body_container',
        x        : 0,
        y        : 0
    },

    GetDashboardXY: function (reset) {
        try {
            var newTop  = 0,
                newLeft = 0;

            if (reset) {
                newTop = $(this.dashboardXY.selector).offset().top - 10;
            } else {
                newTop = this.dashboardXY.y;
            }

            if (this.dashboardXY.x === '' || reset) {
                newLeft = $(this.dashboardXY.selector).offset().left;
            } else {
                newLeft = $(this.dashboardXY.selector).offset().left + this.dashboardXY.x;
            }

            return {x: newLeft, y: newTop};
        } catch (err) {
            gm.log("ERROR in GetDashboardXY: " + err);
            return {x: 0, y: 0};
        }
    },

    SaveDashboardXY: function () {
        try {
            var refOffset = $(this.dashboardXY.selector).offset();
            gm.setValue('caap_top_menuTop', this.caapTopObject.offset().top);
            gm.setValue('caap_top_menuLeft', this.caapTopObject.offset().left - refOffset.left);
            gm.setValue('caap_div_zIndex', '1');
            gm.setValue('caap_top_zIndex', '2');
        } catch (err) {
            gm.log("ERROR in SaveDashboardXY: " + err);
        }
    },

    AddControl: function () {
        try {
            var caapDiv = "<div id='caap_div'>",
                divID = 0,
                styleXY = {
                    x: 0,
                    y: 0
                },
                htmlCode = '',
                banner = '';

            for (divID in this.divList) {
                if (this.divList.hasOwnProperty(divID)) {
                    caapDiv += "<div id='caap_" + this.divList[divID] + "'></div>";
                }
            }

            caapDiv += "</div>";
            this.controlXY.x = gm.getValue('caap_div_menuLeft', '');
            this.controlXY.y = gm.getValue('caap_div_menuTop', $(this.controlXY.selector).offset().top);
            styleXY = this.GetControlXY();
            $(caapDiv).css({
                width: '180px',
                background: gm.getValue('StyleBackgroundLight', '#E0C691'),
                padding: "4px",
                border: "2px solid #444",
                top: styleXY.y + 'px',
                left: styleXY.x + 'px',
                zIndex: gm.getValue('caap_div_zIndex', '2'),
                position: 'absolute'
            }).appendTo(document.body);

            this.caapDivObject = $("#caap_div");

            banner += "<div id='caap_BannerHide' style='display: " + (gm.getValue('BannerDisplay', true) ? 'block' : 'none') + "'>";
            banner += "<img src='http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/Castle-Age-Autoplayer.png' alt='Castle Age Auto Player' /><br /><hr /></div>";
            this.SetDivContent('banner', banner);

            htmlCode += this.AddPauseMenu();
            htmlCode += this.AddDisableMenu();
            htmlCode += this.AddCashHealthMenu();
            htmlCode += this.AddQuestMenu();
            htmlCode += this.AddBattleMenu();
            htmlCode += this.AddMonsterMenu();
            htmlCode += this.AddMonsterFinderMenu();
            htmlCode += this.AddReconMenu();
            htmlCode += this.AddGeneralsMenu();
            htmlCode += this.AddSkillPointsMenu();
            htmlCode += this.AddOtherOptionsMenu();
            htmlCode += this.AddFooterMenu();
            this.SetDivContent('control', htmlCode);

            this.CheckLastAction(gm.getValue('LastAction', 'none'));
            $("#caap_resetElite").button();
            $("#caap_StartedColourSelect").button();
            $("#caap_StopedColourSelect").button();
            $("#caap_FillArmy").button();
            $("#caap_ResetMenuLocation").button();
            return true;
        } catch (err) {
            gm.log("ERROR in AddControl: " + err);
            return false;
        }
    },

    AddPauseMenu: function () {
        var htmlCode = '';
        if (global.is_chrome) {
            htmlCode += "<div id='caapPausedDiv' style='display: none'><a href='javascript:;' id='caapPauseA' >Pause</a></div>";
        }

        htmlCode += "<div id='caapPaused' style='display: " + gm.getValue('caapPause', 'block') + "'><b>Paused on mouse click.</b><br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />";
        return htmlCode;
    },

    AddDisableMenu: function () {
        var autoRunInstructions = "Disable auto running of CAAP. Stays persistent even on page reload and the autoplayer will not autoplay.",
            htmlCode = '';

        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Disable Autoplayer", 'Disabled', false, '', autoRunInstructions) + '</table><hr />';
        return htmlCode;
    },

    AddCashHealthMenu: function () {
        var bankInstructions0 = "Minimum cash to keep in the bank. Press tab to save",
            bankInstructions1 = "Minimum cash to have on hand, press tab to save",
            bankInstructions2 = "Maximum cash to have on hand, bank anything above this, press tab to save (leave blank to disable).",
            healthInstructions = "Minimum health to have before healing, press tab to save (leave blank to disable).",
            healthStamInstructions = "Minimum Stamina to have before healing, press tab to save (leave blank to disable).",
            bankImmedInstructions = "Bank as soon as possible. May interrupt player and monster battles.",
            autobuyInstructions = "Automatically buy lands in groups of 10 based on best Return On Investment value.",
            autosellInstructions = "Automatically sell off any excess lands above your level allowance.",
            htmlCode = '';

        htmlCode += this.ToggleControl('CashandHealth', 'CASH and HEALTH');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Bank Immediately", 'BankImmed', false, '', bankImmedInstructions);
        htmlCode += this.MakeCheckTR("Auto Buy Lands", 'autoBuyLand', false, '', autobuyInstructions);
        htmlCode += this.MakeCheckTR("Auto Sell Excess Lands", 'SellLands', false, '', autosellInstructions) + '</table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Keep In Bank</td><td style='text-align: right'>$" + this.MakeNumberForm('minInStore', bankInstructions0, 100000, "type='text' size='12' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Bank Above</td><td style='text-align: right'>$" + this.MakeNumberForm('MaxInCash', bankInstructions2, '', "type='text' size='7' style='font-size: 10px; text-align: right'") + "</td></tr>";
        htmlCode += "<tr><td style='padding-left: 10px'>But Keep On Hand</td><td style='text-align: right'>$" +
            this.MakeNumberForm('MinInCash', bankInstructions1, '', "type='text' size='7' style='font-size: 10px; text-align: right'") + "</td></tr></table>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Heal If Health Below</td><td style='text-align: right'>" + this.MakeNumberForm('MinToHeal', healthInstructions, 10, "size='2' style='font-size: 10px; text-align: right'") + "</td></tr>";
        htmlCode += "<tr><td style='padding-left: 10px'>But Not If Stamina Below</td><td style='text-align: right'>" +
            this.MakeNumberForm('MinStamToHeal', healthStamInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddQuestMenu: function () {
        var forceSubGen = "Always do a quest with the Subquest General you selected under the Generals section. NOTE: This will keep the script from automatically switching to the required general for experience of primary quests.",
            XQuestInstructions = "(EXPERIMENTAL) Start questing when energy is at or above this value.",
            XMinQuestInstructions = "(EXPERIMENTAL) Stop quest when energy is at or below this value.",
            autoQuestName = gm.getObjVal('AutoQuest', 'name'),
            htmlCode = '';

        htmlCode += this.ToggleControl('Quests', 'QUEST');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td width=80>Quest When</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('WhenQuest', this.questWhenList, this.questWhenInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<div id='caap_WhenQuestHide' style='display: " + (gm.getValue('WhenQuest', false) != 'Never' ? 'block' : 'none') + "'>";
        htmlCode += "<div id='caap_WhenQuestXEnergy' style='display: " + (gm.getValue('WhenQuest', false) != 'At X Energy' ? 'none' : 'block') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Start At Or Above Energy</td><td style='text-align: right'>" + this.MakeNumberForm('XQuestEnergy', XQuestInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Stop At Or Below Energy</td><td style='text-align: right'>" +
            this.MakeNumberForm('XMinQuestEnergy', XMinQuestInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Quest Area</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('QuestArea', this.questAreaList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
        switch (gm.getValue('QuestArea', this.questAreaList[0])) {
        case 'Quest' :
            htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                this.MakeDropDown('QuestSubArea', this.landQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
            break;
        case 'Demi Quests' :
            htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                this.MakeDropDown('QuestSubArea', this.demiQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
            break;
        default :
            htmlCode += "<tr id='trQuestSubArea' style='display: table-row'><td>Sub Area</td><td style='text-align: right; width: 60%'>" +
                this.MakeDropDown('QuestSubArea', this.atlantisQuestList, '', "style='font-size: 10px; width: 100%'") + '</td></tr>';
            break;
        }

        htmlCode += "<tr><td>Quest For</td><td style='text-align: right; width: 60%'>" + this.MakeDropDown('WhyQuest', this.questForList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Switch Quest Area", 'switchQuestArea', false, '', 'Allows switching quest area after Advancement or Max Influence');
        htmlCode += this.MakeCheckTR("Use Only Subquest General", 'ForceSubGeneral', false, '', forceSubGen);
        htmlCode += this.MakeCheckTR("Quest For Orbs", 'GetOrbs', false, '', 'Perform the Boss quest in the selected land for orbs you do not have.') + "</table>";
        htmlCode += "</div>";
        if (autoQuestName) {
            htmlCode += "<a id='stopAutoQuest' style='display: block' href='javascript:;'>Stop auto quest: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")" + "</a>";
        } else {
            htmlCode += "<a id='stopAutoQuest' style='display: none' href='javascript:;'></a>";
        }

        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddBattleMenu: function () {
        var XBattleInstructions = "Start battling if stamina is above this points",
            XMinBattleInstructions = "Don't battle if stamina is below this points",
            userIdInstructions = "User IDs(not user name).  Click with the " +
                "right mouse button on the link to the users profile & copy link." +
                "  Then paste it here and remove everything but the last numbers." +
                " (ie. 123456789)",
            chainBPInstructions = "Number of battle points won to initiate a " +
                "chain attack. Specify 0 to always chain attack.",
            chainGoldInstructions = "Amount of gold won to initiate a chain " +
                "attack. Specify 0 to always chain attack.",
            FMRankInstructions = "The lowest relative rank below yours that " +
                "you are willing to spend your stamina on. Leave blank to attack " +
                "any rank.",
            FMARBaseInstructions = "This value sets the base for your army " +
                "ratio calculation. It is basically a multiplier for the army " +
                "size of a player at your equal level. A value of 1 means you " +
                "will battle an opponent the same level as you with an army the " +
                "same size as you or less. Default .5",
            dontbattleInstructions = "Remember an opponents id after a loss " +
                "and don't battle him again",
            plusonekillsInstructions = "Force +1 kill scenario if 80% or more" +
                " of targets are withn freshmeat settings. Note: Since Castle Age" +
                " choses the target, selecting this option could result in a " +
                "greater chance of loss.",
            raidOrderInstructions = "List of search words that decide which " +
                "raids to participate in first.  Use words in player name or in " +
                "raid name. To specify max damage follow keyword with :max token " +
                "and specifiy max damage values. Use 'k' and 'm' suffixes for " +
                "thousand and million.",
            ignorebattlelossInstructions = "Ignore battle losses and attack " +
                "regardless.  This will also delete all battle loss records.",
            battleList = [
                'Stamina Available',
                'At Max Stamina',
                'At X Stamina',
                'No Monster',
                'Stay Hidden',
                'Never'
            ],
            battleInst = [
                'Stamina Available will battle whenever you have enough stamina',
                'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                'At X Stamina you can set maximum and minimum stamina to battle',
                'No Monster will battle only when there are no active monster battles',
                'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER OR ARENA TO "STAY HIDDEN" TO USE THIS FEATURE.',
                'Never - disables player battles'
            ],
            typeList = [
                'Invade',
                'Duel'
            ],
            typeInst = [
                'Battle using Invade button',
                'Battle using Duel button - no guarentee you will win though'
            ],
            targetList = [
                'Freshmeat',
                'Userid List',
                'Raid',
                'Arena'
            ],
            targetInst = [
                'Use settings to select a target from the Battle Page',
                'Select target from the supplied list of userids',
                'Raid Battles'
            ],
            goalList = [
                '',
                'Swordsman',
                'Warrior',
                'Gladiator',
                'Hero',
                'Legend'
            ],
            typeList2 = [
                'None',
                'Freshmeat',
                'Raid'
            ],
            typeInst2 = [
                'Never switch from battling in the Arena',
                'Switch fom Arena to fresmeat battles to reduce health below specifed level',
                'Switch fom Arena to raid battles to reduce health below specifed level'
            ],
            ArenaHealthInstructions = "If your health is below this value, " +
                "you will continue to stay in the Arena. If your health is above " +
                "this level, your stamina will be checked to see if it is above " +
                "the stamina threshold to stay in the Arena.",
            ArenaStaminaInstructions = "If your stamina is above this value, " +
                "you will continue to stay in the Arena. If your stamina is " +
                "below this level, your health will be checked to see if it is " +
                "below the health thershold for you to stay in the Arena. ",
            htmlCode = '';

        htmlCode += this.ToggleControl('Battling', 'BATTLE');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Battle When</td><td style='text-align: right; width: 65%'>" + this.MakeDropDown('WhenBattle', battleList, battleInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<div id='caap_WhenBattleStayHidden1' style='display: " + (gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('WhenMonster', false) != 'Stay Hidden' ? 'block' : 'none') + "'>";
        htmlCode += "</div>";
        htmlCode += "<div id='caap_WhenBattleStayHidden2' style='display: " + (gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('TargetType', false) == 'Arena' && gm.getValue('ArenaHide', false) == 'None' ? 'block' : 'none') + "'>";
        htmlCode += "<font color='red'><b>Warning: Arena Must Have 'Hide Using' Active To Support Hiding</b></font>";
        htmlCode += "</div>";
        htmlCode += "<div id='caap_WhenBattleXStamina' style='display: " + (gm.getValue('WhenBattle', false) != 'At X Stamina' ? 'none' : 'block') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Start Battles When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XBattleStamina', XBattleInstructions, 1, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
            this.MakeNumberForm('XMinBattleStamina', XMinBattleInstructions, 0, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<div id='caap_WhenBattleHide' style='display: " + (gm.getValue('WhenBattle', false) != 'Never' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Battle Type</td><td style='text-align: right; width: 40%'>" + this.MakeDropDown('BattleType', typeList, typeInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Clear Complete Raids", 'clearCompleteRaids', false, '', '');
        htmlCode += this.MakeCheckTR("Ignore Battle Losses", 'IgnoreBattleLoss', false, '', ignorebattlelossInstructions);
        htmlCode += "<tr><td>Chain:Battle Points Won</td><td style='text-align: right'>" + this.MakeNumberForm('ChainBP', chainBPInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td>Chain:Gold Won</td><td style='text-align: right'>" + this.MakeNumberForm('ChainGold', chainGoldInstructions, '', "size='5' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Target Type</td><td style='text-align: right; width: 50%'>" + this.MakeDropDown('TargetType', targetList, targetInst, "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<div id='caap_FreshmeatSub' style='display: " + (gm.getValue('TargetType', false) != 'Userid List' ? 'block' : 'none') + "'>";
        htmlCode += "Attack targets that are:";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='padding-left: 10px'>Not Lower Than Rank Minus</td><td style='text-align: right'>" +
            this.MakeNumberForm('FreshMeatMinRank', FMRankInstructions, '', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
            this.MakeNumberForm('FreshMeatARBase', FMARBaseInstructions, "0.5", "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<div id='caap_RaidSub' style='display: " + (gm.getValue('TargetType', false) == 'Raid' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, '', plusonekillsInstructions) + '</table>';
        htmlCode += "Join Raids in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank'><font color='red'>?</font></a><br />";
        htmlCode += this.MakeTextBox('orderraid', raidOrderInstructions, " rows='3' cols='25'");
        htmlCode += "</div>";
        htmlCode += "<div id='caap_ArenaSub' style='display: " + (gm.getValue('TargetType', false) == 'Arena' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Maintain Rank</td><td style='text-align: right; width : 50%'>" + this.MakeDropDown('ArenaGoal', goalList, '', "style='font-size: 10px; width : 100%'") + '</td></tr>';
        htmlCode += "<tr><td>Hide Using</td><td style='text-align: right; width : 50%'>" + this.MakeDropDown('ArenaHide', typeList2, typeInst2, "style='font-size: 10px; width : 100%'") + '</td></tr></table>';
        htmlCode += "<div id='caap_ArenaHSub' style='display: " + (gm.getValue('ArenaHide', false) == 'None' ? 'none' : 'block') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='padding-left: 10px'>Arena If Health Below</td><td style='text-align: right'>" +
            this.MakeNumberForm('ArenaMaxHealth', ArenaHealthInstructions, "20", "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'><b>OR</b></td><td></td></tr>";
        htmlCode += "<tr><td style='padding-left: 10px'>Arena If Stamina Above</td><td style='text-align: right'>" +
            this.MakeNumberForm('ArenaMinStamina', ArenaStaminaInstructions, "35", "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "</div>";
        htmlCode += "<div align=right id='caap_UserIdsSub' style='display: " + (gm.getValue('TargetType', false) == 'Userid List' ? 'block' : 'none') + "'>";
        htmlCode += this.MakeTextBox('BattleTargets', userIdInstructions, " rows='3' cols='25'");
        htmlCode += "</div>";
        htmlCode += "</div>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddMonsterMenu: function () {
        var XMonsterInstructions = "Start attacking if stamina is above this points",
            XMinMonsterInstructions = "Don't attack if stamina is below this points",
            attackOrderInstructions = "List of search words that decide which monster to attack first. " +
                "Use words in player name or in monster name. To specify max damage follow keyword with " +
                ":max token and specifiy max damage values. Use 'k' and 'm' suffixes for thousand and million. " +
                "To override achievement use the ach: token and specify damage values.",
            fortifyInstructions = "Fortify if ship health is below this % (leave blank to disable)",
            questFortifyInstructions = "Do Quests if ship health is above this % and quest mode is set to Not Fortify (leave blank to disable)",
            stopAttackInstructions = "Don't attack if ship health is below this % (leave blank to disable)",
            monsterachieveInstructions = "Check if monsters have reached achievement damage level first. Switch when achievement met.",
            demiPointsFirstInstructions = "Don't attack monsters until you've gotten all your demi points from battling.",
            powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
            powerattackMaxInstructions = "(EXPERIMENTAL) Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
            powerfortifyMaxInstructions = "(EXPERIMENTAL) Use maximum power fortify globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
            dosiegeInstructions = "Turns on or off automatic siege assist for all monsters and raids.",
            mbattleList = [
                'Stamina Available',
                'At Max Stamina',
                'At X Stamina',
                'Stay Hidden',
                'Never'
            ],
            mbattleInst = [
                'Stamina Available will attack whenever you have enough stamina',
                'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                'At X Stamina you can set maximum and minimum stamina to battle',
                'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET BATTLE WHEN TO "STAY HIDDEN" TO USE THIS FEATURE.',
                'Never - disables attacking monsters'
            ],
            monsterDelayInstructions = "Max random delay to battle monsters",
            demiPoint = [
                'Ambrosia',
                'Malekus',
                'Corvintheus',
                'Aurora',
                'Azeron'
            ],
            demiPtList = [
                '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_1.jpg" height="15" width="14"/>',
                '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_2.jpg" height="15" width="14"/>',
                '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_3.jpg" height="15" width="14"/>',
                '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_4.jpg" height="15" width="14"/>',
                '<img src="http://image2.castleagegame.com/graphics/symbol_tiny_5.jpg" height="15" width="14"/>'
            ],
            demiPtItem = 0,
            htmlCode = '';

        htmlCode += this.ToggleControl('Monster', 'MONSTER');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='width: 35%'>Attack When</td><td style='text-align: right'>" + this.MakeDropDown('WhenMonster', mbattleList, mbattleInst, "style='font-size: 10px; width: 100%;'") + '</td></tr></table>';
        htmlCode += "<div id='caap_WhenMonsterXStamina' style='display: " + (gm.getValue('WhenMonster', false) != 'At X Stamina' ? 'none' : 'block') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Battle When Stamina</td><td style='text-align: right'>" + this.MakeNumberForm('XMonsterStamina', XMonsterInstructions, 1, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Keep This Stamina</td><td style='text-align: right'>" +
            this.MakeNumberForm('XMinMonsterStamina', XMinMonsterInstructions, 0, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<div id='caap_WhenMonsterHide' style='display: " + (gm.getValue('WhenMonster', false) != 'Never' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Monster delay secs</td><td style='text-align: right'>" + this.MakeNumberForm('seedTime', monsterDelayInstructions, 300, "type='text' size='4' style='font-size: 10px; text-align: right'") + "</td></tr>";
        htmlCode += this.MakeCheckTR("Power Attack Only", 'PowerAttack', true, 'PowerAttack_Adv', powerattackInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("&nbsp;&nbsp;&nbsp;Power Attack Max", 'PowerAttackMax', false, '', powerattackMaxInstructions) + "</table>";
        htmlCode += "</div>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Power Fortify Max", 'PowerFortifyMax', false, '', powerfortifyMaxInstructions);
        htmlCode += this.MakeCheckTR("Siege weapon assist", 'DoSiege', true, '', dosiegeInstructions);
        htmlCode += this.MakeCheckTR("Clear Complete Monsters", 'clearCompleteMonsters', false, '', '');
        htmlCode += this.MakeCheckTR("Achievement Mode", 'AchievementMode', true, '', monsterachieveInstructions);
        htmlCode += this.MakeCheckTR("Get Demi Points First", 'DemiPointsFirst', false, 'DemiList', demiPointsFirstInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        for (demiPtItem in demiPtList) {
            if (demiPtList.hasOwnProperty(demiPtItem)) {
                htmlCode += demiPtList[demiPtItem] + this.MakeCheckBox('DemiPoint' + demiPtItem, true, '', demiPoint[demiPtItem]);
            }
        }

        htmlCode += "</table>";
        htmlCode += "</div>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Fortify If Percentage Under</td><td style='text-align: right'>" +
            this.MakeNumberForm('MaxToFortify', fortifyInstructions, 50, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Quest If Percentage Over</td><td style='text-align: right'>" +
            this.MakeNumberForm('MaxHealthtoQuest', questFortifyInstructions, 60, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td>No Attack If Percentage Under</td><td style='text-align: right'>" + this.MakeNumberForm('MinFortToAttack', stopAttackInstructions, 10, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "Attack Monsters in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank'><font color='red'>?</font></a><br />";
        htmlCode += this.MakeTextBox('orderbattle_monster', attackOrderInstructions, " rows='3' cols='25'");
        htmlCode += "</div>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddMonsterFinderMenu: function () {
        // Monster finder controls
        var monsterFinderInstructions = "When monsters are over max damage, use Monster Finder?",
            monsterFinderStamInstructions = "Don't find new monster if stamina under this amount",
            monsterFinderFeedMinInstructions = "Wait at least this many minutes before checking the Castle Age feed (in Facebook) (Max 120)",
            monsterFinderFeedMaxInstructions = "If this much time has passed, always Castle Age feed (in Facebook) (argument is in minutes)",
            monsterFinderOrderInstructions = "List of search words that decide which monster to attack first.  Can be names or monster types.",
            htmlCode = '';

        htmlCode += this.ToggleControl('MonsterFinder', 'MONSTER FINDER');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Use Monster Finder", 'MonsterFinderUse', false, 'MonsterFinderUse_Adv', monsterFinderInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Monster Find Min Stam</td><td style='text-align: right'>" +
            this.MakeNumberForm('MonsterFinderMinStam', monsterFinderStamInstructions, 50, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td>Min-Check Feed (minutes)</td><td style='text-align: right'>" +
            this.MakeNumberForm('MonsterFinderFeedMin', monsterFinderFeedMinInstructions, 15, "size='3' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "Find Monster Priority <a href='http://senses.ws/caap/index.php?topic=66.0' target='_blank'><font color='red'>?</font></a>";
        htmlCode += this.MakeTextBox('MonsterFinderOrder', monsterFinderOrderInstructions, " rows='3' cols='25'");
        htmlCode += "</div>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddReconMenu: function () {
        // Recon Controls
        var PReconInstructions = "Enable player battle reconnaissance to run " +
                "as an idle background task. Battle targets will be collected and" +
                " can be displayed using the 'Target List' selection on the " +
                "dashboard.",
            PRRankInstructions = "Provide the number of ranks below you which" +
                " recon will use to filter targets. This value will be subtracted" +
                " from your rank to establish the minimum rank that recon will " +
                "consider as a viable target. Default 3.",
            PRLevelInstructions = "Provide the number of levels above you " +
                "which recon will use to filter targets. This value will be added" +
                " to your level to establish the maximum level that recon will " +
                "consider as a viable target. Default 10.",
            PRARBaseInstructions = "This value sets the base for your army " +
                "ratio calculation. It is basically a multiplier for the army " +
                "size of a player at your equal level. For example, a value of " +
                ".5 means you will battle an opponent the same level as you with " +
                "an army half the size of your army or less. Default 1.",
            htmlCode = '';

        htmlCode += this.ToggleControl('Recon', 'RECON');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Enable Player Recon", 'DoPlayerRecon', false, 'PlayerReconControl', PReconInstructions, true);
        htmlCode += 'Find battle targets that are:';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='padding-left: 10px'>Not Lower Than Rank Minus</td><td style='text-align: right'>" +
            this.MakeNumberForm('ReconPlayerRank', PRRankInstructions, '3', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than Level Plus</td><td style='text-align: right'>" +
            this.MakeNumberForm('ReconPlayerLevel', PRLevelInstructions, '10', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Not Higher Than X*Army</td><td style='text-align: right'>" +
            this.MakeNumberForm('ReconPlayerARBase', PRARBaseInstructions, '1', "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddGeneralsMenu: function () {
        // Add General Comboboxes
        var reverseGenInstructions = "This will make the script level Generals under level 4 from Top-down instead of Bottom-up",
            ignoreGeneralImage = "(EXPERIMENTAL) This will prevent the script " +
                "from changing your selected General to 'Use Current' if the script " +
                "is unable to find the General's image when changing activities. " +
                "Instead it will use the current General for the activity and try " +
                "to select the correct General again next time.",
            LevelUpGenExpInstructions = "Specify the number of experience " +
                "points below the next level up to begin using the level up general.",
            LevelUpGenInstructions1 = "Use the Level Up General for Idle mode.",
            LevelUpGenInstructions2 = "Use the Level Up General for Monster mode.",
            LevelUpGenInstructions3 = "Use the Level Up General for Fortify mode.",
            LevelUpGenInstructions4 = "Use the Level Up General for Battle mode.",
            LevelUpGenInstructions5 = "Use the Level Up General for doing sub-quests.",
            LevelUpGenInstructions6 = "Use the Level Up General for doing primary quests " +
                "(Warning: May cause you not to gain influence if wrong general is equipped.)",
            dropDownItem = 0,
            htmlCode = '';

        this.BuildGeneralLists();

        htmlCode += this.ToggleControl('Generals', 'GENERALS');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Do not reset General", 'ignoreGeneralImage', false, '', ignoreGeneralImage) + "</table>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        for (dropDownItem in this.standardGeneralList) {
            if (this.standardGeneralList.hasOwnProperty(dropDownItem)) {
                htmlCode += '<tr><td>' + this.standardGeneralList[dropDownItem] + "</td><td style='text-align: right'>" +
                    this.MakeDropDown(this.standardGeneralList[dropDownItem] + 'General', this.generalList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
            }
        }

        htmlCode += "<tr><td>Buy</td><td style='text-align: right'>" + this.MakeDropDown('BuyGeneral', this.generalList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
        htmlCode += "<tr><td>Income</td><td style='text-align: right'>" + this.MakeDropDown('IncomeGeneral', this.generalList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
        htmlCode += "<tr><td>Banking</td><td style='text-align: right'>" + this.MakeDropDown('BankingGeneral', this.generalList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr>';
        htmlCode += "<tr><td>Level Up</td><td style='text-align: right'>" + this.MakeDropDown('LevelUpGeneral', this.generalList, '', "style='font-size: 10px; min-width: 110px; max-width: 110px; width: 110px;'") + '</td></tr></table>';
        htmlCode += "<div id='caap_LevelUpGeneralHide' style='display: " + (gm.getValue('LevelUpGeneral', false) != 'Use Current' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td>Exp To Use LevelUp Gen </td><td style='text-align: right'>" + this.MakeNumberForm('LevelUpGeneralExp', LevelUpGenExpInstructions, 20, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += this.MakeCheckTR("Level Up Gen For Idle", 'IdleLevelUpGeneral', true, '', LevelUpGenInstructions1);
        htmlCode += this.MakeCheckTR("Level Up Gen For Monsters", 'MonsterLevelUpGeneral', true, '', LevelUpGenInstructions2);
        htmlCode += this.MakeCheckTR("Level Up Gen For Fortify", 'FortifyLevelUpGeneral', true, '', LevelUpGenInstructions3);
        htmlCode += this.MakeCheckTR("Level Up Gen For Battles", 'BattleLevelUpGeneral', true, '', LevelUpGenInstructions4);
        htmlCode += this.MakeCheckTR("Level Up Gen For SubQuests", 'SubQuestLevelUpGeneral', true, '', LevelUpGenInstructions5);
        htmlCode += this.MakeCheckTR("Level Up Gen For MainQuests", 'QuestLevelUpGeneral', true, '', LevelUpGenInstructions6);
        htmlCode += "</table></div>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Reverse Under Level 4 Order", 'ReverseLevelUpGenerals', false, '', reverseGenInstructions) + "</table>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddSkillPointsMenu: function () {
        var statusInstructions = "Automatically increase attributes when " +
                "upgrade skill points are available.",
            statusAdvInstructions = "USE WITH CAUTION: You can use numbers or " +
                "formulas(ie. level * 2 + 10). Variable keywords include energy, " +
                "health, stamina, attack, defense, and level. JS functions can be " +
                "used (Math.min, Math.max, etc) !!!Remember your math class: " +
                "'level + 20' not equals 'level * 2 + 10'!!!",
            statImmedInstructions = "Update Stats Immediately",
            attrList = [
                '',
                'Energy',
                'Attack',
                'Defense',
                'Stamina',
                'Health'
            ],
            htmlCode = '';

        htmlCode += this.ToggleControl('Status', 'UPGRADE SKILL POINTS');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Auto Add Upgrade Points", 'AutoStat', false, 'AutoStat_Adv', statusInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR("Upgrade Immediately", 'StatImmed', false, '', statImmedInstructions);
        htmlCode += this.MakeCheckTR("Advanced Settings <a href='http://userscripts.org/posts/207279' target='_blank'><font color='red'>?</font></a>", 'AutoStatAdv', false, '', statusAdvInstructions) + "</table>";
        htmlCode += "<div id='caap_Status_Normal' style='display: " + (gm.getValue('AutoStatAdv', false) ? 'none' : 'block') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute0', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
            this.MakeNumberForm('AttrValue0', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute1', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
            this.MakeNumberForm('AttrValue1', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute2', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
            this.MakeNumberForm('AttrValue2', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute3', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
            this.MakeNumberForm('AttrValue3', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute4', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 5%; text-align: center'>to</td><td style='width: 20%; text-align: right'>" +
            this.MakeNumberForm('AttrValue4', statusInstructions, 0, "type='text' size='3' style='font-size: 10px; text-align: right'") + " </td></tr></table>";
        htmlCode += "</div>";
        htmlCode += "<div id='caap_Status_Adv' style='display: " + (gm.getValue('AutoStatAdv', false) ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Increase</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute5', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%; text-align: left'>using</td></tr>";
        htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue5', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute6', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
        htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue6', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute7', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
        htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue7', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute8', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
        htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue8', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr>";
        htmlCode += "<tr><td style='width: 25%; text-align: right'>Then</td><td style='width: 50%; text-align: center'>" +
            this.MakeDropDown('Attribute9', attrList, '', "style='font-size: 10px'") + "</td><td style='width: 25%'>using</td></tr>";
        htmlCode += "<tr><td colspan='3'>" + this.MakeNumberForm('AttrValue9', statusInstructions, 0, "type='text' size='7' style='font-size: 10px; width : 98%'") + " </td></tr></table>";
        htmlCode += "</div>";
        htmlCode += "</table></div>";
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddOtherOptionsMenu: function () {
        // Other controls
        var giftInstructions = "Automatically receive and send return gifts.",
            timeInstructions = "Use 24 hour format for displayed times.",
            titleInstructions0 = "Set the title bar.",
            titleInstructions1 = "Add the current action.",
            titleInstructions2 = "Add the player name.",
            autoCollectMAInstructions = "Auto collect your Master and Apprentice rewards.",
            hideAdsInstructions = "Hides the sidebar adverts.",
            autoAlchemyInstructions1 = "AutoAlchemy will combine all recipes " +
                "that do not have missing ingredients. By default, it will not " +
                "combine Battle Hearts recipes.",
            autoAlchemyInstructions2 = "If for some reason you do not want " +
                "to skip Battle Hearts",
            autoPotionsInstructions0 = "Enable or disable the auto consumption " +
                "of energy and stamina potions.",
            autoPotionsInstructions1 = "Number of stamina potions at which to " +
                "begin consuming.",
            autoPotionsInstructions2 = "Number of stamina potions to keep.",
            autoPotionsInstructions3 = "Number of energy potions at which to " +
                "begin consuming.",
            autoPotionsInstructions4 = "Number of energy potions to keep.",
            autoPotionsInstructions5 = "Do not consume potions if the " +
                "experience points to the next level are within this value.",
            autoEliteInstructions = "Enable or disable Auto Elite function",
            autoEliteIgnoreInstructions = "Use this option if you have a small " +
                "army and are unable to fill all 10 Elite positions. This prevents " +
                "the script from checking for any empty places and will cause " +
                "Auto Elite to run on its timer only.",
            bannerInstructions = "Uncheck if you wish to hide the CAAP banner.",
            giftChoiceList = [
                'Same Gift As Received',
                'Random Gift'
            ],
            autoBlessList = [
                'None',
                'Energy',
                'Attack',
                'Defense',
                'Stamina',
                'Health'
            ],
            styleList = [
                'CA Skin',
                'Original',
                'Custom',
                'None'
            ],
            htmlCode = '';

        giftChoiceList = giftChoiceList.concat(gm.getList('GiftList'));
        giftChoiceList.push('Get Gift List');

        htmlCode += this.ToggleControl('Other', 'OTHER OPTIONS');
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('Display CAAP Banner', 'BannerDisplay', true, '', bannerInstructions);
        htmlCode += this.MakeCheckTR('Use 24 Hour Format', 'use24hr', true, '', timeInstructions);
        htmlCode += this.MakeCheckTR('Set Title', 'SetTitle', false, 'SetTitle_Adv', titleInstructions0, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Display Action', 'SetTitleAction', false, '', titleInstructions1);
        htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Display Name', 'SetTitleName', false, '', titleInstructions2) + '</td></tr></table>';
        htmlCode += '</div>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('Hide Sidebar Adverts', 'HideAds', false, '', hideAdsInstructions);
        htmlCode += this.MakeCheckTR('Auto Collect MA', 'AutoCollectMA', true, '', autoCollectMAInstructions);
        htmlCode += this.MakeCheckTR('Auto Alchemy', 'AutoAlchemy', false, 'AutoAlchemy_Adv', autoAlchemyInstructions1, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Do Battle Hearts', 'AutoAlchemyHearts', false, '', autoAlchemyInstructions2) + '</td></tr></table>';
        htmlCode += '</div>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('Auto Potions', 'AutoPotions', false, 'AutoPotions_Adv', autoPotionsInstructions0, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='padding-left: 10px'>Spend Stamina Potions At</td><td style='text-align: right'>" +
            this.MakeNumberForm('staminaPotionsSpendOver', autoPotionsInstructions1, 39, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Keep Stamina Potions</td><td style='text-align: right'>" +
            this.MakeNumberForm('staminaPotionsKeepUnder', autoPotionsInstructions2, 35, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Spend Energy Potions At</td><td style='text-align: right'>" +
            this.MakeNumberForm('energyPotionsSpendOver', autoPotionsInstructions3, 39, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Keep Energy Potions</td><td style='text-align: right'>" +
            this.MakeNumberForm('energyPotionsKeepUnder', autoPotionsInstructions4, 35, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'>Wait If Exp. To Level</td><td style='text-align: right'>" +
            this.MakeNumberForm('potionsExperience', autoPotionsInstructions5, 20, "size='2' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += '</div>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('Auto Elite Army', 'AutoElite', true, 'AutoEliteControl', autoEliteInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('&nbsp;&nbsp;&nbsp;Timed Only', 'AutoEliteIgnore', false, '', autoEliteIgnoreInstructions) + '</table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td><input type='button' id='caap_resetElite' value='Do Now' style='padding: 0; font-size: 10px; height: 18px' /></tr></td>";
        htmlCode += '<tr><td>' + this.MakeTextBox('EliteArmyList', "Try these UserIDs first. Use ',' between each UserID", " rows='3' cols='25'") + '</td></tr></table>';
        htmlCode += '</div>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += this.MakeCheckTR('Auto Return Gifts', 'AutoGift', false, 'GiftControl', giftInstructions, true);
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='width: 25%; padding-left: 10px'>Give</td><td style='text-align: right'>" +
            this.MakeDropDown('GiftChoice', giftChoiceList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += '</div>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
        htmlCode += "<tr><td style='width: 50%'>Auto bless</td><td style='text-align: right'>" +
            this.MakeDropDown('AutoBless', autoBlessList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
        htmlCode += "<tr><td style='width: 50%'>Style</td><td style='text-align: right'>" +
            this.MakeDropDown('DisplayStyle', styleList, '', "style='font-size: 10px; width: 100%'") + '</td></tr></table>';
        htmlCode += "<div id='caap_DisplayStyleHide' style='display: " + (gm.getValue('DisplayStyle', false) == 'Custom' ? 'block' : 'none') + "'>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='padding-left: 10px'><b>Started</b></td><td style='text-align: right'><input type='button' id='caap_StartedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
        htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
            this.MakeNumberForm('StyleBackgroundLight', 'FFF or FFFFFF', '#E0C691', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
            this.MakeNumberForm('StyleOpacityLight', '0 ~ 1', '1', "type='text' size='5' style='vertical-align: middle; font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 10px'><b>Stoped</b></td><td style='text-align: right'><input type='button' id='caap_StopedColorSelect' value='Select' style='padding: 0; font-size: 10px; height: 18px' /></td></tr>";
        htmlCode += "<tr><td style='padding-left: 20px'>RGB Color</td><td style='text-align: right'>" +
            this.MakeNumberForm('StyleBackgroundDark', 'FFF or FFFFFF', '#B09060', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr>';
        htmlCode += "<tr><td style='padding-left: 20px'>Transparency</td><td style='text-align: right'>" +
            this.MakeNumberForm('StyleOpacityDark', '0 ~ 1', '1', "type='text' size='5' style='font-size: 10px; text-align: right'") + '</td></tr></table>';
        htmlCode += "</div>";
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px' style='margin-top: 3px'>";
        htmlCode += "<tr><td><input type='button' id='caap_FillArmy' value='Fill Army' style='padding: 0; font-size: 10px; height: 18px' /></td></tr></table>";
        htmlCode += '</div>';
        htmlCode += "<hr/></div>";
        return htmlCode;
    },

    AddFooterMenu: function () {
        var htmlCode = '';
        htmlCode += "<table width='180px' cellpadding='0px' cellspacing='0px'>";
        htmlCode += "<tr><td style='width: 90%'>Unlock Menu <input type='button' id='caap_ResetMenuLocation' value='Reset' style='padding: 0; font-size: 10px; height: 18px' /></td>" +
            "<td style='width: 10%; text-align: right'><input type='checkbox' id='unlockMenu' /></td></tr></table>";
        htmlCode += "Version: " + caapVersion + " - <a href='" + global.discussionURL + "' target='_blank'>CAAP Forum</a><br />";
        if (global.newVersionAvailable) {
            htmlCode += "<a href='http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + gm.getValue('SUC_remote_version') + "!</a>";
        }

        return htmlCode;
    },

    AddColorWheels: function () {
        try {
            var fb1call = function (color) {
                $('#caap_ColorSelectorDiv1').css({'background-color': color});
                $('#caap_StyleBackgroundLight').val(color);
                gm.setValue("StyleBackgroundLight", color);
                gm.setValue("CustStyleBackgroundLight", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv1'></div>").css({
                background: gm.getValue("StyleBackgroundLight", "#E0C691"),
                padding: "5px",
                border: "2px solid #000",
                top: (window.innerHeight / 2) - 100 + 'px',
                left: (window.innerWidth / 2) - 290 + 'px',
                zIndex: '1337',
                position: 'fixed',
                display: 'none'
            }).appendTo(document.body), fb1call).setColor(gm.getValue("StyleBackgroundLight", "#E0C691"));

            var fb2call = function (color) {
                $('#caap_ColorSelectorDiv2').css({'background-color': color});
                $('#caap_StyleBackgroundDark').val(color);
                gm.setValue("StyleBackgroundDark", color);
                gm.setValue("CustStyleBackgroundDark", color);
            };

            $.farbtastic($("<div id='caap_ColorSelectorDiv2'></div>").css({
                background: gm.getValue("StyleBackgroundDark", "#B09060"),
                padding: "5px",
                border: "2px solid #000",
                top: (window.innerHeight / 2) - 100 + 'px',
                left: (window.innerWidth / 2) + 'px',
                zIndex: '1337',
                position: 'fixed',
                display: 'none'
            }).appendTo(document.body), fb2call).setColor(gm.getValue("StyleBackgroundDark", "#B09060"));

            return true;
        } catch (err) {
            gm.log("ERROR in AddColorWheels: " + err);
            return false;
        }
    },

    AddDashboard: function () {
        try {
            /*-------------------------------------------------------------------------------------\
             Here is where we construct the HTML for our dashboard. We start by building the outer
             container and position it within the main container.
            \-------------------------------------------------------------------------------------*/
            var layout      = "<div id='caap_top'>",
                displayList = ['Monster', 'Target List'],
                styleXY = {
                    x: 0,
                    y: 0
                };
            /*-------------------------------------------------------------------------------------\
             Next we put in our Refresh Monster List button which will only show when we have
             selected the Monster display.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonMonster' style='position:absolute;top:0px;left:250px;display:" +
                (gm.getValue('DBDisplay', 'Monster') == 'Monster' ? 'block' : 'none') + "'><input type='button' id='caap_refreshMonsters' value='Refresh Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Next we put in the Clear Target List button which will only show when we have
             selected the Target List display
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonTargets' style='position:absolute;top:0px;left:250px;display:" +
                (gm.getValue('DBDisplay', 'Monster') == 'Target List' ? 'block' : 'none') + "'><input type='button' id='caap_clearTargets' value='Clear Targets List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             Then we put in the Live Feed link since we overlay the Castle Age link.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_buttonFeed' style='position:absolute;top:0px;left:0px;'><input id='caap_liveFeed' type='button' value='LIVE FEED! Your friends are calling.' style='padding: 0; font-size: 9px; height: 18px' /></div>";
            /*-------------------------------------------------------------------------------------\
             We install the display selection box that allows the user to toggle through the
             available displays.
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_DBDisplay' style='font-size: 9px;position:absolute;top:0px;right:0px;'>Display: " +
                this.DBDropDown('DBDisplay', displayList, '', "style='font-size: 9px; min-width: 120px; max-width: 120px; width : 120px;'") + "</div>";
            /*-------------------------------------------------------------------------------------\
            And here we build our empty content divs.  We display the appropriate div
            depending on which display was selected using the control above
            \-------------------------------------------------------------------------------------*/
            layout += "<div id='caap_infoMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') == 'Monster' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets1' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') == 'Target List' ? 'block' : 'none') + "'></div>";
            layout += "<div id='caap_infoTargets2' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (gm.getValue('DBDisplay', 'Monster') == 'Target Stats' ? 'block' : 'none') + "'></div>";
            layout += "</div>";
            /*-------------------------------------------------------------------------------------\
             No we apply our CSS to our container
            \-------------------------------------------------------------------------------------*/
            this.dashboardXY.x = gm.getValue('caap_top_menuLeft', '');
            this.dashboardXY.y = gm.getValue('caap_top_menuTop', $(this.dashboardXY.selector).offset().top - 10);
            styleXY = this.GetDashboardXY();
            $(layout).css({
                background: gm.getValue("StyleBackgroundLight", "white"),
                padding: "5px",
                height: "185px",
                width: "610px",
                margin: "0 auto",
                opacity: gm.getValue('StyleOpacityLight', '1'),
                top: styleXY.y + 'px',
                left: styleXY.x + 'px',
                zIndex: gm.getValue('caap_top_zIndex', '1'),
                position: 'absolute'
            }).appendTo(document.body);

            this.caapTopObject = $('#caap_top');
            $("#caap_refreshMonsters").button();
            $("#caap_clearTargets").button();
            $("#caap_liveFeed").button();

            return true;
        } catch (err) {
            gm.log("ERROR in AddDashboard: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                      MONSTERS DASHBOARD
    // Display the current monsters and stats
    /////////////////////////////////////////////////////////////////////

    makeCommaValue: function (nStr) {
        var x   = nStr.split('.'),
            x1  = x[0],
            rgx = /(\d+)(\d{3})/;

        nStr += '';
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1;
    },

    makeTd: function (text, color) {
        if (gm.getObjVal(color, 'color')) {
            color = gm.getObjVal(color, 'color');
        }

        if (!color) {
            color = 'black';
        }

        return "<td><font size=1 color='" + color + "'>" + text + "</font></td>";
    },

    //UpdateDashboardWaitLog: true,

    UpdateDashboard: function () {
        try {
            if ($('#caap_top').length === 0) {
                throw "We are missing the Dashboard div!";
            }

            if (!this.oneMinuteUpdate('dashboard') && $('#caap_infoMonster').html() && $('#caap_infoMonster').html()) {
                /*
                if (this.UpdateDashboardWaitLog) {
                    gm.log("Dashboard update is waiting on oneMinuteUpdate");
                    this.UpdateDashboardWaitLog = false;
                }
                */

                return false;
            }

            //gm.log("Updating Dashboard");
            this.UpdateDashboardWaitLog = true;
            var html = "<table width=570 cellpadding=0 cellspacing=0 ><tr>";
            var displayItemList = ['Name', 'Damage', 'Damage%', 'Fort%', 'TimeLeft', 'T2K', 'Phase', 'Link'];
            for (var p in displayItemList) {
                if (displayItemList.hasOwnProperty(p)) {
                    html += "<td><b><font size=1>" + displayItemList[p] + '</font></b></td>';
                }
            }

            html += '</tr>';
            displayItemList.shift();
            var monsterList = gm.getList('monsterOl');
            monsterList.forEach(function (monsterObj) {
                var monster = monsterObj.split(global.vs)[0];
                var monstType = caap.getMonstType(monster);
                var energyRequire = 10;
                var nodeNum = 0;
                if (caap.monsterInfo[monstType]) {
                    var staLvl = caap.monsterInfo[monstType].staLvl;
                    if (!caap.InLevelUpMode() && gm.getValue('PowerFortifyMax') && staLvl) {
                        for (nodeNum = caap.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (caap.stats.stamina.max > caap.monsterInfo[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }

                    if (nodeNum && gm.getValue('PowerAttackMax') && caap.monsterInfo[monstType].nrgMax) {
                        energyRequire = caap.monsterInfo[monstType].nrgMax[nodeNum];
                    }
                }

                var color = '';
                html += "<tr>";
                if (monster == gm.getValue('targetFromfortify') && caap.CheckEnergy(energyRequire, gm.getValue('WhenFortify', 'Energy Available'), 'fortify_mess')) {
                    color = 'blue';
                } else if (monster == gm.getValue('targetFromraid') || monster == gm.getValue('targetFrombattle_monster')) {
                    color = 'green';
                } else {
                    color = gm.getObjVal(monsterObj, 'color', 'black');
                }

                html += caap.makeTd(monster, color);
                displayItemList.forEach(function (displayItem) {
                    //gm.log(' displayItem '+ displayItem + ' value '+ gm.getObjVal(monster,displayItem));
                    if (displayItem == 'Phase' && color == 'grey') {
                        html += caap.makeTd(gm.getObjVal(monsterObj, 'status'), color);
                    } else {
                        var value = gm.getObjVal(monsterObj, displayItem);
                        if (value && !(displayItem == 'Fort%' && value == 101)) {
                            if (parseInt(value, 10).toString() == value) {
                                value = caap.makeCommaValue(value);
                            }

                            html += caap.makeTd(value + (displayItem.match(/%/) ? '%' : ''), color);
                        } else {
                            html += '<td></td>';
                        }
                    }
                });

                html += '</tr>';
            });

            html += '</table>';
            $("#caap_infoMonster").html(html);

            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            html = "<table width=570 cellpadding=0 cellspacing=0 ><tr>";
            var headers = ['UserId', 'Name', 'Deity#', 'Rank', 'Rank#', 'Level', 'Army', 'Last Alive'];
            var values = ['nameStr', 'deityNum', 'rankStr', 'rankNum', 'levelNum', 'armyNum', 'aliveTime'];
            for (var pp in headers) {
                if (headers.hasOwnProperty(pp)) {
                    html += "<td><b><font size=1>" + headers[pp] + '</font></b></td>';
                }
            }
            /*-------------------------------------------------------------------------------------\
            This div will hold data drom the targetsOl repository.  We step through the entries
            in targetOl and build each table row.  Our userid is 'key' so it's the first parameter
            \-------------------------------------------------------------------------------------*/
            var targetList = gm.getList('targetsOl');
            for (var i in targetList) {
                if (targetList.hasOwnProperty(i)) {
                    var targetObj = targetList[i];
                    var userid = targetObj.split(global.vs)[0];
                    html += "<tr>";
                    var link = "<a href='http://apps.facebook.com/castle_age/keep.php?user=" + userid + "'>" + userid + "</a>";
                    html += this.makeTd(link, 'blue');
                    /*-------------------------------------------------------------------------------------\
                    We step through each of the additional values we include in the table. If a value is
                    null then we build an empty td
                    \-------------------------------------------------------------------------------------*/
                    for (var j in values) {
                        if (values.hasOwnProperty(j)) {
                            var value = gm.getObjVal(targetObj, values[j]);
                            if (!value) {
                                html += '<td></td>';
                                continue;
                            }
                            /*-------------------------------------------------------------------------------------\
                            We format the values based on the names. Names ending with Num are numbers, ending in
                            Time are date/time counts, and Str are strings. We then end the row, and finally when
                            all done end the table.  We then add the HTML to the div.
                            \-------------------------------------------------------------------------------------*/
                            if (/\S+Num/.test(values[j])) {
                                value = this.makeCommaValue(value);
                            }

                            if (/\S+Time/.test(values[j])) {
                                var newTime = new Date(parseInt(value, 10));
                                value = (newTime.getMonth() + 1) + '/' + newTime.getDate() + ' ' + newTime.getHours() + ':' + (newTime.getMinutes() < 10 ? '0' : '') + newTime.getMinutes();
                            }

                            html += this.makeTd(value, 'black');
                        }
                    }

                    html += '</tr>';
                }
            }

            html += '</table>';
            $("#caap_infoTargets1").html(html);
            return true;
        } catch (e) {
            gm.log("ERROR in UpdateDashboard: " + e);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    AddDBListener creates the listener for our dashboard controls.
    \-------------------------------------------------------------------------------------*/
    dbDisplayListener: function (e) {
        var value = e.target.options[e.target.selectedIndex].value;
        gm.setValue('DBDisplay', value);
        switch (value) {
        case "Target List" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', true);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', true);
            break;
        case "Target Stats" :
            caap.SetDisplay('infoMonster', false);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', true);
            caap.SetDisplay('buttonMonster', false);
            caap.SetDisplay('buttonTargets', true);
            break;
        case "Monster" :
            caap.SetDisplay('infoMonster', true);
            caap.SetDisplay('infoTargets1', false);
            caap.SetDisplay('infoTargets2', false);
            caap.SetDisplay('buttonMonster', true);
            caap.SetDisplay('buttonTargets', false);
            break;
        default :
        }

        gm.setValue('resetdashboard', true);
    },

    refreshMonstersListener: function (e) {
        gm.setValue('monsterReview', 0);
        gm.setValue('monsterReviewCounter', -3);
        gm.setValue('NotargetFrombattle_monster', 0);
        gm.setValue('ReleaseControl', true);
    },

    liveFeedButtonListener: function (e) {
        caap.ClickAjax('army_news_feed.php');
    },

    clearTargetsButtonListener: function (e) {
        gm.setValue('targetsOl', '');
        gm.setValue('resetdashboard', true);
    },

    AddDBListener: function () {
        try {
            var selectDiv = document.getElementById('caap_DBDisplay');
            if (!selectDiv) {
                this.ReloadCastleAge();
            }

            $('#caap_DBDisplay').change(this.dbDisplayListener);
            $('#caap_refreshMonsters').click(this.refreshMonstersListener);
            $('#caap_liveFeed').click(this.liveFeedButtonListener);
            $('#caap_clearTargets').click(this.clearTargetsButtonListener);
            return true;
        } catch (e) {
            gm.log("ERROR in AddDBListener: " + e);
            return false;
        }
    },

    /*
    shortenURL: function (long_url, callback) {
        // Called too frequently, the delay can cause the screen to flicker
        callback(long_url);
        GM_xmlhttpRequest({
            method : 'GET',
            url    : 'http://api.bit.ly/shorten?version=2.0.1&longUrl=' + encodeURIComponent(long_url) + '&login=castleage&apiKey=R_438eea4a725a25d92661bce54b17bee1&format=json&history=1',
            onload : function (response) {
                var result = eval("("+response.responseText+")");
                callback(result.results ? result.results[long_url].shortUrl : long_url);
            }
        });
    },
    */

    /////////////////////////////////////////////////////////////////////
    //                          EVENT LISTENERS
    // Watch for changes and update the controls
    /////////////////////////////////////////////////////////////////////

    SetDisplay: function (idName, setting) {
        try {
            if (setting === true) {
                $('#caap_' + idName).css('display', 'block');
            } else {
                $('#caap_' + idName).css('display', 'none');
            }

            return true;
        } catch (e) {
            gm.log("ERROR in SetDisplay: " + e);
            return false;
        }
    },

    CheckBoxListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            gm.log("Change: setting '" + idName + "' to " + e.target.checked);
            gm.setValue(idName, e.target.checked);
            if (e.target.className) {
                caap.SetDisplay(e.target.className, e.target.checked);
            }

            switch (idName) {
            case "AutoStatAdv" :
                //gm.log("AutoStatAdv");
                if (e.target.checked) {
                    caap.SetDisplay('Status_Normal', false);
                    caap.SetDisplay('Status_Adv', true);
                } else {
                    caap.SetDisplay('Status_Normal', true);
                    caap.SetDisplay('Status_Adv', false);
                }

                caap.statsMatch = true;
                break;
            case "HideAds" :
                //gm.log("HideAds");
                if (e.target.checked) {
                    $('.UIStandardFrame_SidebarAds').css('display', 'none');
                } else {
                    $('.UIStandardFrame_SidebarAds').css('display', 'block');
                }

                break;
            case "BannerDisplay" :
                //gm.log("HideAds");
                if (e.target.checked) {
                    $('#caap_BannerHide').css('display', 'block');
                } else {
                    $('#caap_BannerHide').css('display', 'none');
                }

                break;
            case "IgnoreBattleLoss" :
                //gm.log("IgnoreBattleLoss");
                if (e.target.checked) {
                    gm.log("Ignore Battle Losses has been enabled.");
                    gm.deleteValue("BattlesLostList");
                    gm.log("Battle Lost List has been cleared.");
                }

                break;
            case "SetTitle" :
                //gm.log("SetTitle");
            case "SetTitleAction" :
                //gm.log("SetTitleAction");
            case "SetTitleName" :
                //gm.log("SetTitleName");
                if (e.target.checked) {
                    var DocumentTitle = '';
                    if (gm.getValue('SetTitleAction', false)) {
                        var d = $('#caap_activity_mess').html();
                        if (d) {
                            DocumentTitle += d.replace("Activity: ", '') + " - ";
                        }
                    }

                    if (gm.getValue('SetTitleName', false)) {
                        DocumentTitle += gm.getValue('PlayerName', 'CAAP') + " - ";
                    }

                    document.title = DocumentTitle + global.documentTitle;
                } else {
                    document.title = global.documentTitle;
                }

                break;
            case "unlockMenu" :
                //gm.log("unlockMenu");
                if (e.target.checked) {
                    $(":input[id^='caap_']").attr({disabled: true});
                    caap.caapDivObject.css('cursor', 'move').draggable({
                        stop: function () {
                            caap.SaveControlXY();
                        }
                    });

                    caap.caapTopObject.css('cursor', 'move').draggable({
                        stop: function () {
                            caap.SaveDashboardXY();
                        }
                    });
                } else {
                    caap.caapDivObject.css('cursor', '').draggable("destroy");
                    caap.caapTopObject.css('cursor', '').draggable("destroy");
                    $(":input[id^='caap_']").attr({disabled: false});
                }

                break;
            case "AutoElite" :
                gm.deleteValue('AutoEliteGetList');
                gm.deleteValue('AutoEliteReqNext');
                gm.deleteValue('AutoEliteEnd');
                gm.deleteValue('MyEliteTodo');
                if (!gm.getValue('FillArmy', false)) {
                    gm.deleteValue(caap.friendListType.giftc.name + 'Requested');
                    gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                }

                break;
            case "AutoPotions" :
                gm.deleteValue('AutoPotionTimer');
                break;
            default :
            }

            return true;
        } catch (err) {
            gm.log("ERROR in CheckBoxListener: " + e);
            return false;
        }
    },

    TextBoxListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            var value = e.target.value;
            gm.log('Change: setting "' + idName + '" to "' + e.target.value + '"');

            if (/Style+/.test(idName)) {
                switch (idName) {
                case "StyleBackgroundLight" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    gm.setValue("CustStyleBackgroundLight", e.target.value);
                    break;
                case "StyleBackgroundDark" :
                    if (e.target.value.substr(0, 1) !== '#') {
                        e.target.value = '#' + e.target.value;
                    }

                    gm.setValue("CustStyleBackgroundDark", e.target.value);
                    break;
                case "StyleOpacityLight" :
                    gm.setValue("CustStyleOpacityLight", e.target.value);
                    break;
                case "StyleOpacityDark" :
                    gm.setValue("CustStyleOpacityDark", e.target.value);
                    break;
                default :
                }
            } else if (/AttrValue+/.test(idName)) {
                caap.statsMatch = true;
            } else if (/energyPotions+/.test(idName) || /staminaPotions+/.test(idName)) {
                gm.deleteValue('AutoPotionTimer');
            }

            gm.setValue(idName, e.target.value);
            return true;
        } catch (err) {
            gm.log("ERROR in TextBoxListener: " + e);
            return false;
        }
    },

    DropBoxListener: function (e) {
        try {
            if (e.target.selectedIndex > 0) {
                var idName = e.target.id.replace(/caap_/i, '');
                var value = e.target.options[e.target.selectedIndex].value;
                var title = e.target.options[e.target.selectedIndex].title;
                gm.log('Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                gm.setValue(idName, value);
                e.target.title = title;
                //caap.SelectDropOption(idName, value);
                if (idName == 'WhenQuest' || idName == 'WhenBattle' || idName == 'WhenMonster' || idName == 'LevelUpGeneral') {
                    caap.SetDisplay(idName + 'Hide', (value != 'Never'));
                    if (idName == 'WhenBattle' || idName == 'WhenMonster') {
                        caap.SetDisplay(idName + 'XStamina', (value == 'At X Stamina'));
                        caap.SetDisplay('WhenBattleStayHidden1', ((gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('WhenMonster', false) != 'Stay Hidden')));
                    }

                    if (idName == 'WhenBattle') {
                        caap.SetDisplay('WhenBattleStayHidden2', ((gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('TargetType', false) == 'Arena' && gm.getValue('ArenaHide', false) == 'None')));
                    }

                    if (idName == 'WhenQuest') {
                        caap.SetDisplay(idName + 'XEnergy', (value == 'At X Energy'));
                    }
                } else if (idName == 'QuestArea' || idName == 'QuestSubArea' || idName == 'WhyQuest') {
                    gm.setValue('AutoQuest', '');
                    caap.ClearAutoQuest();
                    if (idName == 'QuestArea') {
                        switch (value) {
                        case "Quest" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                            break;
                        case "Demi Quests" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                            break;
                        case "Atlantis" :
                            $("#trQuestSubArea").css('display', 'table-row');
                            caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                            break;
                        default :
                        }
                    }
                } else if (idName == 'IdleGeneral') {
                    gm.setValue('MaxIdleEnergy', 0);
                    gm.setValue('MaxIdleStamina', 0);
                } else if (idName == 'ArenaHide') {
                    caap.SetDisplay('ArenaHSub', (value != 'None'));
                    caap.SetDisplay('WhenBattleStayHidden2', ((gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('TargetType', false) == 'Arena' && gm.getValue('ArenaHide', false) == 'None')));
                } else if (idName == 'TargetType') {
                    caap.SetDisplay('WhenBattleStayHidden2', ((gm.getValue('WhenBattle', false) == 'Stay Hidden' && gm.getValue('TargetType', false) == 'Arena' && gm.getValue('ArenaHide', false) == 'None')));
                    switch (value) {
                    case "Freshmeat" :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', false);
                        caap.SetDisplay('ArenaSub', false);
                        break;
                    case "Userid List" :
                        caap.SetDisplay('FreshmeatSub', false);
                        caap.SetDisplay('UserIdsSub', true);
                        caap.SetDisplay('RaidSub', false);
                        caap.SetDisplay('ArenaSub', false);
                        break;
                    case "Raid" :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', true);
                        caap.SetDisplay('ArenaSub', false);
                        break;
                    case "Arena" :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', false);
                        caap.SetDisplay('ArenaSub', true);
                        break;
                    default :
                        caap.SetDisplay('FreshmeatSub', true);
                        caap.SetDisplay('UserIdsSub', false);
                        caap.SetDisplay('RaidSub', false);
                        caap.SetDisplay('ArenaSub', false);
                    }
                } else if (/Attribute?/.test(idName)) {
                    gm.setValue("SkillPointsNeed", 1);
                    caap.statsMatch = true;
                } else if (idName == 'DisplayStyle') {
                    caap.SetDisplay(idName + 'Hide', (value == 'Custom'));
                    switch (value) {
                    case "CA Skin" :
                        gm.setValue("StyleBackgroundLight", "#E0C691");
                        gm.setValue("StyleBackgroundDark", "#B09060");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                        break;
                    case "None" :
                        gm.setValue("StyleBackgroundLight", "white");
                        gm.setValue("StyleBackgroundDark", "white");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                        break;
                    case "Custom" :
                        gm.setValue("StyleBackgroundLight", gm.getValue("CustStyleBackgroundLight", "#E0C691"));
                        gm.setValue("StyleBackgroundDark", gm.getValue("CustStyleBackgroundDark", "#B09060"));
                        gm.setValue("StyleOpacityLight", gm.getValue("CustStyleOpacityLight", "1"));
                        gm.setValue("StyleOpacityDark", gm.getValue("CustStyleOpacityDark", "1"));
                        break;
                    default :
                        gm.setValue("StyleBackgroundLight", "#efe");
                        gm.setValue("StyleBackgroundDark", "#fee");
                        gm.setValue("StyleOpacityLight", "1");
                        gm.setValue("StyleOpacityDark", "1");
                    }

                    caap.caapDivObject.css({
                        background: gm.getValue('StyleBackgroundDark', '#fee'),
                        opacity: gm.getValue('StyleOpacityDark', '1')
                    });

                    caap.caapTopObject.css({
                        background: gm.getValue('StyleBackgroundDark', '#fee'),
                        opacity: gm.getValue('StyleOpacityDark', '1')
                    });
                }
            }

            return true;
        } catch (err) {
            gm.log("ERROR in DropBoxListener: " + e);
            return false;
        }
    },

    TextAreaListener: function (e) {
        try {
            var idName = e.target.id.replace(/caap_/i, '');
            var value = e.target.value;
            gm.log('Change: setting "' + idName + '" to "' + value + '"');
            if (idName == 'orderbattle_monster' || idName == 'orderraid') {
                gm.setValue('monsterReview', 0);
                gm.setValue('monsterReviewCounter', -3);
                gm.setValue('monsterReview', 0);
                gm.setValue('monsterReviewCounter', -3);
            }

            caap.SaveBoxText(idName);
            return true;
        } catch (err) {
            gm.log("ERROR in TextAreaListener: " + e);
            return false;
        }
    },

    PauseListener: function (e) {
        $('#caap_div').css({
            'background': gm.getValue('StyleBackgroundDark', '#fee'),
            'opacity': '1',
            'z-index': '3'
        });

        $('#caap_top').css({
            'background': gm.getValue('StyleBackgroundDark', '#fee'),
            'opacity': '1'
        });

        $('#caapPaused').css('display', 'block');
        if (global.is_chrome) {
            CE_message("paused", null, 'block');
        }

        gm.setValue('caapPause', 'block');
    },

    RestartListener: function (e) {
        $('#caapPaused').css('display', 'none');
        $('#caap_div').css({
            'background': gm.getValue('StyleBackgroundLight', '#efe'),
            'opacity': gm.getValue('StyleOpacityLight', '1'),
            'z-index': gm.getValue('caap_div_zIndex', '2'),
            'cursor': ''
        });

        $('#caap_top').css({
            'background': gm.getValue('StyleBackgroundLight', '#efe'),
            'opacity': gm.getValue('StyleOpacityLight', '1'),
            'z-index': gm.getValue('caap_top_zIndex', '1'),
            'cursor': ''
        });

        $(":input[id*='caap_']").attr({disabled: false});
        $('#unlockMenu').attr('checked', false);

        gm.setValue('caapPause', 'none');
        if (global.is_chrome) {
            CE_message("paused", null, gm.getValue('caapPause', 'none'));
        }

        gm.setValue('ReleaseControl', true);
        gm.setValue('resetselectMonster', true);
        caap.waitingForDomLoad = false;
    },

    ResetMenuLocationListener: function (e) {
        gm.deleteValue('caap_div_menuLeft');
        gm.deleteValue('caap_div_menuTop');
        gm.deleteValue('caap_div_zIndex');
        caap.controlXY.x = '';
        caap.controlXY.y = $(caap.controlXY.selector).offset().top;
        var caap_divXY = caap.GetControlXY(true);
        caap.caapDivObject.css({
            'cursor' : '',
            'z-index' : '2',
            'top' : caap_divXY.y + 'px',
            'left' : caap_divXY.x + 'px'
        });

        gm.deleteValue('caap_top_menuLeft');
        gm.deleteValue('caap_top_menuTop');
        gm.deleteValue('caap_top_zIndex');
        caap.dashboardXY.x = '';
        caap.dashboardXY.y = $(caap.dashboardXY.selector).offset().top - 10;
        var caap_topXY = caap.GetDashboardXY(true);
        caap.caapTopObject.css({
            'cursor' : '',
            'z-index' : '1',
            'top' : caap_topXY.y + 'px',
            'left' : caap_topXY.x + 'px'
        });

        $(":input[id^='caap_']").attr({disabled: false});
    },

    FoldingBlockListener: function (e) {
        try {
            var subId = e.target.id.replace(/_Switch/i, '');
            var subDiv = document.getElementById(subId);
            if (subDiv.style.display == "block") {
                gm.log('Folding: ' + subId);
                subDiv.style.display = "none";
                e.target.innerHTML = e.target.innerHTML.replace(/-/, '+');
                gm.setValue('Control_' + subId.replace(/caap_/i, ''), "none");
            } else {
                gm.log('Unfolding: ' + subId);
                subDiv.style.display = "block";
                e.target.innerHTML = e.target.innerHTML.replace(/\+/, '-');
                gm.setValue('Control_' + subId.replace(/caap_/i, ''), "block");
            }

            return true;
        } catch (err) {
            gm.log("ERROR in FoldingBlockListener: " + e);
            return false;
        }
    },

    whatClickedURLListener: function (event) {
        var obj = event.target;
        while (obj && !obj.href) {
            obj = obj.parentNode;
        }

        if (obj && obj.href) {
            gm.setValue('clickUrl', obj.href);
        }

        //gm.log('globalContainer: ' + obj.href);
    },

    windowResizeListener: function (e) {
        if (window.location.href.indexOf('castle_age')) {
            var caap_divXY = caap.GetControlXY();
            caap.caapDivObject.css('left', caap_divXY.x + 'px');
            var caap_topXY = caap.GetDashboardXY();
            caap.caapTopObject.css('left', caap_topXY.x + 'px');
        }
    },

    AddListeners: function () {
        try {
            gm.log("Adding listeners for caap_div");
            if ($('#caap_div').length === 0) {
                throw "Unable to find div for caap_div";
            }

            $('#caap_div input:checkbox[id^="caap_"]').change(this.CheckBoxListener);
            $('#caap_div input:text[id^="caap_"]').change(this.TextBoxListener);
            $('#unlockMenu').change(this.CheckBoxListener);
            $('#caap_div select[id^="caap_"]').change(this.DropBoxListener);
            $('#caap_div textarea[id^="caap_"]').change(this.TextAreaListener);
            $('#caap_div a[id^="caap_Switch"]').click(this.FoldingBlockListener);
            $('#caap_FillArmy').click(function (e) {
                gm.setValue("FillArmy", true);
                gm.deleteValue("ArmyCount");
                gm.deleteValue('FillArmyList');
                gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                gm.deleteValue(caap.friendListType.facebook.name + 'Responded');

            });

            $('#caap_StartedColorSelect').click(function (e) {
                var display = 'none';
                if ($('#caap_ColorSelectorDiv1').css('display') == 'none') {
                    display = 'block';
                }

                $('#caap_ColorSelectorDiv1').css('display', display);
            });

            $('#caap_StopedColorSelect').click(function (e) {
                var display = 'none';
                if ($('#caap_ColorSelectorDiv2').css('display') == 'none') {
                    display = 'block';
                }

                $('#caap_ColorSelectorDiv2').css('display', display);
            });

            $('#caap_ResetMenuLocation').click(this.ResetMenuLocationListener);
            $('#caap_resetElite').click(function (e) {
				Elite.runtime.waitelite = 0;
				gm.log(' elite run ' + Elite.runtime.waitelite);
                if (!gm.getValue('FillArmy', false)) {
                    gm.deleteValue(caap.friendListType.giftc.name + 'Requested');
                    gm.deleteValue(caap.friendListType.giftc.name + 'Responded');
                }
            });

            $('#caapRestart').click(this.RestartListener);
            $('#caap_control').mousedown(this.PauseListener);
            if (global.is_chrome) {
                $('#caap_control').mousedown(this.PauseListener);
            }

            $('#stopAutoQuest').click(function (e) {
                gm.setValue('AutoQuest', '');
                gm.setValue('WhyQuest', 'Manual');
                gm.log('Change: setting stopAutoQuest and go to Manual');
                caap.ManualAutoQuest();
            });

            if ($('#app46755028429_globalContainer').length === 0) {
                throw 'Global Container not found';
            }

            // Fires when CAAP navigates to new location
            $('#app46755028429_globalContainer').find('a').bind('click', this.whatClickedURLListener);

            $('#app46755028429_globalContainer').bind('DOMNodeInserted', function (event) {
                // Uncomment this to see the id of domNodes that are inserted
                /*
                if (event.target.id) {
                    caap.SetDivContent('debug2_mess', event.target.id.replace('app46755028429_', ''));
                    //alert(event.target.id);
                }
                */

                var $target = $(event.target);
                if ($target.is("#app46755028429_app_body") ||
                    $target.is("#app46755028429_index") ||
                    $target.is("#app46755028429_keep") ||
                    $target.is("#app46755028429_generals") ||
                    $target.is("#app46755028429_battle_monster") ||
                    $target.is("#app46755028429_battle") ||
                    $target.is("#app46755028429_battlerank") ||
                    $target.is("#app46755028429_battle_train") ||
                    $target.is("#app46755028429_arena") ||
                    $target.is("#app46755028429_quests") ||
                    $target.is("#app46755028429_raid") ||
                    $target.is("#app46755028429_symbolquests") ||
                    $target.is("#app46755028429_alchemy") ||
                    $target.is("#app46755028429_soldiers") ||
                    $target.is("#app46755028429_item") ||
                    $target.is("#app46755028429_land") ||
                    $target.is("#app46755028429_magic") ||
                    $target.is("#app46755028429_oracle") ||
                    $target.is("#app46755028429_symbols") ||
                    $target.is("#app46755028429_treasure_chest") ||
                    $target.is("#app46755028429_gift") ||
                    $target.is("#app46755028429_apprentice") ||
                    $target.is("#app46755028429_news") ||
                    $target.is("#app46755028429_friend_page") ||
                    $target.is("#app46755028429_comments") ||
                    $target.is("#app46755028429_army") ||
                    $target.is("#app46755028429_army_news_feed") ||
                    $target.is("#app46755028429_army_reqs")) {

                    caap.waitingForDomLoad = false;

                    //gm.log("Refreshing DOM Listeners");
                    $('#app46755028429_globalContainer').find('a').unbind('click', caap.whatClickedURLListener);
                    $('#app46755028429_globalContainer').find('a').bind('click', caap.whatClickedURLListener);


                    caap.node_trigger = window.setTimeout(function () {
                        caap.node_trigger = null;
                        caap.CheckResults();
                    }, 100);

                    //nHtml.setTimeout(caap.CheckResults, 0);
                }

                // Reposition the dashboard
                if ($target.is(caap.dashboardXY.selector)) {
                    var caap_topXY = caap.GetDashboardXY();
                    caap.caapTopObject.css('left', caap_topXY.x + 'px');
                }
            });

            $(window).unbind('resize', this.windowResizeListener);
            $(window).bind('resize', this.windowResizeListener);

            /*-------------------------------------------------------------------------------------\
            We add our listener for the Display Select control.
            \-------------------------------------------------------------------------------------*/
            this.AddDBListener();
            //gm.log("Listeners added for CAAP");
            return true;
        } catch (e) {
            gm.log("ERROR in AddListeners: " + e);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          GET STATS
    // Functions that records all of base game stats, energy, stamina, etc.
    /////////////////////////////////////////////////////////////////////

    // Can now accept a 'node' or text in the formay '123/234'
    GetStatusNumbers: function (node) {
        try {
            if (!node) {
                throw 'No "node" supplied';
            }

            var txtArr = null;
            var num = null;
            var max = null;
            var dif = null;

            if (typeof node != 'string') {
                var txt = nHtml.GetText(node);
                if (!txt) {
                    throw 'No text found';
                }

                txtArr = this.statusRe.exec(txt);
                if (!txtArr) {
                    throw 'Cannot find status:' + txt;
                }

                num = parseInt(txtArr[1], 10);
                max = parseInt(txtArr[2], 10);
                dif = parseInt(txtArr[2], 10) - parseInt(txtArr[1], 10);
            } else {
                txtArr = node.split('/');
                if (txtArr.length !== 2) {
                    throw 'String did not split into 2 parts';
                }

                num = parseInt(txtArr[0], 10);
                max = parseInt(txtArr[1], 10);
                dif = parseInt(txtArr[1], 10) - parseInt(txtArr[0], 10);
            }

            return {
                'num': num,
                'max': max,
                'dif': dif
            };
        } catch (e) {
            gm.log("ERROR in GetStatusNumbers: " + e);
            return {
                'num': 0,
                'max': 0,
                'dif': 0
            };
        }
    },

    GetStats: function () {
        try {
            this.stats = {};
            if (!global.is_firefox) {
                if (document.getElementById('app46755028429_healForm')) {
                    // Facebook ID
                    var webSlice = nHtml.FindByAttrContains(document.body, "a", "href", "party.php");
                    if (webSlice) {
                        var fbidm = this.userRe.exec(webSlice.getAttribute('href'));
                        if (fbidm) {
                            var txtFBID = fbidm[2];
                            gm.setValue('FBID', txtFBID);
                        }
                    }
                }
            }

            // rank
            var attrDiv = nHtml.FindByAttrContains(document.body, "div", "class", 'keep_stat_title');
            if (attrDiv) {
                var txtRank = nHtml.GetText(attrDiv);
                var rankm = this.rankRe.exec(txtRank);
                if (rankm) {
                    var rank = this.rankTable[$.trim(rankm[1].toString().toLowerCase())];
                    if (rank !== undefined) {
                        this.stats.rank = rank;
                        gm.setValue('MyRank', this.stats.rank);
                        this.JustDidIt('MyRankLast');
                    } else {
                        gm.log("Unknown rank " + rank + ':' + rankm[1].toString());
                    }
                }

                var userName = txtRank.match(new RegExp("\"(.+)\""));
                gm.setValue('PlayerName', userName[1]);
            }

            // health
            var health = nHtml.FindByAttrContains(document.body, "span", "id", '_current_health');
            var healthMess = '';
            if (!health) {
                health = nHtml.FindByAttrXPath(document.body, 'span', "contains(@id,'_health') and not(contains(@id,'health_time'))");
            }

            this.stats.health = this.GetStatusNumbers(health.parentNode);
            if (this.stats.health) {
                healthMess = "Health: " + this.stats.health.num;
            }

            // stamina
            this.stats.stamina = null;
            var stamina = nHtml.FindByAttrContains(document.body, "span", "id", '_current_stamina');
            var staminaMess = '';
            if (!stamina) {
                stamina = nHtml.FindByAttrXPath(document.body, 'span', "contains(@id,'_stamina') and not(contains(@id,'stamina_time'))");
            }

            this.stats.stamina = this.GetStatusNumbers(stamina.parentNode);

            // energy
            var energyMess = '';
            var energy = nHtml.FindByAttrContains(document.body, "span", "id", '_current_energy');
            if (!energy) {
                energy = nHtml.FindByAttrXPath(document.body, 'span', "contains(@id,'_energy') and not(contains(@id,'energy_time'))");
            }

            this.stats.energy = this.GetStatusNumbers(energy.parentNode);

            // level
            var level = nHtml.FindByAttrContains(document.body, "div", "title", 'experience points');
            var levelMess = '';
            var txtlevel = nHtml.GetText(level);
            var levelm = this.levelRe.exec(txtlevel);
            if (levelm) {
                this.stats.level = parseInt(levelm[1], 10);
                levelMess = "Level: " + this.stats.level;
                if (gm.getValue('Level', 0) != this.stats.level) {
                    gm.deleteValue('BestLandCost');
                }

                gm.setValue('Level', this.stats.level);
            } else {
                gm.log('Could not find level re');
            }

            this.stats.rank = parseInt(gm.getValue('MyRank'), 10);

            // army
            var td = nHtml.FindByAttrContains(document.body, "div", "id", "main_bntp");
            var a = nHtml.FindByAttrContains(td, "a", "href", "army");
            var txtArmy = nHtml.GetText(a);
            var armym = this.armyRe.exec(txtArmy);
            if (armym) {
                var army = parseInt(armym[1], 10);
                army = Math.min(army, 501);
                this.stats.army = army;
                var armyMess = "Army: " + this.stats.army;
            } else {
                gm.log("Can't find armyRe in " + txtArmy);
            }

            // gold
            var cashObj = nHtml.FindByAttrXPath(document.body, "strong", "contains(string(),'$')");
            var cashTxt = nHtml.GetText(cashObj);
            var cash = this.NumberOnly(cashTxt);
            this.stats.cash = cash;

            // time to next level
			this.stats.exp = {};
			this.stats.exp.dif = Player.get('exp_needed');
            var expPerStamina = 2.4;
            var expPerEnergy = parseFloat(gm.getObjVal('AutoQuest', 'expRatio')) || 1.4;
			var minutesToLevel = (Player.get('exp_needed') - this.stats.stamina.num * expPerStamina - this.stats.energy.num * expPerEnergy) / (expPerStamina + expPerEnergy) / 12 * 60;
            this.stats.levelTime = new Date();
            var minutes = this.stats.levelTime.getMinutes();
            minutes += minutesToLevel;
            this.stats.levelTime.setMinutes(minutes);
            this.SetDivContent('level_mess', 'Expected next level: ' + this.FormatTime(this.stats.levelTime));

            if (this.DisplayTimer('DemiPointTimer')) {
                if (this.CheckTimer('DemiPointTimer')) {
                    this.SetDivContent('demipoint_mess', 'Battle demipoints cleared');
                } else {
                    this.SetDivContent('demipoint_mess', 'Next Battle DemiPts: ' + this.DisplayTimer('DemiPointTimer'));
                }
            }

            if (this.DisplayTimer('ArenaRankTimer')) {
                if (this.CheckTimer('ArenaRankTimer')) {
                    this.SetDivContent('arena_mess', '');
                } else {
                    this.SetDivContent('arena_mess', 'Next Arena Rank Check: ' + this.DisplayTimer('ArenaRankTimer'));
                }
            }

            // time to next paycheck
            var paytime = nHtml.FindByAttrContains(document.body, "span", "id", '_gold_time_value');
            if (paytime) {
                this.stats.paytime = $.trim(nHtml.GetText(paytime));
                this.stats.payminute = this.stats.paytime.substr(0, this.stats.paytime.indexOf(':'));
            }

            // return true if probably working
            return cashObj && (health !== null);
        } catch (e) {
            gm.log("ERROR GetStats: " + e);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          CHECK RESULTS
    // Called each iteration of main loop, this does passive checks for
    // results to update other functions.
    /////////////////////////////////////////////////////////////////////

    SetCheckResultsFunction: function (resultsFunction) {
        this.JustDidIt('SetResultsFunctionTimer');
        gm.setValue('ResultsFunction', resultsFunction);
    },

    pageList: {
        'index': {
            signaturePic: 'gif',
            CheckResultsFunction: 'CheckResults_index'
        },
        'battle_monster': {
            signaturePic: 'tab_monster_on.jpg',
            CheckResultsFunction: 'CheckResults_fightList',
            subpages: ['onMonster']
        },
        'onMonster': {
            signaturePic: 'tab_monster_active.jpg',
            CheckResultsFunction: 'CheckResults_viewFight'
        },
        'raid': {
            signaturePic: 'tab_raid_on.gif',
            CheckResultsFunction: 'CheckResults_fightList',
            subpages: ['onRaid']
        },
        'onRaid': {
            signaturePic: 'raid_back.jpg',
            CheckResultsFunction : 'CheckResults_viewFight'
        },
        'arena': {
            signaturePic: 'tab_arena_on.gif',
            CheckResultsFunction : 'CheckBattleResults'
        },
        'land': {
            signaturePic: 'tab_land_on.gif',
            CheckResultsFunction: 'CheckResults_land'
        },
        'generals': {
            signaturePic: 'tab_generals_on.gif',
            CheckResultsFunction: 'CheckResults_generals'
        },
        'quests': {
            signaturePic: 'tab_quest_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'symbolquests': {
            signaturePic: 'demi_quest_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'monster_quests': {
            signaturePic: 'tab_atlantis_on.gif',
            CheckResultsFunction: 'CheckResults_quests'
        },
        'gift_accept': {
            signaturePic: 'gif',
            CheckResultsFunction: 'CheckResults_gift_accept'
        },
        'army': {
            signaturePic: 'invite_on.gif',
            CheckResultsFunction: 'CheckResults_army'
        }
        /*
        ,
        'keep': {
            signaturePic: 'tab_stats_on.gif',
            CheckResultsFunction: 'CheckResults_keep'
        }
        */
    },

    trackPerformance: false,

    performanceTimer: function (marker) {
        if (!this.trackPerformance) {
            return;
        }

        var now = (new Date().getTime());
        var elapsedTime = now - parseInt(gm.getValue('performanceTimer', 0), 10);
        gm.log('Performance Timer At ' + marker + ' Time elapsed: ' + elapsedTime);
        gm.setValue('performanceTimer', now.toString());
    },

    CheckResults: function () {
        try {
            // Check page to see if we should go to a page specific check function
            // todo find a way to verify if a function exists, and replace the array with a check_functionName exists check
            if (!this.WhileSinceDidIt('CheckResultsTimer', 1)) {
                return;
            }

            this.performanceTimer('Start CheckResults');
            this.JustDidIt('CheckResultsTimer');
            gm.setValue('page', '');
            var pageUrl = gm.getValue('clickUrl');
            //gm.log("Page url: " + pageUrl);
            var page = 'None';
            if (pageUrl.match(new RegExp("\/[^\/]+.php", "i"))) {
                page = pageUrl.match(new RegExp("\/[^\/]+.php", "i"))[0].replace('/', '').replace('.php', '');
                //gm.log("Page match: " + page);
            }

            if (this.pageList[page]) {
                if (this.CheckForImage(this.pageList[page].signaturePic)) {
                    page = gm.setValue('page', page);
                    //gm.log("Page set value: " + page);
                }

                if (this.pageList[page].subpages) {
                    this.pageList[page].subpages.forEach(function (subpage) {
                        if (caap.CheckForImage(caap.pageList[subpage].signaturePic)) {
                            page = gm.setValue('page', subpage);
                            //gm.log("Page pubpage: " + page);
                        }
                    });
                }
            }

            var resultsDiv = nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body');
            var resultsText = '';
            if (resultsDiv) {
                resultsText = $.trim(nHtml.GetText(resultsDiv));
            }

            if (gm.getValue('page', '')) {
                gm.log('Checking results for ' + page);
                if (typeof this[this.pageList[page].CheckResultsFunction] == 'function') {
                    this[this.pageList[page].CheckResultsFunction](resultsText);
                } else {
                    gm.log('Check Results function not found: ' + this[this.pageList[page].CheckResultsFunction]);
                }
            } else {
                gm.log('No results check defined for ' + page);
            }

            if (!this.stats.stamina) {
                this.GetStats();
            }

            this.performanceTimer('Before selectMonster');
            this.selectMonster();
            this.performanceTimer('Done selectMonster');
            this.UpdateDashboard();
            this.performanceTimer('Done Dashboard');

            // Check for new gifts
            if (!gm.getValue('HaveGift')) {
                if (nHtml.FindByAttrContains(document.body, 'a', 'href', 'reqs.php#confirm_')) {
                    gm.log('We have a gift waiting!');
                    gm.setValue('HaveGift', true);
                } else {
                    var beepDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'UIBeep_Title');
                    if (beepDiv) {
                        var beepText = $.trim(nHtml.GetText(beepDiv));
                        if (beepText.match(/sent you a gift/) && !beepText.match(/notification/)) {
                            gm.log('We have a gift waiting');
                            gm.setValue('HaveGift', true);
                        }
                    }
                }
            }

            if (!this.stats.level) {
                this.GetStats();
            }

            if (this.stats.level < 10) {
                this.battlePage = 'battle_train,battle_off';
            } else {
                this.battlePage = 'battle';
            }

            // Check for Elite Guard Add image
            if (!gm.getValue('AutoEliteIgnore', false)) {
                if (this.CheckForImage('elite_guard_add') && gm.getValue('AutoEliteEnd', 'NoArmy') != 'NoArmy') {
                    Elite.runtime.waitelite = 0;
                }
            }

            // Check for Gold Stored
            var keepDiv = nHtml.FindByAttrContains(document.body, "div", "class", 'statsTB');
            if (keepDiv) {
                var moneyElem = nHtml.FindByAttrContains(keepDiv, "b", "class", 'money');
                if (moneyElem) {
                    var goldStored = this.NumberOnly(moneyElem.firstChild.data);
                    if (goldStored >= 0) {
                        gm.setValue('inStore', goldStored);
                        //gm.log("Keep: Checked the gold in store: " + gm.getValue('inStore'));
                    }
                }
            }

            // If set and still recent, go to the function specified in 'ResultsFunction'
            var resultsFunction = gm.getValue('ResultsFunction', '');
            if ((resultsFunction) && !this.WhileSinceDidIt('SetResultsFunctionTimer', 20)) {
                this[resultsFunction](resultsText);
            }

            this.performanceTimer('Done CheckResults');
        } catch (err) {
            gm.log("ERROR in CheckResults: " + err);
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          QUESTING
    // Quest function does action, DrawQuest sets up the page and gathers info
    /////////////////////////////////////////////////////////////////////

    MaxEnergyQuest: function () {
        if (!gm.getValue('MaxIdleEnergy', 0)) {
            gm.log("Changing to idle general to get Max energy");
            return this.PassiveGeneral();
        }

        if (this.stats.energy.num >= gm.getValue('MaxIdleEnergy')) {
            return this.Quests();
        }

        return false;
    },

    baseQuestTable : {
        'Land of Fire'      : 'land_fire',
        'Land of Earth'     : 'land_earth',
        'Land of Mist'      : 'land_mist',
        'Land of Water'     : 'land_water',
        'Demon Realm'       : 'land_demon_realm',
        'Undead Realm'      : 'land_undead_realm',
        'Underworld'        : 'tab_underworld',
        'Kingdom of Heaven' : 'tab_heaven'
    },

    demiQuestTable : {
        'Ambrosia'    : 'energy',
        'Malekus'     : 'attack',
        'Corvintheus' : 'defense',
        'Aurora'      : 'health',
        'Azeron'      : 'stamina'
    },

    Quests: function () {
        try {
            if (gm.getValue('storeRetrieve', '') !== '') {
                if (gm.getValue('storeRetrieve') == 'general') {
                    if (this.SelectGeneral('BuyGeneral')) {
                        return true;
                    }

                    gm.setValue('storeRetrieve', '');
                    return true;
                } else {
                    return this.RetrieveFromBank(gm.getValue('storeRetrieve', ''));
                }
            }

            this.SetDivContent('quest_mess', '');
            if (gm.getValue('WhenQuest', '') == 'Never') {
                this.SetDivContent('quest_mess', 'Questing off');
                return false;
            }

            if (gm.getValue('WhenQuest', '') == 'Not Fortifying') {
                var maxHealthtoQuest = gm.getNumber('MaxHealthtoQuest', 0);
                if (!maxHealthtoQuest) {
                    this.SetDivContent('quest_mess', '<b>No valid over fortify %</b>');
                    return false;
                }

                var fortMon = gm.getValue('targetFromfortify', '');
                if (fortMon) {
                    this.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon + " health exceeds " + gm.getNumber('MaxToFortify', 0) + '%');
                    return false;
                }

                var targetFrombattle_monster = gm.getValue('targetFrombattle_monster', '');
                if (!targetFrombattle_monster) {
                    var targetFort = gm.getListObjVal('monsterOl', targetFrombattle_monster, 'ShipHealth');
                    if (!targetFort) {
                        if (targetFort < maxHealthtoQuest) {
                            this.SetDivContent('quest_mess', 'No questing until fortify target ' + targetFrombattle_monster + ' health exceeds ' + maxHealthtoQuest + '%');
                            return false;
                        }
                    }
                }
            }

            if (!gm.getObjVal('AutoQuest', 'name')) {
                if (gm.getValue('WhyQuest', '') == 'Manual') {
                    this.SetDivContent('quest_mess', 'Pick quest manually.');
                    return false;
                }

                this.SetDivContent('quest_mess', 'Searching for quest.');
                gm.log("Searching for quest");
            } else {
                var energyCheck = this.CheckEnergy(gm.getObjVal('AutoQuest', 'energy'), gm.getValue('WhenQuest', 'Never'), 'quest_mess');
                if (!energyCheck) {
                    return false;
                }
            }

            if (gm.getObjVal('AutoQuest', 'general') == 'none' || gm.getValue('ForceSubGeneral')) {
                if (this.SelectGeneral('SubQuestGeneral')) {
                    return true;
                }
            }

            if (gm.getValue('LevelUpGeneral', 'Use Current') != 'Use Current' &&
                gm.getValue('QuestLevelUpGeneral', false) &&
                this.stats.exp.dif &&
                this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                if (this.SelectGeneral('LevelUpGeneral')) {
                    return true;
                }

                gm.log('Using level up general');
            }

            switch (gm.getValue('QuestArea', 'Quest')) {
            case 'Quest' :
                //var stageSet0 = $("#app46755028429_stage_set_0").css("display") == 'block' ? true : false;
                //var stageSet1 = $("#app46755028429_stage_set_1").css("display") == 'block' ? true : false;
                var subQArea = gm.getValue('QuestSubArea', 'Land of Fire');
                var landPic = this.baseQuestTable[subQArea];
                var imgExist = false;
                if (landPic == 'tab_underworld') {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small.gif', landPic + '_big');
                } else if (landPic == 'tab_heaven') {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small2.gif', landPic + '_big2.gif');
                } else if ((landPic == 'land_demon_realm') || (landPic == 'land_undead_realm')) {
                    imgExist = this.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '.gif', landPic + '_sel');
                } else {
                    imgExist = this.NavigateTo('quests,jobs_tab_back.gif,' + landPic + '.gif', landPic + '_sel');
                }

                if (imgExist) {
                    return true;
                }

                break;
            case 'Demi Quests' :
                if (this.NavigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                    return true;
                }

                var subDQArea = gm.getValue('QuestSubArea', 'Ambrosia');
                var picSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'deity_' + this.demiQuestTable[subDQArea]);
                if (picSlice.style.height != '160px') {
                    return this.NavigateTo('deity_' + this.demiQuestTable[subDQArea]);
                }

                break;
            case 'Atlantis' :
                if (!this.CheckForImage('tab_atlantis_on.gif')) {
                    return this.NavigateTo('quests,monster_quests');
                }

                break;
            default :
                break;
            }

            var button = this.CheckForImage('quick_switch_button.gif');
            if (button && !gm.getValue('ForceSubGeneral', false)) {
                if (gm.getValue('LevelUpGeneral', 'Use Current') != 'Use Current' &&
                    gm.getValue('QuestLevelUpGeneral', false) &&
                    this.stats.exp.dif &&
                    this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    if (this.SelectGeneral('LevelUpGeneral')) {
                        return true;
                    }
                    gm.log('Using level up general');
                } else {
                    gm.log('Clicking on quick switch general button.');
                    this.Click(button);
                    return true;
                }
            }

            var costToBuy = '';
            //Buy quest requires popup
            var itemBuyPopUp = nHtml.FindByAttrContains(document.body, "form", "id", 'itemBuy');
            if (itemBuyPopUp) {
                gm.setValue('storeRetrieve', 'general');
                if (this.SelectGeneral('BuyGeneral')) {
                    return true;
                }

                gm.setValue('storeRetrieve', '');
                costToBuy = itemBuyPopUp.textContent.replace(new RegExp(".*\\$"), '').replace(new RegExp("[^0-9]{3,}.*"), '');
                gm.log("costToBuy = " + costToBuy);
                if (this.stats.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.cash + (gm.getNumber('inStore', 0) - gm.getNumber('minInStore', 0)) >= costToBuy) {
                        gm.log("Trying to retrieve: " + (costToBuy - this.stats.cash));
                        gm.setValue("storeRetrieve", costToBuy - this.stats.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.cash);
                    } else {
                        gm.setValue('AutoQuest', '');
                        gm.setValue('WhyQuest', 'Manual');
                        gm.log("Cant buy requires, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                button = this.CheckForImage('quick_buy_button.jpg');
                if (button) {
                    gm.log('Clicking on quick buy button.');
                    this.Click(button);
                    return true;
                }

                gm.log("Cant find buy button");
                return false;
            }

            button = this.CheckForImage('quick_buy_button.jpg');
            if (button) {
                gm.setValue('storeRetrieve', 'general');
                if (this.SelectGeneral('BuyGeneral')) {
                    return true;
                }

                gm.setValue('storeRetrieve', '');
                costToBuy = button.previousElementSibling.previousElementSibling.previousElementSibling
                    .previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
                    .firstChild.data.replace(new RegExp("[^0-9]", "g"), '');
                gm.log("costToBuy = " + costToBuy);
                if (this.stats.cash < costToBuy) {
                    //Retrieving from Bank
                    if (this.stats.cash + (gm.getNumber('inStore', 0) - gm.getNumber('minInStore', 0)) >= costToBuy) {
                        gm.log("Trying to retrieve: " + (costToBuy - this.stats.cash));
                        gm.setValue("storeRetrieve", costToBuy - this.stats.cash);
                        return this.RetrieveFromBank(costToBuy - this.stats.cash);
                    } else {
                        gm.setValue('AutoQuest', '');
                        gm.setValue('WhyQuest', 'Manual');
                        gm.log("Cant buy General, stopping quest");
                        this.ManualAutoQuest();
                        return false;
                    }
                }

                gm.log('Clicking on quick buy general button.');
                this.Click(button);
                return true;
            }

            var autoQuestDivs = this.CheckResults_quests(true);
            if (!gm.getObjVal('AutoQuest', 'name')) {
                gm.log('Could not find AutoQuest.');
                this.SetDivContent('quest_mess', 'Could not find AutoQuest.');
                return false;
            }

            var autoQuestName = gm.getObjVal('AutoQuest', 'name');
            if (gm.getObjVal('AutoQuest', 'name') != autoQuestName) {
                gm.log('New AutoQuest found.');
                this.SetDivContent('quest_mess', 'New AutoQuest found.');
                return true;
            }

            // if found missing requires, click to buy
            if (autoQuestDivs.tr !== undefined) {
                var background = nHtml.FindByAttrContains(autoQuestDivs.tr, "div", "style", 'background-color');
                if (background) {
                    if (background.style.backgroundColor == 'rgb(158, 11, 15)') {
                        gm.log(" background.style.backgroundColor = " + background.style.backgroundColor);
                        gm.setValue('storeRetrieve', 'general');
                        if (this.SelectGeneral('BuyGeneral')) {
                            return true;
                        }

                        gm.setValue('storeRetrieve', '');
                        if (background.firstChild.firstChild.title) {
                            gm.log("Clicking to buy " + background.firstChild.firstChild.title);
                            this.Click(background.firstChild.firstChild);
                            return true;
                        }
                    }
                }
            } else {
                gm.log('Can not buy quest item');
                return false;
            }

            var general = gm.getObjVal('AutoQuest', 'general');
            if (general == 'none' || gm.getValue('ForceSubGeneral', false)) {
                if (this.SelectGeneral('SubQuestGeneral')) {
                    return true;
                }
            } else if ((general) && general != Player.get('general')) {
                if (gm.getValue('LevelUpGeneral', 'Use Current') != 'Use Current' &&
                    gm.getValue('QuestLevelUpGeneral', false) && this.stats.exp.dif &&
                    this.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    if (this.SelectGeneral('LevelUpGeneral')) {
                        return true;
                    }

                    gm.log('Using level up general');
                } else {
                    if (autoQuestDivs.genDiv !== undefined) {
                        gm.log('Clicking on general ' + general);
                        this.Click(autoQuestDivs.genDiv);
                        return true;
                    } else {
                        gm.log('Can not click on general ' + general);
                        return false;
                    }
                }
            }

            if (autoQuestDivs.click !== undefined) {
                gm.log('Clicking auto quest: ' + autoQuestName);
                gm.setValue('ReleaseControl', true);
                this.Click(autoQuestDivs.click, 10000);
                //gm.log("Quests: " + autoQuestName + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
                this.ShowAutoQuest();
                return true;
            } else {
                gm.log('Can not click auto quest: ' + autoQuestName);
                return false;
            }
        } catch (err) {
            gm.log("ERROR in Quests: " + err);
            return false;
        }
    },

    questName: null,

    QuestManually: function () {
        gm.log("QuestManually: Setting manual quest options");
        gm.setValue('AutoQuest', '');
        gm.setValue('WhyQuest', 'Manual');
        this.ManualAutoQuest();
    },

    UpdateQuestGUI: function () {
        gm.log("UpdateQuestGUI: Setting drop down menus");
        this.SelectDropOption('QuestArea', gm.getValue('QuestArea'));
        this.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
    },

    CheckResults_quests: function (pickQuestTF) {
        try {
            var whyQuest = gm.getValue('WhyQuest', '');
            if (pickQuestTF === true && whyQuest != 'Manual') {
                gm.setValue('AutoQuest', '');
            }

            var bestReward = 0;
            var rewardRatio = 0;
            var div = document.body;
            var ss = null;
            var s = 0;
            if (this.CheckForImage('demi_quest_on.gif')) {
                ss = document.evaluate(".//div[contains(@id,'symbol_displaysymbolquest')]",
                    div, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                if (ss.snapshotLength <= 0) {
                    gm.log("Failed to find symbol_displaysymbolquest");
                }

                for (s = 0; s < ss.snapshotLength; s += 1) {
                    div = ss.snapshotItem(s);
                    if (div.style.display != 'none') {
                        break;
                    }
                }
            }

            ss = document.evaluate(".//div[contains(@class,'quests_background')]",
                div, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength <= 0) {
                gm.log("Failed to find quests_background");
                return false;
            }

            var bossList = ["Heart of Fire", "Gift of Earth", "Eye of the Storm", "A Look into the Darkness", "The Rift", "Undead Embrace", "Confrontation"];
            var haveOrb = false;
            if (nHtml.FindByAttrContains(div, 'input', 'src', 'alchemy_summon')) {
                haveOrb = true;
                if (bossList.indexOf(gm.getObjVal('AutoQuest', 'name')) >= 0 && gm.getValue('GetOrbs', false) && whyQuest != 'Manual') {
                    gm.setValue('AutoQuest', '');
                }
            }

            var autoQuestDivs = {
                'click' : undefined,
                'tr'    : undefined,
                'genDiv': undefined
            };

            for (s = 0; s < ss.snapshotLength; s += 1) {
                div = ss.snapshotItem(s);
                this.questName = this.GetQuestName(div);
                if (!this.questName) {
                    continue;
                }

                var reward = null;
                var energy = null;
                var experience = null;
                var divTxt = nHtml.GetText(div);
                var expM = this.experienceRe.exec(divTxt);
                if (expM) {
                    experience = this.NumberOnly(expM[1]);
                } else {
                    var expObj = nHtml.FindByAttr(div, 'div', 'className', 'quest_experience');
                    if (expObj) {
                        experience = (this.NumberOnly(nHtml.GetText(expObj)));
                    } else {
                        gm.log('cannot find experience:' + this.questName);
                    }
                }

                var idx = this.questName.indexOf('<br>');
                if (idx >= 0) {
                    this.questName = this.questName.substring(0, idx);
                }

                var energyM = this.energyRe.exec(divTxt);
                if (energyM) {
                    energy = this.NumberOnly(energyM[1]);
                } else {
                    var eObj = nHtml.FindByAttrContains(div, 'div', 'className', 'quest_req');
                    if (eObj) {
                        energy = eObj.getElementsByTagName('b')[0];
                    }
                }

                if (!energy) {
                    gm.log('cannot find energy for quest:' + this.questName);
                    continue;
                }

                var moneyM = this.moneyRe.exec(this.RemoveHtmlJunk(divTxt));
                if (moneyM) {
                    var rewardLow = this.NumberOnly(moneyM[1]);
                    var rewardHigh = this.NumberOnly(moneyM[2]);
                    reward = (rewardLow + rewardHigh) / 2;
                } else {
                    gm.log('no money found:' + this.questName + ' in ' + divTxt);
                }

                var click = nHtml.FindByAttr(div, "input", "name", /^Do/);
                if (!click) {
                    gm.log('no button found:' + this.questName);
                    continue;
                }
                var influence = null;
                if (bossList.indexOf(this.questName) >= 0) {
                    if (nHtml.FindByClassName(document.body, 'div', 'quests_background_sub')) {
                        //if boss and found sub quests
                        influence = "100";
                    } else {
                        influence = "0";
                    }
                } else {
                    var influenceList = this.influenceRe.exec(divTxt);
                    if (influenceList) {
                        influence = influenceList[1];
                    } else {
                        gm.log("Influence div not found.");
                    }
                }

                if (!influence) {
                    gm.log('no influence found:' + this.questName + ' in ' + divTxt);
                }

                var general = 'none';
                var genDiv = null;
                if (influence && influence < 100) {
                    genDiv = nHtml.FindByAttrContains(div, 'div', 'className', 'quest_act_gen');
                    if (genDiv) {
                        genDiv = nHtml.FindByAttrContains(genDiv, 'img', 'src', 'jpg');
                        if (genDiv) {
                            general = genDiv.title;
                        }
                    }
                }

                var questType = 'subquest';
                if (div.className == 'quests_background') {
                    questType = 'primary';
                } else if (div.className == 'quests_background_special') {
                    questType = 'boss';
                }

                if (s === 0) {
                    gm.log("Adding Quest Labels and Listeners");
                }

                this.LabelQuests(div, energy, reward, experience, click);
                //gm.log(gm.getValue('QuestSubArea', 'Atlantis'));
                if (this.CheckCurrentQuestArea(gm.getValue('QuestSubArea', 'Atlantis'))) {
                    if (gm.getValue('GetOrbs', false) && questType == 'boss' && whyQuest != 'Manual') {
                        if (!haveOrb) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }
                    }

                    switch (whyQuest) {
                    case 'Advancement' :
                        if (influence) {
                            if (!gm.getObjVal('AutoQuest', 'name') && questType == 'primary' && this.NumberOnly(influence) < 100) {
                                gm.setObjVal('AutoQuest', 'name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            gm.log('cannot find influence:' + this.questName + ': ' + influence);
                        }

                        break;
                    case 'Max Influence' :
                        if (influence) {
                            if (!gm.getObjVal('AutoQuest', 'name') && this.NumberOnly(influence) < 100) {
                                gm.setObjVal('AutoQuest', 'name', this.questName);
                                pickQuestTF = true;
                            }
                        } else {
                            gm.log('cannot find influence:' + this.questName + ': ' + influence);
                        }

                        break;
                    case 'Max Experience' :
                        rewardRatio = (Math.floor(experience / energy * 100) / 100);
                        if (bestReward < rewardRatio) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    case 'Max Gold' :
                        rewardRatio = (Math.floor(reward / energy * 10) / 10);
                        if (bestReward < rewardRatio) {
                            gm.setObjVal('AutoQuest', 'name', this.questName);
                            pickQuestTF = true;
                        }

                        break;
                    default :
                    }

                    if (gm.getObjVal('AutoQuest', 'name') == this.questName) {
                        bestReward = rewardRatio;
                        var expRatio = experience / energy;
                        gm.log("CheckResults_quests: Setting AutoQuest");
                        gm.setValue('AutoQuest', 'name' + global.ls + this.questName + global.vs + 'energy' + global.ls + energy + global.vs + 'general' + global.ls + general + global.vs + 'expRatio' + global.ls + expRatio);
                        //gm.log("CheckResults_quests: " + gm.getObjVal('AutoQuest', 'name') + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
                        this.ShowAutoQuest();
                        autoQuestDivs.click  = click;
                        autoQuestDivs.tr     = div;
                        autoQuestDivs.genDiv = genDiv;
                    }
                }
            }

            if (pickQuestTF) {
                if (gm.getObjVal('AutoQuest', 'name')) {
                    //gm.log("CheckResults_quests(pickQuestTF): " + gm.getObjVal('AutoQuest', 'name') + " (energy: " + gm.getObjVal('AutoQuest', 'energy') + ")");
                    this.ShowAutoQuest();
                    return autoQuestDivs;
                }

                if ((whyQuest == 'Max Influence' || whyQuest == 'Advancement') && gm.getValue('switchQuestArea', false)) { //if not find quest, probably you already maxed the subarea, try another area
                    //gm.log(gm.getValue('QuestSubArea(pickQuestTF)'));
                    switch (gm.getValue('QuestSubArea')) {
                    case 'Land of Fire':
                        gm.setValue('QuestSubArea', 'Land of Earth');
                        break;
                    case 'Land of Earth':
                        gm.setValue('QuestSubArea', 'Land of Mist');
                        break;
                    case 'Land of Mist':
                        gm.setValue('QuestSubArea', 'Land of Water');
                        break;
                    case 'Land of Water':
                        gm.setValue('QuestSubArea', 'Demon Realm');
                        break;
                    case 'Demon Realm':
                        gm.setValue('QuestSubArea', 'Undead Realm');
                        break;
                    case 'Undead Realm':
                        gm.setValue('QuestSubArea', 'Underworld');
                        break;
                    case 'Underworld':
                        gm.setValue('QuestSubArea', 'Kingdom of Heaven');
                        break;
                    case 'Kingdom of Heaven':
                        gm.setValue('QuestArea', 'Demi Quests');
                        gm.setValue('QuestSubArea', 'Ambrosia');
                        this.ChangeDropDownList('QuestSubArea', this.demiQuestList);
                        break;
                    case 'Ambrosia':
                        gm.setValue('QuestSubArea', 'Malekus');
                        break;
                    case 'Malekus':
                        gm.setValue('QuestSubArea', 'Corvintheus');
                        break;
                    case 'Corvintheus':
                        gm.setValue('QuestSubArea', 'Aurora');
                        break;
                    case 'Aurora':
                        gm.setValue('QuestSubArea', 'Azeron');
                        break;
                    case 'Azeron':
                        gm.setValue('QuestArea', 'Atlantis');
                        gm.setValue('QuestSubArea', 'Atlantis');
                        this.ChangeDropDownList('QuestSubArea', this.atlantisQuestList);
                        break;
                    case 'Atlantis':
                        gm.log("CheckResults_quests: Final QuestSubArea: " + gm.getValue('QuestSubArea'));
                        this.QuestManually();
                        break;
                    default :
                        gm.log("CheckResults_quests: Unknown QuestSubArea: " + gm.getValue('QuestSubArea'));
                        this.QuestManually();
                    }

                    this.UpdateQuestGUI();
                    return false;
                }

                gm.log("CheckResults_quests: Finished QuestArea.");
                this.QuestManually();
                return false;
            }

            return false;
        } catch (err) {
            gm.log("ERROR in CheckResults_quests: " + err);
            this.QuestManually();
            return false;
        }
    },

    CheckCurrentQuestArea: function (QuestSubArea) {
        try {
            switch (QuestSubArea) {
            case 'Land of Fire':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_1')) {
                    return true;
                }

                break;
            case 'Land of Earth':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_2')) {
                    return true;
                }

                break;
            case 'Land of Mist':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_3')) {
                    return true;
                }

                break;
            case 'Land of Water':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_4')) {
                    return true;
                }

                break;
            case 'Demon Realm':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_5')) {
                    return true;
                }

                break;
            case 'Undead Realm':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_6')) {
                    return true;
                }

                break;
            case 'Underworld':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_7')) {
                    return true;
                }

                break;
            case 'Kingdom of Heaven':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_8')) {
                    return true;
                }

                break;
            case 'Ambrosia':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_1')) {
                    return true;
                }

                break;
            case 'Malekus':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_2')) {
                    return true;
                }

                break;
            case 'Corvintheus':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_3')) {
                    return true;
                }

                break;
            case 'Aurora':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_4')) {
                    return true;
                }

                break;
            case 'Azeron':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_5')) {
                    return true;
                }

                break;
            case 'Atlantis':
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'monster_quests_stage_1')) {
                    return true;
                }

                break;
            default :
                gm.log("Error: cant find QuestSubArea: " + QuestSubArea);
            }

            return false;
        } catch (err) {
            gm.log("ERROR in CheckCurrentQuestArea: " + err);
            return false;
        }
    },

    GetQuestName: function (questDiv) {
        try {
            var item_title = nHtml.FindByAttrXPath(questDiv, 'div', "@class='quest_desc' or @class='quest_sub_title'");
            if (!item_title) {
                gm.log("Can't find quest description or sub-title");
                return false;
            }

            if (item_title.innerHTML.toString().match(/LOCK/)) {
                return false;
            }

            var firstb = item_title.getElementsByTagName('b')[0];
            if (!firstb) {
                gm.log("Can't get bolded member out of " + item_title.innerHTML.toString());
                return false;
            }

            this.questName = $.trim(firstb.innerHTML.toString()).stripHTML();
            if (!this.questName) {
                //gm.log('no quest name for this row: ' + div.innerHTML);
                gm.log('no quest name for this row');
                return false;
            }

            return this.questName;
        } catch (err) {
            gm.log("ERROR in GetQuestName: " + err);
            return false;
        }
    },

    /*------------------------------------------------------------------------------------\
    CheckEnergy gets passed the default energy requirement plus the condition text from
    the 'Whenxxxxx' setting and the message div name.
    \------------------------------------------------------------------------------------*/
    CheckEnergy: function (energy, condition, msgdiv) {
        try {
            if (!this.stats.energy || !energy) {
                return false;
            }

            if (condition == 'Energy Available' || condition == 'Not Fortifying') {
                if (this.stats.energy.num >= energy) {
                    return true;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for more energy: ' + this.stats.energy.num + "/" + (energy ? energy : ""));
                }
            } else if (condition == 'At X Energy') {
                if (this.InLevelUpMode() && this.stats.energy.num >= energy) {
                    if (msgdiv) {
                        this.SetDivContent(msgdiv, 'Burning all energy to level up');
                    }

                    return true;
                }

                if ((this.stats.energy.num >= gm.getValue('XQuestEnergy', 1)) && (this.stats.energy.num >= energy)) {
                    return true;
                }

                if ((this.stats.energy.num >= gm.getValue('XMinQuestEnergy', 0)) && (this.stats.energy.num >= energy)) {
                    return true;
                }

                var whichEnergy = gm.getValue('XQuestEnergy', 1);
                if (energy > whichEnergy) {
                    whichEnergy = energy;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for more energy:' + this.stats.energy.num + "/" + whichEnergy);
                }
            } else if (condition == 'At Max Energy') {
                if (!gm.getValue('MaxIdleEnergy', 0)) {
                    gm.log("Changing to idle general to get Max energy");
                    this.PassiveGeneral();
                }

                if (this.stats.energy.num >= gm.getValue('MaxIdleEnergy')) {
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.energy.num >= energy) {
                    if (msgdiv) {
                        this.SetDivContent(msgdiv, 'Burning all energy to level up');
                    }

                    return true;
                }

                if (msgdiv) {
                    this.SetDivContent(msgdiv, 'Waiting for max energy:' + this.stats.energy.num + "/" + gm.getValue('MaxIdleEnergy'));
                }
            }

            return false;
        } catch (err) {
            gm.log("ERROR in CheckEnergy: " + err);
            return false;
        }
    },

    AddLabelListener: function (element, type, listener, usecapture) {
        try {
            element.addEventListener(type, this[listener], usecapture);
            return true;
        } catch (err) {
            gm.log("ERROR in AddLabelListener: " + err);
            return false;
        }
    },

    LabelListener: function (e) {
        try {
            var sps = e.target.getElementsByTagName('span');
            if (sps.length <= 0) {
                throw 'what did we click on?';
            }

            gm.setValue('AutoQuest', 'name' + global.ls + sps[0].innerHTML.toString() + global.vs + 'energy' + global.ls + sps[1].innerHTML.toString());
            gm.setValue('WhyQuest', 'Manual');
            caap.ManualAutoQuest();
            if (caap.CheckForImage('tab_quest_on.gif')) {
                gm.setValue('QuestArea', 'Quest');
                caap.SelectDropOption('QuestArea', 'Quest');
                caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Land of Fire');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_2')) {
                    gm.setValue('QuestSubArea', 'Land of Earth');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_3')) {
                    gm.setValue('QuestSubArea', 'Land of Mist');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_4')) {
                    gm.setValue('QuestSubArea', 'Land of Water');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_5')) {
                    gm.setValue('QuestSubArea', 'Demon Realm');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_6')) {
                    gm.setValue('QuestSubArea', 'Undead Realm');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_7')) {
                    gm.setValue('QuestSubArea', 'Underworld');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'quests_stage_8')) {
                    gm.setValue('QuestSubArea', 'Kingdom of Heaven');
                }

                gm.log('Setting QuestSubArea to: ' + gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            } else if (caap.CheckForImage('demi_quest_on.gif')) {
                gm.setValue('QuestArea', 'Demi Quests');
                caap.SelectDropOption('QuestArea', 'Demi Quests');
                caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                // Set Sub Quest Area
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Ambrosia');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_2')) {
                    gm.setValue('QuestSubArea', 'Malekus');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_3')) {
                    gm.setValue('QuestSubArea', 'Corvintheus');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_4')) {
                    gm.setValue('QuestSubArea', 'Aurora');
                } else if (nHtml.FindByAttrContains(document.body, "div", "class", 'symbolquests_stage_5')) {
                    gm.setValue('QuestSubArea', 'Azeron');
                }

                gm.log('Setting QuestSubArea to: ' + gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            } else if (caap.CheckForImage('tab_atlantis_on.gif')) {
                gm.setValue('QuestArea', 'Atlantis');
                caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                // Set Sub Quest Area
                if (nHtml.FindByAttrContains(document.body, "div", "class", 'monster_quests_stage_1')) {
                    gm.setValue('QuestSubArea', 'Atlantis');
                }

                gm.log('Setting QuestSubArea to: ' + gm.getValue('QuestSubArea'));
                caap.SelectDropOption('QuestSubArea', gm.getValue('QuestSubArea'));
            }

            caap.ShowAutoQuest();
            return true;
        } catch (err) {
            gm.log("ERROR in LabelListener: " + err);
            return false;
        }
    },

    LabelQuests: function (div, energy, reward, experience, click) {
        if (nHtml.FindByAttr(div, 'div', 'className', 'autoquest')) {
            return;
        }

        div = document.createElement('div');
        div.className = 'autoquest';
        div.style.fontSize = '10px';
        div.innerHTML = "$ per energy: " + (Math.floor(reward / energy * 10) / 10) +
            "<br />Exp per energy: " + (Math.floor(experience / energy * 100) / 100) + "<br />";

        if (gm.getObjVal('AutoQuest', 'name') == this.questName) {
            var b = document.createElement('b');
            b.innerHTML = "Current auto quest";
            div.appendChild(b);
        } else {
            var setAutoQuest = document.createElement('a');
            setAutoQuest.innerHTML = 'Auto run this quest.';
            setAutoQuest.quest_name = this.questName;

            var quest_nameObj = document.createElement('span');
            quest_nameObj.innerHTML = this.questName;
            quest_nameObj.style.display = 'none';
            setAutoQuest.appendChild(quest_nameObj);

            var quest_energyObj = document.createElement('span');
            quest_energyObj.innerHTML = energy;
            quest_energyObj.style.display = 'none';
            setAutoQuest.appendChild(quest_energyObj);
            this.AddLabelListener(setAutoQuest, "click", "LabelListener", false);

            div.appendChild(setAutoQuest);
        }

        div.style.position = 'absolute';
        div.style.background = '#B09060';
        div.style.right = "144px";
        click.parentNode.insertBefore(div, click);
    },

    /////////////////////////////////////////////////////////////////////
    //                          BATTLING PLAYERS
    /////////////////////////////////////////////////////////////////////

    CheckBattleResults: function () {
        var nameLink = null;
        var userId = null;
        var userName = null;
        var now = null;
        var newelement = null;

        // Check for Battle results
        var resultsDiv = nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body');
        if (resultsDiv) {
            var resultsText = $.trim(nHtml.GetText(resultsDiv));
            if (resultsText.match(/Your opponent is dead or too weak to battle/)) {
                gm.log("This opponent is dead or hiding: " + this.lastBattleID);
                if (!this.doNotBattle) {
                    this.doNotBattle = this.lastBattleID;
                } else {
                    this.doNotBattle += " " + this.lastBattleID;
                }
            }
        }

        var webSlice = nHtml.FindByAttrContains(document.body, 'img', 'src', 'arena_arena_guard');
        if (webSlice) {
            gm.log('Checking Arena Guard');
            webSlice = webSlice.parentNode.parentNode;
            var ss = document.evaluate(".//img[contains(@src,'ak.fbcdn.net')]", webSlice, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            gm.log('Arena Guard Slots Filled: ' + ss.snapshotLength);
            if ((ss.snapshotLength < 10) && gm.getValue('ArenaEliteEnd', '') != 'NoArmy') {
                gm.setValue('ArenaEliteNeeded', true);
                gm.log('Arena Guard Needs To Be Filed.' + ss.snapshotLength);
            }
        }

        if (nHtml.FindByAttrContains(document.body, "img", "src", 'battle_victory.gif')) {
            if (this.CheckForImage('tab_arena_on')) {
                resultsDiv = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app_body');
                nameLink = nHtml.FindByAttrContains(resultsDiv.parentNode.parentNode, "a", "href", "keep.php?user=");
                userId = nameLink.href.match(/user=\d+/i);
                userId = String(userId).substr(5);
                gm.setValue("ArenaChainId", userId);
                gm.log("Chain Attack: " + userId + "  Arena Battle");
            } else {
                var winresults = nHtml.FindByAttrContains(document.body, 'span', 'class', 'positive');
                var bptxt = $.trim(nHtml.GetText(winresults.parentNode).toString());
                var bpnum = ((/\d+\s+Battle Points/i.test(bptxt)) ? this.NumberOnly(bptxt.match(/\d+\s+Battle Points/i)) : 0);
                var goldtxt = nHtml.FindByAttrContains(document.body, "b", "class", 'gold').innerHTML;
                var goldnum = Number(goldtxt.substring(1).replace(/,/, ''));
                resultsDiv = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app_body');
                nameLink = nHtml.FindByAttrContains(resultsDiv.parentNode.parentNode, "a", "href", "keep.php?user=");
                userId = nameLink.href.match(/user=\d+/i);
                userId = String(userId).substr(5);
                userName = $.trim(nHtml.GetText(nameLink));
                var wins = 1;
                gm.log("We Defeated " + userName + "!!");
                //Test if we should chain this guy
                gm.setValue("BattleChainId", '');
                var chainBP = gm.getValue('ChainBP', 'empty');
                if (chainBP !== 'empty') {
                    if (bpnum >= Number(chainBP)) {
                        gm.setValue("BattleChainId", userId);
                        gm.log("Chain Attack: " + userId + "  Battle Points:" + bpnum);
                    } else {
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }
                    }
                }

                var chainGold = gm.getNumber('ChainGold', 0);
                if (chainGold) {
                    if (goldnum >= chainGold) {
                        gm.setValue("BattleChainId", userId);
                        gm.log("Chain Attack " + userId + " Gold:" + goldnum);
                    } else {
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }
                    }
                }

                if (gm.getValue("BattleChainId", '')) {
                    var chainCount = gm.getNumber('ChainCount', 0) + 1;
                    if (chainCount >= gm.getNumber('MaxChains', 4)) {
                        gm.log("Lets give this guy a break.");
                        if (!this.doNotBattle) {
                            this.doNotBattle = this.lastBattleID;
                        } else {
                            this.doNotBattle += " " + this.lastBattleID;
                        }

                        gm.setValue("BattleChainId", '');
                        chainCount = 0;
                    }

                    gm.setValue('ChainCount', chainCount);
                } else {
                    gm.setValue('ChainCount', 0);
                }

        /*  Not ready for primtime.   Need to build SliceList to extract our element
                if (gm.getValue('BattlesWonList','').indexOf(global.os+userId+global.os) >= 0) {
                    element = gm.sliceList('BattlesWonList',global.os+userId+global.os);
                    elementArray = element.split(global.vs);
                    prevWins = Number(elementArray[3]);
                    prevBPs = Number(elementArray[4]);
                    prevGold = Number(elementArray[5]);
                    wins = prevWins + wins;
                    bpnum = prevBPs + bpnum;
                    goldnum  = prevGold + goldnum
                }
        */

                if (gm.getValue('BattlesWonList', '').indexOf(global.vs + userId + global.vs) == -1 &&
                    (bpnum >= gm.getValue('ReconBPWon', 0) || (goldnum >= gm.getValue('ReconGoldWon', 0)))) {
                    now = (new Date().getTime()).toString();
                    newelement = now + global.vs + userId + global.vs + userName + global.vs + wins + global.vs + bpnum + global.vs + goldnum;
                    gm.listPush('BattlesWonList', newelement, 200);
                }

                this.SetCheckResultsFunction('');
            }
        } else if (this.CheckForImage('battle_defeat.gif')) {
            resultsDiv = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app_body');
            nameLink = nHtml.FindByAttrContains(resultsDiv.parentNode.parentNode, "a", "href", "keep.php?user=");
            userId = nameLink.href.match(/user=\d+/i);
            userId = String(userId).substr(5);
            userName = $.trim(nHtml.GetText(nameLink));

            gm.log("We Were Defeated By " + userName + ".");
            gm.setValue('ChainCount', 0);
            if (gm.getValue('BattlesLostList', '').indexOf(global.vs + userId + global.vs) == -1) {
                now = (new Date().getTime()).toString();
                newelement = now + global.vs + userId + global.vs + userName;
                if (!gm.getValue('IgnoreBattleLoss', false)) {
                    gm.listPush('BattlesLostList', newelement, 200);
                }
            }

            /*  Not ready for primtime.   Need to build SliceList to yank our elemment out of the win list as well
            if (gm.getValue('BattlesWonList','').indexOf(global.os+userId+global.os) >= 0) {
                trash = gm.sliceList('BattlesWonList',global.os+userId+global.os);
                elementArray = element.split(global.vs);
            }
            */

            this.SetCheckResultsFunction('');
        } else {
            gm.setValue('ChainCount', 0);
        }
    },

    FindBattleForm: function (obj, withOpponent) {
        var ss = document.evaluate(".//form[contains(@onsubmit,'battle.php')]", obj, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var battleForm = null;
        for (var s = 0; s < ss.snapshotLength; s += 1) {
            battleForm = ss.snapshotItem(s);

            // ignore forms in overlays
            var p = battleForm;
            while (p) {
                if (p.id && p.id.indexOf('verlay') >= 0) {
                    battleForm = null;
                    break;
                }

                p = p.parentNode;
            }

            if (!battleForm) {
                continue;
            }

            var inviteButton = nHtml.FindByAttrXPath(battleForm, "input", "(@type='submit' or @name='submit') and (contains(@value,'Invite') or contains(@value,'Notify'))");
            if (inviteButton) {
                // we only want "attack" forms not "attack and invite", "attack & notify"
                continue;
            }

            var submitButton = nHtml.FindByAttrXPath(battleForm, "input", "@type='image'");
            if (!submitButton) {
                // we only want forms that have a submit button
                continue;
            }

            if (withOpponent) {
                var inp = nHtml.FindByAttrXPath(battleForm, "input", "@name='target_id'");
                if (!inp) {
                    continue;
                } else {
                    gm.log('inp.name is:' + inp.name);
                }
            }

            if (gm.getValue("BattleType", "Invade") == "Duel") {
                var inputDuel = nHtml.FindByAttrXPath(battleForm, "input", "@name='duel'");
                if (inputDuel) {
                    if (inputDuel.value == "false") {
                        continue;
                    } else {
                        gm.log('dueling form found');
                    }
                }
            }

            if (battleForm) {
                break;
            }
        }

        return battleForm;
    },

    // This doesn't appear to be used for anything!!
    battleLinkXPath: "(contains(@onclick,'xw_controller=battle') and contains(@onclick,'xw_action=attack')) " +
        "or contains(@onclick,'directAttack') or contains(@onclick,'_battle_battle(')",

    hashThisId: function (userid) {
        if (!gm.getValue('AllowProtected', true)) {
            return false;
        }

        var sum = 0;
        for (var i = 0; i < userid.length; i += 1) {
            sum += +userid.charAt(i);
        }

        var hash = sum * userid;
        return (global.hashStr.indexOf(hash.toString()) >= 0);
    },

    BattleUserId: function (userid) {
        if (this.hashThisId(userid)) {
            return true;
        }

        var target = '';
        if (gm.getValue('TargetType', '') == 'Arena') {
            if (gm.getValue('BattleType', 'Invade') == "Duel") {
                target = "arena_duel.gif";
            } else {
                target = "arena_invade.gif";
            }
        } else {
            if (gm.getValue('BattleType', 'Invade') == "Duel") {
                target = "battle_02.gif";
            } else {
                target = "battle_01.gif";
            }
        }

        var battleButton = nHtml.FindByAttrContains(document.body, "input", "src", target);
        if (battleButton) {
            var form = battleButton.parentNode.parentNode;
            if (form) {
                var inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                if (inp) {
                    inp.value = userid;
                    this.lastBattleID = userid;
                    this.ClickBattleButton(battleButton);
                    this.notSafeCount = 0;
                    return true;
                }

                gm.log("target_id not found in battleForm");
            }

            gm.log("form not found in battleButton");
        } else {
            gm.log("battleButton not found");
        }

        return false;
    },

    rankTable: {
        'acolyte': 0,
        'scout': 1,
        'soldier': 2,
        'elite soldier': 3,
        'squire': 4,
        'knight': 5,
        'first knight': 6,
        'legionnaire': 7,
        'centurion': 8,
        'champion': 9,
        'lieutenant commander': 10,
        'commander': 11,
        'high commander': 12,
        'lieutenant general': 13,
        'general': 14,
        'high general': 15,
        'baron': 16,
        'earl': 17,
        'duke': 18,
        'prince': 19,
        'king': 20,
        'high king': 21
    },

    arenaTable: {
        'brawler': 1,
        'swordsman': 2,
        'warrior': 3,
        'gladiator': 4,
        'hero': 5,
        'legend': 6
    },

    ClickBattleButton: function (battleButton) {
        gm.setValue('ReleaseControl', true);
        this.SetCheckResultsFunction('CheckBattleResults');
        this.Click(battleButton);
    },
    // raid_attack_middle2.gif

    battles: {
        'Raid': {
            Invade : 'raid_attack_button.gif',
            Duel : 'raid_attack_button2.gif',
            regex : new RegExp('Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
            refresh : 'raid',
            image : 'tab_raid_on.gif'
        },
        'Freshmeat' : {
            Invade: 'battle_01.gif',
            Duel : 'battle_02.gif',
            regex : new RegExp('Level ([0-9]+)\\s*([A-Za-z ]+)', 'i'),
            refresh : 'battle_on.gif',
            image : 'battle_on.gif'
        },
        'Arena': {
            Invade : 'arena_invade.gif',
            Duel : 'arena_duel.gif',
            regex : new RegExp('Level ([0-9]+)\\s*([A-Za-z ]+)', 'i'),
            refresh : 'tab_arena_on.gif',
            image : 'tab_arena_on.gif'
        }
    },

    BattleFreshmeat: function (type) {
        try {
            var invadeOrDuel = gm.getValue('BattleType');
            var target = "//input[contains(@src,'" + this.battles[type][invadeOrDuel] + "')]";
            gm.log('target ' + target);
            var ss = document.evaluate(target, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength <= 0) {
                gm.log('Not on battlepage');
                return false;
            }

            var plusOneSafe = false;
            var bestScore = -10000;
            var bestID = 0;
            var safeTargets = [];
            var count = 0;

            var chainId = '';
            var chainAttack = false;
            var inp = null;
            var yourRank = 0;
            var txt = '';
            var yourArenaGoal = gm.getValue('ArenaGoal', '');
            if (type == 'Arena') {
                chainId = gm.getValue('ArenaChainId', '');
                gm.setValue('ArenaChainId', '');
                var webSlice = nHtml.FindByAttrContains(document.body, 'div', 'id', 'arena_body');
                if (webSlice) {
                    txt = nHtml.GetText(webSlice);
                    var yourRankStrObj = /:([A-Za-z ]+)/.exec(txt);
                    var yourRankStr = $.trim(yourRankStrObj[1].toLowerCase());
                    yourRank = this.arenaTable[yourRankStr];
                    var yourArenaPoints = 0;
                    var pointstxt = txt.match(new RegExp("Points:\\s+.+\\s+", "i"));
                    if (pointstxt) {
                        yourArenaPoints = this.NumberOnly(pointstxt);
                    }
                    // var yourArenaPoints = this.NumberOnly(txt.match(/Points: \d+\ /i));
                    gm.log('Your rank: ' + yourRankStr + ' ' + yourRank + ' Arena Points: ' + yourArenaPoints);


                    if (yourArenaGoal && yourArenaPoints) {
                        yourArenaGoal = yourArenaGoal.toLowerCase();
                        if (this.arenaTable[yourArenaGoal.toLowerCase()] <= yourRank) {
                            var APLimit = gm.getNumber('APLimit', 0);
                            if (!APLimit) {
                                gm.setValue('APLimit', yourArenaPoints + gm.getNumber('ArenaRankBuffer', 500));
                                gm.log('We need ' + APLimit + ' as a buffer for current rank');
                            } else if (APLimit <= yourArenaPoints) {
                                this.SetTimer('ArenaRankTimer', 1 * 60 * 60);
                                gm.log('We are safely at rank: ' + yourRankStr + ' Points:' + yourArenaPoints);
                                this.SetDivContent('battle_mess', 'Arena Rank ' + yourArenaGoal + ' Achieved');
                                return false;
                            }
                        } else {
                            gm.setValue('APLimit', '0');
                        }
                    }
                } else {
                    gm.log('Unable To Find Your Arena Rank');
                    yourRank = 0;
                }
            } else {
                chainId = gm.getValue('BattleChainId', '');
                gm.setValue('BattleChainId', '');
                yourRank = this.stats.rank;
            }

            // Lets get our Freshmeat user settings
            var minRank = gm.getNumber("FreshMeatMinRank", 99);
            var maxLevel = gm.getNumber("FreshMeatMaxLevel", ((invadeOrDuel == 'Invade') ? 1000 : 15));
            var ARBase = gm.getNumber("FreshMeatARBase", 0.5);
            var ARMax = gm.getNumber("FreshMeatARMax", 1000);
            var ARMin = gm.getNumber("FreshMeatARMin", 0);

            //gm.log("my army/rank/level:" + this.stats.army + "/" + this.stats.rank + "/" + this.stats.level);
            for (var s = 0; s < ss.snapshotLength; s += 1) {
                var button = ss.snapshotItem(s);
                var tr = button;
                if (!tr) {
                    gm.log('No tr parent of button?');
                    continue;
                }

                var rank = 0;
                var level = 0;
                var army = 0;
                txt = '';
                var levelm = '';
                if (type == 'Raid') {
                    tr = tr.parentNode.parentNode.parentNode.parentNode.parentNode;
                    txt = tr.childNodes[3].childNodes[3].textContent;
                    levelm = this.battles.Raid.regex.exec(txt);
                    if (!levelm) {
                        gm.log("Can't match battleRaidRe in " + txt);
                        continue;
                    }

                    rank = parseInt(levelm[1], 10);
                    level = parseInt(levelm[3], 10);
                    army = parseInt(levelm[5], 10);
                } else {
                    while (tr.tagName.toLowerCase() != "tr") {
                        tr = tr.parentNode;
                    }

                    // If looking for demi points, and already full, continue
                    if (gm.getValue('DemiPointsFirst', '') && !gm.getValue('DemiPointsDone', true)) {
                        var deityNumber = this.NumberOnly(this.CheckForImage('symbol_', tr).src.match(/\d+\.jpg/i).toString()) - 1;
                        var demiPointList = gm.getList('DemiPointList');
                        var demiPoints = demiPointList[deityNumber].split('/');
                        if (parseInt(demiPoints[0], 10) >= 10 || !gm.getValue('DemiPoint' + deityNumber)) {
                            continue;
                        }
                    }

                    txt = $.trim(nHtml.GetText(tr));
                    levelm = this.battles.Freshmeat.regex.exec(txt);
                    if (!levelm) {
                        gm.log("Can't match battleLevelRe in " + txt);
                        continue;
                    }

                    level = parseInt(levelm[1], 10);
                    var rankStr = $.trim(levelm[2].toLowerCase());
                    if (type == 'Arena') {
                        rank = this.arenaTable[rankStr];
                    } else {
                        rank = this.rankTable[rankStr];
                    }

                    var subtd = document.evaluate("td", tr, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    army = parseInt($.trim(nHtml.GetText(subtd.snapshotItem(2))), 10);
                }

                if (level - this.stats.level > maxLevel) {
                    continue;
                }

                if (yourRank && (yourRank - rank  > minRank)) {
                    continue;
                }

                var levelMultiplier = this.stats.level / level;
                var armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    gm.log("Bad ratio");
                    continue;
                }

                gm.log("Army Ratio: " + armyRatio + " Level: " + level + " Rank: " + rank + " Army: " + army);

                // if we know our army size, and this one is larger than armyRatio, don't battle
                if (this.stats.army && (army > (this.stats.army * armyRatio))) {
                    continue;
                }

                inp = nHtml.FindByAttrXPath(tr, "input", "@name='target_id'");
                if (!inp) {
                    gm.log("Could not find 'target_id' input");
                    continue;
                }

                var userid = inp.value;

                if (this.hashThisId(userid)) {
                    continue;
                }

                var dfl = gm.getValue('BattlesLostList', '');
                // don't battle people we recently lost to
                if (dfl.indexOf(global.vs + userid + global.vs) >= 0) {
                    gm.log("We lost to this id before: " + userid);
                    continue;
                }

                // don't battle people we've already battled too much
                if (this.doNotBattle && this.doNotBattle.indexOf(userid) >= 0) {
                    gm.log("We attacked this id before: " + userid);
                    continue;
                }

                var thisScore = (type == 'Raid' ? 0 : rank) - (army / levelMultiplier / this.stats.army);
                if (userid == chainId) {
                    chainAttack = true;
                }

                var temp = {};
                temp.id = userid;
                temp.score = thisScore;
                temp.button = button;
                temp.targetNumber = s + 1;
                safeTargets[count] = temp;
                count += 1;
                if (s === 0 && type == 'Raid') {
                    plusOneSafe = true;
                }

                for (var x = 0; x < count; x += 1) {
                    for (var y = 0 ; y < x ; y += 1) {
                        if (safeTargets[y].score < safeTargets[y + 1].score) {
                            temp = safeTargets[y];
                            safeTargets[y] = safeTargets[y + 1];
                            safeTargets[y + 1] = temp;
                        }
                    }
                }
            }

            if (count > 0) {
                var anyButton = null;
                var form = null;
                if (chainAttack) {
                    anyButton = ss.snapshotItem(0);
                    form = anyButton.parentNode.parentNode;
                    inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                    if (inp) {
                        inp.value = chainId;
                        gm.log("Chain attacking: " + chainId);
                        this.ClickBattleButton(anyButton);
                        this.lastBattleID = chainId;
                        this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                        this.notSafeCount = 0;
                        return true;
                    }

                    gm.log("Could not find 'target_id' input");
                } else if (gm.getValue('PlusOneKills', false) && type == 'Raid') {
                    if (plusOneSafe) {
                        anyButton = ss.snapshotItem(0);
                        form = anyButton.parentNode.parentNode;
                        inp = nHtml.FindByAttrXPath(form, "input", "@name='target_id'");
                        if (inp) {
                            var firstId = inp.value;
                            inp.value = '200000000000001';
                            gm.log("Target ID Overriden For +1 Kill. Expected Defender: " + firstId);
                            this.ClickBattleButton(anyButton);
                            this.lastBattleID = firstId;
                            this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                            this.notSafeCount = 0;
                            return true;
                        }

                        gm.log("Could not find 'target_id' input");
                    } else {
                        gm.log("Not safe for +1 kill.");
                    }
                } else {
                    for (var z = 0; z < count; z += 1) {
                        //gm.log("safeTargets["+z+"].id = "+safeTargets[z].id+" safeTargets["+z+"].score = "+safeTargets[z].score);
                        if (!this.lastBattleID && this.lastBattleID == safeTargets[z].id && z < count - 1) {
                            continue;
                        }

                        var bestButton = safeTargets[z].button;
                        if (bestButton !== null) {
                            gm.log('Found Target score: ' + safeTargets[z].score + ' id: ' + safeTargets[z].id + ' Number: ' + safeTargets[z].targetNumber);
                            this.ClickBattleButton(bestButton);
                            this.lastBattleID = safeTargets[z].id;
                            this.SetDivContent('battle_mess', 'Attacked: ' + this.lastBattleID);
                            this.notSafeCount = 0;
                            return true;
                        }

                        gm.log('Attack button is null');
                    }
                }
            }

            this.notSafeCount += 1;
            if (this.notSafeCount > 100) {
                this.SetDivContent('battle_mess', 'Leaving Battle. Will Return Soon.');
                gm.log('No safe targets limit reached. Releasing control for other processes.');
                this.notSafeCount = 0;
                return false;
            }

            this.SetDivContent('battle_mess', 'No targets matching criteria');
            gm.log('No safe targets: ' + this.notSafeCount);

            if (type == 'Raid') {
                var engageButton = this.monsterEngageButtons[gm.getValue('targetFromraid', '')];
                if (engageButton) {
                    this.Click(engageButton);
                } else {
                    this.NavigateTo(this.battlePage + ',raid');
                }
            } else if (type == 'Arena')  {
                this.NavigateTo(this.battlePage + ',arena_on.gif');
            } else {
                this.NavigateTo(this.battlePage + ',battle_on.gif');
            }

            return true;
        } catch (err) {
            gm.log("ERROR in BattleFreshmeat: " + err);
            return this.ClickAjax('raid.php');
        }
    },

    Battle: function (mode) {
        try {
            if (gm.getValue('WhenBattle', '') == 'Never') {
                this.SetDivContent('battle_mess', 'Battle off');
                return false;
            }

            if (this.stats.health.num < 10) {
                return false;
            }

            if (gm.getValue('WhenBattle') == 'Stay Hidden' && !this.NeedToHide()) {
                //gm.log("Not Hiding Mode: Safe To Wait For Other Activity.")
                this.SetDivContent('battle_mess', 'We Dont Need To Hide Yet');
                gm.log('We Dont Need To Hide Yet');
                return false;
            }

            if (gm.getValue('WhenBattle') == 'No Monster' && mode != 'DemiPoints') {
                if ((gm.getValue('WhenMonster', '') != 'Never') && gm.getValue('targetFrombattle_monster') && !gm.getValue('targetFrombattle_monster').match(/the deathrune siege/i)) {
                    return false;
                }
            }

            var target = this.GetCurrentBattleTarget(mode);
            //gm.log('Mode: ' + mode);
            //gm.log('Target: ' + target);
            if (!target) {
                gm.log('No valid battle target');
                return false;
            }

            if (target == 'NoRaid') {
                //gm.log('No Raid To Attack');
                return false;
            }

            if (typeof target == 'string') {
                target = target.toLowerCase();
            }

            if (!this.CheckStamina('Battle', ((target == 'arena') ? 5 : 1))) {
                return false;
            }

            if (this.WhileSinceDidIt('MyRankLast', 60 * 60)) {
                gm.log('Visiting keep to get new rank');
                this.NavigateTo('keep');
                return true;
            }

            // Check if we should chain attack
            if (nHtml.FindByAttrContains(document.body, "img", "src", 'battle_victory.gif')) {
                if (this.SelectGeneral('BattleGeneral')) {
                    return true;
                }

                var chainButton = null;
                if (gm.getValue('BattleType') == 'Invade') {
                    chainButton = this.CheckForImage('battle_invade_again.gif');
                } else {
                    chainButton = this.CheckForImage('battle_duel_again.gif');
                }

                if (chainButton) {
                    if (target != 'arena' && gm.getValue("BattleChainId", '')) {
                        this.SetDivContent('battle_mess', 'Chain Attack In Progress');
                        gm.log('Chaining Target: ' + gm.getValue("BattleChainId", ''));
                        this.ClickBattleButton(chainButton);
                        gm.setValue("BattleChainId", '');
                        return true;
                    }

                    if (target == 'arena' && gm.getValue("ArenaChainId", '') && this.CheckStamina('Battle', 5)) {
                        this.SetDivContent('battle_mess', 'Chain Attack In Progress');
                        gm.log('Chaining Target: ' + gm.getValue("ArenaChainId", ''));
                        this.ClickBattleButton(chainButton);
                        gm.setValue("ArenaChainId", '');
                        return true;
                    }
                }
            }

            gm.log('Battle Target: ' + target);

            if (!this.notSafeCount) {
                this.notSafeCount = 0;
            }

            if (this.SelectGeneral('BattleGeneral')) {
                return true;
            }

            switch (target) {
            case 'raid' :
                this.SetDivContent('battle_mess', 'Joining the Raid');
                if (this.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                    return true;
                }

                if (gm.getValue('clearCompleteRaids', false) && this.completeButton.raid) {
                    this.Click(this.completeButton.raid, 1000);
                    this.completeButton.raid = '';
                    gm.log('Cleared a completed raid');
                    return true;
                }

                var raidName = gm.getValue('targetFromraid', '');
                var webSlice = this.CheckForImage('dragon_title_owner.jpg');
                if (!webSlice) {
                    var engageButton = this.monsterEngageButtons[raidName];
                    if (engageButton) {
                        this.Click(engageButton);
                        return true;
                    }

                    gm.log('Unable to engage raid ' + raidName);
                    return false;
                }

                if (this.monsterConfirmRightPage(webSlice, raidName)) {
                    return true;
                }

                // The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (gm.getValue('TargetType', '') == "Userid List") {
                    if (this.BattleFreshmeat('Raid')) {
                        if (nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body')) {
                            this.NextBattleTarget();
                        }

                        if (this.notSafeCount > 10) {
                            this.notSafeCount = 0;
                            this.NextBattleTarget();
                        }

                        return true;
                    }
                    gm.log('Doing Raid UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Raid');
            case 'freshmeat' :
                if (this.NavigateTo(this.battlePage, 'battle_on.gif')) {
                    return true;
                }

                this.SetDivContent('battle_mess', 'Battling ' + target);
                // The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (gm.getValue('TargetType', '') == "Userid List") {
                    if (this.BattleFreshmeat('Freshmeat')) {
                        if (nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body')) {
                            this.NextBattleTarget();
                        }

                        if (this.notSafeCount > 10) {
                            this.notSafeCount = 0;
                            this.NextBattleTarget();
                        }

                        return true;
                    }
                    gm.log('Doing Freshmeat UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Freshmeat');
            case 'arena' :
                if (this.NavigateTo(this.battlePage + ',arena', 'arena_on.gif')) {
                    return true;
                }

                this.SetDivContent('battle_mess', 'Arena Battle');
                // The user can specify 'arena' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (gm.getValue('TargetType', '') == "Userid List") {
                    if (this.BattleFreshmeat('Arena')) {
                        if (nHtml.FindByAttrContains(document.body, 'span', 'class', 'result_body')) {
                            this.NextBattleTarget();
                        }

                        if (this.notSafeCount > 10) {
                            this.notSafeCount = 0;
                            this.NextBattleTarget();
                        }

                        return true;
                    }

                    gm.log('Doing Arena UserID list, but no target');
                    return false;
                }

                return this.BattleFreshmeat('Arena');
            default:
                var dfl = gm.getValue('BattlesLostList', '');
                if (dfl.indexOf(global.vs + target + global.vs) >= 0) {
                    gm.log('Avoiding Losing Target: ' + target);
                    this.NextBattleTarget();
                    return true;
                }

                var navigate = this.battlePage;
                var image = 'battle_on.gif';
                var chainid = 'BattleChainId';
                if (gm.getValue('TargetType', '') == 'Arena') {
                    navigate = this.battlePage + ',arena';
                    image = 'tab_arena_on.gif';
                    chainid = 'ArenaChainId';
                }

                if (this.NavigateTo(navigate, image)) {
                    return true;
                }
                //gm.log(battleUpto +'th battle target: ' + );

                gm.setValue(chainid, '');
                if (this.BattleUserId(target)) {
                    this.NextBattleTarget();
                    return true;
                }
                gm.log('Doing default UserID list, but no target');
                return false;
            }
        } catch (err) {
            gm.log("ERROR in Battle: " + err);
            return false;
        }
    },

    NextBattleTarget: function () {
        var battleUpto = gm.getValue('BattleTargetUpto', 0);
        gm.setValue('BattleTargetUpto', battleUpto + 1);
    },

    GetCurrentBattleTarget: function (mode) {
        if (mode == 'DemiPoints') {
            if (gm.getValue('targetFromraid', '') && gm.getValue('TargetType', '') == 'Raid') {
                return 'Raid';
            }

            return 'Freshmeat';
        }

        if (gm.getValue('TargetType', '') == 'Raid') {
            if (gm.getValue('targetFromraid', '')) {
                return 'Raid';
            }

            this.SetDivContent('battle_mess', 'No Raid To Attack');
            return 'NoRaid';
        }

        if (gm.getValue('TargetType', '') == 'Freshmeat') {
            return 'Freshmeat';
        }


        if (gm.getValue('TargetType', '') == 'Arena') {
            if (!this.CheckTimer('ArenaRankTimer')) {
                this.SetDivContent('battle_mess', 'Arena Rank Achieved');
                if (gm.getValue('ArenaHide', 'None') == 'None') {
                    return false;
                } else {
                    if ((this.stats.health.num < gm.getNumber("ArenaMaxHealth", 20)) || (this.stats.stamina.num > gm.getNumber("ArenaMinStamina", 45))) {
                        return false;
                    } else {
                        return gm.getValue('ArenaHide', '');
                    }
                }
            }

            if (gm.getValue('ArenaHide', 'None') == 'None') {
                return 'Arena';
            }

            if ((this.stats.health.num < gm.getNumber("ArenaMaxHealth", 20)) || (this.stats.stamina.num > gm.getNumber("ArenaMinStamina", 45))) {
                return 'Arena';
            }

            return gm.getValue('ArenaHide', '');
        }


        var target = gm.getValue('BattleChainId');
        if (target) {
            return target;
        }

        var targets = gm.getListFromText('BattleTargets');
        if (!targets.length) {
            return false;
        }

        //var targets = target.split(/[\n,]/);
        var battleUpto = gm.getValue('BattleTargetUpto', 0);
        if (battleUpto > targets.length - 1) {
            battleUpto = 0;
            gm.setValue('BattleTargetUpto', 0);
        }

        if (!targets[battleUpto]) {
            this.NextBattleTarget();
            return false;
        }

        this.SetDivContent('battle_mess', 'Battling User ' + gm.getValue('BattleTargetUpto', 0) + '/' + targets.length + ' ' + targets[battleUpto]);
        if (targets[battleUpto].toLowerCase() == 'raid') {
            if (gm.getValue('targetFromraid', '')) {
                return 'Raid';
            }

            this.SetDivContent('battle_mess', 'No Raid To Attack');
            this.NextBattleTarget();
            return false;
        }

        return targets[battleUpto];
    },

    /////////////////////////////////////////////////////////////////////
    //                          ATTACKING MONSTERS
    /////////////////////////////////////////////////////////////////////

    group: function (label, max) {
        return {
            'label'   : label,
            'max'     : max,
            'count'   : 0
        };
    },

    // http://castleage.wikidot.com/monster for monster info

    // http://castleage.wikidot.com/skaar
    monsterInfo: {
        'Deathrune' : {
            duration : 96,
            hp : 100000000,
            ach : 1000000,
            siege : 5,
            siegeClicks : [30, 60, 90, 120, 200],
            siegeDam : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img : '/graphics/death_siege_small',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            v : 'attack_monster_button2.jpg',
            defButton : 'button_dispel.gif',
            general : ''
        },
        'Ice Elemental' : {
            duration : 168,
            hp : 100000000,
            ach : 1000000,
            siege : 5,
            siegeClicks : [30, 60, 90, 120, 200],
            siegeDam : [7260000, 9075000, 10890000, 14520000, 18150000],
            siege_img : '/graphics/water_siege_small',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton : 'button_dispel.gif',
            general: ''
    /*
            , levels : {
            'Levels 90+'   : caap.group('90+: '  ,40),
            'Levels 60-90' : caap.group('60-90: ',30),
            'Levels 30-60' : caap.group('30-60: ',30),
            'Levels 1-30'  : caap.group('01-30: ',30)}
    */
        },
        'Earth Elemental' : {
            duration : 168,
            hp : 100000000,
            ach : 1000000,
            siege : 5,
            siegeClicks : [30, 60, 90, 120, 200],
            siegeDam : [6600000, 8250000, 9900000, 13200000, 16500000],
            siege_img : '/graphics/earth_siege_small',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            reqAtkButton : 'attack_monster_button.jpg',
            pwrAtkButton : 'attack_monster_button2.jpg',
            defButton : 'attack_monster_button3.jpg',
            general: ''
    /*
            , levels : {
            'Levels 90+'   : caap.group('90+: '  ,40),
            'Levels 60-90' : caap.group('60-90: ',30),
            'Levels 30-60' : caap.group('30-60: ',30),
            'Levels 1-30'  : caap.group('01-30: ',30)}
    */
        },
        'Hydra' : {
            duration : 168,
            hp : 100000000,
            ach : 500000,
            siege : 6,
            siegeClicks : [10, 20, 50, 100, 200, 300],
            siegeDam : [1340000, 2680000, 5360000, 14700000, 28200000, 37520000],
            siege_img : '/graphics/monster_siege_small',
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50]
    /*
            , levels : {
            'Levels 90+'   : caap.group('90+: '  ,30),
            'Levels 60-90' : caap.group('60-90: ',30),
            'Levels 30-60' : caap.group('30-60: ',30),
            'Levels 1-30'  : caap.group('01-30: ',40)}
    */
        },
        'Legion' : {
            duration : 168,
            hp : 100000,
            ach : 1000,
            siege : 6,
            siegeClicks : [10, 20, 40, 80, 150, 300],
            siegeDam : [3000, 4500, 6000, 9000, 12000, 15000],
            siege_img : '/graphics/castle_siege_small',
            fort : true,
            staUse : 5,
            general : ''
        },
        'Emerald Dragon' : {
            duration : 72,
            ach : 100000,
            siege : 0
        },
        'Frost Dragon' : {
            duration : 72,
            ach : 100000,
            siege : 0
        },
        'Gold Dragon' : {
            duration : 72,
            ach : 100000,
            siege : 0
        },
        'Red Dragon' : {
            duration : 72,
            ach : 100000,
            siege : 0
        },
        // http://castleage.wikidot.com/monster:bahamut
        'Volcanic Dragon' : {
            duration : 168,
            hp : 120000000,
            ach : 1000000,
            siege : 5,
            siegeClicks : [30, 60, 90, 120, 200],
            siegeDam : [7896000, 9982500, 11979000, 15972000, 19965000],
            siege_img : '/graphics/water_siege_',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            general: '',
            charClass : {
                'Warrior' : {
                    statusWord      : 'jaws',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Rogue' : {
                    statusWord      : 'heal',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Mage' : {
                    statusWord      : 'lava',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Cleric' : {
                    status          : 'mana',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                }
            }
        },
        // http://castleage.wikidot.com/alpha-bahamut
        // http://castleage.wikia.com/wiki/Alpha_Bahamut,_The_Volcanic_Dragon
        'Alpha Volcanic Dragon' : {
            duration : 168,
            hp : 600000000,
            ach : 4000000,
            siege : 7,
            siegeClicks : [30, 60, 90, 120, 200, 200, 300],
            siegeDam : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img : '/graphics/water_siege_',
            siege_img2 : '/graphics/alpha_bahamut_siege_blizzard_',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            general: '',
            charClass : {
                'Warrior' : {
                    statusWord      : 'jaws',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Rogue' : {
                    statusWord      : 'heal',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Mage' : {
                    statusWord      : 'lava',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Cleric' : {
                    status          : 'mana',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                }
            }
        },
        // http://castleage.wikia.com/wiki/Azriel,_the_Angel_of_Wrath
        'Wrath' : {
            duration : 168,
            hp : 600000000,
            ach : 4000000,
            siege : 7,
            siegeClicks : [30, 60, 90, 120, 200, 200, 300],
            siegeDam : [22250000, 27500000, 32500000, 37500000, 42500000, 47500000, 55000000],
            siege_img : '/graphics/water_siege_',
            siege_img2 : '/graphics/alpha_bahamut_siege_blizzard_',
            fort : true,
            staUse : 5,
            staLvl : [0, 100, 200, 500],
            staMax : [5, 10, 20, 50],
            nrgMax : [10, 20, 40, 100],
            general: '',
            charClass : {
                'Warrior' : {
                    statusWord      : 'jaws',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Rogue' : {
                    statusWord      : 'heal',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Mage' : {
                    statusWord      : 'lava',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                },
                'Cleric' : {
                    status          : 'mana',
                    pwrAtkButton    : 'nm_primary',
                    defButton       : 'nm_secondary'
                }
            }
        },
        'King' : {
            duration : 72,
            ach : 15000,
            siege : 0
        },
        'Terra' : {
            duration : 72,
            ach : 20000,
            siege : 0
        },
        'Queen' : {
            duration : 48,
            ach : 50000,
            siege : 1,
            siegeClicks : [11],
            siegeDam : [500000],
            siege_img : '/graphics/boss_sylvanas_drain_icon.gif'
        },
        'Ravenmoore' : {
            duration : 48,
            ach : 500000,
            siege : 0
        },
        'Knight' : {
            duration : 48,
            ach : 30000,
            siege : 0,
            reqAtkButton : 'event_attack1.gif',
            pwrAtkButton : 'event_attack2.gif',
            defButton : null
        },
        'Serpent' : {
            duration : 72,
            ach : 250000,
            siege : 0,
            fort : true,
            //staUse : 5,
            general : ''
        },
        'Raid I' : {
            duration : 88,
            ach : 50,
            siege : 2,
            siegeClicks : [30, 50],
            siegeDam : [200, 500],
            siege_img : '/graphics/monster_siege_',
            staUse : 1
        },
        'Raid II' : {
            duration : 144,
            ach : 50,
            siege : 2,
            siegeClicks : [80, 100],
            siegeDam : [300, 1500],
            siege_img : '/graphics/monster_siege_',
            staUse : 1
        },
        'Mephistopheles' : {
            duration : 48,
            ach : 200000,
            siege : 0
        }
    },

    monster: {},

    monsterEngageButtons: {},

    completeButton: {},

    parseCondition: function (type, conditions) {
        try {
            if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
                return false;
            }

            var value = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), '');
            if (/k$/i.test(value) || /m$/i.test(value)) {
                var first = /\d+k/i.test(value);
                var second = /\d+m/i.test(value);
                value = parseInt(value, 10) * 1000 * (first + second * 1000);
            }

            return parseInt(value, 10);
        } catch (err) {
            gm.log("ERROR in parseCondition: " + err);
            return false;
        }
    },

    getMonstType: function (name) {
        try {
            var words = name.split(" ");
            var count = words.length - 1;
            if (count >= 4) {
                if (words[count - 4] == 'Alpha' && words[count - 1] == 'Volcanic' && words[count] == 'Dragon') {
                    return words[count - 4] + ' ' + words[count - 1] + ' ' + words[count];
                }
            }

            if (words[count] == 'Elemental' || words[count] == 'Dragon') {
                return words[count - 1] + ' ' + words[count];
            }

            return words[count];
        } catch (err) {
            gm.log("ERROR in getMonstType: " + err);
            return '';
        }
    },

    CheckResults_fightList: function () {
        try {
            // get all buttons to check monsterObjectList
            var ss = document.evaluate(".//img[contains(@src,'dragon_list_btn_')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength === 0) {
                return false;
            }

            var page = gm.getValue('page', 'battle_monster');
            var firstMonsterButtonDiv = this.CheckForImage('dragon_list_btn_');
            if (!global.is_firefox) {
                if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + gm.getValue('FBID', 'x')) ||
                                                 firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                    gm.log('On another player\'s keep.');
                    return false;
                }
            } else {
                if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + unsafeWindow.Env.user) ||
                                                 firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                    gm.log('On another player\'s keep.');
                    return false;
                }
            }

            // Review monsters and find attack and fortify button
            var monsterList = [];
            for (var s = 0; s < ss.snapshotLength; s += 1) {
                var engageButtonName = ss.snapshotItem(s).src.match(/dragon_list_btn_\d/i)[0];
                var monsterRow = ss.snapshotItem(s).parentNode.parentNode.parentNode.parentNode;
                var monsterFull = $.trim(nHtml.GetText(monsterRow));
                var monster = $.trim(monsterFull.replace('Completed!', '').replace(/Fled!/i, ''));
                monsterList.push(monster);
                // Make links for easy clickin'
                var url = ss.snapshotItem(s).parentNode.href;
                if (!(url && url.match(/user=/) && (url.match(/mpool=/) || url.match(/raid\.php/)))) {
                    continue;
                }

                gm.setListObjVal('monsterOl', monster, 'page', page);
                switch (engageButtonName) {
                case 'dragon_list_btn_2' :
                    gm.setListObjVal('monsterOl', monster, 'status', 'Collect Reward');
                    gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                    break;
                case 'dragon_list_btn_3' :
                    this.monsterEngageButtons[monster] = ss.snapshotItem(s);
                    break;
                case 'dragon_list_btn_4' :
                    if (page == 'raid' && !(/!/.test(monsterFull))) {
                        this.monsterEngageButtons[monster] = ss.snapshotItem(s);
                        break;
                    }

                    if (!this.completeButton[page]) {
                        this.completeButton[page] = this.CheckForImage('cancelButton.gif', monsterRow);
                    }

                    gm.setListObjVal('monsterOl', monster, 'status', 'Complete');
                    gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                    break;
                default :
                }

                var mpool = ((url.match(/mpool=\d+/i)) ? '&mpool=' + url.match(/mpool=\d+/i)[0].split('=')[1] : '');
                var monstType = this.getMonstType(monster);
                var siege = '';
                if (monstType == 'Siege') {
                    siege = "&action=doObjective";
                } else {
                    var boss = this.monsterInfo[monstType];
                    siege = (boss && boss.siege) ? "&action=doObjective" : '';
                }

                var link = "<a href='http://apps.facebook.com/castle_age/" + page +
                        ".php?user=" + url.match(/user=\d+/i)[0].split('=')[1] +
                        mpool + siege + "'>Link</a>";
                gm.setListObjVal('monsterOl', monster, 'Link', link);
            }
            gm.setValue('reviewDone', 1);

            gm.getList('monsterOl').forEach(function (monsterObj) {
                var monster = monsterObj.split(global.vs)[0];
                if (monsterObj.indexOf(global.vs + 'page' + global.ls) < 0) {
                    gm.deleteListObj('monsterOl', monster);
                } else if (monsterList.indexOf(monster) < 0 && monsterObj.indexOf('page' + global.ls + page) >= 0) {
                    gm.deleteListObj('monsterOl', monster);
                }
            });

            //gm.setValue('resetdashboard',true);
            return true;
        } catch (err) {
            gm.log("ERROR in CheckResults_fightList: " + err);
            return false;
        }
    },

    t2kCalc: function (boss, time, percentHealthLeft, siegeStage, clicksNeededInCurrentStage) {
        try {
            var timeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
            var timeUsed = (boss.duration - timeLeft);
            if (!boss.siege || !boss.hp) {
                return Math.round((percentHealthLeft * timeUsed / (100 - percentHealthLeft)) * 10) / 10;
            }

            var T2K = 0;
            var damageDone = (100 - percentHealthLeft) / 100 * boss.hp;
            var hpLeft = boss.hp - damageDone;
            var totalSiegeDamage = 0;
            var totalSiegeClicks = 0;
            var attackDamPerHour = 0;
            var clicksPerHour = 0;
            var clicksToNextSiege = 0;
            var nextSiegeAttackPlusSiegeDamage = 0;
            for (var s in boss.siegeClicks) {
                if (boss.siegeClicks.hasOwnProperty(s)) {
                    //gm.log('s ' + s + ' T2K ' + T2K+ ' hpLeft ' + hpLeft);
                    if (s < siegeStage - 1  || clicksNeededInCurrentStage === 0) {
                        totalSiegeDamage += boss.siegeDam[s];
                        totalSiegeClicks += boss.siegeClicks[s];
                    }

                    if (s == siegeStage - 1) {
                        attackDamPerHour = (damageDone - totalSiegeDamage) / timeUsed;
                        clicksPerHour = (totalSiegeClicks + boss.siegeClicks[s] - clicksNeededInCurrentStage) / timeUsed;
                        //gm.log('Attack Damage Per Hour: ' + attackDamPerHour + ' Damage Done: ' + damageDone + ' Total Siege Damage: ' + totalSiegeDamage + ' Time Used: ' + timeUsed + ' Clicks Per Hour: ' + clicksPerHour);
                    }

                    if (s >= siegeStage - 1) {
                        clicksToNextSiege = (s == siegeStage - 1) ? clicksNeededInCurrentStage : boss.siegeClicks[s];
                        nextSiegeAttackPlusSiegeDamage = boss.siegeDam[s] + clicksToNextSiege / clicksPerHour * attackDamPerHour;
                        if (hpLeft <= nextSiegeAttackPlusSiegeDamage || clicksNeededInCurrentStage === 0) {
                            T2K +=  hpLeft / attackDamPerHour;
                            break;
                        }

                        T2K += clicksToNextSiege / clicksPerHour;
                        hpLeft -= nextSiegeAttackPlusSiegeDamage;
                    }
                }
            }

            var t2kValue = Math.round(T2K * 10) / 10;
            gm.log('T2K based on siege: ' + t2kValue + ' T2K estimate without calculating siege impacts: ' + Math.round(percentHealthLeft / (100 - percentHealthLeft) * timeLeft * 10) / 10);
            return t2kValue;
        } catch (err) {
            gm.log("ERROR in t2kCalc: " + err);
            return 0;
        }
    },

    CheckResults_viewFight: function () {
        try {
            // Check if on monster page (nm_top.jpg for Volcanic Dragon)
            // (nm_top_2.jpg for Alpha Volcanic Dragon)
            var webSlice = this.CheckForImage('dragon_title_owner.jpg');
            if (!webSlice) {
                webSlice = this.CheckForImage('nm_top.jpg');
                if (!webSlice) {
                    webSlice = this.CheckForImage('nm_top_2.jpg');
                    if (!webSlice) {
                        gm.log('Can not find identifier for monster fight page.');
                        return;
                    }
                }
            }

            var yourRegEx = new RegExp(".+'s ");
            // Get name and type of monster
            var monster = nHtml.GetText(webSlice);
            if (this.CheckForImage('nm_volcanic_title.jpg')) {
                monster = monster.match(yourRegEx) + 'Bahamut, the Volcanic Dragon';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_volcanic_title_2.jpg')) {
                monster = monster.match(yourRegEx) + 'Alpha Bahamut, the Volcanic Dragon';
                monster = $.trim(monster);
            } else if (this.CheckForImage('nm_azriel_title.jpg')) {
                monster = monster.match(yourRegEx) + 'Azriel, the Angel of Wrath';
                monster = $.trim(monster);
            } else {
                monster = $.trim(monster.substring(0, monster.indexOf('You have (')));
            }

            var fort = null;
            var monstType = '';
            if (this.CheckForImage('raid_1_large.jpg')) {
                monstType = 'Raid I';
            } else if (this.CheckForImage('raid_b1_large.jpg')) {
                monstType = 'Raid II';
            } else if (this.CheckForImage('nm_volcanic_large_2.jpg')) {
                monstType = 'Alpha Volcanic Dragon';
            } else if (this.CheckForImage('nm_azriel_large2.jpg')) {
                monstType = 'Wrath';
            } else {
                monstType = this.getMonstType(monster);
            }

            if (!global.is_firefox) {
                if (nHtml.FindByAttr(webSlice, 'img', 'uid', gm.getValue('FBID', 'x'))) {
                    monster = monster.replace(yourRegEx, 'Your ');
                }
            } else {
                if (nHtml.FindByAttr(webSlice, 'img', 'uid', unsafeWindow.Env.user)) {
                    monster = monster.replace(yourRegEx, 'Your ');
                }
            }

            var now = (new Date().getTime());
            gm.setListObjVal('monsterOl', monster, 'review', now.toString());
            gm.setValue('monsterRepeatCount', 0);
            var lastDamDone = gm.getListObjVal('monsterOl', monster, 'Damage', 0);
            gm.setListObjVal('monsterOl', monster, 'Type', monstType);
            // Extract info
            var time = [];
            //var monsterTicker1 = nHtml.FindByAttrContains(document.body, "div", "id", "app46755028429_monsterTicker");
            //var monsterTicker2 = nHtml.FindByAttrContains(document.body, "span", "id", "app46755028429_monsterTicker");
            //if (monsterTicker1 || monsterTicker2) {
            var monsterTicker = $("#app46755028429_monsterTicker");
            if (monsterTicker.length) {
                //gm.log("Monster ticker found.");
                time = monsterTicker.text().split(":");
            } else {
                gm.log("Could not locate Monster ticker.");
            }

            var boss_name = '';
            var boss = '';
            var group_name = '';
            var attacker = '';
            var currentPhase = 0;
            var miss = '';
            var fortPct = null;
            if (time.length == 3 && this.monsterInfo[monstType] && this.monsterInfo[monstType].fort) {
                if (monstType == "Deathrune" || monstType == 'Ice Elemental') {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', 100);
                } else {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', 0);
                }

                // Check for mana forcefield
                var img = this.CheckForImage('bar_dispel');
                if (img) {
                    var manaHealth = img.parentNode.style.width;
                    manaHealth = manaHealth.substring(0, manaHealth.length - 1);
                    fortPct = 100 - Number(manaHealth);
                } else {
                    // Check fortify stuff
                    img = this.CheckForImage('seamonster_ship_health');
                    if (img) {
                        var shipHealth = img.parentNode.style.width;
                        fortPct = shipHealth.substring(0, shipHealth.length - 1);
                        if (monstType == "Legion" || monstType.indexOf('Elemental') >= 0) {
                            img = this.CheckForImage('repair_bar_grey');
                            if (img) {
                                var extraHealth = img.parentNode.style.width;
                                extraHealth = extraHealth.substring(0, extraHealth.length - 1);
                                fortPct = Math.round(Number(fortPct) * (100 / (100 - Number(extraHealth))));
                            }
                        }
                    } else {
                        // Check party health - Volcanic dragon
                        img = this.CheckForImage('nm_green');
                        if (img) {
                            var partyHealth = img.parentNode.style.width;
                            fortPct = partyHealth.substring(0, partyHealth.length - 1);
                        }
                    }
                }

                if (fortPct !== null) {
                    gm.setListObjVal('monsterOl', monster, 'Fort%', (Math.round(fortPct * 10)) / 10);
                }
            }

            var damDone = 0;
            // Get damage done to monster
            webSlice = nHtml.FindByAttrContains(document.body, "td", "class", "dragonContainer");
            if (webSlice) {
                webSlice = nHtml.FindByAttrContains(webSlice, "td", "valign", "top");
                if (webSlice) {
                    if (!global.is_firefox) {
                        webSlice = nHtml.FindByAttrContains(webSlice, "a", "href", "keep.php?user=" + gm.getValue('FBID', 'x'));
                    } else {
                        webSlice = nHtml.FindByAttrContains(webSlice, "a", "href", "keep.php?user=" + unsafeWindow.Env.user);
                    }

                    if (webSlice) {
                        var damList = null;
                        if (monstType == "Serpent" || monstType.indexOf('Elemental') >= 0 || monstType == "Deathrune") {
                            //damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling)).split("/");
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.parentNode.nextSibling.nextSibling)).split("/");
                            fort = this.NumberOnly(damList[1]);
                            damDone = this.NumberOnly(damList[0]) + fort;
                            gm.setListObjVal('monsterOl', monster, 'Fort', fort);
                        } else if (monstType == "Siege" || monstType == "Raid I" || monstType == "Raid II") {
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling));
                            damDone = this.NumberOnly(damList);
                        } else {
                            //damList = $.trim(nHtml.GetText(webSlice.parentNode.nextSibling.nextSibling));
                            damList = $.trim(nHtml.GetText(webSlice.parentNode.parentNode.nextSibling.nextSibling));
                            damDone = this.NumberOnly(damList);
                        }

                        gm.setListObjVal('monsterOl', monster, 'Damage', damDone);
                        //if (damDone) gm.log("Damage done = " + gm.getListObjVal('monsterOl',monster,'Damage'));
                    } else {
                        gm.log("Player hasn't done damage yet");
                    }
                } else {
                    gm.log("couldn't get top table");
                }
            } else {
                gm.log("couldn't get dragoncontainer");
            }

            var monsterConditions = gm.getListObjVal('monsterOl', monster, 'conditions', '');
            if (/:ac\b/.test(monsterConditions)) {
                var counter = parseInt(gm.getValue('monsterReviewCounter', -3), 10);
                var monsterList = gm.getList('monsterOl');
                if (counter >= 0 && monsterList[counter].indexOf(monster) >= 0 &&
                    (nHtml.FindByAttrContains(document.body, 'a', 'href', '&action=collectReward') ||
                     nHtml.FindByAttrContains(document.body, 'input', 'alt', 'Collect Reward'))) {
                    gm.log('Collecting Reward');
                    gm.setListObjVal('monsterOl', monster, 'review', "1");
                    gm.setValue('monsterReviewCounter', counter -= 1);
                    gm.setListObjVal('monsterOl', monster, 'status', 'Collect Reward');
                    if (monster.indexOf('Siege') >= 0) {
                        if (nHtml.FindByAttrContains(document.body, 'a', 'href', '&rix=1')) {
                            gm.setListObjVal('monsterOl', monster, 'rix', 1);
                        } else {
                            gm.setListObjVal('monsterOl', monster, 'rix', 2);
                        }
                    }
                }
            }

            var hp = 0;
            var monstHealthImg = '';
            if (monstType.indexOf('Volcanic') >= 0 || monstType.indexOf('Wrath') >= 0) {
                monstHealthImg = 'nm_red.jpg';
            } else {
                monstHealthImg = 'monster_health_background.jpg';
            }

            if (time.length == 3 && this.CheckForImage(monstHealthImg)) {
                gm.setListObjVal('monsterOl', monster, 'TimeLeft', time[0] + ":" + time[1]);
                var hpBar = null;
                var imgHealthBar = nHtml.FindByAttrContains(document.body, "img", "src", monstHealthImg);
                if (imgHealthBar) {
                    //gm.log("Found monster health div.");
                    var divAttr = imgHealthBar.parentNode.getAttribute("style").split(";");
                    var attrWidth = divAttr[1].split(":");
                    hpBar = $.trim(attrWidth[1]);
                } else {
                    gm.log("Could not find monster health div.");
                }

                if (hpBar) {
                    hp = Math.round(hpBar.replace(/%/, '') * 10) / 10; //fix two 2 decimal places
                    gm.setListObjVal('monsterOl', monster, 'Damage%', hp);
                    boss = this.monsterInfo[monstType];
                    if (!boss) {
                        gm.log('Unknown monster');
                        return;
                    }
                }

                if (boss && boss.siege) {
                    var missRegEx = new RegExp(".*Need (\\d+) more.*");
                    if (monstType.indexOf('Volcanic') >= 0 || monstType.indexOf('Wrath') >= 0) {
                        miss = $.trim($("#app46755028429_action_logs").prev().children().eq(1).children().eq(3).text().replace(missRegEx, "$1"));
                        if (monstType.indexOf('Alpha') >= 0 || monstType.indexOf('Wrath') >= 0) {
                            var waterCount = $("img[src*=" + boss.siege_img + "]").size();
                            var alphaCount = $("img[src*=" + boss.siege_img2 + "]").size();
                            var totalCount = waterCount + alphaCount;
                            currentPhase = Math.min(totalCount, boss.siege);
                        } else {
                            currentPhase = Math.min($("img[src*=" + boss.siege_img + "]").size(), boss.siege);
                        }
                    } else {
                        if (monstType.indexOf('Raid') >= 0) {
                            miss = $.trim($("img[src*=" + boss.siege_img + "]").parent().parent().text().replace(missRegEx, "$1"));
                        } else {
                            miss = $.trim($("#app46755028429_action_logs").prev().children().eq(3).children().eq(2).children().eq(1).text().replace(missRegEx, "$1"));
                        }

                        var divSeigeLogs = document.getElementById("app46755028429_siege_log");
                        if (divSeigeLogs && !currentPhase) {
                            //gm.log("Found siege logs.");
                            var divSeigeCount = divSeigeLogs.getElementsByTagName("div").length;
                            if (divSeigeCount) {
                                currentPhase = Math.round(divSeigeCount / 4) + 1;
                            } else {
                                gm.log("Could not count siege logs.");
                            }
                        } else {
                            gm.log("Could not find siege logs.");
                        }
                    }

                    var phaseText = Math.min(currentPhase, boss.siege) + "/" + boss.siege + " need " + (isNaN(miss) ? 0 : miss);
                    gm.setListObjVal('monsterOl', monster, 'Phase', phaseText);
                }

                if (boss) {
                    if (isNaN(miss)) {
                        miss = 0;
                    }

                    var T2K = this.t2kCalc(boss, time, hp, currentPhase, miss);
                    gm.setListObjVal('monsterOl', monster, 'T2K', T2K.toString() + ' hr');
                }
            } else {
                gm.log('Monster is dead or fled');
                gm.setListObjVal('monsterOl', monster, 'color', 'grey');
                var dofCheck = gm.getListObjVal('monsterOl', monster, 'status');
                if (dofCheck != 'Complete' && dofCheck != 'Collect Reward') {
                    gm.setListObjVal('monsterOl', monster, 'status', "Dead or Fled");
                }

                gm.setValue('resetselectMonster', true);
                return;
            }

            boss = this.monsterInfo[monstType];
            var achLevel = this.parseCondition('ach', monsterConditions);
            if (boss && achLevel === false) {
                achLevel = boss.ach;
            }

            var maxDamage = this.parseCondition('max', monsterConditions);
            fortPct = gm.getListObjVal('monsterOl', monster, 'Fort%', '');
            var maxToFortify = (this.parseCondition('f%', monsterConditions) !== false) ? this.parseCondition('f%', monsterConditions) : gm.getNumber('MaxToFortify', 0);
            var isTarget = (monster == gm.getValue('targetFromraid', '') ||
                    monster == gm.getValue('targetFrombattle_monster', '') ||
                    monster == gm.getValue('targetFromfortify', ''));
            if (monster == gm.getValue('targetFromfortify', '') && fortPct > maxToFortify) {
                gm.setValue('resetselectMonster', true);
            }

            // Start of Keep On Budget (KOB) code Part 1 -- required variables

            gm.log('Start of Keep On Budget (KOB) Code');

            //default is disabled for everything
            var KOBenable = false;

            //default is zero bias hours for everything
            var KOBbiasHours = 0;

            //KOB needs to follow achievment mode for this monster so that KOB can be skipped.
            var KOBach = false;

            //KOB needs to follow max mode for this monster so that KOB can be skipped.
            var KOBmax = false;

            //KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
            var KOBminFort = false;

            //create a temp variable so we don't need to call parseCondition more than once for each if statement
            var KOBtmp = this.parseCondition('kob', monsterConditions);
            if (isNaN(KOBtmp)) {
                gm.log('NaN branch');
                KOBenable = true;
                KOBbiasHours = 0;
            } else if (!KOBtmp) {
                gm.log('false branch');
                KOBenable = false;
                KOBbiasHours = 0;
            } else {
                gm.log('passed value branch');
                KOBenable = true;
                KOBbiasHours = KOBtmp;
            }

            //disable kob if in level up mode or if we are within 5 stamina of max potential stamina
            if (this.InLevelUpMode() || this.stats.stamina.num >= this.stats.stamina.max - 5) {
                KOBenable = false;
            }
            gm.log('Level Up Mode: ' + this.InLevelUpMode() + ' Stamina Avail: ' + this.stats.stamina.num + ' Stamina Max: ' + this.stats.stamina.max);

            //log results of previous two tests
            gm.log('KOBenable: ' + KOBenable + ' KOB Bias Hours: ' + KOBbiasHours);

            //Total Time alotted for monster
            var KOBtotalMonsterTime = this.monsterInfo[monstType].duration;
            gm.log('Total Time for Monster: ' + KOBtotalMonsterTime);

            //Total Damage remaining
            gm.log('HP left: ' + hp);

            //Time Left Remaining
            var KOBtimeLeft = parseInt(time[0], 10) + (parseInt(time[1], 10) * 0.0166);
            gm.log('TimeLeft: ' + KOBtimeLeft);

            //calculate the bias offset for time remaining
            var KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

            //Percentage of time remaining for the currently selected monster
            var KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
            gm.log('Percent Time Remaining: ' + KOBPercentTimeRemaining);

            // End of Keep On Budget (KOB) code Part 1 -- required variables

            if (maxDamage && damDone >= maxDamage) {
                gm.setListObjVal('monsterOl', monster, 'color', 'red');
                gm.setListObjVal('monsterOl', monster, 'over', 'max');
                //used with KOB code
                KOBmax = true;
                //used with kob debugging
                gm.log('KOB - max activated');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                }
            } else if ((fortPct) && fortPct < gm.getNumber('MinFortToAttack', 1)) {
                gm.setListObjVal('monsterOl', monster, 'color', 'purple');
                //used with KOB code
                KOBminFort = true;
                //used with kob debugging
                gm.log('KOB - MinFort activated');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                }
            } else if (damDone >= achLevel && gm.getValue('AchievementMode')) {
                gm.setListObjVal('monsterOl', monster, 'color', 'orange');
                gm.setListObjVal('monsterOl', monster, 'over', 'ach');
                //used with KOB code
                KOBach = true;
                //used with kob debugging
                gm.log('KOB - achievement reached');
                if (isTarget && lastDamDone < achLevel) {
                    gm.setValue('resetselectMonster', true);
                }
            }
            //Start of KOB code Part 2 begins here
            if (KOBenable && !KOBmax && !KOBminFort && KOBach && hp < KOBPercentTimeRemaining) {
                //need to figure out a color for kob 'someday' - borrowing max's color for now
                gm.setListObjVal('monsterOl', monster, 'color', 'red');
                // this line is required or we attack anyway.
                gm.setListObjVal('monsterOl', monster, 'over', 'max');
                //used with kob debugging
                gm.log('KOB - budget reached');
                if (isTarget) {
                    gm.setValue('resetselectMonster', true);
                    gm.log('This monster no longer a target due to kob');
                }

            } else {
                if (!KOBmax && !KOBminFort && !KOBach) {
                    //the way that the if statements got stacked, if it wasn't kob it was painted black anyway
                    //had to jump out the black paint if max, ach or fort needed to paint the entry.
                    gm.setListObjVal('monsterOl', monster, 'color', 'black');
                }
            }
            //End of KOB code Part 2 stops here.

            if (this.CheckTimer('battleTimer')) {
                window.setTimeout(function () {
                    caap.SetDivContent('monster_mess', '');
                }, 2000);
            }
        } catch (err) {
            gm.log("ERROR in CheckResults_viewFight: " + err);
        }
    },

    selectMonster: function () {
        try {
            if (!this.oneMinuteUpdate('selectMonster')) {
                return;
            }

            //gm.log('Selecting monster');
            // First we forget everything about who we already picked.
            gm.setValue('targetFrombattle_monster', '');
            gm.setValue('targetFromfortify', '');
            gm.setValue('targetFromraid', '');

            // Next we get our monster objects from the reposoitory and break them into separarte lists
            // for monster or raid.  If we are serializing then we make one list only.
            var monsterList = {};
            monsterList.battle_monster = [];
            monsterList.raid = [];
            monsterList.any = [];
            var monsterFullList = gm.getList('monsterOl');
            var monstPage = '';
            monsterFullList.forEach(function (monsterObj) {
                gm.setListObjVal('monsterOl', monsterObj.split(global.vs)[0], 'conditions', 'none');
                monstPage = gm.getObjVal(monsterObj, 'page');
                if (gm.getValue('SerializeRaidsAndMonsters', false)) {
                    monsterList.any.push(monsterObj);
                } else if ((monstPage == 'raid') || (monstPage == 'battle_monster')) {
                    monsterList[monstPage].push(monsterObj);
                }
            });

            //PLEASE NOTE BEFORE CHANGING
            //The Serialize Raids and Monsters dictates a 'single-pass' because we only need select
            //one "targetFromxxxx" to fill in. The other MUST be left blank. This is what keeps it
            //serialized!!! Trying to make this two pass logic is like trying to fit a square peg in
            //a round hole. Please reconsider before doing so.
            var selectTypes = [];
            if (gm.getValue('SerializeRaidsAndMonsters', false)) {
                selectTypes = ['any'];
            } else {
                selectTypes = ['battle_monster', 'raid'];
            }

            // We loop through for each selection type (only once if serialized between the two)
            // We then read in the users attack order list
            for (var s in selectTypes) {
                if (selectTypes.hasOwnProperty(s)) {
                    var selectType = selectTypes[s];
                    var firstOverAch = '';
                    var firstUnderMax = '';
                    var firstFortOverAch = '';
                    var firstFortUnderMax = '';
                    var attackOrderList = [];
                    // The extra apostrophe at the end of attack order makes it match any "soandos's monster" so it always selects a monster if available
                    if (selectType == 'any') {
                        var attackOrderList1 = gm.getListFromText('orderbattle_monster', '');
                        var attackOrderList2 = gm.getListFromText('orderraid', '').concat('your', "'");
                        attackOrderList = attackOrderList1.concat(attackOrderList2);
                    } else {
                        attackOrderList = gm.getListFromText('order' + selectType, '').concat('your', "'");
                    }

                    var monster = '';
                    var monsterConditions = '';
                    var monstType = '';
                    // Next we step through the users list getting the name and conditions
                    for (var p in attackOrderList) {
                        if (attackOrderList.hasOwnProperty(p)) {
                            var attackOrderName = $.trim(attackOrderList[p].match(new RegExp("^[^:]+")).toString()).toLowerCase();
                            monsterConditions = $.trim(attackOrderList[p].replace(new RegExp("^[^:]+"), '').toString());
                            var monsterListCurrent = monsterList[selectType];
                            // Now we try to match the users name agains our list of monsters
                            for (var m in monsterListCurrent) {
                                if (monsterListCurrent.hasOwnProperty(m)) {
                                    var monsterObj = monsterListCurrent[m];
                                    monster = monsterObj.split(global.vs)[0];
                                    monstPage = gm.getObjVal(monsterObj, 'page');

                                    // If we set conditions on this monster already then we do not reprocess
                                    if (gm.getListObjVal('monsterOl', monster, 'conditions') != 'none') {
                                        continue;
                                    }

                                    //If this monster does not match, skip to next one
                                    // Or if this monster is dead, skip to next one
                                    // Or if this monster is not the correct type, skip to next one
                                    if ((monster.toLowerCase().indexOf(attackOrderName) < 0) || (selectType != 'any' && monstPage != selectType)) {
                                        continue;
                                    }

                                    //Monster is a match so we set the conditions
                                    gm.setListObjVal('monsterOl', monster, 'conditions', monsterConditions);

                                    // If it's complete or collect rewards, no need to process further
                                    var color = gm.getObjVal(monsterObj, 'color', '');
                                    if (color == 'grey') {
                                        continue;
                                    }

                                    // checkMonsterDamage would have set our 'color' and 'over' values. We need to check
                                    // these to see if this is the monster we should select/
                                    var over = gm.getObjVal(monsterObj, 'over', '');
                                    if (!firstUnderMax && color != 'purple') {
                                        if (over == 'ach') {
                                            if (!firstOverAch) {
                                                firstOverAch = monster;
                                            }
                                        } else if (over != 'max') {
                                            firstUnderMax = monster;
                                        }
                                    }

                                    var monsterFort = parseFloat(gm.getObjVal(monsterObj, 'Fort%', 0));
                                    var maxToFortify = (this.parseCondition('f%', monsterConditions)  !== false) ? this.parseCondition('f%', monsterConditions) : gm.getNumber('MaxToFortify', 0);
                                    monstType = this.getMonstType(monster);
                                    /*
                                    gm.log(monster + ' monsterFort < maxToFortify ' + (monsterFort < maxToFortify) + ' this.monsterInfo[monstType] ' +
                                        this.monsterInfo[monstType]+ ' this.monsterInfo[monstType].fort ' + this.monsterInfo[monstType].fort);
                                    */
                                    if (!firstFortUnderMax && monsterFort < maxToFortify &&
                                            monstPage == 'battle_monster' &&
                                            this.monsterInfo[monstType] &&
                                            this.monsterInfo[monstType].fort) {
                                        if (over == 'ach') {
                                            if (!firstFortOverAch) {
                                                //gm.log('hitit');
                                                firstFortOverAch = monster;
                                            }
                                        } else if (over != 'max') {
                                            //gm.log('norm hitit');
                                            firstFortUnderMax = monster;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Now we use the first under max/under achievement that we found. If we didn't find any under
                    // achievement then we use the first over achievement
                    monster = firstUnderMax;
                    if (!monster) {
                        monster = firstOverAch;
                    }

                    if (selectType != 'raid') {
                        gm.setValue('targetFromfortify', firstFortUnderMax);
                        if (!gm.getValue('targetFromfortify', '')) {
                            gm.setValue('targetFromfortify', firstFortOverAch);
                        }
                        //gm.log('fort under max ' + firstFortUnderMax + ' fort over Ach ' + firstFortOverAch + ' fort target ' + gm.getValue('targetFromfortify', ''));
                    }

                    // If we've got a monster for this selection type then we set the GM variables for the name
                    // and stamina requirements
                    if (monster) {
                        monstPage = gm.getListObjVal('monsterOl', monster, 'page');
                        gm.setValue('targetFrom' + monstPage, monster);
                        monsterConditions = gm.getListObjVal('monsterOl', monster, 'conditions');
                        monstType = gm.getListObjVal('monsterOl', monster, 'Type', '');
                        if (monstPage == 'battle_monster') {
                            var nodeNum = 0;
                            if (!this.InLevelUpMode() && this.monsterInfo[monstType] && this.monsterInfo[monstType].staLvl) {
                                for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                    if (this.stats.stamina.max > this.monsterInfo[monstType].staLvl[nodeNum]) {
                                        break;
                                    }
                                }
                            }

                            if (!this.InLevelUpMode() && this.monsterInfo[monstType] && this.monsterInfo[monstType].staMax && gm.getValue('PowerAttack') && gm.getValue('PowerAttackMax')) {
                                gm.setValue('MonsterStaminaReq', this.monsterInfo[monstType].staMax[nodeNum]);
                            } else if (this.monsterInfo[monstType] && this.monsterInfo[monstType].staUse) {
                                gm.setValue('MonsterStaminaReq', this.monsterInfo[monstType].staUse);
                            } else if ((this.InLevelUpMode() && this.stats.stamina.num >= 10) || monsterConditions.match(/:pa/i)) {
                                gm.setValue('MonsterStaminaReq', 5);
                            } else if (monsterConditions.match(/:sa/i)) {
                                gm.setValue('MonsterStaminaReq', 1);
                            } else if (gm.getValue('PowerAttack')) {
                                gm.setValue('MonsterStaminaReq', 5);
                            } else {
                                gm.setValue('MonsterStaminaReq', 1);
                            }

                            if (gm.getValue('MonsterGeneral') == 'Orc King') {
                                gm.setValue('MonsterStaminaReq', gm.getValue('MonsterStaminaReq') * 5);
                            }

                            if (gm.getValue('MonsterGeneral') == 'Barbarus') {
                                gm.setValue('MonsterStaminaReq', gm.getValue('MonsterStaminaReq') * 3);
                            }
                        } else {
                            // Switch RaidPowerAttack
                            if (gm.getValue('RaidPowerAttack', false) || monsterConditions.match(/:pa/i)) {
                                gm.setValue('RaidStaminaReq', 5);
                            } else if (this.monsterInfo[monstType] && this.monsterInfo[monstType].staUse) {
                                gm.setValue('RaidStaminaReq', this.monsterInfo[monstType].staUse);
                            } else {
                                gm.setValue('RaidStaminaReq', 1);
                            }
                        }
                    }
                }
            }

            gm.setValue('resetdashboard', true);
        } catch (err) {
            gm.log("ERROR in selectMonster: " + err);
        }
    },

    monsterConfirmRightPage: function (webSlice, monster) {
        try {
            // Confirm name and type of monster
            var yourRegEx = new RegExp(".+'s ");
            var monsterOnPage = nHtml.GetText(webSlice);
            if (this.CheckForImage('nm_volcanic_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Bahamut, the Volcanic Dragon';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_volcanic_title_2.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Alpha Bahamut, the Volcanic Dragon';
                monsterOnPage = $.trim(monsterOnPage);
            } else if (this.CheckForImage('nm_azriel_title.jpg')) {
                monsterOnPage = monsterOnPage.match(yourRegEx) + 'Azriel, the Angel of Wrath';
                monsterOnPage = $.trim(monsterOnPage);
            } else {
                monsterOnPage = $.trim(monsterOnPage.substring(0, monsterOnPage.indexOf('You have (')));
            }

            if (!global.is_firefox) {
                if (nHtml.FindByAttr(webSlice, 'img', 'uid', gm.getValue('FBID', 'x'))) {
                    monsterOnPage = monsterOnPage.replace(yourRegEx, 'Your ');
                }
            } else {
                if (nHtml.FindByAttr(webSlice, 'img', 'uid', unsafeWindow.Env.user)) {
                    monsterOnPage = monsterOnPage.replace(yourRegEx, 'Your ');
                }
            }

            if (monster != monsterOnPage) {
                gm.log('Looking for ' + monster + ' but on ' + monsterOnPage + '. Going back to select screen');
                var monstPage = gm.getListObjVal('monsterOl', monster, 'page');
                return this.NavigateTo('keep,' + monstPage);
            }

            return false;
        } catch (err) {
            gm.log("ERROR in monsterConfirmRightPage: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    MonsterReview is a primary action subroutine to mange the monster and raid list
    on the dashboard
    \-------------------------------------------------------------------------------------*/
    MonsterReview: function () {
        try {
            /*-------------------------------------------------------------------------------------\
            We do monster review once an hour.  Some routines may reset this timer to drive
            MonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
            if (!this.WhileSinceDidIt('monsterReview', 60 * 60)) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            We get the monsterReviewCounter.  This will be set to -3 if we are supposed to refresh
            the monsterOl completely. Otherwise it will be our index into how far we are into
            reviewing monsterOl.
            \-------------------------------------------------------------------------------------*/
            var counter = parseInt(gm.getValue('monsterReviewCounter', -3), 10);
            if (counter == -3) {
                gm.setValue('monsterOl', '');
                gm.setValue('monsterReviewCounter', counter += 1);
                return true;
            }

            if (counter == -2) {
                if (this.NavigateTo('battle_monster', 'tab_monster_on.jpg')) {
                    gm.setValue('reviewDone', 0);
                    return true;
                }

                if (gm.getValue('reviewDone', 1) > 0) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (counter == -1) {
                if (this.NavigateTo(this.battlePage + ',raid', 'tab_raid_on.gif')) {
                    gm.setValue('reviewDone', 0);
                    return true;
                }

                if (gm.getValue('reviewDone', 1) > 0) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                } else {
                    return true;
                }
            }

            if (!(gm.getValue('monsterOl', ''))) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            Now we step through the monsterOl objects. We set monsterReviewCounter to the next
            index for the next reiteration since we will be doing a click and return in here.
            \-------------------------------------------------------------------------------------*/
            var monsterObjList = gm.getList('monsterOl');
            while (counter < monsterObjList.length) {
                var monsterObj = monsterObjList[counter];
                if (!monsterObj) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                If we looked at this monster more recently than an hour ago, skip it
                \-------------------------------------------------------------------------------------*/
                if (!this.WhileSinceDidIt(gm.getObjVal(monsterObj, 'review'), 60 * 60) ||
                            gm.getValue('monsterRepeatCount', 0) > 2) {
                    gm.setValue('monsterReviewCounter', counter += 1);
                    gm.setValue('monsterRepeatCount', 0);
                    continue;
                }
                /*-------------------------------------------------------------------------------------\
                We get our monster link
                \-------------------------------------------------------------------------------------*/
                var monster = monsterObj.split(global.vs)[0];
                this.SetDivContent('monster_mess', 'Reviewing/sieging ' + (counter + 1) + '/' + monsterObjList.length + ' ' + monster);
                var link = gm.getObjVal(monsterObj, 'Link');
                /*-------------------------------------------------------------------------------------\
                If the link is good then we get the url and any conditions for monster
                \-------------------------------------------------------------------------------------*/
                if (/href/.test(link)) {
                    link = link.split("'")[1];
                    var conditions = gm.getObjVal(monsterObj, 'conditions');
                    /*-------------------------------------------------------------------------------------\
                    If the autocollect tyoken was specified then we set the link to do auto collect. If
                    the conditions indicate we should not do sieges then we fix the link.
                    \-------------------------------------------------------------------------------------*/
                    if ((conditions) && (/:ac\b/.test(conditions)) && gm.getObjVal(monsterObj, 'status') == 'Collect Reward') {
                        link += '&action=collectReward';
                        if (monster.indexOf('Siege') >= 0) {
                            link += '&rix=' + gm.getObjVal(monsterObj, 'rix', '2');
                        }

                        link = link.replace('&action=doObjective', '');
                    } else if (((conditions) && (conditions.match(':!s'))) || !gm.getValue('DoSiege', true) || this.stats.stamina.num === 0) {
                        link = link.replace('&action=doObjective', '');
                    }
                    /*-------------------------------------------------------------------------------------\
                    Now we use ajaxSendLink to display the monsters page.
                    \-------------------------------------------------------------------------------------*/
                    gm.log('Reviewing ' + (counter + 1) + '/' + monsterObjList.length + ' ' + monster);
                    gm.setValue('ReleaseControl', true);
                    link = link.replace('http://apps.facebook.com/castle_age/', '');
                    link = link.replace('?', '?twt2&');
                    //gm.log("Link: " + link);
                    //gm.setListObjVal('monsterOl', monster, 'review','pending');
                    this.ClickAjax(link);
                    gm.setValue('monsterRepeatCount', gm.getValue('monsterRepeatCount', 0) + 1);
                    gm.setValue('resetselectMonster', true);
                    gm.setValue('resetdashboard', true);
                    return true;
                }
            }
            /*-------------------------------------------------------------------------------------\
            All done.  Set timer and tell selectMonster and dashboard they need to do thier thing.
            We set the monsterReviewCounter to do a full refresh next time through.
            \-------------------------------------------------------------------------------------*/
            this.JustDidIt('monsterReview');
            gm.setValue('resetselectMonster', true);
            gm.setValue('resetdashboard', true);
            gm.setValue('monsterReviewCounter', -3);
            gm.log('Done with monster/raid review.');
            this.SetDivContent('monster_mess', '');
            return true;
        } catch (err) {
            gm.log("ERROR in MonsterReview: " + err);
            return false;
        }
    },

    Monsters: function () {
        try {
            if (gm.getValue('WhenMonster', '') == 'Never') {
                this.SetDivContent('monster_mess', 'Monster off');
                return false;
            }

            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (gm.getValue('WhenMonster') == 'Stay Hidden' && this.NeedToHide() && this.CheckStamina('Monster', 1)) {
                gm.log("Stay Hidden Mode: We're not safe. Go battle.");
                this.SetDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!this.CheckTimer('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval
            //gm.log(!this.InLevelUpMode() + " && " + this.stats.stamina.num + " >= " + (gm.getNumber('MonsterStaminaReq', 1) - 1) + " && " + this.CheckTimer('battleTimer') + " && " + gm.getNumber('seedTime', 0) > 0);
            if (!this.InLevelUpMode() && this.stats.stamina.num == (gm.getNumber('MonsterStaminaReq', 1) - 1) && this.CheckTimer('battleTimer') && gm.getNumber('seedTime', 0) > 0) {
                this.SetTimer('battleTimer', 5 * 60 + Math.floor(Math.random() * gm.getValue('seedTime', 0)));
                this.SetDivContent('monster_mess', 'Monster Delay Until ' + this.DisplayTimer('battleTimer'));
                return false;
            }

            if (!this.CheckTimer('battleTimer')) {
                if (this.stats.stamina.num < gm.getNumber('MaxIdleStamina', this.stats.stamina.max)) {
                    this.SetDivContent('monster_mess', 'Monster Delay Until ' + this.DisplayTimer('battleTimer'));
                    return false;
                }
            }

            var fightMode = '';
            // Check to see if we should fortify, attack monster, or battle raid
            var monster = gm.getValue('targetFromfortify');
            var monstType = this.getMonstType(monster);
            var nodeNum = 0;
            var staLvl = null;
            var energyRequire = 10;
            if (monstType) {
                staLvl = this.monsterInfo[monstType].staLvl;
                if (!this.InLevelUpMode() && gm.getValue('PowerFortifyMax') && staLvl) {
                    for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                        if (this.stats.stamina.max > this.monsterInfo[monstType].staLvl[nodeNum]) {
                            break;
                        }
                    }
                }

                if (nodeNum && gm.getValue('PowerAttackMax')) {
                    energyRequire = this.monsterInfo[monstType].nrgMax[nodeNum];
                }
            }

            if (monster && this.CheckEnergy(energyRequire, gm.getValue('WhenFortify', 'Energy Available'), 'fortify_mess')) {
                fightMode = gm.setValue('fightMode', 'Fortify');
            } else {
                monster = gm.getValue('targetFrombattle_monster');
                if (monster && this.CheckStamina('Monster', gm.getValue('MonsterStaminaReq', 1)) && gm.getListObjVal('monsterOl', monster, 'page') == 'battle_monster') {
                    fightMode = gm.setValue('fightMode', 'Monster');
                } else {
                    this.SetTimer('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            // Set right general
            //var monstType = gm.getListObjVal('monsterOl', monster, 'Type', 'Dragon');
            if (this.SelectGeneral(fightMode + 'General')) {
                return true;
            }

            monstType = this.getMonstType(monster);
            // Check if on engage monster page
            var imageTest = '';
            if (monstType == 'Volcanic Dragon' || monstType == 'Wrath') {
                imageTest = 'nm_top.jpg';
            } else if (monstType == 'Alpha Volcanic Dragon') {
                imageTest = 'nm_top_2.jpg';
            } else {
                imageTest = 'dragon_title_owner.jpg';
            }

            var webSlice = this.CheckForImage(imageTest);
            if (webSlice) {
                if (this.monsterConfirmRightPage(webSlice, monster)) {
                    return true;
                }

                var attackButton = null;
                var singleButtonList = [
                    'button_nm_p_attack.gif',
                    'attack_monster_button.jpg',
                    'event_attack1.gif',
                    'seamonster_attack.gif',
                    'event_attack2.gif',
                    'attack_monster_button2.jpg'
                ];
                var buttonList = [];
                // Find the attack or fortify button
                if (fightMode == 'Fortify') {
                    buttonList = [
                        'seamonster_fortify.gif',
                        "button_nm_s_",
                        'button_dispel.gif',
                        'attack_monster_button3.jpg'
                    ];
                } else if (gm.getValue('MonsterStaminaReq', 1) == 1) {
                    // not power attack only normal attacks
                    buttonList = singleButtonList;
                } else {
                    // power attack or if not seamonster power attack or if not regular attack -
                    // need case for seamonster regular attack?
                    buttonList = [
                        'button_nm_p_power',
                        'button_nm_p_',
                        'power_button_',
                        'attack_monster_button2.jpg',
                        'event_attack2.gif',
                        'seamonster_power.gif',
                        'event_attack1.gif',
                        'attack_monster_button.jpg'
                    ].concat(singleButtonList);
                }

                nodeNum = 0;
                staLvl = this.monsterInfo[monstType].staLvl;
                if (!this.InLevelUpMode()) {
                    if (((fightMode == 'Fortify' && gm.getValue('PowerFortifyMax')) || (fightMode != 'Fortify' && gm.getValue('PowerAttack') && gm.getValue('PowerAttackMax'))) && staLvl) {
                        for (nodeNum = this.monsterInfo[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (this.stats.stamina.max > this.monsterInfo[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }
                }

                for (var i in buttonList) {
                    if (buttonList.hasOwnProperty(i)) {
                        attackButton = this.CheckForImage(buttonList[i], null, null, nodeNum);
                        if (attackButton) {
                            break;
                        }
                    }
                }

                if (attackButton) {
                    var attackMess = '';
                    if (fightMode == 'Fortify') {
                        attackMess = 'Fortifying ' + monster;
                    } else {
                        attackMess = (gm.getValue('MonsterStaminaReq', 1) >= 5 ? 'Power' : 'Single') + ' Attacking ' + monster;
                    }

                    gm.log(attackMess);
                    this.SetDivContent('monster_mess', attackMess);
                    gm.setValue('ReleaseControl', true);
                    this.Click(attackButton, 8000);
                    return true;
                } else {
                    gm.log('ERROR - No button to attack/fortify with.');
                    this.SetTimer('NotargetFrombattle_monster', 60);
                    return false;
                }
            }

            ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\

            if (this.NavigateTo('keep,battle_monster', 'tab_monster_on.jpg')) {
                return true;
            }

            if (gm.getValue('clearCompleteMonsters', false) && this.completeButton.battle_monster) {
                this.Click(this.completeButton.battle_monster, 1000);
                gm.log('Cleared a completed monster');
                this.completeButton.battle_monster = '';
                return true;
            }

            var firstMonsterButtonDiv = this.CheckForImage('dragon_list_btn_');
            if (!global.is_firefox) {
                if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + gm.getValue('FBID', 'x')) ||
                        firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                    gm.log('On another player\'s keep.');
                    return this.NavigateTo('keep,battle_monster');
                }
            } else {
                if ((firstMonsterButtonDiv) && !(firstMonsterButtonDiv.parentNode.href.match('user=' + unsafeWindow.Env.user) ||
                                                 firstMonsterButtonDiv.parentNode.href.match(/alchemy\.php/))) {
                    gm.log('On another player\'s keep.');
                    return this.NavigateTo('keep,battle_monster');
                }
            }

            var engageButton = this.monsterEngageButtons[monster];
            if (engageButton) {
                this.SetDivContent('monster_mess', 'Opening ' + monster);
                this.Click(engageButton);
                return true;
            } else {
                this.SetTimer('NotargetFrombattle_monster', 60);
                gm.log('No "Engage" button for ' + monster);
                return false;
            }
        } catch (err) {
            gm.log("ERROR in Monsters: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          COMMON FIGHTING FUNCTIONS
    /////////////////////////////////////////////////////////////////////

    DemiPoints: function () {
        try {
            if (!gm.getValue('DemiPointsFirst')) {
                return false;
            }

            if (this.CheckForImage('battle_on.gif')) {
                var smallDeity = this.CheckForImage('symbol_tiny_1.jpg');
                if (smallDeity) {
                    var demiPointList = nHtml.GetText(smallDeity.parentNode.parentNode.parentNode).match(/\d+ \/ 10/g);
                    if (demiPointList) {
                        gm.setList('DemiPointList', demiPointList);
                        gm.log('DemiPointList: ' + demiPointList);
                        if (this.CheckTimer('DemiPointTimer')) {
                            gm.log('Set DemiPointTimer to 6 hours, and check if DemiPoints done');
                            this.SetTimer('DemiPointTimer', 6 * 60 * 60);
                        }

                        gm.setValue('DemiPointsDone', true);
                        for (var demiPtItem in demiPointList) {
                            if (demiPointList.hasOwnProperty(demiPtItem)) {
                                var demiPointStr = demiPointList[demiPtItem];
                                if (!demiPointStr) {
                                    gm.log("Continue due to demiPointStr: " + demiPointStr);
                                    continue;
                                }

                                var demiPoints = demiPointStr.split('/');
                                if (demiPoints.length != 2) {
                                    gm.log("Continue due to demiPoints: " + demiPoints);
                                    continue;
                                }

                                if (parseInt(demiPoints[0], 10) < 10 && gm.getValue('DemiPoint' + demiPtItem)) {
                                    gm.setValue('DemiPointsDone', false);
                                    break;
                                }
                            }
                        }

                        gm.log('Demi Point Timer ' + this.DisplayTimer('DemiPointTimer') + ' demipoints done is  ' + gm.getValue('DemiPointsDone', false));
                    } else {
                        gm.log("Unable to get demiPointList");
                    }
                }
            }

            if (this.CheckTimer('DemiPointTimer')) {
                return this.NavigateTo(this.battlePage, 'battle_on.gif');
            }

            if (!gm.getValue('DemiPointsDone', true)) {
                return this.Battle('DemiPoints');
            }

            return false;
        } catch (err) {
            gm.log("ERROR in DemiPoints: " + err);
            return false;
        }
    },

    minutesBeforeLevelToUseUpStaEnergy : 5,

    InLevelUpMode: function () {
        try {
            if (!gm.getValue('EnableLevelUpMode', true)) {
                //if levelup mode is false then new level up mode is also false (kob)
                this.newLevelUpMode = false;
                return false;
            }

            if (!(this.stats.levelTime)) {
                //if levelup mode is false then new level up mode is also false (kob)
                this.newLevelUpMode = false;
                return false;
            }

            var now = new Date();
            if ((this.stats.levelTime.getTime() - now.getTime()) < this.minutesBeforeLevelToUseUpStaEnergy * 60 * 1000) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!this.newLevelUpMode) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    this.newLevelUpMode = true;
                    this.refreshMonstersListener();
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            this.newLevelUpMode = false;
            return false;
        } catch (err) {
            gm.log("ERROR in InLevelUpMode: " + err);
            return false;
        }
    },

    CheckStamina: function (battleOrBattle, attackMinStamina) {
        try {
            if (!attackMinStamina) {
                attackMinStamina = 1;
            }

            var when = gm.getValue('When' + battleOrBattle, '');
            if (when == 'Never') {
                return false;
            }

            if (!this.stats.stamina || !this.stats.health) {
                this.SetDivContent('battle_mess', 'Health or stamina not known yet.');
                return false;
            }

            if (this.stats.health.num < 10) {
                this.SetDivContent('battle_mess', "Need health to fight: " + this.stats.health.num + "/10");
                return false;
            }

            if (when == 'At X Stamina') {
                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning stamina to level up');
                    return true;
                }
                var staminaMF = battleOrBattle + 'Stamina';
                if (gm.getValue('BurnMode_' + staminaMF, false) || this.stats.stamina.num >= gm.getValue('X' + staminaMF, 1)) {
                    if (this.stats.stamina.num < attackMinStamina || this.stats.stamina.num <= gm.getValue('XMin' + staminaMF, 0)) {
                        gm.setValue('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    //this.SetDivContent('battle_mess', 'Burning stamina');
                    gm.setValue('BurnMode_' + staminaMF, true);
                    return true;
                } else {
                    gm.setValue('BurnMode_' + staminaMF, false);
                }

                this.SetDivContent('battle_mess', 'Waiting for stamina: ' + this.stats.stamina.num + "/" + gm.getValue('X' + staminaMF, 1));
                return false;
            }

            if (when == 'At Max Stamina') {
                if (!gm.getValue('MaxIdleStamina', 0)) {
                    gm.log("Changing to idle general to get Max Stamina");
                    this.PassiveGeneral();
                }

                if (this.stats.stamina.num >= gm.getValue('MaxIdleStamina')) {
                    this.SetDivContent('battle_mess', 'Using max stamina');
                    return true;
                }

                if (this.InLevelUpMode() && this.stats.stamina.num >= attackMinStamina) {
                    this.SetDivContent('battle_mess', 'Burning all stamina to level up');
                    return true;
                }

                this.SetDivContent('battle_mess', 'Waiting for max stamina: ' + this.stats.stamina.num + "/" + gm.getValue('MaxIdleStamina'));
                return false;
            }

            if (this.stats.stamina.num >= attackMinStamina) {
                return true;
            }

            this.SetDivContent('battle_mess', 'Waiting for more stamina: ' + this.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            gm.log("ERROR in CheckStamina: " + err);
            return false;
        }
    },

    /*-------------------------------------------------------------------------------------\
    NeedToHide will return true if the current stamina and health indicate we need to bring
    our health down through battles (hiding).  It also returns true if there is no other outlet
    for our stamina (currently this just means Monsters, but will eventually incorporate
    other stamina uses).
    \-------------------------------------------------------------------------------------*/
    NeedToHide: function () {
        if (gm.getValue('WhenMonster', '') == 'Never') {
            gm.log('Stay Hidden Mode: Monster battle not enabled');
            return true;
        }

        if (!gm.getValue('targetFrombattle_monster', '')) {
            gm.log('Stay Hidden Mode: No monster to battle');
            return true;
        }
    /*-------------------------------------------------------------------------------------\
    The riskConstant helps us determine how much we stay in hiding and how much we are willing
    to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
    stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
    non-hiding activities.  The below matrix shows the default riskConstant of 1.7

                S   T   A   M   I   N   A
                1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
        H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
        E   11  -   -   +   +   +   +   +   +   +
        A   12  -   -   +   +   +   +   +   +   +
        L   13  -   -   +   +   +   +   +   +   +
        T   14  -   -   -   +   +   +   +   +   +
        H   15  -   -   -   +   +   +   +   +   +
            16  -   -   -   -   +   +   +   +   +
            17  -   -   -   -   -   +   +   +   +
            18  -   -   -   -   -   +   +   +   +

    Setting our riskConstant down to 1 will result in us spending out stamina to hide much
    more often:

                S   T   A   M   I   N   A
                1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
        H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
        E   11  -   -   +   +   +   +   +   +   +
        A   12  -   -   -   +   +   +   +   +   +
        L   13  -   -   -   -   +   +   +   +   +
        T   14  -   -   -   -   -   +   +   +   +
        H   15  -   -   -   -   -   -   +   +   +
            16  -   -   -   -   -   -   -   +   +
            17  -   -   -   -   -   -   -   -   +
            18  -   -   -   -   -   -   -   -   -

    \-------------------------------------------------------------------------------------*/
        var riskConstant = gm.getNumber('HidingRiskConstant', 1.7);
    /*-------------------------------------------------------------------------------------\
    The formula for determining if we should hide goes something like this:

        If  (health - (estimated dmg from next attacks) puts us below 10)  AND
            (current stamina will be at least 5 using staminatime/healthtime ratio)
        Then stamina can be used/saved for normal process
        Else stamina is used for us to hide

    \-------------------------------------------------------------------------------------*/
        if ((this.stats.health.num - ((this.stats.stamina.num - 1) * riskConstant) < 10) && (this.stats.stamina.num * (5 / 3) >= 5)) {
            return false;
        } else {
            return true;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          MONSTER FINDER
    /////////////////////////////////////////////////////////////////////

    mf_attackButton: null,

    monstArgs: {
        'doaid': {
            fname: 'Any Weapon Aid',
            sname: 'Aid',
            urlid: 'doObjective'
        },
        'urlix': {
            fname: 'Any Monster',
            sname: 'Any',
            urlid: 'user'
        },
        'legio': {
            fname: 'Battle of the Dark Legion',
            sname: 'Legion',
            nname: 'castle',
            imgid: 'cta_castle_',
            twt2: 'corc_'
        },
        'hydra': {
            fname: 'Cronus, The World Hydra ',
            sname: 'Cronus',
            nname: 'hydra',
            imgid: 'twitter_hydra_objective',
            twt2: 'hydra_'
        },
        /*
        'elems': {
            fname: 'Any Elemental',
            sname:'Elemental',
            nname:'elems',
            imgid:'',
            twt2: ''
        },
        */
        'earth': {
            fname: 'Genesis, The Earth Elemental ',
            sname: 'Genesis',
            nname: 'earthelemental',
            imgid: 'cta_earth_',
            twt2: 'earth_'
        },
        'ice': {
            fname: 'Ragnarok, The Ice Elemental ',
            sname: 'Ragnarok',
            nname: 'iceelemental',
            imgid: 'cta_water_',
            twt2: 'water_'
        },
        'kull': {
            fname: 'Kull, the Orc Captain',
            sname: 'Kull',
            nname: 'captain',
            imgid: 'cta_orc_captain.gif',
            twt2: 'bosscaptain'
        },
        'gilda': {
            fname: 'Gildamesh, the Orc King',
            sname: 'Gildamesh',
            nname: 'king',
            imgid: 'cta_orc_king.gif',
            twt2: 'bossgilda'
        },
        'colos': {
            fname: 'Colossus of Terra',
            sname: 'Colossus',
            nname: 'stone',
            imgid: 'cta_stone.gif',
            twt2: 'bosscolossus'
        },
        'sylva': {
            fname: 'Sylvanas the Sorceress Queen',
            sname: 'Sylvanas',
            nname: 'sylvanas',
            imgid: 'cta_sylvanas.gif',
            twt2: 'bosssylvanus'
        },
        'mephi': {
            fname: 'Mephistophles',
            sname: 'Mephisto',
            nname: 'mephi',
            imgid: 'cta_mephi.gif',
            twt2: 'bossmephistopheles'
        },
        'keira': {
            fname: 'Keira',
            sname: 'keira',
            nname: 'keira',
            imgid: 'cta_keira.gif',
            twt2: 'boss_img'
        },
        'lotus': {
            fname: 'Lotus Ravenmoore',
            sname: 'Ravenmoore',
            nname: 'lotus',
            imgid: 'cta_lotus.gif',
            twt2: 'bosslotus_'
        },
        'skaar': {
            fname: 'Skaar Deathrune',
            sname: 'Deathrune',
            nname: 'skaar',
            imgid: 'cta_death_',
            twt2: 'death_',
            deadimg: 'cta_death_dead.gif'
        },
        'serps': {
            fname: 'Any Serpent',
            sname: 'Serpent',
            nname: 'seamonster',
            imgid: 'twitter_seamonster_',
            twt2: 'sea_'
        },
        'eserp': {
            fname: 'Emerald Serpent',
            sname: 'Emerald Serpent',
            nname: 'greenseamonster',
            imgid: 'twitter_seamonster_green_1',
            twt2: 'sea_'
        },
        'sserp': {
            fname: 'Saphire Serpent',
            sname: 'Saphire Serpent',
            nname: 'blueseamonster',
            imgid: 'twitter_seamonster_blue_1',
            twt2: 'sea_'
        },
        'aserp': {
            fname: 'Amethyst Serpent',
            sname: 'Amethyst Serpent',
            nname: 'purpleseamonster',
            imgid: 'twitter_seamonster_purple_1',
            twt2: 'sea_'
        },
        'rserp': {
            fname: 'Ancient Serpent',
            sname: 'Ancient Serpent',
            nname: 'redseamonster',
            imgid: 'twitter_seamonster_red_1',
            twt2: 'sea_'
        },
        'drags': {
            fname: 'Any Dragon',
            sname: 'Dragon',
            nname: 'drag',
            imgid: '_dragon.gif',
            twt2: 'dragon_'
        },
        'edrag': {
            fname: 'Emerald Dragon',
            sname: 'Emerald Dragon',
            nname: 'greendragon',
            imgid: 'cta_green_dragon.gif',
            twt2: 'dragon_'
        },
        'fdrag': {
            fname: 'Frost Dragon',
            sname: 'Frost Dragon',
            nname: 'bluedragon',
            imgid: 'cta_blue_dragon.gif',
            twt2: 'dragon_'
        },
        'gdrag': {
            fname: 'Gold Dragon',
            sname: 'Gold Dragon',
            nname: 'yellowdragon',
            imgid: 'cta_yellow_dragon.gif"',
            twt2: 'dragon_'
        },
        'rdrag': {
            fname: 'Ancient Red Dragon',
            sname: 'Red Dragon',
            nname: 'reddragon',
            imgid: 'cta_red_dragon.gif',
            twt2: 'dragon_'
        },
        'deas': {
            fname: 'Any Deathrune Raid',
            sname: 'Deathrune Raid',
            nname: 'deathrune',
            imgid: 'raid_deathrune_',
            twt2: 'deathrune_'
        },
        'a1dea': {
            fname: 'Deathrune Raid I Part 1',
            sname: 'Deathrune Raid A1',
            nname: 'deathrunea1',
            imgid: 'raid_deathrune_a1.gif',
            twt2: 'deathrune_'
        },
        'a2dea': {
            fname: 'Deathrune Raid I Part 2',
            sname: 'Deathrune Raid A2',
            nname: 'deathrunea2',
            imgid: 'raid_deathrune_a2.gif',
            twt2: 'deathrune_'
        },
        'b1dea': {
            fname: 'Deathrune Raid II Part 1',
            sname: 'Deathrune Raid B1',
            nname: 'deathruneb1',
            imgid: 'raid_deathrune_b1.gif',
            twt2: 'deathrune_'
        },
        'b2dea': {
            fname: 'Deathrune Raid II Part 2',
            sname: 'Deathrune Raid B2',
            nname: 'deathruneb2',
            imgid: 'raid_deathrune_b2.gif',
            twt2: 'deathrune_'
        }
    },

    monstGroups: {
        'doaid': {
            monst: 'legio~hydra~earth~ice~sylva~skaar~a1dea~a2dea~b1dea~b2dea'
        },
        'world': {
            monst: 'legio~hydra~earth~ice',
            max: '5'
        },
        'serps': {
            monst: 'eserp~sserp~aserp~rserp'
        },
        'drags': {
            monst: 'edrag~fdrag~gdrag~rdrag'
        },
        'deas': {
            monst: 'a1dea~a2dea~b1dea~b2dea'
        },
        'elems': {
            monst: 'earth~ice'
        }
    },

    MonsterFinder: function () {
        if (!gm.getValue("MonsterFinderUse", false) || this.stats.stamina.num < gm.getValue("MonsterFinderMinStam", 20) || this.stats.health.num < 10) {
            return false;
        }

        var urlix = gm.getValue("urlix", "").replace("~", "");
        if (urlix === "" && gm.getValue("mfStatus", "") != "OpenMonster" && caap.WhileSinceDidIt("clearedMonsterFinderLinks", 24 * 60 * 60)) {
            gm.setValue("mfStatus", "");
            gm.log("Resetting monster finder history");
            this.clearLinks();
        }

        gm.log("All checks passed to enter Monster Finder");
        if (window.location.href.indexOf("filter=app_46755028429") < 0) {
            var mfstatus = gm.getValue("mfStatus", "");
            if (mfstatus == "OpenMonster") {
                caap.CheckMonster();
                return true;
            } else if (mfstatus == "MonsterFound") {
                caap.VisitUrl("http://apps.facebook.com/castle_age" + gm.getValue("navLink"));
                gm.setValue("mfStatus", "");
                return true;
            } else if ((mfstatus == "TestMonster" && this.WhileSinceDidIt('checkedFeed', 60 * 60 * 2)) || (!this.WhileSinceDidIt('checkedFeed', 60 * gm.getValue("MonsterFinderFeedMin", 5)))) {
                caap.selectMonst();
            } else {
                if (global.is_chrome) {
                    caap.VisitUrl("http://apps.facebook.com/?filter=app_46755028429&show_hidden=true&ignore_self=true&sk=lf", 0);
                } else {
                    caap.VisitUrl("http://www.facebook.com/?filter=app_46755028429&show_hidden=true&ignore_self=true&sk=lf", 0);
                }

                gm.setValue("mfStatus", "MFOFB");
                return false;
            }
        }
    },

    MonsterFinderOnFB: function () {
        if (gm.getValue("mfStatus", "") != "MFOFB") {
            return false;
        }

        gm.setValue("mfStatus", "Running");
        var delayPer = 10000;
        var iterations = 2;
        gm.setValue("delayPer", delayPer);
        gm.setValue("iterations", iterations);
        gm.setValue("iterationsRun", 0);
        gm.log("Set mostRecentFeed");
        this.JustDidIt("checkedFeed");
        gm.setValue("monstersExhausted", false);
        this.bottomScroll();
    },

    CheckMonster: function () {
        //Look for Attack Button
        if (gm.getValue("mfStatus") != "OpenMonster") {
            return false;
        }

        gm.log("Checking Monster: " + gm.getValue("navLink"));
        this.mf_attackButton = this.CheckForImage('attack_monster_button.jpg');
        if (!this.mf_attackButton) {
            this.mf_attackButton = this.CheckForImage('seamonster_power.gif');
            if (!this.mf_attackButton) {
                this.mf_attackButton = this.CheckForImage('attack_monster_button2.jpg');
                if (!this.mf_attackButton) {
                    this.mf_attackButton = this.CheckForImage('seamonster_power.gif');
                    if (!this.mf_attackButton) {
                        this.mf_attackButton = this.CheckForImage('attack_monster_button.jpg');
                        if (!this.mf_attackButton) {
                            this.mf_attackButton = this.CheckForImage('event_attack1.gif');
                            if (!this.mf_attackButton) {
                                this.mf_attackButton = this.CheckForImage('event_attack2.gif');
                                if (!this.mf_attackButton) {
                                    this.mf_attackButton = this.CheckForImage('raid_attack_button.gif');
                                }
                            }
                        }
                    }
                }
            }
        }

        if (this.mf_attackButton) {
            var dam = this.CheckResults_viewFight();
            gm.log("Found Attack Button.  Dam: " + dam);
            if (!dam) {
                gm.log("No Damage to monster, Attacking");
                caap.Click(this.mf_attackButton);
                window.setTimeout(function () {
                    gm.log("Hand off to Monsters section");
                    gm.setValue("urlixc", gm.getValue("urlixc", "~") + "~" + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                    //caap.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                    gm.setValue("mfStatus", "MonsterFound");
                    //caap.DeceiveDidIt("NotargetFrombattle_monster");
                    gm.setValue("navLink", "");
                    //caap.VisitUrl("http://apps.facebook.com/castle_age/battle_monster.php");
                    caap.NavigateTo('battle_monster');
                    gm.log("Navigate to battle_monster");
                    window.setTimeout(function () {
                        gm.setValue('resetselectMonster', true);
                        gm.setValue('LastAction', "Idle");
                        gm.log("resetselectMonster");
                        return true;
                    }, 4000);

                }, 4000);
                return false;
            } else {
                gm.log("Already attacked this monster, find new one");
                gm.setValue("urlixc", gm.getValue("urlixc", "~") + "~" + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                //this.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                gm.setValue("mfStatus", "TestMonster");
                gm.setValue("waitMonsterLoad", 0);
                return true;
            }
        } else {
            gm.log("No Attack Button");
            if (gm.getValue("waitMonsterLoad", 0) < 2) {
                gm.log("No Attack Button, Pass" + gm.getValue("waitMonsterLoad"));
                gm.setValue("waitMonsterLoad", gm.getValue("waitMonsterLoad", 0) + 1);
                gm.setValue("LastAction", "Idle");
                return true;
            } else {
                gm.log("No Attack Button, Find New Monster");
                gm.setValue("urlixc", gm.getValue("urlixc", "~") + gm.getValue("navLink").replace("http://apps.facebook.com/castle_age", ""));
                //this.maintainUrl(gm.getValue("navLink").replace("http://apps.facebook.com/castle_age",""));
                gm.setValue("mfStatus", "TestMonster");
                gm.setValue("waitMonsterLoad", 0);
                return true;
            }
        }
    },

    mfMain: function () {
        gm.log("Do Stuff " + new Date());
        if (gm.getValue("urlix", "") === "") {
            this.clearLinks();
        }

        //this.maintainAllUrl();
        //this.redirectLinks();
        this.handleCTA();
        gm.log("Scroll Up");
        nHtml.ScrollToTop();
        gm.log("Select Monster");
        this.selectMonst();
    },

    redirectLinks: function () {
        for (var x = 0; x < document.getElementsByTagName("a").length; x += 1) {
            document.getElementsByTagName('a')[x].target = "child_frame";
        }
    },

    bottomScroll: function () {
        nHtml.ScrollToBottom();
        //gm.log("Scroll To Bottom " + new Date() );
        nHtml.setTimeout(function () {
            caap.olderPosts();
        }, gm.getValue("delayPer", 60000));
    },

    olderPosts: function () {
        var itRun = gm.getValue("iterationsRun", 0);
        if (itRun > 0) {
            //var showMore = nHtml.getX('//a[@class=\'PagerMoreLink\']', document, nHtml.xpath.unordered);
            var showMore = nHtml.FindByAttrContains(document, "a", "class", "PagerMoreLink");
            if (showMore) {
                gm.log("Showing more ...");
                caap.Click(showMore);
                gm.log("Link clicked.");
            } else {
                gm.log("PagerMoreLink not found!");
            }
        }

        //this.NavigateTo("Older Posts");
        gm.setValue("iterationsRun", itRun += 1);
        gm.log("Get More Iterations " + gm.getValue("iterationsRun") + " of " + gm.getValue("iterations") + " " + new Date());
        if (gm.getValue("iterationsRun") < gm.getValue("iterations")) {
            nHtml.setTimeout(function () {
                caap.bottomScroll();
            }, gm.getValue("delayPer", 60000));
        } else {
            //gm.log("Made it Here, Try mfMain");
            nHtml.setTimeout(function () {
                caap.mfMain();
            }, gm.getValue("delayPer", 120000));
        }
    },

    selectMonst: function () {
        if (gm.getValue("monstersExhausted", false) === true) {
            return false;
        }

        gm.log("Select Monst Function");
        var monstPriority = gm.getValue("MonsterFinderOrder");

        gm.log("Monst Priority: " + monstPriority);

        var monstArray = monstPriority.split("~");
        gm.log("MonstArray: " + monstArray[0]);
        for (var x = 0; x < monstArray.length; x += 1) {
            if (gm.getValue(monstArray[x], "~") == "~") {
                gm.setValue(monstArray[x], "~");
            }

            gm.log("monstArray[x]: " + monstArray[x]);
            var monstType = monstArray[x];
            var monstList = gm.getValue(monstArray[x], "~");
            var monstLinks = monstList.replace(/~~/g, "~").split("~");
            var numlinks = 0;
            gm.log("Inside MonstArray For Loop " + monstArray[x] + " - Array[" + (monstLinks.length - 1) + "] " + gm.getValue(monstArray[x]).replace("~", "~\n"));
            for (var z = 0; z < monstLinks.length; z += 1) {
                if (monstLinks[z]) {
                    var link = monstLinks[z].replace("http://apps.facebook.com/castle_age", "");
                    var urlixc = gm.getValue("urlixc", "~");
                    // + "  UrlixC: " + urlixc);
                    if (urlixc.indexOf(link) == -1) {
                        gm.log("Navigating to Monst: " + monstArray[x] + "  Link: " + link);
                        link = "http://apps.facebook.com/castle_age" + link;
                        gm.setValue("navLink", link);
                        gm.setValue('clickUrl', link);
                        this.VisitUrl(link);
                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        // code is unreachable because of this.VisitUrl
                        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        gm.setValue("mfStatus", "OpenMonster");
                        gm.setValue("LastAction", "Monsters");
                        this.waitMilliSecs =  10000;
                        return true;
                    } else {
                        numlinks += 1;
                        gm.log("Trimming already checked URL, Monst Type: " + monstType);
                        //var newVal = gm.getValue(monstArray[x],"~").replace("~" + link, "");
                        gm.setValue(monstType, gm.getValue(monstType).replace("~" + link, "").replace(/~~/g, "~"), "~");
                    }
                }
            }

            gm.log("Links Already Visited: " + monstArray[x] + " #:" + numlinks);
        }

        gm.log("All Monsters Tested");
        gm.setValue("monstersExhausted", true);
        gm.setValue("mfStatus", "");
        var numurl = gm.getValue("urlix", "~");
        if (nHtml.CountInstances(numurl) > 100) {
            gm.log("Idle- Resetting Monster Searcher Values, #-" + numurl);
            caap.clearLinks(true);
            gm.setValue("LastAction", "");
        }

        gm.setValue('clickUrl', "http://apps.facebook.com/castle_age/index.php?bm=1");
        this.VisitUrl("http://apps.facebook.com/castle_age/index.php?bm=1");
        return false;
    },

    clearLinks: function (resetall) {
        gm.log("Clear Links");
        if (resetall === true) {
            gm.setValue("navLink", "");
            gm.setValue("mfStatus", "");
            gm.setValue("waitMonsterLoad", 0);
            gm.setValue("urlixc", "~");
        }

        gm.setValue("urlix", "~");
        gm.setValue('doaid', '~');
        gm.setValue('legio', '~');
        gm.setValue('hydra', '~');
        gm.setValue('earth', '~');
        gm.setValue('ice', '~');
        gm.setValue('kull', '~');
        gm.setValue('gilda', '~');
        gm.setValue('colos', '~');
        gm.setValue('sylva', '~');
        gm.setValue('mephi', '~');
        gm.setValue('keira', '~');
        gm.setValue('lotus', '~');
        gm.setValue('skaar', '~');
        gm.setValue('serps', '~');
        gm.setValue('eserp', '~');
        gm.setValue('sserp', '~');
        gm.setValue('aserp', '~');
        gm.setValue('rserp', '~');
        gm.setValue('drags', '~');
        gm.setValue('edrag', '~');
        gm.setValue('fdrag', '~');
        gm.setValue('gdrag', '~');
        gm.setValue('rdrag', '~');
        gm.setValue('deas', '~');
        gm.setValue('a1dea', '~');
        gm.setValue('a2dea', '~');
        gm.setValue('b1dea', '~');
        gm.setValue('b2dea', '~');

        this.JustDidIt("clearedMonsterFinderLinks");
    },

    handleCTA: function () {
        var ctas = nHtml.getX('//div[@class=\'GenericStory_Body\']', document, nHtml.xpath.unordered);
        gm.log("Number of entries- " + ctas.snapshotLength);
        for (var x = 0; x < ctas.snapshotLength; x += 1) {
            var url = nHtml.getX('./div[2]/div/div/a/@href', ctas.snapshotItem(x), nHtml.xpath.string).replace("http://apps.facebook.com/castle_age", "");
            var fid = nHtml.Gup("user", url);
            var mpool = nHtml.Gup("mpool", url);
            var action = nHtml.Gup("action", url);
            var src = nHtml.getX('./div[2]/div/div/a/div/img/@src', ctas.snapshotItem(x), nHtml.xpath.string);
            var time = nHtml.getX('./form/span/span/a/abbr/@title', ctas.snapshotItem(x), nHtml.xpath.string);
            var monst = '';
            var urlixc = gm.getValue("urlixc", "~");
            if (src) {
                if (urlixc.indexOf(url) >= 0) {
                    //gm.log("Monster Already Checked");
                } else if (src.indexOf("cta_hydra_") >= 0 || src.indexOf("twitter_hydra_objective") >= 0) { //Hydra
                    monst = gm.getValue("hydra", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("hydra", gm.getValue("hydra", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_castle_") >= 0) { //Battle of the Dark Legion (Orcs)
                    monst = gm.getValue("legio", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("legio", gm.getValue("legio", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_earth_") >= 0) { //Genesis, the Earth Elemental
                    monst = gm.getValue("earth", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("earth", gm.getValue("earth", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_water_") >= 0) { //Ragnarok, the Ice Elemental
                    monst = gm.getValue("ice", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("ice", gm.getValue("ice", "") + "~" + url);
                    }
                } else if (src.indexOf("raid_deathrune_") >= 0) { //Deathrune Raids
                    monst = gm.getValue("deas", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("deas", gm.getValue("deas", "") + "~" + url);
                    }
                    if (src.indexOf("raid_deathrune_a1.gif") >= 0) { // Deathrune Raid Part 1 Under Level 50 Summoner (a1)
                        monst = gm.getValue("a1dea", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("a1dea", gm.getValue("a1dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_a2.gif") >= 0) { // Deathrune Raid Part 2 Under Level 50 Summoner (a2)
                        monst = gm.getValue("a2dea", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("a2dea", gm.getValue("a2dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_b1.gif") >= 0) { // Deathrune Raid Part 1 Over Level 50 Summoner (b1)
                        monst = gm.getValue("b1dea", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("b1dea", gm.getValue("b1dea", "") + "~" + url);
                        }
                    } else if (src.indexOf("raid_deathrune_b2.gif") >= 0) { // Deathrune Raid Part 2 Over Level 50 Summoner (b2)
                        monst = gm.getValue("b2dea", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("b2dea", gm.getValue("b2dea", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("_dragon.gif") >= 0) { //Dragons
                    monst = gm.getValue("drags", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("drags", gm.getValue("drags", "") + "~" + url);
                    }

                    if (src.indexOf("cta_red_dragon.gif") >= 0) { // Red Dragon
                        monst = gm.getValue("rdrag", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("rdrag", gm.getValue("rdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_yellow_dragon.gif") >= 0) {  // Gold Dragon
                        monst = gm.getValue("gdrag", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("gdrag", gm.getValue("gdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_blue_dragon.gif") >= 0) { // Frost Dragon
                        monst = gm.getValue("fdrag", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("fdrag", gm.getValue("fdrag", "") + "~" + url);
                        }
                    } else if (src.indexOf("cta_green_dragon.gif") >= 0) { // Emerald Dragon
                        monst = gm.getValue("edrag", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("edrag", gm.getValue("edrag", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("twitter_seamonster_") >= 0 && src.indexOf("_1.jpg") >= 0) { // Sea Serpents
                    monst = gm.getValue("serps", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("serps", gm.getValue("serps", "") + "~" + url);
                    }

                    if (src.indexOf("twitter_seamonster_purple_1") >= 0) { // Amethyt Serpent
                        monst = gm.getValue("aserp", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("aserp", gm.getValue("aserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_red_1") >= 0) { // Ancient Serpent (red)
                        monst = gm.getValue("rserp", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("rserp", gm.getValue("rserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_blue_1") >= 0) { // Saphire Serpent
                        monst = gm.getValue("sserp", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("sserp", gm.getValue("sserp", "") + "~" + url);
                        }
                    } else if (src.indexOf("twitter_seamonster_green_1") >= 0) { // Emerald Serpent
                        monst = gm.getValue("eserp", "~");
                        if (monst.indexOf(url) == -1) {
                            gm.setValue("eserp", gm.getValue("eserp", "") + "~" + url);
                        }
                    }
                } else if (src.indexOf("cta_death") >= 0 && src.indexOf("cta_death_dead.gif") == -1) { // skaar
                    monst = gm.getValue("skaar", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("skaar", gm.getValue("skaar", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_lotus.gif") >= 0) { // Lotus
                    monst = gm.getValue("lotus", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("lotus", gm.getValue("lotus", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_keira.gif") >= 0) { // Keira
                    monst = gm.getValue("keira", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("keira", gm.getValue("keira", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_mephi.gif") >= 0) { // Mephisto
                    monst = gm.getValue("mephi", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("mephi", gm.getValue("mephi", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_sylvanas.gif") >= 0) { //Sylvanas
                    monst = gm.getValue("sylva", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("sylva", gm.getValue("sylva", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_stone.gif") >= 0) { //Colossus of Terra
                    monst = gm.getValue("colos", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("colos", gm.getValue("colos", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_orc_king.gif") >= 0) { //Gildamesh
                    monst = gm.getValue("gilda", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("gilda", gm.getValue("gilda", "") + "~" + url);
                    }
                } else if (src.indexOf("cta_orc_captain.gif") >= 0) { //Kull
                    monst = gm.getValue("kull", "~");
                    if (monst.indexOf(url) == -1) {
                        gm.setValue("kull", gm.getValue("kull", "") + "~" + url);
                    }
                }
            }

            var urlix = gm.getValue("urlix", "~");
            var doaid = gm.getValue("doaid", "~");
            if (fid && action) {
                if (action == "doObjective") {
                    if (urlixc.indexOf(url) == -1 && doaid.indexOf(url) == -1) {
                        doaid += "~" + url;
                        gm.setValue("doaid", doaid);
                    }
                }
            }

            if (fid && mpool) {
                if (urlixc.indexOf(url) == -1 && urlix.indexOf(url) == -1) {
                    urlix += "~" + url;
                    gm.setValue("urlix", urlix);
                }
            }
        }

        gm.log("Completed Url Handling");
        this.JustDidIt("checkedFeed");
    },

    /////////////////////////////////////////////////////////////////////
    //                          POTIONS
    /////////////////////////////////////////////////////////////////////

    /*
    CheckResults_keep: function () {
    },
    */

    AutoPotions: function () {
        try {
            if (!gm.getValue('AutoPotions', true) ||
                !(this.WhileSinceDidIt('AutoPotionTimer', 6 * 60 * 60)) ||
                !(this.WhileSinceDidIt('AutoPotionTimerDelay', 10 * 60))) {
                return false;
            }

            var checkConsumables = nHtml.FindByAttr(document.body, "div", "class", "statsTTitle");
            if (!checkConsumables) {
                gm.log("Going to keep for potions");
                if (this.NavigateTo('keep')) {
                    return true;
                }
            }

            gm.log("Checking energy potions");
            var energyPotions = $("img[title='Energy Potion']").parent().next().text().replace(new RegExp("[^0-9\\.]", "g"), "");
            if (!energyPotions) {
                energyPotions = 0;
            }

            gm.log("Energy Potions: " + energyPotions);
            if (energyPotions >= gm.getNumber("energyPotionsSpendOver", 39)) {
                gm.setValue("Consume_Energy", true);
                gm.log("Energy potions ready to consume");
            }

            gm.log("Checking stamina potions");
            var staminaPotions = $("img[title='Stamina Potion']").parent().next().text().replace(new RegExp("[^0-9\\.]", "g"), "");
            if (!staminaPotions) {
                staminaPotions = 0;
            }

            gm.log("Stamina Potions: " + staminaPotions);
            if (staminaPotions >= gm.getNumber("staminaPotionsSpendOver", 39)) {
                gm.setValue("Consume_Stamina", true);
                gm.log("Stamina potions ready to consume");
            }

            gm.log("Checking experience to next level");
            //gm.log("Experience to next level: " + this.stats.exp.dif);
            //gm.log("Potions experience set: " + gm.getNumber("potionsExperience", 20));
            if ((gm.getValue("Consume_Energy", false) || gm.getValue("Consume_Stamina", false)) &&
                this.stats.exp.dif <= gm.getNumber("potionsExperience", 20)) {
                gm.log("Not spending potions, experience to next level condition. Delaying 10 minutes");
                this.JustDidIt('AutoPotionTimerDelay');
                return true;
            }

            if (this.stats.energy.num < this.stats.energy.max - 10 &&
                energyPotions > gm.getNumber("energyPotionsKeepUnder", 35) &&
                gm.getValue("Consume_Energy", false)) {
                gm.log("Spending energy potions");
                var energySlice = nHtml.FindByAttr(document.body, "form", "id", "app46755028429_consume_1");
                if (energySlice) {
                    var energyButton = nHtml.FindByAttrContains(energySlice, "input", "src", 'potion_consume.gif');
                    if (energyButton) {
                        gm.log("Consume energy potion");
                        caap.Click(energyButton);
                        // Check consumed should happen here if needed
                        return true;
                    } else {
                        gm.log("Could not find consume energy button");
                    }
                } else {
                    gm.log("Could not find energy consume form");
                }

                return false;
            } else {
                gm.setValue("Consume_Energy", false);
                gm.log("Energy potion conditions not met");
            }

            if (this.stats.stamina.num < this.stats.stamina.max - 10 &&
                staminaPotions > gm.getNumber("staminaPotionsKeepUnder", 35) &&
                gm.getValue("Consume_Stamina", false)) {
                gm.log("Spending stamina potions");
                var staminaSlice = nHtml.FindByAttr(document.body, "form", "id", "app46755028429_consume_2");
                if (staminaSlice) {
                    var staminaButton = nHtml.FindByAttrContains(staminaSlice, "input", "src", 'potion_consume.gif');
                    if (staminaButton) {
                        gm.log("Consume stamina potion");
                        caap.Click(staminaButton);
                        // Check consumed should happen here if needed
                        return true;
                    } else {
                        gm.log("Could not find consume stamina button");
                    }
                } else {
                    gm.log("Could not find stamina consume form");
                }

                return false;
            } else {
                gm.setValue("Consume_Stamina", false);
                gm.log("Stamina potion conditions not met");
            }

            this.JustDidIt('AutoPotionTimer');
            return true;
        } catch (e) {
            gm.log("ERROR in AutoPotion: " + e);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          BANKING
    // Keep it safe!
    /////////////////////////////////////////////////////////////////////

    ImmediateBanking: function () {
        if (!gm.getValue("BankImmed")) {
            return false;
        }

        return Bank.work(true);
    },

    RetrieveFromBank: function (num) {
        try {
            if (num <= 0) {
                return false;
            }

            var retrieveButton = this.CheckForImage('btn_retrieve.gif');
            if (!retrieveButton) {
                // Cannot find the link
                return this.NavigateTo('keep');
            }

            var minInStore = gm.getNumber('minInStore', 0);
            if (!(minInStore || minInStore <= gm.getNumber('inStore', 0) - num)) {
                return false;
            }

            var retrieveForm = retrieveButton.form;
            var numberInput = nHtml.FindByAttrXPath(retrieveForm, 'input', "@type='' or @type='text'");
            if (numberInput) {
                numberInput.value = num;
            } else {
                gm.log('Cannot find box to put in number for bank retrieve.');
                return false;
            }

            gm.log('Retrieving ' + num + ' from bank');
            gm.setValue('storeRetrieve', '');
            this.Click(retrieveButton);
            return true;
        } catch (err) {
            gm.log("ERROR in RetrieveFromBank: " + err);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                          PASSIVE GENERALS
    /////////////////////////////////////////////////////////////////////

    PassiveGeneral: function () {
        if (this.SelectGeneral('IdleGeneral')) {
            return true;
        }

        gm.setValue('MaxIdleEnergy', this.stats.energy.max);
        gm.setValue('MaxIdleStamina', this.stats.stamina.max);
        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                          AUTOINCOME
    /////////////////////////////////////////////////////////////////////

    AutoIncome: function () {
        if (this.stats.payminute < 1 && this.stats.paytime.match(/\d/) &&
                gm.getValue('IncomeGeneral') != 'Use Current') {
            this.SelectGeneral('IncomeGeneral');
            return true;
        }

        return false;
    },

    /////////////////////////////////////////////////////////////////////
    //                              AUTOGIFT
    /////////////////////////////////////////////////////////////////////

    CheckResults_army: function (resultsText) {
        var listHref = $('div[style="padding: 0pt 0pt 10px 0px; overflow: hidden; float: left; width: 240px; height: 50px;"]')
            .find('a[text="Ignore"]');
        for (var i = 0; i < listHref.length; i += 1) {
            var link = "<br /><a title='This link can be used to collect the " +
                "gift when it has been lost on Facebook. !!If you accept a gift " +
                "in this manner then it will leave an orphan request on Facebook!!' " +
                "href='" + listHref[i].href.replace('ignore', 'acpt') + "'>Lost Accept</a>";
            $(link).insertAfter(
                $('div[style="padding: 0pt 0pt 10px 0px; overflow: hidden; float: left; width: 240px; height: 50px;"]')
                .find('a[href=' + listHref[i].href + ']')
            );
        }
    },

    CheckResults_gift_accept: function (resultsText) {
        // Confirm gifts actually sent
        if ($('#app46755028429_app_body').text().match(/You have sent \d+ gifts?/)) {
            gm.log('Confirmed gifts sent out.');
            gm.setValue('RandomGiftPic', '');
            gm.setValue('FBSendList', '');
        }
    },

    CheckResults_index: function (resultsText) {
        this.JustDidIt('checkForGifts');
    },

    AutoGift: function () {
        try {
            if (!gm.getValue('AutoGift')) {
                return false;
            }

            var giftNamePic = {};
            var giftEntry = nHtml.FindByAttrContains(document.body, 'div', 'id', '_gift1');
            if (giftEntry) {
                gm.setList('GiftList', []);
                var ss = document.evaluate(".//div[contains(@id,'_gift')]", giftEntry.parentNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    var giftDiv = ss.snapshotItem(s);
                    var giftName = $.trim(nHtml.GetText(giftDiv)).replace(/!/i, '');
                    if (gm.getValue("GiftList").indexOf(giftName) >= 0) {
                        giftName += ' #2';
                    }

                    gm.listPush('GiftList', giftName);
                    giftNamePic[giftName] = this.CheckForImage('mystery', giftDiv).src.match(/[\w_\.]+$/i).toString();
                    //gm.log('Gift name: ' + giftName + ' pic ' + giftNamePic[giftName] + ' hidden ' + giftExtraGiftTF[giftName]);
                }

                //gm.log('Gift list: ' + gm.getList('GiftList'));
                if (gm.getValue('GiftChoice') == 'Get Gift List') {
                    gm.setValue('GiftChoice', 'Same Gift As Received');
                    this.SelectDropOption('GiftChoice', 'Same Gift As Received');
                }
            }

            // Go to gifts page if asked to read in gift list
            if (gm.getValue('GiftChoice', false) == 'Get Gift List' || !gm.getList('GiftList')) {
                if (this.NavigateTo('army,gift', 'giftpage_title.jpg')) {
                    return true;
                }
            }

            var giverId = [];
            // Gather the gifts
            if (gm.getValue('HaveGift', false)) {
                if (this.NavigateTo('army', 'invite_on.gif')) {
                    return true;
                }

                var acceptDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'reqs.php#confirm_');
                var ignoreDiv = nHtml.FindByAttrContains(document.body, 'a', 'href', 'act=ignore');
                if (ignoreDiv && acceptDiv) {
                    giverId = this.userRe.exec(ignoreDiv.href);
                    if (!giverId) {
                        gm.log('Unable to find giver ID');
                        return false;
                    }

                    var profDiv = nHtml.FindByAttrContains(acceptDiv.parentNode.parentNode, 'a', 'href', 'profile.php');
                    if (!profDiv) {
                        profDiv = nHtml.FindByAttrContains(acceptDiv.parentNode.parentNode, 'div', 'style', 'overflow: hidden; text-align: center; width: 170px;');
                    }

                    var giverName = "Unknown";
                    if (profDiv) {
                        giverName = $.trim(nHtml.GetText(profDiv));
                    }

                    gm.setValue('GiftEntry', giverId[2] + global.vs + giverName);
                    gm.log('Giver ID = ' + giverId[2] + ' Name  = ' + giverName);
                    this.JustDidIt('ClickedFacebookURL');
                    if (global.is_chrome) {
                        acceptDiv.href = "http://apps.facebook.com/reqs.php#confirm_46755028429_0";
                    }

                    gm.setValue('clickUrl', acceptDiv.href);
                    this.VisitUrl(acceptDiv.href);
                    return true;
                }

                gm.setValue('HaveGift', false);
                return this.NavigateTo('gift');
            }

            var button = null;
            // Facebook pop-up on CA
            if (gm.getValue('FBSendList', '')) {
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'sendit');
                if (button) {
                    gm.log('Sending gifts to Facebook');
                    caap.Click(button);
                    return true;
                }

                gm.listAddBefore('ReceivedList', gm.getList('FBSendList'));
                gm.setList('FBSendList', []);
                button = nHtml.FindByAttrContains(document.body, 'input', 'name', 'ok');
                if (button) {
                    gm.log('Over max gifts per day');
                    this.JustDidIt('WaitForNextGiftSend');
                    caap.Click(button);
                    return true;
                }

                gm.log('No Facebook pop up to send gifts');
                return false;
            }

            // CA send gift button
            if (gm.getValue('CASendList', '')) {
                var sendForm = nHtml.FindByAttrContains(document.body, 'form', 'id', 'req_form_');
                if (sendForm) {
                    button = nHtml.FindByAttrContains(sendForm, 'input', 'name', 'send');
                    if (button) {
                        gm.log('Clicked CA send gift button');
                        gm.listAddBefore('FBSendList', gm.getList('CASendList'));
                        gm.setList('CASendList', []);
                        caap.Click(button);
                        return true;
                    }
                }

                gm.log('No CA button to send gifts');
                gm.listAddBefore('ReceivedList', gm.getList('CASendList'));
                gm.setList('CASendList', []);
                return false;
            }

            if (!this.WhileSinceDidIt('WaitForNextGiftSend', 3 * 60 * 60)) {
                return false;
            }

            if (this.WhileSinceDidIt('WaitForNotFoundIDs', 3 * 60 * 60) && gm.getList('NotFoundIDs')) {
                gm.listAddBefore('ReceivedList', gm.getList('NotFoundIDs'));
                gm.setList('NotFoundIDs', []);
            }

            if (gm.getValue('DisableGiftReturn', false)) {
            //if (gm.getValue('DisableGiftReturn', false) || global.is_chrome) {
                gm.setList('ReceivedList', []);
            }

            var giverList = gm.getList('ReceivedList');
            if (!giverList.length) {
                return false;
            }

            if (this.NavigateTo('army,gift', 'giftpage_title.jpg')) {
                return true;
            }

            // Get the gift to send out
            if (giftNamePic.length === 0) {
                gm.log('No list of pictures for gift choices');
                return false;
            }

            var givenGiftType = '';
            var giftPic = '';
            var giftChoice = gm.getValue('GiftChoice');
            var giftList = gm.getList('GiftList');
            //if (global.is_chrome) giftChoice = 'Random Gift';
            switch (giftChoice) {
            case 'Random Gift':
                giftPic = gm.getValue('RandomGiftPic');
                if (giftPic) {
                    break;
                }

                var picNum = Math.floor(Math.random() * (giftList.length));
                var n = 0;
                for (var picN in giftNamePic) {
                    if (giftNamePic.hasOwnProperty(picN)) {
                        n += 1;
                        if (n == picNum) {
                            giftPic = giftNamePic[picN];
                            gm.setValue('RandomGiftPic', giftPic);
                            break;
                        }
                    }
                }
                if (!giftPic) {
                    gm.log('No gift type match. GiverList: ' + giverList);
                    return false;
                }
                break;
            case 'Same Gift As Received':
                givenGiftType = giverList[0].split(global.vs)[2];
                gm.log('Looking for same gift as ' + givenGiftType);
                if (giftList.indexOf(givenGiftType) < 0) {
                    gm.log('No gift type match. Using first gift as default.');
                    givenGiftType = gm.getList('GiftList')[0];
                }
                giftPic = giftNamePic[givenGiftType];
                break;
            default:
                giftPic = giftNamePic[gm.getValue('GiftChoice')];
                break;
            }

            // Move to gifts page
            var picDiv = this.CheckForImage(giftPic);
            if (!picDiv) {
                gm.log('Unable to find ' + giftPic);
                return false;
            } else {
                gm.log('GiftPic is ' + giftPic);
            }

            if (nHtml.FindByAttrContains(picDiv.parentNode.parentNode.parentNode.parentNode, 'div', 'style', 'giftpage_select')) {
                if (this.NavigateTo('gift_invite_castle_off.gif', 'gift_invite_castle_on.gif')) {
                    return true;
                }
            } else {
                this.NavigateTo('gift_more_gifts.gif');
                return this.NavigateTo(giftPic);
            }

            // Click on names
            var giveDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'unselected_list');
            var doneDiv = nHtml.FindByAttrContains(document.body, 'div', 'class', 'selected_list');
            gm.setList('ReceivedList', []);
            for (var p in giverList) {
                if (giverList.hasOwnProperty(p)) {
                    if (p > 10) {
                        gm.listPush('ReceivedList', giverList[p]);
                        continue;
                    }

                    var giverData = giverList[p].split(global.vs);
                    var giverID = giverData[0];
                    var giftType = giverData[2];
                    if (giftChoice == 'Same Gift As Received' && giftType != givenGiftType && giftList.indexOf(giftType) >= 0) {
                        //gm.log('giftType ' + giftType + ' givenGiftType ' + givenGiftType);
                        gm.listPush('ReceivedList', giverList[p]);
                        continue;
                    }

                    var nameButton = nHtml.FindByAttrContains(giveDiv, 'input', 'value', giverID);
                    if (!nameButton) {
                        gm.log('Unable to find giver ID ' + giverID);
                        gm.listPush('NotFoundIDs', giverList[p]);
                        this.JustDidIt('WaitForNotFoundIDs');
                        continue;
                    } else {
                        gm.log('Clicking giver ID ' + giverID);
                        this.Click(nameButton);
                    }

                    //test actually clicked
                    if (nHtml.FindByAttrContains(doneDiv, 'input', 'value', giverID)) {
                        gm.listPush('CASendList', giverList[p]);
                        gm.log('Moved ID ' + giverID);
                    } else {
                        gm.log('NOT moved ID ' + giverID);
                        gm.listPush('NotFoundIDs', giverList[p]);
                        this.JustDidIt('WaitForNotFoundIDs');
                    }
                }
            }

            return true;
        } catch (e) {
            gm.log("ERROR in AutoGift: " + e);
            return false;
        }
    },

    AcceptGiftOnFB: function () {
        try {
            if (global.is_chrome) {
                if (window.location.href.indexOf('apps.facebook.com/reqs.php') < 0 && window.location.href.indexOf('apps.facebook.com/home.php') < 0) {
                    return false;
                }
            } else {
                if (window.location.href.indexOf('www.facebook.com/reqs.php') < 0 && window.location.href.indexOf('www.facebook.com/home.php') < 0) {
                    return false;
                }
            }

            var giftEntry = gm.getValue('GiftEntry', '');
            if (!giftEntry) {
                return false;
            }

            gm.log('On FB page with gift ready to go');
            if (window.location.href.indexOf('facebook.com/reqs.php') >= 0) {
                var ss = document.evaluate(".//input[contains(@name,'/castle/tracker.php')]", document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (var s = 0; s < ss.snapshotLength; s += 1) {
                    var giftDiv = ss.snapshotItem(s);
                    var user = giftDiv.name.match(/uid%3D\d+/i);
                    if (!user) {
                        continue;
                    }

                    user = String(user).substr(6);
                    if (user != this.NumberOnly(giftEntry)) {
                        continue;
                    }

                    var giftType = $.trim(giftDiv.value.replace(/^Accept /i, ''));
                    if (gm.getList('GiftList').indexOf(giftType) < 0) {
                        gm.log('Unknown gift type.');
                        giftType = 'Unknown Gift';
                    }

                    if (gm.getValue('ReceivedList', ' ').indexOf(giftEntry) < 0) {
                        gm.listPush('ReceivedList', giftEntry + global.vs + giftType);
                    }

                    gm.log('This giver: ' + user + ' gave ' + giftType + ' Givers: ' + gm.getList('ReceivedList'));
                    caap.Click(giftDiv);
                    gm.setValue('GiftEntry', '');
                    return true;
                }
            }

            if (!this.WhileSinceDidIt('ClickedFacebookURL', 10)) {
                return false;
            }

            gm.log('Error: unable to find gift');
            if (gm.getValue('ReceivedList', ' ').indexOf(giftEntry) < 0) {
                gm.listPush('ReceivedList', giftEntry + '\tUnknown Gift');
            }

            caap.VisitUrl("http://apps.facebook.com/castle_age/army.php?act=acpt&uid=" + this.NumberOnly(giftEntry));
            gm.setValue('GiftEntry', '');
            return true;
        } catch (e) {
            gm.log("ERROR in AcceptGiftOnFB: " + e);
            return false;
        }
    },

    /////////////////////////////////////////////////////////////////////
    //                              IMMEDIATEAUTOSTAT
    /////////////////////////////////////////////////////////////////////

    ImmediateAutoStat: function () {
        if (!gm.getValue("StatImmed") || !gm.getValue('AutoStat')) {
            return false;
        }

        return caap.AutoStat();
    },

    ////////////////////////////////////////////////////////////////////
    //                      Auto Stat
    ////////////////////////////////////////////////////////////////////

    IncreaseStat: function (attribute, attrAdjust, atributeSlice) {
        try {
            //gm.log("Attribute: " + attribute + "   Adjust: " + attrAdjust);
            var lc_attribute = attribute.toLowerCase();
            var button = '';
            switch (lc_attribute) {
            case "energy" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'energy_max');
                break;
            case "stamina" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'stamina_max');
                break;
            case "attack" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'attack');
                break;
            case "defense" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'defense');
                break;
            case "health" :
                button = nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'health_max');
                break;
            default :
                gm.log("Unable to identify attribute " + lc_attribute);
                return "Fail";
            }

            if (!button) {
                gm.log("Unable to locate upgrade button for " + lc_attribute);
                return "Fail";
            }

            var level = this.stats.level;
            var attrCurrent = parseInt(button.parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            var energy = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'energy_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            var stamina = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'stamina_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            var attack = 0;
            var defense = 0;
            var health = 0;
            if (level >= 10) {
                attack = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'attack').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                defense = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'defense').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
                health = parseInt(nHtml.FindByAttrContains(atributeSlice, 'a', 'href', 'health_max').parentNode.parentNode.childNodes[3].firstChild.data.replace(new RegExp("[^0-9]", "g"), ''), 10);
            }

            //gm.log("Energy ="+energy+" Stamina ="+stamina+" Attack ="+attack+" Defense ="+defense+" Heath ="+health);
            var ajaxLoadIcon = nHtml.FindByAttrContains(document.body, 'div', 'id', 'app46755028429_AjaxLoadIcon');
            if (!ajaxLoadIcon || ajaxLoadIcon.style.display !== 'none') {
                gm.log("Unable to find AjaxLoadIcon?");
                return "Fail";
            }

            if ((lc_attribute == 'stamina') && (this.statsPoints < 2)) {
                gm.setValue("SkillPointsNeed", 2);
                return "Fail";
            }

            gm.setValue("SkillPointsNeed", 1);
            var attrAdjustNew = attrAdjust;
            var logTxt = " " + attrAdjust;
            if (gm.getValue('AutoStatAdv', false)) {
                //Using eval, so user can define formulas on menu, like energy = level + 50
                attrAdjustNew = eval(attrAdjust);
                logTxt = " (" + attrAdjust + ")=" + attrAdjustNew;
            }

            if (attrAdjustNew > attrCurrent) {
                gm.log("Status Before:  " + lc_attribute + "=" + attrCurrent + " Adjusting To:" + logTxt);
                this.Click(button);
                return "Click";
            }

            return "Next";
        } catch (e) {
            gm.log("ERROR in IncreaseStat: " + e);
            return "Fail";
        }
    },

    statsMatch: true,

    autoStatRuleLog: true,

    AutoStat: function () {
        try {
            if (!gm.getValue('AutoStat')) {
                return false;
            }

            if (!this.statsMatch) {
                if (this.autoStatRuleLog) {
                    gm.log("User should change their stats rules");
                    this.autoStatRuleLog = false;
                }

                return false;
            }

            var content = document.getElementById('app46755028429_main_bntp');
            if (!content) {
                //gm.log("id:main_bntp not found");
                return false;
            }

            var a = nHtml.FindByAttrContains(content, 'a', 'href', 'keep.php');
            if (!a) {
                //gm.log("a:href:keep.php not found");
                return false;
            }

            this.statsPoints = a.firstChild.firstChild.data.replace(new RegExp("[^0-9]", "g"), '');
            if (!this.statsPoints || this.statsPoints < gm.getValue("SkillPointsNeed", 1)) {
                //gm.log("Dont have enough stats points");
                return false;
            }

            var atributeSlice = nHtml.FindByAttrContains(document.body, "div", "class", 'keep_attribute_section');
            if (!atributeSlice) {
                this.NavigateTo('keep');
                return true;
            }

            var startAtt = 0;
            var stopAtt = 4;
            if (gm.getValue("AutoStatAdv", false)) {
                startAtt = 5;
                stopAtt = 9;
            }

            for (var n = startAtt; n <= stopAtt; n += 1) {
                if (gm.getValue('Attribute' + n, '') === '') {
                    //gm.log("Attribute" + n + " is blank: continue");
                    continue;
                }

                if (this.stats.level < 10) {
                    if (gm.getValue('Attribute' + n, '') === 'Attack' || gm.getValue('Attribute' + n, '') === 'Defense') {
                        continue;
                    }
                }

                switch (this.IncreaseStat(gm.getValue('Attribute' + n, ''), gm.getValue('AttrValue' + n, 0), atributeSlice)) {
                case "Next" :
                    //gm.log("Attribute" + n + " : next");
                    continue;
                case "Click" :
                    //gm.log("Attribute" + n + " : click");
                    return true;
                default :
                    //gm.log("Attribute" + n + " unknown return value");
                    return false;
                }
            }

            gm.log("No rules match to increase stats");
            this.statsMatch = false;
            return false;
        } catch (e) {
            gm.log("ERROR in AutoStat: " + e);
            return false;
        }
    },

    AutoCollectMA: function () {
        try {
            if (!gm.getValue('AutoCollectMA', true) ||
                !(this.WhileSinceDidIt('AutoCollectMATimer', (24 * 60 * 60) + (5 * 60)))) {
                return false;
            }

            gm.log("Collecting Master and Apprentice reward");
            caap.SetDivContent('idle_mess', 'Collect MA Reward');
            var buttonMas = nHtml.FindByAttrContains(document.body, "img", "src", "ma_view_progress_main");
            var buttonApp = nHtml.FindByAttrContains(document.body, "img", "src", "ma_main_learn_more");
            if (!buttonMas && !buttonApp) {
                gm.log("Going to home");
                if (this.NavigateTo('index')) {
                    return true;
                }
            }

            if (buttonMas) {
                this.Click(buttonMas);
                caap.SetDivContent('idle_mess', 'Collected MA Reward');
                gm.log("Collected Master and Apprentice reward");
            }

            if (!buttonMas && buttonApp) {
                caap.SetDivContent('idle_mess', 'No MA Rewards');
                gm.log("No Master and Apprentice rewards");
            }

            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            this.JustDidIt('AutoCollectMATimer');
            gm.log("Collect Master and Apprentice reward completed");
            return true;
        } catch (e) {
            gm.log("ERROR in AutoCollectMA: " + e);
            return false;
        }
    },

    friendListType: {
        facebook: {
            name: "facebook",
            url: 'http://apps.facebook.com/castle_age/army.php?app_friends=false&giftSelection=1'
        },
        gifta: {
            name: "gifta",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=a&giftSelection=1'
        },
        giftb: {
            name: "giftb",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=b&giftSelection=1'
        },
        giftc: {
            name: "giftc",
            url: 'http://apps.facebook.com/castle_age/gift.php?app_friends=c&giftSelection=1'
        }
    },

    GetFriendList: function (listType, force) {
        try {
            gm.log("Entered GetFriendList and request is for: " + listType.name);
            if (force) {
                gm.deleteValue(listType.name + 'Requested');
                gm.deleteValue(listType.name + 'Responded');
            }

            if (!gm.getValue(listType.name + 'Requested', false)) {
                gm.log("Getting Friend List: " + listType.name);
                gm.setValue(listType.name + 'Requested', true);

                $.ajax({
                    url: listType.url,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            gm.deleteValue(listType.name + 'Requested');
                            gm.log("GetFriendList(" + listType.name + "): " + textStatus);
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                gm.log("GetFriendList.ajax splitting data");
                                data = data.split('<div class="unselected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'unselected_list'";
                                }

                                data = data[1].split('</div><div class="selected_list">');
                                if (data.length < 2) {
                                    throw "Could not locate 'selected_list'";
                                }

                                gm.log("GetFriendList.ajax data split ok");
                                var friendList = [];
                                $('<div></div>').html(data[0]).find('input').each(function (index) {
                                    friendList.push($(this).val());
                                });

                                gm.log("GetFriendList.ajax saving friend list of " + friendList.length + " ids");
                                if (friendList.length) {
                                    gm.setList(listType.name + 'Responded', friendList);
                                } else {
                                    gm.setValue(listType.name + 'Responded', true);
                                }

                                gm.log("GetFriendList(" + listType.name + "): " + textStatus);
                                //gm.log("GetFriendList(" + listType.name + "): " + friendList);
                            } catch (err) {
                                gm.deleteValue(listType.name + 'Requested');
                                gm.log("ERROR in GetFriendList.ajax: " + err);
                            }
                        }
                });
            } else {
                gm.log("Already requested GetFriendList for: " + listType.name);
            }

            return true;
        } catch (e) {
            gm.log("ERROR in GetFriendList(" + listType.name + "): " + e);
            return false;
        }
    },

    addFriendSpamCheck: 0,

    AddFriend: function (id) {
        try {
            var responseCallback = function (XMLHttpRequest, textStatus, errorThrown) {
                if (caap.addFriendSpamCheck > 0) {
                    caap.addFriendSpamCheck -= 1;
                }

                gm.log("AddFriend(" + id + "): " + textStatus);
            };

            $.ajax({
                url: 'http://apps.facebook.com/castle_age/party.php?twt=jneg&jneg=true&user=' + id + '&lka=' + id + '&etw=9&ref=nf',
                error: responseCallback,
                success: responseCallback
            });

            return true;
        } catch (e) {
            gm.log("ERROR in AddFriend(" + id + "): " + e);
            return false;
        }
    },

    AutoFillArmy: function (caListType, fbListType) {
        try {
            if (!gm.getValue('FillArmy', false)) {
                return false;
            }

            var armyCount = gm.getValue("ArmyCount", 0);
            if (armyCount === 0) {
                this.SetDivContent('idle_mess', 'Filling Army');
                gm.log("Filling army");
            }

            if (gm.getValue(caListType.name + 'Responded', false) === true ||
                    gm.getValue(fbListType.name + 'Responded', false) === true) {
                this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                gm.log("Fill Army Completed: no friends found");
                window.setTimeout(function () {
                    caap.SetDivContent('idle_mess', '');
                }, 5000);

                gm.setValue('FillArmy', false);
                gm.deleteValue("ArmyCount");
                gm.deleteValue('FillArmyList');
                gm.deleteValue(caListType.name + 'Responded');
                gm.deleteValue(fbListType.name + 'Responded');
                gm.deleteValue(caListType.name + 'Requested');
                gm.deleteValue(fbListType.name + 'Requested');
                return true;
            }

            var fillArmyList = gm.getList('FillArmyList');
            if (!fillArmyList.length) {
                this.GetFriendList(caListType);
                this.GetFriendList(fbListType);
            }

            var castleageList = gm.getList(caListType.name + 'Responded');
            //gm.log("gifList: " + castleageList);
            var facebookList = gm.getList(fbListType.name + 'Responded');
            //gm.log("facebookList: " + facebookList);
            if ((castleageList.length && facebookList.length) || fillArmyList.length) {
                if (!fillArmyList.length) {
                    var diffList = facebookList.filter(function (facebookID) {
                        return (castleageList.indexOf(facebookID) >= 0);
                    });

                    //gm.log("diffList: " + diffList);
                    gm.setList('FillArmyList', diffList);
                    fillArmyList = gm.getList('FillArmyList');
                    gm.deleteValue(caListType.name + 'Responded');
                    gm.deleteValue(fbListType.name + 'Responded');
                    gm.deleteValue(caListType.name + 'Requested');
                    gm.deleteValue(fbListType.name + 'Requested');
                }

                // Add army members //
                var batchCount = 5;
                if (fillArmyList.length < 5) {
                    batchCount = fillArmyList.length;
                } else if (fillArmyList.length - armyCount < 5) {
                    batchCount = fillArmyList.length - armyCount;
                }

                batchCount = batchCount - this.addFriendSpamCheck;
                for (var i = 0; i < batchCount; i += 1) {
                    this.AddFriend(fillArmyList[armyCount]);
                    armyCount += 1;
                    this.addFriendSpamCheck += 1;
                }

                this.SetDivContent('idle_mess', 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                gm.log('Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                gm.setValue("ArmyCount", armyCount);
                if (armyCount >= fillArmyList.length) {
                    this.SetDivContent('idle_mess', '<b>Fill Army Completed</b>');
                    window.setTimeout(function () {
                        caap.SetDivContent('idle_mess', '');
                    }, 5000);

                    gm.log("Fill Army Completed");
                    gm.setValue('FillArmy', false);
                    gm.deleteValue("ArmyCount");
                    gm.deleteValue('FillArmyList');
                }
            }

            return true;
        } catch (err) {
            gm.log("ERROR in AutoFillArmy: " + err);
            this.SetDivContent('idle_mess', '<b>Fill Army Failed</b>');
            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, 5000);

            gm.setValue('FillArmy', false);
            gm.deleteValue("ArmyCount");
            gm.deleteValue('FillArmyList');
            gm.deleteValue(caListType.name + 'Responded');
            gm.deleteValue(fbListType.name + 'Responded');
            gm.deleteValue(caListType.name + 'Requested');
            gm.deleteValue(fbListType.name + 'Requested');
            return false;
        }
    },

    AjaxGiftCheck: function () {
        try {
            if (!this.WhileSinceDidIt("AjaxGiftCheckTimer", (5 * 60) + Math.floor(Math.random() * 3 * 60))) {
                return false;
            }

            gm.log("Performing AjaxGiftCheck");

            $.ajax({
                url: "http://apps.facebook.com/castle_age/index.php",
                error:
                    function (XMLHttpRequest, textStatus, errorThrown) {
                        gm.log("AjaxGiftCheck.ajax: " + textStatus);
                    },
                success:
                    function (data, textStatus, XMLHttpRequest) {
                        try {
                            gm.log("AjaxGiftCheck.ajax: Checking data.");
                            if ($(data).find("a[href*='reqs.php#confirm_']").length) {
                                gm.log('AjaxGiftCheck.ajax: We have a gift waiting!');
                                gm.setValue('HaveGift', true);
                            } else {
                                gm.log('AjaxGiftCheck.ajax: No gifts waiting.');
                            }

                            gm.log("AjaxGiftCheck.ajax: Done.");
                        } catch (err) {
                            gm.log("ERROR in AjaxGiftCheck.ajax: " + err);
                        }
                    }
            });

            this.JustDidIt('AjaxGiftCheckTimer');
            gm.log("Completed AjaxGiftCheck");
            return true;
        } catch (err) {
            gm.log("ERROR in AjaxGiftCheck: " + err);
            return false;
        }
    },

    Idle: function () {
        //Update Monster Finder
        if (this.WhileSinceDidIt("clearedMonsterFinderLinks", 72 * 60 * 60)) {
            this.clearLinks(true);
        }

        this.AjaxGiftCheck();
        this.AutoFillArmy(this.friendListType.giftc, this.friendListType.facebook);
        this.AutoCollectMA();
        this.ReconPlayers();
        this.UpdateDashboard();
        gm.setValue('ReleaseControl', true);
        return true;
    },

    /*-------------------------------------------------------------------------------------\
                                      RECON PLAYERS
    ReconPlayers is an idle background process that scans the battle page for viable
    targets that can later be attacked.
    \-------------------------------------------------------------------------------------*/
    ReconPlayers: function () {
        try {
    /*-------------------------------------------------------------------------------------\
    If recon is disabled or if we check our timer to make sure we are not running recon too
    often.
    \-------------------------------------------------------------------------------------*/
            if (!gm.getValue('DoPlayerRecon', false)) {
                return false;
            }

            if (this.stats.stamina.num <= 0) {
                return false;
            }

            if (!this.CheckTimer('PlayerReconTimer')) {
                return false;
            }

            this.SetDivContent('idle_mess', 'Player Recon: Starting');
    /*-------------------------------------------------------------------------------------\
    If we don't have our iframe then we open it up. We give an additional 30 seconds to get
    loaded.
    \-------------------------------------------------------------------------------------*/
            if (!document.getElementById("iframeRecon")) {
                nHtml.OpenInIFrame('http://apps.facebook.com/castle_age/battle.php#iframeRecon', 'iframeRecon');
                gm.log('Opening the recon iframe');
                this.SetTimer('PlayerReconTimer', 30);
                return true;
            }
    /*-------------------------------------------------------------------------------------\
    pageObj wil contain our iframe DOM content.  If we don't have any content yet we give
    it another 30 seconds.
    \-------------------------------------------------------------------------------------*/
            var pageObj = document.getElementById("iframeRecon").contentDocument;
            if (!pageObj) {
                gm.log('Recon HTML page not ready. waithing For 30 more secionds.');
                this.SetTimer('PlayerReconTimer', 30);
                return true;
            }

            this.SetDivContent('idle_mess', 'Player Recon: In Progress');
    /*-------------------------------------------------------------------------------------\
    We use the 'invade' button gif for our snapshot.  If we don't find any then we aren't
    in the right place or have a load problem
    \-------------------------------------------------------------------------------------*/
            var target = "//input[contains(@src,'battle_01.gif')]";
            var ss = pageObj.evaluate(target, pageObj, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (ss.snapshotLength <= 0) {
                pageObj.location.reload(true);
                gm.log('Recon can not find battle page');
                caap.SetDivContent('idle_mess', '');
                return false;
            }

            //gm.log("Found targets: "+ss.snapshotLength);
    /*-------------------------------------------------------------------------------------\
    Next we get our Recon Player settings for lowest rank, highest level, and army ratio
    base multiplier.
    \-------------------------------------------------------------------------------------*/
            var reconRank = gm.getNumber('ReconPlayerRank', 99);
            var reconLevel = gm.getNumber('ReconPlayerLevel', 999);
            var reconARBase = gm.getNumber('ReconPlayerARBase', 999);
            var found = 0;
    /*-------------------------------------------------------------------------------------\
    Now we step through our snapshot data which represents data within each 'tr' for each
    target on the battle page.  We step back through the parent objects until we have the
    entire 'tr'
    \-------------------------------------------------------------------------------------*/
            for (var s = 0; s < ss.snapshotLength; s += 1) {
                var obj = ss.snapshotItem(s);
                while (obj.tagName.toLowerCase() != "tr") {
                    obj = obj.parentNode;
                }

                var tr = obj;
    /*-------------------------------------------------------------------------------------\
    We get the deity number for the target
    \-------------------------------------------------------------------------------------*/
                var deityNum = this.NumberOnly(this.CheckForImage('symbol_', tr, pageObj).src.match(/\d+\.jpg/i).toString());
    /*-------------------------------------------------------------------------------------\
    We also get the targets actual name, level and rank from the text string
    \-------------------------------------------------------------------------------------*/
                var regex = new RegExp('(.+), Level ([0-9]+)\\s*([A-Za-z ]+)\\s*([0-9]+)', 'i');
                var txt = $.trim(nHtml.GetText(tr));
                var levelm = regex.exec(txt);
                if (!levelm) {
                    gm.log('Recon can not parse target text string' + txt);
                    continue;
                }

                var nameStr = $.trim(levelm[1]);
                var levelNum = parseInt(levelm[2], 10);
                var rankStr = $.trim(levelm[3]);
                var rankNum = this.rankTable[rankStr.toLowerCase()];
    /*-------------------------------------------------------------------------------------\
    Then we get the targets army count and userid.  We'll also save the current time we
    found the target alive.
    \-------------------------------------------------------------------------------------*/
                var armyNum = parseInt(levelm[4], 10);
                var userID = nHtml.FindByAttrXPath(tr, "input", "@name='target_id'", pageObj).value;
                var aliveTime = (new Date().getTime());
                //gm.log('Player stats: '+userID+' '+nameStr+' '+deityNum+' '+rankStr+' '+rankNum+' '+levelNum+' '+armyNum+' '+aliveTime);
    /*-------------------------------------------------------------------------------------\
    We filter out targets that are above the recon max level or below the recon min rank
    \-------------------------------------------------------------------------------------*/
                if (levelNum - this.stats.level > reconLevel) {
                    continue;
                }

                if (this.stats.rank - rankNum  > reconRank) {
                    continue;
                }
    /*-------------------------------------------------------------------------------------\
    We adjust the army ratio base by our level multiplier and then apply this to our army
    size.  If the result is our adjusted army size is below the targets army size then
    we filter this taregt too.
    \-------------------------------------------------------------------------------------*/
                var levelMultiplier = this.stats.level / levelNum;
                var armyRatio = reconARBase * levelMultiplier;
                if (armyRatio <= 0) {
                    gm.log('Recon unable to calculate army ratio: ' + reconARBase + '/' + levelMultiplier);
                    continue;
                }

                if (armyNum > (this.stats.army * armyRatio)) {
                    continue;
                }
                //gm.log('Target Found: '+userID+' '+nameStr+' '+deityNum+' '+rankStr+' '+rankNum+' '+levelNum+' '+armyNum+' '+aliveTime);
    /*-------------------------------------------------------------------------------------\
    Ok, recon has found a viable target. We get any existing values from the targetsOL
    database.
    \-------------------------------------------------------------------------------------*/
                found += 1;
                var invadewinsNum = gm.getListObjVal('targetsOl', userID, 'invadewinsNum', -1);
                var invadelossesNum = gm.getListObjVal('targetsOl', userID, 'invadelossesNum', -1);
                var duelwinsNum = gm.getListObjVal('targetsOl', userID, 'duelwinsNum', -1);
                var duellossesNum = gm.getListObjVal('targetsOl', userID, 'duellossesNum', -1);
                var defendwinsNum = gm.getListObjVal('targetsOl', userID, 'defendwinsNum', -1);
                var defendlossesNum = gm.getListObjVal('targetsOl', userID, 'defendlossesNum', -1);
                var goldNum = gm.getListObjVal('targetsOl', userID, 'goldNum', -1);
                var attackTime = gm.getListObjVal('targetsOl', userID, 'attackTime', 0);
                var selectTime = gm.getListObjVal('targetsOl', userID, 'selectTime', 0);
                var statswinsNum = gm.getListObjVal('targetsOl', userID, 'statswinsNum', -1);
                var statslossesNum = gm.getListObjVal('targetsOl', userID, 'statswinsNum', -1);
    /*-------------------------------------------------------------------------------------\
    And then we add/update targetsOL database with information on the target. We include
    the max value of the number of entries on the first update
    \-------------------------------------------------------------------------------------*/
                var entryLimit = gm.getValue('LimitTargets', 100);
                gm.setListObjVal('targetsOl', userID, 'nameStr', nameStr, entryLimit);          /* Target name */
                gm.setListObjVal('targetsOl', userID, 'rankStr', rankStr);                     /* Target rank */
                gm.setListObjVal('targetsOl', userID, 'rankNum', rankNum);                     /* Target rank number */
                gm.setListObjVal('targetsOl', userID, 'levelNum', levelNum);                   /* Traget level */
                gm.setListObjVal('targetsOl', userID, 'armyNum', armyNum);                     /* Target army size */
                gm.setListObjVal('targetsOl', userID, 'deityNum', deityNum);                   /* Target deity affiliation number */
                gm.setListObjVal('targetsOl', userID, 'invadewinsNum', invadewinsNum);         /* Tally of invade wins against target */
                gm.setListObjVal('targetsOl', userID, 'invadelossesNum', invadelossesNum);     /* Tally of invade losses against target */
                gm.setListObjVal('targetsOl', userID, 'duelwinsNum', duelwinsNum);             /* Tally of duel wins against target */
                gm.setListObjVal('targetsOl', userID, 'duellossesNum', duellossesNum);         /* Tally of duel losses against target */
                gm.setListObjVal('targetsOl', userID, 'defendwinsNum', defendwinsNum);         /* Tally of wins when target attacked us */
                gm.setListObjVal('targetsOl', userID, 'defendlossesNum', defendlossesNum);     /* Tally of losses when target attacked us */
                gm.setListObjVal('targetsOl', userID, 'statswinsNum', statswinsNum);           /* Targets win count from stats */
                gm.setListObjVal('targetsOl', userID, 'statslossesNum', statslossesNum);       /* Targets loss count from stats */
                gm.setListObjVal('targetsOl', userID, 'goldNum', goldNum);                     /* Tally of gold won from target */
                gm.setListObjVal('targetsOl', userID, 'aliveTime', aliveTime);                 /* Last time found alive */
                gm.setListObjVal('targetsOl', userID, 'attackTime', attackTime);               /* Last time attacked */
                gm.setListObjVal('targetsOl', userID, 'selectTime', selectTime);               /* Last time selected to attack */
            }
    /*-------------------------------------------------------------------------------------\
    We're done with recon.  Reload the battle page for next pass and set timer for the next
    recon to occur in 60 seconds
    \-------------------------------------------------------------------------------------*/
            pageObj.location.reload(true);
            var retrySecs = gm.getValue('PlayerReconRetry', 60);
            this.SetTimer('PlayerReconTimer', retrySecs);
            if (found > 0) {
                this.SetDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + gm.getList('targetsOl').length);
            } else {
                this.SetDivContent('idle_mess', 'Player Recon: No Targets Found');
            }

            window.setTimeout(function () {
                caap.SetDivContent('idle_mess', '');
            }, retrySecs * 1000);

            return false;
        } catch (e) {
            gm.log("ERROR in Recon :" + e);
            return false;
        }
    },

    currentPage: "",

    currentTab: "",

    waitMilliSecs: 5000,

    /////////////////////////////////////////////////////////////////////
    //                          MAIN LOOP
    // This function repeats continously.  In principle, functions should only make one
    // click before returning back here.
    /////////////////////////////////////////////////////////////////////

    actionDescTable: {
        'Page': 'Reviewing Pages',
        'AutoIncome': 'Awaiting Income',
        'AutoStat': 'Upgrade Skill Points',
        'MaxEnergyQuest': 'At Max Energy Quest',
        'PassiveGeneral': 'Setting Idle General',
        'Idle': 'Idle Tasks',
        'ImmediateBanking': 'Immediate Banking',
        'Battle': 'Battling Players',
        'MonsterReview': 'Review Monsters/Raids',
        'ImmediateAutoStat': 'Immediate Auto Stats',
        'Elite': 'Fill Elite Guard',
//      'ArenaElite': 'Fill Arena Elite',
        'AutoPotions': 'Auto Potions',
        'Alchemy': 'Auto Alchemy',
        'Blessing': 'Auto Bless',
        'AutoGift': 'Auto Gifting',
        'MonsterFinder': 'Monster Finder',
        'DemiPoints': 'Demi Points First',
        'Monsters': 'Fighting Monsters',
        'Heal': 'Auto Healing',
        'Bank': 'Auto Banking',
        'Land': 'Buy/Sell Land'
    },

    CheckLastAction: function (thisAction) {
        var lastAction = gm.getValue('LastAction', 'none');
        if (this.actionDescTable[thisAction]) {
            this.SetDivContent('activity_mess', 'Activity: ' + this.actionDescTable[thisAction]);
        } else {
            this.SetDivContent('activity_mess', 'Activity: ' + thisAction);
        }

        if (lastAction != thisAction) {
            gm.log('Changed from doing ' + lastAction + ' to ' + thisAction);
            gm.setValue('LastAction', thisAction);
        }
    },

    // The Master Action List
    masterActionList: {
        0x00: 'Elite',
//      0x01: 'ArenaElite',
        0x02: 'Heal',
        0x03: 'ImmediateBanking',
        0x04: 'ImmediateAutoStat',
        0x05: 'MaxEnergyQuest',
        0x06: 'DemiPoints',
        0x07: 'MonsterReview',
        0x08: 'Monsters',
        0x09: 'Battle',
        0x0A: 'MonsterFinder',
        0x0B: 'Quests',
        0x0C: 'PassiveGeneral',
        0x0D: 'Land',
        0x0E: 'Bank',
        0x0F: 'Blessing',
        0x10: 'AutoStat',
        0x11: 'AutoGift',
        0x12: 'AutoPotions',
        0x13: 'Alchemy',
        0x14: 'Idle'
    },

    actionsList: [],

    MakeActionsList: function () {
        try {
            if (this.actionsList.length === 0) {
                gm.log("Loading a fresh Action List");
                // actionOrder is a comma seperated string of action numbers as
                // hex pairs and can be referenced in the Master Action List
                // Example: "00,01,02,03,04,05,06,07,08,09,0A,0B,0C,0D,0E,0F,10,11,12,13,14"
                var action = '';
                var actionOrderArray = [];
                var masterActionListCount = 0;
                var actionOrderUser = gm.getValue("actionOrder", '');
                if (actionOrderUser !== '') {
                    // We are using the user defined actionOrder set in the
                    // Advanced Hidden Options
                    gm.log("Trying user defined Action Order");
                    // We take the User Action Order and convert it from a comma
                    // separated list into an array
                    actionOrderArray = actionOrderUser.split(",");
                    // We count the number of actions contained in the
                    // Master Action list
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount += 1;
                            //gm.log("Counting Action List: " + masterActionListCount);
                        } else {
                            gm.log("Error Getting Master Action List length!");
                            gm.log("Skipping 'action' from masterActionList: " + action);
                        }
                    }
                } else {
                    // We are building the Action Order Array from the
                    // Master Action List
                    gm.log("Building the default Action Order");
                    for (action in this.masterActionList) {
                        if (this.masterActionList.hasOwnProperty(action)) {
                            masterActionListCount = actionOrderArray.push(action);
                            //gm.log("Action Added: " + action);
                        } else {
                            gm.log("Error Building Default Action Order!");
                            gm.log("Skipping 'action' from masterActionList: " + action);
                        }
                    }
                }

                // We notify if the number of actions are not sensible or the
                // same as in the Master Action List
                var actionOrderArrayCount = actionOrderArray.length;
                if (actionOrderArrayCount === 0) {
                    var throwError = "Action Order Array is empty! " +
                        actionOrderUser === "" ? "(Default)" : "(User)";
                    throw throwError;
                }

                if (actionOrderArrayCount < masterActionListCount) {
                    gm.log("Warning! Action Order Array has fewer orders than default!");
                }

                if (actionOrderArrayCount > masterActionListCount) {
                    gm.log("Warning! Action Order Array has more orders than default!");
                }

                // We build the Action List
                //gm.log("Building Action List ...");
                for (var itemCount = 0; itemCount !== actionOrderArrayCount; itemCount += 1) {
                    var actionItem = '';
                    if (actionOrderUser !== '') {
                        // We are using the user defined comma separated list
                        // of hex pairs
                        actionItem = this.masterActionList[parseInt(actionOrderArray[itemCount], 16)];
                        //gm.log("(" + itemCount + ") Converted user defined hex pair to action: " + actionItem);
                    } else {
                        // We are using the Master Action List
                        actionItem = this.masterActionList[actionOrderArray[itemCount]];
                        //gm.log("(" + itemCount + ") Converted Master Action List entry to an action: " + actionItem);
                    }

                    // Check the Action Item
                    if (actionItem.length > 0 && typeof(actionItem) === "string") {
                        // We add the Action Item to the Action List
                        this.actionsList.push(actionItem);
                        //gm.log("Added action to the list: " + actionItem);
                    } else {
                        gm.log("Error! Skipping actionItem");
                        gm.log("Action Item(" + itemCount + "): " + actionItem);
                    }
                }

                if (actionOrderUser !== '') {
                    gm.log("Get Action List: " + this.actionsList);
                }
            }
			if (this.actionsList[0] != 'Page') {
				this.actionsList.unshift('Page');
			}
            return true;
        } catch (e) {
            // Something went wrong, log it and use the emergency Action List.
            gm.log("ERROR in MakeActionsList: " + e);
            this.actionsList = [
				'Page',
                "Elite",
//                "ArenaElite",
                "Heal",
                "ImmediateBanking",
                "ImmediateAutoStat",
                "MaxEnergyQuest",
                "DemiPoints",
                "MonsterReview",
                "Monsters",
                "Battle",
                "MonsterFinder",
                "Quests",
                "PassiveGeneral",
                "Land",
                "Bank",
                "Blessing",
                "AutoStat",
                "AutoGift",
                "AutoPotions",
                "Alchemy",
                "Idle"
            ];
            return false;
        }
    },

    MainLoop: function () {
        this.waitMilliSecs = 5000;
        // assorted errors...
        var href = location.href;
        if (href.indexOf('/common/error.html') >= 0) {
            gm.log('detected error page, waiting to go back to previous page.');
            window.setTimeout(function () {
                window.history.go(-1);
            }, 30 * 1000);

            return;
        }

        if (document.getElementById('try_again_button')) {
            gm.log('detected Try Again message, waiting to reload');
            // error
            window.setTimeout(function () {
                window.history.go(0);
            }, 30 * 1000);

            return;
        }

        if (gm.getValue("fbFilter", false) && (window.location.href.indexOf('apps.facebook.com/reqs.php') >= 0 || window.location.href.indexOf('apps.facebook.com/home.php') >= 0 ||  window.location.href.indexOf('filter=app_46755028429') >= 0)) {
            var css = "#contentArea div[id^=\"div_story_\"]:not([class*=\"46755028429\"]) {\ndisplay:none !important;\n}";
            if (typeof GM_addStyle != "undefined") {
                GM_addStyle(css);
            }
        }

        var locationFBMF = false;
        if (global.is_chrome) {
            if (window.location.href.indexOf('apps.facebook.com/reqs.php') >= 0 || window.location.href.indexOf('apps.facebook.com/home.php') >= 0 ||  window.location.href.indexOf('filter=app_46755028429') >= 0) {
                locationFBMF = true;
            }
        } else {
            if (window.location.href.indexOf('www.facebook.com/reqs.php') >= 0 || window.location.href.indexOf('www.facebook.com/home.php') >= 0 ||  window.location.href.indexOf('filter=app_46755028429') >= 0) {
                locationFBMF = true;
            }
        }

        if (locationFBMF) {
            if (gm.getValue("mfStatus", "") == "OpenMonster") {
                gm.log("Opening Monster " + gm.getValue("navLink"));
                this.CheckMonster();
            } else if (gm.getValue("mfStatus", "") == "CheckMonster") {
                gm.log("Scanning URL for new monster");
                this.selectMonst();
            }

            this.MonsterFinderOnFB();
            this.AcceptGiftOnFB();
            this.WaitMainLoop();
            return;
        }

        //We don't need to send out any notifications
        var button = nHtml.FindByAttrContains(document.body, "a", "class", 'undo_link');
        if (button) {
            this.Click(button);
            gm.log('Undoing notification');
        }

        var caapDisabled = gm.getValue('Disabled', false);
        if (caapDisabled) {
            if (global.is_chrome) {
                CE_message("disabled", null, caapDisabled);
            }

            this.WaitMainLoop();
            return;
        }

        if (!this.GetStats()) {
            var noWindowLoad = gm.getValue('NoWindowLoad', 0);
            if (noWindowLoad === 0) {
                this.JustDidIt('NoWindowLoadTimer');
                gm.setValue('NoWindowLoad', 1);
            } else if (this.WhileSinceDidIt('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 60 * 60))) {
                this.JustDidIt('NoWindowLoadTimer');
                gm.setValue('NoWindowLoad', noWindowLoad + 1);
                this.ReloadCastleAge();
            }

            gm.log('Page no-load count: ' + noWindowLoad);
            this.WaitMainLoop();
            return;
        } else {
            gm.setValue('NoWindowLoad', 0);
        }

        if (gm.getValue('caapPause', 'none') != 'none') {
            this.caapDivObject.css({
                background: gm.getValue('StyleBackgroundDark', '#fee'),
                opacity: gm.getValue('StyleOpacityDark', '1')
            });

            this.caapTopObject.css({
                background: gm.getValue('StyleBackgroundDark', '#fee'),
                opacity: gm.getValue('StyleOpacityDark', '1')
            });

            this.WaitMainLoop();
            return;
        }

        if (this.WhileSinceDidIt('clickedOnSomething', 25) && this.waitingForDomLoad) {
            gm.log('Clicked on something, but nothing new loaded.  Reloading page.');
            this.ReloadCastleAge();
        }

        if (this.AutoIncome()) {
            this.CheckLastAction('AutoIncome');
            this.WaitMainLoop();
            return;
        }

        this.MakeActionsList();
        var actionsListCopy = this.actionsList.slice();

        //gm.log("Action List: " + actionsListCopy);
        if (!gm.getValue('ReleaseControl', false)) {
            actionsListCopy.unshift(gm.getValue('LastAction', 'Idle'));
        } else {
            gm.setValue('ReleaseControl', false);
        }

        //gm.log('Action List2: ' + actionsListCopy);
        for (var action in actionsListCopy) {
			worker = WorkerByName(actionsListCopy[action]);
			if (actionsListCopy.hasOwnProperty(action) &&
					typeof this[actionsListCopy[action]] == 'function') {
				result = this[actionsListCopy[action]]();
			} else if (worker) {
				worker._unflush();
                result = worker._work(true);
				if (result) {
                    gm.log('Doing worker ' + worker.name);
                }
            } else {
				gm.log('ERROR - No function for ' + actionsListCopy[action]);
			}

			if (result) {
                //gm.log('Action: ' + actionsListCopy[action]);
                this.CheckLastAction(actionsListCopy[action]);
                break;
            }
        }

        for (i = 0; i < Workers.length; i += 1) {
            Workers[i]._flush();
        }

        this.WaitMainLoop();
    },

    WaitMainLoop: function () {
        this.waitForPageChange = true;
        nHtml.setTimeout(function () {
            caap.waitForPageChange = false;
            caap.MainLoop();
        }, caap.waitMilliSecs * (1 + Math.random() * 0.2));
    },

    ReloadCastleAge: function () {
        // better than reload... no prompt on forms!
        if (window.location.href.indexOf('castle_age') >= 0 && !gm.getValue('Disabled') &&
                (gm.getValue('caapPause') == 'none')) {
            if (global.is_chrome) {
                CE_message("paused", null, gm.getValue('caapPause', 'none'));
            }

            //gm.setValue('clickUrl', "http://apps.facebook.com/castle_age/index.php?bm=1");
            window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
        }
    },

    ReloadOccasionally: function () {
        var reloadMin = gm.getNumber('ReloadFrequency', 8);
        if (!reloadMin || reloadMin < 8) {
            reloadMin = 8;
        }

        nHtml.setTimeout(function () {
            if (caap.WhileSinceDidIt('clickedOnSomething', 5 * 60)) {
                gm.log('Reloading if not paused after inactivity');
                if ((window.location.href.indexOf('castle_age') >= 0 || window.location.href.indexOf('reqs.php#confirm_46755028429_0') >= 0) &&
                        !gm.getValue('Disabled') && (gm.getValue('caapPause') == 'none')) {
                    if (global.is_chrome) {
                        CE_message("paused", null, gm.getValue('caapPause', 'none'));
                    }

                    //gm.setValue('clickUrl', "http://apps.facebook.com/castle_age/index.php?bm=1");
                    window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
                }
            }

            caap.ReloadOccasionally();
        }, 1000 * 60 * reloadMin + (reloadMin * 60 * 1000 * Math.random()));
    }
};

/////////////////////////////////////////////////////////////////////
//                         BEGIN
/////////////////////////////////////////////////////////////////////

if (typeof GM_log != 'function') {
    alert("Your browser does not appear to support Greasemonkey scripts!");
    throw "Error: Your browser does not appear to support Greasemonkey scripts!";
}
gm.log("Starting");
//////////   Start Golem _main.js

var show_debug = true;

// Shouldn't touch
var VERSION = 30.9;
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';
var isGreasemonkey = (navigator.userAgent.toLowerCase().indexOf('chrome') === -1);

// Decide which facebook app we're in...
var applications = {
	'reqs.php':['','Gifts'], // For gifts etc
	'castle_age':['46755028429', 'Castle Age']
};

if (window.location.hostname === 'apps.facebook.com' || window.location.hostname === 'apps.new.facebook.com') {
	for (var i in applications) {
		if (window.location.pathname.indexOf(i) === 1) {
			var APP = i;
			var APPID = applications[i][0];
			var APPNAME = applications[i][1];
			var PREFIX = 'golem'+APPID+'_';
			break;
		}
	}
}

var log = console.log;

if (show_debug) {
	var debug = function(txt) {
				console.log('[' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + txt);
	};
} else {
	var debug = function(){};
}

if (typeof unsafeWindow === 'undefined') {
	unsafeWindow = window;
}

//////////   End Golem _main.js


/////////////////////////////////////////////////////////////////////
//                         Chrome Startup
/////////////////////////////////////////////////////////////////////

if (global.is_chrome) {
    try {
        var lastVersion = localStorage.getItem(global.gameName + '__LastVersion', 0);
        var shouldTryConvert = false;
        if (lastVersion) {
            if (lastVersion.substr(0, 1) == 's') {
                shouldTryConvert = true;
            }
        }

        if (caapVersion <= '140.21.9' || shouldTryConvert) {
            ConvertGMtoJSON();
        }
    } catch (e) {
        gm.log("Error converting DB: " + e);
    }

    try {
        CM_Listener();
    } catch (e) {
        gm.log("Error loading CM_Listener" + e);
    }
}

/////////////////////////////////////////////////////////////////////
//                         Set Title
/////////////////////////////////////////////////////////////////////

if (gm.getValue('SetTitle')) {
    var DocumentTitle = '';
    if (gm.getValue('SetTitleAction', false)) {
        DocumentTitle += "Starting - ";
    }

    if (gm.getValue('SetTitleName', false)) {
        DocumentTitle += gm.getValue('PlayerName', 'CAAP') + " - ";
    }

    document.title = DocumentTitle + global.documentTitle;
}

/////////////////////////////////////////////////////////////////////
//                          GitHub updater
// Used by browsers other than Chrome (namely Firefox and Flock)
// to get updates from github.com
/////////////////////////////////////////////////////////////////////

if (!global.is_chrome) {
    try {
        if (gm.getValue('SUC_remote_version', 0) > caapVersion) {
            global.newVersionAvailable = true;
        }

        // update script from: http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/Castle-Age-Autoplayer.user.js

        function updateCheck(forced) {
            if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                try {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'http://github.com/Xotic750/Castle-Age-Autoplayer/raw/master/Castle-Age-Autoplayer.user.js',
                        headers: {'Cache-Control': 'no-cache'},
                        onload: function (resp) {
                            var rt = resp.responseText;
                            var remote_version = new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt)[1];
                            var script_name = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];
                            gm.setValue('SUC_last_update', new Date().getTime() + '');
                            gm.setValue('SUC_target_script_name', script_name);
                            gm.setValue('SUC_remote_version', remote_version);
                            gm.log('remote version ' + remote_version);
                            if (remote_version > caapVersion) {
                                global.newVersionAvailable = true;
                                if (forced) {
                                    if (confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                        GM_openInTab('http://senses.ws/caap/index.php?topic=771.msg3582#msg3582');
                                    }
                                }
                            } else if (forced) {
                                alert('No update is available for "' + script_name + '."');
                            }
                        }
                    });
                } catch (err) {
                    if (forced) {
                        alert('An error occurred while checking for updates:\n' + err);
                    }
                }
            }
        }

        GM_registerMenuCommand(gm.getValue('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
            updateCheck(true);
        });

        updateCheck(false);
    } catch (err) {
        gm.log("ERROR in GitHub updater: " + err);
    }
}

/////////////////////////////////////////////////////////////////////
// Put code to be run once to upgrade an old version's variables to
// new format or such here.
/////////////////////////////////////////////////////////////////////

if (gm.getValue('LastVersion', 0) != caapVersion) {
    try {
        if (parseInt(gm.getValue('LastVersion', 0), 10) < 121) {
            gm.setValue('WhenBattle', gm.getValue('WhenFight', 'Stamina Available'));
        }

        // This needs looking at, although not really used, need to check we are using caap keys
        if (parseInt(gm.getValue('LastVersion', 0), 10) < 126) {
            var storageKeys = GM_listValues();
            for (var key = 0; key < storageKeys.length; key += 1) {
                if (GM_getValue(storageKeys[key])) {
                    GM_setValue(storageKeys[key], GM_getValue(storageKeys[key]).toString().replace('~', global.os).replace('`', global.vs));
                }
            }
        }

        if (parseInt(gm.getValue('LastVersion', 0), 10) < 130 && gm.getValue('MonsterGeneral')) {
            gm.setValue('AttackGeneral', gm.getValue('MonsterGeneral'));
            gm.deleteValue('MonsterGeneral');
        }

        if (parseInt(gm.getValue('LastVersion', 0), 10) < 133) {
            var clearList = ['FreshMeatMaxLevel', 'FreshMeatARMax', 'FreshMeatARMin'];
            clearList.forEach(function (gmVal) {
                gm.setValue(gmVal, '');
            });
        }

        if ((gm.getValue('LastVersion', 0) < '140.15.3' || gm.getValue('LastVersion', 0) < '140.21.0') &&
                gm.getValue("actionOrder", '') !== '') {
            alert("You are using a user defined Action List!\n" +
                  "The Master Action List has changed!\n" +
                  "You must update your Action List!");
        }

        if (gm.getValue('LastVersion', 0) < '140.16.2') {
            for (var a = 1; a <= 5; a += 1) {
                var attribute = gm.getValue("Attribute" + a, '');
                if (attribute !== '') {
                    gm.setValue("Attribute" + a, attribute.ucFirst());
                    gm.log("Converted Attribute" + a + ": " + attribute + "   to: " + attribute.ucFirst());
                }
            }
        }

        if (gm.getValue('LastVersion', 0) < '140.23.0') {
            var convertToArray = function (name) {
                var value = gm.getValue(name, '');
                var eList = [];
                if (value.length) {
                    value = value.replace(/\n/gi, ',');
                    eList = value.split(',');
                    var fEmpty = function (e) {
                        return e !== '';
                    };

                    eList = eList.filter(fEmpty);
                    if (!eList.length) {
                        eList = [];
                    }
                }

                gm.setList(name, eList);
            };

            convertToArray('EliteArmyList');
            convertToArray('BattleTargets');
        }

        if (gm.getValue('LastVersion', 0) < '140.23.6') {
            gm.deleteValue('AutoEliteGetList');
            gm.deleteValue('AutoEliteReqNext');
            gm.deleteValue('AutoEliteEnd');
            gm.deleteValue('MyEliteTodo');
        }

        gm.setValue('LastVersion', caapVersion);
    } catch (err) {
        gm.log("ERROR in Environment updater: " + err);
    }
}

/////////////////////////////////////////////////////////////////////
//                    On Page Load
/////////////////////////////////////////////////////////////////////

$(function () {
    gm.log('Full page load completed');
    // If unable to read in gm.values, then reload the page
    if (gm.getValue('caapPause', 'none') !== 'none' && gm.getValue('caapPause', 'none') !== 'block') {
        gm.log('Refresh page because unable to load gm.values due to unsafewindow error');
        window.location.href = window.location.href;
    }

    gm.setValue('clickUrl', window.location.href);
    global.AddCSS();
    if (window.location.href.indexOf('facebook.com/castle_age/') >= 0) {
        gm.setValue('caapPause', 'none');
        gm.setValue('ReleaseControl', true);
        if (global.is_chrome) {
            CE_message("paused", null, gm.getValue('caapPause', 'none'));
        }

        nHtml.setTimeout(function () {
			userID = $('head').html().regex(/user:([0-9]+),/i);
			if (!userID || typeof userID !== 'number' || userID === 0) {
				log('ERROR: No Facebook UserID!!!');
				window.location.href = window.location.href; // Force reload without retrying
			}
			Page.identify();
			gm.log('Workers: ' + Workers.length);
			for (ii=0; ii<Workers.length; ii++) {
					//alert('Setup for ' + ii + ' worker ' + Workers[ii].name);
					Workers[ii]._setup();
			}
			for (i=0; i<Workers.length; i++) {
					Workers[i]._init();
			}
			for (i=0; i<Workers.length; i++) {
					Workers[i]._update();
					Workers[i]._flush();
			}
			Page.parse_all(); // Call once to get the ball rolling...
            caap.init();
        }, 200);
    }

    caap.waitMilliSecs = 8000;
    caap.WaitMainLoop();
});

caap.ReloadOccasionally();
// Utility functions

// Prototypes to ease functionality

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.filepart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(x+1);
	}
	return this;
};

String.prototype.pathpart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(0, x+1);
	}
	return this;
};

String.prototype.regex = function(r) {
	var a = this.match(r), i;
	if (a) {
		a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length===1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.toNumber = function() {
	return parseFloat(this);
};

String.prototype.parseTimer = function() {
	var a = this.split(':'), b = 0, i;
	for (i=0; i<a.length; i++) {
		b = b * 60 + parseInt(a[i],10);
	}
	if (isNaN(b)) {
		b = 9999;
	}
	return b;
};

Number.prototype.round = function(dec) {
	return result = Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var WorkerByName = function(name) { // Get worker object by Worker.name
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].name.toLowerCase() === name.toLowerCase()) {
			return Workers[i];
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].id === id) {
			return Workers[i];
		}
	}
	return null;
};

var Divisor = function(number) { // Find a "nice" value that goes into number up to 20 times
	var num = number, step = 1;
	if (num < 20) {
		return 1;
	}
	while (num > 100) {
		num /= 10;
		step *= 10;
	}
	num -= num % 5;
	if ((number / step) > 40) {
		step *= 5;
	} else if ((number / step) > 20) {
		step *= 2.5;
	}
	return step;
};

var length = function(obj) { // Find the number of entries in an object (also works on arrays)
	var l = 0, i;
	if (typeof obj === 'object') {
		for(i in obj) {
			l++;
		}
	} else if (typeof obj === 'array') {
		l = obj.length;
	}
	return l;
};

var unique = function (a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var deleteElement = function(list, value) { // Removes matching elements from an array
	while (value in list) {
		list.splice(list.indexOf(value), 1);
	}
}
			
var sum = function (a) { // Adds the values of all array entries together
	var i, t = 0;
	if (isArray(a)) {
		for(i=0; i<a.length; i++) {
			t += sum(a[i] || 0);
		}
	} else if (typeof a === 'object') {
		for(i in a) {
			t += sum(a[i]);
		}
	} else if (typeof a === 'number') {
		t = a;
	} else if (typeof a === 'string' && a.search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
		t = parseFloat(a);
	}
	return t;
};

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s ? s.toString() : '0', r=new RegExp('(-?[0-9]+)([0-9]{3})');
	while(r.test(a)) {
		a = a.replace(r, '$1,$2');
	}
	return a;
};

var findInArray = function(list, value) {
	if (typeof list === 'array' || typeof list === 'object') {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
};

var arrayIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=0; i<list.length; i++) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};

var arrayLastIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=list.length-1; i>=0; i--) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};


var sortObject = function(object, sortfunc) {
	var list = [], output = {};
	for (i in object) {
		list.push(i);
	}
	list.sort(sortfunc);
	for (i=0; i<list.length; i++) {
		output[list[i]] = object[list[i]];
	}
	return output;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
//				debug('Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(list[units[i]]));
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (length(list[units[i]].use)) {
				delete list[units[i]].use[(user+'_'+x)];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
//		if (count <= 0) {break;}
		own = Math.min(count, own);
		attack += own * list[units[i]].att;
		defend += own * list[units[i]].def;
		count -= own;
	}
	getAttDefList = units;
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

var tr = function(list, html, attr) {
	list.push('<tr' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</tr>');
};

var th = function(list, html, attr) {
	list.push('<th' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</th>');
};

var td = function(list, html, attr) {
	list.push('<td' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</td>');
};

var isArray = function(obj) {   
    return obj && typeof obj === 'object' && !(obj.propertyIsEnumerable('length')) && typeof obj.length === 'number';
};

var isNumber = function(num) {
	return num && typeof num === 'number';
};

var isWorker = function(obj) {
	return obj && findInArray(Workers,obj); // Only a worker if it's an active worker
};

var plural = function(i) {
	return (i === 1 ? '' : 's');
};

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var returnStr = '';
	var replace = Date.replaceChars;
	for (var i = 0; i < format.length; i++) {
		var curChar = format.charAt(i);
		if (replace[curChar]) {
			returnStr += replace[curChar].call(this);
		} else {
			returnStr += curChar;
		}
	}
	return returnStr;
};

Date.replaceChars = {
	shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	// Day
	d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
	D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
	j: function() { return this.getDate(); },
	l: function() { return Date.replaceChars.longDays[this.getDay()]; },
	N: function() { return this.getDay() + 1; },
	S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
	w: function() { return this.getDay(); },
	z: function() { return "Not Yet Supported"; },
	// Week
	W: function() { return "Not Yet Supported"; },
	// Month
	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	n: function() { return this.getMonth() + 1; },
	t: function() { return "Not Yet Supported"; },
	// Year
	L: function() { return (((this.getFullYear()%4==0)&&(this.getFullYear()%100 != 0)) || (this.getFullYear()%400==0)) ? '1' : '0'; },
	o: function() { return "Not Supported"; },
	Y: function() { return this.getFullYear(); },
	y: function() { return ('' + this.getFullYear()).substr(2); },
	// Time
	a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
	A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
	B: function() { return "Not Yet Supported"; },
	g: function() { return this.getHours() % 12 || 12; },
	G: function() { return this.getHours(); },
	h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
	H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
	i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
	s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
	// Timezone
	e: function() { return "Not Yet Supported"; },
	I: function() { return "Not Supported"; },
	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
};

var iscaap = function() {
	return (typeof caap != 'undefined');
};
/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id			     - If we have a .display then this is the html #id of the worker
.name		   - String, the same as our class name.
.pages		  - String, list of pages that we want in the form "town.soldiers keep.stats"
.data		   - Object, for public reading, automatically saved
.option		 - Object, our options, changed from outide ourselves
.settings	       - Object, various values for various sections, default is always false / blank
				system (true/false) - exists for all games
				unsortable (true/false) - stops a worker being sorted in the queue, prevents this.work(true)
				advanced (true/false) - only visible when "Advanced" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
.display		- Create the display object for the settings page.

*** User functions ***
.init()		 - After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)  - This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return QUEUE_RELEASE - We want to run again with status=1, but feel free to interrupt (makes us stateful)
				return false - We're finished
.work(state)    - Do anything we need to do when it's our turn - this includes page changes.
				state = false - It's not our turn, don't start anything if we can't finish in this one call
				state = true - It's our turn, do everything - Only true if not interrupted
				return true if we need to keep working (after a delay etc)
				return false when someone else can work
.update(type)   - Called when the data or options have been changed (even on this._load()!). If !settings.data and !settings.option then call on data, otherwise whichever is set.
				type = "data" or "option"
.get(what)	      - Calls this._get(what)
				Official way to get any information from another worker
				Overload for "special" data, and pass up to _get if basic data
.set(what,value)- Calls this._set(what,value)
				Official way to set any information for another worker
				Overload for "special" data, and pass up to _set if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._working		- Prevent recursive calling of various private functions
._changed		- Timestamp of the last time this.data changed
._watching		- List of other workers that want to have .update() after this.update()

*** Private functions ***
._get(what)				- Returns the data requested, auto-loads if needed, what is 'path.to.data'
._set(what,val)			- Sets this.data[what] to value, auto-loading if needed

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init(keep)			- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(type,worker)	- Calls this.update(type,worker), loading and flushing .data if needed. worker is "null" unless a watched worker.
._watch(worker)			- Add a watcher to worker - so this.update() gets called whenever worker.update() does
._unwatch(worker)		- Removes a watcher from worker (safe to call if not watching).
._remind(secs)			- Calls this._update('reminder') after a specified delay
*/
var Workers = [];
var WorkerStack = []; // Use "WorkerStack.length && WorkerStack[WorkerStack.length-1].name" for current worker name...
/*
if (typeof GM_getValue !== 'undefined') {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	if (typeof localStorage !== 'undefined') {
		var setItem = function(n,v){localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return localStorage.getItem('golem.' + APP + n);}
	} else if (typeof window.localStorage !== 'undefined') {
		var setItem = function(n,v){window.localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return window.localStorage.getItem('golem.' + APP + n);}
	} else if (typeof globalStorage !== 'undefined') {
		var setItem = function(n,v){globalStorage[location.hostname].setItem('golem.' + APP + n, v);}
		var getItem = function(n){return globalStorage[location.hostname].getItem('golem.' + APP + n);}
	}
}
*/
if (isGreasemonkey) {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	var setItem = function(n,v){localStorage.setItem('golem.' + APP + '.' + n, v);}
	var getItem = function(n){return localStorage.getItem('golem.' + APP + '.' + n);}
}

function Worker(name,pages,settings) {
	Workers.push(this);

	// User data
	this.id = null;
	this.name = name;
	this.pages = pages;

	this.defaults = null; // {app:{data:{}, options:{}} - replaces with app-specific data, can be used for any this.* wanted...

	this.settings = settings || {};

	this.data = {};
	this.option = {};
	this.runtime = null;// {} - set to default runtime values in your worker!
	this.display = null;

	// User functions
	this.init = null; //function() {};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type,worker){};
	this.get = function(what) {return this._get(what);}; // Overload if needed
	this.set = function(what,value) {return this._set(what,value);}; // Overload if needed

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._working = {data:false, option:false, runtime:false, update:false};
	this._changed = Date.now();
	this._watching = [];
}

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function() {
	WorkerStack.push(this);
	this._save();
	if (!this.settings.keep) {
		delete this.data;
	}
	WorkerStack.pop();
};

Worker.prototype._get = function(what) { // 'path.to.data'
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: return data;
			case 1: return data[x[0]];
			case 2: return data[x[0]][x[1]];
			case 3: return data[x[0]][x[1]][x[2]];
			case 4: return data[x[0]][x[1]][x[2]][x[3]];
			case 5: return data[x[0]][x[1]][x[2]][x[3]][x[4]];
			case 6: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]];
			case 7: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]];
			default:break;
		}
	} catch(e) {
		WorkerStack.push(this);
		debug(this.name,e.name + ' in ' + this.name + '.get('+what+'): ' + e.message);
		WorkerStack.pop();
	}
	return null;
};

Worker.prototype._init = function() {
	if (this._loaded) {
		return;
	}
	WorkerStack.push(this);
	this._loaded = true;
	try {
		this.init && this.init();
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.init(): ' + e.message);
	}
	WorkerStack.pop();
};

Worker.prototype._load = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		this._load('data');
		this._load('option');
		this._load('runtime');
		return;
	}
	WorkerStack.push(this);
	var v = getItem((this._rootpath ? userID + '.' : '') + type + '.' + this.name);
	if (v) {
		try {
			v = JSON.parse(v);
		} catch(e) {
			debug(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
			v = eval(v); // We used to save our data in non-JSON format...
		}
		this[type] = $.extend(true, {}, this[type], v);
	}
	WorkerStack.pop();
};

Worker.prototype._parse = function(change) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.parse && this.parse(change);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};

Worker.prototype._remind = function(seconds) {
	var me = this;
	window.setTimeout(function(){me._update('reminder', null);}, seconds * 1000);
};

Worker.prototype._save = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		return this._save('data') + this._save('option') + this._save('runtime');
	}
	if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
		return false;
	}
	var n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v = JSON.stringify(this[type]);
	if (getItem(n) === 'undefined' || getItem(n) !== v) {
		WorkerStack.push(this);
		this._working[type] = true;
		this._changed = Date.now();
		this._update(type, null);
		setItem(n, v);
		this._working[type] = false;
		WorkerStack.pop();
		return true;
	}
	return false;
};

Worker.prototype._set = function(what, value) {
	WorkerStack.push(this);
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: data = value; break; // Nobody should ever do this!!
			case 1: data[x[0]] = value; break;
			case 2: data[x[0]][x[1]] = value; break;
			case 3: data[x[0]][x[1]][x[2]] = value; break;
			case 4: data[x[0]][x[1]][x[2]][x[3]] = value; break;
			case 5: data[x[0]][x[1]][x[2]][x[3]][x[4]] = value; break;
			case 6: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]] = value; break;
			case 7: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]] = value; break;
			default:break;
		}
//	      this._save();
	} catch(e) {
		debug(e.name + ' in ' + this.name + '.set('+what+', '+value+'): ' + e.message);
	}
	WorkerStack.pop();
	return null;
};

Worker.prototype._setup = function() {
	WorkerStack.push(this);
	if (this.defaults && this.defaults[APP]) {
		for (var i in this.defaults[APP]) {
			this[i] = this.defaults[APP][i];
		}
	}
	if (this.settings.system || !this.defaults || this.defaults[APP]) {
		this._load();
	} else { // Get us out of the list!!!
		Workers.splice(Workers.indexOf(this), 1);
	}
	WorkerStack.pop();
};

Worker.prototype._unflush = function() {
	WorkerStack.push(this);
	!this._loaded && this._init();
	!this.settings.keep && !this.data && this._load('data');
	WorkerStack.pop();
};

Worker.prototype._unwatch = function(worker) {
	deleteElement(worker._watching,this);
};

Worker.prototype._update = function(type, worker) {
	if (this._loaded && (this.update || this._watching.length)) {
		WorkerStack.push(this);
		var i, flush = false;
		this._working.update = true;
		if (typeof this.data === 'undefined') {
			flush = true;
			this._unflush();
		}
		try {
			this.update && this.update(type, worker);
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.update(' + (type ? type : 'null') + ', ' + (worker ? worker.name : 'null') + '): ' + e.message);
		}
		if (!worker) {
			for (i=0; i<this._watching.length; i++) {
				this._watching[i]._update(type, this);
			}
		}
		flush && this._flush();
		this._working.update = false;
		WorkerStack.pop();
	}
};

Worker.prototype._watch = function(worker) {
	!findInArray(worker._watching,this) && worker._watching.push(this);
};

Worker.prototype._work = function(state) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};

/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true
};

Config.option = {
	display:'block',
	fixed:true,
	advanced:false,
	exploit:false
};

Config.init = function() {
	if (iscaap()) {
		return false;
	}
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i, j, k;
	$('div.UIStandardFrame_Content').after('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem v' + VERSION + (revision && revision !== '$WCREV$' ? 'r'+revision : '') + '<img id="golem_fixed"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="margin:0 4px;overflow:hidden;overflow-y:auto;"></div><div style="text-align:right;"><label>Advanced <input type="checkbox" id="golem-config-advanced"' + (Config.option.advanced ? ' checked' : '') + '></label></div></div></div></div>');
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	$('#golem_fixed').click(function(){
		Config.option.fixed ^= true;
		$(this).closest('.golem-config').toggleClass('golem-config-fixed');
		Config._save('option');
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config.sortable({axis:"y"}); //, items:'div', handle:'h3' - broken inside GM
	$('.golem-config .golem-panel > h3').click(function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){
				$(this).parent().toggleClass('golem-panel-show');
				Config.option.active = [];
				$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
				Config._save('option');
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Config._save('option');
		}
	});
	$golem_config.children('.golem-panel-sortable')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			var i, order = Config.getOrder(), me = WorkerByName($(ui.draggable).attr('name')), newplace = arrayIndexOf(order, $(this).attr('name'));
			if (arrayIndexOf(order, 'Idle') >= newplace) {
				if (me.settings.before) {
					for(i=0; i<me.settings.before.length; i++) {
						if (arrayIndexOf(order, me.settings.before[i]) <= newplace) {
							return;
						}
					}
				}
				if (me.settings.after) {
					for(i=0; i<me.settings.after.length; i++) {
						if (arrayIndexOf(order, me.settings.after[i]) >= newplace) {
							return;
						}
					}
				}
			}
			if (newplace < arrayIndexOf(order, $(ui.draggable).attr('name'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = WorkerByName(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = unique(k.settings.after);
//					debug('Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = WorkerByName(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = unique(k.settings.before);
//					debug('Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
		var args = meta[3].toLowerCase().split(',');
		if ($(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim()) {
			return true;
		}
		return false;
	};
	$('input.golem_addselect').live('click', function(){
		var i, value, values = $('.golem_select', $(this).parent()).val().split(',');
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$('select.golem_multiple', $(this).parent()).append('<option>' + value + '</option>');
			}
		}
		Config.updateOptions();
	});
	$('input.golem_delselect').live('click', function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input,textarea,select', $golem_config).change( function(){
		Config.updateOptions();
	});
	$('#golem-config-advanced').click(function(){
		Config.updateOptions();
		$('.golem-advanced').css('display', Config.option.advanced ? '' : 'none');}
	);
};

Config.makePanel = function(worker) {
	var i, o, x, id, step, show, $head, $panel, display = worker.display, panel = [], txt = [], list = [], options = {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	};
	if (!display) {
		return false;
	}
	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	show = findInArray(this.option.active, worker.id);
	$head = $('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (show?' golem-panel-show':'') + (worker.settings.advanced ? ' golem-advanced' : '') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header "><img class="golem-icon" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82">' + worker.name + '<img class="golem-lock" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82"></h3></div>');
	switch (typeof display) {
		case 'array':
		case 'object':
			for (i in display) {
				txt = [];
				list = [];
				o = $.extend(true, {}, options, display[i]);
				o.real_id = PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + o.id;
				o.value = worker.get('option.'+o.id) || null;
				o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
				if (o.hr) {
					txt.push('<br><hr style="clear:both;margin:0;">');
				}
				if (o.title) {
					txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
				}
				if (o.label) {
					txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
					if (o.text || o.checkbox || o.select) {
						txt.push('<span style="float:right;">');
					} else if (o.multiple) {
						txt.push('<br>');
					}
				}
				if (o.before) {
					txt.push(o.before+' ');
				}
				// our different types of input elements
				if (o.info) { // only useful for externally changed
					if (o.id) {
						txt.push('<span style="float:right" id="' + o.real_id + '">' + (o.value || o.info) + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
								o.select = this.data[o.select];
							} else {
								break; // deliberate fallthrough
							}
						case 'array':
						case 'object':
							if (isArray(o.select)) {
								for (x=0; x<o.select.length; x++) {
									list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							} else {
								for (x in o.select) {
									list.push('<option value="' + x + '"' + (o.value==x ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							}
							break;
					}
					txt.push('<select id="' + o.real_id + '"' + o.className + o.alt + '>' + list.join('') + '</select>');
				} else if (o.multiple) {
					if (typeof o.value === 'array' || typeof o.value === 'object') {
						for (i in o.value) {
							list.push('<option value="'+o.value[i]+'">'+o.value[i]+'</option>');
						}
					}
					txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					if (typeof o.multiple === 'string') {
						txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
					} else {
						list = [];
						switch (typeof o.multiple) {
							case 'number':
								step = Divisor(o.select);
								for (x=0; x<=o.multiple; x+=step) {
									list.push('<option>' + x + '</option>');
								}
								break;
							case 'array':
							case 'object':
								if (isArray(o.multiple)) {
									for (x=0; x<o.multiple.length; x++) {
										list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
									}
								} else {
									for (x in o.multiple) {
										list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
									}
								}
								break;
						}
						txt.push('<select class="golem_select">'+list.join('')+'</select>');
					}
					txt.push('<input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
				}
				if (o.after) {
					txt.push(' '+o.after);
				}
				if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
					txt.push('</span>');
				}
				panel.push('<div' + (o.advanced  ? ' class="golem-advanced"' : '') + (o.advanced || o.exploit ? ' style="' + ((o.advanced && !this.option.advanced) || (o.exploit && !this.option.exploit) ? 'display:none;' : '') + (o.exploit ? 'border:1px solid red;background:#ffeeee;' : '') + '"' : '') + (o.help ? ' title="' + o.help + '"' : '') + '>' + txt.join('') + '<br></div>');
			}
			$head.append('<div class="golem-panel-content" style="font-size:smaller;">' + panel.join('') + '</div>');
			return $head;
//		case 'function':
//			$panel = display();
//			if ($panel) {
//				$head.append($panel);
//				return $head;
//			}
//			return null;
		default:
			return null;
	}
};

Config.set = function(key, value) {
	if (iscaap()) {
		return false;
	}
	this._unflush();
	if (!this.data[key] || JSON.stringify(this.data[key]) !== JSON.stringify(value)) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(i,el){
			var worker = WorkerById($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null, list = Config.data[key], options = [];
			if (isArray(list)) {
				for (i=0; i<list.length; i++) {
					options.push('<option value="' + list[i] + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			} else {
				for (i in list) {
					options.push('<option value="' + i + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			}
			$(el).html(options.join('')).val(val);
		});
		this._save();
		return true;
	}
	return false;
};

Config.updateOptions = function() {
//	debug('Options changed');
	// Get order of panels first
	Queue.option.queue = this.getOrder();
	// Now can we see the advanced stuff
	this.option.advanced = $('#golem-config-advanced').attr('checked');
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				val = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^0-9.]/) === -1) {
					val = parseFloat(val);
				}
			}
			try {
				WorkerByName(tmp[0]).set('option.'+tmp[1], val);
			} catch(e) {
				debug(e.name + ' in Config.updateOptions(): ' + $(el).attr('id') + '(' + JSON.stringify(tmp) + ') = ' + e.message);
			}
		}
	});
	for (i=0; i<Workers.length; i++) {
		Workers[i]._save('option');
	}
};

Config.getOrder = function() {
	var order = [];
	$('#golem_config > div').each(function(i,el){
		order.push($(el).attr('name'));
	});
	return unique(order);
};

/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');

Dashboard.settings = {
	keep:true
};

Dashboard.defaults = {
	castle_age:{
		pages:'*'
	}
};

Dashboard.option = {
	display:'block',
	active:null
};

Dashboard.init = function() {
	var id, $btn, tabs = [], divs = [], active = this.option.active;
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+Workers[i].name;
			if (!active) {
				this.option.active = active = id;
			}
			tabs.push('<h3 name="'+id+'" class="golem-tab-header' + (active===id ? ' golem-tab-header-active' : '') + '">' + (Workers[i] === this ? '&nbsp;*&nbsp;' : Workers[i].name) + '</h3>');
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
			this._watch(Workers[i]);
		}
	}
	if (iscaap()) {
		return false;
	}
	$('<div id="golem-dashboard" style="top:' + $('#app'+APPID+'_main_bn').offset().top+'px;display:' + this.option.display+';">' + tabs.join('') + '<div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('.golem-tab-header').click(function(){
		if ($(this).hasClass('golem-tab-header-active')) {
			return;
		}
		if (Dashboard.option.active) {
			$('h3[name="'+Dashboard.option.active+'"]').removeClass('golem-tab-header-active');
			$('#'+Dashboard.option.active).hide();
		}
		Dashboard.option.active = $(this).attr('name');
		$(this).addClass('golem-tab-header-active');
		Dashboard.update();
		$('#'+Dashboard.option.active).show();
		Dashboard._save('option');
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var worker = WorkerByName(Dashboard.option.active.substr(16));
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});

	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_toggle_dash" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%1EPLTE%BA%BA%BA%EF%EF%EF%E5%E5%E5%D4%D4%D4%D9%D9%D9%E3%E3%E3%F8%F8%F8%40%40%40%FF%FF%FF%00%00%00%83%AA%DF%CF%00%00%00%0AtRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%00%B2%CC%2C%CF%00%00%00EIDATx%DA%9C%8FA%0A%00%20%08%04%B5%CC%AD%FF%7F%B8%0D%CC%20%E8%D20%A7AX%94q!%7FA%10H%04%F4%00%19*j%07Np%9E%3B%C9%A0%0C%BA%DC%A1%91B3%98%85%AF%D9%E1%5C%A1%FE%F9%CB%14%60%00D%1D%07%E7%0AN(%89%00%00%00%00IEND%AEB%60%82">');
	$('#golem_toggle_dash').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		if (Dashboard.option.display === 'block' && !$('#'+Dashboard.option.active).children().length) {
			WorkerByName(Dashboard.option.active.substr(16)).dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	window.setInterval(function(){
		$('.golem-timer').each(function(i,el){
			var time = $(el).text().parseTimer();
			if (time && time > 0) {
				$(el).text(makeTimer($(el).text().parseTimer() - 1));
			} else {
				$(el).removeClass('golem-timer').text('now?');
			}
		});
		$('.golem-time').each(function(i,el){
			var time = parseInt($(el).attr('name')) - Date.now();
			if (time && time > 0) {
				$(el).text(makeTimer(time / 1000));
			} else {
				$(el).removeClass('golem-time').text('now?');
			}
		});
	},1000);
};

Dashboard.parse = function(change) {
	if (iscaap()) {
		return false;
	}
	$('#golem-dashboard').css('top', $('#app'+APPID+'_main_bn').offset().top+'px');
};

Dashboard.update = function(type, worker) {
	if (!this._loaded || !worker) { // we only care about updating the dashboard when something we're *watching* changes (including ourselves)
		return;
	}
	worker = WorkerByName(Dashboard.option.active.substr(16));
	var id = 'golem-dashboard-'+worker.name;
	if (this.option.active === id && this.option.display === 'block') {
		try {
			worker._unflush();
			worker.dashboard();
		}catch(e) {
			debug(e.name + ' in ' + worker.name + '.dashboard(): ' + e.message);
		}
	} else {
		$('#'+id).empty();
	}
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (this.data[Workers[i].name]) {
			list.push('<tr><th>' + Workers[i].name + ':</th><td id="golem-status-' + Workers[i].name + '">' + this.data[Workers[i].name] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, html) {
	if (html) {
		this.data[worker.name] = html;
	} else {
		delete this.data[worker.name];
	}
	this._save();
};

/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	unsortable:true,
	keep:true
};

Page.option = {
	timeout: 15,
	retry: 5
};

Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.checking = true;
Page.node_trigger = null;
Page.loading = false;

Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	}
];

Page.defaults = {
	'castle_age':{
		pageNames:{
			index:					{url:'index.php', selector:'#app'+APPID+'_indexNewFeaturesBox'},
			quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
			quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
			quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
			quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
			quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
			quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
			quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
			quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
			quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif'},
			quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
			quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
			battle_battle:			{url:'battle.php', image:'battle_on.gif'},
			battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
			battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
			battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
			battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
			heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
			heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
			town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
			town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
			town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
			town_land:				{url:'land.php', image:'tab_land_on.gif'},
			oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
			oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
			oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
			oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
			oracle_treasureonslaught:{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif'},
			keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
			keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
			keep_monster_active2:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
			keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
			army_invite:			{url:'army.php', image:'invite_on.gif'},
			army_gifts:				{url:'gift.php', selector:'#app'+APPID+'_giftContainer'},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#app'+APPID+'_army_feed_header'},
			apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
		}
	}
};

Page.init = function() {
	// Only perform the check on the two id's referenced in get_cached_ajax()
	// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
	$('body').bind('DOMNodeInserted', function(event){
		if (!Page.node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all();},100);
		}
	});
};

Page.parse_all = function() {
	WorkerStack.push(this);
	Page.identify();
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].parse && Workers[i].pages && (Workers[i].pages.indexOf('*')>=0 || (Page.page !== '' && Workers[i].pages.indexOf(Page.page) >= 0))) {
			Workers[i]._unflush();
			if (Workers[i]._parse(false)) {
				list.push(Workers[i]);
			}
		}
	}
	for (i in list) {
		list[i]._parse(true);
	}
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};

Page.work = function(state) {
	if (!this.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (Workers[i].pages) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && this.pageNames[list[l]] && !this.data[list[l]] && list[l].indexOf('_active') === -1) {
					found = list[l];
					break;
				}
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		this.checking = false;
		return false;
	}
	if (found && !this.to(found)) {
		this.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};

Page.identify = function() {
	this.page = '';
	if (!$('#app_content_'+APPID).length) {
		this.reload();
		return null;
	}
	var app_body = $('#app'+APPID+'_app_body'), p;
	$('img', app_body).each(function(i,el){
		var filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (Page.pageNames[p].image && filename === Page.pageNames[p].image) {
				Page.page = p;
				return;
			}
		}
	});
	if (!this.page) {
		for (p in Page.pageNames) {
			if (Page.pageNames[p].selector && $(Page.pageNames[p].selector).length) {
				Page.page = p;
			}
		}
	}
	if (this.page !== '') {
		this.data[this.page] = Date.now();
	}
	//debug('this.identify("'+Page.page+'")');
	return this.page;
};

Page.to = function(page, args, force) {
	if (Queue.option.pause) {
		debug('Trying to load page when paused...');
		return true;
	}
	if (page === this.page && (force || typeof args === 'undefined')) {
		return true;
	}
//	WorkerStack.push(this);
	if (!args) {
		args = '';
	}
	if (page && this.pageNames[page] && this.pageNames[page].url) {
		this.clear();
		this.last = this.pageNames[page].url;
		this.when = Date.now();
		if (args.indexOf('?') === 0 && this.last.indexOf('?') > 0) {
			this.last = this.last.substr(0, this.last.indexOf('?')) + args;
		} else {
			this.last = this.last + args;
		}
		debug('Navigating to ' + page + ' (' + (force ? 'FORCE: ' : '') + this.last + ')');
		if (force) {
//			this.loading=true;
			window.location.href = this.last;
		} else {
			this.ajaxload();
		}               
	}
//	WorkerStack.pop();
	return false;
};

Page.ajaxload = function() {
	$.ajax({
		cache:false,
		dataType:'text',
		timeout:this.option.timeout * 1000,
		url:'http://apps.facebook.com/castle_age/'+this.last,
		error:function() {
			debug('Page not loaded correctly, reloading.');
			Page.ajaxload();
		},
		success:function(data){
		if (data.indexOf('app'+APPID+'_results_container') !== -1 && data.indexOf('</html>') !== -1 && data.indexOf('single_popup') !== -1 && data.indexOf('app'+APPID+'_index') !== -1) { // Last things in source if loaded correctly...
				Page.loading = false;
				data = data.substring(data.indexOf('<div id="app'+APPID+'_globalContainer"'), data.indexOf('<div class="UIStandardFrame_SidebarAds"'));
				$('#app'+APPID+'_AjaxLoadIcon').css('display', 'none');
				$('#app'+APPID+'_globalContainer').empty().append(data);
			} else {
				debug('Page not loaded correctly, reloading.');
				Page.ajaxload();
			}
		}
	});
	this.loading = true;
	setTimeout(function() { if (Page.loading) {$('#app'+APPID+'_AjaxLoadIcon').css('display', 'block');} }, 1500);
};

Page.reload = function() {
	debug('Page.reload()');
	window.location.href = window.location.href;
};

Page.click = function(el) {
	if (!$(el).length) {
		log('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	isGreasemonkey ? $(el).get(0).wrappedJSObject.dispatchEvent(e) : $(el).get(0).dispatchEvent(e);
	this.clear();
	this.lastclick = el;
	this.when = Date.now();
	return true;
};

Page.clear = function() {
	this.last = this.lastclick = this.when = null;
	this.retry = 0;
};

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

Queue.settings = {
	system:true,
	unsortable:true,
	keep:true
};

Queue.runtime = {
	reminder:{},
	current:null
};

Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ['Page', 'Queue', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Idle'],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0,
	pause: false
};

Queue.display = [
	{
		label:'Drag the unlocked panels into the order you wish them run.'
	},{
		id:'delay',
		label:'Delay Between Events',
		text:true,
		after:'secs',
		size:3
	},{
		id:'clickdelay',
		label:'Delay After Mouse Click',
		text:true,
		after:'secs',
		size:3,
		help:'This should be a multiple of Event Delay'
	},{
		id:'start_stamina',
		before:'Save',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'stamina',
		before:'Always Keep',
		select:'stamina',
		after:'Stamina'
	},{
		id:'start_energy',
		before:'Save',
		select:'energy',
		after:'Energy Before Using'
	},{
		id:'energy',
		before:'Always Keep',
		select:'energy',
		after:'Energy'
	}
];

Queue.runfirst = [];
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.timer = null;

Queue.lasttimer = 0;
Queue.lastpause = false;

Queue.init = function() {
	if (iscaap()) {
		return false;
	}
	var i, worker, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {// Add any new workers that have a display (ie, sortable)
		if (Workers[i].work && Workers[i].display && !findInArray(this.option.queue, Workers[i].name)) {
			log('Adding '+Workers[i].name+' to Queue');
			if (Workers[i].settings.unsortable) {
				this.option.queue.unshift(Workers[i].name);
			} else {
				this.option.queue.push(Workers[i].name);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = WorkerByName(this.option.queue[i]);
		if (worker && worker.id) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				debug('Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	Queue.lastpause = this.option.pause;
	$btn = $('<img class="golem-button' + (this.option.pause?' red':'') + '" id="golem_pause" src="' + (this.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		debug('State: '+((Queue.option.pause)?"paused":"running"));
		$(this).toggleClass('red').attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.update = function(type) {
	if (iscaap()) {
		return false;
	}
	if (!this.option.pause && this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	} else if (this.option.pause && this.option.pause !== this.lastpause) {
		window.clearInterval(this.timer);
		this.lasttimer = -1;
	}
	this.lastpause = this.option.pause;
};

Queue.run = function() {
	var i, worker, current, result, now = Date.now(), next = null, release = false;
	if (this.option.pause || now - this.lastclick < this.option.clickdelay * 1000) {
		return;
	}
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
	WorkerStack.push(this);
//	debug('Start Queue');
	this.burn.stamina = this.burn.energy = 0;
	if (this.option.burn_stamina || Player.get('stamina') >= this.option.start_stamina) {
		this.burn.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
		this.option.burn_stamina = this.burn.stamina > 0;
	}
	if (this.option.burn_energy || Player.get('energy') >= this.option.start_energy) {
		this.burn.energy = Math.max(0, Player.get('energy') - this.option.energy);
		this.option.burn_energy = this.burn.energy > 0;
	}
	// We don't want to stay at max any longer than we have to because it is wasteful.  Burn a bit to start the countdown timer.
/*	if (Player.get('energy') >= Player.get('maxenergy')){
		this.burn.stamina = 0;	// Focus on burning energy
		debug('At max energy, burning energy first.');
	} else if (Player.get('stamina') >= Player.get('maxstamina')){
		this.burn.energy = 0;	// Focus on burning stamina
		debug('At max stamina, burning stamina first.');
	}
*/	
	for (i=0; i<Workers.length; i++) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
//			debug(Workers[i].name + '.work(false);');
			Workers[i]._unflush();
			Workers[i]._work(false);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = WorkerByName(this.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
		if (this.runtime.current === worker.name) {
			worker._unflush();
			result = worker._work(true);
			if (typeof result !== 'boolean') {// QUEUE_* are all numbers
				worker.settings.stateful = true;
			}
			if (result === QUEUE_RELEASE) {
				release = true;
			} else if (!result) {// false or QUEUE_FINISH
				this.runtime.current = null;
				worker.id && $('#'+worker.id+' > h3').css('font-weight', 'normal');
				debug('End '+worker.name);
			}
		} else {
			result = worker._work(false);
		}
		if (!next && result) {
			next = worker; // the worker who wants to take over
		}
	}
	current = this.runtime.current ? WorkerByName(this.runtime.current) : null;
	if (next !== current && (!current || !current.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
		if (current) {
			debug('Interrupt ' + current.name + ' with ' + next.name);
			current.id && $('#'+current.id+' > h3').css('font-weight', 'normal');
		} else {
			debug('Trigger ' + next.name);
		}
		this.runtime.current = next.name;
		next.id && $('#'+next.id+' > h3').css('font-weight', 'bold');
	}
//	debug('End Queue');
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};

/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Settings.option = {
	action:'None',
	which:'- default -',
	name:'- default -',
	confirm:false
};

Settings.display = [
	{
		title:'IMPORTANT!',
		label:'This will backup and restore your current options.<br>There is no confirmation dialog!'
	},{
		id:'action',
		label:'Action (<b>Immediate!!</b>)',
		select:['None', 'Load', 'Save', 'Delete']
	},{
		id:'which',
		label:'Which',
		select:'settings'
	},{
		id:'name',
		label:'New Name',
		text:true
	}
];

Settings.oldwhich = null;

Settings.init = function() {
	if (!this.data['- default -']) {
		this.set('- default -');
	}
	Settings.oldwhich = this.option.which;
};

Settings.update = function(type) {
	if (type === 'option') {
		var i, list = [];
		if (this.oldwhich !== this.option.which) {
			$('input:golem(settings,name)').val(this.option.which);
			this.option.name = this.option.which;
			this.oldwhich = this.option.which;
		}
		switch (this.option.action) {
			default:
			case 'None':
				break;
			case 'Load':
				debug('Loading ' + this.option.which);
				this.get(this.option.which);
				break;
			case 'Save':
				debug('Saving ' + this.option.name);
				this.set(this.option.name);
				this.option.which = this.option.name;
				break;
			case 'Delete':
				if (this.option.which !== '- default -') {
					delete this.data[this.option.which];
				}
				this.option.which = '- default -';
				this.option.name = '- default -';
				break;
		}
		$('select:golem(settings,action)').val('None');
		this.option.action = 'None';
		for (i in this.data) {
			list.push(i);
		}
		Config.set('settings', list.sort());
	}
};

Settings.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._set(what, value);
	}
	this._unflush();
	this.data[what] = {};
	for (var i in Workers) {
		if (Workers[i] !== this && Workers[i].option) {
			this.data[what][Workers[i].name] = $.extend(true, {}, Workers[i].option);
		}
	}
};

Settings.get = function(what) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._get(what);
	}
	this._unflush();
	if (this.data[what]) {
		for (var i in Workers) {
			if (Workers[i] !== this && Workers[i].option && this.data[what][Workers[i].name]) {
				Workers[i].option = $.extend(true, {}, this.data[what][Workers[i].name]);
				Workers[i]._save('option');
			}
		}
		Page.reload();
	}
	return;
};

/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	force:false,// Have we clicked a button, or is it an automatic check
	last:0,
	revision:0,
	beta:0,
	found:false// Have we found a new version
};

/***** Update.init() *****
1. Add a "Update Now" button to the button bar at the top of Config
1a. On clicking the button check if we've already found an update
1b. If an update was found then get GM to install it
1c. If no update was found then set the lastcheck to 0 to force the next check to come in 5 seconds
2. Add an (Advanced) "WIP" button to the button bar at the top of Config
2a. On clicking the button offer to install the latest WIP version
*/
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){if (Update.get('runtime.found')){window.location.href = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';} else {Update.set('runtime.force', true);Update.set('runtime.lastcheck', 0);}});
	$('#golem_buttons').append($btn);
	$btn = $('<img class="golem-button golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' name="Beta Update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%FF%FF%FFiii%92%95*%C3%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%2FIDATx%DAb%60%C0%00%8CP%8CO%80%91%90%00%08%80H%14%25h%C60%10%2B%80l%0E%98%C3%88%AE%0ES%80%91%91T%8B%C0%00%20%C0%00%17G%00(%A6%C6G%AA%00%00%00%00IEND%AEB%60%82">').click(function(){
		$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>This will update to the latest Work-In-Progress version of Castle Age Golem.<br><br>Are you sure you wish to run a potentially buggy update?<br><br>You must reload the page after installing to use the new version.</div>');
		$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close").remove();window.location.href='http://game-golem.googlecode.com/svn/trunk/_normal.user.js';}, "Skip":function(){$(this).dialog("close").remove();}} });
	});
	$('#golem_buttons').append($btn);
};

/***** Update.work() *****
1a. Check that we've not already found an update
1b. Check that it's been more than 6 hours since the last update
2a. Use AJAX to get the google trunk source webpage (list of files and revisions)
2b. Parse out the revision string for both release and beta

5. Compare with our own version
6. Remember it if we have an update
7. Notify the user -
7a. Change the update button image
7b. Show a requester to the user asking if they'd like to update
*/
Update.work = function(state) {
	if (!this.runtime.found && Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now();
		/*
		debug('Checking trunk revisions');
		GM_xmlhttpRequest({ // Cross-site ajax, only via GreaseMonkey currently...
			method: "GET",
			url: 'http://code.google.com/p/game-golem/source/browse/#svn/trunk',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var release = evt.responseText.regex(/"_release.user.js":\["[^"]*","([0-9]+)"/i), beta = evt.responseText.regex(/"_normal.user.js":\["[^"]*","([0-9]+)"/i);
					debug('Version: '+release+', Beta: '+beta);
				}
			}
		});
		*/
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var remoteVersion = evt.responseText.regex(/@version[^0-9.]+([0-9.]+)/i);
					if (Update.get('runtime.force')) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.set('runtime.found', true);
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (Update.get('runtime.force')) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://game-golem.googlecode.com/svn/trunk/_release.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						log('New version available: '+remoteVersion);
					} else if (Update.get('runtime.force')) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
					Update.set('runtime.force', false);
				}
			}
		});
	}
};

/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');

Alchemy.defaults = {
	castle_age:{
		pages:'keep_alchemy'
	}
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:true,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null
};

Alchemy.display = [
	{
		id:'perform',
		label:'Automatically Perform',
		checkbox:true
	},{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	},{
		id:'summon',
		label:'Use Summon Ingredients',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	var ingredients = this.data.ingredients = {}, recipe = this.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {
			title = title.substr(0, title.indexOf(' ('));
		}
		if ($(el).hasClass('alchemyQuestBack')) {
			me.type = 'Quest';
		} else if ($(el).hasClass('alchemyRecipeBack')) {
			me.type = 'Recipe';
		} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
			me.type = 'Summons';
		}
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;
	});
};

Alchemy.update = function() {
	var best = null, recipe = this.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Summons') {
			for (i in recipe[r].ingredients) {
				this.data.summons[i] = true;
			}
		}
	}
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			best = r;
			for (i in recipe[r].ingredients) {
				if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > (this.data.ingredients[i] || 0)) {
					best = null;
					break;
				}
			}
			if (best) {break;}
		}
	}
	this.runtime.best = best;
};

Alchemy.work = function(state) {
	if (!this.option.perform || !this.runtime.best) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	}
	debug('Perform - ' + this.runtime.best);
	if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
		Page.reload(); // Can't find the recipe we just parsed when coming here...
	}
	return QUEUE_RELEASE;
};

/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.settings = {
	after:['Land','Town']
};

Bank.defaults = {
	castle_age:{}
};

Bank.option = {
	general: true,
	above: 10000,
	hand: 0,
	keep: 10000
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	}
];

Bank.work = function(state) {
	if (iscaap() && this.option.above === '') {
		return QUEUE_FINISH;
	}
	if (Player.get('cash') <= 10 || Player.get('cash') <= this.option.above) {
		return QUEUE_FINISH;
	} else if (!state || this.stash(Player.get('cash') - this.option.hand)) {
		return QUEUE_CONTINUE;
	}
	return QUEUE_RELEASE;
};

Bank.stash = function(amount) {
	if (!amount || !Player.get('cash') || Math.min(Player.get('cash'),amount) <= 10) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.get('cash'), amount));
	Page.click('input[value="Stash"]');
	return true;
};

Bank.retrieve = function(amount) {
	!iscaap() && (WorkerByName(Queue.get('runtime.current')).settings.bank = true);
	amount -= Player.get('cash');
	if (amount <= 0 || (Player.get('bank') - this.option.keep) < amount) {
		return true; // Got to deal with being poor exactly the same as having it in hand...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return false;
};

Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.get('cash') + Math.max(0,Player.get('bank') - this.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.defaults = {
	castle_age:{
		pages:'battle_rank battle_battle'
	}
};

Battle.data = {
	user: {},
	rank: {},
	points: {}
};

Battle.option = {
	general:true,
	points:true,
	monster:true,
	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[]
};

Battle.runtime = {
	attacking:null
};

Battle.symbol = { // Demi-Power symbols
	1:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%17%90%B3%1AIn%99%AD%B0%3F%5Erj%7F%8A4%40J%22*1%FF%FF%FFm%0F%82%CD%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%ABIDATx%DAl%91%0B%0E%04!%08CAh%E7%FE7%DE%02%BA3%FBib%A2O%A8%02vm%91%00xN%B6%A1%10%EB%86O%0C%22r%AD%0Cmn%0C%8A%8Drxa%60-%B3p%AF%8C%05%0C%06%15d%E6-%5D%90%8D%E5%90~%B0x%A20e%117%0E%D9P%18%A1%60w%F3%B0%1D%1E%18%1C%85m'D%B9%08%E7%C6%FE%0F%B7%CF%13%C77%1Eo%F4%93%05%AA%24%3D%D9%3F%E1%DB%25%8E%07%BB%CA%D8%9C%8E%FE6%A6J%B9%1F%FB%DAa%8A%BFNW3%B5%9ANc%D5%FEn%9El%F7%20%F6tt%8C%12%F01%B4%CE%F8%9D%E5%B7%5E%02%0C%00n%97%07%B1AU%81%B7%00%00%00%00IEND%AEB%60%82",
	2:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%E0%0D%0CZ%5B%5Bv%13%0F%2F%1A%16%7Byx%8941DB%3F%FF%FF%FFOmpc%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B4IDATx%DAT%D1%5B%12%C5%20%08%03P%08%C2%DD%FF%8Eo%12%EB%D8%F2%D1%C7%C1%01%C5%F8%3DQ%05T%9D%BFxP%C6%07%EA%CDF%07p%998%B9%14%C3%C4aj%AE%9CI%A5%B6%875zFL%0F%C8%CD%19vrG%AC%CD%5C%BC%C6nM%D57'%EB%CA%AD%EC%C2%E5b%B5%93%5B%E9%97%99%40D%CC%97sw%DB%FByqwF%83u%FA%F2%C8%A3%93u%A0%FD%8C%B8%BA%96NAn%90%17%C1%C7%E1'%D7%F2%85%01%D4%DC%A7d%16%EDM2%1A%C3%C5%1E%15%7DX%C7%23%19%EB%1El%F5h%B2lV%5B%CF%ED%A0w%89~%AE'%CE%ED%01%F7%CA%5E%FC%8D%BF%00%03%00%AA%CE%08%23%FB4h%C4%00%00%00%00IEND%AEB%60%82",
	3:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%B1%98g%DE%BCyqpq%8CnF%12%11%0EME7y8%0B%FF%FF%FF6%A1%E73%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B7IDATx%DA%5C%91Y%16C!%0CB%C9%40%BA%FF%1D%17%7Cz%9Em%BE%F4%8A%19%08%3E%3BX%40%F1%DC%B0%A1%99_xcT%EF(%BC8%D8%CC%9A%A9%D4!%0E%0E%8Bf%863%FE%16%0F%06%5BR%22%02%1C%A0%89%07w%E6T%AC%A8A%F6%C2%251_%9CPG%C2%A1r7N%CB%E1%1CtN%E7%06%86%7F%B85%8B%1A%22%2F%AC%3E%D4%B2_.%9C%C6%EA%B3%E2%C6%BB%24%CA%25uY%98%D5H%0D%EE%922%40b%19%09%CFNs%99%C8Y%E2XS%D2%F3*%0F7%B5%B9%B6%AA%16_%0E%9A%D61V%DCu-%E5%A2g%3BnO%C1%B3%1E%9C%EDiax%94%3F%F87%BE%02%0C%00%98%F2%07%E0%CE%8C%E4%B1%00%00%00%00IEND%AEB%60%82",
	4:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%90%CA%3CSTRq%9B5On*%10%13%0Dx%7Ct6B'%FF%FF%FFx%0A%94%CE%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B2IDATx%DAT%D1A%16%C4%20%08%03P%20%92%B9%FF%8D'%80%B5%96%85%AF~%95*%D8o%07%09%90%CF%CC6%96%F5%CA%CD%E0%DAA%BC%0CM%B3C%CBxX%9A%E9%15Z%18%B7QW%E2%DB%9B%3D%E0%CD%99%11%18V%3AM%02%CD%FA%08.%8A%B5%D95%B1%A0%A7%E9Ci%D0%9Cb3%034D%F8%CB(%EE%F8%F0%F1%FA%C5ae9%BB%FD%B0%A7%CF%F9%1Au%9FfR%DB%A3%A19%179%CFa%B1%8E%EB*%91%BE_%B9*M%A9S%B7%97%AE)%15%B5%3F%BAX%A9%0Aw%C9m%9A%A0%CA%AA%20%5Eu%E5%D5%1DL%23%D4%9Eu7%AD%DBvZv%F17%FE%02%0C%00%D3%0A%07%E1%0961%CF%00%00%00%00IEND%AEB%60%82",
	5:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%F2%F2%EF!!%20%A5%A5%A3vvv%5BZZ%3D%3D%3B%00%00%00%FF%FF%FF.%C4%F9%B3%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%BEIDATx%DA%5C%91Q%92%C30%08C%11B%DE%FB%DFx%25%C7n3%E5%23%E3%3Cd%01%A6%FEN%00%12p%FF%EA%40%A3%05%A7%F0%C6%C2%0A%CCW_%AC%B5%C4%1D9%5D%EC39%09'%B0y%A5%D8%E2H%5D%D53%DDH%E1%E05%A6%9A2'%9Bkcw%40%E9%C5e%5Ev%B6g%E4%B1)%DA%DF%EEQ%D3%A0%25Vw%EC%B9%D5)%C8%5Cob%9C%1E%E2%E2%D8%16%F1%94%F8%E0-%AF%B9%F8x%CB%F2%FE%C8g%1Eo%A03w%CA%86%13%DB%C4%1D%CA%7C%B7%E8w%E4d%FAL%E9%CE%9B%F3%F0%D0g%F8%F0%AD%CFSyD%DC%875%87%3B%B0%D1%5D%C4%D9N%5C%13%3A%EB%A9%F7.%F5%BB%CB%DF%F8%17%60%00%EF%2F%081%0F%2BNZ%00%00%00%00IEND%AEB%60%82"
};
Battle.demi = {
	1:'Ambrosia',
	2:'Malekus',
	3:'Corvintheus',
	4:'Aurora',
	5:'Azeron'
};

Battle.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
	},{
//		advanced:true,
//		id:'arena',
//		label:'Fight in Arena First',
//		checkbox:true,
//		help:'Only if the Arena is enabled!'
//	},{
		advanced:true,
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		id:'army',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		advanced:true,
		hr:true,
		title:'Preferred Targets'
	},{
		advanced:true,
		id:'preferonly',
		label:'Fight Preferred',
		select:['Never', 'Sometimes', 'Only', 'Until Dead']
	},{
		advanced:true,
		id:'prefer',
		multiple:'userid'
	}
];

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
//	this._watch(Arena);
	this._watch(Monster);
	this.option.arena = false;// ARENA!!!!!!
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid, tmp;
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.rank = data;
		this.data.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with ([0-9]+) Battle Points/i);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/This trainee is too weak. Challenge someone closer to your level/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				this.data.bp = $('span.result_body:contains("Battle Points.")').text().replace(/,/g, '').regex(/total of ([0-9]+) Battle Points/i);
				data[uid].win = (data[uid].win || 0) + 1;
				History.add('battle+win',1);
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
				History.add('battle+loss',-1);
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app'+APPID+'_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
		$('#app'+APPID+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Battle.rank(info[1]);
			if ((Battle.option.bp === 'Always' && Player.get('rank') - rank > 5) || (!Battle.option.bp === 'Never' && Player.get('rank') - rank <= 5)) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
	}
	return false;
};

/***** Battle.update() *****
1. Delete targets who are now too high or too low in rank
2. If our target cache is longer than the user-set limit then prune it
2a. Add every target to an array
2b. Sort the array using weighted values - we want to keep people we win against etc
2c. While the list is too long, delete the extra entries
3. Check if we need to get Battle Points (points.length will be 0 if we don't)
4. Choose our next target
4a. If we don't want points and we want to fight in the arena, then skip
4b. If we don't want points and we want to fight monsters, then skip
4c. Loop through all preferred targets, and add them 10 times
4d. If we need to, now loop through all in target cache and add 1-5 times (more times for higher rank)
4e. Choose a random entry from our list (targets with more entries have more chance of being picked)
5. Update the Status line
*/
Battle.update = function(type) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army'), level = Player.get('level'), rank = Player.get('rank'), count = 0;

	status.push('Rank ' + Player.get('rank') + ' ' + (Player.get('rank') && this.data.rank[Player.get('rank')].name) + ' with ' + addCommas(this.data.bp || 0) + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	status.push('Demi Points Earned Today: '
	+ '<img src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'" style="width:11px;height:11px;"> ' + (this.data.points[0] || 0) + '/10 '
	+ '<img src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'" style="width:11px;height:11px;"> ' + (this.data.points[1] || 0) + '/10 '
	+ '<img src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'" style="width:11px;height:11px;"> ' + (this.data.points[2] || 0) + '/10 '
	+ '<img src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'" style="width:11px;height:11px;"> ' + (this.data.points[3] || 0) + '/10 '
	+ '<img src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'" style="width:11px;height:11px;"> ' + (this.data.points[4] || 0) + '/10');

	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && rank - (data[i].rank || 0) >= 4) || (!this.option.bp === 'Never' && rank - (data[i].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		debug('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Battle.option.bp === 'Always') { weight += ((data[b].rank || 0) - (data[a].rank || 0)) / 2; }
			if (Battle.option.bp === 'Never') { weight += ((data[a].rank || 0) - (data[b].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Check if we need Demi-points
	points = (this.option.points && this.data.points && sum(this.data.points) < 50);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && this.option.monster && Monster.get('runtime.uid') && Monster.get('runtime.type')) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			this.runtime.attacking = null;
		}
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i)) {
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) > this.option.army)
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level)
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				for (j=Math.range(1,(data[i].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
					list.push(i);
				}
				count++;
			}
		}
		if (!this.runtime.attacking && list.length) {
			this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
		}
		if (this.runtime.attacking) {
			i = this.runtime.attacking;
			status.push('Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.data.rank[data[i].rank].name + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.runtime.attacking = null;
			status.push('No valid targets found');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
}

/***** Battle.work() *****
1. If we don't have a target, not enough health, or not enough stamina, return false
2. Otherwise
2a. Ask to work
2b. Get the correct General
2c. Go to the right page
3. Select our target
3a. Replace the first target on the page with the target we want to attack
3b. If we can't find any targets to replace / attack then force a reload
3c. Click the Invade / Dual attack button
*/
Battle.work = function(state) {
	if (!this.runtime.attacking || Player.get('health') < 13 || Queue.burn.stamina < 1) {
//		debug('Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health') + ' (must be >=10), Burn Stamina: ' + Queue.burn.stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || (this.option.general && !Generals.to(Generals.best(this.option.type))) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	var $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');
	if (!$form.length) {
		debug('Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		log('Battle: Attacking ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	for (var i in Battle.data.rank) {
		if (Battle.data.rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	for (i in data) {
		points[data[i].align]++;
	}
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	if (typeof sorttype[sort] === 'string') {
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.data.rank[Player.get('rank')].name + ' (' + Player.get('rank') + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'" style="width:11px;height:11px;"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, '<img src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">', 'title="' + this.demi[data.align] + '"');
		th(output, data.name, 'title="'+i+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.data.rank[data.rank] ? this.data.rank[data.rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, data.win || '');
		td(output, data.loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = null;

Blessing.defaults = {
	castle_age:{
		pages:'oracle_demipower'
	}
};

Blessing.option = {
	which:'Stamina',
        display: false
};

Blessing.runtime = {
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
	id:'which',
	label:'Which',
	select:Blessing.which
    },{
        id:'display',
        label:'Display in Blessing info on *',
        checkbox:true
    }
];

Blessing.init = function(){
	iscaap() && this.update();
};

Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			this.runtime.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.runtime.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};

Blessing.update = function(){
    var d, demi;
     if (this.option.display && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = 'Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = 'Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = 'Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = 'Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
		iscaap() && caap.SetDivContent('demibless_mess', 'Next Demi Blessing: ' + d.format('l g:i a'));
     } else {
         Dashboard.status(this);
		iscaap() && caap.SetDivContent('demibless_mess', 'Demi Blessing = none');
     }
};

Blessing.work = function(state) {
	if (!this.option.which || this.option.which === 'None' || Date.now() <= this.runtime.when) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('oracle_demipower')) {
		return QUEUE_CONTINUE;
	}
	Page.click('#app'+APPID+'_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return QUEUE_RELEASE;
};

/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy battle_arena');
Elite.data = {};

Elite.defaults = {
	castle_age:{
		pages:'keep_eliteguard army_viewarmy battle_arena'
	}
};

Elite.option = {
	elite:true,
	arena:false,
	every:24,
	prefer:[],
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0,
	waitarena:0,
	nextarena:0
};

Elite.display = [
	{
//		id:'arena',
//		label:'Fill Arena Guard',
//		checkbox:true
//	},{
		id:'elite',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		advanced:true,
		label:'Add UserIDs to prefer them over random army members. These <b>must</b> be in your army to be checked.',
		id:'prefer',
		multiple:'userid'
	}
];

Elite.init = function() { // Convert old elite guard list
	for(i in this.data) {
		if (typeof this.data[i] === 'number') {
			this.data[i] = {elite:this.data[i]};
		}
	}
	this.option.arena = false; // ARENA!!!!!!
};

Elite.parse = function(change) {
	$('span.result_body').each(function(i,el){
		if (Elite.runtime.nextarena) {
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Elite.data[Elite.runtime.nextarena].arena = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Elite.runtime.waitarena = Date.now();
				debug(this + 'Arena guard full, wait '+Elite.option.every+' hours');
			}
		}
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.runtime.waitelite = Date.now();
			debug('Elite guard full, wait '+Elite.option.every+' hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		var count = 0;
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().next();
			count++;
			Elite.data[uid] = Elite.data[uid] || {};
			Elite.data[uid].name = $('a', who).text();
			Elite.data[uid].level = $(who).text().regex(/([0-9]+) Commander/i);
		});
		if (count < 25) {
			this.runtime.armyextra = Player.get('armymax') - length(this.data) - 1;
		}
	}
	return false;
};

Elite.update = function() {
	var i, j, tmp = [], now = Date.now(), check;
	this.runtime.nextelite = this.runtime.nextarena = 0;
	for(j=0; j<this.option.prefer.length; j++) {
		i = this.option.prefer[j];
		if (!/[^0-9]/g.test(i) && this.data[i]) {
			if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
				this.runtime.nextelite = i;
			}
			if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
				this.runtime.nextarena = i;
			}
		}
	}
	for(i in this.data) {
		if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
			this.runtime.nextelite = i;
		}
		if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
			this.runtime.nextarena = i;
		}
	}
	if (this.option.elite || this.option.arena) {
		if (this.option.arena) {
			check = (this.runtime.waitarena + (this.option.every * 3600000));
			tmp.push('Arena Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		if (this.option.elite) {
			check = (this.runtime.waitelite + (this.option.every * 3600000));
			tmp.push('Elite Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		Dashboard.status(this, tmp.join(', '));
	} else {
		Dashboard.status(this);
	}
};

Elite.work = function(state) {
	var i, j, found = null;
	if (Math.ceil((Player.get('armymax') - this.runtime.armyextra - 1) / this.option.armyperpage) > this.runtime.armylastpage) {
		if (state) {
			debug('Filling army list');
			this.runtime.armylastpage = Math.max(this.runtime.armylastpage + 1, Math.ceil((length(this.data) + 1) / this.option.armyperpage));
			Page.to('army_viewarmy', '?page=' + this.runtime.armylastpage);
		}
		return true;
	}
	if ((!this.option.elite || !this.runtime.nextelite || (this.runtime.waitelite + (this.option.every * 3600000)) > Date.now()) && (!this.option.arena || !this.runtime.nextarena || (this.runtime.waitarena + (this.option.every * 3600000)) > Date.now())) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!this.runtime.nextelite && !this.runtime.nextarena && !length(this.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	if ((this.runtime.waitelite + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Elite Guard member '+this.runtime.nextelite);
		if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + this.runtime.nextelite)) {
			return true;
		}
	}
	if ((this.runtime.waitarena + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Arena Guard member '+this.runtime.nextarena);
		if (!Page.to('battle_arena', '?user=' + this.runtime.nextarena + '&lka=' + this.runtime.nextarena + '&agtw=1&ref=nf')) {
			return true;
		}
	}
	return false;
};

/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.option = null;
Generals.data = {};

Generals.defaults = {
	castle_age:{
		pages:'* heroes_generals'
	}
};

Generals.runtime = {
	disabled:false // Nobody should touch this except LevelUp!!!
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	this._watch(Town);
};

Generals.parse = function(change) {
	if ($('div.results').text().match(/has gained a level!/i)) {
		this.data[Player.get('general')].level++; // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = this.data;
		if ($elements.length < length(data)) {
			debug('Different number of generals, have '+$elements.length+', want '+length(data));
	//		Page.to('heroes_generals', ''); // Force reload
			return false;
		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level ([0-9]+)/i));
			var progress = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: ([0-9]*\.*[0-9]*)%/i));
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
				if (!data[name] || data[name].level !== level || data[name].progress !== progress) {
					data[name] = data[name] || {};
					data[name].img		= $('.imgButton', el).attr('src').filepart();
					data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
					data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
					data[name].progress	= progress;
					data[name].level	= level; // Might only be 4 so far, however...
					data[name].skills	= $('table div', el).html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
					if (level >= 4){	// If we just leveled up to level 4, remove the priority
						if (data[name].priority) {
							delete data[name].priority;
						}
					}
				}
			}
		});
	}
	return false;
};

Generals.update = function(type, worker) {
	var data = this.data, i, priority_list = [], list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (!type || type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		Config.set('generals', ['any'].concat(list.sort()));
	}
	
	// Take all existing priorities and change them to rank starting from 1 and keeping existing order.
	for (i in data) {
		if (data[i].level < 4) {
			priority_list.push([i, data[i].priority]);
		}
	}
	priority_list.sort(function(a,b) {
		return (a[1] - b[1]);
	});
	for (i in priority_list){
		data[priority_list[i][0]].priority = parseInt(i)+1;
	}
	this.runtime.max_priority = priority_list.length;
	// End Priority Stuff
	
	if ((type === 'data' || worker === Town) && invade && duel) {
		for (i in data) {
			attack_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Attack|Increase Player Attack by ([0-9]+)|Convert ([-+]?[0-9]*\.?[0-9]*) Attack/i)) + ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Attack for every Hero Owned/i) || 0) * (length(data)-1)));
			defense_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Defense|Increase Player Defense by ([0-9]+)/i))	+ ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Defense for every Hero Owned/i) || 0) * (length(data)-1)));
			attack = Player.get('attack') + attack_bonus;
			defend = Player.get('defense') + defense_bonus;
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = (data[i].skills.regex(/Increase Player Attack when Defending by ([-+]?[0-9]+)/i) || 0);
			def_when_att = (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0);
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = (data[i].skills.regex(/([-+]?[0-9]+) Monster attack/i) || 0);
			data[i].invade = {
				att: Math.floor(invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + data[i].def + (data[i].att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(duel.attack + data[i].att + attack + monster_att),
				def: Math.floor(duel.defend + data[i].def + defend) // Fortify, so no def_when_att
			};
			data[i].potential = {
				bank: (data[i].skills.regex(/Bank Fee/i) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (data[i].skills.regex(/Increase Income by ([0-9]+)/i) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (data[i].skills.regex(/Influence ([0-9]+)% Faster/i) || 0),
				drops: (data[i].skills.regex(/Chance ([0-9]+)% Drops/i) || 0),
				demi: (data[i].skills.regex(/Extra Demi Points/i) ? 1 : 0),
				cash: (data[i].skills.regex(/Bonus ([0-9]+) Gold/i) || 0)
			};
			data[i].potential.raid_invade = (data[i].potential.defense + data[i].potential.invade);
			data[i].potential.raid_duel = (data[i].potential.defense + data[i].potential.duel);
		}
	}
};

Generals.to = function(name) {
	if (this.runtime.disabled) {
		return true;
	}
	this._unflush();
	if (name && !this.data[name]) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name === 'any') {
		return true;
	}
	if (!name || !this.data[name]) {
		log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	debug('Changing to General '+name);
	Page.click('input[src$="' + this.data[name].img + '"]');
	this.data[name].used = (this.data[name].used || 0) + 1;
	return false;
};

Generals.best = function(type) {
	this._unflush();
	var rx = '', best = null, bestval = 0, i, value, list = [];
	if (iscaap()) {
		var caapGenerals = {
			'BuyGeneral':			'cost',
			'LevelUpGeneral':		'stamina',
			'IncomeGeneral':		'income',
			'SubQuestGeneral':		'influence',
			'MonsterGeneral':		'cash',
			'BankingGeneral':		'bank',
			'BattleGeneral':		'invade',
			'MonsterGeneral':		'monster',
			'FortifyGeneral':		'dispel',
			'IdleGeneral':			'defense'
		};
		//gm.log('which ' + type + ' lookup ' + caapGenerals[type]);
		if (caapGenerals[type]) {
			var caapGeneral = gm.getValue(type,'best');
			if (/under level 4/i.test(caapGeneral)) {
				type = 'under level 4';
			} else if (/use current/i.test(caapGeneral)) {
				return 'any';
			} else if (!/^best$/i.test(caapGeneral)) {
				return caapGeneral;
			} else {
				type = caapGenerals[type];
			}
		}
		// Need to add reverse lookup for when golem code calls something set in caap
	}
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'item':		rx = /([0-9]+)% Drops for Quest/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'cash':		rx = /Bonus ([0-9]+) Gold/i; break;
		case 'bank':		return 'Aeris';
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && (Generals.data[i].invade.att) > (Generals.data[best].invade.att))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && (Generals.data[i].duel.att) > (Generals.data[best].duel.att))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'monster':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.att > Generals.data[best].monster.att)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'dispel':
		case 'fortify':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.def > Generals.data[best].monster.def)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
/*			if (Generals.data[Player.get('general')] && Generals.data[Player.get('general')].level < 4) {
				return Player.get('general');
			}
			best = 0;
			for (i in Generals.data) {
				if (Generals.data[i].level < 4) {
					best = Math.max(best, (this.data[i].used || 0));
				}
			}
			for (i in Generals.data) {
				if ((Generals.data[i].used || 0) === best) {
					list.push(i);
				}
			}
			return list.length ? list[Math.floor(Math.random()*list.length)] : 'any';*/
			for (i in Generals.data){
				if (Generals.data[i].priority == 1){
					return i;
				}
			}
		default:
			return 'any';
	}
	for (i in Generals.data) {
		value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
//	if (best) {
//		debug('Best general found: '+best);
//	}
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		Generals.order = [];
		for (i in Generals.data) {
			Generals.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	if (typeof sort !== 'undefined') {
		Generals.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort == 1) {
				aa = a;
				bb = b;
			} else if (sort == 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else if (sort == 3) {
				aa = (Generals.data[a].priority || 999999);
				bb = (Generals.data[b].priority || 999999);
			} else {
				type = (sort<6 ? 'invade' : (sort<8 ? 'duel' : 'monster'));
				x = (sort%2 ? 'def' : 'att');
				aa = (Generals.data[a][type][x] || 0);
				bb = (Generals.data[b][type][x] || 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	for (i in Generals.data) {
		iatt = Math.max(iatt, Generals.data[i].invade ? Generals.data[i].invade.att : 1);
		idef = Math.max(idef, Generals.data[i].invade ? Generals.data[i].invade.def : 1);
		datt = Math.max(datt, Generals.data[i].duel ? Generals.data[i].duel.att : 1);
		ddef = Math.max(ddef, Generals.data[i].duel ? Generals.data[i].duel.def : 1);
		matt = Math.max(matt, Generals.data[i].monster ? Generals.data[i].monster.att : 1);
		mdef = Math.max(mdef, Generals.data[i].monster ? Generals.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push('<div'+(isNumber(Generals.data[i].progress) ? ' title="'+Generals.data[i].progress+'%"' : '')+'>'+Generals.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(Generals.data[i].progress || 0)+'%;"></div></div>');
		output.push(Generals.data[i].priority ? ((Generals.data[i].priority != 1 ? '<a class="golem-moveup" name='+Generals.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + Generals.data[i].priority + (Generals.data[i].priority != this.runtime.max_priority ? ' <a class="golem-movedown" name='+Generals.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt == Generals.data[i].monster.att ? '<strong>' : '') + addCommas(Generals.data[i].monster.att) + (matt == Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef == Generals.data[i].monster.def ? '<strong>' : '') + addCommas(Generals.data[i].monster.def) + (mdef == Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gup = i;
			}
			if (Generals.data[i].priority == (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gdown = i;
			}
			if (Generals.data[i].priority == (x+1)){
				gup = i;
			}
		}
		if (gdown && gup) {
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}

/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift');

Gift.settings = {
	keep:true
};

Gift.defaults = {
	castle_age:{
		pages:'* index army_invite army_gifts'
	}
};

Gift.data = {
	received: [],
	todo: {},
	gifts: {}
};

Gift.option = {
	type:'None'
};

Gift.runtime = {
	work:false,
	gift_waiting:false,
	gift_sent:0,
	sent_id:null,
	gift:{
		sender_id:null,
		sender_ca_name:null,
		sender_fb_name:null,
		name:null,
		id:null
	}
};

Gift.display = [
	{
		label:'Work in progress...'
	},{
		id:'type',
		label:'Return Gifts',
		select:['None', 'Random', 'Same as Received']
	}
];

Gift.init = function() {
	delete this.data.uid;
	delete this.data.lastgift;
	if (length(this.data.gifts)) {
		var gift_ids = [];
		for (var j in this.data.gifts) {
			gift_ids.push(j);
		}
		for (var i in this.data.todo) {
			if (!(/[^0-9]/g).test(i)) {	// If we have an old entry
				var random_gift_id = Math.floor(Math.random() * gift_ids.length);
				if (!this.data.todo[gift_ids[random_gift_id]]) {
					this.data.todo[gift_ids[random_gift_id]] = [];
				}
				this.data.todo[gift_ids[random_gift_id]].push(i);
				delete this.data.todo[i];
			}
		}
	}
};

Gift.parse = function(change) {
	if (change) {
		return false;
	}
	var gifts = this.data.gifts, todo = this.data.todo, received = this.data.received, sender_id;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		debug('Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			debug(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			debug(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.');
			this.runtime.gift_waiting = true;
			return true
		}
	} else if (Page.page === 'army_invite') {
		// Check for sent
//		debug('Checking for sent gifts.');
		if (this.runtime.sent_id && $('div.result').text().indexOf('request sent') >= 0) {
			debug(gifts[this.runtime.sent_id].name+' sent.');
			for (j=0; j < Math.min(todo[this.runtime.sent_id].length, 30); j++) {	// Remove the IDs from the list because we have sent them
				todo[this.runtime.sent_id].shift();
			}
			if (!todo[this.runtime.sent_id].length) {
				delete todo[this.runtime.sent_id];
			}
			this.runtime.sent_id = null;
			if (todo.length == 0) {
				this.runtime.work = false;
			}
		}
		
		// Accepted gift first
//		debug('Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.game').text().indexOf('accepted the gift') >= 0 || $('div.game').text().indexOf('have been awarded the gift') >= 0) { // and we have just accepted a gift
				debug('Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		debug('Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');
		if ($('div.messages').text().indexOf('gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			debug('Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				debug('Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				log("Can't find the gift sender's ID.");
			}
		} else {
//			debug('No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
		
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
//		debug('Parsing gifts.');
//		debug('Found: '+$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').length);
		this.data.gifts = {};
		gifts = this.data.gifts;
		$('div[id*="_giftContainer"] div[id*="_gift"]').each(function(i,el){
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!',''), slot = $(el).attr('id').regex(/_gift([0-9]+)/);
//			debug('Adding: '+name+'('+id+') to slot '+slot);
			gifts[id] = {};
			gifts[id].name = name;
			gifts[id].slot = slot;
		});
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			debug('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
		}
	}
	return false;
};

Gift.work = function(state) {
	if (length(todo) && (this.runtime.gift_delay < Date.now())) {
		this.runtime.work = true;
		return true;
	}
	if (!state) {
		if (this.runtime.gift_waiting || this.runtime.work) {	// We need to get our waiting gift or return gifts.
			return true;
		}
		return false;
	}
	if (!this.runtime.gift_waiting && !this.runtime.work) {
		return false;
	}
	if(this.runtime.gift_waiting && !this.runtime.gift.id) {	// We have a gift waiting, but we don't know the id.
		if (!Page.to('index')) {	// Get the gift id from the index page.
			return true;
		}
	}
	if(this.runtime.gift.id && !this.runtime.gift.sender_id) {	// We have a gift id, but no sender id.
		if (!Page.to('army_invite')) {	// Get the sender id from the army_invite page.
			return true;
		}
	}
	if (this.runtime.gift.sender_id) { // We have the sender id so we can receive the gift.
		if (!Page.to('army_invite')) {
			return true;
		}
//		debug('Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + this.runtime.gift.sender_id) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return true;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id;

	if (!received.length && (!length(todo) || (this.runtime.gift_delay > Date.now()))) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return false;
	}
	
	// We have received gifts so we need to figure out what to send back.
	if (received.length) {
		Page.to('army_gifts');
		// Fill out our todo list with gifts to send, or not.
		for (i in received){
			var temptype = this.option.type;
			if (typeof this.data.gifts[received[i].id] === 'undefined' && this.option.type != 'None') {
				debug(received[i].id+' was not found in our sendable gift list.');
				temptype = 'Random';
			}
			switch(temptype) {
				case 'Random':
					if (length(this.data.gifts)) {
						gift_ids = [];
						for (j in this.data.gifts) {
							gift_ids.push(j);
						}
						random_gift_id = Math.floor(Math.random() * gift_ids.length);
						debug('Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					debug('Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
					if (!todo[received[i].id]) {
						todo[received[i].id] = [];
					}
					todo[received[i].id].push(received[i].sender_id);
					this.runtime.work = true;
					break;
				case 'None':
				default:
					this.runtime.work = false;	// Since we aren't returning gifts, we don't need to do any more work.
					break;
			}
		}
		
		// Clear the facebook notifications and empty the received list.
		for (i in received) {
			// Go to the facebook page and click the "ignore" button for this entry
			
			// Then delete the entry from the received list.
			received.shift();
		}
		
	}
	
	if (this.runtime.gift_sent > Date.now()) {	// We have sent gift(s) and are waiting for the fb popup
//		debug('Waiting for FB popup.');
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")')) {
			debug('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
			Page.click('div.dialog_buttons input[name="ok"]');
		}
		return true;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	
	// Give some gifts back
	if (length(todo) && (!this.runtime.gift_delay || (this.runtime.gift_delay < Date.now()))) {
		for (i in todo) {
			if (!Page.to('army_gifts')){
				return true;
			}
			if (typeof this.data.gifts[i] === 'undefined') {  // Unknown gift in todo list
				gift_ids = [];
				for (j in this.data.gifts) {
					gift_ids.push(j);
				}
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				debug('Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.');
				if (!todo[gift_ids[random_gift_id]]) {
					todo[gift_ids[random_gift_id]] = [];
				}
				for (j in todo[i]) {
					todo[gift_ids[random_gift_id]].push(todo[i][j]);
				}
				delete todo[i];
				return true;
			}
			if ($('div[style*="giftpage_select"] div a[href*="giftSelection='+this.data.gifts[i].slot+'"]').length){
				if ($('img[src*="gift_invite_castle_on"]').length){
					if ($('div.unselected_list').children().length) {
						debug('Sending out ' + this.data.gifts[i].name);
						k = 0;
						for (j in todo[i]) {
							if (k< 30) {	// Need to limit to 30 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									debug('User '+todo[i][j]+' wasn\'t in the CA friend list.');
									continue;
								}
								Page.click('div.unselected_list input[value="' + todo[i][j] + '"]');
								k++;
							}
						}
						if (k == 0) {
						delete todo[i];
							return true;
						}
						this.runtime.sent_id = i;
						this.runtime.gift_sent = Date.now() + (60000);	// wait max 60 seconds for the popup.
						Page.click('input[name="send"]');
						return true;
					} else {
						return true;
					}
				} else if ($('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]').length) {
					Page.click('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]');
					return true;
				} else {
					return true;
				}
			} else if ($('div[style*="giftpage_select"]').length) {
				Page.click('a[href*="giftSelection='+this.data.gifts[i].slot+'"]:parent');
				return true;
			} else {
				return true;
			}
		}
	}
	
	return false;
};

/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = null;

Heal.defaults = {
	castle_age:{}
};

Heal.option = {
	stamina: 0,
	health: 0
};

Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];

Heal.work = function(state) {
	if (Player.get('health') >= Player.get('maxhealth') || Player.get('stamina') < Heal.option.stamina || Player.get('health') >= Heal.option.health) {
		return QUEUE_FINISH;
	}
	if (!state || this.me()) {
		return QUEUE_CONTINUE;
	}
	return QUEUE_RELEASE;
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	debug('Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};

/********** Worker.History **********
* History of anything we want.
* Dashboard is exp, income and bank.
*
* History.set('key', value); - sets the current hour's value
* History.set([hour, 'key'], value); - sets the specified hour's value
* History.add('key', value); - adds to the current hour's value (use negative value to subtract)
* History.add([hour, 'key'], value); - adds to the specified hour's value (use negative value to subtract)
*
* History.get('key') - gets current hour's value
* History.get([hour, 'key', 'maths', 'change', recent_hours]) - 'key' is the only non-optional. Must be in this order. Hour = start hour. Recent_hours is 1-168 and the number of hours to get.
* History.get('key.change') - gets change between this and last value (use for most entries to get relative rather than absolute values)
* History.get('key.average') - gets standard deviated mean average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Arithmetic_mean
* History.get('key.geometric') - gets geometric average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Geometric_mean
* History.get('key.harmonic') - gets harmonic average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Harmonic_mean
* History.get('key.mode') - gets the most common value (use .change again if needed)
* History.get('key.median') - gets the center value if all values sorted (use .change again etc)
* History.get('key.total') - gets total of all values added together
* History.get('key.max') - gets highest value (use .change for highest change in values)
* History.get('key.min') - gets lowest value
*/
var History = new Worker('History');
History.option = null;

History.defaults = {
	castle_age:{
		init: function() {
			if (Player.data.history) {
				this.data = Player.data.history;
				delete Player.data.history;
			}
		}
	}
};

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.mean') + this.get('income.mean')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.runtime.best ? {'Next Land':Land.runtime.cost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', false, {'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}


History.update = function(type) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	debug('Exp: '+this.get('exp'));
//	debug('Exp max: '+this.get('exp.max'));
//	debug('Exp max change: '+this.get('exp.max.change'));
//	debug('Exp min: '+this.get('exp.min'));
//	debug('Exp min change: '+this.get('exp.min.change'));
//	debug('Exp change: '+this.get('exp.change'));
//	debug('Exp mean: '+this.get('exp.mean.change'));
//	debug('Exp harmonic: '+this.get('exp.harmonic.change'));
//	debug('Exp geometric: '+this.get('exp.geometric.change'));
//	debug('Exp mode: '+this.get('exp.mode.change'));
//	debug('Exp median: '+this.get('exp.median.change'));
//	debug('Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
};

History.set = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {}
	this.data[hour][x[0]] = value;
};

History.add = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {}
	this.data[hour][x[0]] = (this.data[hour][x[0]] || 0) + value;
};

History.math = {
	stddev: function(list) {
		var i, listsum = 0, mean = this.mean(list);
		for (i in list) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, mean = this.mean(list), stddev = this.stddev(list);
		for (i in list) {
			if (Math.abs(list[i] - mean) > stddev * 2) { // The difference between the mean and the entry needs to be in there.
				delete list[i];
			}
		}
		return sum(list) / list.length;
	},
	mean: function(list) {
		return sum(list) / list.length;
	},
	harmonic: function(list) {
		var i, num = [];
		for (i in list) {
			if (list[i]) {
				num.push(1/list[i])
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, num = 1;
		for (i in list) {
			num *= list[i] || 1;
		}
		return Math.pow(num, 1 / list.length);
	},
	median: function(list) {
		list.sort(function(a,b){return a-b;});
		if (list.length % 2) {
			return (list[Math.floor(list.length / 2)] + list[Math.ceil(list.length / 2)]) / 2;
		}
		return list[Math.floor(list.length / 2)];
	},
	mode: function(list) {
		var i, j = 0, count = 0, num = {};
		for (i in list) {
			num[list[i]] = (num[list[i]] || 0) + 1
		}
		num = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in num) {
			if (num[i] === num[0]) {
				j += parseInt(num[i]);
				count++;
			}
		}
		return j / count;
	},
	max: function(list) {
		list.sort(function(a,b){return b-a;});
		return list[0];
	},
	min: function(list) {
		list.sort(function(a,b){return a-b;});
		return list[0];
	}
};

History.get = function(what) {
	this._unflush();
	var i, j, value, last = null, list = [], data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000), exact = false, past = 168, change = false;
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	if (x.length && (typeof x[x.length-1] === 'number' || !x[x.length-1].regex(/[^0-9]/gi))) {
		past = Math.range(1, parseInt(x.pop()), 168);
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (typeof data[i][x[0]] === 'number') {
			exact = true;
			break;
		}
	}
	if (x.length === 1) { // only the current value
		if (exact) {
			return data[hour][x[0]];
		}
		for (j in data[hour]) {
			if (j.indexOf(x[0] + '+') === 0 && typeof data[hour][j] === 'number') {
				value = (value || 0) + data[hour][j];
			}
		}
		return value;
	}
	if (x.length === 2 && x[1] === 'change') {
		if (data[hour] && data[hour-1]) {
			i = this.get([hour, x[0]]);
			j = this.get([hour - 1, x[0]]);
			if (typeof i === 'number' && typeof j === 'number') {
				return i - j;
			}
			return 0;
		}
		return 0;
	}
	if (x.length > 2 && x[2] === 'change') {
		change = true;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			value = null;
			if (exact) {
				if (typeof data[i][x[0]] === 'number') {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && typeof data[i][j] === 'number') {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (change) {
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						debug('NaN: '+value+' - '+last);
					}
				}
				last = value;
			} else {
				if (value !== null) {
					list.push(value);
				}
			}
		}
	}
	if (History.math[x[1]]) {
		return History.math[x[1]](list);
	}
	throw('Wanting to get unknown History type ' + x[1] + ' on ' + x[0]);
};

History.getTypes = function(what) {
	var i, list = [], types = {}, data = this.data, x = what + '+';
	for (i in data) {
		if (i.indexOf(x) === 0) {
			types[i] = true;
		}
	}
	for (i in types) {
		list.push(i);
	}
	return list;
};

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), title, numbers;
	if (typeof goal === 'number') {
		goal = [goal];
	} else if (typeof goal !== 'array' && typeof goal !== 'object') {
		goal = null;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			min = Math.min(min, goal[i]);
			max = Math.max(max, goal[i]);
		}
	}
	if (typeof type === 'string') {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				value[i][j] = this.get(i + '.' + type[j]);
			}
			if (sum(value[i])) {min = Math.min(min, sum(value[i]));}
			max = Math.max(max, sum(value[i]));
		}
	}
	if (max >= 1000000000) {
		divide = 1000000000;
		suffix = 'b';
	} else if (max >= 1000000) {
		divide = 1000000;
		suffix = 'm';
	} else if (max >= 1000) {
		divide = 1000;
		suffix = 'k';
	}
	max = Math.ceil(max / divide) * divide;
	max_s = (iscash ? '$' : '') + addCommas(max / divide) + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = (iscash ? '$' : '') + addCommas(min / divide) + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + addCommas((goal[i] / divide).round(1)) + suffix + '</div>');
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>')
	for (i=hour-72; i<=hour; i++) {
		bars = []
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		var count = 0;
		for (j in value[i]) {
			bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
			count++;
			if (value[i][j]) {
				numbers.push((value[i][j] ? (iscash ? '$' : '') + addCommas(value[i][j]) : ''));
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + addCommas(sum(value[i])) : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
}

/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.defaults = {
	castle_age:{}
};
Idle.settings ={
    after:['LevelUp']
};

Idle.data = null;
Idle.option = {
	general: 'any',
	index: 'Daily',
	alchemy: 'Daily',
	quests: 'Never',
	town: 'Never',
	battle: 'Quarterly',
	monsters: 'Hourly',
        collect: 'Never'
};

Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.display = [
	{
		label:'<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		label:'Check Pages:'
	},{
		id:'index',
		label:'Home Page',
		select:Idle.when
	},{
		id:'alchemy',
		label:'Alchemy',
		select:Idle.when
	},{
		id:'quests',
		label:'Quests',
		select:Idle.when
	},{
		id:'town',
		label:'Town',
		select:Idle.when
	},{
		id:'battle',
		label:'Battle',
		select:Idle.when
	},{
		id:'monsters',
		label:'Monsters',
		select:Idle.when
	},{
		id:'collect',
		label:'Apprentice Reward',
		select:Idle.when
	}
];

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_quest7', 'quests_quest8', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle'], //, 'battle_arena'
		monsters:['keep_monster', 'battle_raid'],
                collect:['apprentice_collect']
	}, when = { 'Never':0, 'Quarterly':900000, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[this.option[i]]) {
			continue;
		}
		time = Date.now() - when[this.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.get(pages[i][p]) || Page.get(pages[i][p]) < time) {
				if (!Page.to(pages[i][p])) {
					Page.set(pages[i][p], Date.now())
					return true;
				}
			}
		}
	}
	return true;
};

/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = null;

Income.settings = {
	important:true
};

Income.defaults = {
	castle_age:{}
};

Income.option = {
	general:true,
	bank:true,
	margin:45
};

Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.work = function(state) {
	if (!Income.option.margin) {
		return QUEUE_FINISH;
	}
//	debug(when + ', Margin: ' + Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return QUEUE_FINISH;
	}
	if (!state || (this.option.general && !Generals.to('income'))) {
		return QUEUE_CONTINUE;
	}
	debug('Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return QUEUE_CONTINUE;
};

/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');

Land.defaults = {
	castle_age:{
		pages:'town_land'
	}
};

Land.option = {
	enabled:true,
//	wait:48,
	onlyten:false,
	sell:false,
	land_exp:false
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		advanced:true,
		id:'sell',
		label:'Sell Extra Land',
		checkbox:true,
		help:'You can sell land above your Max at full price.'
	},{
		exploit:true,
		id:'land_exp',
		label:'Sell Extra Land 10 at a time',
		checkbox:true,
		help:'If you have extra lands, this will sell 10x.  The extra sold lands will be repurchased at a lower cost.'
//	},{
/*		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{*/
/*		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true,
		help:'The standard method is guaranteed to be the most efficient.  Choosing this option will slow down your income.'
*/	}
];

Land.parse = function(change) {
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (!change) {
			// Fix for broken land page!!
			!$('.land_buy_image_int', el).length && $('.land_buy_image', el).prepend('<div class="land_buy_image_int"></div>').children('.land_buy_image_int').append($('.land_buy_image >[class!="land_buy_image_int"]', el));
			!$('.land_buy_info_int', el).length && $('.land_buy_info', el).prepend('<div class="land_buy_info_int"></div>').children('.land_buy_info_int').append($('.land_buy_info >[class!="land_buy_info_int"]', el));
			Land.data[name] = {};
			Land.data[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			Land.data[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
			Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
			if (tmp) {
				Land.data[name].buy = tmp;
			}
			Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		} else {
			iscaap() &&	$('.land_buy_info strong:first', el).after('<strong title="Daily Return On Investment - higher is better"> | ROI ' + ((Land.data[name].own < Land.data[name].max) ? (Land.data[name].income * 2400) / Land.data[name].cost : 0).round(3) + '%</strong>');
			!iscaap() && $('.land_buy_info strong:first', el).after(' - (<strong title="Return On Investment - higher is better">ROI</strong>: ' + ((Land.data[name].income * 100) / Land.data[name].cost).round(3) + '%)');
		}
	});
	return true;
};

Land.update = function() {
	var i, worth = Bank.worth(), income = Player.get('income') + History.get('income.mean'), best, buy = 0;
	
	if (this.option.land_exp) {
		$('input:golem(land,sell)').attr('checked',true);
		this.option.sell = true;
	}
	
	for (i in this.data) {
		if (this.option.sell && this.data[i].own > this.data[i].max) {
			best = i;
			buy = this.data[i].max - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -10;
			}
			break;
		}
		if (this.data[i].buy) {
			if (!best || ((this.data[best].cost / income) + (this.data[i].cost / (income + this.data[best].income))) > ((this.data[i].cost / income) + (this.data[best].cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}
	if (best) {
		if (!buy) {
	/*		if (this.option.onlyten || (this.data[best].cost * 10) <= worth || (this.data[best].cost * 10 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if ((this.data[best].cost * 5) <= worth || (this.data[best].cost * 5 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {
				buy = 1;
			}*/
			
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			var cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			var time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
			if ((this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if (this.data[best].cost / income > time_limit){		// If it will take longer to save for 1 land than it will take to payoff the increased cost, buy 1.
				buy = 1;
			} else if (this.data[best].cost * 5 / income > time_limit){	// If it will take longer to save for 5 lands than it will take to payoff the increased cost, buy 5.
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {																	// Otherwise buy 10 because that's the max.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			}
		}
		this.runtime.buy = buy;
		this.runtime.cost = buy * this.data[best].cost; // May be negative if we're making money by selling
		Dashboard.status(this, (buy>0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + addCommas(Math.abs(this.runtime.cost)));
	} else {
		Dashboard.status(this);
	}
	this.runtime.best = best;
}

Land.work = function(state) {
	if (!this.option.enabled || !this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		if (!this.runtime.best && this.runtime.lastlevel < Player.get('level')) {
			if (!state || !Page.to('town_land')) {
				return QUEUE_CONTINUE;
			}
			this.runtime.lastlevel = Player.get('level');
		}
		return QUEUE_FINISH;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || !Page.to('town_land')) {
		return QUEUE_CONTINUE;
	}
//	var el = $('tr.land_buy_row:contains("'+this.runtime.best+'"),tr.land_buy_row_unique:contains("'+this.runtime.best+'")');
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		if ($('img', el).attr('alt') === Land.runtime.best) {
			if (Land.runtime.buy > 0) {
				$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.runtime.buy > 5 ? 10 : (Land.runtime.buy > 1 ? 5 : 1));
			} else {
				$('select', $('.land_buy_costs .gold', el).parent().parent().next()).val(Land.runtime.buy <= -10 ? 10 : (Land.runtime.buy <= -5 ? 5 : 1));
			}
			debug('Land',(Land.runtime.buy > 0 ? 'Buy' : 'Sell') + 'ing ' + Math.abs(Land.runtime.buy) + ' x ' + Land.runtime.best + ' for $' + addCommas(Math.abs(Land.runtime.cost)));
			Page.click($('.land_buy_costs input[name="' + (Land.runtime.buy > 0 ? 'Buy' : 'Sell') + '"]', el));
		}
	});
	return QUEUE_RELEASE;
};

/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
* 4. Will set Queue.burn.stamina to max available
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults = {
	castle_age:{
		pages:'*'
	}
};

LevelUp.option = {
	enabled:false,
	income:true,
	general:'any',
	order:'stamina',
	algorithm:'Per Action'
};

LevelUp.runtime = {
	level:0,// set when we start, compare to end
	heal_me:false,// we're active and want healing...
	battle_monster:false,// remember whether we're doing monsters first or not or not...
	old_quest:null,// save old quest, if it's not null and we're working then push it back again...
	old_quest_energy:0,
	running:false,// set when we change
	energy:0,
	stamina:0,
	exp:0,
	exp_possible:0,
	energy_samples:0,
	exp_per_energy:1,
	stamina_samples:0,
	exp_per_stamina:1,
	quests:[] // quests[energy] = [experience, [quest1, quest2, quest3]]
};

LevelUp.display = [
	{
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'income',
		label:'Allow Income General',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina'],
		help:'Select which type of general to use when leveling up.'
	},{
		id:'order',
		label:'Spend first ',
		select:['Energy','Stamina'],
		help:'Select which resource you want to spend first when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	}
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
	this.runtime.level = this.runtime.level || Player.get('level'); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(Player.get('exp_needed')) + '<span style="font-weight:normal;"> in <span class="golem-time" style="color:rgb(25,123,48);" name="' + this.get('level_time') + '">' + makeTimer(this.get('level_timer')) + '</span></span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-][0-9]+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$([0-9]+)/i) || 0) - (txt.regex(/\-\$([0-9]+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-][0-9]+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-][0-9]+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-][0-9]+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
}

LevelUp.update = function(type,worker) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data;
	if (worker === Player || !length(runtime.quests)) {
		if (exp !== runtime.exp) { // Experience has changed...
			if (runtime.stamina > stamina) {
				runtime.exp_per_stamina = ((runtime.exp_per_stamina * Math.min(runtime.stamina_samples, 49)) + ((exp - runtime.exp) / (runtime.stamina - stamina))) / Math.min(runtime.stamina_samples + 1, 50); // .round(3)
				runtime.stamina_samples = Math.min(runtime.stamina_samples + 1, 50); // More samples for the more variable stamina
			} else if (runtime.energy > energy) {
				runtime.exp_per_energy = ((runtime.exp_per_energy * Math.min(runtime.energy_samples, 9)) + ((exp - runtime.exp) / (runtime.energy - energy))) / Math.min(runtime.energy_samples + 1, 10); // .round(3)
				runtime.energy_samples = Math.min(runtime.energy_samples + 1, 10); // fewer samples for the more consistent energy
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	if (worker === Quest || !length(runtime.quests)) { // Now work out the quickest quests to level up
		quest_data = Quest.get();
		runtime.quests = quests = [[0]];// quests[energy] = [experience, [quest1, quest2, quest3]]
		for (i in quest_data) { // Fill out with the best exp for every energy cost
			if (!quests[quest_data[i].energy] || quest_data[i].exp > quests[quest_data[i].energy][0]) {
				quests[quest_data[i].energy] = [quest_data[i].exp, [i]];
			}
		}
		j = 1;
		k = [0];
		for (i=1; i<quests.length; i++) { // Fill in the blanks and replace using the highest exp per energy ratios
			if (quests[i] && quests[i][0] / i >= k[0] / j) {
				j = i;
				k = quests[i];
			} else {
				quests[i] = [k[0], [k[1][0]]];
			}
		}
		while (quests.length > 1 && quests[quests.length-1][0] === quests[quests.length-2][0]) { // Delete entries at the end that match (no need to go beyond our best ratio quest)
			quests.pop();
		}
// No need to merge quests as we're only interested in the first one...
//		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
//			if (quest_data[quests[i][1][0]].energy < i) {
//				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
//				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
//			}
//		}
//		debug('Quickest '+quests.length+' Quests: '+JSON.stringify(quests));
	}
	if (!this.runtime.quests.length) { // No known quests yet...
		runtime.exp_possible = 1;
	} else if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length-1][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
	runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Hour: ' + addCommas(this.get('exp_average').round(1)) + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">LevelUp Running Now!</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' exp per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
}

LevelUp.work = function(state) {
	var i, runtime = this.runtime, general, energy = Player.get('energy'), stamina = Player.get('stamina');
	if (runtime.running && this.option.income) {
		if (Queue.get('runtime.current') === Income) {
			Generals.set('runtime.disabled', false);
		}
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		if (runtime.running && runtime.level < Player.get('level')) { // We've just levelled up
			if ($('#app'+APPID+'_energy_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  energy >= Player.get('maxenergy')) {
				Queue.burn.energy = energy;
				Queue.burn.stamina = 0;
				return false;
			}
			if ($('#app'+APPID+'_stamina_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  stamina >= Player.get('maxstamina')) {
				Queue.burn.energy = 0;
				Queue.burn.stamina = stamina;
				return false;
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('running '+runtime.running);
		} else if (runtime.running && runtime.level == Player.get('level')) { //We've gotten less exp per stamina than we hoped and can't reach the next level.
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('Running '+runtime.running);
		}
		return false;
	}
	if (state && runtime.heal_me) {
		if (Heal.me()) {
			return true;
		}
		runtime.heal_me = false;
	}
	if (!runtime.running || state) { // We're not running yet, or we have focus
		runtime.level = Player.get('level');
		runtime.battle_monster = Battle.get('option.monster');
		runtime.running = true;
//		debug('Running '+runtime.running);
		Battle.set('option.monster', false);
	}
	general = Generals.best(this.option.general); // Get our level up general
	if (general && general !== 'any' && Player.get('exp_needed') < 100) { // If we want to change...
		Generals.set('runtime.disabled', false);	// make sure changing Generals is not disabled
		if (general === Player.get('general') || Generals.to(general)) { // ...then change if needed
//			debug('Disabling Generals because we are within 25 XP from leveling.');
			Generals.set('runtime.disabled', true);	// and lock the General se we can level up.
		} else {
			return true;	// Try to change generals again
		}
	}
	// We don't have focus, but we do want to level up quicker
    if (this.option.order !== 'Stamina' || !stamina || (stamina < 5 && Battle.option.monster && !Battle.option.points)){
        debug('Running Energy Burn');
	if (Player.get('energy')) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
		runtime.old_quest = Quest.runtime.best;
		runtime.old_quest_energy = Quest.runtime.energy;
		Queue.burn.energy = energy;
		Queue.burn.stamina = 0;
		Quest.runtime.best = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1][0]; // Access directly as Quest.set() would force a Quest.update and overwrite this again
		Quest.runtime.energy = energy; // Ok, we're lying, but it works...
		return false;
	}}
        else
            {debug('Running Stamina Burn');}
    
	Quest._update('data'); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	if (runtime.level === Player.get('level') && Player.get('health') < 13 && stamina) { // If we're still trying to level up and we don't have enough health and we have stamina to burn then heal us up...
		runtime.heal_me = true;
		return true;
	}
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = stamina; // Make sure we can burn everything, even the stuff we're saving
	return false;
};

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'timer':		return makeTimer(this.get('level_timer'));
		case 'time':		return (new Date(this.get('level_time'))).format('l g:i a');
		case 'level_timer':	return Math.floor((this.get('level_time') - now) / 1000);
		case 'level_time':	return now + Math.floor(3600000 * ((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what);
	}
}/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.data = {};

Monster.defaults = {
    castle_age:{
        pages:'keep_monster keep_monster_active keep_monster_active2 battle_raid'
    }
};

Monster.option = {
    fortify: 30,
    //	quest_over: 90,
    min_to_attack: 0,
    //	dispel: 50,
    fortify_active:false,
    choice: 'Any',
    ignore_stats:true,
    stop: 'Never',
    own: true,
    armyratio: 1,
    levelratio: 'Any',
    force1: true,
    raid: 'Invade x5',
    assist: true,
    maxstamina: 5,
    minstamina: 5,
    maxenergy: 10,
    minenergy: 10,
    monster_check:'Hourly',
    check_interval:3600000,
    avoid_behind:false,
    avoid_hours:5,
    behind_override:false
};

Monster.runtime = {
    check:false, // got monster pages to visit and parse
    uid:null,
    type:null,
    fortify:false, // true if we can fortify / defend / etc
    attack:false, // true to attack
    stamina:5, // stamina to burn
    health:10 // minimum health to attack
};

Monster.display = [
{
    title:'Fortification'
},{
    id:'fortify',
    label:'Fortify Below (AB)',
    text:30,
    help:'Fortify if ATT BONUS is under this value. Range of -50% to +50%.',
    after:'%'
},{
    /*	id:'quest_over',
	label:'Quest if Over',
	text:90,
	after:'%'
},{*/
    id:'min_to_attack',
    label:'Attack Over (AB)',
	text:1,
    help:'Attack if ATT BONUS is over this value. Range of -50% to +50%.',
    after:'%'
},{	
    id:'fortify_active',
    label:'Fortify Active',
    checkbox:true,
    help:'Must be checked to fortify.'
},{
    title:'Who To Fight'
},{
    advanced:true,
    id:'ignore_stats',
    label:'Ignore Player Stats',
    checkbox:true,
    help:'Do not use the current health or stamina as criteria for choosing monsters.'
},{
    id:'choice',
    label:'Attack',
    select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Mim Damage','ETD Maintain']
},{
    id:'stop',
    label:'Stop',
    select:['Never', 'Achievement', 'Loot'],
    help:'Select when to stop attacking a target.'
},{
    id:'maxstamina',
    label:'Max Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the maximum stamina for a single attack'
},{
    id:'minstamina',
    label:'Min Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the minimum stamina for a single attack'
},{
    id:'maxenergy',
    label:'Max Energy Cost',
    select:[10,20,40,100],
    help:'Select the maximum energy for a single energy action'
},{
    id:'minenergy',
    label:'Min Energy Cost',
    select:[10,20,40,100],
    help:'Select the minimum energy for a single energy action'
},{
    advanced:true,
    id:'own',
    label:'Never stop on Your Monsters',
    checkbox:true,
    help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
},{
    advanced:true,
    id:'avoid_behind',
    label:'Avoid Upside-Down Monsters',
    checkbox:true,
    help:'Avoid Monsters that behind in ETD as compared to CA Timer.'
},{
    advanced:true,
    id:'avoid_hours',
    label:'Upside-Down Hours',
    text:true,
    help:'# of Hours Monster must be behind before preventing attacks.'
},{
    advanced:true,
    id:'behind_override',
    label:'Stop Override',
    checkbox:true,
    help:'Continue attacking monsters that meet Stop option but are upside-down (Kill In greater than Time Left). Attempts to bring Kill In below Time Left if damage is at or above Stop Option. Works in coordination with Avoid Upside-Down Monsters)'
},{
    title:'Raids'
},{
    id:'raid',
    label:'Raid',
    select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
},{
    id:'armyratio',
    label:'Target Army Ratio<br>(Only needed for Invade)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
},{
    id:'levelratio',
    label:'Target Level Ratio<br>(Mainly used for Duel)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
},{
    id:'force1',
    label:'Force +1',
    checkbox:true,
    help:'Force the first player in the list to aid.'
},{
    title:'Siege Assist Options'
},{
    id:'assist',
    label:'Assist with Sieges',
    help:'Spend stamina to assist with sieges.',
    checkbox:true
},{
    id:'assist_links',
    label:'Use Assist Links in Dashboard',
    checkbox:true
},{
    advanced:true,
    id:'monster_check',
    label:'Monster Review',
    select:['Quarterly','1/2 Hour','Hourly','2 Hours','6 Hours','12 Hours','Daily','Weekly'],
    help:'Sets how ofter to check Monster Stats.'
}
];

Monster.types = {
    // Special (level 5) - not under Monster tab
    //	kull: {
    //		name:'Kull, the Orc Captain',
    //		timer:259200 // 72 hours
    //	},
    // Raid

    raid_easy: {
        name:'The Deathrune Siege',
        list:'deathrune_list1.jpg',
        image:'raid_title_raid_a1.jpg',
        image2:'raid_title_raid_a2.jpg',
        dead:'raid_1_large_victory.jpg',
        achievement:100,
        timer:216000, // 60 hours
        timer2:302400, // 84 hours
        raid:true
    },

    raid: {
        name:'The Deathrune Siege',
        list:'deathrune_list2.jpg',
        image:'raid_title_raid_b1.jpg',
        image2:'raid_title_raid_b2.jpg',
        dead:'raid_1_large_victory.jpg',
        achievement:100,
        timer:319920, // 88 hours, 52 minutes
        timer2:519960, // 144 hours, 26 minutes
        raid:true
    },
    // Epic Boss
    colossus: {
        name:'Colossus of Terra',
        list:'stone_giant_list.jpg',
        image:'stone_giant_large.jpg',
        dead:'stone_giant_dead.jpg',
        achievement:20000,
        timer:259200, // 72 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    gildamesh: {
        name:'Gildamesh, the Orc King',
        list:'orc_boss_list.jpg',
        image:'orc_boss.jpg',
        dead:'orc_boss_dead.jpg',
        achievement:15000,
        timer:259200, // 72 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    keira: {
        name:'Keira the Dread Knight',
        list:'boss_keira_list.jpg',
        image:'boss_keira.jpg',
        dead:'boss_keira_dead.jpg',
        achievement:30000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    lotus: {
        name:'Lotus Ravenmoore',
        list:'boss_lotus_list.jpg',
        image:'boss_lotus.jpg',
        dead:'boss_lotus_big_dead.jpg',
        achievement:500000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    mephistopheles: {
        name:'Mephistopheles',
        list:'boss_mephistopheles_list.jpg',
        image:'boss_mephistopheles_large.jpg',
        dead:'boss_mephistopheles_dead.jpg',
        achievement:100000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    skaar: {
        name:'Skaar Deathrune',
        list:'death_list.jpg',
        image:'death_large.jpg',
        dead:'death_dead.jpg',
        achievement:1000000,
        timer:345000, // 95 hours, 50 minutes
        mpool:1,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    sylvanus: {
        name:'Sylvana the Sorceress Queen',
        list:'boss_sylvanus_list.jpg',
        image:'boss_sylvanus_large.jpg',
        dead:'boss_sylvanus_dead.jpg',
        achievement:50000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    // Epic Team
    dragon_emerald: {
        name:'Emerald Dragon',
        list:'dragon_list_green.jpg',
        image:'dragon_monster_green.jpg',
        dead:'dead_dragon_image_green.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_frost: {
        name:'Frost Dragon',
        list:'dragon_list_blue.jpg',
        image:'dragon_monster_blue.jpg',
        dead:'dead_dragon_image_blue.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_gold: {
        name:'Gold Dragon',
        list:'dragon_list_yellow.jpg',
        image:'dragon_monster_gold.jpg',
        dead:'dead_dragon_image_gold.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_red: {
        name:'Ancient Red Dragon',
        list:'dragon_list_red.jpg',
        image:'dragon_monster_red.jpg',
        dead:'dead_dragon_image_red.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    serpent_amethyst: { // DEAD image Verified and enabled.
        name:'Amethyst Sea Serpent',
        list:'seamonster_list_purple.jpg',
        image:'seamonster_purple.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_amethyst.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_ancient: { // DEAD image Verified and enabled.
        name:'Ancient Sea Serpent',
        list:'seamonster_list_red.jpg',
        image:'seamonster_red.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_ancient.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_emerald: { // DEAD image Verified and enabled.
        name:'Emerald Sea Serpent',
        list:'seamonster_list_green.jpg',
        image:'seamonster_green.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_emerald.jpg', //Guesswork. Needs verify.
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_sapphire: { // DEAD image guesswork based on others and enabled.
        name:'Sapphire Sea Serpent',
        list:'seamonster_list_blue.jpg',
        image:'seamonster_blue.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_sapphire.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    // Epic World
    cronus: {
        name:'Cronus, The World Hydra',
        list:'hydra_head.jpg',
        image:'hydra_large.jpg',
        dead:'hydra_dead.jpg',
        achievement:500000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5,10,20,50]
    },
    legion: {
        name:'Battle of the Dark Legion',
        list:'castle_siege_list.jpg',
        image:'castle_siege_large.jpg',
        dead:'castle_siege_dead.jpg',
        achievement:1000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="fortify"]',
        defends:[10,20,40,100],
        orcs:true
    },
    genesis: {
        name:'Genesis, The Earth Elemental',
        list:'earth_element_list.jpg',
        image:'earth_element_large.jpg',
        dead:'earth_element_dead.jpg',
        achievement:1000000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="fortify"]',
        defends:[10,20,40,100]
    },
    ragnarok: {
        name:'Ragnarok, The Ice Elemental',
        list:'water_list.jpg',
        image:'water_large.jpg',
        dead:'water_dead.jpg',
        achievement:1000000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    bahamut: {
        name:'Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list.jpg',
        image:'nm_volcanic_large.jpg',
        dead:'nm_volcanic_dead.jpg',
        achievement:1000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    },
    alpha_bahamut: {
        name:'Alpha Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list_2.jpg',
        image:'nm_volcanic_large_2.jpg',
        dead:'nm_volcanic_dead_2.jpg', //Guesswork
        achievement:2000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    },
    azriel: {
        name:'Azriel, the Angel of Wrath',
        list:'nm_azriel_list.jpg',
        image:'nm_azriel_large2.jpg',
        dead:'nm_azriel_dead.jpg', //Guesswork
        achievement:2000000, // Guesswork
        timer:604800, // 168 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    }
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = ['img[src$="nm_stun_bar.gif"]'];
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage'];
Monster.class_off = ['', '', 'img[src$="nm_s_off_cripple.gif"]', 'img[src$="nm_s_off_deflect.gif"]'];

Monster.init = function() {
    var i, j;
    this.runtime.count = 0;
    for (i in this.data) {
        for (j in this.data[i]) {
            if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
            if (typeof this.data[i][j].ignore === 'unknown'){
                this.data[i][j].ignore = false;
            }
            if (typeof this.data[i][j].dispel !== 'undefined') {
                this.data[i][j].defense = 100 - this.data[i][j].dispel;
                delete this.data[i][j].dispel;
            }
        }
    }
    this._watch(Player);
    $('#golem-dashboard-Monster tbody td a').live('click', function(event){
        var url = $(this).attr('href');
        Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
        return false;
    });
}

Monster.parse = function(change) {
    var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), uid, type, tmp, $health, $defense, $dispel, $secondary, dead = false, monster, timer;
    var data = Monster.data, types = Monster.types;	//Is there a better way?  "this." doesn't seem to work.
    if (Page.page === 'keep_monster_active' || Page.page === 'keep_monster_active2') { // In a monster or raid
        uid = $('img[linked][size="square"]').attr('uid');
        for (i in types) {
            if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length  && !types[i].title) {
                //debug('Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length && types[i].title && $('div[style*="'+types[i].title+'"]').length){
                //debug('Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].image && ($('img[src$="'+types[i].image+'"]').length || $('div[style*="'+types[i].image+'"]').length)) {
                //debug('Parsing '+i);
                type = i;
                timer = types[i].timer;
            } else if (types[i].image2 && ($('img[src$="'+types[i].image2+'"]').length || $('div[style*="'+types[i].image2+'"]').length)) {
                //debug('Parsing second stage '+i);
                type = i;
                timer = types[i].timer2 || types[i].timer;
            }
        }
        if (!uid || !type) {
            debug('Unknown monster (probably dead)');
            return false;
        }
        data[uid] = data[uid] || {};
        data[uid][type] = data[uid][type] || {};
        monster = data[uid][type];
        monster.last = Date.now();
        if ($('input[src*="collect_reward_button.jpg"]').length) {
            monster.state = 'reward';
            return false;
        }
        if (dead && monster.state === 'assist') {
            monster.state = null;
        } else if (dead && monster.state === 'engage') {
            monster.state = 'reward';
        } else {
            if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
                if ($('span.result_body').text().match(/for your help in summoning/i)) {
                    monster.assist = Date.now();
                }
                monster.state = 'assist';
            }
            if ($('img[src$="battle_victory.gif"],img[src$="battle_defeat.gif"],span["result_body"] a:contains("Attack Again")').length)	{ //	img[src$="icon_weapon.gif"],
                monster.battle_count = (monster.battle_count || 0) + 1;
            //debug('Setting battle count to ' + monster.battle_count);
            }
            if ($('img[src$="battle_victory"]').length){
                History.add('raid+win',1);
            }
            if ($('img[src$="battle_defeat"]').length){
                History.add('raid+loss',-1);
            }
            if (!monster.name) {
                tmp = $('img[linked][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
                //				monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
                monster.name = tmp.regex(/(.+)'s /i);
            }
            // Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
            for (i in Monster['class_img']){
                if ($(Monster['class_img'][i]).length){
                    monster.mclass = i;
                //debug('Monster class : '+Monster['class_name'][i]);
                }
            }
            if (monster.mclass > 1){	// If we are a Rogue or Mage
                // Attempt to check if we are in the wrong phase
                if ($(Monster['class_off'][monster.mclass]).length === 0){
                    for(i in Monster['secondary_img']) {
                        $secondary = $(Monster['secondary_img'][i]);
                        if ($secondary.length) {
                            monster.secondary = (100 * $secondary.width() / $secondary.parent().width());
                            //debug(Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
                            break;
                        }
                    }
                }
                else {
            //debug("We aren't in "+Monster['class_name'][monster.mclass]+" phase. Skip fortify.");
            }
            }
            for (i in Monster['health_img']){
                if ($(Monster['health_img'][i]).length){
                    $health = $(Monster['health_img'][i]).parent();
                    monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
                    break;
                }
            }
            for (i in Monster['shield_img']){
                if ($(Monster['shield_img'][i]).length){
                    $dispel = $(Monster['shield_img'][i]).parent();
                    monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
                    monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
                    break;
                }
            }
            for (i in Monster['defense_img']){
                if ($(Monster['defense_img'][i]).length){
                    $defense = $(Monster['defense_img'][i]).parent();
                    monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
                    if ($defense.parent().width() < $defense.parent().parent().width()){
                        monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
                    } else {
                        monster.strength = 100;
                    }
                    monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
                    break;
                }
            }
            monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
            monster.finish = Date.now() + (monster.timer * 1000);
            monster.damage_total = 0;
            monster.damage_siege = 0;
            monster.damage_players = 0;
            monster.fortify = 0;
            monster.damage = {};
            $('img[src*="siege_small"]').each(function(i,el){
                var siege = $(el).parent().next().next().next().children().eq(0).text();
                var tmp = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'');
                var dmg = tmp.regex(/([0-9]+)/);
                //debug('Monster Siege',siege + ' did ' + addCommas(dmg) + ' amount of damage.');
                monster.damage[siege]  = [dmg];
                monster.damage_siege += dmg;
            });
            $('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
                var user = $(el).attr('href').regex(/user=([0-9]+)/i);
                var tmp = null;
                if (types[type].raid){
                    tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
                } else {
                    tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
                }
                var dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
                monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
                if (user === userID){
                    if (monster.battle_count && monster.damage_user){
                        monster.damage_avg = Math.ceil(monster.damage_user / monster.battle_count);
                    //debug('Monster Damage','(1) Setting Avg Damage to ' + monster.damage_avg);
                    } else {
                        monster.damage_avg = monster.damage_user;
                    //debug('Monster Damage','(2) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    if ((monster.damage_avg > ((dmg - monster.damage_user) * 1.3)  || monster.damage_avg < ((dmg - monster.damage_user) * 1.3) )&& dmg !== monster.damage_user){
                        //debug('Monster Damage','Last Attack was ' + (dmg - monster.damage_user));
                        monster.damage_avg = Math.ceil(((dmg - monster.damage_user) + monster.damage_avg) /2);
                    //debug('Monster Damage','(3) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    
                    monster.damage_user = dmg;
                    while (monster.damage_avg * monster.battle_count < monster.damage_user){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count++;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                    while (monster.damage_avg * monster.battle_count > monster.damage_user * 1.2){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count--;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                }
                monster.damage_players += dmg;
                if (fort) {
                    monster.fortify += fort;
                }
            });
            if(types[type].orcs) {
                monster.damage_total = Math.ceil(monster.damage_siege / 1000) + monster.damage_players
            } else {
                monster.damage_total = monster.damage_siege + monster.damage_players;
            }
            monster.dps = monster.damage_players / (timer - monster.timer);
            if (types[type].raid) {
                monster.total = monster.damage_total + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
            } else {
                monster.total = Math.ceil((1 + 100 * monster.damage_total) / (monster.health == 100 ? 0.1 : (100 - monster.health)));
            }
            monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
        }
    } else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
        if (!$('#app'+APPID+'_app_body div.imgButton').length) {
            return false;
        }
        if (Page.page === 'battle_raid') {
            raid = true;
        }
        for (uid in data) {
            for (type in data[uid]) {
                if (((Page.page === 'battle_raid' && this.types[type].raid) || (Page.page === 'keep_monster' && !this.types[type].raid)) && (data[uid][type].state === 'complete' || (data[uid][type].state === 'assist' && data[uid][type].finish < Date.now()))) {
                    data[uid][type].state = null;
                }
            }
        }
        $('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
            var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
            for (i in types) {
                if (tmp == types[i].list) {
                    type = i;
                    break;
                }
            }
            if (!uid || type === 'unknown') {
                return;
            }
            data[uid] = data[uid] || {};
            data[uid][type] = data[uid][type] || {};
            if (uid === userID) {
                data[uid][type].name = 'You';
            } else {
                tmp = $(el).parent().parent().children().eq(2).text().trim();
                data[uid][type].name = tmp.regex(/(.+)'s /i);
            }
            switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
                case 2:
                    data[uid][type].state = 'reward';
                    break;
                case 3:
                    data[uid][type].state = 'engage';
                    break;
                case 4:
                    //if (this.types[type].raid && data[uid][type].health) {
                    //data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
                    //} else {
                    data[uid][type].state = 'complete';
                    //}
                    break;
                default:
                    data[uid][type].state = 'unknown';
                    break; // Should probably delete, but keep it on the list...
            }
        });
    }
    return false;
};

Monster.update = function(what) {
    var i, j, list = [], uid = this.runtime.uid, type = this.runtime.type, best = null, req_stamina, req_health
    this.runtime.count = 0;
    for (i in this.data) { // Flush unknown monsters
        for (j in this.data[i]) {
            if (!this.data[i][j].state || this.data[i][j].state === null) {
                log('Found Invalid Monster State=(' + this.data[i][j].state + ')');
                delete this.data[i][j];
            } else if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
        }
        if (!length(this.data[i])) { // Delete uid's without an active monster
            log('Found Invalid Monster ID=(' + this.data[i] + ')');
            delete this.data[i];
        }
    }
    if (!uid || !type || !this.data[uid] || !this.data[uid][type] || (this.data[uid][type].state !== 'engage' && this.data[uid][type].state !== 'assist')) { // If we've not got a valid target...
        this.runtime.uid = uid = null;
        this.runtime.type = type = null;
    }
    // Testing this out
    uid = null;
    type = null;
	
    //this.runtime.check = false;
    switch (this.option.monster_check){
        case 'Quarterly':
            if (this.option.check_interval !== 900000){
                this.option.check_interval = 900000;
            }
            break;
        case '1/2 Hour':
            if (this.option.check_interval !== 1800000){
                this.option.check_interval = 1800000;
            }
            break;
        case 'Hourly':
            if (this.option.check_interval !== 3600000){
                this.option.check_interval = 3600000;
            }
            break;
        case '2 Hours':
            if (this.option.check_interval !== 7200000){
                this.option.check_interval = 7200000;
            }
            break;
        case '6 Hours':
            if (this.option.check_interval !== 21600000){
                this.option.check_interval = 21600000;
            }
            break;
        case '12 Hours':
            if (this.option.check_interval !== 43200000){
                this.option.check_interval = 43200000;
            }
            break;
        case 'Daily':
            if (this.option.check_interval !== 86400000){
                this.option.check_interval = 86400000;
            }
            break;
        case 'Weekly':
            if (this.option.check_interval !== 604800000){
                this.option.check_interval = 604800000;
            }
            break;
    }
    for (i in this.data) {
        // Look for a new target...
        for (j in this.data[i]) {
            if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || (this.data[i][j].last < (Date.now() - this.option.check_interval))) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore && this.data[i][j].state !== 'complete') && !this.runtime.check) {
                // Check monster progress every hour
                this.runtime.check = true; // Do we need to parse info from a blank monster?
                break;
            }
            req_stamina = (this.types[j].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[j].raid) ? 5 : (this.option.minstamina < Math.min.apply( Math, this.types[j].attacks) || this.option.maxstamina < Math.min.apply( Math, this.types[j].attacks)) ? Math.min.apply( Math, this.types[j].attacks): (this.option.minstamina > Math.max.apply( Math, this.types[j].attacks)) ? Math.max.apply( Math, this.types[j].attacks) : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
            req_energy = this.types[j].def_btn ? this.option.minenergy : null;
            req_health = this.types[j].raid ? 13 : 10; // Don't want to die when attacking a raid
            if ((typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore) && this.data[i][j].state === 'engage' && this.data[i][j].finish > Date.now() && (this.option.ignore_stats || Player.get('health') >= req_health) && ((Queue.burn.energy >= req_energy) || ((this.option.ignore_stats || Queue.burn.stamina >= req_stamina) && (typeof this.data[i][j].attackbonus === 'undefined' || this.data[i][j].attackbonus >= this.option.min_to_attack)))) {
                if (!this.data[i][j].battle_count){
                    this.data[i][j].battle_count = 0;
                }
                if (this.data[i][j].name === 'You' && this.option.own){
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else if (this.option.behind_override && (this.data[i][j].eta >= this.data[i][j].finish) && sum(this.data[i][j].damage[userID]) > this.types[j].achievement){
                    //debug('Adding behind monster. ' + this.data[i][j].name + '\'s ' + this.types[j].name);
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else {
                    switch(this.option.stop) {
                        default:
                        case 'Never':
                            list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            break;
                        case 'Achievement':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < this.types[j].achievement)) {
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                        case 'Loot':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < ((i == userID && j === 'keira') ? 200000 : 2 * this.types[j].achievement))) {
                                // Special case for your own Keira to get her soul.
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                    }
                }
            }
        }
    }
    if (list.length){
        list.sort( function(a,b){
            switch(Monster.option.choice) {
                case 'Any':
                    return (Math.random()-0.5);
                    break;
                case 'Strongest':
                    return b[2] - a[2];
                    break;
                case 'Weakest':
                    return a[2] - b[2];
                    break;
                case 'Shortest ETD':
                    return a[3] - b[3];
                    break;
                case 'Longest ETD':
                    return b[3] - a[3];
                    break;
                case 'Spread':
                    return a[4] - b[4];
                    break;
                case 'Max Damage':
                    return b[5] - a[5];
                    break;
                case 'Min Damage':
                    return a[5] - b[5];
                    break;
                case 'ETD Maintain':
                    if (a[7] < b[7]){
                        return 1;
                    } else if (a[7] > b[7]){
                        return -1;
                    } else {
                        return 0;
                    }
                    break;
            }
        });    
        if (!this.option.avoid_behind){
            best = list[0];
        } else {
            for (i=0; i <= list.length - 1; i++){
                if (((list[i][3]/3600000) - (list[i][6]/3600000)).round(0) <= this.option.avoid_hours ){
                    best = list[i];
                    break;
                }
            }
        }
    }
    delete list;
    if (best) {
        uid  = best[0];
        type = best[1];
    }

    this.runtime.uid = uid;
    this.runtime.type = type;
    if (uid && type) {        
        this.runtime.stamina = (this.types[type].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[type].raid) ? 5 : (this.option.minstamina < Math.min.apply( Math, this.types[type].attacks) || this.option.maxstamina < Math.min.apply( Math, this.types[type].attacks)) ? Math.min.apply( Math, this.types[type].attacks): (this.option.minstamina > Math.max.apply( Math, this.types[type].attacks)) ? Math.max.apply( Math, this.types[type].attacks) : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
        this.runtime.health = this.types[type].raid ? 13 : 10; // Don't want to die when attacking a raid        
        this.runtime.energy = (!this.types[type].defends) ? 10 : (this.option.minenergy < Math.min.apply( Math, this.types[type].defends) || this.option.maxenergy < Math.min.apply( Math, this.types[type].defends)) ? Math.min.apply( Math, this.types[type].defends) : (this.option.minenergy > Math.max.apply( Math, this.types[type].defends)) ? Math.max.apply( Math, this.types[type].defends) : (this.option.minenergy > this.option.maxenergy) ? this.option.maxenergy : this.option.minenergy;
        if(this.option.fortify_active && (typeof this.data[uid][type].mclass === 'undefined' || this.data[uid][type].mclass < 2) && ((typeof this.data[uid][type].attackbonus !== 'undefined' && this.data[uid][type].attackbonus < this.option.fortify && this.data[uid][type].defense < 100))) {
            this.runtime.fortify = true;
        } else if (this.option.fortify_active && typeof this.data[uid][type].mclass !== 'undefined' && this.data[uid][type].mclass > 1 && typeof this.data[uid][type].secondary !== 'undefined' && this.data[uid][type].secondary < 100){
            this.runtime.fortify = true;
        } else {
            this.runtime.fortify = false;
        }
        if (Queue.burn.energy < this.runtime.energy) {
            this.runtime.fortify = false;
        }
        this.runtime.attack = true;        
        if ((Player.get('health') > this.runtime.health) && ((Queue.burn.stamina > this.runtime.stamina) || (this.runtime.fortify && Queue.burn.energy > this.runtime.energy ))){
            Dashboard.status(this, (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (this.runtime.fortify && Queue.burn.energy < this.runtime.energy ){
            Dashboard.status(this,'Waiting for ' + ((LevelUp.runtime.running && LevelUp.option.enabled) ? (this.runtime.energy - Queue.burn.energy) : Math.max((this.runtime.energy - Queue.burn.energy),(this.runtime.energy + Queue.option.energy - Player.get('energy')),(Queue.option.start_energy - Player.get('energy')))) + ' energy to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Queue.burn.stamina < this.runtime.stamina){
            Dashboard.status(this,'Waiting for ' + ((LevelUp.runtime.running && LevelUp.option.enabled) ? (this.runtime.stamina - Queue.burn.stamina) : Math.max((this.runtime.stamina - Queue.burn.stamina),(this.runtime.stamina + Queue.option.stamina - Player.get('stamina')),(Queue.option.start_stamina - Player.get('stamina')))) + ' stamina to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Player.get('health') < this.runtime.health){
            Dashboard.status(this,'Waiting for ' + (this.runtime.health - Player.get('health')) + ' health to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        }
    } else {
        this.runtime.attack = false;
        this.runtime.fortify = false;
        Dashboard.status(this, 'Nothing to do.');
    }
};

Monster.work = function(state) {
    var i, j, target_info = [], battle_list, list = [], uid = this.runtime.uid, type = this.runtime.type, btn = null, b, max;

    if (!this.runtime.check && ((!this.runtime.fortify || Queue.burn.energy < this.runtime.energy || Player.get('health') < 10) && (!this.runtime.attack || Queue.burn.stamina < this.runtime.stamina || Player.get('health') < this.runtime.health))) {
        return QUEUE_FINISH;
    }
    if (!state) {
        return QUEUE_CONTINUE;
    }
    if (this.runtime.check) { // Parse pages of monsters we've not got the info for
        for (i in this.data) {
            for (j in this.data[i]) {
                if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || this.data[i][j].last < Date.now() - this.option.check_interval) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore)) {
                    debug( 'Reviewing ' + this.data[i][j].name + '\'s ' + this.types[j].name)
                    Page.to(this.types[j].raid ? 'battle_raid' : 'keep_monster', '?user=' + i + (this.types[j].mpool ? '&mpool='+this.types[j].mpool : ''));
                    return QUEUE_CONTINUE;
                }
            }
        }
        this.runtime.check = false;
        debug( 'Finished Monster / Raid review')
        return QUEUE_RELEASE;
    }
    if (this.types[type].raid) { // Raid has different buttons and generals
        if (!Generals.to((this.option.raid.search('Invade') == -1) ? 'raid-duel' : 'raid-invade')) {
            return QUEUE_CONTINUE;
        }       
        switch(this.option.raid) {
            case 'Invade':
                btn = $('input[src$="raid_attack_button.gif"]:first');
                break;
            case 'Invade x5':
                btn = $('input[src$="raid_attack_button3.gif"]:first');
                break;
            case 'Duel':
                btn = $('input[src$="raid_attack_button2.gif"]:first');
                break;
            case 'Duel x5':
                btn = $('input[src$="raid_attack_button4.gif"]:first');
                break;
        }
    } else {
        if (this.data[uid][type].button_fail <= 10 || !this.data[uid][type].button_fail){
            //Primary method of finding button.
            j = (this.runtime.fortify && Queue.burn.energy >= this.runtime.energy) ? 'fortify' : 'attack';
            if (!Generals.to(j)) {
                return QUEUE_CONTINUE;
            }
            debug('Try to ' + j + ' [UID=' + uid + ']' + this.data[uid][type].name + '\'s ' + this.types[type].name);
            switch(j){
                case 'fortify':
                    if (!btn && this.option.maxenergy < this.types[type].defends[0]){
                        btn = $(this.types[type].def_btn).eq(0);
                    } else {
                        b = $(this.types[type].def_btn).length - 1;
                        for (i=b; i >= 0; i--){                            
                            //debug('Burn Energy is ' + Queue.burn.energy);
                            if (this.types[type].defends[i] <= this.option.maxenergy && Queue.burn.energy >= this.types[type].defends[i] ){
                                //debug('Button cost is ' + this.types[type].defends[i]);
                                btn = $(this.types[type].def_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
				case 'attack':
                    if (!btn && this.option.maxstamina < Math.min.apply( Math, this.types[type].attacks)){
                        btn = $(this.types[type].atk_btn).eq(0).name;
                    } else {                        
                        b = $(this.types[type].atk_btn).length - 1;
                        //debug('B = ' + b);
                        for (i=b; i >= 0; i--){                           
                            //debug('Burn Stamina is ' + Queue.burn.stamina);
                            if (this.types[type].attacks[i] <= this.option.maxstamina && Queue.burn.stamina >= this.types[type].attacks[i]){
                                //debug('Button cost is ' + this.types[type].attacks[i]);
                                btn = $(this.types[type].atk_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
                default:
					break;
            }
        }
        if (!btn || !btn.length){
            this.data[uid][type].button_fail = this.data[uid][type].button_fail + 1;
        }
        if (this.data[uid][type].button_fail > 10){
            log('Ignoring Monster ' + this.data[uid][type].name + '\'s ' + this.types[type].name + this.data[uid][type] + ': Unable to locate ' + j + ' button ' + this.data[uid][type].button_fail + ' times!');
            this.data[uid][type].ignore = true;
            this.data[uid][type].button_fail = 0
        }
    }
    if (!btn || !btn.length || (Page.page !== 'keep_monster_active' && Page.page !== 'keep_monster_active2') || ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') != uid && $('div[style*="nm_top"] img[linked]').attr('uid') != uid)) {
        //debug('Reloading page. Button = ' + btn.attr('name'));
        //debug('Reloading page. Page.page = '+ Page.page);
        //debug('Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (this.types[type].mpool ? '&mpool='+this.types[type].mpool : ''));
        return QUEUE_CONTINUE; // Reload if we can't find the button or we're on the wrong page
    }
    if (this.option.assist && typeof $('input[name*="help with"]') !== 'undefined' && (typeof this.data[uid][type].phase === 'undefined' || $('input[name*="help with"]').attr('title').regex(/ (.*)/i) !== this.data[uid][type].phase)){
        debug('Current Siege Phase is: '+ this.data[uid][type].phase);
        this.data[uid][type].phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
        debug('Found a new siege phase ('+this.data[uid][type].phase+'), assisting now.');
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + '&action=doObjective' + (this.types[type].mpool ? '&mpool=' + this.types[type].mpool : '') + '&lka=' + i + '&ref=nf');
        return QUEUE_RELEASE;
    }
    if (this.types[type].raid) {
        battle_list = Battle.get('user')
        if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
            for (i in battle_list) {
                list.push(i);
            }
            $('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
        }
        target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
        if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio)) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio))){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
            log('No valid Raid target!');
            Page.to('battle_raid', ''); // Force a page reload to change the targets
            return QUEUE_CONTINUE;
        }
    }
    this.runtime.uid = this.runtime.type = null; // Force us to choose a new target...
    //debug('Clicking Button ' + btn.attr('name'));
    Page.click(btn);
    this.data[uid][type].button_fail = 0;
    return QUEUE_RELEASE;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
    var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
        engage:0,
        assist:1,
        reward:2,
        complete:3
    }, blank;
    if (typeof sort === 'undefined') {
        this.order = [];
        for (i in this.data) {
            for (j in this.data[i]) {
                this.order.push([i, j]);
            }
        }
    }
    if (typeof sort === 'undefined') {
        sort = (this.runtime.sort || 1);
    }
    if (typeof rev === 'undefined'){
        rev = (this.runtime.rev || false);
    }
    this.runtime.sort = sort;
    this.runtime.rev = rev;
    this.order.sort(function(a,b) {
        var aa, bb;
        if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
            return 1;
        }
        if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
            return -1;
        }
        if (typeof sorttype[sort] === 'string') {
            aa = Monster.data[a[0]][a[1]][sorttype[sort]];
            bb = Monster.data[b[0]][b[1]][sorttype[sort]];
        } else if (sort == 4) { // damage
            //			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
            //			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
            if (typeof Monster.data[a[0]][a[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                aa = sum((Monster.data[a[0]][a[1]].damage[userID] / Monster.data[a[0]][a[1]].total));
            }
            if (typeof Monster.data[b[0]][b[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                bb = sum((Monster.data[b[0]][b[1]].damage[userID] / Monster.data[b[0]][b[1]].total));
            }
        }
        if (typeof aa === 'undefined') {
            return 1;
        } else if (typeof bb === 'undefined') {
            return -1;
        }
        if (typeof aa === 'string' || typeof bb === 'string') {
            return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
        }
        return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
    });
    th(output, '');
    th(output, 'User');
    th(output, 'Health', 'title="(estimated)"');
    th(output, 'Att Bonus', 'title="Composite of Fortification or Dispel into an approximate attack bonus (+50%...-50%)."');
    //	th(output, 'Shield');
    th(output, 'Damage');
    th(output, 'Time Left');
    th(output, 'Kill In (ETD)', 'title="(estimated)"');
    th(output, '');
    list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
    for (o=0; o<this.order.length; o++) {
        i = this.order[o][0];
        j = this.order[o][1];
        if (!this.types[j]) {
            continue;
        }
        output = [];
        monster = this.data[i][j];
        blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
        // http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
        // http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
        // http://apps.facebook.com/castle_age/raid.php?user=00000
        // http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
        if (Monster.option.assist_link && (monster.state === 'engage' || monster.state === 'assist')) {
            url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
        } else {
            url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
        }
        td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><img src="' + imagepath + Monster.types[j].list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + j + '"><strong class="overlay">' + monster.state + '</strong></a>', 'title="' + Monster.types[j].name + '"');
        var image_url = imagepath + Monster.types[j].list;
        //debug(image_url);
        th(output, '<a class="golem-monster-ignore" name="'+i+'+'+j+'" title="Toggle Active/Inactive"'+(Monster.data[i][j].ignore ? ' style="text-decoration: line-through;"' : '')+'>'+Monster.data[i][j].name+'</a>');
        td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + monster.health.round(1) + '%)');
        td(output, blank ? '' : isNumber(monster.attackbonus) ? (monster.attackbonus.round(1))+'%' : '', (isNumber(monster.strength) ? 'title="Max: '+((monster.strength-50).round(1))+'%"' : ''));
        td(output, blank ? '' : monster.state !== 'engage' ? '' : (typeof monster.damage[userID] === 'undefined') ? '' : addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(2) + '%)', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
        td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
        td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
        th(output, '<a class="golem-monster-delete" name="'+i+'+'+j+'" title="Delete this Monster from the dashboard">[x]</a>');
        tr(list, output.join(''));
    }
    list.push('</tbody></table>');
    $('#golem-dashboard-Monster').html(list.join(''));
    $('a.golem-monster-delete').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        delete Monster.data[x[0]][x[1]];
        if (!length(Monster.data[x[0]])) {
            delete Monster.data[x[0]];
        }
        Monster.dashboard();
        return false;
    });
    $('a.golem-monster-ignore').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        Monster.data[x[0]][x[1]].ignore = !Monster.data[x[0]][x[1]].ignore;
        Monster.dashboard();
        if (Page.page !== 'keep_monster'){
            Page.to('keep_monster');
        } else {
            Page.to('index');
        }
        return false;
    });
    if (typeof sort !== 'undefined') {
        $('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
    }
};

/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = null;
News.option = null;

News.defaults = {
	castle_age:{
		pages:'index'
	}
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, order, last_time = this.runtime.last;
		News.runtime.last = Date.now();
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/([0-9]+) days/i), hours = title.regex(/([0-9]+) hours/i), minutes = title.regex(/([0-9]+) minutes/i), seconds = title.regex(/([0-9]+) seconds/i), time, my_xp = 0, my_bp = 0, my_cash = 0;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0}
				var result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/([0-9]+) experience/i);
					my_bp = txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = txt.regex(/\$([0-9]+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/([0-9]+) experience/i);
					my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = 0 - txt.regex(/\$([0-9]+)/i);
					result = 'loss';
				}
				if (time > last_time) {
//					debug('Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'income+battle'], my_cash);
					switch (result) {
						case 'win':
							History.add([time, 'battle+win'], 1);
							break;
						case 'loss':
							History.add([time, 'battle+loss'], -1)
							break;
					}
				}
				xp += my_xp;
				bp += my_bp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
			list.push('');
			user = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (i in user) {
				list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + (user[i].win>1?'s':'') : '') + (user[i].lose ? (user[i].win ? ' and ' : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + (user[i].lose>1?'s':'') : '') + '.');
			}
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};

/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = null;

Player.settings = {
	keep:true
};

Player.defaults = {
	castle_age:{
		pages:'*'
	}
};

Player.runtime = {
	cash_timeout:null,
	energy_timeout:null,
	health_timeout:null,
	stamina_timeout:null
};

var use_average_level = false;

Player.init = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	this.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
	this.runtime.cash_timeout = null;
	this.runtime.energy_timeout = null;
	this.runtime.health_timeout = null;
	this.runtime.stamina_timeout = null;
};

Player.parse = function(change) {
	var data = this.data, keep, stats, tmp, energy_used = 0, stamina_used = 0;
	if ($('#app'+APPID+'_energy_current_value').length) {
		tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.energy		= tmp[0] || 0;
//		data.maxenergy	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_health_current_value').length) {
		tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.health		= tmp[0] || 0;
//		data.maxhealth	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_stamina_current_value').length) {
		tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.stamina	= tmp[0] || 0;
//		data.maxstamina	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_st_2_5 strong:not([title])').length) {
		tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.exp		= tmp[0] || 0;
		data.maxexp		= tmp[1] || 0;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.level		= $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.maxenergy = $(stats).eq(0).text().regex(/([0-9]+)/);
			data.maxstamina = $(stats).eq(1).text().regex(/([0-9]+)/);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.maxhealth = $(stats).eq(4).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
			data.maxincome = stats[0];
			data.upkeep = stats[1];
			data.income = stats[2];
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$([0-9]+).*Cost|stealsGold:\+\$([0-9]+)|Youreceived\$([0-9]+)|Yougained\$([0-9]+)/i)));
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$([0-9]+)gold|backinthemine:Extra([0-9]+)Gold/i)));
		}
	});
	if ($('#app'+APPID+'_energy_time_value').length) {
		window.clearTimeout(this.runtime.energy_timeout);
		this.runtime.energy_timeout = window.setTimeout(function(){Player.get('energy');}, $('#app'+APPID+'_energy_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_health_time_value').length) {
		window.clearTimeout(this.runtime.health_timeout);
		this.runtime.health_timeout = window.setTimeout(function(){Player.get('health');}, $('#app'+APPID+'_health_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_stamina_time_value').length) {
		window.clearTimeout(this.runtime.stamina_timeout);
		this.runtime.stamina_timeout = window.setTimeout(function(){Player.get('stamina');}, $('#app'+APPID+'_stamina_time_value').text().parseTimer() * 1000);
	}
	return false;
};

Player.update = function(type) {
	if (type !== 'option') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(Player.data['max'+types[j]])
			for (i=0; i<=Player.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	}
	Dashboard.status(this, 'Income: $' + addCommas(Math.max(this.data.income, (History.get('land.average.1') + History.get('income.average.24')).round())) + ' per hour (currently $' + addCommas(History.get('land.average.1')) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, now = Date.now();
	switch(what) {
		case 'cash':			return (this.data.cash = parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10));
		case 'cash_timer':		return $('#app'+APPID+'_gold_time_value').text().parseTimer();
//		case 'cash_timer':		var when = new Date();
//								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':			return (this.data.energy = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'energy_timer':	return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':			return (this.data.health = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'health_timer':	return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':			return (this.data.stamina = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'stamina_timer':	return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'pause':			return (Queue.get('option.pause') ? '(Paused) ' : '');
		default: return this._get(what);
	}
};

/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions');

Potions.defaults = {
	castle_age:{
		pages:'*'
	}
};

Potions.option = {
	energy:35,
	stamina:35
};

Potions.runtime = {
	drink:false
};

Potions.display = [
	{
		id:'energy',
		label:'Maximum Energy Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.data['Energy'] = (Potions.data['Energy'] || 0) + 1;
	});
	if (Page.page === 'keep_stats') {
		this.data = {}; // Reset potion count completely at the keep
		$('.statsT2:eq(2) .statUnit').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
			if (info && info[0] && info[1]) {
				Potions.data[info[0]] = info[1];
			}
		});
	}
	return false;
};

Potions.update = function(type) {
	var txt = [], levelup = LevelUp.get('runtime.running');
	this.runtime.drink = false;
	for(var i in this.data) {
		if (this.data[i]) {
			txt.push(i + ': ' + this.data[i] + '/' + this.option[i.toLowerCase()]);
		}
		if (!levelup && typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()] && (Player.get(i.toLowerCase()) || 0) < (Player.get('max' + i.toLowerCase()) || 0)) {
			this.runtime.drink = true;
		}
	}
	Dashboard.status(this, txt.join(', '));
};

Potions.work = function(state) {
	if (!this.runtime.drink) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_stats')) {
		return QUEUE_CONTINUE;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			debug('Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
	return QUEUE_RELEASE;
};

/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.defaults = {
	castle_age:{
		pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_demiquests quests_atlantis'
	}
};

Quest.option = {
	general:true,
	what:'Influence',
	unique:true,
	monster:true,
	bank:true
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Once you have unlocked all areas (Advancement) it will switch to Influence. Once you have 100% Influence it will switch to Experience'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify Monsters First',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
};

Quest.parse = function(change) {
	var quest = this.data, area = null, land = null, i;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
	}
	for (i in quest) {
		if (quest[i].area === area && (area !== 'quest' || quest[i].land === land)) {
//			debug('Deleting ' + i + '(' + (Quest.land[quest[i].land] || quest[i].area) + ')');
			delete quest[i];
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy, tmp, type = 0;
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken page load quests
			return;
		}
		quest[name] = {};
		quest[name].area = area;
		quest[name].type = type;
		if (typeof land === 'number') {
			quest[name].land = land;
		}
		if (typeof influence === 'number') {
			quest[name].level = (level || 0);
			quest[name].influence = influence;
		}
		quest[name].exp = reward[0];
		quest[name].reward = (reward[1] + reward[2]) / 2;
		quest[name].energy = energy;
		if (type !== 2) { // That's everything for subquests
			if (type === 3) { // Special / boss quests create unique items
				quest[name].unique = true;
			}
			tmp = $('.qd_1 img', el).last();
			if (tmp.length && tmp.attr('title')) {
				quest[name].item	= tmp.attr('title').trim();
				quest[name].itemimg	= tmp.attr('src').filepart();
			}
			units = {};
			$('.quest_req >div >div >div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (length(units)) {
				quest[name].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				quest[name].general = tmp.attr('title');
			}
		}
	});
	this.data = sortObject(quest, function(a,b){return a > b;});// So they always appear in the same order
	return false;
};

Quest.update = function(type,worker) {
	if (worker === Town && type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, best = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, list = [], quests = this.data;
	if (!type || type === 'data') {
		for (i in quests) {
			if (quests[i].item && !quests[i].unique) {
				list.push(quests[i].item);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Influence', 'Advancement', 'Experience', 'Cash'].concat(unique(list).sort()));
	}
	// Now choose the next quest...
	if (this.option.unique && Alchemy._changed > this.lastunique) {// Only checking for unique if the Alchemy data has changed - saves CPU
		for (i in quests) {
			if (quests[i].unique) {
				if (!Alchemy.get(['ingredients', quests[i].itemimg]) && (!best || quests[i].energy < quests[best].energy)) {
					best = i;
				}
			}
		}
		this.lastunique = Date.now();
	}
	if (!best && this.option.what !== 'Nothing') {
//		debug('option = ' + this.option.what);
//		best = (this.runtime.best && quests[this.runtime.best] && (quests[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in quests) {
			if (quests[i].units && (typeof quests[i].own === 'undefined' || (quests[i].own === false && worker === Town))) {// Only check for requirements if we don't already know about them
				own = 0, need = 0;
				for (unit in quests[i].units) {
					own += Town.get([unit, 'own']) || 0;
					need += quests[i].units[unit];
				}
				quests[i].own = (own >= need);
				if (!quests[i].own) { // Can't do a quest because we don't have all the items...
//					debug('Can\'t do "'+i+'" because we don\'t have the items...');
					this._watch(Town); // Watch Town for updates...
					continue;
				}
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (quests[i].type !== 2 && typeof quests[i].land === 'number' && quests[i].land >= best_land && (quests[i].influence < 100 || (quests[i].unique && !Alchemy.get(['ingredients', quests[i].itemimg]))) && (!best_advancement || quests[i].land > (quests[best_advancement].land || 0) || (quests[i].land === quests[best_advancement].land && (quests[i].unique && !length(Player.data[quests[i].item]))))) {
						best_land = Math.max(best_land, quests[i].land);
						best_advancement = i;
					}
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					if (typeof quests[i].influence !== 'undefined' && quests[i].influence < 100 && (!best_influence || quests[i].energy < quests[best_influence].energy)) {
						best_influence = i;
					}
				case 'Experience': // Find the best exp per energy quest
					if (!best_experience || (quests[i].energy / quests[i].exp) < (quests[best_experience].energy / quests[best_experience].exp)) {
						best_experience = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					if (!best || (quests[i].energy / quests[i].reward) < (quests[best].energy / quests[best].reward)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					if (quests[i].item === this.option.what && (!best || quests[i].energy < quests[best].energy)) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = quests[best].energy;
			debug('Wanting to perform - ' + best + ' in ' + (typeof quests[best].land === 'number' ? this.land[quests[best].land] : this.area[quests[best].area]) + ' (energy: ' + quests[best].energy + ', experience: ' + quests[best].exp + ', reward: $' + addCommas(quests[best].reward) + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (typeof quests[best].land === 'number' ? this.land[quests[best].land] : this.area[quests[best].area]) + ': ' + best + ' (energy: ' + quests[best].energy + ', experience: ' + quests[best].exp + ', reward: $' + addCommas(quests[best].reward) + (typeof quests[best].influence !== 'undefined' ? (', influence: ' + quests[best].influence + '%)') : ''));
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var i, j, general = null, best = this.runtime.best;
	if (!best || this.runtime.energy > Queue.burn.energy) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return QUEUE_FINISH;
	}
	if (this.option.monster && Monster.data) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense < Monster.option.fortify) {
					return QUEUE_FINISH;
				}
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].dispel === 'number' && Monster.data[i][j].dispel > Monster.option.dispel) {
					return QUEUE_FINISH;
				}
			}
		}
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.option.general) {
		if (this.data[best].general && typeof this.data[best].influence === 'number' && this.data[best].influence < 100) {
			if (!Generals.to(this.data[best].general)) 
			{
				return QUEUE_CONTINUE;
			}
		} else {
			switch(this.option.what) {
				case 'Influence':
				case 'Advancement':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && this.data[best].influence < 100) {
						general = Generals.best('influence');
					}
					break;
				case 'Cash':
					general = Generals.best('cash');
					break;
				default:
					general = Generals.best('item');
					break;
			}
			if (!Generals.to(general)) {
				return QUEUE_CONTINUE;
			}
		}
	}
	switch(this.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data[best].land + 1))) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return QUEUE_CONTINUE;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return QUEUE_CONTINUE;
			}
			break;
		default:
			log('Can\'t get to quest area!');
			return QUEUE_FINISH;
	}
	debug('Performing - ' + best + ' (energy: ' + this.data[best].energy + ')');
	if (!Page.click('div.action[title^="' + best + ':"] input[type="image"], div.action[title^="' + best + ' :"] input[type="image"]')) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		debug('Can\'t find button for ' + best + ', so deleting and re-visiting page...');
		delete this.data[best];
		Page.reload();
	}
	if (this.option.unique && this.data[best].unique && !Alchemy.get(['ingredients', this.data[i].itemimg])) {
		Alchemy.set(['ingredients', this.data[i].itemimg], 1)
	}
	if (this.option.what === 'Advancement' && this.data[best].unique) { // If we just completed a boss quest, check for a new quest land.
		if (this.data[best].land < 6) {	// There are still lands to explore
			Page.to('quests_quest' + (this.data[best].land + 2));
		}
	}
	return QUEUE_RELEASE;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		switch(sort) {
			case 0:	// general
				return Quest.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return typeof Quest.data[q].land === 'number' && typeof Quest.land[Quest.data[q].land] !== 'undefined' ? Quest.land[Quest.data[q].land] : Quest.area[Quest.data[q].area];
			case 3: // level
				return (typeof Quest.data[q].level !== 'undefined' ? Quest.data[q].level : -1) * 100 + (Quest.data[q].influence || 0);
			case 4: // energy
				return Quest.data[q].energy;
			case 5: // exp
				return Quest.data[q].exp / Quest.data[q].energy;
			case 6: // reward
				return Quest.data[q].reward / Quest.data[q].energy;
			case 7: // item
				return Quest.data[q].item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		td(output, Generals.get([this.data[i].general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([this.data[i].general, 'img']) + '" alt="' + this.data[i].general + '" title="' + this.data[i].general + '">' : '');
		th(output, i);
		td(output, typeof this.data[i].land === 'number' ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, typeof this.data[i].level !== 'undefined' ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
		td(output, this.data[i].energy);
		td(output, (this.data[i].exp / this.data[i].energy).round(2), 'title="' + this.data[i].exp + ' total, ' + (this.data[i].exp / this.data[i].energy * 12).round(2) + ' per hour"');
		td(output, '$' + addCommas((this.data[i].reward / this.data[i].energy).round()), 'title="$' + addCommas(this.data[i].reward) + ' total, $' + addCommas((this.data[i].reward / this.data[i].energy * 12).round()) + ' per hour"');
		td(output, this.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + this.data[i].itemimg + '" alt="' + this.data[i].item + '" title="' + this.data[i].item + '">' : '');
		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Title.option = {
	enabled:false,
	title:"CA: {Queue:runtime.current} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.display = [
	{
		id:'enabled',
		label:'Change Window Title',
		checkbox:true
	},{
		id:'title',
		text:true,
		size:24
	},{
		title:'Useful Values',
		info:'{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{Queue:runtime.current} - Activity'
	}
];

Title.old = null; // Old title, in case we ever have to change back

Title.init = function() {
	this._watch(Player);
};

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(type) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		for (i in parts) {
			tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
			output += tmp[0];
			if (tmp[1]) {
				worker = Player;
				what = tmp[1].split(':');// if option is "worker:value" then deal with it here
				if (what[1]) {
					worker = WorkerByName(what.shift());
				}
				if (worker) {
					value = worker.get(what[0]);
					output += typeof value === 'number' ? addCommas(value) : typeof value === 'string' ? value : '';
					this._watch(worker); // Doesn't matter how often we add, it's only there once...
				} else {
					debug('Bad worker specified = "' + tmp[1] + '"');
				}
			}
		}
		if (!this.old) {
			this.old = document.title;
		}
		document.title = output;
	} else if (this.old) {
		document.title = this.old;
		this.old = null;
	}
};

/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.data = {};

Town.defaults = {
	castle_age:{
		pages:'town_soldiers town_blacksmith town_magic'
	}
};

Town.option = {
	general:true,
	number:'Minimum',
	maxcost:'$100k',
	units:'All',
	sell:false
};

Town.runtime = {
	best:null,
	buy:0,
	cost:0
};

Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'number',
		label:'Buy Number',
		select:['None', 'Minimum', 'Match Army', 'Maximum'],
		help:'Minimum will buy before any quests (otherwise only bought when needed), Maximum will buy 501 (depending on generals)'
	},{
		advanced:true,
		id:'maxcost',
		label:'Maximum Buy Cost',
		select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b']
	},{
		advanced:true,
		id:'units',
		label:'Buy Type',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	},{
		advanced:true,
		id:'sell',
		label:'Auto-Sell<br>(Not enabled)',
		checkbox:true
	}
];

Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|cleaver|cudgel|dagger|halberd|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
	Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|raiments|robe|Blood Vestment|Garlans Battlegear|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|heart|insignia|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Thawing Star/i
};

Town.init = function() {
	if (this.data.soldiers || this.data.blacksmith || this.data.magic) { // Need to reparse with new code...
		this.data = {};
		Page.set('town_soldiers', 0);
		Page.set('town_blacksmith', 0);
		Page.set('town_magic', 0);
	}
};

Town.parse = function(change) {
	if (!change) {
		var unit = Town.data, page = Page.page.substr(5);
		$('tr.eq_buy_row,tr.eq_buy_row2').each(function(a,el){
			// Fix for broken magic page!!
			!$('div.eq_buy_costs_int', el).length && $('div.eq_buy_costs', el).prepend('<div class="eq_buy_costs_int"></div>').children('div.eq_buy_costs_int').append($('div.eq_buy_costs >[class!="eq_buy_costs_int"]', el));
			!$('div.eq_buy_stats_int', el).length && $('div.eq_buy_stats', el).prepend('<div class="eq_buy_stats_int"></div>').children('div.eq_buy_stats_int').append($('div.eq_buy_stats >[class!="eq_buy_stats_int"]', el));
			!$('div.eq_buy_txt_int', el).length && $('div.eq_buy_txt', el).prepend('<div class="eq_buy_txt_int"></div>').children('div.eq_buy_txt_int').append($('div.eq_buy_txt >[class!="eq_buy_txt_int"]', el));
			var i, stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, '');
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $('span:first-child', costs).text().regex(/Owned: ([0-9]+)/i);
			unit[name].att = $('div.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
			unit[name].def = $('div.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				unit[name].buy = [];
				$('select[name="amount"]:first option', costs).each(function(i,el){
					unit[name].buy.push(parseInt($(el).val(), 10));
				});
			}
			if (page === 'blacksmith') {
				for (i in Town.blacksmith) {
					if (name.match(Town.blacksmith[i])) {
						unit[name].type = i;
					}
				}
			}
		});
	} else if (Page.page==='town_blacksmith') {
		$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
			var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
			if (Town.data[name].type) {
				$el.parent().append('<br>'+Town.data[name].type);
			}
		});
	}
	return true;
};

Town.getInvade = function(army) {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	return {attack:att, defend:def};
};

Town.update = function(type) {
	var i, u, best = null, buy = 0, data = this.data, quests, army = Player.get('army'), max = (this.option.number === 'Match Army' ? army : (this.option.number === 'Maximum' ? 501 : 0));
	this.runtime.invade = this.getInvade(army);
	this.runtime.duel = this.getDuel();
	if (this.option.number !== 'None') {
		quests = Quest.get();
		for (i in quests) {
			if (quests[i].units) {
				for (u in quests[i].units) {
					if (data[u] && data[u].cost && data[u].own < quests[i].units[u]) {
						best = u;
						buy = quests[i].units[u] - data[u].own;
					}
				}
			}
		}
	}
	/*
//		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
	if (max && !best) {
		for (i in data) {
			if (data[i].cost && data[i].own < max) {
				best = Math.max(data[u].need, max - data[u].own);
			}
		}
	}
	*/
	this.runtime.best = best;
	if (best) {
		this.runtime.buy = buy;
		this.runtime.cost = buy * data[best].cost;
		Dashboard.status(this, 'Want to buy ' + buy + ' x ' + best + ' for $' + addCommas(this.runtime.cost));
	} else {
		Dashboard.status(this);
	}
};

Town.work = function(state) {
	var qty;
	if (!this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		return QUEUE_FINISH;
	}
	if (!state || !this.buy(this.runtime.best, this.runtime.buy)) {
		return QUEUE_CONTINUE;
	}
	return QUEUE_RELEASE;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].buy || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || (this.data[item].page === 'soldiers' && !Generals.to('cost')) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var i, qty = 0;
	for (i=0; i<this.data[item].buy.length && this.data[item].buy[i] <= number; i++) {
		qty = this.data[item].buy[i];
	}
	$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
			debug('Buying ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost));
			$('div.eq_buy_costs select[name="amount"]:eq(0)', el).val(qty);
			Page.click($('div.eq_buy_costs input[name="Buy"]', el));
		}
	});
	return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {Weapon:1, Shield:2, Helmet:3, Armor:4, Amulet:5, Gloves:6, Magic:7};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header">'+name+'</h3><div class="golem-panel-content">');
	}
	for (i in list) {
		unitfunc(units, i, list);
	}
	if (list[units[0]]) {
		if (type === 'duel' && list[units[0]].type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type];
			});
		} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
			units.sort(function(a,b) {
				return (list[b][type][x] || 0) - (list[a][type][x] || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'') + '</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), duel = {}, best;
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};

/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = null;

Upgrade.defaults = {
	castle_age:{
		pages:'keep_stats'
	}
};

Upgrade.option = {
	order:[]
};

Upgrade.runtime = {
	working:false,
	run:0
};

Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];

Upgrade.init = function() {
	if (this.option.run) {
		this.runtime.run = this.option.run;
		delete this.option.run;
	}
	if (this.option.working) {
		this.runtime.working = this.option.working;
		delete this.option.working;
	}
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.runtime.working = false;
		this.runtime.run++;
	}
	return false;
};

Upgrade.work = function(state) {
	var points = Player.get('upgrade'), btn;
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	if (!this.option.order.length || !points || (this.option.order[this.runtime.run]==='Stamina' && points<2)) {
		return QUEUE_FINISH;
	}
	if (!state || !Page.to('keep_stats')) {
		return QUEUE_CONTINUE;
	}
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	btn = 'a[href$="?upgrade=energy_max"]';	break;
		case 'Stamina':	btn = 'a[href$="?upgrade=stamina_max"]';break;
		case 'Attack':	btn = 'a[href$="?upgrade=attack"]';		break;
		case 'Defense':	btn = 'a[href$="?upgrade=defense"]';	break;
		case 'Health':	btn = 'a[href$="?upgrade=health_max"]';	break;
		default: this.runtime.run++; return true; // Should never happen
	}
	if (Page.click(btn)) {
		this.runtime.working = true;
	} else {
		Page.reload(); // Only get here if we can't click!
	}
	return QUEUE_RELEASE;
};

/********** Worker.Caap() **********
* Caap compatibility code
*/
var Caap = new Worker('Caap', 'keep_eliteguard army_viewarmy battle_arena');
Caap.data = {};

Caap.init = function() { 
};

//overload unflush
Worker.prototype._oldunflush = Worker.prototype._unflush;
Worker.prototype._unflush = function() {
	this._oldunflush();
	if (typeof this.caap_values != 'undefined') {
		for (i in this.caap_values) {
			this.option[i] = gm.getValue(this.caap_values[i]);
		}
	}
	(typeof this.caap_load == 'function') && this.caap_load();
}; 

Elite.caap_load = function() {
	this.option.prefer = gm.getListFromText('EliteArmyList');
	this.option.elite = gm.getValue('AutoElite', false);
	this.option.every = 1;
};

Land.caap_values = {
	'enabled':	'autoBuyLand',
	'sell':		'SellLands'
};

Bank.caap_values = {
	'above':	'MaxInCash',
	'hand':		'MinInCash',
	'keep':		'minInStore'
};

Alchemy.caap_values = {
	'perform':	'AutoAlchemy',
	'hearts':	'AutoAlchemyHearts'
};

Alchemy.caap_load = function() {
	this.option.summon = true;
};

Queue.caap_load = function() {
	this.option.pause = false;
};

Heal.caap_values = {
	stamina: 	'MinStamToHeal',
	health: 	'MinToHeal'
};

Blessing.caap_values = {
	which:		'AutoBless'
};

Blessing.caap_load = function() {
	this.option.display = true;
};

