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

function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
}
function getAvg(p) {
    return p.avg          ? p.activeCurves[0].l
         : has1Channel(p) ? validChannels(p)[0]
         :                  avgCurves(p.channels);
}
function hasImbalance(p) {
    if (has1Channel(p)) return false;
    var as = p.channels[0], bs = p.channels[1];
    var s0=0, s1=0;
    return as.some((a,i) => {
        var d = a[1]-bs[i][1];
        d *= 1/(50 * Math.sqrt(1+Math.pow(a[0]/1e4,6)));
        s0 = Math.max(s0+d,0);
        s1 = Math.max(s1-d,0);
        return Math.max(s0,s1) > max_channel_imbalance;
    });
}

var activePhones = [];
var baseline0 = { p:null, l:null, fn:l=>l },
    baseline = baseline0;

var gpath = gr.insert("g",".dBScaler")
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

let cantCompare;
if (typeof max_compare !== "undefined") {
    const currency = [
        ["$", "#348542"],
        ["¥", "#d11111"],
        ["€", "#2961d4"],
        ["฿", "#dcaf1d"]
    ];
    let currencyCounter = -1,
        lastMessage = null,
        messageWeight = 0;
    if (typeof disallow_target === "undefined") { disallow_target=false; }
    cantCompare = function(m, target, noMessage) {
        if (m<max_compare && !(target&&disallow_target)) { return false; }
        if (noMessage) { return true; }
        var div = d3.select("body").append("div");
        var c = currency[currencyCounter++ % currency.length];
        var lm = lastMessage;
        lastMessage = Date.now();
        messageWeight *= Math.pow(2, (lm?lm-lastMessage:0)/3e4); // 30-second half-life
        messageWeight++;
        if (!currencyCounter || messageWeight>=2) {
            messageWeight /= 2;
            var button = div.attr("class","cashMessage")
                .html(premium_html)
                .append("button").text("Fine")
                .on("mousedown", ()=>messageWeight=0);
            button.node().focus();
            var back = d3.select("body").append("div")
                .attr("class","fadeAll");
            [button,back].forEach(e =>
                e.on("click", ()=>[div,back].forEach(e=>e.remove()))
            );
        } else {
            div.attr("class","cash")
                .style("color",c[1]).text(c[0])
                .transition().duration(120).remove();
        }
        return true;
    }
} else {
    cantCompare = function(m) { return false; }
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
                d = id => d3.min(pin, l(id));
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
    phtr.style("background",p=>p.isTarget&&!p.active?null:getDivColor(p.id,p.highlight))
        .style("border-color",p=>p.highlight?getDivColor(p.id,1):null);
    phtr.filter(p=>!p.isTarget)
        .selectAll(".remove").data(p=>p.highlight?[p]:[])
        .join("span").attr("class","remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removeCopies(p); });
}

var channelbox_x = c => c?-86:-36,
    channelbox_tr = c => "translate("+channelbox_x(c)+",0)";
function setCurves(p, avg, lr) {
    var dx = +avg - +p.avg;
    p.avg = avg;
    if (!p.isTarget) {
        var id = n => p.dispBrand + " " + p.dispName + " ("+n+")";
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
    p.attr("transform", c => getTr(getOffset(c.p))).attr("d", drawLine);
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
    clearLabels();
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select(".button")
        .classed("selected", p=>p===baseline.p);
}
function getBaseline(p) {
    var b = getAvg(p).map(d => d[1]+getOffset(p));
    return { p:p, fn:l=>l.map((e,i)=>[e[0],e[1]-b[i]]) };
}

function setOffset(p, o) {
    p.offset = +o;
    if (baseline.p === p) { baseline = getBaseline(p); }
    updatePaths();
}
var getOffset = p => p.offset + p.norm;

function setHover(elt, h) {
    elt.on("mouseover", h(true)).on("mouseout", h(false));
}

function updatePaths() {
    clearLabels();
    var c = d3.merge(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path").attr("opacity", c=>c.p.hide?0:null)
        .attr("stroke", getColor_AC).call(redrawLine);
}
var colorBar = p=>'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 8"><path d="M0 8v-8h1c0.05 1.5,-0.3 3,-0.16 5s0.1 2,0.15 3z" opacity="0.85" fill="'+getCurveColor(p.id,0)+'"/></svg>\')';
function updatePhoneTable() {
    var c = table.selectAll("tr").data(activePhones, p=>p.id);
    c.exit().remove();
    var f = c.enter().append("tr"),
        td = () => f.append("td");
    f   .call(setHover, h => p => hl(p,h))
        .style("color", p => getDivColor(p.id,true));

    td().attr("class","remove").text("⊗")
        .on("click", removePhone)
        .style("background-image",colorBar)
        .style("background-size","contain").style("background-repeat","no-repeat");
    td().html(p=>p.isTarget?"":p.dispBrand+"&nbsp;").call(addModel);
    td().append("svg").call(addKey);
    td().append("input")
        .attrs({type:"number",step:"any",value:0})
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
        clearLabels();
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
                clearLabels();
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
            p.vars[p.fileName] = p.rawChannels;
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
                w = d3.max(d.nodes(), d=>d.getBoundingClientRect().width);
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
                ["brand","dispBrand","fileNames","vars"].map(k=>v[k]=q[k]);
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
    normalizePhone(p);
    updatePaths();
}
function changeVariant(p, update) {
    var fn = p.fileName,
        ch = p.vars[fn];
    function set(ch) {
        p.rawChannels = ch; p.smooth = undefined;
        smoothPhone(p);
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
function range_to_slice(xs, fn) {
    var r = xs.map(v => d3.bisectLeft(f_values, x.invert(fn(v))));
    return a => a.slice(Math.max(r[0],0), r[1]+1);
}
var norm_sel = 0,
    norm_fr = 1000,
    norm_phon = 60;
function normalizePhone(p) {
    if (norm_sel) { // fr
        var i = fr_to_ind(norm_fr);
        var avg = l => 20*Math.log10(d3.mean(l, d=>Math.pow(10,d/20)));
        p.norm = 60 - avg(validChannels(p).map(l=>l[i][1]));
    } else { // phon
        p.norm = find_offset(getAvg(p).map(v=>v[1]), norm_phon);
    }
}

var norms = d3.select(".normalize").selectAll("div");
norms.classed("selected",(_,i)=>i===norm_sel);
function setNorm(_, i, change) {
    if (change !== false) {
        if (!this.checkValidity()) return;
        var v = +this.value;
        if (i) { norm_fr=v; } else { norm_phon=v; }
    }
    norm_sel = i;
    norms.classed("selected",(_,i)=>i===norm_sel);
    activePhones.forEach(normalizePhone);
    if (baseline.p) { baseline = getBaseline(baseline.p); }
    updateYCenter();
    updatePaths();
}
norms.select("input")
    .on("change input",setNorm)
    .on("keypress", function(_, i) {
        if (d3.event.key==="Enter") { setNorm.bind(this)(_,i); }
    });
norms.select("span").on("click", (_,i)=>setNorm(_,i,false));

var addPhoneSet = false, // Whether add phone button was clicked
    addPhoneLock= false;
function setAddButton(a) {
    if (a && cantCompare(activePhones.length)) return false;
    if (addPhoneSet !== a) {
        addPhoneSet = a;
        d3.select(".addPhone").classed("selected", a)
            .classed("locked", addPhoneLock &= a);
    }
    return true;
}
d3.select(".addPhone").selectAll("td")
    .on("click", ()=>setAddButton(!addPhoneSet));
d3.select(".addLock").on("click", function () {
    d3.event.preventDefault();
    var on = !addPhoneLock;
    if (!setAddButton(on)) return;
    if (on) {
        d3.select(".addPhone").classed("locked", addPhoneLock=true);
    }
});

function showPhone(p, exclusive, suppressVariant) {
    if (p.isTarget && activePhones.indexOf(p)!==-1) {
        removePhone(p);
        return;
    }
    if (addPhoneSet) {
        exclusive = false;
        if (!addPhoneLock || cantCompare(activePhones.length+1,null,true)) {
            setAddButton(false);
        }
    }
    if (cantCompare(exclusive?0:activePhones.length, p.isTarget)) return;
    if (!p.rawChannels) {
        loadFiles(p, function (ch) {
            if (p.rawChannels) return;
            p.rawChannels = ch;
            if (!f_values) { f_values = ch[0].map(d=>d[0]); }
            showPhone(p, exclusive, suppressVariant);
        });
        return;
    }
    smoothPhone(p);
    if (p.id === undefined) { p.id = getPhoneNumber(); }
    normalizePhone(p); p.offset=p.offset||0;
    if (exclusive) {
        activePhones = activePhones.filter(q=>
            q.active = q.copyOf===p || q.pin || q.isTarget!==p.isTarget
        );
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
    d3.selectAll("#phones div,.target")
        .filter(p=>p.id!==undefined)
        .call(setPhoneTr);
    if (!suppressVariant && p.fileNames && !p.copyOf) {
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
    d3.selectAll("#phones div,.target")
        .filter(q=>q===(p.copyOf||p))
        .call(setPhoneTr);
}

d3.json(DIR+"phone_book.json").then(function (brands) {
    var brandMap = {},
        inits = [],
        hasInit = typeof init_phones !== "undefined",
        isInit =  hasInit ? f => init_phones.indexOf(f) !== -1
                          : _ => false;
    brands.forEach(b => brandMap[b.name] = b);
    brands.forEach(function (b) {
        b.active = false;
        b.phoneObjs = b.phones.map(function (p) {
            var r = { brand:b, dispBrand:b.name };
            var init = -2;
            if (typeof p === "string") {
                r.phone = r.fileName = p;
            } else {
                r.phone = p.name;
                if (p.collab) {
                    r.dispBrand += " x "+p.collab;
                    r.collab = brandMap[p.collab];
                }
                var f = p.file || p.name;
                if (typeof f === "string") {
                    r.fileName = f;
                } else {
                    r.fileNames = f;
                    init = f.map(isInit).indexOf(true);
                    var ind = Math.max(0, init);
                    r.fileName = f[ind];
                    if (p.suffix) {
                        r.dispNames = p.suffix.map(
                            s => p.name + (s ? " "+s : "")
                        );
                    } else if (p.prefix) {
                        let reg = new RegExp("^"+p.prefix+"\s*", "i");
                        r.dispNames = f.map(n => {
                            n = n.replace(reg, "");
                            return p.name + (n.length ? " "+n : n);
                        });
                    }
                    r.dispName = (r.dispNames||r.fileNames)[ind];
                }
            }
            r.dispName = r.dispName || r.phone;
            r.fullName = r.dispBrand + " " + r.phone;
            if (init===-2 ? isInit(r.fileName) : init>=0) { inits.push(r); }
            return r;
        });
    });

    var allPhones = d3.merge(brands.map(b=>b.phoneObjs)),
        currentBrands = [];
    if (!hasInit) inits.push(allPhones[0]);
    inits.map(p => showPhone(p,0,1));

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

    if (targets) {
        var b = { name:"Targets", active:false },
            ti = -targets.length,
            ph = t => ({
                isTarget:true, brand:b,
                dispName:t, phone:t, fullName:t+" Target", fileName:t+" Target"
            });
        var l = (text,c) => s => s.append("div").attr("class","targetLabel").append("span").text(text);
        var ts = b.phoneObjs = d3.select(".targets").call(l("Targets"))
            .selectAll().data(targets).join().call(l(t=>t.type))
            .style("flex-grow",t=>t.files.length).attr("class","targetClass")
            .selectAll().data(t=>t.files.map(ph))
            .join("div").text(t=>t.dispName).attr("class","target")
            .call(setClicks(showPhone))
            .data();
        ts.forEach((t,i)=>t.id=i-ts.length);
    }

    function setBrand(b, exclusive) {
        var incl = currentBrands.indexOf(b) !== -1;
        var hasBrand = (p,b) => p.brand===b || p.collab===b;
        if (exclusive || currentBrands.length===0) {
            currentBrands.forEach(br => br.active = false);
            if (incl) {
                currentBrands = [];
                phoneSel.style("display", null);
                phoneSel.select("span").text(p=>p.fullName);
            } else {
                currentBrands = [b];
                phoneSel.style("display", p => hasBrand(p,b)?null:"none");
                phoneSel.filter(p => hasBrand(p,b)).select("span").text(p=>p.phone);
            }
        } else {
            if (incl) return;
            if (currentBrands.length === 1) {
                phoneSel.select("span").text(p=>p.fullName);
            }
            currentBrands.push(b);
            phoneSel.filter(p => hasBrand(p,b)).style("display", null);
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
                {weight:0.3, name:"dispBrand"},
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
        var test = p => c.indexOf(p.brand )!==-1
                     || c.indexOf(p.collab)!==-1;
        if (this.value.length > 1) {
            var s = phoneSearch.search(this.value),
                t = c.length ? s.filter(test) : s;
            if (t.length) s = t;
            fn = p => s.indexOf(p)!==-1;
            var b = brandSearch.search(this.value);
            if (b.length) bl = b;
        } else {
            fn = c.length ? test : (p=>true);
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
        d3.select("#phones").selectAll("div")
            .style("background",c).style("border-color",c);
        var t = table.selectAll("tr").filter(p=>!p.isTarget)
            .style("color", c)
            .call(s => s.select(".remove").style("background-image",colorBar))
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
    clearLabels();
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
var interactInspect = false;
var graphInteract = imm => function () {
    var cs = d3.merge(activePhones.map(p=>p.hide?[]:p.activeCurves));
    if (!cs.length) return;
    var m = d3.mouse(this);
    if (interactInspect) {
        var ind = fr_to_ind(x.invert(m[0])),
            x1 = x(f_values[ind]),
            x0 = ind>0 ? x(f_values[ind-1]) : x1,
            sel= m[0]-x0 < x1-m[0],
            xv = sel ? x0 : x1;
        ind -= sel;
        function init(e) {
            e.attr("class","inspector");
            e.append("line").attrs({x1:0,x2:0, y1:pad.t,y2:pad.t+H});
            e.append("text").attr("class","insp_dB").attr("x",2);
        }
        var insp = gr.selectAll(".inspector").data([xv])
            .join(enter => enter.append("g").call(init))
            .attr("transform",xv=>"translate("+xv+",0)");
        var dB = insp.select(".insp_dB").text(f_values[ind]+" Hz");
        var cy = cs.map(c => [c, baseline.fn(c.l)[ind][1]+getOffset(c.p)]);
        cy.sort((d,e) => d[1]-e[1]);
        function newTooltip(t) {
            t.attr("class","tooltip")
                .attr("fill",d=>getTooltipColor(d));
            t.append("text").attr("x",2).text(d=>d.id);
            t.append("g").selectAll().data([0,1])
                .join("text")
                .attr("x",-16)
                .attr("text-anchor",i=>i?"start":"end");
            t.datum(function(){return this.getBBox();});
            t.insert("rect", "text")
                .attrs(b=>({x:b.x-1, y:b.y-1, width:b.width+2, height:b.height+2}));
        }
        var tt = insp.selectAll(".tooltip").data(cy.map(d=>d[0]), d=>d.id)
            .join(enter => enter.insert("g","line").call(newTooltip));
        var start = tt.select("g").datum((_,i) => cy[i][1])
            .selectAll("text").data(d => {
                var s=d<-0.05?"-":""; d=Math.abs(d)+0.05;
                return [s+Math.floor(d)+".",Math.floor((d%1)*10)];
            })
            .text(t=>t)
            .filter((_,i)=>i===0)
            .nodes().map(n=>n.getBBox().x-2);
        tt.select("rect")
            .attrs((b,i)=>({x:b.x+start[i]-1, width:b.width-start[i]+2}));
        // Now compute heights
        var hm = d3.max(tt.data().map(b=>b.height)),
            hh = (y.invert(0)-y.invert(hm-1))/2,
            stack = [];
        cy.map(d=>d[1]).forEach(function (h,i) {
            var n = 1;
            var overlap = s => h/n - s.h/s.n <= hh*(s.n+n);
            var l = stack.length;
            while (l && overlap(stack[--l])) {
                var s = stack.pop();
                h += s.h; n += s.n;
            }
            stack.push({h:h, n:n});
        });
        var ch = d3.merge(stack.map((s,i) => {
            var h = s.h/s.n - (s.n-1)*hh;
            return d3.range(s.n).map(k => h+k*2*hh);
        }));
        tt.attr("transform",(_,i) => "translate(0,"+(y(ch[i])+5)+")");
        dB.attr("y", y(ch[ch.length-1]+2*hh)+1);
    } else {
        var d = 30 * W0 / gr.node().getBoundingClientRect().width,
            sl= range_to_slice([-1,1],s=>m[0]+d*s);
        var ind = cs
            .map(c =>
                sl(baseline.fn(c.l))
                    .map(p => Math.hypot(x(p[0])-m[0], y(p[1]+getOffset(c.p))-m[1]))
                    .reduce((a,b)=>Math.min(a,b), d)
            )
            .reduce((a,b,i) => b<a[1] ? [i,b] : a, [-1,d])[0];
        pathHL(ind===-1 ? false : cs[ind], m, imm);
    }
}
function stopInspect() { gr.selectAll(".inspector").remove(); }
gr.append("rect")
    .attrs({x:pad.l,y:pad.t,width:W,height:H,opacity:0})
    .on("mousemove", graphInteract())
    .on("mouseout", ()=>interactInspect?stopInspect():pathHL(false))
    .on("click", graphInteract(true));

d3.select("#inspector").on("click", function () {
    clearLabels(); stopInspect();
    d3.select(this).classed("selected", interactInspect = !interactInspect);
});

d3.select("#expandTools").on("click", function () {
    var t=d3.select(".tools"), cl="collapse", v=!t.classed(cl);
    [t,d3.select(".targets")].forEach(s=>s.classed(cl, v));
});

d3.selectAll(".helptip").on("click", function() {
    var e = d3.select(this);
    e.classed("active", !e.classed("active"));
});
