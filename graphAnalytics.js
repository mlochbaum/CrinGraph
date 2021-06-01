let analyticsSite = "Generic Graph site",           // Site name for attributing analytics events to your site
    logAnalytics = true;                            // If true, events are logged in console



// *************************************************************
// Functions to fire events
// *************************************************************

// For events related to specific phones, e.g. when a phone is displayed
function pushPhoneTag(eventName, p, trigger) {
    let eventTrigger = trigger ? trigger : "user",
        phoneBrand = p.dispBrand ? p.dispBrand : "Target",
        phoneModel = p.dispName,
        value = 1;
    
    // Write function here to push event with the values described above
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nTrigger:    "+ eventTrigger +"\nSite:       "+ analyticsSite +"\nPhone:      "+ phoneBrand +" "+ phoneModel); }
}



// For events not related to a specific phone, e.g. user clicked screenshot button
function pushEventTag(eventName, targetWindow, trigger) {
    let eventTrigger = trigger ? trigger : "user",
        url = targetWindow.location.href,
        par = "?share=",
        value = 1,
        activePhones = url.includes(par) ? decodeURI(url.replace(/_/g," ").split(par).pop().replace(/,/g, ", ")) : "null";
        
    // Write function here to push event with the values described above
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nTrigger:    "+ eventTrigger +"\nSite name:  "+ analyticsSite +"\nActive:     "+activePhones); }
}



if (logAnalytics) { console.log("... Analytics initialized ... "); }