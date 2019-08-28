const DIR = "data/";
// Get data (as a list of [x,y] pairs) from an FR file
const tsvParse = fr => d3.tsvParseRows(fr).slice(2,482)
                       .map(r=>r.map(d=>+d));

// Add a watermark to the graph.
function watermark(svg) {
    var wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",0.2);
    wm.append("image")
        .attrs({x:-64, y:-64, width:128, height:128, "xlink:href":"https://crinacle.com/wp-content/uploads/2019/01/avatardiao2xredditsafe.png"});
    wm.append("text")
        .attrs({x:0, y:100, "font-size":36, "text-anchor":"middle"})
        .text("crinacle.com/graphs");
}

const max_channel_imbalance = 5;

const max_compare = 2;
const disallow_target = true;
const premium_html = "<h2>You gonna pay for that?</h2><p>To use r more than two graphs, upgrade to Patreon <a href='https://www.patreon.com/join/crinacle/checkout?rid=3775534'>Silver tier</a> and switch to <a href='https://crinacle.com/graphs/graphtool/premium/'>the premium tool</a>.<p>";

const targets = [
    { type:"Neutral"   , files:["Crinacle","Diffuse Field","Etymotic","Free Field","Innerfidelity ID"] },
    { type:"Preference", files:["Harman","Rtings","Sonarworks"] }
];
