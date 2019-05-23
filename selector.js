const LR = ["L","R"];
var fileNames = name => LR.map(s=>name+" "+s+".txt");

function flatten(l) { return [].concat.apply([],l); }
function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
}
function hasImbalance(curves) {
    var as = curves[0], bs = curves[1];
    return as.some((a,i) =>
        a[0] <= 15e3 &&
        Math.abs(a[1]-bs[i][1]) > max_channel_imbalance
    );
}

var activePhones = [];
var baseline0 = { p:null, l:null, fn:l=>l },
    baseline = baseline0;

var gpath = gr.insert("g",".rangeButton")
    .attr("fill","none")
    .attr("stroke-width",3)
    .attr("mask","url(#graphFade)");
function hl(p, h) {
    gpath.selectAll("path").filter(c=>c.p===p).classed("highlight",h);
}
var table = d3.select(".curves");

var ld_p1 = 1.1673039782614187;
function getCurveColor(id, o) {
    var p1 = ld_p1,
        p2 = p1*p1,
        p3 = p2*p1;
    var t = o/20;
    var i=(id+0.14)/p3, j=(id+0.2)/p2, k=(id+0.4)/p1;
    return d3.hcl(360*((i+t/p2)%1),
                  80+20*((j%1)-t/p3),
                  40+20*(k%1));
}
var getColor_AC = c => getCurveColor(c.p.id, c.o);
var getColor_ph = (p,i) => getCurveColor(p.id, p.activeCurves[i].o);
function getDivColor(id, active) {
    var c = getCurveColor(id,0);
    c.l = 100-(80-c.l)/(active?1.5:3);
    c.c = (c.c-20)/(active?3:4);
    return c;
}

var phoneNumber = 0; // I'm so sorry it just happened
// Find a phone id which doesn't have a color conflict with pins
var nextPN = 0; // Cached value; invalidated when pinned headphones change
function nextPhoneNumber() {
    if (nextPN === null) {
        nextPN = phoneNumber;
        var pin = activePhones.filter(p => p.pin).map(p=>p.id);
        if (pin.length) {
            var p3 = ld_p1*ld_p1*ld_p1,
                l = a => b => Math.abs(((a-b)/p3 + 0.5) % 1 - 0.5),
                d = id => pin.map(l(id)).reduce((a,b)=>Math.min(a,b));
            for (var i=nextPN, max=d(i); max<0.12 && ++i<phoneNumber+3; ) {
                var m = d(i);
                if (m > max) { max=m; nextPN=i; }
            }
        }
    }
    return nextPN;
}
function getPhoneNumber() {
    var pn = nextPhoneNumber();
    phoneNumber = pn + 1;
    nextPN = null;
    return pn;
}

function setPhoneTr(phtr) {
    phtr.style("background",p=>getDivColor(p.id,p.active))
        .style("border-color",p=>p.active?getDivColor(p.id,1):null);
    phtr.selectAll(".remove").data(p=>p.active?[p]:[])
        .join("span").attr("class","remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removePhone(p); });
}

var channelbox_x = c => c?-86:-36,
    channelbox_tr = c => "translate("+channelbox_x(c)+",0)";
function setCurves(p, avg, lr) {
    var dx = +avg - +p.avg;
    p.avg = avg;
    p.activeCurves = avg
        ? [{id:p.fileName+" AVG", l:avgCurves(p.channels), p:p, o:0}]
        : p.channels.map((l,i) => ({id:p.files[i], l:l, p:p, o:-1+2*i}));
    var y = 0;
    if (lr!==undefined) {
        p.activeCurves = [p.activeCurves[lr]];
        y = [-1,1][lr];
    }
    var k = d3.selectAll(".keyLine").filter(q=>q===p);
    k.select(".keyMask")
        .transition().duration(400)
        .attr("x", channelbox_x(avg))
        .attrTween("y", function () {
            var y0 = +this.getAttribute("y"),
                y1 = 12*(-1+y);
            if (!dx) { return d3.interpolateNumber(y0,y1); }
            var ym = y0 + (y1-y0)*(3-2*dx)/6;
            y0-=ym; y1-=ym;
            return t => { t-=1/2; return ym+(t<0?y0:y1)*Math.pow(2,20*(Math.abs(t)-1/2)); };
        });
    k.select(".keySel").attr("transform", channelbox_tr(avg));
}

var drawLine = d => line(baseline.fn(d.l));
function updateBaseline() {
    var c = yCenter;
    yCenter = baseline.p ? 0 : 60;
    y.domain(y.domain().map(d=>d+(yCenter-c)));
    yAxisObj.call(fmtY);
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select("button")
        .classed("selected", p=>p===baseline.p);
}
function setBaseline(b) { baseline=b; updateBaseline(); }

function setHover(elt, h) {
    elt.on("mouseover", h(true)).on("mouseout", h(false));
}

function updatePaths() {
    var c = flatten(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path")
        .attr("stroke", getColor_AC)
        .attr("d", drawLine)
        .call(setHover, h => c =>
            table.selectAll("tr").filter(p=>p===c.p).classed("highlight",h)
        );
}
function updatePhoneTable() {
    var c = table.selectAll("tr").data(activePhones, p=>p.id);
    c.exit().remove();
    var f = c.enter().append("tr"),
        td = () => f.append("td");
    f   .call(setHover, h => p => hl(p,h))
        .style("color", p => getDivColor(p.id,true));
    td().attr("class","remove").text("⊗")
        .on("click", removePhone);
    td().text(p=>p.brand.name+" ")
        .append("span").attr("class","phonename").text(p=>p.phone);
    td().append("svg").call(addKey);
    td().append("button").text("baseline")
        .on("click",function(p){
            if (baseline.p === p) {
                baseline = baseline0;
            } else {
                var l = p.avg ? p.activeCurves[0].l
                              : avgCurves(p.channels),
                    b = l.map(d => d[1]);
                baseline = { p:p, fn:l=>l.map((e,i)=>[e[0],e[1]-b[i]]) };
            }
            updateBaseline();
        });
    td().append("button").text("hide")
        .on("click",function(p){
            var h = p.hide;
            d3.select(this).text(h?"hide":"show");
            gpath.selectAll("path").filter(c=>c.p===p)
                .attr("opacity", h?null:0);
            p.hide = !h;
        });
    td().append("button").text("pin")
        .on("click",function(p){
            p.pin = true; nextPN = null;
            var par = d3.select(this.parentElement);
            d3.select(this).remove();
            par.insert("svg").attr("class","pinMark")
                .attr("viewBox","0 0 280 145")
                .insert("path").attrs({
                    fill:"none",
                    stroke:"#445",
                    "stroke-width":30,
                    "stroke-linecap":"round",
                    d:"M265 110V25q0 -10 -10 -10H105q-24 0 -48 20l-24 20q-24 20 -2 40l18 15q24 20 42 20h100"
                });
        });
}

function addKey(s) {
    s.attr("class","keyLine").attr("viewBox","-19 -12 65 24");
    var defs = s.append("defs");
    defs.append("linearGradient").attr("id", p=>"chgrad"+p.id)
        .attrs({x1:0,y1:0, x2:0,y2:1})
        .selectAll().data(p=>[0.1,0.4,0.6,0.9].map(o =>
            [o, getCurveColor(p.id, o<0.3?-1:o<0.7?0:1)]
        )).join("stop")
        .attr("offset",i=>i[0])
        .attr("stop-color",i=>i[1]);
    defs.append("linearGradient").attr("id","blgrad")
        .selectAll().data([0,0.25,0.31,0.69,0.75,1]).join("stop")
        .attr("offset",o=>o)
        .attr("stop-color",(o,i) => i==2||i==3?"white":"#333");
    var m = defs.append("mask").attr("id",p=>"chmask"+p.id);
    m.append("rect").attrs({x:-19, y:-12, width:65, height:24, fill:"#333"});
    m.append("rect").attrs({"class":"keyMask", x:p=>channelbox_x(p.avg), y:-12, width:120, height:24, fill:"url(#blgrad)"});
    var t = s.append("g").attr("mask",p=>"url(#chmask"+p.id+")")
    t.append("path")
        .attr("stroke", p=>"url(#chgrad"+p.id+")")
        .attr("d","M15 6H9C0 6,0 0,-9 0H-17H-9C0 0,0 -6,9 -6H15");
    t.selectAll().data(LR)
        .join("text")
        .attrs({x:17, y:(_,i)=>[-6,6][i], dy:"0.32em", "text-anchor":"start", "font-size":10.5})
        .text(t=>t);
    s.append("g").attr("class","keySel")
        .attr("transform",p=>channelbox_tr(p.avg))
        .on("click",function(p){
            setCurves(p, !p.avg);
            updatePaths(); hl(p,true);
        })
        .selectAll().data([0,80]).join("rect")
        .attrs({x:d=>d, y:-12, width:40, height:24, opacity:0});
    var o = s.selectAll().data(p=>[[p,0],[p,1]])
        .join("g").attr("class","keyOnly")
        .attr("transform",pi=>"translate(25,"+[-6,6][pi[1]]+")")
        .call(setHover, h => function (pi) {
            var p = pi[0], cs = p.activeCurves;
            if (cs.length === 2) {
                d3.event.stopPropagation();
                hl(p, h ? (c=>c===cs[pi[1]]) : true);
                gpath.selectAll("path").filter(c=>c.p===p).attr("opacity",h ? (c=>c!==cs[pi[1]]?0.7:null) : null);
            }
        })
        .on("click", pi => { setCurves(pi[0], false, pi[1]); updatePaths(); });
    o.append("rect").attrs({x:0,y:-6,width:30,height:12,opacity:0});
    o.append("text").attrs({x:0, y:0, dy:"0.28em", "text-anchor":"start",
                            "font-size":7.5 })
        .text("only");
    s.filter(p=>p.imbalance)
        .append("text")
        .attrs({x:8,y:0,dy:"0.35em",fill:"#e11",
                "font-size":10.5,"font-weight":"bold"})
        .style("pointer-events","none")
        .text("!");
}

function showPhone(p, exclusive) {
    if (!p.channels) {
        if (!p.files) p.files = fileNames(p.fileName);
        Promise.all(p.files.map(f=>d3.text(DIR+f))).then(function (frs) {
            if (p.channels) return;
            p.id = getPhoneNumber();
            p.channels = frs.map(tsvParse);
            p.imbalance = hasImbalance(p.channels);
            showPhone(p, exclusive);
        });
        return;
    }
    var l = p.files.length;
    if (exclusive) {
        activePhones = activePhones.filter(q=>q.active=q.pin);
        if (baseline.p && !baseline.p.pin) baseline = baseline0;
    }
    if (activePhones.indexOf(p) === -1) {
        if (activePhones.length===1 && activePhones[0].activeCurves.length!==1) {
            setCurves(activePhones[0], true);
        }
        activePhones.push(p);
        p.active = true;
        setCurves(p, activePhones.length > 1);
    }
    updatePaths();
    updatePhoneTable();
    d3.select("#phones").selectAll("div")
        .filter(p=>p.id!==undefined)
        .call(setPhoneTr);
}

function removePhone(p) {
    p.active = p.pin = false; nextPN = null;
    activePhones = activePhones.filter(q => q.active);
    if (activePhones.length === 1) {
        setCurves(activePhones[0], false);
    }
    updatePaths();
    if (baseline.p === p) { setBaseline(baseline0); }
    updatePhoneTable();
    d3.select("#phones").selectAll("div")
        .filter(q=>q===p)
        .call(setPhoneTr);
}

d3.json(DIR+"phone_book.json").then(function (brands) {
    brands.forEach(function (b) {
        b.active = false;
        b.phoneObjs = b.phones.map(function (p) {
            var r = { brand:b };
            if (typeof p === "string") {
                r.phone = r.fileName = p;
            } else {
                r.phone = p.name;
                var f = p.file;
                if (typeof f === "string") {
                    r.fileName = f;
                } else {
                    r.fileNames = f;
                    r.fileName = f[0];
                }
            }
            return r;
        });
    });
    var phoneFullName = p => p.brand.name+" "+p.phone;

    var allPhones = flatten(brands.map(b=>b.phoneObjs)),
        currentBrands = [];
    showPhone(allPhones[0],1);

    function setClicks(fn) { return function (elt) {
        elt .on("mousedown", () => d3.event.preventDefault())
            .on("click", p => fn(p,!d3.event.ctrlKey))
            .on("auxclick", p => d3.event.button===1 ? fn(p,0) : 0);
    }; }

    var brandSel = d3.select("#brands").selectAll()
        .data(brands).join("div")
        .text(b => b.name + (b.suffix?" "+b.suffix:""))
        .call(setClicks(setBrand));

    var bg = (h,fn) => function (p) {
        d3.select(this).style("background", fn(p));
        hl(p,h);
    }
    var phoneSel = d3.select("#phones").selectAll()
        .data(allPhones).join("div")
        .on("mouseover", bg(true, p => getDivColor(p.id===undefined?nextPhoneNumber():p.id, true)))
        .on("mouseout" , bg(false,p => p.id!==undefined?getDivColor(p.id,p.active):null))
        .call(setClicks(showPhone));
    phoneSel.append("span").text(phoneFullName);

    function setBrand(b, exclusive) {
        var incl = currentBrands.indexOf(b) !== -1;
        if (exclusive || currentBrands.length===0) {
            currentBrands.forEach(br => br.active = false);
            if (incl) {
                currentBrands = [];
                phoneSel.style("display", null);
                phoneSel.select("span").text(phoneFullName);
            } else {
                currentBrands = [b];
                phoneSel.style("display", p => p.brand===b?null:"none");
                phoneSel.filter(p => p.brand===b).select("span").text(p=>p.phone);
            }
        } else {
            if (incl) return;
            if (currentBrands.length === 1) {
                phoneSel.select("span").text(phoneFullName);
            }
            currentBrands.push(b);
            phoneSel.filter(p => p.brand===b).style("display", null);
        }
        if (!incl) b.active = true;
        brandSel.classed("active", br => br.active);
    }

    var phoneSearch = new Fuse(
        allPhones,
        {
            shouldSort: false,
            tokenize: true,
            threshold: 0.2,
            minMatchCharLength: 2,
            keys: [
                {weight:0.3, name:"brand.name"},
                {weight:0.1, name:"brand.suffix"},
                {weight:0.6, name:"phone"}
            ]
        }
    );
    var brandSearch = new Fuse(
        brands,
        {
            shouldSort: false,
            tokenize: true,
            threshold: 0.05,
            minMatchCharLength: 3,
            keys: [
                {weight:0.9, name:"name"},
                {weight:0.1, name:"suffix"},
            ]
        }
    );
    d3.select(".search").on("input", function () {
        var fn, bl = brands;
        var c = currentBrands;
        if (this.value.length > 1) {
            var s = phoneSearch.search(this.value),
                t = c.length ? s.filter(p=>c.indexOf(p.brand)!==-1) : s;
            if (t.length) s = t;
            fn = p => s.indexOf(p)!==-1;
            var b = brandSearch.search(this.value);
            if (b.length) bl = b;
        } else {
            fn = c.length ? (p => c.indexOf(p.brand)!==-1)
                          : (p => true);
        }
        phoneSel.style("display", p => fn(p)?null:"none");
        brandSel.style("display", b => bl.indexOf(b)!==-1?null:"none");
    });
});
