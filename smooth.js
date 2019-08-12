let pair = (arr,fn) => arr.slice(1).map((v,i)=>fn(v,arr[i]));

function smooth_prep(h, d) {
    let rh = h.map(d=>1/d),
        G = [ rh.slice(0,rh.length-1),
              pair(rh, (a,b)=>-(a+b)),
              rh.slice(1) ],
        dv = d3.range(rh.length+1).map(i=>d(i)),
        dG = G.map((r,j) => r.map((e,i) => e*dv[i+j])),
        d2 = dv.map(e=>e*e),
        h6 = h.map(d=>d/6),
        M = [ pair(h6, (a,b)=>2*(a+b)),
              h6.slice(1,h6.length-1),
              h6.slice(3).map(_=>0) ];
    dG.forEach((_,k) =>
        dG.slice(k).forEach((g,i) =>
            dG[i].slice(k).forEach((a,j) => M[k][j] += a*g[j])
        )
    );

    // Diagonal LDL decomposition of M
    let md = [M[0][0]],
        ml = M.slice(1).map(m=>[m[0]/md]);
    d3.range(1,M[0].length).forEach(j => {
        let n = ml.length,
            p = md.slice(-n).reverse().map((d,i)=>d*ml[i][j-1-i]),
            a = M.map((m,k) => m[j] - d3.sum(p.slice(0,n-k),
                      (a,i) => a*ml[k+i][j-1-i]));
        md.push(a[0]);
        ml.forEach((l,j)=>l.push(a[j+1]/a[0]));
    });

    return { G:G, md:md, ml:ml, d2:d2 };
}

function smooth_eval(p, y) {
    let Gy = p.G[0].map(_=>0),
        n = Gy.length;
    p.G.forEach((r,j) => r.forEach((e,i) => Gy[i] += e*y[i+j]));
    // Forward substitution and multiply by p.md
    for (let i=0; i<n; i++) {
        let yi = Gy[i];
        p.ml.forEach((m,k) => { let j=i+k+1; if (j<n) Gy[j] -= m[i]*yi; });
        Gy[i] /= p.md[i];
    }
    // Back substitution
    for (let i=n; i--; ) {
        let yi = Gy[i];
        p.ml.forEach((m,k) => { let j=i-k-1; if (j>=0) Gy[j] -= m[j]*yi; });
    }
    let u = y.slice();
    p.G.forEach((r,j) => r.forEach((e,i) => u[i+j] -= e*p.d2[i+j]*Gy[i]));
    return u;
}

let smooth_level = 5,
    smooth_param = undefined;
function smooth(y) {
    if (!smooth_param) {
        let x = f_values.map(f=>Math.log(f)),
            h = pair(x, (a,b)=>a-b),
            d = i => smooth_level*0.003*Math.pow(1/80,Math.pow(i/x.length,2));
        smooth_param = smooth_prep(h, d);
    }
    return smooth_eval(smooth_param, y);
}

function smoothPhone(p) {
    if (p.smooth !== smooth_level) {
        p.channels = p.rawChannels.map(
            c=>smooth(c.map(d=>d[1])).map((d,i)=>[c[i][0],d])
        );
        p.smooth = smooth_level;
        setCurves(p, p.avg);
    }
}

d3.select("#smooth-level").on("change input", function () {
    if (!this.checkValidity()) return;
    smooth_level = +this.value;
    smooth_param = undefined;
    line.curve(smooth_level ? d3.curveNatural : d3.curveCardinal.tension(0.5));
    activePhones.forEach(smoothPhone);
    updatePaths();
});
