let logAnalytics = true;

window.dataLayer = window.dataLayer || [];

// For events related to specific phones, e.g. when a phone is displayed
function pushPhoneTag(eventName, p) {
    let phoneBrand = p.dispBrand ? p.dispBrand : "Target",
        phoneModel = p.dispName,
        value = 1;
    
    window.dataLayer.push({
        "event" : eventName,
        "site": analyticsSite,
        "phoneBrand": phoneBrand,
        "phoneModel": phoneModel,
        "phoneName" : phoneBrand + ' ' + phoneModel,
        "value": value
    });
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nSite:       "+ analyticsSite +"\nPhone:      "+ phoneBrand +" "+ phoneModel); }
}

// For events not related to a specific phone, e.g. user clicked screenshot button
function pushEventTag(eventName, targetWindow) {
    let url = targetWindow.location.href,
        par = "?share=",
        value = 1,
        activePhones = url.includes(par) ? decodeURI(url.replace(/_/g," ").split(par).pop().replace(/,/g, ", ")) : "null";
    
    window.dataLayer.push({
        "event" : eventName,
        "site": analyticsSite,
        "activePhones": activePhones,
        "value": value
    });
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nSite name:  "+ analyticsSite +"\nActive:     "+activePhones); }
}

if (logAnalytics) { console.log("... Analytics initialized ..."); }