const DIR = "data_hp/";

// Add a watermark to the graph.
function watermark(svg) {
    let wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",0.2);
//  wm.append("image")
//      .attrs({x:-64, y:-64, width:128, height:128, "xlink:href":URL});
    wm.append("text")
        .attrs({x:0, y:40, "font-size":40, "text-anchor":"middle"})
        .text("sample graphs");
}

const max_channel_imbalance = 5;
const default_channels = ["R"];
const num_samples = 5;

const scale_smoothing = 0.2;

const targets = [
    { type:"Neutral"   , files:["IEF Neutral"] },
    { type:"Preference", files:["IEF Harman"] }
];

// const init_phones = [ "HD650", "IEF Neutral Target" ];
