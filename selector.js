const LR = ["L","R"];

function loadFiles(p, callback) {
    var l = f => d3.text(DIR+f+".txt").catch(()=>null);
    var p = p.isTarget ? [l(p.fileName)]
          : LR.map(s => l(p.fileName+" "+s));
    Promise.all(p).then(function (frs) {
        if (!frs.some(f=>f!==null)) {
            alert("Headphone not found!");
        } else {
            callback(frs.map(f => f && tsvParse(f)));
        }
    });
}
var validChannels = p => p.channels.filter(c=>c!==null);
var has1Channel = p => p.isTarget || p.channels.some(c=>c===null);

function flatten(l) { return [].concat.apply([],l); }
function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
}
function hasImbalance(p) {
    if (has1Channel(p)) return false;
    var as = p.channels[0], bs = p.channels[1];
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
    .attr("stroke-width",2.3)
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
    var t = o/32;
    var i=id/p3+0.76, j=id/p2+0.79, k=id/p1+0.32;
    if (id < 0) { return d3.hcl(360*(1-(-i)%1),5,66); } // Target
    var th = 2*Math.PI*i;
    i += Math.cos(th-0.3)/24 + Math.cos(6*th)/32;
    var s = Math.sin(2*Math.PI*i);
    return d3.hcl(360*((i + t/p2)%1),
                  88+30*(j%1 + 1.3*s - t/p3),
                  36+22*(k%1 + 1.1*s + 6*t*(1-s)));
}
var getColor_AC = c => getCurveColor(c.p.id, c.o);
var getColor_ph = (p,i) => getCurveColor(p.id, p.activeCurves[i].o);
function getDivColor(id, active) {
    var c = getCurveColor(id,0);
    c.l = 100-(80-Math.min(c.l,60))/(active?1.5:3);
    c.c = (c.c-20)/(active?3:4);
    return c;
}
function color_curveToText(c) {
    c.l = c.l/5 + 10;
    c.c /= 3;
    return c;
}
var getTooltipColor = curve => color_curveToText(getColor_AC(curve));
var getTextColor = p => color_curveToText(getCurveColor(p.id,0));

if (typeof max_compare !== "undefined") {
    const currency = [
        ["$", "#348542"],
        ["¥", "#d11111"],
        ["€", "#2961d4"],
        ["฿", "#dcaf1d"]
    ];
    let currencyCounter = -1;
    function cantCompare(m) {
        if (m < max_compare) { return false; }
        var div = d3.select("body").append("div");
        var c = currency[currencyCounter++ % currency.length];
        if (!currencyCounter) {
            div.attr("class","cashMessage")
                .html(premium_html)
                .append("button").text("Fine")
                .on("click",()=>div.remove());
        } else {
            div.attr("class","cash")
                .style("color",c[1]).text(c[0])
                .transition().duration(120).remove();
        }
        return true;
    }
} else {
    function cantCompare(m) { return false; }
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
    phtr.each(function (p) {
        p.highlight = p.active;
        var o = p.objs; if (!o) return;
        p.objs = o = o.filter(q=>q.active);
        if (o.length === 0) {
            delete p.objs;
        } else if (!p.active) {
            p.id = o[0].id;
            p.highlight = true;
        }
    });
    phtr.style("background",p=>getDivColor(p.id,p.highlight))
        .style("border-color",p=>p.highlight?getDivColor(p.id,1):null);
    phtr.selectAll(".remove").data(p=>p.highlight?[p]:[])
        .join("span").attr("class","remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removeCopies(p); });
}

var channelbox_x = c => c?-86:-36,
    channelbox_tr = c => "translate("+channelbox_x(c)+",0)";
function setCurves(p, avg, lr) {
    var dx = +avg - +p.avg;
    p.avg = avg;
    if (!p.isTarget) {
        var id = n => p.brand.name + " " + p.dispName + " ("+n+")";
        p.activeCurves = avg && !has1Channel(p)
            ? [{id:id("AVG"), l:avgCurves(p.channels), p:p, o:0}]
            : p.channels.map((l,i) => ({id:id(LR[i]), l:l, p:p, o:-1+2*i}))
                        .filter(c => c.l);
    } else {
        p.activeCurves = [{id:p.fullName, l:p.channels[0], p:p, o:0}];
    }
    var y = 0;
    var k = d3.selectAll(".keyLine").filter(q=>q===p);
    var ksb = k.select(".keySelBoth").attr("display","none");
    if (lr!==undefined) {
        p.activeCurves = [p.activeCurves[lr]];
        y = [-1,1][lr];
        ksb.attr("display",null).attr("y", [0,-12][lr]);
    }
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
function redrawLine(p) {
    var getTr = o => o ? "translate(0,"+(y(o)-y(0))+")" : null;
    p.attr("transform", c => getTr(c.p.offset)).attr("d", drawLine);
}
function updateYCenter(c) {
    var c = yCenter;
    yCenter = baseline.p ? 0 : norm_sel ? 60 : norm_phon;
    y.domain(y.domain().map(d=>d+(yCenter-c)));
    yAxisObj.call(fmtY);
}
function setBaseline(b) {
    baseline = b;
    updateYCenter();
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select(".button")
        .classed("selected", p=>p===baseline.p);
}
function getBaseline(p) {
    var l = p.avg || has1Channel(p) ? p.activeCurves[0].l
                                    : avgCurves(p.channels),
        b = l.map(d => d[1]+p.offset);
    return { p:p, fn:l=>l.map((e,i)=>[e[0],e[1]-b[i]]) };
}

function setOffset(p, o) {
    p.offset = +o;
    if (baseline.p === p) { baseline = getBaseline(p); }
    updatePaths();
}

function setHover(elt, h) {
    elt.on("mouseover", h(true)).on("mouseout", h(false));
}

function updatePaths() {
    var c = flatten(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path").attr("stroke", getColor_AC).call(redrawLine);
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
    td().html(p=>p.isTarget?"":p.brand.name+"&nbsp;").call(addModel);
    td().append("svg").call(addKey);
    td().append("input")
        .attrs({type:"number",step:"none",value:0})
        .property("value", p=>p.offset)
        .on("change input",function(p){ setOffset(p, +this.value); });
    td().attr("class","button")
        .html("<svg viewBox='-170 -120 340 240'><use xlink:href='#baseline-icon'></use></svg>")
        .on("click", p => setBaseline(p===baseline.p ? baseline0
                                                     : getBaseline(p)));
    function toggleHide(p) {
        var h = p.hide;
        var t = table.selectAll("tr").filter(q=>q===p);
        t.select(".keyLine").on("click", h?null:toggleHide)
            .selectAll("path,.imbalance").attr("opacity", h?null:0.5);
        t.select(".hideIcon").classed("selected", !h);
        gpath.selectAll("path").filter(c=>c.p===p)
            .attr("opacity", h?null:0);
        p.hide = !h;
    }
    td().attr("class","button hideIcon")
        .html("<svg viewBox='-2.5 0 19 12'><use xlink:href='#hide-icon'></use></svg>")
        .on("click", toggleHide);
    td().attr("class","button")
        .html("<svg viewBox='-135 -100 270 200'><use xlink:href='#pin-icon'></use></svg>")
        .on("click",function(p){
            if (cantCompare(activePhones.filter(p=>p.pin).length+1)) return;
            p.pin = true; nextPN = null;
            d3.select(this)
                .text(null).classed("button",false)
                .insert("svg").attr("class","pinMark")
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
    var t = s.append("g");
    t.append("path")
        .attr("stroke", p => p.isTarget ? getCurveColor(p.id,0)
                                        : "url(#chgrad"+p.id+")");
    t.selectAll().data(p=>p.isTarget?[]:LR)
        .join("text")
        .attrs({x:17, y:(_,i)=>[-6,6][i], dy:"0.32em", "text-anchor":"start", "font-size":10.5})
        .text(t=>t);
    t.filter(p=>p.isTarget).append("text")
        .attrs({x:17, y:0, dy:"0.32em", "text-anchor":"start",
                "font-size":8, fill:p=>getCurveColor(p.id,0)})
        .text("Target");
    var scuh = f => function (p) {
        setCurves(p, f(p));
        updatePaths(); hl(p,true);
    }
    s.append("rect").attr("class","keySelBoth")
        .attrs({x:40+channelbox_x(0), width:40, height:12,
                opacity:0, display:"none"})
        .on("click", scuh(p=>0));
    s.append("g").attr("class","keySel")
        .attr("transform",p=>channelbox_tr(p.avg))
        .on("click", scuh(p=>!p.avg))
        .selectAll().data([0,80]).join("rect")
        .attrs({x:d=>d, y:-12, width:40, height:24, opacity:0});
    var o = s.selectAll().data(p=>[[p,0],[p,1]])
        .join("g").attr("class","keyOnly")
        .attr("transform",pi=>"translate(25,"+[-6,6][pi[1]]+")")
        .call(setHover, h => function (pi) {
            var p = pi[0], cs = p.activeCurves;
            if (!p.hide && cs.length===2) {
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
    s.append("text").attr("class","imbalance")
        .attrs({x:8,y:0,dy:"0.35em","font-size":10.5})
        .text("!");
    updateKey(s);
}

function updateKey(s) {
    var disp = fn => e => e.attr("display",p=>fn(p)?null:"none");
    s.select(".imbalance").call(disp(hasImbalance));
    s.select(".keySel").call(disp(p=>!has1Channel(p)));
    s.selectAll(".keyOnly").call(disp(pi=>!has1Channel(pi[0])));
    s.selectAll("text").data(p=>p.channels).call(disp(c=>c));
    s.select("g").attr("mask",p=>has1Channel(p)?null:"url(#chmask"+p.id+")");
    s.select("path").attr("d", p =>
        p.isTarget ? "M15 0H-17" :
        ["M15 -6H9C0 -6,0 0,-9 0H-17","M-17 0H-9C0 0,0 6,9 6H15"]
            .filter((_,i) => p.channels[i])
            .reduce((a,b) => a+b.slice(6))
    );
}

function addModel(t) {
    t.each(function (p) { if (!p.vars) { p.vars = {}; } });
    var n = t.append("div").attr("class","phonename").text(p=>p.dispName);
    t.filter(p=>p.fileNames)
        .append("svg").attr("class","variants")
        .call(function (s) {
            s.attr("viewBox","0 -2 10 11");
            s.append("path").attr("fill","currentColor")
                .attr("d","M1 2L5 6L9 2L8 1L6 3Q5 4 4 3L2 1Z");
        })
        .attr("tabindex",0) // Make focusable
        .on("focus", function (p) {
            if (p.selectInProgress) return;
            p.selectInProgress = true;
            p.vars[p.fileName] = p.channels;
            d3.select(this)
                .on("mousedown", function () {
                    d3.event.preventDefault();
                    this.blur();
                })
                .select("path").attr("transform","translate(0,7)scale(1,-1)");
            var n = d3.select(this.parentElement).select(".phonename");
            n.text("");
            var q = p.copyOf || p,
                o = q.objs || [p],
                active_fns = o.map(v=>v.fileName),
                dns = q.dispNames || q.fileNames;
                vars = p.fileNames.map((f,i) => {
                    var j = active_fns.indexOf(f);
                    return j!==-1 ? o[j] :
                        {fileName:f, dispName:dns[i]};
                });
            var d = n.selectAll().data(vars).join("div")
                     .attr("class","variantName").text(v=>v.dispName),
                w = d.nodes().map(d=>d.getBoundingClientRect().width)
                     .reduce((a,b)=>Math.max(a,b));
            d.style("width",w+"px");
            d.filter(v=>v.active)
                .style("cursor","initial")
                .style("color", getTextColor)
                .call(setHover, h => p =>
                    table.selectAll("tr").filter(q=>q===p)
                        .classed("highlight", h)
                );
            var c = n.selectAll().data(vars).join("div")
                .html("&nbsp;⇲&nbsp;").attr("class","variantPopout")
                .style("left",(w+5)+"px")
                .style("display",v=>v.active?"none":null);
            [d,c].forEach(e=>e.transition().style("top",(_,i)=>i*1.3+"em"));
            d.filter(v=>!v.active).on("mousedown", v => Object.assign(p,v));
            c.on("mousedown", function (v,i) {
                if (cantCompare(activePhones.length)) return;
                if (!q.objs) { q.objs = [q]; }
                v.active=true; v.copyOf=q;
                ["brand","fileNames","vars"].map(k=>v[k]=q[k]);
                q.objs.push(v);
                changeVariant(v, showPhone);
            });
        })
        .on("blur", function endSelect(p) {
            if (document.activeElement === this) return;
            p.selectInProgress = false;
            d3.select(this)
                .on("mousedown", null)
                .select("path").attr("transform", null);
            var n = d3.select(this.parentElement).select(".phonename");
            n.selectAll("div")
                .call(setHover, h=>p=>null)
                .transition().style("top",0+"em").remove()
                .end().then(()=>n.text(p=>p.dispName));
            changeVariant(p, updateVariant);
            table.selectAll("tr").classed("highlight", false); // Prevents some glitches
        });
    t.filter(p=>p.isTarget).append("span").text(" Target");
}

function updateVariant(p) {
    updateKey(table.selectAll("tr").filter(q=>q===p).select(".keyLine"));
    updatePaths();
}
function changeVariant(p, update) {
    var fn = p.fileName,
        ch = p.vars[fn];
    function set(ch) {
        p.channels = ch;
        setCurves(p, p.avg);
        update(p);
    }
    if (ch) {
        set(ch);
    } else {
        loadFiles(p, set);
    }
}

var f_values; // Assumed to be the same for all headphones
var fr_to_ind = fr => d3.bisect(f_values, fr, 0, f_values.length-1);
var norm_sel = 0,
    norm_fr = 1000,
    norm_phon = 60;
function normalizePhone(p) {
    if (norm_sel) { // fr
        var i = fr_to_ind(norm_fr);
        var avg = l => 20*Math.log10(l.map(d=>Math.pow(10,d/20))
                                      .reduce((a,b)=>a+b) / l.length);
        p.offset = 60 - avg(validChannels(p).map(l=>l[i][1]));
    } else { // phon
        p.offset = find_offset(avgCurves(p.channels).map(v=>v[1]), norm_phon);
    }
}

var norms = d3.select(".normalize").selectAll("div");
norms.classed("selected",(_,i)=>i===norm_sel);
function setNorm(_, i, change) {
    if (change !== false) {
        if (!this.checkValidity()) return;
        var v = +this.value;
        if (norm_sel) { norm_fr=v; } else { norm_phon=v; }
    }
    norm_sel = i;
    norms.classed("selected",(_,i)=>i===norm_sel);
    activePhones.forEach(normalizePhone);
    if (baseline.p) { baseline = getBaseline(baseline.p); }
    updateYCenter();
    updatePaths();
    table.selectAll("tr").select("input[type=number]")
        .property("value", p=>p.offset);
}
norms.select("input")
    .on("change input",setNorm)
    .on("keypress", function(_, i) {
        if (d3.event.key==="Enter") { setNorm.bind(this)(_,i); }
    });
norms.select("span").on("click", (_,i)=>setNorm(_,i,false));

var addPhoneSet = false; // Whether add phone button was clicked
function setAddButton(a) {
    if (a && cantCompare(activePhones.length)) return;
    if (addPhoneSet === a) return;
    addPhoneSet = a;
    d3.select(".addPhone").classed("selected", a);
}
d3.select(".addPhone").on("click", ()=>setAddButton(!addPhoneSet));

function showPhone(p, exclusive) {
    if (addPhoneSet) {
        exclusive = false;
        setAddButton(false);
    }
    if (!exclusive && cantCompare(activePhones.length)) return;
    if (!p.channels) {
        loadFiles(p, function (ch) {
            if (p.channels) return;
            p.channels = ch;
            if (!f_values) { f_values = ch[0].map(d=>d[0]); }
            showPhone(p, exclusive);
        });
        return;
    }
    if (p.id === undefined) { p.id = getPhoneNumber(); }
    normalizePhone(p);
    if (exclusive) {
        activePhones = activePhones.filter(q=>q.active=q.copyOf===p||q.pin);
        if (baseline.p && !baseline.p.active) baseline = baseline0;
    }
    if (activePhones.indexOf(p)===-1 && !p.objs) {
        if (activePhones.length===1 && activePhones[0].activeCurves.length!==1) {
            setCurves(activePhones[0], true);
        }
        if (!p.isTarget) {
            activePhones.push(p);
        } else {
            activePhones.unshift(p);
        }
        p.active = true;
        setCurves(p, activePhones.length > 1);
    }
    updatePaths();
    updatePhoneTable();
    d3.select("#phones").selectAll("div")
        .filter(p=>p.id!==undefined)
        .call(setPhoneTr);
    if (p.fileNames && !p.copyOf) {
        table.selectAll("tr").filter(q=>q===p).select(".variants").node().focus();
    }
}

function removeCopies(p) {
    if (p.objs) {
        p.objs.forEach(q=>q.active=false);
        delete p.objs;
    }
    removePhone(p);
}
function removePhone(p) {
    p.active = p.pin = false; nextPN = null;
    activePhones = activePhones.filter(q => q.active);
    if (activePhones.length === 1) {
        setCurves(activePhones[0], false);
    }
    updatePaths();
    if (baseline.p && !baseline.p.active) { setBaseline(baseline0); }
    updatePhoneTable();
    d3.select("#phones").selectAll("div")
        .filter(q=>q===(p.copyOf||p))
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
                    if (p.suffix) {
                        r.dispNames = p.suffix.map(
                            s => p.name + (s ? " "+s : "")
                        );
                    }
                    r.dispName = (r.dispNames||r.fileNames)[0];
                }
            }
            r.dispName = r.dispName || r.phone;
            r.fullName = b.name + " " + r.phone;
            return r;
        });
    });
    if (targets) {
        var b = { name:"Targets", active:false };
        b.phoneObjs = targets.map((t,i) => ({
            isTarget:true, id:i-targets.length, brand:b,
            dispName:t, phone:t, fullName:t+" Target", fileName:t+" Target"
        }));
        brands.unshift(b);
    }

    var allPhones = flatten(brands.map(b=>b.phoneObjs)),
        currentBrands = [];
    showPhone(allPhones[targets.length],1);

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
        (p.objs||[p]).forEach(q=>hl(q,h));
    }
    var phoneSel = d3.select("#phones").selectAll()
        .data(allPhones).join("div")
        .on("mouseover", bg(true, p => getDivColor(p.id===undefined?nextPhoneNumber():p.id, true)))
        .on("mouseout" , bg(false,p => p.id!==undefined?getDivColor(p.id,p.active):null))
        .call(setClicks(showPhone));
    phoneSel.append("span").text(p=>p.fullName);

    function setBrand(b, exclusive) {
        var incl = currentBrands.indexOf(b) !== -1;
        if (exclusive || currentBrands.length===0) {
            currentBrands.forEach(br => br.active = false);
            if (incl) {
                currentBrands = [];
                phoneSel.style("display", null);
                phoneSel.select("span").text(p=>p.fullName);
            } else {
                currentBrands = [b];
                phoneSel.style("display", p => p.brand===b?null:"none");
                phoneSel.filter(p => p.brand===b).select("span").text(p=>p.phone);
            }
        } else {
            if (incl) return;
            if (currentBrands.length === 1) {
                phoneSel.select("span").text(p=>p.fullName);
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
        d3.select(this).attr("placeholder",null);
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

    d3.select("#recolor").on("click", function () {
        allPhones.forEach(p => { if (!p.isTarget) { delete p.id; } });
        phoneNumber = 0; nextPN = null;
        activePhones.forEach(p => { if (!p.isTarget) { p.id = getPhoneNumber(); } });
        updatePaths();
        var c = p=>p.active?getDivColor(p.id,true):null;
        d3.select("#phones").selectAll("div").filter(p=>!p.isTarget)
            .style("background",c).style("border-color",c);
        var t = table.selectAll("tr").filter(p=>!p.isTarget)
            .style("color", c)
            .select("td:nth-child(3)"); // Key line
        t.select("svg").remove();
        t.append("svg").call(addKey);
    });
});

var pathHoverTimeout;
function pathHL(c, m, imm) {
    gpath.selectAll("path").classed("highlight", c ? d=>d===c   : false);
    table.selectAll("tr")  .classed("highlight", c ? p=>p===c.p : false);
    if (pathHoverTimeout) { clearTimeout(pathHoverTimeout); }
    gr.selectAll(".tooltip").remove();
    pathHoverTimeout =
        imm ? pathTooltip(c, m) :
        c   ? setTimeout(pathTooltip, 400, c, m) :
        undefined;
}
function pathTooltip(c, m) {
    var g = gr.selectAll(".tooltip").data([c.id])
        .join("g").attr("class","tooltip");
    var t = g.append("text")
        .attrs({x:m[0], y:m[1]-6, fill:getTooltipColor(c)})
        .text(t=>t);
    var b = t.node().getBBox(),
        o = pad.l+W - b.width;
    if (o < b.x) { t.attr("x",o); b.x=o; }
    // Background
    g.insert("rect", "text")
        .attrs({x:b.x-1, y:b.y-1, width:b.width+2, height:b.height+2});
}
var graphInteract = imm => function () {
    var cs = flatten(activePhones.map(p=>p.hide?[]:p.activeCurves));
    if (!cs.length) return;
    var m = d3.mouse(this),
        d = 30 * W0 / gr.node().getBoundingClientRect().width,
        r = [-1,1].map(s => d3.bisectLeft(f_values, x.invert(m[0]+d*s)));
    var ind = cs
        .map(c =>
            baseline.fn(c.l).slice(Math.max(r[0],0), r[1]+1)
                .map(p => Math.hypot(x(p[0])-m[0], y(p[1]+c.p.offset)-m[1]))
                .reduce((a,b)=>Math.min(a,b), d)
        )
        .reduce((a,b,i) => b<a[1] ? [i,b] : a, [-1,d])[0];
    pathHL(ind===-1 ? false : cs[ind], m, imm);
}
gr.append("rect")
    .attrs({x:pad.l,y:pad.t,width:W,height:H,opacity:0})
    .on("mousemove", graphInteract())
    .on("mouseout", ()=>pathHL(false))
    .on("click", graphInteract(true));
