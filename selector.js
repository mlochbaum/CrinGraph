var fileNames = name => ["L","R"].map(s=>name+" "+s+".txt");

function flatten(l) { return [].concat.apply([],l); }
function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
}
function hasImbalance(curves) {
    var as = curves[0], bs = curves[1];
    return as.some((a,i) => Math.abs(a[1]-bs[i][1]) > max_channel_imbalance);
}

var activePhones = [];
var phoneNumber = 0; // I'm so sorry it just happened
var baseline0 = { p:null, l:null, fn:l=>l },
    baseline = baseline0;

var gpath = gr.insert("g",".rangeButton")
    .attr("fill","none")
    .attr("stroke-width",3)
    .attr("mask","url(#graphFade)");
var table = d3.select(".curves");

function getCurveColor(id, o) {
    var p1 = 1.1673039782614187,
        p2 = p1*p1,
        p3 = p2*p1;
    var t = o/20;
    var i=(1.18-id)/p3, j=(id+0.2)/p2, k=(id+0.4)/p1;
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

function setPhoneTr(phtr) {
    phtr.style("background",p=>getDivColor(p.id,p.active))
        .style("border-color",p=>p.active?getDivColor(p.id,1):null);
    phtr.selectAll(".remove").data(p=>p.active?[p]:[])
        .join("span").attr("class","remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removePhone(p); });
}

var channelbox_tr = c => "translate("+(c?-86:-36)+",0)";
function setCurves(p, avg) {
    p.activeCurves = avg
        ? [{id:p.phone+" AVG", l:avgCurves(p.channels), p:p, o:0}]
        : p.channels.map((l,i) => ({id:p.files[i], l:l, p:p, o:-1+2*i}));
    d3.selectAll(".keyLine").filter(q=>q===p)
        .select("g").transition().duration(400)
        .attr("transform", channelbox_tr(avg));
}

var drawLine = d => line(baseline.fn(d.l));
function updateBaseline() {
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select("button")
        .classed("selected", p=>p===baseline.p);
}
function setBaseline(b) { baseline=b; updateBaseline(); }

function updatePaths() {
    var c = flatten(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path")
        .attr("stroke", getColor_AC)
        .attr("d", drawLine);
}
function updatePhoneTable() {
    var c = table.selectAll("tr").data(activePhones, p=>p.id);
    c.exit().remove();
    var f = c.enter().append("tr"),
        td = () => f.append("td");
    td().attr("class","remove").text("⊗")
        .on("click", removePhone);
    td().text(p=>p.brand.name+" ")
        .append("span").attr("class","phonename").text(p=>p.phone);
    td().append("svg").attr("class","keyLine").attr("viewBox","-19 -12 50 24").call(function (s) {
        var defs = s.append("defs");
        defs.append("linearGradient").attr("id", p=>"chgrad"+p.id)
            .attrs({x1:0,y1:0, x2:0,y2:1})
            .selectAll().data(p=>[0.1,0.4,0.6,0.9].map(o =>
                [o, getCurveColor(p.id, o<0.3?-1:o<0.7?0:1)]
            )).join("stop")
            .attr("offset",i=>i[0])
            .attr("stop-color",i=>i[1]);
        defs.append("linearGradient").attr("id","blgrad")
            .selectAll().data([0,0.25,0.75,1].map(o =>
                [o, o==0||o==1?0:0.75]
            )).join("stop")
            .attr("offset",i=>i[0])
            .attr("stop-color","#eee")
            .attr("stop-opacity",i=>i[1]);
        s.append("path")
            .attr("stroke", p=>"url(#chgrad"+p.id+")")
            .attr("d","M15 6H9C0 6,0 0,-9 0H-17H-9C0 0,0 -6,9 -6H15");
        s.selectAll().data(["L","R"])
            .join("text")
            .attrs({x:17, y:(_,i)=>[-6,6][i], dy:"0.32em", "text-anchor":"start", "font-size":10.5})
            .text(t=>t);
        s.append("g").attr("transform",p=>channelbox_tr(p.activeCurves.length===1))
            .on("click",function(p){
                var c = p.activeCurves.length !== 1;
                setCurves(p, c);
                updatePaths();
            })
            .selectAll().data([0,80]).join("rect")
            .attrs({x:d=>d, y:-12, width:40, height:24, fill:"url(#blgrad)"});
        s.filter(p=>p.imbalance)
            .append("text")
            .attrs({x:8,y:0,dy:"0.35em",fill:"#e11",
                    "font-size":10.5,"font-weight":"bold"})
            .style("pointer-events","none")
            .text("!");
    });
    td().append("button").text("baseline")
        .on("click",function(p){
            if (baseline.p === p) {
                baseline = baseline0;
            } else {
                var l = p.activeCurves.length===1 ? p.activeCurves[0].l
                                                  : avgCurves(p.channels),
                    b = l.map(d => d[1]-60);
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
}

function showPhone(p, exclusive) {
    if (!p.channels) {
        if (!p.files) p.files = fileNames(p.phone);
        Promise.all(p.files.map(f=>d3.text(DIR+f))).then(function (frs) {
            if (p.channels) return;
            p.id = phoneNumber++;
            p.channels = frs.map(tsvParse);
            p.imbalance = hasImbalance(p.channels);
            showPhone(p, exclusive);
        });
        return;
    }
    var l = p.files.length;
    if (exclusive || activePhones.length===0) {
        activePhones.map(q => q.active=0);
        activePhones = [p];
        baseline = baseline0;
    } else if (activePhones.indexOf(p) === -1) {
        if (activePhones.length === 1) {
            setCurves(activePhones[0], true);
        }
        activePhones.push(p);
    }
    p.active = true;
    setCurves(p, activePhones.length > 1);
    updatePaths();
    updatePhoneTable();
    d3.select("#phones").selectAll("div")
        .filter(p=>p.id!==undefined)
        .call(setPhoneTr);
}

function removePhone(p) {
    activePhones.forEach(q => q.active = q!==p);
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
        b.phoneObjs = b.phones.map(p => ({
            brand: b,
            phone: p
        }));
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
        gpath.selectAll("path").filter(c=>c.p===p).classed("highlight",h);
    }
    var phoneSel = d3.select("#phones").selectAll()
        .data(allPhones).join("div")
        .on("mouseover", bg(true, p => getDivColor(p.id===undefined?phoneNumber:p.id, true)))
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
            threshold: 0.4,
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
