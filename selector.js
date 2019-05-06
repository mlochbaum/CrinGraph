let DIR = "data/";
var fileNames = name => ["L","R"].map(s=>name+" "+s+".txt");
// Format of FR files is kind of weird
var tsvParse = fr => d3.tsvParseRows(fr).slice(2,482);

var curves = [],
    gpath = gr.append("g")
        .attr("fill","none")
        .attr("stroke-width",3)
        .attr("mask","url(#graphFade)"),
    brands = null;
function updatePaths(dat) {
    var p = gpath.selectAll("path").data(dat, d=>d.id);
    p.exit().remove();
    p.enter().append("path")
        .attr("stroke",(_,i)=>d3.schemeCategory10[i])
        .attr("d",d=>line(d.l));
}
function showPhone(ph) {
    if (!ph.files) ph.files = fileNames(ph.phone);
    var l = ph.files.length;
    curves = [ph];
    updatePhoneTable(l);
    Promise.all(ph.files.map(f=>d3.text(DIR+f))).then(frs =>
        updatePaths(frs.map((t,i)=>({id:ph.files[i],l:tsvParse(t),p:ph})))
    );
}
function updatePhoneTable(l) {
    var c = d3.select("#curves").selectAll("tr").data(curves,p=>p.brand+" "+p.phone);
    c.exit().remove();
    var f = c.enter().selectAll().data(p=>p.files.map(f=>[p,f])).enter().append("tr"),
        f0= f.filter((_,i)=>i===0),
        one = () => f0.append("td").attr("rowspan",l).attr("class","combined"),
        all = () => f.append("td");
    one().text(pf=>pf[0].brand.name+" "+pf[0].phone);
    all().text((_,i)=>["L","R"][i]);
//  all().append("button").style("font-size","70%").text("hide");
    one().append("button").text("combine")
        .on("click",function(){
            var c = this.combined;
            f0.selectAll(".combined").attr("rowspan",c?l:null);
            f.filter((_,i)=>i!==0).style("visibility",c?null:"collapse");
            d3.select(this).text(c?"combine":"separate");
            this.combined=!c;
        });
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

    var allPhones = [].concat.apply([],brands.map(b=>b.phoneObjs)),
        currentBrands = [],
        currentPhones = allPhones;
    showPhone(allPhones[0]);

    d3.select("#brands").selectAll()
        .data(brands).enter()
        .append("tr").on('click', setBrand)
        .append("td").text(b => b.name + (b.suffix?" "+b.suffix:""));

    var phoneSel = d3.select("#phones").selectAll("tr")
        .data(allPhones).enter()
        .append("tr");
    phoneSel.append("td").text(phoneFullName)
        .on("click", showPhone);

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
