let analyticsSite = "Generic Graph site",           // Site name for attributing analytics events to your site
    analyticsGa4Id = "G-M68DGTWYLX",                // GA4 ID used for analytics. If you don't already have one, you'll need to create a Google Analytics 4 account
    analyticsGtmId = "GTM-N74Z5L8",                 // GTM ID used for analytics. If you don't already have one, you'' need to create a Google Tag Manager account
    logAnalytics = true,                            // If true, events are logged in console
    analyticsVer = "1.0.6";                         // Number you can change to validate changes in console logs

// Load Google Tag Manager onto the page
function setupGraphAnalytics() {
    const gtmScriptContent = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','"+ analyticsGtmId +"');",
        gtmIframeSrc = "https://www.googletagmanager.com/ns.html?id="+ analyticsGtmId,
        gtmIframeStyle = "display: none; visibility: hidden;",
        graphAnalyticsSrc = "graphAnalytics.js";

    const pageHead = document.querySelector("head"),
          pageBody = document.querySelector("body"),
          gtmScript = document.createElement("script"),
          gtmNoscript = document.createElement("noscript"),
          gtmIframe = document.createElement("iframe"),
          graphAnalytics = document.createElement("script");

    gtmScript.textContent = gtmScriptContent;
    pageHead.prepend(gtmScript);
}
setupGraphAnalytics();

window.dataLayer = window.dataLayer || [];



// Functions to fire events
// For events related to specific phones, e.g. when a phone is displayed
function pushPhoneTag(eventName, p, trigger) {
    let eventTrigger = trigger ? trigger : "user",
        phoneBrand = p.dispBrand ? p.dispBrand : "Target",
        phoneModel = p.dispName,
        value = 1;
    
    window.dataLayer.push({
        "event" : eventName,
        "trigger" : eventTrigger,
        "site": analyticsSite,
        "phoneBrand": phoneBrand,
        "phoneModel": phoneModel,
        "phoneName" : phoneBrand + ' ' + phoneModel,
        "value": value
    });
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nTrigger:    "+ eventTrigger +"\nSite:       "+ analyticsSite +"\nPhone:      "+ phoneBrand +" "+ phoneModel); }
}

// For events not related to a specific phone, e.g. user clicked screenshot button
function pushEventTag(eventName, targetWindow, trigger) {
    let eventTrigger = trigger ? trigger : "user",
        url = targetWindow.location.href,
        par = "?share=",
        value = 1,
        activePhones = url.includes(par) ? decodeURI(url.replace(/_/g," ").split(par).pop().replace(/,/g, ", ")) : "null";
    
    window.dataLayer.push({
        "event" : eventName,
        "trigger" : eventTrigger,
        "site": analyticsSite,
        "activePhones": activePhones,
        "value": value
    });
    
    if (logAnalytics) { console.log("Event:      "+ eventName +"\nTrigger:    "+ eventTrigger +"\nSite name:  "+ analyticsSite +"\nActive:     "+activePhones); }
}

if (logAnalytics) { console.log("... Analytics initialized ... " + analyticsVer); }