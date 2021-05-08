// Configuration options
const init_phones = ["HTH67"],                      // Optional. Which graphs to display on initial load. Note: Share URLs will override this set
      DIR = "data/",                                // Directory where graph files are stored
      data_format = "AudioTools",                   // Accepts "AudioTools," "REW," or "other"
      default_channels = ["L","R"],                 // Which channels to display. Avoid javascript errors if loading just one channel per phone
      default_normalization = "Hz",                 // Sets default graph normalization mode. Accepts "dB" or "Hz"
      default_norm_db = 60,                         // Sets default dB normalization point
      default_norm_hz = 500,                        // Sets default Hz normalization point (500Hz is recommended by IEC)
      max_channel_imbalance = 5,                    // ???
      alt_layout = false,                           // Toggle between classic and alt layouts
      share_url = true,                             // If true, enables shareable URLs
      watermark_text = "CrinGraph",                 // Optional. Watermark appears behind graphs
      watermark_image_url = "cringraph-logo.svg",   // Optional. If image file is in same directory as config, can be just the filename
      page_title = "CrinGraph";                     // Optional. Appended to the page title if share URLs are enabled

// Specify which targets to display
const targets = [
        { type:"Neutral"   , files:["Crinacle","Diffuse Field","Etymotic","Free Field","Innerfidelity ID"] },
        { type:"Preference", files:["Harman","Rtings","Sonarworks"] }
];



// Functions to support config options set above; probably don't need to change these

// Set up the watermark, based on config options above
function watermark(svg) {
    let wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",0.2);
    
    if ( watermark_image_url ) {
        wm.append("image")
            .attrs({x:-64, y:-64, width:128, height:128, "xlink:href":watermark_image_url});
    }
    
    if ( watermark_text ) {
        wm.append("text")
            .attrs({x:0, y:70, "font-size":28, "text-anchor":"middle", "class":"graph-name"})
            .text(watermark_text);
    }
}



// Set up tsvParse (?) with default values for AudioTools and REW measurements
function initTsvParse() {
    if ( data_format.toLowerCase() === "audiotools" ) {
        var dataStart = 3,
            dataEnd = 482;
    } else if ( data_format.toLowerCase() === "rew" ) {
        var dataStart = 14,
            dataEnd = 493;
    } else {
        // If exporting data from something other than AudioTools or REW, edit these vals to indicate on which lines of your text files the measurements data begins and ends
        var dataStart = 2,
            dataEnd = 482;
    }
    
    tsvParse = fr => d3.tsvParseRows(fr).slice(dataStart,dataEnd)
        .map(r=>r.map(d=>+d));
}
initTsvParse();



// Apply stylesheet based layout options above
function setLayout() {
    function applyStylesheet(styleSheet) {
        var docHead = document.querySelector("head"),
            linkTag = document.createElement("link");
        
        linkTag.setAttribute("rel", "stylesheet");
        linkTag.setAttribute("type", "text/css");
        
        linkTag.setAttribute("href", styleSheet);
        docHead.append(linkTag);
    }

    if ( !alt_layout ) {
        applyStylesheet("style.css");
    } else {
        applyStylesheet("style-alt.css");
        applyStylesheet("style-alt-theme.css");
    }
}
setLayout();
