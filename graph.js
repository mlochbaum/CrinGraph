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

var y = d3.scaleLinear()
    .domain([30,85]) // Decibels
    .range([pad.t+H-5,pad.t+15]);


// y axis
defs.append("filter").attr("id","blur").attr("filterUnits","userSpaceOnUse")
    .attrs({x:-W-4,y:-2,width:W+4,height:4})
    .append("feGaussianBlur").attr("in","SourceGraphic")
    .attr("stdDeviation", 0.8);
gr.append("g")
    .attr("transform", "translate("+(pad.l+W)+",0)")
    .call(d3.axisLeft(y).tickSize(W+3).tickPadding(1))
    .call(function (ya) {
        ya.select(".domain").remove();
        ya.selectAll(".tick line")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 0.3)
          .attr("filter", "url(#blur)");
//      ya.selectAll(".tick text")
//        .attr("text-anchor","start")
//        .attr("x",-W+3)
//        .attr("dy",-2);
        ya.insert("text")
          .attr("fill","currentColor")
          .attr("x",-W-4).attr("y",pad.t).attr("dy","0.32em")
          .text("dB");
    });


// x axis
var xvals = [2,3,4,5,6,8,10,15];
var xAxis = d3.axisBottom(x)
    .tickValues([].concat.apply([],[1,2,3].map(e=>xvals.map(m=>m*Math.pow(10,e)))).concat([20000]))
    .tickFormat(f => f>=1000 ? (f/1000)+"k" : f);

function isMin(i) { return [0,1,1,0,1,1,0,1,0][i%8]; }
function xThick(_,i) {
    var l = xvals.length;
    return i%l==0 ? (i==0 || i==3*l  ?  1.5 : 0.9)
         : isMin(i) ? 0.2 : 0.4;
}

function fmtX(xa) {
    xAxis.tickSize(H+3)(xa);
    xa.attr("shape-rendering", "crispEdges");
    xa.select(".domain").remove();
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
var fr = [72.7527,72.9782,73.2083,73.4431,73.6824,73.926,74.1738,74.4254,74.6808,74.9394,75.2011,75.4653,75.7317,75.9995,76.2684,76.5375,76.8062,77.0734,77.3384,77.6001,77.8572,78.1085,78.3525,78.5878,78.8125,79.0249,79.2229,79.4044,79.5669,79.7079,79.8247,79.9143,79.9735,79.9992,79.9877,79.9355,79.8386,79.693,79.4947,79.2395,78.9231,78.5412,78.0899,77.565,76.9628,76.2799,75.5134,74.6609,73.7209,72.6928,71.5773,70.3763,69.0933,67.7339,66.3055,64.8183,63.2847,61.7204,60.144,58.5772,57.0455,55.5773,54.2044,52.9616,51.8858,51.0161,50.3918,50.0521,50.0337,50.3693,51.0853,52.1989,53.7157,55.6264,57.9041,60.5015,63.3488,66.3527,69.3958,72.3393,75.0262,77.2883,78.9556,79.8689,79.8946,78.9428,76.9847,74.0706,70.3433,66.0458,61.5186,57.1837,53.5137,50.9826,50.0026,50.85,53.5912,58.0211,63.6327,69.6348,75.0333,78.7812,79.9878,78.1562,73.3958,66.5405,59.1002,52.9951,50.0785,51.5317,57.3057,65.846,74.3244,79.474,78.8773,72.2595,62.1222,53.1209,50.0574,55.1689,66.1807];
var line = d3.line()
    .x((f,i)=>x(20*Math.pow(1000,i/120)))
    .y(f=>y(f))
    .curve(d3.curveCardinal);
var path = gr.append("path")
    .attr("fill","none")
    .attr("stroke-width",3)
    .attr("stroke","SteelBlue")
    .attr("d",line(fr))
    .attr("mask","url(#graphFade)");


// Range buttons
var rsH = 14,
    rsp = 8;  // x-axis padding
var rangeSel = gr.selectAll().data(["bass","mids","treble"]).enter()
    .append("g").attr("class","rangeButton")
    .attr("transform", (_,i)=>"translate("+(pad.l+i*(W/3))+","+(pad.t+H+pad.b-rsH)+")")
    .on("mouseover", function () { d3.select(this).classed("active",true ); })
    .on("mouseout" , function () { d3.select(this).classed("active",false); })
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
    path.transition().duration(dur).attr("d",line(fr));
    var e = edgeWs[s];
    fadeEdge.transition().duration(dur).attrs(i=>({x:i?W-e[i]:0, width:e[i]}));
    xAxisObj.transition().duration(dur).call(fmtX);
}
