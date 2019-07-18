d3.select("#label").on("click", function () {
    let curves = d3.merge(activePhones.map(p => p.activeCurves));
    if (!curves.length) return;
    gr.selectAll(".tooltip").remove();
    let g = gr.selectAll(".tooltip").data(curves)
        .join("g").attr("class","tooltip").attr("opacity", 0);
    let t = g.append("text")
        .attrs({x:0, y:0, fill:c=>getTooltipColor(c)})
        .text(c=>c.id);
    g.datum(function(){return this.getBBox();});
    g.select("text").attrs(b=>({x:3-b.x, y:3-b.y}));
    g.insert("rect", "text")
        .attrs(b=>({x:2, y:2, width:b.width+2, height:b.height+2}));
    let boxes = g.data(),
        w = boxes.map(b=>b.width +6),
        h = boxes.map(b=>b.height+6);

    if (curves.length === 1) {
        let x0 = 50, y0 = 10,
            sl = range_to_slice([0,w[0]], o=>x0+o),
            e = d3.extent(sl(curves[0].l).map(v=>v[1]))
                  .map(d=>y(d+getOffset(curves[0].p)));
        if (y0+h[0] >= e[1]) { y0 = Math.max(y0, e[0]); }
        g.attr("transform","translate("+x0+","+y0+")");
    } else {
        let v = curves.map(c=>c.l.map(d=>d[1]+getOffset(c.p))),
            n = v.length,
            l = v[0].length;
        let invd = (sc,d) => sc.invert(d)-sc.invert(0),
            wind = w => d3.bisectRight(f_values, invd(x,w)),
            mw = wind(d3.min(w));
        let winReduce = (l,w,d0,fn) => {
            l = l.slice();
            for (let d=d0; d<w; ) {
                let diff = Math.min(2*d,w) - d;
                for (let i=0; i<l.length-diff; i++) {
                    l[i] = fn(l[i], l[i+diff]);
                }
                d += diff;
            }
            l.length -= w-d0;
            return l;
        }
        let getRanges = [Math.min, Math.max].map(f => {
            let t = v.map(c => winReduce(c, mw, 1, f));
            return w => t.map(c => winReduce(c, w, mw, f));
        });
        let tr = [];
        v.forEach((e,j) => {
            let we = wind(w[j]),
                he = -invd(y,h[j]),
                range = d3.transpose(getRanges.map(r => r(we))),
                ds;
            ds = range[j].map(function (r,ri) {
                let le = r.length,
                    s = [[-he,0],[0,he]][ri].map(o=>r.map(d=>d+o)),
                    d = r.map(_=>1e10);
                for (let k=0; k<n; k++) if (k!==j) {
                    let t = range[k];
                    for (let i=0; i<le; i++) {
                        d[i] = Math.min(d[i], Math.max(s[0][i]-t[1][i],
                                                       t[0][i]-s[1][i]));
                    }
                }
                return d;
            });
            let sep = 0, pos = null;
            ds.forEach((drow,k)=>drow.forEach((d,i)=>{
                if (d>sep) { sep=d; pos=[i,range[j][k][i]+(k?he:0)]; }
            }));
            if (pos) {
                tr[j] = "translate("+x(f_values[pos[0]])+","+y(pos[1])+")";
            } else {
                tr[j] = "translate(60,"+(20+30*j)+")";
            }
        });
        g.attr("transform",(_,j)=>tr[j]);
    }
    g.attr("opacity",null);
});
