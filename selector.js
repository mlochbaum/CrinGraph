let DIR = "data/";
var fileNames = name => ["L","R"].map(s=>name+" "+s+".txt");
// Format of FR files is kind of weird
var tsvParse = fr => d3.tsvParseRows(fr).slice(2,482);

function flatten(l) { return [].concat.apply([],l); }
function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.pow(10,d[1]/20)))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], 20*Math.log10(x/curves.length)]);
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
        .style("border-left",p=>p.active?"0.3em solid "+getDivColor(p.id,1):null);
}

function updatePaths() {
    var c = flatten(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path")
        .attr("stroke",getColor_AC)
        .attr("d",d=>line(baseline.fn(d.l)));
}
function updatePhoneTable() {
    var c = table.selectAll("tbody").data(activePhones, p=>p.id);
    c.exit().remove();
    var f = c.enter().append("tbody").selectAll().data(p=>p.activeCurves.map(a=>[p,a.id])).enter().append("tr"),
        f0= f.filter((_,i)=>i===0),
        one = () => f0.append("td").attr("rowspan",0),
        all = () => f.append("td");
    one().attr("class","remove").text("⊗")
        .on("click",function(pf){
            activePhones.forEach(p => p.active = p!==pf[0]);
            activePhones = activePhones.filter(p => p.active);
            updatePaths();
            updatePhoneTable();
            d3.select("#phones").selectAll("tr")
                .filter(p=>p===pf[0])
                .call(setPhoneTr);
        });
    one().text(pf=>pf[0].brand.name+" ")
        .append("span").attr("class","phonename").text(pf=>pf[0].phone);
    all().call(l => {
        l.append("div").attr("class","keyLine").style("background",(pf,i)=>getColor_ph(pf[0],i));
        l.append("span").text((_,i)=>["L","R"][i])
    });
    one().append("button").text("combine")
        .on("click",function(pf){
            var p = pf[0];
            var c = p.activeCurves.length === 1;
//          f.filter((_,i)=>i!==0).style("visibility",c?null:"collapse");
            d3.select(this).text(c?"combine":"separate");
            p.activeCurves = c ? p.channels.map((l,i) => ({id:p.files[i], l:l, p:p, o:-1+2*i}))
                               : [{id:p.phone+" AVG", l:avgCurves(p.channels), p:p, o:0}];
            updatePaths();
        });
    one().append("button").text("baseline")
        .on("click",function(pf){
            var p = pf[0];
            if (baseline.p === p) {
                baseline = baseline0;
            } else {
                var l = p.activeCurves.length===1 ? p.activeCurves[0].l
                                                  : avgCurves(p.channels),
                    b = l.map(d => d[1]-60);
                baseline = { p:p, fn:l=>l.map((e,i)=>[e[0],e[1]-b[i]]) };
            }
            gpath.selectAll("path")
                .transition().duration(500).ease(d3.easeQuad)
                .attr("d",d=>line(baseline.fn(d.l)));
        });
    one().append("button").text("hide")
        .on("click",function(pf){
            var p = pf[0],
                h = p.hide;
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
            showPhone(p, exclusive);
        });
        return;
    }
    var l = p.files.length;
    p.activeCurves = p.channels.map((l,i) => ({id:p.files[i], l:l, p:p, o:-1+2*i}));
    if (exclusive || activePhones.length===0) {
        activePhones.map(q => q.active=0);
        activePhones = [p];
    } else if (activePhones.indexOf(p) === -1) {
        activePhones.push(p);
    }
    p.active = 1;
    updatePaths();
    updatePhoneTable();
    d3.select("#phones").selectAll("tr")
        .filter(p=>p.id!==undefined)
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
        elt .on("click", p => fn(p,!d3.event.ctrlKey))
            .on("auxclick", p => d3.event.button===1 ? fn(p,0) : 0);
    }; }

    var brandSel = d3.select("#brands").selectAll()
        .data(brands).join("tr")
        .call(setClicks(setBrand));
    brandSel.append("td").text(b => b.name + (b.suffix?" "+b.suffix:""));

    var phoneSel = d3.select("#phones").selectAll("tr")
        .data(allPhones).join("tr");
    var bg = (h,fn) => function (p) {
        d3.select(this).style("background", fn(p));
        gpath.selectAll("path").filter(c=>c.p===p).classed("highlight",h);
    }
    phoneSel.append("td").text(phoneFullName)
        .on("mouseover", bg(true, p => getDivColor(p.id===undefined?phoneNumber:p.id, true)))
        .on("mouseout" , bg(false,p => p.id!==undefined?getDivColor(p.id,p.active):null))
        .call(setClicks(showPhone));

    function setBrand(b, exclusive) {
        var incl = currentBrands.indexOf(b) !== -1;
        if (exclusive || currentBrands.length===0) {
            currentBrands.forEach(br => br.active = false);
            if (incl) {
                currentBrands = [];
                phoneSel.style("visibility", "visible");
                phoneSel.select("td").text(phoneFullName);
            } else {
                currentBrands = [b];
                phoneSel.style("visibility", p => p.brand===b?"visible":"collapse");
                phoneSel.filter(p => p.brand===b).select("td").text(p=>p.phone);
            }
        } else {
            if (incl) return;
            if (currentBrands.length === 1) {
                phoneSel.select("td").text(phoneFullName);
            }
            currentBrands.push(b);
            phoneSel.filter(p => p.brand===b).style("visibility", "visible");
        }
        if (!incl) b.active = true;
        brandSel.classed("active", br => br.active);
    }
});
