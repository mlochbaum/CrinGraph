const DIR = "data/";
// Get data (as a list of [x,y] pairs) from an FR file
const tsvParse = fr => d3.tsvParseRows(fr).slice(2,482)  // These slice values for AudioTools exports
//const tsvParse = fr => d3.tsvParseRows(fr).slice(14,493)     // These slice values for REW exports
                       .map(r=>r.map(d=>+d));

// Add a watermark to the graph.
function watermark(svg) {
    let wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",0.2);
//  wm.append("image")
//      .attrs({x:-64, y:-64, width:128, height:128, "xlink:href":URL});
    wm.append("text")
        .attrs({x:0, y:40, "font-size":40, "text-anchor":"middle", "class":"graph-name"})
        .text("sample graphs");
}

const max_channel_imbalance = 5;

const targets = [
    { type:"Neutral"   , files:["Crinacle","Diffuse Field","Etymotic","Free Field","Innerfidelity ID"] },
    { type:"Preference", files:["Harman","Rtings","Sonarworks"] }
];

const init_phones = [ "HTH67" ];
const share_url = true;
