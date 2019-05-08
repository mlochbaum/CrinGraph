let DIR = "data/";
var fileNames = name => ["L","R"].map(s=>name+" "+s+".txt");
// Format of FR files is kind of weird
var tsvParse = fr => d3.tsvParseRows(fr).slice(2,482);

function flatten(l) { return [].concat.apply([],l); }
function avgCurves(curves) {
    return curves
        .map(c=>c.map(d=>Math.exp(d[1])))
        .reduce((as,bs) => as.map((a,i) => a+bs[i]))
        .map((x,i) => [curves[0][i][0], Math.log(x/curves.length)]);
}

var activePhones = [];
var phoneNumber = 0; // I'm so sorry it just happened

var gpath = gr.insert("g",".rangeButton")
    .attr("fill","none")
    .attr("stroke-width",3)
    .attr("mask","url(#graphFade)");
var table = d3.select("#curves");

function getColor(c) {
    var p1 = 1.1673039782614187,
        p2 = p1*p1,
        p3 = p2*p1;
    var id = c.p.id, t = c.o/20;
    var i=(1.18-id)/p3, j=(id+0.2)/p2, k=(id+0.4)/p1;
    return d3.hcl(360*((i+t/p2)%1),
                  80+20*((j%1)-t/p3),
                  40+20*(k%1));
}

function updatePaths() {
    var c = flatten(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d=>d.id);
    p.join("path")
        .attr("stroke",getColor)
        .attr("d",d=>line(d.l));
}
function updatePhoneTable(l) {
    var c = table.selectAll("tr").data(activePhones, p=>p.id);
    c.exit().remove();
    var f = c.enter().selectAll().data(p=>p.files.map(f=>[p,f])).enter().append("tr"),
        f0= f.filter((_,i)=>i===0),
        one = () => f0.append("td").attr("rowspan",l).attr("class","combined"),
        all = () => f.append("td");
    one().text(pf=>pf[0].brand.name+" "+pf[0].phone);
    all().text((_,i)=>["L","R"][i]);
//  all().append("button").style("font-size","70%").text("hide");
    one().append("button").text("combine")
        .on("click",function(pf){
            var p = pf[0];
            var c = this.combined;
//          f0.selectAll(".combined").attr("rowspan",c?l:null);
//          f.filter((_,i)=>i!==0).style("visibility",c?null:"collapse");
            d3.select(this).text(c?"combine":"separate");
            p.activeCurves = c ? p.channels.map((l,i) => ({id:p.files[i], l:l, p:p, o:-1+2*i}))
                               : [{id:p.phone+" AVG", l:avgCurves(p.channels), p:p, o:0}];
            updatePaths();
            this.combined=!c;
        });
    one().append("button").text("remove")
        .on("click",function(pf){
            activePhones = activePhones.filter(p => p !== pf[0]);
            updatePaths();
            updatePhoneTable(0);
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
        activePhones = [p];
    } else if (activePhones.indexOf(p) === -1) {
        activePhones.push(p);
    }
    updatePaths();
    updatePhoneTable(l);
}

d3.json("data/phone_book.json").then(function (br) {
    var brands = br;
    brands.forEach(function (b) {
        b.phoneObjs = b.phones.map(p => ({
            brand: b,
            phone: p
        }));
    });
    var phoneFullName = p => p.brand.name+" "+p.phone;

    var allPhones = flatten(brands.map(b=>b.phoneObjs)),
        currentBrands = [],
        currentPhones = allPhones;
    showPhone(allPhones[0],1);

    d3.select("#brands").selectAll()
        .data(brands).join("tr").on('click', setBrand)
        .append("td").text(b => b.name + (b.suffix?" "+b.suffix:""));

    var phoneSel = d3.select("#phones").selectAll("tr")
        .data(allPhones).join("tr");
    phoneSel.append("td").text(phoneFullName)
        .on("click", p => showPhone(p,!d3.event.ctrlKey));

    function setBrand(d,i) {
        var b = brands[i];
        if (d3.event.ctrlKey && currentBrands.length) {
            if (currentBrands.indexOf(b) !== -1) return;
            if (currentBrands.length === 1) {
                phoneSel.select("td").text(phoneFullName);
            }
            currentBrands.push(b);
            currentPhones = currentPhones.concat(b.phoneObjs);
            phoneSel.filter(p => p.brand===b).style("visibility", "visible");
        } else {
            currentBrands = [b];
            currentPhones = b.phoneObjs;
            phoneSel.style("visibility", p => p.brand===b?"visible":"collapse");
            phoneSel.filter(p => p.brand===b).select("td").text(p=>p.phone);
        }
    }
});
