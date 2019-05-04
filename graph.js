var pad = { l:30, r:14, t:10, b:36 };
var W = 800 - pad.l - pad.r,
    H = 360 - pad.t - pad.b;

var gr = d3.select("#fr-graph"),
    defs = gr.append("defs");


// Watermark
var wm = gr.append("g")
    .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
    .attr("opacity",0.1);
wm.append("image")
    .attrs({x:-64, y:-64, width:128, height:128, "xlink:href":"https://crinacle.com/wp-content/uploads/2019/01/avatardiao2xredditsafe.png"});
wm.append("text")
    .attrs({x:0, y:100, "font-size":36, "text-anchor":"middle"})
    .text("crinacle.com/graphs");


// Scales
var x = d3.scaleLog()
    .domain([20,20000])
    .range([pad.l,pad.l+W]);

var yD = [28,86], // Decibels
    yR = [pad.t+H,pad.t+10];
var y = d3.scaleLinear().domain(yD).range(yR);


// y axis
defs.append("filter").attr("id","blur").attr("filterUnits","userSpaceOnUse")
    .attrs({x:-W-4,y:-2,width:W+4,height:4})
    .append("feGaussianBlur").attr("in","SourceGraphic")
    .attr("stdDeviation", 0.8);
var yAxis = d3.axisLeft(y).tickSize(W+3).tickSizeOuter(0).tickPadding(1);
function fmtY(ya) {
    yAxis(ya);
    ya.select(".domain").remove();
    ya.selectAll(".tick line")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 0.3)
      .attr("filter", "url(#blur)");
//  ya.selectAll(".tick text")
//    .attr("text-anchor","start")
//    .attr("x",-W+3)
//    .attr("dy",-2);
}
var yAxisObj = gr.append("g")
    .attr("transform", "translate("+(pad.l+W)+",0)")
    .call(fmtY);
yAxisObj.insert("text")
    .attr("fill","currentColor")
    .attr("x",-W-4).attr("y",pad.t).attr("dy","0.32em")
    .text("dB");


// x axis
var xvals = [2,3,4,5,6,8,10,15];
var xAxis = d3.axisBottom(x)
    .tickSize(H+3).tickSizeOuter(0)
    .tickValues([].concat.apply([],[1,2,3].map(e=>xvals.map(m=>m*Math.pow(10,e)))).concat([20000]))
    .tickFormat(f => f>=1000 ? (f/1000)+"k" : f);

function isMin(i) { return [0,1,1,0,1,1,0,1,0][i%8]; }
function xThick(_,i) {
    var l = xvals.length;
    return i%l==0 ? (i==0 || i==3*l  ?  1.5 : 0.9)
         : isMin(i) ? 0.2 : 0.4;
}

function fmtX(xa) {
    xAxis(xa);
    xa.attr("shape-rendering", "crispEdges");
    (xa.selection ? xa.selection() : xa).select(".domain").remove();
    xa.selectAll(".tick line")
      .attr("stroke", "#333")
      .attr("stroke-width", xThick);
    xa.selectAll(".tick text").filter((_,i)=>isMin(i))
      .attr("font-size","86%")
      .attr("font-weight","lighter");
    xa.select(".tick:last-of-type text")
      .attr("dx",-5)
      .text("20kHz");
    xa.select(".tick:first-of-type text")
      .attr("dx",4)
      .text("2Hz");
}
var xAxisObj = gr.append("g")
    .attr("transform", "translate(0,"+pad.t+")")
    .call(fmtX);


// Plot line
defs.selectAll().data([0,1]).enter()
    .append("linearGradient")
    .attrs({x1:0,y1:0, x2:1,y2:0})
    .attr("id", i=>"grad"+i)
    .selectAll().data(i=>[i,1-i]).enter()
    .append("stop")
    .attr("offset",(_,i)=>i)
    .attr("stop-color",j=>["black","white"][j]);
var fW = 7,  // Fade width
    fWm= 30; // Width at an interior edge
var fade = defs.append("mask")
    .attr("id", "graphFade")
    .append("g").attr("transform", "translate("+pad.l+","+pad.t+")");
fade.append("rect").attrs({ x:0, y:0, width:W, height:H, fill:"white" });
var fadeEdge = fade.selectAll().data([0,1]).enter()
    .append("rect")
    .attrs(i=>({ x:i?W-fW:0, width:fW, y:0,height:H, fill:"url(#grad"+i+")" }));
var fr = [[70.6337,70.7426,70.5576,70.803,71.0174,71.1592,71.1507,71.4512,71.7646,72.0942,72.4243,72.4177,72.7919,72.4676,72.7421,73.2317,73.2629,73.3445,73.8993,73.9086,74.0941,74.0934,74.3674,74.8188,74.9275,74.9163,75.2224,75.1452,75.7146,75.4165,75.8956,75.9521,75.7002,76.0158,75.7036,75.6015,75.859,75.9909,75.8992,75.4503,75.3903,75.3379,74.7456,74.7325,74.14,74.1261,73.1485,73.2134,72.6144,71.4195,71.2352,70.1602,69.0965,68.5129,67.3027,66.456,65.4981,64.584,63.4463,62.2271,60.772,60.0925,58.5962,57.5458,56.9177,55.9225,55.2193,54.6297,54.1848,54.037,53.7831,54.1141,54.4501,55.3977,56.6372,58.1593,59.5655,61.2005,63.735,65.5947,67.7777,69.9009,72.0167,73.9576,75.8697,76.9171,77.7681,77.6725,76.661,75.0211,73.0748,70.7834,67.8995,65.5296,62.9223,61.1579,60.8579,61.1495,62.6319,65.8201,69.7273,73.2517,75.2502,75.1443,73.1414,68.4777,61.5313,53.3117,44.711,37.3055,32.5271,31.7326,34.6204,39.4294,45.9319,51.384,54.132,52.0678,45.9009,38.7617,33.048],[67.8468,67.6229,67.806,67.9226,68.3854,68.4019,68.3867,68.3744,68.6436,69.1319,69.0216,69.1306,69.6511,69.6553,69.8176,69.738,69.9952,70.3149,70.2231,70.2695,70.9329,71.0446,71.0176,71.0634,71.1405,71.2212,71.5394,71.7953,71.9713,71.8391,72.2361,72.0786,72.0898,72.2753,72.4506,72.2773,72.3308,72.0731,72.2877,72.0269,71.9728,71.8525,71.6265,71.3837,71.0048,70.3662,70.0006,70.0136,69.3803,68.6865,67.914,67.3514,66.9254,66.3273,65.2302,64.6552,63.3244,62.4025,62.0027,60.828,59.6003,58.8916,57.8082,57.3184,56.4914,55.4683,55.0973,54.223,54.2904,53.5902,53.7252,54.2451,54.2909,55.4176,56.4005,57.4017,58.8189,60.1082,61.8283,63.8138,65.2749,67.6311,69.3368,70.9121,72.3581,73.664,74.6098,74.5596,74.2407,73.1372,71.9463,70.3194,68.3943,66.3553,64.4446,63.4154,62.7483,63.6685,64.7101,67.7601,70.9401,73.4681,75.0694,74.7335,72.8307,68.7341,63.3053,56.3444,48.5634,42.7821,39.0963,37.9768,40.2808,44.6209,50.0279,54.5776,56.6072,55.0658,49.8222,43.9887,39.1857]];
var line = d3.line()
    .x((f,i)=>x(20*Math.pow(1000,i/120)))
    .y(f=>y(f))
    .curve(d3.curveCardinal);
var path = gr.selectAll().data(fr).enter()
    .append("path")
    .attr("fill","none")
    .attr("stroke-width",3)
    .attr("stroke",(_,i)=>["SteelBlue","FireBrick"][i])
    .attr("d",line)
    .attr("mask","url(#graphFade)");


// Range buttons
var rsH = 14,
    rsp = 8;  // x-axis padding
var rangeSel = gr.selectAll().data(["bass","mids","treble"]).enter()
    .append("g").attr("class","rangeButton")
    .attr("transform", (_,i)=>"translate("+(pad.l+i*(W/3))+","+(pad.t+H+pad.b-rsH)+")")
    .on("click", clickRangeButton);
rangeSel.append("rect")
    .attrs({x:rsp, y:-2, width:W/3-2*rsp, height:rsH,
            rx:3, ry:3, "stroke-width":2});
rangeSel.append("text")
    .attrs({x:W/6, y:rsH-4.5, "text-anchor":"middle", "font-size":rsH-2,
            "letter-spacing":1.25, "font-weight":"bold"})
    .text(t=>t);

var selectedRange = 3; // Full range
var ranges = [[20,400],[100,4000],[1000,20000], [20,20000]],
    edgeWs = [[fW,fWm],[fWm,fWm],[fWm,fW],[fW,fW]];
function clickRangeButton(_,i) {
    var r = selectedRange,
        s = selectedRange = r===i ? 3 : i;
    rangeSel.classed("selected", (_,j)=>j===s);
    x.domain(ranges[s]);
    // More time to go between bass and treble
    var dur = Math.min(r,s)===0 && Math.max(r,s)===2 ? 1100 : 700;
    path.transition().duration(dur).attr("d",line);
    var e = edgeWs[s];
    fadeEdge.transition().duration(dur).attrs(i=>({x:i?W-e[i]:0, width:e[i]}));
    xAxisObj.transition().duration(dur).call(fmtX);
}


// y-axis scaler
var dB = {
    y: y(62.5),
    h: 15,
    H: 55,
    min: pad.t,
    max: pad.t+H,
    tr: _ => "translate("+(pad.l-16)+","+dB.y+")"
};
dB.all = gr.append("g").attr("class","dBScaler"),
dB.trans = dB.all.append("g").attr("transform", dB.tr()),
dB.scale = dB.trans.append("g").attr("transform", "scale(1,1)");
dB.scale.append("line").attrs({x1:5,y1:-dB.H,x2:5,y2:dB.H});
dB.scale.selectAll().data([-dB.H,dB.H]).enter()
    .append("line").attrs({x1:1,x2:9,y1:y=>y,y2:y=>y});
function getDrag(fn) {
    return d3.drag()
        .on("drag",fn)
        .on("start",function(){dB.all.classed("active",true );})
        .on("end"  ,function(){dB.all.classed("active",false);});
}
dB.Mid = dB.all.append("rect")
    .attrs({x:(pad.l-16),y:dB.y-dB.h,width:10,height:2*dB.h,fill:"white"})
    .call(getDrag(function () {
        dB.y = d3.event.y;
        dB.y = Math.min(dB.y, dB.max-dB.h*(dB.H/15));
        dB.y = Math.max(dB.y, dB.min+dB.h*(dB.H/15));
        d3.select(this).attr("y",dB.y-dB.h);
        dB.trans.attr("transform", dB.tr());
        dB.updatey();
    }));
dB.circ = dB.trans.selectAll().data([-1,1]).enter().append("circle")
    .attrs({cx:5,cy:s=>dB.H*s,r:7,opacity:0})
    .call(getDrag(function () {
        var h  = Math.max(30, Math.abs(d3.event.y));
        h = Math.min(h, Math.min(dB.max-dB.y, dB.y-dB.min));
        var sc = h/dB.H;
        dB.circ.attr("cy",s=>h*s);
        dB.scale.attr("transform", "scale(1,"+sc+")");
        dB.h = 15*sc;
        dB.Mid.attrs({y:dB.y-dB.h,height:2*dB.h});
        dB.updatey();
    }));
dB.updatey = function (dom) {
    y.domain(yR.map(y=>62.5+(dB.y-y)*(15/dB.h)*(30-85)/(yR[1]-yR[0])));
    yAxisObj.call(fmtY);
    path.attr("d",line);
}
