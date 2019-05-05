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
var line = d3.line()
    .x((f,i)=>x(i===479?20000:19.4806*Math.pow(2,i/48)))
    .y(f=>y(f))
    .curve(d3.curveCardinal.tension(0.5));
var path = null;
d3.json("data/fr.json").then(fr =>
    path = gr.selectAll().data(fr).enter()
        .append("path")
        .attr("fill","none")
        .attr("stroke-width",3)
        .attr("stroke",(_,i)=>["SteelBlue","FireBrick"][i])
        .attr("d",line)
        .attr("mask","url(#graphFade)")
);


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
    if (path) path.transition().duration(dur).attr("d",line);
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
    if (path) path.attr("d",line);
}
