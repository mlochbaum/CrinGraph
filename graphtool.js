let doc = d3.select(".graphtool");
doc.html(`
  <svg style="display: none;">
    <defs>
      <g id="baseline-icon" text-anchor="middle" font-size="100px" fill="currentColor">
        <text dominant-baseline="central" y="-57">BASE</text>
        <text dominant-baseline="central" y="57">-LINE</text>
      </g>
      <g id="hide-icon">
        <path d="M2 6Q7 0 12 6Q7 12 2 6Z" stroke-width="1" stroke="currentColor" fill="none"/>
        <circle cx="7" cy="6" r="2" stroke="none" fill="currentColor"/>
        <line stroke-width="1" x1="4.4" y1="10.3" x2="10.4" y2="2.3" class="keyBackground"/>
        <line stroke-width="1" x1="3.6" y1= "9.7" x2= "9.6" y2="1.7" stroke="currentColor"/>
      </g>
      <g id="pin-icon" text-anchor="middle" font-size="100px" fill="currentColor">
        <text dominant-baseline="central">
          PIN
        </text>
      </g>
    </defs>
  </svg>

  <main class="main">
    <section class="parts-primary">
    <div class="graphBox" data-sticky-graph="`+ alt_sticky_graph + `" data-animated="` + alt_animated + `">
      <div class="graph-sizer">
        <svg id="fr-graph" viewBox="0 0 800 346" data-labels-position="`+ labelsPosition + `"></svg>
      </div>

      <div class="tools collapseTools">
        <div class="copy-url">
          <button id="copy-url">Copy URL</button>
          <button id="download-faux">Screenshot</button>
        </div>

        <div class="zoom">
          <span>Zoom:</span>
          <button>Bass</button>
          <button>Mids</button>
          <button>Treble</button>
        </div>

        <div class="normalize">
          <span>Normalize:</span>
          <div>
            <input type="number" inputmode="decimal" id="norm-phon" required min="0" max="100" value="`+ default_norm_db + `" step="1" onclick="this.focus();this.select()"></input>
            <span>dB</span>
          </div>
          <div>
            <input type="number" inputmode="decimal" id="norm-fr" required min="20" max="20000" value="`+ default_norm_hz + `" step="1" onclick="this.focus();this.select()"></input>
            <span>Hz</span>
          </div>
          <span class="helptip">
            ?<span>Choose a dB value to normalize to a target listening level, or a Hz value to make all curves match at that frequency.</span>
          </span>
        </div>

        <div class="smooth">
          <span>Smooth:</span>
          <input type="number" inputmode="decimal" id="smooth-level" required min="0" value="5" step="any" onclick="this.focus();this.select()"></input>
        </div>

        <div class="miscTools">
          <button id="inspector"><span>╞</span> inspect</button>
          <button id="label"><span>▭</span> label</button>
          <button id="download"><span><u>⇩</u></span> screenshot</button>
          <button id="recolor"><span>○</span> recolor</button>
        </div>

        <div class="expand-collapse">
            <button id="expand-collapse"></button>
        </div>

        <svg id="expandTools" viewBox="0 0 14 12">
          <path d="M2 2h10M2 6h10M2 10h10" stroke-width="2px" stroke="#878156"    stroke-linecap="round" transform="translate(0,0.3)"/>
          <path d="M2 2h10M2 6h10M2 10h10" stroke-width="2px" stroke="currentColor" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

      <div class="manage">
        <table class="manageTable">
          <colgroup>
            <col class="remove">
            <col class="phoneId">
            <col class="key">
            <col class="calibrate">
            <col class="baselineButton">
            <col class="hideButton">
            <col class="lastColumn">
          </colgroup>
          <tbody class="curves"></tbody>
          <tr class="addPhone">
            <td class="addButton">⊕</td>
            <td class="helpText" colspan="5">(or middle/ctrl-click when selecting; or pin other IEMs)</td>
            <td class="addLock">LOCK</td>
          </tr>
          <tr class="mobile-helper"></tr>
        </table>
      </div>

      <div class="accessories"></div>

      <div class="external-links"></div>
    </section>

    <section class="parts-secondary">
      <div class="controls">
        <div class="select" data-selected="models">
          <div class="selector-tabs">
            <button class="brands" data-list="brands">Brands</button>
            <button class="models" data-list="models">Models</button>
            <button class="extra">Equalizer</button>
          </div>

          <div class="selector-panel">
            <input class="search" type="text" inputmode="search" placeholder="Search" onclick="this.focus();this.select()"/>

            <svg class="chevron" viewBox="0 0 12 8" preserveAspectRatio="none">
              <path d="M0 0h4c0 1.5,5 3,7 4c-2 1,-7 2.5,-7 4h-4c0 -3,4 -3,4 -4s-4 -1,-4 -4"/>
            </svg>
            <svg class="stop" viewBox="0 0 4 1">
              <path d="M4 1H0C3 1 3.2 0.8 4 0Z"/>
            </svg>

            <div class="scroll-container">
              <div class="scrollOuter" data-list="brands"><div class="scroll" id="brands"></div></div>
              <div class="scrollOuter" data-list="models"><div class="scroll" id="phones"></div></div>
            </div>
          </div>

          <div class="extra-panel" style="display: none;">
            <div class="extra-upload">
              <h5>Uploading</h2>
              <button class="upload-fr">Upload FR</button>
              <button class="upload-target">Upload Target</button>
              <br />
              <span><small>Uploaded data will not be persistent</small></span>
              <form style="display:none"><input type="file" id="file-fr" accept=".csv,.txt" /></form>
            </div>
            <div class="extra-eq">
              <h5>Parametric Equalizer</h2>
              <div class="select-eq-phone">
                <select name="phone">
                    <option value="" selected>Choose EQ model</option>
                </select>
              </div>
              <div class="filters-header">
                <span>Type</span>
                <span>Frequency</span>
                <span>Gain</span>
                <span>Q</span>
              </div>
              <div class="filters">
                <div class="filter">
                    <span>
                      <input name="enabled" type="checkbox" checked></input>
                      <select name="type">
                        <option value="PK" selected>PK</option>
                        <option value="LSQ">LSQ</option>
                        <option value="HSQ">HSQ</option>
                        <option value="PK-xBass" disabled>PK</option>
                      </select>
                    </span>
                    <span><input name="freq" type="number" min="20" max="20000" step="1" value="0"></input></span>
                    <span><input name="gain" type="number" min="-40" max="40" step="0.1" value="0"></input></span>
                    <span><input name="q" type="number" min="0.3333" max="33.3333" step="0.1" value="0"></input></span>
                </div>
              </div>
              <div class="settings-row">
                <span>AutoEQ Range</span>
                <span><input name="autoeq-from" type="number" min="20" max="20000" step="1" value="20"></input></span>
                <span><input name="autoeq-to" type="number" min="20" max="20000" step="1" value="20000"></input></span>
                <span>Q Range</span>
                <span><input name="q-from" type="number" min="0.3333" max="33.3333" step="1" value="0.5"></input></span>
                <span><input name="q-to" type="number" min="0.3333" max="33.3333" step="1" value="2"></input></span>
                <span>Q Step</span>
                <span><select name="q-step"><option value="0.1">0.1</option><option value="0.01">0.01</option><option value="0.001">0.001</option><option value="0.0001">0.0001</option></select></span>
                <span></span>
                <span>Gain Range</span>
                <span><input name="gain-from" type="number" min="-12" max="12" step="-12" value="0.5"></input></span>
                <span><input name="gain-to" type="number" min="-12" max="12" step="12" value="2"></input></span>
              </div>
              <div class="filters-button">
                <button class="add-filter">＋</button>
                <button class="remove-filter">－</button>
                <button class="sort-filters">Sort</button>
                <button class="import-filters">Import</button>
                <button class="export-filters">Export</button>
                <button class="autoeq">AutoEQ</button>
                <br>
                <span>Additional Features</span>
                <button class="xbass">xBass</button>
                <button class="fr-to-target">EQ To Target</button>
                <div class="graphic-eq-settings">
                    <span>Graphic EQ Band Settings</span>
                    <select name="band-setting" id="band-setting" onchange="isCustom()">
                        <option value="10-iso" selected>10 band(ISO)</option>
                        <option value="15-iso">15 band(ISO)</option>
                        <option value="31-iso">31 band(ISO)</option>
                        <option value="custom">Custom</option>
                    </select>
                    <input type="text" style="display:none; width:97%;" id="custom-bands" name="custom-bands" placeholder="Ex) 64, 250, 1000, 4000, 8000"></input>
                </div>
                <button class="convert-to-graphic-filters">Convert To Graphic EQ</button>
                <button class="export-graphic-filters">Export To Graphic EQ</button>
                <br>
                <button class="reset">Reset Filters</button>
                <button class="readme">Readme</button>
              </div>
              <a style="display: none" id="file-filters-export"></a>
              <form style="display:none"><input type="file" id="file-filters-import" accept=".txt" /></form>
            </div>
            <div class="extra-tone-generator">
              <h5>Tone Generator</h2>
              <div class="settings-row">
                <span>Freq Range</span>
                <span><input name="tone-generator-from" type="number" min="20" max="20000" step="1" value="20"></input></span>
                <span><input name="tone-generator-to" type="number" min="20" max="20000" step="1" value="20000"></input></span>
              </div>
              <div><input name="tone-generator-freq" type="range" min="0" max="1" step="0.0001" value="0" /></div>
              <div>
                <button class="play">Play</button>
                <span>Frequency: <span class="freq-text">20</span> Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div style="display: none" class="extra-eq-overlay">AutoEQ is running, it could take 5~20 seconds or more.</div>
  </main>
`);


let pad = { l: 15, r: 15, t: 10, b: 36 };
let W0 = 800, W = W0 - pad.l - pad.r,
    H0 = 360, H = H0 - pad.t - pad.b;

let gr = doc.select("#fr-graph"),
    defs = gr.append("defs");


gr.append("rect").attrs({
    x: 0, y: pad.t - 8, width: W0, height: H0 - 22, rx: 4,
    "class": "graphBackground"
});
watermark(gr);


// Scales
let x = d3.scaleLog()
    .domain([20, 20000])
    .range([pad.l, pad.l + W]);

let yD = [29.5, 85], // Decibels
    yR = [pad.t + H, pad.t + 10];
let y = d3.scaleLinear().domain(yD).range(yR);


// y axis
defs.append("filter").attr("id", "blur").attr("filterUnits", "userSpaceOnUse")
    .attrs({ x: -W - 4, y: -2, width: W + 8, height: 4 })
    .append("feGaussianBlur").attr("in", "SourceGraphic")
    .attr("stdDeviation", 0.8);
let yAxis = d3.axisLeft(y).tickSize(W).tickSizeOuter(0).tickPadding(1);
function fmtY(ya) {
    let d = y.domain(),
        r = d[1] - d[0],
        t = r < 40 ? 1 : 5,
        y0 = Math.ceil(d[0] / t),
        y1 = Math.floor(d[1] / t),
        isMinor = t === 5 ? (() => false) : ((_, i) => (y0 + i) % 5 !== 0);
    yAxis.tickValues(d3.range(y1 - y0 + 1).map(i => t * (y0 + i)))(ya);
    ya.select(".domain").remove();
    ya.selectAll(".tick line")
        .attr("stroke-linecap", "round")
        .attrs((_, i) => {
            let m = isMinor(_, i);
            return {
                filter: m ? null : "url(#blur)",
                "stroke-width": m ? 0.2 * (1 - r / 45) : 0.15 * (1 + 45 / r)
            };
        });
    ya.selectAll(".tick text")
        .attr("text-anchor", "start")
        .attr("x", -W + 3)
        .attr("dy", -2)
        .filter(isMinor).attr("display", "none");
}
let yAxisObj = gr.append("g")
    .attr("transform", "translate(" + (pad.l + W) + ",0)")
    .call(fmtY);
yAxisObj.insert("text")
    .attr("transform", "rotate(-90)")
    .attr("fill", "currentColor")
    .attr("text-anchor", "end")
    .attr("y", -W - 2).attr("x", -pad.t)
    .text("dB");


// x axis
let xvals = [2, 3, 4, 5, 6, 8, 10, 15];
let xAxis = d3.axisBottom(x)
    .tickSize(H + 3).tickSizeOuter(0)
    .tickValues(d3.merge([1, 2, 3].map(e => xvals.map(m => m * Math.pow(10, e)))).concat([20000]))
    .tickFormat(f => f >= 1000 ? (f / 1000) + "k" : f);

let tickPattern = [3, 0, 0, 1, 0, 0, 2, 0],
    getTickType = i => i === 0 || i === 3 * 8 ? 4 : tickPattern[i % 8],
    tickThickness = [2, 4, 4, 9, 15].map(t => t / 10);

function fmtX(xa) {
    xAxis(xa);
    (xa.selection ? xa.selection() : xa).select(".domain").remove();
    xa.selectAll(".tick line")
        .attr("stroke", "#333")
        .attr("stroke-width", (_, i) => tickThickness[getTickType(i)]);
    xa.selectAll(".tick text").filter((_, i) => tickPattern[i % 8] === 0)
        .attr("font-size", "86%")
        .attr("font-weight", "lighter");
    xa.select(".tick:last-of-type text")
        .attr("dx", -5)
        .text("20kHz");
    xa.select(".tick:first-of-type text")
        .attr("dx", 4)
        .text("20Hz");
}
defs.append("clipPath").attr("id", "x-clip")
    .append("rect").attrs({ x: 0, y: 0, width: W0, height: H0 });
let xAxisObj = gr.append("g")
    .attr("clip-path", "url(#x-clip)")
    .attr("transform", "translate(0," + pad.t + ")")
    .call(fmtX);


// Plot line
defs.selectAll().data([0, 1]).join("linearGradient")
    .attrs({ x1: 0, y1: 0, x2: 1, y2: 0 })
    .attr("id", i => "grad" + i)
    .selectAll().data(i => [i, 1 - i]).join("stop")
    .attr("offset", (_, i) => i)
    .attr("stop-color", j => ["black", "white"][j]);
let fW = 7,  // Fade width
    fWm = 30; // Width at an interior edge
let fade = defs.append("mask")
    .attr("id", "graphFade")
    .attr("maskUnits", "userSpaceOnUse")
    .append("g").attr("transform", "translate(" + pad.l + "," + pad.t + ")");
fade.append("rect").attrs({ x: 0, y: 0, width: W, height: H, fill: "white" });
let fadeEdge = fade.selectAll().data([0, 1]).join("rect")
    .attrs(i => ({ x: i ? W - fW : 0, width: fW, y: 0, height: H, fill: "url(#grad" + i + ")" }));
let line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]))
    .curve(d3.curveNatural);


// Range buttons
let selectedRange = 3; // Full range
let ranges = [[20, 400], [100, 4000], [1000, 20000], [20, 20000]],
    edgeWs = [[fW, fWm], [fWm, fWm], [fWm, fW], [fW, fW]];
let rangeSel = doc.select(".zoom").selectAll("button");
rangeSel.on("click", function (_, i) {
    let r = selectedRange,
        s = selectedRange = r === i ? 3 : i;
    rangeSel.classed("selected", (_, j) => j === s);
    x.domain(ranges[s]);
    // More time to go between bass and treble
    let dur = Math.min(r, s) === 0 && Math.max(r, s) === 2 ? 1100 : 700;
    clearLabels();
    gpath.selectAll("path").transition().duration(dur).attr("d", drawLine);
    let e = edgeWs[s];
    fadeEdge.transition().duration(dur).attrs(i => ({ x: i ? W - e[i] : 0, width: e[i] }));
    xAxisObj.transition().duration(dur).call(fmtX);
});


// y-axis scaler
let dB = {
    y: y(60),
    h: 15,
    H: y(60) - y(70),
    min: pad.t,
    max: pad.t + H,
    tr: _ => "translate(" + (pad.l - 9) + "," + dB.y + ")"
};
dB.all = gr.append("g").attr("class", "dBScaler"),
    dB.trans = dB.all.append("g").attr("transform", dB.tr()),
    dB.scale = dB.trans.append("g").attr("transform", "scale(1,1)");
dB.scale.selectAll().data([-1, 1])
    .join("path").attr("stroke", "none")
    .attr("d", function (s) {
        function getPathPart(l) {
            let v = l[0].toLowerCase() === "v";
            for (let i = 2 - v; i < l.length; i += 2)
                l[i] *= s;
            return l[0] + l.slice(1).join(" ");
        }
        return [["M", 9.9, -1],
        ["V", dB.H],
        ["h", -1],
        ["l", -1, -1.5],
        ["l", -2.1, 2],
        ["h", -5.6],
        ["v", -1.5],
        ["q", 7, 2, 8, -7],
        ["V", 29],
        ["c", 1, -16, -10, -15, -10, -14],
        ["V", -1]].map(getPathPart).join("");
    });
dB.scale.selectAll().data([10, 7, 13])
    .join("rect").attrs((d, i) => ({ x: i * 2.8, y: -d, width: 0.8, height: 2 * d, fill: "#bbb" }));
function getDrag(fn) {
    return d3.drag()
        .on("drag", fn)
        .on("start", function () { dB.all.classed("active", true); })
        .on("end", function () { dB.all.classed("active", false); });
}
dB.mid = dB.all.append("rect")
    .attrs({ x: (pad.l - 11), y: dB.y - dB.h, width: 12, height: 2 * dB.h, opacity: 0 })
    .call(getDrag(function () {
        dB.y = d3.event.y;
        dB.y = Math.min(dB.y, dB.max - dB.h * (dB.H / 15));
        dB.y = Math.max(dB.y, dB.min + dB.h * (dB.H / 15));
        d3.select(this).attr("y", dB.y - dB.h);
        dB.trans.attr("transform", dB.tr());
        dB.updatey();
    }));
dB.circ = dB.trans.selectAll().data([-1, 1]).join("circle")
    .attrs({ cx: 5, cy: s => dB.H * s, r: 7, opacity: 0 })
    .call(getDrag(function () {
        let h = Math.max(30, Math.abs(d3.event.y));
        h = Math.min(h, Math.min(dB.max - dB.y, dB.y - dB.min));
        let sc = h / dB.H;
        dB.circ.attr("cy", s => h * s);
        dB.scale.attr("transform", "scale(1," + sc + ")");
        dB.h = 15 * sc;
        dB.mid.attrs({ y: dB.y - dB.h, height: 2 * dB.h });
        dB.updatey();
    }));
let yCenter = 60;
dB.updatey = function (dom) {
    let d = l => l[1] - l[0];
    y.domain(yR.map(y => yCenter + (y - dB.y) * (15 / dB.h) * d(yD) / d(yR)));
    yAxisObj.call(fmtY);
    let getTr = o => o ? "translate(0," + (y(o) - y(0)) + ")" : null;
    clearLabels();
    gpath.selectAll("path").call(redrawLine);
}


// Label drawing and screenshot
let getFullName = p => p.dispBrand + " " + p.dispName,
    getChannelName = p => n => getFullName(p) + " (" + n + ")";

let labelButton = doc.select("#label"),
    labelsShown = false;
function setLabelButton(l) {
    labelButton.classed("selected", labelsShown = l);
}
function clearLabels() {
    gr.selectAll(".lineLabel").remove();
    setLabelButton(false);
}

function drawLabels() {
    let curves = d3.merge(
        activePhones.filter(p => !p.hide).map(p =>
            p.isTarget || !p.samp || p.avg ? p.activeCurves
                : LR.map((l, i) => ({
                    p: p, o: getO(i), id: getChannelName(p)(l), multi: true,
                    l: (n => p.channels.slice(i * n, (i + 1) * n))(sampnums.length)
                        .filter(c => c !== null)
                }))
        )
    );
    if (!curves.length) return;

    let bcurves = curves.slice(),
        bp = baseline.p;
    if (bp && bp.hide) {
        bcurves.push({
            p: bp, o: 0,
            id: "Baseline: " + (bp.isTarget ? bp.fullName : getFullName(bp))
        });
    }

    gr.selectAll(".lineLabel").remove();
    let g = gr.selectAll(".lineLabel").data(bcurves)
        .join("g").attr("class", "lineLabel").attr("opacity", 0);
    let t = g.append("text")
        .attrs({ x: 0, y: 0, fill: c => getTooltipColor(c) })
        .text(c => c.id);
    g.datum(function () { return this.getBBox(); });
    g.select("text").attrs(b => ({ x: 3 - b.x, y: 3 - b.y }));
    g.insert("rect", "text")
        .attrs(b => ({ x: 2, y: 2, width: b.width + 2, height: b.height + 2 }));
    let boxes = g.data(),
        w = boxes.map(b => b.width + 6),
        h = boxes.map(b => b.height + 6);

    // Slice to fit in range
    let r = x.domain().map(v => d3.bisectLeft(f_values, v));
    rsl = a => a.slice(Math.max(r[0], 0), r[1] + 1);
    let rf_values = rsl(f_values);
    let v = curves.map(c => {
        let o = getOffset(c.p);
        return (c.multi ? c.l : [c.l])
            .map(l => rsl(baseline.fn(l).map(d => d[1] + o)));
    });
    let tr;

    if (curves.length === 1) {
        let x0 = 50, y0 = 10,
            sl = range_to_slice([0, w[0]], o => x0 + o),
            e = d3.extent(d3.merge(v[0].map(sl)).map(y));
        if (y0 + h[0] >= e[0]) { y0 = Math.max(y0, e[1]); }
        tr = [[x0, y0]];
    } else {
        let n = v.length;
        let invd = (sc, d) => sc.invert(d) - sc.invert(0),
            xr = x.range(),
            yd = y.domain(),
            wind = w => Math.ceil((w / (xr[1] - xr[0])) * rf_values.length),
            mw = wind(d3.min(w));
        let winReduce = (l, w, d0, fn) => {
            l = l.slice();
            for (let d = d0; d < w;) {
                let diff = Math.min(2 * d, w) - d;
                for (let i = 0; i < l.length - diff; i++) {
                    l[i] = fn(l[i], l[i + diff]);
                }
                d += diff;
            }
            l.length -= w - d0;
            return l;
        }
        let rangeGetters = [Math.min, Math.max].map(f => {
            let r = c => c.reduce((a, b) => a.map((ai, i) => f(ai, b[i])));
            let t = v.map(c => winReduce(r(c), mw, 1, f));
            return w => t.map(c => winReduce(c, w, mw, f));
        });
        let top = 0; // Use top left if we can't find a spot
        tr = v.map((_, j) => {
            let we = wind(w[j]),
                he = -invd(y, h[j]),
                range = d3.transpose(rangeGetters.map(r => r(we))),
                ds;
            ds = range[j].map(function (r, ri) {
                let le = r.length,
                    s = [[-he, 0], [0, he]][ri].map(o => r.map(d => d + o)),
                    d = r.map(_ => 1e10);
                for (let k = 0; k < n; k++) if (k !== j) {
                    let t = range[k];
                    for (let i = 0; i < le; i++) {
                        d[i] = Math.min(d[i], Math.max(s[0][i] - t[1][i],
                            t[0][i] - s[1][i]));
                    }
                }
                return d;
            });
            let sep = 0, pos = null;
            ds.forEach(function (drow, k) {
                for (let ii = 0; ii < drow.length;) {
                    let i = ii, d = drow[i],
                        rjk = range[j][k], m = rjk[i];
                    while (ii++, ii < drow.length && rjk[ii] === m) {
                        let di = drow[ii];
                        if (di < d && di < 1) break;
                        d = Math.max(d, drow[ii]);
                    }
                    let clip = x => x / Math.sqrt(1 + x * x);
                    d = 4 * clip(d / 4) + clip((ii - i) / 3);
                    i = Math.floor((i + ii) / 2);
                    let dl = drow.length,
                        r = i / dl;
                    d *= Math.sqrt((0.8 + r) * Math.sqrt(1 - r));
                    d *= clip(0.2 + Math.max(0, (i >= 15 ? drow[i - 15] : 0) + (i < dl - 15 ? drow[i + 15] : 0)));
                    if (d > sep) {
                        let dy = range[j][k][i] + (k ? he : 0),
                            yd = y.domain();
                        if (yd[0] + he <= dy && dy <= yd[1]) { sep = d; pos = [i, dy]; }
                    }
                }
            });
            return pos ? [x(rf_values[pos[0]]), y(pos[1])]
                : [60, 20 + 30 * top++];
        });
    }
    for (let j = curves.length; j < bcurves.length; j++) {
        tr.push([pad.l + (W - w[j]) / 2, pad.t + H - h[j] + 2]);
    }
    g.attr("transform", (_, i) => "translate(" + tr[i].join(",") + ")");
    g.attr("opacity", null);
    setLabelButton(true);
}

labelButton.on("click", () => (labelsShown ? clearLabels : drawLabels)());

function saveGraph(ext) {
    let fn = { png: saveSvgAsPng, svg: saveSvg }[ext];
    let showControls = s => dB.all.attr("visibility", s ? null : "hidden");
    gpath.selectAll("path").classed("highlight", false);
    drawLabels();
    showControls(false);
    fn(gr.node(), "graph." + ext, { scale: 3 })
        .then(() => showControls(true));

    // Analytics event
    if (analyticsEnabled) { pushEventTag("clicked_download", targetWindow); }
}
doc.select("#download")
    .on("click", () => saveGraph("png"))
    .on("contextmenu", function () {
        d3.event.returnValue = false;
        let b = d3.select(this);
        let choice = b.selectAll("div")
            .data(["png", "svg"]).join("div")
            .styles({
                position: "absolute", left: 0, top: (_, i) => i * 1.3 + "em",
                background: "inherit", padding: "0.1em 1em"
            })
            .text(d => "As ." + d)
            .on("click", function (d) {
                saveGraph(d);
                choice.remove();
                d3.event.stopPropagation();
            });
        b.on("blur", () => choice.remove());
    });


// Graph smoothing
let pair = (arr, fn) => arr.slice(1).map((v, i) => fn(v, arr[i]));

function smooth_prep(h, d) {
    let rh = h.map(d => 1 / d),
        G = [rh.slice(0, rh.length - 1),
        pair(rh, (a, b) => -(a + b)),
        rh.slice(1)],
        dv = d3.range(rh.length + 1).map(i => d(i)),
        dG = G.map((r, j) => r.map((e, i) => e * dv[i + j])),
        d2 = dv.map(e => e * e),
        h6 = h.map(d => d / 6),
        M = [pair(h6, (a, b) => 2 * (a + b)),
        h6.slice(1, h6.length - 1),
        h6.slice(3).map(_ => 0)];
    dG.forEach((_, k) =>
        dG.slice(k).forEach((g, i) =>
            dG[i].slice(k).forEach((a, j) => M[k][j] += a * g[j])
        )
    );

    // Diagonal LDL decomposition of M
    let md = [M[0][0]],
        ml = M.slice(1).map(m => [m[0] / md]);
    d3.range(1, M[0].length).forEach(j => {
        let n = ml.length,
            p = md.slice(-n).reverse().map((d, i) => d * ml[i][j - 1 - i]),
            a = M.map((m, k) => m[j] - d3.sum(p.slice(0, n - k),
                (a, i) => a * ml[k + i][j - 1 - i]));
        md.push(a[0]);
        ml.forEach((l, j) => l.push(a[j + 1] / a[0]));
    });

    return { G: G, md: md, ml: ml, d2: d2 };
}

function smooth_eval(p, y) {
    let Gy = p.G[0].map(_ => 0),
        n = Gy.length;
    p.G.forEach((r, j) => r.forEach((e, i) => Gy[i] += e * y[i + j]));
    // Forward substitution and multiply by p.md
    for (let i = 0; i < n; i++) {
        let yi = Gy[i];
        p.ml.forEach((m, k) => { let j = i + k + 1; if (j < n) Gy[j] -= m[i] * yi; });
        Gy[i] /= p.md[i];
    }
    // Back substitution
    for (let i = n; i--;) {
        let yi = Gy[i];
        p.ml.forEach((m, k) => { let j = i - k - 1; if (j >= 0) Gy[j] -= m[j] * yi; });
    }
    let u = y.slice();
    p.G.forEach((r, j) => r.forEach((e, i) => u[i + j] -= e * p.d2[i + j] * Gy[i]));
    return u;
}

let smooth_level = 5,
    smooth_scale = 0.01 * (typeof scale_smoothing !== "undefined" ? scale_smoothing : 1),
    smooth_param = undefined;
function smooth(y, c) {
    if (smooth_level === 0) { return y; }
    let get_param = fv => {
        let x = fv.map(f => Math.log(f)),
            h = pair(x, (a, b) => a - b),
            s = smooth_level * smooth_scale,
            d = i => s * Math.pow(1 / 80, Math.pow(i / x.length, 2));
        return smooth_prep(h, d);
    }
    let p;
    if (y.length !== f_values.length) {
        p = get_param(c.map(d => d[0]));
    } else {
        if (!smooth_param) { smooth_param = get_param(f_values); }
        p = smooth_param;
    }
    return smooth_eval(p, y);
}

function smoothPhone(p) {
    if (p.smooth !== smooth_level) {
        p.channels = p.rawChannels.map(
            c => c ? smooth(c.map(d => d[1]), c).map((d, i) => [c[i][0], d]) : c
        );
        p.smooth = smooth_level;
        setCurves(p);
    }
}

doc.select("#smooth-level").on("change input", function () {
    if (!this.checkValidity()) return;
    smooth_level = +this.value;
    smooth_param = undefined;
    line.curve(smooth_level ? d3.curveNatural : d3.curveCardinal.tension(0.5));
    activePhones.forEach(smoothPhone);
    updatePaths();
});


// Normalization with target loudness
const iso223_params = { // :2003
    f: [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500],
    a_f: [0.532, 0.506, 0.48, 0.455, 0.432, 0.409, 0.387, 0.367, 0.349, 0.33, 0.315, 0.301, 0.288, 0.276, 0.267, 0.259, 0.253, 0.25, 0.246, 0.244, 0.243, 0.243, 0.243, 0.242, 0.242, 0.245, 0.254, 0.271, 0.301],
    L_U: [-31.6, -27.2, -23, -19.1, -15.9, -13, -10.3, -8.1, -6.2, -4.5, -3.1, -2, -1.1, -0.4, 0, 0.3, 0.5, 0, -2.7, -4.1, -1, 1.7, 2.5, 1.2, -2.1, -7.1, -11.2, -10.7, -3.1],
    T_f: [78.5, 68.7, 59.5, 51.1, 44, 37.5, 31.5, 26.5, 22.1, 17.9, 14.4, 11.4, 8.6, 6.2, 4.4, 3, 2.2, 2.4, 3.5, 1.7, -1.3, -4.2, -6, -5.4, -1.5, 6, 12.6, 13.9, 12.3]
};
const free_field = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.0725, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0896, 0, 0, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0967, 0, 0, 0, 0, 0, 0, 0, 0.0886, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0656, 0, 0, 0, 0, 0, 0.024, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.045, 0, 0, 0, 0, 0, 0, 0.029, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1524, 0.2, 0.2, 0.2386, 0.3395, 0.4, 0.437, 0.5, 0.5287, 0.6225, 0.7, 0.7063, 0.7962, 0.8, 0.8941, 0.9, 0.9863, 1, 1.0729, 1.1, 1.1544, 1.2, 1.2504, 1.3, 1.3, 1.3, 1.3, 1.3163, 1.4, 1.4, 1.4, 1.4, 1.4017, 1.4846, 1.5, 1.5, 1.5748, 1.6, 1.6, 1.653, 1.7, 1.7, 1.7487, 1.8, 1.8341, 1.9, 1.9, 1.9229, 2, 2, 2, 2.1, 2.1, 2.1897, 2.2, 2.2, 2.2674, 2.3, 2.3, 2.3567, 2.4, 2.4, 2.4446, 2.5, 2.5262, 2.6, 2.6234, 2.7149, 2.8, 2.8038, 2.9011, 2.9969, 3.0913, 3.1845, 3.2762, 3.3757, 3.4649, 3.5617, 3.657, 3.751, 3.8, 3.8432, 3.9332, 4, 4, 4, 4.0121, 4.1, 4.1, 4.1, 4.0079, 4, 4, 4, 4, 3.9334, 3.9, 3.9, 3.9, 3.8541, 3.8, 3.8, 3.768, 3.7, 3.6761, 3.6, 3.6, 3.5927, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5761, 3.6, 3.6, 3.6604, 3.7, 3.7514, 3.8, 3.8, 3.8349, 3.9, 3.9218, 4.0199, 4.1123, 4.2076, 4.3016, 4.3985, 4.6816, 5.0515, 5.4222, 5.8036, 6.1097, 6.4656, 6.8461, 7.3316, 7.9083, 8.4305, 8.9369, 9.5105, 10.0759, 10.6024, 11.0027, 11.4847, 12.0482, 12.5152, 12.8994, 13.2776, 13.7381, 14.1303, 14.5168, 14.8858, 15.273, 15.6547, 15.9731, 16.2596, 16.542, 16.7857, 17.0111, 17.2325, 17.3532, 17.522, 17.6, 17.6, 17.6, 17.6, 17.5044, 17.41, 17.3145, 17.2205, 17.1255, 17.0318, 16.9373, 16.784, 16.6459, 16.4536, 16.2578, 16.1234, 15.967, 15.8736, 15.7552, 15.566, 15.3879, 15.2881, 15.0958, 14.9064, 14.8099, 14.6287, 14.5201, 14.3477, 14.2307, 14.0709, 13.9399, 13.7916, 13.6514, 13.5552, 13.4604, 13.367, 13.2718, 13.1766, 13.0812, 12.9743, 12.7916, 12.6975, 12.602, 12.5078, 12.3247, 12.0547, 11.7686, 11.4154, 11.1009, 10.9385, 10.7344, 10.3998, 10.0163, 9.6382, 9.2957, 8.9799, 8.6248, 8.3404, 8.0424, 7.674, 7.3851, 7.0061, 6.5307, 6.1484, 5.7696, 5.4662, 5.1084, 4.7302, 4.3498, 3.971, 3.6455, 3.4075, 3.1343, 2.7917, 2.5376, 2.3484, 2.1585, 1.9849, 1.9107, 2, 2, 2, 2.0894, 2.1844, 2.2787, 2.374, 2.6057, 2.8265, 3.0161, 3.2057, 3.3954, 3.5851, 3.8122, 4.0967, 4.354, 4.5651, 4.8509, 5.1459, 5.5259, 5.9041, 6.1881, 6.5643, 6.8561, 7.1418, 7.4251, 7.7093, 8.0593, 8.3192, 8.4541, 8.5493, 8.6437, 8.7, 8.7336, 8.8, 8.8, 8.8, 8.8, 8.7926, 8.7, 8.7, 8.6079, 8.5133, 8.5, 8.4237, 8.1863, 7.968, 7.7786, 7.4219, 6.948, 6.4299, 5.8212, 5.1563, 4.4634, 3.7042, 2.8897, 1.9005, 1.2368, 0.5651, -0.2856, -0.8593, -2.9].map(v => v - 7);

function init_normalize(fv) { // Interpolate values for find_offset
    let par = [], ff = [];
    par.free_field = ff;
    const p = iso223_params;
    let i = 0;
    fv.forEach(function (f) {
        if (f >= p.f[i]) { i++; }
        let i0 = Math.max(0, i - 1),
            i1 = Math.min(i, p.f.length - 1),
            g;
        if (i0 === i1) {
            g = n => p[n][i0];
        } else {
            let ll = [p.f[i0], p.f[i1], f].map(x => Math.log(x)),
                l = (ll[2] - ll[0]) / (ll[1] - ll[0]);
            g = n => { let v = p[n]; return v[i0] + l * (v[i1] - v[i0]); };
        }
        let a = g("a_f"),
            m = a * (Math.log10(4) - 10 + g("L_U") / 10),
            k = (0.005076 / Math.pow(10, m)) - Math.pow(10, a * g("T_f") / 10),
            c = Math.pow(10, 9.4 + 4 * m) / fv.length;
        par.push({ a: a, k: k, c: c });
        ffi = Math.floor(0.5 + 48 * Math.log2(f / 19.4806));
        ff.push(free_field[Math.max(0, Math.min(479, ffi))]);
    });
    return par;
}

// Find the appropriate offset (in dB) for fr so that the total loudness
// is equal to target (in phon)
let norm_par = []; // Cached interpolated ISO parameters
function find_offset(c, target) {
    let par;
    if (c.length !== f_values.length) {
        par = init_normalize(c.map(d => d[0]));
    } else {
        if (!norm_par.length) { norm_par = init_normalize(f_values); }
        par = norm_par;
    }
    let fr = c.map(v => v[1]);
    let x = 0; // Initial offset
    function getStep(o) {
        const l10 = Math.log(10) / 10;
        let v = 0, d = 0;
        par.forEach(function (p, i) {
            let a = p.a, k = p.k, c = p.c, ds, v0, v1;
            v0 = Math.exp(l10 * (fr[i] + o - par.free_field[i]));
            ds = l10 * v0;
            v1 = k + Math.pow(v0, a);
            ds *= a * Math.pow(v0, a - 1);
            v += c * Math.pow(v1, 4);
            ds *= c * 4 * Math.pow(v1, 3);
            d += ds;
        });
        // value: Math.log(v)/l10
        // deriv: d / (l10*v)
        return (Math.log(v) - target * l10) * (v / d);
    }
    let dx;
    do {
        dx = getStep(x);
        x -= dx;
    } while (Math.abs(dx) > 0.01);
    return x;
}


// File loading and channel management
const LR = typeof default_channels !== "undefined" ? default_channels
    : ["L", "R"];
let getO = i => LR.length > 1 ? -1 + i * 2 / (LR.length - 1) : 0;
const sampnums = typeof num_samples !== "undefined" ? d3.range(1, num_samples + 1)
    : [""];
function loadFiles(p, callback) {
    let l = f => d3.text(DIR + f + ".txt").catch(() => null);
    let f = p.isTarget ? [l(p.fileName)]
        : d3.merge(LR.map(s =>
            sampnums.map(n => l(p.fileName + " " + s + n))));
    Promise.all(f).then(function (frs) {
        if (!frs.some(f => f !== null)) {
            alert("Headphone not found!");
        } else {
            let ch = frs.map(f => f && Equalizer.interp(f_values, tsvParse(f)));
            callback(ch);
        }
    });
}
let validChannels = p => p.channels.filter(c => c !== null);
let numChannels = p => d3.sum(p.channels, c => c !== null);
let notMultichannel = LR.length === 1 ? p => true : p => p.isTarget;
let hasChannelSel = p => !notMultichannel(p) && numChannels(p) > 1;
let keyExt = LR.length === 1 ? 16 : 0;
let keyLeft = keyExt ? 0 : sampnums.length > 1 ? 11 : 0;
if (keyLeft) d3.select(".key").style("width", "17%")

function avgCurves(curves) {
    return curves
        .map(c => c.map(d => Math.pow(10, d[1] / 20)))
        .reduce((as, bs) => as.map((a, i) => a + bs[i]))
        .map((x, i) => [curves[0][i][0], 20 * Math.log10(x / curves.length)]);
}
function getAvg(p) {
    if (p.avg) return p.activeCurves[0].l;
    let v = validChannels(p);
    return v.length === 1 ? v[0] : avgCurves(v);
}
function hasImbalance(p) {
    if (!hasChannelSel(p)) return false;
    let as = p.channels[0], bs = p.channels[1];
    let s0 = 0, s1 = 0;
    return as.some((a, i) => {
        let d = a[1] - bs[i][1];
        d *= 1 / (50 * Math.sqrt(1 + Math.pow(a[0] / 1e4, 6)));
        s0 = Math.max(s0 + d, 0);
        s1 = Math.max(s1 - d, 0);
        return Math.max(s0, s1) > max_channel_imbalance;
    });
}

let activePhones = [];
let baseline0 = { p: null, l: null, fn: l => l },
    baseline = baseline0;

let gpath = gr.insert("g", ".dBScaler")
    .attr("fill", "none")
    .attr("stroke-width", 2.3)
    .attr("mask", "url(#graphFade)");
function hl(p, h) {
    gpath.selectAll("path").filter(c => c.p === p).classed("highlight", h);
}
let table = doc.select(".curves");

let ld_p1 = 1.1673039782614187;
function getCurveColor(id, o) {
    let p1 = ld_p1,
        p2 = p1 * p1,
        p3 = p2 * p1;
    let t = o / 32;
    let i = id / p3 + 0.76, j = id / p2 + 0.79, k = id / p1 + 0.32;
    if (id < 0) { return d3.hcl(360 * (1 - (-i) % 1), 5, 66); } // Target
    let th = 2 * Math.PI * i;
    i += Math.cos(th - 0.3) / 24 + Math.cos(6 * th) / 32;
    let s = Math.sin(2 * Math.PI * i);
    return d3.hcl(360 * ((i + t / p2) % 1),
        88 + 30 * (j % 1 + 1.3 * s - t / p3),
        36 + 22 * (k % 1 + 1.1 * s + 6 * t * (1 - s)));
}
let getColor_AC = c => getCurveColor(c.p.id, c.o);
let getColor_ph = (p, i) => getCurveColor(p.id, p.activeCurves[i].o);
function getDivColor(id, active) {
    let c = getCurveColor(id, 0);
    c.l = 100 - (80 - Math.min(c.l, 60)) / (active ? 1.5 : 3);
    c.c = (c.c - 20) / (active ? 3 : 4);
    return c;
}
function color_curveToText(c) {
    if (!alt_layout) {
        c.l = c.l / 5 + 10;
        c.c /= 3;
    }
    return c;
}
let getTooltipColor = curve => color_curveToText(getColor_AC(curve));
let getTextColor = p => color_curveToText(getCurveColor(p.id, 0));
let getBgColor = p => {
    let c = getCurveColor(p.id, 0).rgb();
    ['r', 'g', 'b'].forEach(p => c[p] = 255 - (255 - Math.max(0, c[p])) * 0.85);
    return c;
}

let cantCompare;
let noTargets = typeof disallow_target !== "undefined" && disallow_target;
if (noTargets || typeof max_compare !== "undefined") {
    const currency = [
        ["$", "#348542"],
        ["¥", "#d11111"],
        ["€", "#2961d4"],
        ["฿", "#dcaf1d"]
    ];
    let currencyCounter = -1,
        lastMessage = null,
        messageWeight = 0;
    let cantTarget = p => false;
    if (noTargets) {
        if (typeof allow_targets === "undefined") {
            cantTarget = p => p.isTarget;
        } else {
            let r = f => f.replace(/ Target$/, ""),
                a = allow_targets.map(r);
            cantTarget = p => p.isTarget && a.indexOf(r(p.fileName)) < 0;
        }
    }
    let ct = typeof restrict_target === "undefined" || restrict_target,
        ccfilter = ct ? (l => l) : (l => l.filter(p => !p.isTarget));
    cantCompare = function (ps, add, p, noMessage) {
        let count = ccfilter(ps).length + (add || 0) - (!ct && p && p.isTarget ? 1 : 0);
        if (count < max_compare && !(p && cantTarget(p))) { return false; }
        if (noMessage) { return true; }
        let div = doc.append("div");
        let c = currency[currencyCounter++ % currency.length];
        let lm = lastMessage;
        lastMessage = Date.now();
        messageWeight *= Math.pow(2, (lm ? lm - lastMessage : 0) / 3e4); // 30-second half-life
        messageWeight++;
        if (!currencyCounter || messageWeight >= 2) {
            messageWeight /= 2;
            let button = div.attr("class", "cashMessage")
                .html(premium_html)
                .append("button").text("Fine")
                .on("mousedown", () => messageWeight = 0);
            button.node().focus();
            let back = doc.append("div")
                .attr("class", "fadeAll");
            [button, back].forEach(e =>
                e.on("click", () => [div, back].forEach(e => e.remove()))
            );
        } else {
            div.attr("class", "cash")
                .style("color", c[1]).text(c[0])
                .transition().duration(120).remove();
        }
        return true;
    }
} else {
    cantCompare = function (m) { return false; }
}

let phoneNumber = 0; // I'm so sorry it just happened
// Find a phone id which doesn't have a color conflict with pins
let nextPN = 0; // Cached value; invalidated when pinned headphones change
function nextPhoneNumber() {
    if (nextPN === null) {
        nextPN = phoneNumber;
        let pin = activePhones.filter(p => p.pin).map(p => p.id);
        if (pin.length) {
            let p3 = ld_p1 * ld_p1 * ld_p1,
                l = a => b => Math.abs(((a - b) / p3 + 0.5) % 1 - 0.5),
                d = id => d3.min(pin, l(id));
            for (let i = nextPN, max = d(i); max < 0.12 && ++i < phoneNumber + 3;) {
                let m = d(i);
                if (m > max) { max = m; nextPN = i; }
            }
        }
    }
    return nextPN;
}
function getPhoneNumber() {
    let pn = nextPhoneNumber();
    phoneNumber = pn + 1;
    nextPN = null;
    return pn;
}

function setPhoneTr(phtr) {
    phtr.each(function (p) {
        p.highlight = p.active;
        let o = p.objs; if (!o) return;
        p.objs = o = o.filter(q => q.active);
        if (o.length === 0) {
            delete p.objs;
        } else if (!p.active) {
            p.id = o[0].id;
            p.highlight = true;
        }
    });
    phtr.style("background", p => p.isTarget && !p.active ? null : getDivColor(p.id, p.highlight))
        .style("border-color", p => p.highlight ? getDivColor(p.id, 1) : null);
    phtr.filter(p => !p.isTarget)
        .select(".phone-item-add")
        .selectAll(".remove").data(p => p.highlight ? [p] : [])
        .join("span").attr("class", "remove").text("⊗")
        .on("click", p => { d3.event.stopPropagation(); removeCopies(p); });
}

let channelbox_x = c => c ? -86 : -36,
    channelbox_tr = c => "translate(" + channelbox_x(c) + ",0)";
function setCurves(p, avg, lr, samp) {
    if (avg === undefined) avg = p.avg;
    if (samp === undefined) samp = avg ? false : LR.length === 1 || p.ssamp || false;
    else { p.ssamp = samp; if (samp) avg = false; }
    let dx = +avg - +p.avg,
        n = sampnums.length,
        selCh = (l, i) => l.slice(i * n, (i + 1) * n);
    p.avg = avg;
    p.samp = samp = n > 1 && samp;
    if (!p.isTarget) {
        let id = getChannelName(p),
            v = cs => cs.filter(c => c !== null),
            cs = p.channels,
            cv = v(cs),
            mc = cv.length > 1,
            pc = (idstr, l, oi) => ({
                id: id(idstr), l: l, p: p,
                o: oi === undefined ? 0 : getO(oi)
            });
        p.activeCurves
            = avg && mc ? [pc("AVG", avgCurves(cv))]
                : !samp && mc ? LR.map((l, i) => pc(l, avgCurves(v(selCh(cs, i))), i))
                    : cs.map((l, i) => {
                        let j = Math.floor(i / n);
                        return pc(LR[j] + sampnums[i % n], l, j);
                    }).filter(c => c.l);
    } else {
        p.activeCurves = [{ id: p.fullName, l: p.channels[0], p: p, o: 0 }];
    }
    let y = 0;
    let k = d3.selectAll(".keyLine").filter(q => q === p);
    let ksb = k.select(".keySelBoth").attr("display", "none");
    p.lr = lr;
    if (lr !== undefined) {
        p.activeCurves = p.samp ? selCh(p.activeCurves, lr) : [p.activeCurves[lr]];
        y = [-1, 1][lr];
        ksb.attr("display", null).attr("y", [0, -12][lr]);
    }
    k.select(".keyMask")
        .transition().duration(400)
        .attr("x", channelbox_x(avg))
        .attrTween("y", function () {
            let y0 = +this.getAttribute("y"),
                y1 = 12 * (-1 + y);
            if (!dx) { return d3.interpolateNumber(y0, y1); }
            let ym = y0 + (y1 - y0) * (3 - 2 * dx) / 6;
            y0 -= ym; y1 -= ym;
            return t => { t -= 1 / 2; return ym + (t < 0 ? y0 : y1) * Math.pow(2, 20 * (Math.abs(t) - 1 / 2)); };
        });
    k.select(".keySel").attr("transform", channelbox_tr(avg));
    k.selectAll(".keySamp").attr("opacity", (_, i) => i === +samp ? 1 : 0.6);
}
function updateCurves() {
    setCurves.apply(null, arguments);
    updatePaths();
}

let drawLine = d => line(baseline.fn(d.l));
function redrawLine(p) {
    let getTr = o => o ? "translate(0," + (y(o) - y(0)) + ")" : null;
    p.attr("transform", c => getTr(getOffset(c.p))).attr("d", drawLine);
}
function updateYCenter() {
    let c = yCenter;
    yCenter = baseline.p ? 0 : norm_sel ? 60 : norm_phon;
    y.domain(y.domain().map(d => d + (yCenter - c)));
    yAxisObj.call(fmtY);
}
function setBaseline(b, no_transition) {
    baseline = b;
    updateYCenter();
    if (no_transition) return;
    clearLabels();
    gpath.selectAll("path")
        .transition().duration(500).ease(d3.easeQuad)
        .attr("d", drawLine);
    table.selectAll("tr").select(".button")
        .classed("selected", p => p === baseline.p);

    // Analytics event
    if (analyticsEnabled && b.p) { pushPhoneTag("baseline_set", b.p); }
}
function getBaseline(p) {
    let b = getAvg(p).map(d => d[1] + getOffset(p));
    return { p: p, fn: l => l.map((e, i) => [e[0], e[1] - b[Math.min(i, b.length - 1)]]) };
}

function setOffset(p, o) {
    p.offset = +o;
    if (baseline.p === p) { baseline = getBaseline(p); }
    updatePaths();
}
let getOffset = p => p.offset + p.norm;

function setHover(elt, h) {
    elt.on("mouseover", h(true)).on("mouseout", h(false));
}

// See if iframe gets CORS error when interacting with window.top
try {
    let emb = window.location.href.includes('embed');

    accessWindowTop = (window.top.location.href) ? true : false;
    targetWindow = emb ? window : window.top;
} catch {
    accessWindowTop = false;
    targetWindow = window;
}

// See if iframe gets CORS error when interacting with window.top.document
try {
    accessDocumentTop = (window.top.document) ? true : false;
} catch {
    accessDocumentTop = false;
}

let ifURL = typeof share_url !== "undefined" && share_url;
let baseTitle = typeof page_title !== "undefined" ? page_title : "CrinGraph";
let baseDescription = typeof page_description !== "undefined" ? page_description : "View and compare frequency response graphs";
let baseURL;  // Set by setInitPhones
function addPhonesToUrl() {
    let title = baseTitle,
        url = baseURL,
        names = activePhones.filter(p => !p.isDynamic).map(p => p.fileName),
        namesCombined = names.join(", ");

    if (names.length) {
        url += "?share=" + encodeURI(names.join().replace(/ /g, "_"));
        title = namesCombined + " - " + title;
    }
    if (names.length === 1) {
        targetWindow.document.querySelector("link[rel='canonical']").setAttribute("href", url)
    } else {
        targetWindow.document.querySelector("link[rel='canonical']").setAttribute("href", baseURL)
    }
    targetWindow.history.replaceState("", title, url);
    targetWindow.document.title = title;
    targetWindow.document.querySelector("meta[name='description']").setAttribute("content", baseDescription + ", including " + namesCombined + ".");
}
function updatePaths(trigger) {
    clearLabels();
    let c = d3.merge(activePhones.map(p => p.activeCurves)),
        p = gpath.selectAll("path").data(c, d => d.id);
    let t = p.join("path").attr("opacity", c => c.p.hide ? 0 : null)
        .classed("sample", c => c.p.samp)
        .attr("stroke", getColor_AC).call(redrawLine)
        .filter(c => c.p.isTarget)
        .attr("class", "target");
    if (targetDashed) t.style("stroke-dasharray", "6, 3");
    if (targetColorCustom) t.attr("stroke", targetColorCustom);
    if (ifURL && !trigger) addPhonesToUrl();
    if (stickyLabels) drawLabels();
}
let colorBar = p => 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 8"><path d="M0 8v-8h1c0.05 1.5,-0.3 3,-0.16 5s0.1 2,0.15 3z" fill="' + getBgColor(p) + '"/></svg>\')';
function updatePhoneTable() {
    let c = table.selectAll("tr").data(activePhones, p => p.fileName);
    c.exit().remove();
    let f = c.enter().append("tr"),
        td = () => f.append("td");
    f.call(setHover, h => p => hl(p, h))
        .style("color", p => getDivColor(p.id, true));

    td().attr("class", "remove").text("⊗")
        .on("click", removePhone)
        .style("background-image", colorBar)
        .filter(p => !p.isTarget).append("svg").call(addColorPicker);
    td().attr("class", "item-line item-target")
        .call(s => s.filter(p => !p.isTarget).attr("class", "item-line item-phone")
            .append("span").attr("class", "brand").text(p => p.dispBrand))
        .call(addModel);
    td().attr("class", "curve-color").append("button")
        .style("background-color", p => getCurveColor(p.id, 0))
        .filter(p => !p.isTarget).call(makeColorPicker);
    td().attr("class", "channels").append("svg").call(addKey)
    td().attr("class", "levels").append("input")
        .attrs({ type: "number", step: "any", value: 0 })
        .property("value", p => p.offset)
        .on("change input", function (p) { setOffset(p, +this.value); });
    td().attr("class", "button button-baseline")
        .html("<svg viewBox='-170 -120 340 240'><use xlink:href='#baseline-icon'></use></svg>")
        .on("click", p => setBaseline(p === baseline.p ? baseline0
            : getBaseline(p)));
    function toggleHide(p) {
        let h = p.hide;
        let t = table.selectAll("tr").filter(q => q === p);
        t.select(".keyLine").on("click", h ? null : toggleHide)
            .selectAll("path,.imbalance").attr("opacity", h ? null : 0.5);
        t.select(".hideIcon").classed("selected", !h);
        gpath.selectAll("path").filter(c => c.p === p)
            .attr("opacity", h ? null : 0);
        p.hide = !h;
        if (labelsShown) {
            clearLabels();
            drawLabels();
        }
    }
    td().attr("class", "button hideIcon")
        .html("<svg viewBox='-2.5 0 19 12'><use xlink:href='#hide-icon'></use></svg>")
        .on("click", toggleHide);
    td().attr("class", "button button-pin")
        .attr("data-pinned", "false")
        .html("<svg viewBox='-135 -100 270 200'><use xlink:href='#pin-icon'></use></svg>")
        .on("click", function (p) {
            if (cantCompare(activePhones.filter(p => p.pin), 1)) return;

            if (p.pin) {
                p.pin = false;
                this.setAttribute("data-pinned", "false");
            } else {
                p.pin = true; nextPN = null;
                this.setAttribute("data-pinned", "true");
            }

            p.pin = true; nextPN = null;
            d3.select(this)
                .text(null).classed("button", false).on("click", null)
                .insert("svg").attr("class", "pinMark")
                .attr("viewBox", "0 0 280 145")
                .insert("path").attrs({
                    fill: "none",
                    "stroke-width": 30,
                    "stroke-linecap": "round",
                    d: "M265 110V25q0 -10 -10 -10H105q-24 0 -48 20l-24 20q-24 20 -2 40l18 15q24 20 42 20h100"
                });
        });
}

function addKey(s) {
    let dim = { x: -19 - keyLeft, y: -12, width: 65 + keyLeft, height: 24 }
    s.attr("class", "keyLine").attr("viewBox", [dim.x, dim.y, dim.width, dim.height].join(" "));
    let defs = s.append("defs");
    defs.append("linearGradient").attr("id", p => "chgrad" + p.id)
        .attrs({ x1: 0, y1: 0, x2: 0, y2: 1 })
        .selectAll().data(p => [0.1, 0.4, 0.6, 0.9].map(o =>
            [o, getCurveColor(p.id, o < 0.3 ? -1 : o < 0.7 ? 0 : 1)]
        )).join("stop")
        .attr("offset", i => i[0])
        .attr("stop-color", i => i[1]);
    defs.append("linearGradient").attr("id", "blgrad")
        .selectAll().data([0, 0.25, 0.31, 0.69, 0.75, 1]).join("stop")
        .attr("offset", o => o)
        .attr("stop-color", (o, i) => i == 2 || i == 3 ? "white" : "#333");
    let m = defs.append("mask").attr("id", p => "chmask" + p.id);
    m.append("rect").attrs(dim).attr("fill", "#333");
    m.append("rect").attrs({ "class": "keyMask", x: p => channelbox_x(p.avg), y: -12, width: 120, height: 24, fill: "url(#blgrad)" });
    let t = s.append("g");
    t.append("path")
        .attr("stroke", p => notMultichannel(p) ? getCurveColor(p.id, 0)
            : "url(#chgrad" + p.id + ")");
    t.selectAll().data(p => p.isTarget ? [] : LR)
        .join("text").attr("class", "keyCLabel")
        .attrs({
            x: 17 + keyExt, y: (_, i) => 12 * (i - (LR.length - 1) / 2),
            dy: "0.32em", "text-anchor": "start", "font-size": 10.5
        })
        .text(t => t);
    t.filter(p => p.isTarget).append("text")
        .attrs(keyExt ? { x: 7, y: 6, "text-anchor": "middle" }
            : { x: 17, y: 0, "text-anchor": "start" })
        .attrs({ dy: "0.32em", "font-size": 8, fill: p => getCurveColor(p.id, 0) })
        .text("Target");
    let uchl = f => function (p) {
        updateCurves(p, f(p)); hl(p, true);
    }
    s.append("rect").attr("class", "keySelBoth")
        .attrs({
            x: 40 + channelbox_x(0), width: 40, height: 12,
            opacity: 0, display: "none"
        })
        .on("click", uchl(p => 0));
    s.append("g").attr("class", "keySel")
        .attr("transform", p => channelbox_tr(p.avg))
        .on("click", uchl(p => !p.avg))
        .selectAll().data([0, 80]).join("rect")
        .attrs({ x: d => d, y: -12, width: 40, height: 24, opacity: 0 });
    let o = s.filter(p => !notMultichannel(p))
        .selectAll().data(p => [[p, 0], [p, 1]])
        .join("g").attr("class", "keyOnly")
        .attr("transform", pi => "translate(25," + [-6, 6][pi[1]] + ")")
        .call(setHover, h => function (pi) {
            let p = pi[0], cs = p.activeCurves;
            if (!p.hide && cs.length === 2) {
                d3.event.stopPropagation();
                hl(p, h ? (c => c === cs[pi[1]]) : true);
                clearLabels();
                gpath.selectAll("path").filter(c => c.p === p).attr("opacity", h ? (c => c !== cs[pi[1]] ? 0.7 : null) : null);
            }
        })
        .on("click", pi => updateCurves(pi[0], false, pi[1]));
    o.append("rect").attrs({ x: 0, y: -6, width: 30, height: 12, opacity: 0 });
    o.append("text").attrs({
        x: 0, y: 0, dy: "0.28em", "text-anchor": "start",
        "font-size": 7.5
    })
        .text("only");
    s.append("text").attr("class", "imbalance")
        .attrs({ x: 8, y: 0, dy: "0.35em", "font-size": 10.5 })
        .text("!");
    if (sampnums.length > 1) {
        let a = s.filter(p => !p.isTarget);
        let f = LR.length > 1 ? (n => "all " + n) : (n => n + " samples");
        let t = a.selectAll()
            .data(p => ["AVG", f(Math.floor(validChannels(p).length / LR.length))]
                .map((t, i) => [t, i === +p.samp ? 1 : 0.6]))
            .join("text").attr("class", "keySamp")
            .attrs({
                x: -18.5 - keyLeft, y: (_, i) => 12 * (i - 1 / 2), dy: "0.33em",
                "text-anchor": "start", "font-size": 7, opacity: t => t[1]
            })
            .text(t => t[0]);
        a.append("rect")
            .attrs({ x: -19 - keyLeft, y: -12, width: keyLeft ? 16 : 38, height: 24, opacity: 0 })
            .on("click", p => updateCurves(p, undefined, p.lr, !p.samp));
    }
    updateKey(s);
}

function updateKey(s) {
    let disp = fn => e => e.attr("display", p => fn(p) ? null : "none"),
        cs = hasChannelSel;
    s.select(".imbalance").call(disp(hasImbalance));
    s.select(".keySel").call(disp(p => cs(p)));
    s.selectAll(".keyOnly").call(disp(pi => cs(pi[0])));
    s.selectAll(".keyCLabel").data(p => p.channels).call(disp(c => c));
    s.select("g").attr("mask", p => cs(p) ? "url(#chmask" + p.id + ")" : null);
    let l = -17 - (keyLeft ? 8 : 0);
    s.select("path").attr("d", p =>
        notMultichannel(p) ? "M" + (15 + keyExt) + " 0H" + l :
            ["M15 -6H9C0 -6,0 0,-9 0H" + l, "M" + l + " 0H-9C0 0,0 6,9 6H15"]
                .filter((_, i) => p.channels[i])
                .reduce((a, b) => a + b.slice(6))
    );
}

function addModel(t) {
    let n = t.append("div").attr("class", "phonename").text(p => p.dispName);
    t.filter(p => p.fileNames)
        .append("div").attr("class", "variants")
        .call(function (s) {
            s.append("svg").attr("viewBox", "0 -2 10 11")
                .append("path").attr("fill", "currentColor")
                .attr("d", "M1 2L5 6L9 2L8 1L6 3Q5 4 4 3L2 1Z");
        })
        .attr("tabindex", 0) // Make focusable
        .on("focus", function (p) {
            if (p.selectInProgress) return;
            p.selectInProgress = true;
            p.vars[p.fileName] = p.rawChannels;
            d3.select(this)
                .on("mousedown", function () {
                    d3.event.preventDefault();
                    this.blur();
                })
                .select("path").attr("transform", "translate(0,7)scale(1,-1)");
            let n = d3.select(this.parentElement).select(".phonename");
            n.text("");
            let q = p.copyOf || p,
                o = q.objs || [p],
                active_fns = o.map(v => v.fileName),
                vars = p.fileNames.map((f, i) => {
                    let j = active_fns.indexOf(f);
                    return j !== -1 ? o[j] :
                        { fileName: f, dispName: q.dispNames[i] };
                });
            let d = n.selectAll().data(vars).join("div")
                .attr("class", "variantName").text(v => v.dispName),
                w = d3.max(d.nodes(), d => d.getBoundingClientRect().width);
            d.style("width", w + "px");
            d.filter(v => v.active)
                .style("cursor", "initial")
                .style("color", getTextColor)
                .call(setHover, h => p =>
                    table.selectAll("tr").filter(q => q === p)
                        .classed("highlight", h)
                );
            let c = n.selectAll().data(vars).join("span")
                .html("&nbsp;+&nbsp;").attr("class", "variantPopout")
                .style("left", (w + 5) + "px")
                .style("display", v => v.active ? "none" : null);
            [d, c].forEach(e => e.transition().style("top", (_, i) => i * 1.3 + "em"));
            d.filter(v => !v.active).on("mousedown", v => Object.assign(p, v));
            c.on("mousedown", function (v) {
                showVariant(q, v);
            });
        })
        .on("blur", function endSelect(p) {
            if (document.activeElement === this) return;
            p.selectInProgress = false;
            d3.select(this)
                .on("mousedown", null)
                .select("path").attr("transform", null);
            let n = d3.select(this.parentElement).select(".phonename");
            n.selectAll("div")
                .call(setHover, h => p => null)
                .transition().style("top", 0 + "em").remove()
                .end().then(() => n.text(p => p.dispName));
            changeVariant(p, updateVariant);
            table.selectAll("tr").classed("highlight", false); // Prevents some glitches
        });
    t.filter(p => p.isTarget).append("span").text(" Target");
}

function updateVariant(p) {
    updateKey(table.selectAll("tr").filter(q => q === p).select(".keyLine"));
    normalizePhone(p);
    updatePaths();
}
function changeVariant(p, update, trigger) {
    let fn = p.fileName,
        ch = p.vars[fn];
    function set(ch) {
        p.rawChannels = ch; p.smooth = undefined;
        smoothPhone(p);
        setCurves(p);
        update(p, 0, 0, trigger);
    }
    if (ch) {
        set(ch);
    } else {
        loadFiles(p, set);
    }
}
function showVariant(p, c, trigger) {
    if (cantCompare(activePhones)) return;
    if (!p.objs) { p.objs = [p]; }
    p.objs.push(c);
    c.active = true; c.copyOf = p;
    ["brand", "dispBrand", "fileNames", "vars"].map(k => c[k] = p[k]);
    changeVariant(c, showPhone, trigger);
}

function cpCircles(svg) {
    svg.selectAll("circle")
        .data(p => [[3, 3, 2], [6.6, 4, 1]].map(([cx, cy, r]) => ({ cx, cy, r, fill: getBgColor(p) })))
        .join("circle").attrs(d => d);
}
function addColorPicker(svg) {
    svg.attr("viewBox", "0 0 9 5.3");
    svg.append("rect").attrs({ x: 0, y: 0, width: 9, height: 5.3, fill: "none" });
    svg.call(cpCircles);
    makeColorPicker(svg);
}
function makeColorPicker(elt) {
    elt.on("click", function (p) {
        p.id = getPhoneNumber();
        colorPhones();
        d3.event.stopPropagation();
    });
}

function colorPhones() {
    updatePaths();
    let c = p => p.active ? getDivColor(p.id, true) : null;
    doc.select("#phones").selectAll("div")
        .style("background", c).style("border-color", c);
    let t = table.selectAll("tr").filter(p => !p.isTarget)
        .style("color", c);
    t.select("button").style("background-color", p => getCurveColor(p.id, 0));
    t = t.call(s => s.select(".remove").style("background-image", colorBar)
        .select("svg").call(cpCircles))
        .select("td.channels"); // Key line
    t.select("svg").remove();
    t.append("svg").call(addKey);
}

let f_values = (function () {
    // Standard frequencies, all phone need to interpolate to this
    let f = [20];
    let step = Math.pow(2, 1 / 48); // 1/48 octave
    while (f[f.length - 1] < 20000) { f.push(f[f.length - 1] * step) }
    return f;
})();
let fr_to_ind = fr => d3.bisect(f_values, fr, 0, f_values.length - 1);
function range_to_slice(xs, fn) {
    let r = xs.map(v => d3.bisectLeft(f_values, x.invert(fn(v))));
    return a => a.slice(Math.max(r[0], 0), r[1] + 1);
}

let norm_sel = (default_normalization.toLowerCase() === "db") ? 0 : 1,
    norm_fr = default_norm_hz,
    norm_phon = default_norm_db;

function normalizePhone(p) {
    if (norm_sel) { // fr
        let i = fr_to_ind(norm_fr);
        let avg = l => 20 * Math.log10(d3.mean(l, d => Math.pow(10, d / 20)));
        p.norm = 60 - avg(validChannels(p).map(l => l[i][1]));
    } else { // phon
        p.norm = find_offset(getAvg(p), norm_phon);
    }
    if (p.eq) {
        p.eq.norm = p.norm; // copy parent's norm to child
    } else if (p.eqParent) {
        p.norm = p.eqParent.norm; // set child's norm from parent
    }
}

let norms = doc.select(".normalize").selectAll("div");
norms.classed("selected", (_, i) => i === norm_sel);
function setNorm(_, i, change) {
    if (change !== false) {
        if (!this.checkValidity()) return;
        let v = +this.value;
        if (i) { norm_fr = v; } else { norm_phon = v; }
    }
    norm_sel = i;
    norms.classed("selected", (_, i) => i === norm_sel);
    activePhones.forEach(normalizePhone);
    if (baseline.p) { baseline = getBaseline(baseline.p); }
    updateYCenter();
    updatePaths();
}
norms.select("input")
    .on("change input", setNorm)
    .on("keypress", function (_, i) {
        if (d3.event.key === "Enter") { setNorm.bind(this)(_, i); }
    });
norms.select("span").on("click", (_, i) => setNorm(_, i, false));

let addPhoneSet = false, // Whether add phone button was clicked
    addPhoneLock = false;
function setAddButton(a) {
    if (a && cantCompare(activePhones)) return false;
    if (addPhoneSet !== a) {
        addPhoneSet = a;
        doc.select(".addPhone").classed("selected", a)
            .classed("locked", addPhoneLock &= a);
    }
    return true;
}
doc.select(".addPhone").selectAll("td")
    .on("click", () => setAddButton(!addPhoneSet));
doc.select(".addLock").on("click", function () {
    d3.event.preventDefault();
    let on = !addPhoneLock;
    if (!setAddButton(on)) return;
    if (on) {
        doc.select(".addPhone").classed("locked", addPhoneLock = true);
    }
});

function showPhone(p, exclusive, suppressVariant, trigger) {
    if (p.isTarget && activePhones.indexOf(p) !== -1) {
        removePhone(p);
        return;
    }
    if (addPhoneSet) {
        exclusive = false;
        if (!addPhoneLock || cantCompare(activePhones, 1, null, true)) {
            setAddButton(false);
        }
    }
    let keep = !exclusive ? (q => true)
        : (q => q.copyOf === p || q.pin || q.isTarget !== p.isTarget);
    if (cantCompare(activePhones.filter(keep), 0, p)) return;
    if (!p.rawChannels) {
        loadFiles(p, function (ch) {
            if (p.rawChannels) return;
            p.rawChannels = ch;
            showPhone(p, exclusive, suppressVariant, trigger);

            // Analytics event
            if (analyticsEnabled) { pushPhoneTag("phone_displayed", p, trigger); }
        });
        return;
    }
    smoothPhone(p);
    if (p.id === undefined) { p.id = getPhoneNumber(); }
    normalizePhone(p); p.offset = p.offset || 0;
    if (exclusive) {
        activePhones = activePhones.filter(q => q.active = keep(q));
        if (baseline.p && !baseline.p.active) setBaseline(baseline0, 1);
    }
    if (activePhones.indexOf(p) === -1 && (suppressVariant || !p.objs)) {
        let avg = false;
        if (!p.isTarget) {
            let ap = activePhones.filter(p => !p.isTarget);
            avg = ap.length >= 1;
            if (ap.length === 1 && ap[0].activeCurves.length !== 1) {
                setCurves(ap[0], true);
            }
            activePhones.push(p);
        } else {
            activePhones.unshift(p);
        }
        p.active = true;
        setCurves(p, avg);
    }
    updatePaths(trigger);
    updatePhoneTable();
    d3.selectAll("#phones .phone-item,.target")
        .filter(p => p.id !== undefined)
        .call(setPhoneTr);
    //Displays variant pop-up when phone displayed
    if (!suppressVariant && p.fileNames && !p.copyOf && window.innerWidth > 1000) {
        table.selectAll("tr").filter(q => q === p).select(".variants").node().focus();
    } else {
        document.activeElement.blur();
    }
    if (extraEnabled && extraEQEnabled) {
        updateEQPhoneSelect();
    }
}

function removeCopies(p) {
    if (p.objs) {
        p.objs.forEach(q => q.active = false);
        delete p.objs;
    }
    removePhone(p);
}

function removePhone(p) {
    p.active = p.pin = false; nextPN = null;
    activePhones = activePhones.filter(q => q.active);
    if (!p.isTarget) {
        let ap = activePhones.filter(p => !p.isTarget);
        if (ap.length === 1) {
            setCurves(ap[0], false);
        }
    }
    updatePaths();
    if (baseline.p && !baseline.p.active) { setBaseline(baseline0); }
    updatePhoneTable();
    d3.selectAll("#phones div,.target")
        .filter(q => q === (p.copyOf || p))
        .call(setPhoneTr);
    if (extraEnabled && extraEQEnabled) {
        updateEQPhoneSelect();
    }
}

function asPhoneObj(b, p, isInit, inits) {
    if (!isInit) {
        isInit = _ => false;
    }
    let r = { brand: b, dispBrand: b.name };
    if (typeof p === "string") {
        r.phone = r.fileName = p;
        if (isInit(p)) inits.push(r);
    } else {
        r.phone = p.name;
        if (p.collab) {
            r.dispBrand += " x " + p.collab;
            r.collab = brandMap[p.collab];
        }
        let f = p.file || p.name;
        if (typeof f === "string") {
            r.fileName = f;
            if (isInit(f)) inits.push(r);
        } else {
            r.fileNames = f;
            r.vars = {};
            let dns = f;
            if (p.suffix) {
                dns = p.suffix.map(
                    s => p.name + (s ? " " + s : "")
                );
            } else if (p.prefix) {
                let reg = new RegExp("^" + p.prefix + "\s*", "i");
                dns = f.map(n => {
                    n = n.replace(reg, "");
                    return p.name + (n.length ? " " + n : n);
                });
            }
            r.dispNames = dns;
            r.fileName = f[0];
            r.dispName = dns[0];
            let c = r;
            f.map((fn, i) => {
                if (!isInit(fn)) return;
                c.fileName = fn; c.dispName = dns[i];
                inits.push(c);
                c = { copyOf: r };
            });
        }
    }
    r.dispName = r.dispName || r.phone;
    r.fullName = r.dispBrand + " " + r.phone;
    return r;
}

d3.json(typeof PHONE_BOOK !== "undefined" ? PHONE_BOOK
    : DIR + "phone_book.json?" + new Date().getTime()).then(function (brands) {
        let brandMap = window.brandMap = {},
            inits = [],
            initReq = typeof init_phones !== "undefined" ? init_phones : false;
        loadFromShare = 0;

        if (ifURL) {
            let url = targetWindow.location.href,
                par = "share=";
            emb = "embed";
            baseURL = url.split("?").shift();
            if (url.includes(par) && url.includes(emb)) {
                initReq = decodeURIComponent(url.replace(/_/g, " ").split(par).pop()).split(",");
                loadFromShare = 2;
            } else if (url.includes(par)) {
                initReq = decodeURIComponent(url.replace(/_/g, " ").split(par).pop()).split(",");
                loadFromShare = 1;
            }
        }
        let isInit = initReq ? f => initReq.indexOf(f) !== -1
            : _ => false;

        if (loadFromShare === 1) {
            initMode = "share";
        } else if (loadFromShare === 2) {
            initMode = "embed";
        } else {
            initMode = "config";
        }

        brands.push({ name: "Uploaded", phones: [] });
        brands.forEach(b => brandMap[b.name] = b);
        brands.forEach(function (b) {
            b.active = false;
            b.phoneObjs = b.phones.map(function (p) {
                return asPhoneObj(b, p, isInit, inits);
            });
        });

        let allPhones = window.allPhones = d3.merge(brands.map(b => b.phoneObjs)),
            currentBrands = [];
        if (!initReq) inits.push(allPhones[0]);

        function setClicks(fn) {
            return function (elt) {
                elt.on("mousedown", () => d3.event.preventDefault())
                    .on("click", p => fn(p, !d3.event.ctrlKey))
                    .on("auxclick", p => d3.event.button === 1 ? fn(p, 0) : 0);
            };
        }

        let brandSel = doc.select("#brands").selectAll()
            .data(brands).join("div")
            .text(b => b.name + (b.suffix ? " " + b.suffix : ""))
            .call(setClicks(setBrand));

        let bg = (h, fn) => function (p) {
            d3.select(this).style("background", fn(p));
            (p.objs || [p]).forEach(q => hl(q, h));
        }
        window.updatePhoneSelect = () => {
            doc.select("#phones").selectAll("div.phone-item")
                .data(allPhones)
                .join((enter) => {
                    let phoneDiv = enter.append("div")
                        .attr("class", "phone-item")
                        .attr("name", p => p.fullName)
                        .on("mouseover", bg(true, p => getDivColor(p.id === undefined ? nextPhoneNumber() : p.id, true)))
                        .on("mouseout", bg(false, p => p.id !== undefined ? getDivColor(p.id, p.active) : null))
                        .call(setClicks(showPhone));
                    phoneDiv.append("span").text(p => p.fullName);
                    // Adding the + selection button
                    phoneDiv.append("div")
                        .attr("class", "phone-item-add")
                        .on("click", p => {
                            d3.event.stopPropagation();
                            showPhone(p, 0);
                        });
                });
        };
        updatePhoneSelect();

        if (targets) {
            let b = window.brandTarget = { name: "Targets", active: false },
                ti = -targets.length,
                ph = t => ({
                    isTarget: true, brand: b,
                    dispName: t, phone: t, fullName: t + " Target", fileName: t + " Target"
                });
            d3.select(".manage").insert("div", ".manageTable")
                .attr("class", "targets collapseTools");
            let l = (text, c) => s => s.append("div").attr("class", "targetLabel").append("span").text(text);
            let ts = b.phoneObjs = doc.select(".targets").call(l("Targets"))
                .selectAll().data(targets).join("div").call(l(t => t.type))
                .style("flex-grow", t => t.files.length).attr("class", "targetClass")
                .selectAll().data(t => t.files.map(ph))
                .join("div").text(t => t.dispName).attr("class", "target")
                .call(setClicks(showPhone))
                .data();
            ts.forEach((t, i) => {
                t.id = i - ts.length;
                if (isInit(t.fileName)) inits.push(t);
            });
        }

        inits.map(p => p.copyOf ? showVariant(p.copyOf, p, initMode)
            : showPhone(p, 0, 1, initMode));

        function setBrand(b, exclusive) {
            let phoneSel = doc.select("#phones").selectAll("div.phone-item");
            let incl = currentBrands.indexOf(b) !== -1;
            let hasBrand = (p, b) => p.brand === b || p.collab === b;
            if (exclusive || currentBrands.length === 0) {
                currentBrands.forEach(br => br.active = false);
                if (incl) {
                    currentBrands = [];
                    phoneSel.style("display", null);
                    phoneSel.select("span").text(p => p.fullName);
                } else {
                    currentBrands = [b];
                    phoneSel.style("display", p => hasBrand(p, b) ? null : "none");
                    phoneSel.filter(p => hasBrand(p, b)).select("span").text(p => p.phone);
                }
            } else {
                if (incl) return;
                if (currentBrands.length === 1) {
                    phoneSel.select("span").text(p => p.fullName);
                }
                currentBrands.push(b);
                phoneSel.filter(p => hasBrand(p, b)).style("display", null);
            }
            if (!incl) b.active = true;
            brandSel.classed("active", br => br.active);
        }

        let phoneSearch = new Fuse(
            allPhones,
            {
                shouldSort: false,
                tokenize: true,
                threshold: 0.2,
                minMatchCharLength: 2,
                keys: [
                    { weight: 0.3, name: "dispBrand" },
                    { weight: 0.1, name: "brand.suffix" },
                    { weight: 0.6, name: "phone" }
                ]
            }
        );
        let brandSearch = new Fuse(
            brands,
            {
                shouldSort: false,
                tokenize: true,
                threshold: 0.05,
                minMatchCharLength: 3,
                keys: [
                    { weight: 0.9, name: "name" },
                    { weight: 0.1, name: "suffix" },
                ]
            }
        );
        doc.select(".search").on("input", function () {
            //d3.select(this).attr("placeholder",null);
            let fn, bl = brands;
            let c = currentBrands;
            let test = p => c.indexOf(p.brand) !== -1
                || c.indexOf(p.collab) !== -1;
            if (this.value.length > 1) {
                let s = phoneSearch.search(this.value),
                    t = c.length ? s.filter(test) : s;
                if (t.length) s = t;
                fn = p => s.indexOf(p) !== -1;
                let b = brandSearch.search(this.value);
                if (b.length) bl = b;
            } else {
                fn = c.length ? test : (p => true);
            }
            let phoneSel = doc.select("#phones").selectAll("div.phone-item");
            phoneSel.style("display", p => fn(p) ? null : "none");
            brandSel.style("display", b => bl.indexOf(b) !== -1 ? null : "none");
        });

        doc.select("#recolor").on("click", function () {
            allPhones.forEach(p => { if (!p.isTarget) { delete p.id; } });
            phoneNumber = 0; nextPN = null;
            activePhones.forEach(p => { if (!p.isTarget) { p.id = getPhoneNumber(); } });
            colorPhones();
        });

        doc.select("#theme").on("click", function () {
            themeChooser("change");
        });
    });

let pathHoverTimeout;
function pathHL(c, m, imm) {
    gpath.selectAll("path").classed("highlight", c ? d => d === c : false);
    table.selectAll("tr").classed("highlight", c ? p => p === c.p : false);
    if (pathHoverTimeout) { clearTimeout(pathHoverTimeout); }
    if (!stickyLabels) {
        clearLabels();
        pathHoverTimeout =
            imm ? pathTooltip(c, m) :
                c ? setTimeout(pathTooltip, 400, c, m) :
                    undefined;
    }
}
function pathTooltip(c, m) {
    let g = gr.selectAll(".lineLabel").data([c.id])
        .join("g").attr("class", "lineLabel");
    let t = g.append("text")
        .attrs({ x: m[0], y: m[1] - 6, fill: getTooltipColor(c) })
        .text(t => t);
    let b = t.node().getBBox(),
        o = pad.l + W - b.width;
    if (o < b.x) { t.attr("x", o); b.x = o; }
    // Background
    g.insert("rect", "text")
        .attrs({ x: b.x - 1, y: b.y - 1, width: b.width + 2, height: b.height + 2 });
}
let interactInspect = false;
let graphInteract = imm => function () {
    let cs = d3.merge(activePhones.map(p => p.hide ? [] : p.activeCurves));
    if (!cs.length) return;
    let m = d3.mouse(this);
    if (interactInspect) {
        let ind = fr_to_ind(x.invert(m[0])),
            x1 = x(f_values[ind]),
            x0 = ind > 0 ? x(f_values[ind - 1]) : x1,
            sel = m[0] - x0 < x1 - m[0],
            xv = sel ? x0 : x1;
        ind -= sel;
        function init(e) {
            e.attr("class", "inspector");
            e.append("line").attrs({ x1: 0, x2: 0, y1: pad.t, y2: pad.t + H });
            e.append("text").attr("class", "insp_dB").attr("x", 2);
        }
        let insp = gr.selectAll(".inspector").data([xv])
            .join(enter => enter.append("g").call(init))
            .attr("transform", xv => "translate(" + xv + ",0)");
        let dB = insp.select(".insp_dB").text(f_values[ind] + " Hz");
        let cy = cs.map(c => [c, baseline.fn(c.l)[ind][1] + getOffset(c.p)]);
        cy.sort((d, e) => d[1] - e[1]);
        function newTooltip(t) {
            t.attr("class", "lineLabel")
                .attr("fill", d => getTooltipColor(d));
            t.append("text").attr("x", 2).text(d => d.id);
            t.append("g").selectAll().data([0, 1])
                .join("text")
                .attr("x", -16)
                .attr("text-anchor", i => i ? "start" : "end");
            t.datum(function () { return this.getBBox(); });
            t.insert("rect", "text")
                .attrs(b => ({ x: b.x - 1, y: b.y - 1, width: b.width + 2, height: b.height + 2 }));
        }
        let tt = insp.selectAll(".lineLabel").data(cy.map(d => d[0]), d => d.id)
            .join(enter => enter.insert("g", "line").call(newTooltip));
        let start = tt.select("g").datum((_, i) => cy[i][1])
            .selectAll("text").data(d => {
                let s = d < -0.05 ? "-" : ""; d = Math.abs(d) + 0.05;
                return [s + Math.floor(d) + ".", Math.floor((d % 1) * 10)];
            })
            .text(t => t)
            .filter((_, i) => i === 0)
            .nodes().map(n => n.getBBox().x - 2);
        tt.select("rect")
            .attrs((b, i) => ({ x: b.x + start[i] - 1, width: b.width - start[i] + 2 }));
        // Now compute heights
        let hm = d3.max(tt.data().map(b => b.height)),
            hh = (y.invert(0) - y.invert(hm - 1)) / 2,
            stack = [];
        cy.map(d => d[1]).forEach(function (h, i) {
            let n = 1;
            let overlap = s => h / n - s.h / s.n <= hh * (s.n + n);
            let l = stack.length;
            while (l && overlap(stack[--l])) {
                let s = stack.pop();
                h += s.h; n += s.n;
            }
            stack.push({ h: h, n: n });
        });
        let ch = d3.merge(stack.map((s, i) => {
            let h = s.h / s.n - (s.n - 1) * hh;
            return d3.range(s.n).map(k => h + k * 2 * hh);
        }));
        tt.attr("transform", (_, i) => "translate(0," + (y(ch[i]) + 5) + ")");
        dB.attr("y", y(ch[ch.length - 1] + 2 * hh) + 1);
    } else {
        let d = 30 * W0 / gr.node().getBoundingClientRect().width,
            sl = range_to_slice([-1, 1], s => m[0] + d * s);
        let ind = cs
            .map(c =>
                sl(baseline.fn(c.l))
                    .map(p => Math.hypot(x(p[0]) - m[0], y(p[1] + getOffset(c.p)) - m[1]))
                    .reduce((a, b) => Math.min(a, b), d)
            )
            .reduce((a, b, i) => b < a[1] ? [i, b] : a, [-1, d])[0];
        pathHL(ind === -1 ? false : cs[ind], m, imm);
    }
}
function stopInspect() { gr.selectAll(".inspector").remove(); }
gr.append("rect")
    .attrs({ x: pad.l, y: pad.t, width: W, height: H, opacity: 0 })
    .on("mousemove", graphInteract())
    .on("mouseout", () => interactInspect ? stopInspect() : pathHL(false))
    .on("click", graphInteract(true));

doc.select("#inspector").on("click", function () {
    clearLabels(); stopInspect();
    d3.select(this).classed("selected", interactInspect = !interactInspect);
});

doc.select("#expandTools").on("click", function () {
    let t = doc.select(".tools"), cl = "collapseTools", v = !t.classed(cl);
    [t, doc.select(".targets")].forEach(s => s.classed(cl, v));
});

d3.selectAll(".helptip").on("click", function () {
    let e = d3.select(this);
    e.classed("active", !e.classed("active"));
});

// Copy URL button functionality
function copyUrlInit() {
    let copyUrlButton = document.querySelector("button#copy-url");

    copyUrlButton.addEventListener("click", function (e) {
        let urlHost = document.createElement('input'),
            currentUrl = targetWindow.location.href;

        urlHost.setAttribute("style", "position: fixed; opacity: 0.0;");
        urlHost.value = currentUrl;
        document.body.appendChild(urlHost);

        urlHost.select();
        document.execCommand('copy');
        document.body.removeChild(urlHost);

        e.stopPropagation();

        copyUrlButton.classList.add("clicked");
        setTimeout(function () {
            copyUrlButton.classList.remove("clicked");
        }, 600);

        // Analytics event
        if (analyticsEnabled) { pushEventTag("clicked_copyUrl", targetWindow); }
    });
}
copyUrlInit();

// Theme Chooser
function themeChooser(command) {
    let docBody = document.querySelector("body"),
        darkClass = "dark-mode",
        darkModePref = localStorage.getItem("dark-mode-pref");

    if (darkModePref) {
        if (command === "change") {
            localStorage.removeItem("dark-mode-pref");
            docBody.classList.remove(darkClass);
        } else {
            docBody.classList.add(darkClass);
        }
    } else {
        if (command === "change") {
            localStorage.setItem("dark-mode-pref", "true");
            docBody.classList.add(darkClass);
        }
    }
}
if (darkModeButton) {
    let themeButton = document.createElement("button"),
        miscTools = document.querySelector("div.miscTools");

    themeButton.setAttribute("id", "theme");
    themeButton.textContent = "dark mode";
    miscTools.append(themeButton);

    themeChooser();
}

// Map faux download button
function mapDownloadFaux() {
    let downloadButton = document.querySelector("button#download"),
        downloadFaux = document.querySelector("button#download-faux");

    downloadFaux.addEventListener("click", function () {
        downloadButton.click();
    });
}
mapDownloadFaux();

// Set focused scroll list
function setFocusedList(selectedList) {
    let listsContainer = document.querySelector("div.select");

    listsContainer.setAttribute("data-selected", selectedList)
}

function focusedListClicks() {
    let listClickTragets = document.querySelectorAll("*[data-list=\"brands\"], *[data-list=\"models\"]");

    listClickTragets.forEach((clickedTarget) => {
        clickedTarget.addEventListener("click", () => {
            let selectedList = clickedTarget.getAttribute("data-list")
            setFocusedList(selectedList);
            window.hideExtraPanel && window.hideExtraPanel(selectedList);
        });
    });

    let brandsList = document.querySelector("div.scroll#brands");

    brandsList.addEventListener("click", function (e) {
        let clickedElem = e.target,
            clickedElemIsBrand = clickedElem.matches("div.scroll#brands div");

        if (clickedElemIsBrand) {
            setFocusedList("models");
            e.stopPropagation();
        }
    });

}
focusedListClicks();

function focusedListSwipes() {
    let horizontalSwipeTarget = document.querySelector("div.scroll-container"),
        listsContainer = document.querySelector("div.select"),
        swipableList = document.querySelector("div.scrollOuter[data-list=\"models\"]");
    touchDelta = 0;

    horizontalSwipeTarget.addEventListener("touchstart", function (e) {
        selectedList = listsContainer.getAttribute("data-selected");
        touchStart = e.targetTouches[0].screenX;

        horizontalSwipeTarget.addEventListener("touchmove", function (e) {
            touchNow = e.targetTouches[0].screenX;
            touchDelta = touchNow - touchStart,
                touchDeltaNegative = 0 - touchDelta;

            if (selectedList === "models" && touchDelta > 0 && touchDelta < 100) {
                swipableList.setAttribute("style", "right: " + touchDeltaNegative + "px;")
            }

            if (selectedList === "brands" && touchDelta < 0 && touchDelta > -100) {
                swipableList.setAttribute("style", "right: " + touchDeltaNegative + "px;")
            }
        });
    });

    horizontalSwipeTarget.addEventListener("touchend", function (e) {
        if (touchDelta > 49) {
            listsContainer.setAttribute("data-selected", "brands");
        }

        if (touchDelta < -50) {
            listsContainer.setAttribute("data-selected", "models");
        }

        swipableList.setAttribute("style", "")
        touchStart = 0;
        touchNow = 0;
        touchDelta = 0;

        //horizontalSwipeTarget.removeEventListener("touchmove");
    });
}
focusedListSwipes();

// Set focused panel
function setFocusedPanel() {
    let panelsContainer = document.querySelector("main.main"),
        primaryPanel = document.querySelector(".parts-primary"),
        secondaryPanel = document.querySelector(".parts-secondary"),
        phonesList = document.querySelector("div#phones"),
        graphBox = document.querySelector("div.graph-sizer"),
        mobileHelper = document.querySelector("tr.mobile-helper");

    panelsContainer.setAttribute("data-focused-panel", "secondary");

    mobileHelper.addEventListener("click", function () {
        panelsContainer.setAttribute("data-focused-panel", "secondary");
    });

    secondaryPanel.addEventListener("click", function () {
        panelsContainer.setAttribute("data-focused-panel", "secondary");
    });

    graphBox.addEventListener("click", function () {
        let previousState = panelsContainer.getAttribute("data-focused-panel");

        if (previousState === "primary") {
            panelsContainer.setAttribute("data-focused-panel", "secondary");
        } else if (previousState === "secondary") {
            panelsContainer.setAttribute("data-focused-panel", "primary");
        }
    });

    // Touch events
    let verticalSwipeTargets = document.querySelectorAll("div.selector-tabs, input.search");

    verticalSwipeTargets.forEach(function (target) {
        target.addEventListener("touchstart", function (e) {
            focusedPanel = document.querySelector("main.main").getAttribute("data-focused-panel");

            touchStart = e.targetTouches[0].screenY;

            target.addEventListener("touchmove", function (e) {
                touchNow = e.targetTouches[0].screenY;
                touchDelta = touchNow - touchStart;

                if (focusedPanel === "secondary" && touchDelta > 0 && touchDelta < 200) {
                    secondaryPanel.setAttribute("style", "top: " + touchDelta + "px;")
                } else if (focusedPanel === "primary" && touchDelta < 0 && touchDelta > -200) {
                    secondaryPanel.setAttribute("style", "top: " + touchDelta + "px;")
                }
            });
        });

        target.addEventListener("touchend", function (e) {
            if (touchDelta > 49) {
                panelsContainer.setAttribute("data-focused-panel", "primary");
            }

            if (touchDelta < -50) {
                panelsContainer.setAttribute("data-focused-panel", "secondary");
            }

            secondaryPanel.setAttribute("style", "")
            touchStart = 0;
            touchNow = 0;
            touchDelta = 0;
        });

        target.addEventListener("wheel", function (e) {
            let wheelDelta = e.deltaY;

            if (wheelDelta < -5) {
                panelsContainer.setAttribute("data-focused-panel", "primary");
            }

            if (wheelDelta > 5) {
                panelsContainer.setAttribute("data-focused-panel", "secondary");
            }
        });
    });
}
setFocusedPanel();

// Blur focus from inputs on submit
function blurFocus() {
    let inputFields = document.querySelectorAll("input"),
        body = document.querySelector("body");

    inputFields.forEach(function (field) {
        field.addEventListener("keyup", function (e) {
            if (e.keyCode === 13) {
                field.blur();
            }
        });

        field.addEventListener("focus", function () {
            body.setAttribute("data-input-state", "focus");
        });

        field.addEventListener("blur", function () {
            body.setAttribute("data-input-state", "blur");
        });
    });
}
blurFocus();

// Add extra feature
function addExtra() {
    let extraButton = document.querySelector("div.select > div.selector-tabs > button.extra");
    // Disable functions by config
    if (!extraEnabled) {
        extraButton.remove();
        return;
    }
    if (!extraUploadEnabled) {
        document.querySelector("div.extra-panel > div.extra-upload").style["display"] = "none";
    }
    if (!extraEQEnabled) {
        document.querySelector("div.extra-panel > div.extra-eq").style["display"] = "none";
    }
    if (!extraToneGeneratorEnabled) {
        document.querySelector("div.extra-panel > div.extra-tone-generator").style["display"] = "none";
    }
    // Show and hide extra panel
    window.showExtraPanel = () => {
        document.querySelector("div.select > div.selector-panel").style["display"] = "none";
        document.querySelector("div.select > div.extra-panel").style["display"] = "flex";
        document.querySelector("div.select").setAttribute("data-selected", "extra");
    };
    window.hideExtraPanel = (selectedList) => {
        document.querySelector("div.select > div.selector-panel").style["display"] = "flex";
        document.querySelector("div.select > div.extra-panel").style["display"] = "none";
        document.querySelector("div.select").setAttribute("data-selected", selectedList);
    };
    extraButton.addEventListener("click", showExtraPanel);
    // Upload function
    let uploadType = null;
    let fileFR = document.querySelector("#file-fr");
    document.querySelector("div.extra-upload > button.upload-fr").addEventListener("click", () => {
        uploadType = "fr";
        fileFR.click();
    });
    document.querySelector("div.extra-upload > button.upload-target").addEventListener("click", () => {
        uploadType = "target";
        fileFR.click();
    });
    let addOrUpdatePhone = (brand, phone, ch) => {
        let phoneObj = asPhoneObj(brand, phone);
        phoneObj.rawChannels = ch;
        phoneObj.isDynamic = true;
        let phoneObjs = brand.phoneObjs;
        let oldPhoneObj = phoneObjs.filter(p => p.phone == phone.name)[0]
        if (oldPhoneObj) {
            oldPhoneObj.active && removePhone(oldPhoneObj);
            phoneObj.id = oldPhoneObj.id;
            phoneObjs[phoneObjs.indexOf(oldPhoneObj)] = phoneObj;
            allPhones[allPhones.indexOf(oldPhoneObj)] = phoneObj;
        } else {
            brand.phones.push(phone);
            phoneObjs.push(phoneObj);
            allPhones.push(phoneObj);
        }
        updatePhoneSelect();
        return phoneObj;
    };
    fileFR.addEventListener("change", (e) => {
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let name = file.name.replace(/\.[^\.]+$/, "");
            let phone = { name: name };
            let ch = [tsvParse(e.target.result)];
            if (ch[0].length < 32) {
                alert("Parse frequence response file failed: invalid format.");
                return;
            }
            ch[0] = Equalizer.interp(f_values, ch[0]);
            if (uploadType === "fr") {
                name.match(/ R$/) && ch.splice(0, 0, null);
                let phoneObj = addOrUpdatePhone(brandMap.Uploaded, phone, ch);
                showPhone(phoneObj, false);
            } else if (uploadType === "target") {
                let fullName = name + (name.match(/ Target$/i) ? "" : " Target");
                let existsTargets = targets.reduce((a, b) => a.concat(b.files), []).map(f => f += " Target");
                if (existsTargets.indexOf(fullName) >= 0) {
                    alert("This target already exists on this tool, please select it instead of upload.");
                    return;
                }
                let phoneObj = {
                    isTarget: true,
                    brand: brandTarget,
                    dispName: name,
                    phone: name,
                    fullName: fullName,
                    fileName: fullName,
                    rawChannels: ch,
                    isDynamic: true,
                    id: -brandTarget.phoneObjs.length
                };
                showPhone(phoneObj, true);
            }
        };
        reader.readAsText(file);
    });
    // EQ Function
    let eqPhoneSelect = document.querySelector("div.extra-eq select[name='phone']");
    let filtersContainer = document.querySelector("div.extra-eq > div.filters");
    let fileFiltersImport = document.querySelector("#file-filters-import");
    let filterEnabledInput, filterTypeSelect,
        filterFreqInput, filterQInput, filterGainInput;
    let eqBands = extraEQBands;
    let isGraphicEQMode = false;
    let updateFilterElements = () => {
        let node = filtersContainer.querySelector("div.filter");
        while (filtersContainer.childElementCount < eqBands) {
            let clone = node.cloneNode(true);
            clone.querySelector("input[name='enabled']").value = "true";
            clone.querySelector("select[name='type']").value = "PK";
            clone.querySelector("input[name='freq']").value = "0";
            clone.querySelector("input[name='q']").value = "0";
            clone.querySelector("input[name='gain']").value = "0";
            filtersContainer.appendChild(clone);
        }
        while (filtersContainer.childElementCount > eqBands) {
            if(filtersContainer.children[filtersContainer.childElementCount - 1].querySelector("select[name='type']").value == "PK-xBass") {
                if(eqBands == 2) {
                    eqBands = 1;
                    for(let i=0;i<2;i++) {
                        filtersContainer.children[filtersContainer.childElementCount - 1].remove();
                    }
                    filtersContainer.children[0].querySelector("input[name='enabled']").value = "true";
                    filtersContainer.children[0].querySelector("select[name='type']").value = "PK";
                    filtersContainer.children[0].querySelector("input[name='freq']").value = "0";
                    filtersContainer.children[0].querySelector("input[name='q']").value = "0";
                    filtersContainer.children[0].querySelector("input[name='gain']").value = "0";
                    filtersContainer.children[0].removeAttribute("id");
                    applyEQ();
                }
                else {
                    eqBands -= 2;
                    let xBassIdx = new Array();
                    for(let i=0;i<filtersContainer.children.length;i++) {
                        if(filtersContainer.children[i].querySelector("select[name='type']").value == "PK-xBass") {
                            xBassIdx.push(i);
                        }
                    }
                    for(let i=0;i<xBassIdx.length;i++) {
                        filtersContainer.children[xBassIdx[i] - i].remove();
                    }
                    applyEQ();
                }
            }
            else {
                filtersContainer.children[filtersContainer.childElementCount - 1].remove();
            }
        }
        filterEnabledInput = filtersContainer.querySelectorAll("input[name='enabled']");
        filterTypeSelect = filtersContainer.querySelectorAll("select[name='type']");
        filterFreqInput = filtersContainer.querySelectorAll("input[name='freq']");
        filterQInput = filtersContainer.querySelectorAll("input[name='q']");
        filterGainInput = filtersContainer.querySelectorAll("input[name='gain']");
        filtersContainer.querySelectorAll("input,select").forEach(el => {
            el.removeEventListener("input", applyEQ);
            el.addEventListener("input", applyEQ);
        });
    };
    let elemToFilters = (includeAll) => {
        // Collect filters from ui
        let filters = [];
        for (let i = 0; i < eqBands; ++i) {
            let disabled = !filterEnabledInput[i].checked;
            let type = filterTypeSelect[i].value;
            let freq = parseInt(filterFreqInput[i].value) || 0;
            let q = parseFloat(filterQInput[i].value) || 0;
            let gain = parseFloat(filterGainInput[i].value) || 0;
            if (!includeAll && (disabled || !type || !freq || !q || !gain)) {
                continue;
            }
            filters.push({ disabled, type, freq, q, gain });
        }
        return filters;
    };
    let filtersToElem = (filters) => {
        // Set filters to ui
        let filtersCopy = filters.map(f => f);
        while (filtersCopy.length < eqBands) {
            filtersCopy.push({ type: "PK", freq: 0, q: 0, gain: 0 });
        }
        if (filtersCopy.length > eqBands) {
            eqBands = Math.min(filtersCopy.length, extraEQBandsMax);
            filtersCopy = filtersCopy.slice(0, eqBands);
            updateFilterElements();
        }
        filtersCopy.forEach((f, i) => {
            filterEnabledInput[i].checked = !f.disabled;
            filterTypeSelect[i].value = f.type;
            filterFreqInput[i].value = f.freq;
            filterQInput[i].value = f.q;
            filterGainInput[i].value = f.gain;
        });
    };
    let applyEQHandle = null;
    let applyEQExec = () => {
        // Create and show phone with eq applied
        let activeElem = document.activeElement;
        let phoneSelected = eqPhoneSelect.value;
        let filters = elemToFilters();
        if (filters.length && !phoneSelected) {
            let firstPhone = eqPhoneSelect.querySelectorAll("option")[1];
            if (firstPhone) {
                phoneSelected = eqPhoneSelect.value = firstPhone.value;
            }
        }
        let phoneObj = phoneSelected && activePhones.filter(
            p => p.fullName == phoneSelected)[0];
        if (!phoneObj || (!filters.length && !phoneObj.eq)) {
            return; // Allow empty filters if eq is applied before
        }
        let phoneEQ = { name: phoneObj.phone + " EQ" };
        let phoneObjEQ = addOrUpdatePhone(phoneObj.brand, phoneEQ,
            phoneObj.rawChannels.map(c => c ? Equalizer.apply(c, filters) : null));
        phoneObj.eq = phoneObjEQ;
        phoneObjEQ.eqParent = phoneObj;
        showPhone(phoneObjEQ, false);
        activeElem.focus();
    };
    let applyEQ = () => {
        clearTimeout(applyEQHandle);
        applyEQHandle = setTimeout(applyEQExec, 100);
    };
    window.updateEQPhoneSelect = () => {
        let oldValue = eqPhoneSelect.value;
        let optionValues = activePhones.filter(p =>
            !p.isTarget && !p.fullName.match(/ EQ$/)).map(p => p.fullName);
        Array.from(eqPhoneSelect.children).slice(1).forEach(c => eqPhoneSelect.removeChild(c));
        optionValues.forEach(value => {
            let optionElem = document.createElement("option");
            optionElem.setAttribute("value", value);
            optionElem.innerText = value;
            eqPhoneSelect.appendChild(optionElem);
        });
        eqPhoneSelect.value = (optionValues.indexOf(oldValue) >= 0) ? oldValue : "";
    };
    updateFilterElements();
    eqPhoneSelect.addEventListener("input", applyEQ);
    document.querySelector("div.extra-eq button.reset").addEventListener("click", () => {
        isGraphicEQMode = false;
        eqBands = 1;
        updateFilterElements();
        let node = filtersContainer.querySelector("div.filter");
        node.querySelector("input[name='enabled']").value = "true";
        node.querySelector("select[name='type']").value = "PK";
        node.querySelector("input[name='freq']").value = "0";
        node.querySelector("input[name='q']").value = "0";
        node.querySelector("input[name='gain']").value = "0";
        eqBands = 10;
        updateFilterElements();
        applyEQ();
    });
    // Add new filter
    document.querySelector("div.extra-eq button.add-filter").addEventListener("click", () => {
        isGraphicEQMode = false;
        eqBands = Math.min(eqBands + 1, extraEQBandsMax);
        updateFilterElements();
    });
    // Remove last filter
    document.querySelector("div.extra-eq button.remove-filter").addEventListener("click", () => {
        if(isGraphicEQMode) {
            isGraphicEQMode = false;
            eqBands = 1;
            updateFilterElements();
            let node = filtersContainer.querySelector("div.filter");
            node.querySelector("input[name='enabled']").value = "true";
            node.querySelector("select[name='type']").value = "PK";
            node.querySelector("input[name='freq']").value = "0";
            node.querySelector("input[name='q']").value = "0";
            node.querySelector("input[name='gain']").value = "0";
            eqBands = 10;
        } 
        else{ 
            eqBands = Math.max(eqBands - 1, 1);
        }
        updateFilterElements();
        applyEQ(); // May removed effective filter
    });
    // Sort filters by frequency
    document.querySelector("div.extra-eq button.sort-filters").addEventListener("click", () => {
        filtersToElem(elemToFilters(true).sort((a, b) =>
            (a.freq || Infinity) - (b.freq || Infinity)));
    });
    // Import filters
    document.querySelector("div.extra-eq button.import-filters").addEventListener("click", () => {
        fileFiltersImport.click();
    });
    document.querySelector("div.extra-eq button.xbass").addEventListener("click", () => {
        if (eqBands > 17) alert("17개 이하의 필터가 존재할 때 사용 가능. 현재 " + eqBands + "개의 필터 사용중!");
        else {
            for(let i=0;i<filtersContainer.children.length;i++) {
                if(filtersContainer.children[i].querySelector("select[name='type']").value == "PK-xBass") {
                    alert("xBass가 이미 적용되었습니다!");
                    return;
                }
            }
            eqBands += 3;
            let node = filtersContainer.querySelector("div.filter");
            let freq = ["22", "37", "48"];
            let gain = ["12.0", "1.0", "-1.5"];
            let q = ["0.533", "2.000", "2.000"];
            for (let i = 0; i < 3; i++) {
                let clone = node.cloneNode(true);
                clone.querySelector("input[name='enabled']").value = "true";
                clone.querySelector("select[name='type']").value = "PK-xBass";
                clone.querySelector("input[name='freq']").value = freq[i];
                clone.querySelector("input[name='q']").value = q[i];
                clone.querySelector("input[name='gain']").value = gain[i];
                clone.setAttribute("id", "xbass");
                filtersContainer.appendChild(clone);
            }
            updateFilterElements();
            applyEQ();
        }
    });
    fileFiltersImport.addEventListener("change", (e) => {
        // Import filters callback
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            let settings = e.target.result;
            let filters = settings.split("\n").map(l => {
                let r = l.match(/Filter\s*\d+:\s*(\S+)\s*(\S+)\s*Fc\s*(\S+)\s*Hz\s*Gain\s*(\S+)\s*dB(\s*Q\s*(\S+))?/);
                if (!r) { return undefined; }
                let disabled = (r[1] !== "ON");
                let type = r[2];
                let freq = parseInt(r[3]) || 0;
                let gain = parseFloat(r[4]) || 0;
                let q = parseFloat(r[6]) || 0;
                if (type === "LS" || type === "HS") {
                    type += "Q";
                    q = q || 0.707;
                } else if (type === "LSC" || type === "HSC") {
                    // Equalizer APO use LSC/HSC instead of LSQ/HSQ
                    type = type.substr(0, 2) + "Q";
                }
                return { disabled, type, freq, q, gain };
            }).filter(f => f);
            while (filters.length > 0) {
                // Remove empty tail filters
                let lastFilter = filters[filters.length - 1];
                if (!lastFilter.freq && !lastFilter.q && !lastFilter.gain) {
                    filters.pop();
                } else {
                    break;
                }
            }
            if (filters.length > 0) {
                filtersToElem(filters);
                applyEQ();
            } else {
                alert("Parse filters file failed: no filter found.");
            }
        };
        reader.readAsText(file);
    });
    // Export filters
    document.querySelector("div.extra-eq button.export-filters").addEventListener("click", () => {
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => p.fullName == phoneSelected && p.eq)[0];
        let filters = elemToFilters(true);
        if (!phoneObj || !filters.length) {
            alert("Please select model and add atleast one filter before export.");
            return;
        }
        let preamp = Equalizer.calc_preamp(
            phoneObj.rawChannels.filter(c => c)[0],
            phoneObj.eq.rawChannels.filter(c => c)[0]);
        let settings = "Preamp: " + preamp.toFixed(1) + " dB\r\n";
        filters.forEach((f, i) => {
            let on = (!f.disabled && f.type && f.freq && f.gain && f.q) ? "ON" : "OFF";
            let type = f.type;
            if (type === "LSQ" || type === "HSQ") {
                // Equalizer APO use LSC/HSC instead of LSQ/HSQ
                type = type.substr(0, 2) + "C";
            }
            settings += ("Filter " + (i + 1) + ": " + on + " " + type + " Fc " +
                f.freq.toFixed(0) + " Hz Gain " + f.gain.toFixed(1) + " dB Q " +
                f.q.toFixed(3) + "\r\n");
        });
        let exportElem = document.querySelector("#file-filters-export");
        exportElem.href && URL.revokeObjectURL(exportElem.href);
        exportElem.href = URL.createObjectURL(new Blob([settings]));
        exportElem.download = phoneObj.fullName.replace(/^Uploaded /, "") + " Filters.txt";
        exportElem.click();
    });
    document.querySelector("div.extra-eq button.convert-to-graphic-filters").addEventListener("click", () => {
        if(isGraphicEQMode == true) {
            alert("이미 그래픽 EQ로 변환됨! 초기화 버튼을 누르거나 다시 autoEQ를 돌리거나 필터를 하나 추가하거나 제거한 후 다시 시도하세요.");
            return;
        }
        isGraphicEQMode = true;
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => p.fullName == phoneSelected && p.eq)[0] || { fullName: "Unnamed" };
        let filters = elemToFilters();
        if (!filters.length) {
            alert("Please add at least one filter before export.");
            return;
        }
        let qFactors = [];
        let selIdx = document.getElementById("band-setting").selectedIndex;
        switch (selIdx) {
            case 0:
                Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                    new Array(10).fill(null)
                        .map((_, i) => Math.floor(32 * Math.pow(2, i))))).sort((a, b) => a - b);
                qFactors = new Array(10).fill(1.41);
                break;
            case 1:
                Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                    new Array(15).fill(null)
                        .map((_, i) => Math.floor(25 * Math.pow(2, i * 2 / 3))))).sort((a, b) => a - b);
                qFactors = new Array(15).fill(2.14);
                break;
            case 2:
                Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                    new Array(31).fill(null)
                        .map((_, i) => Math.floor(20 * Math.pow(2, i / 3))))).sort((a, b) => a - b);
                qFactors = new Array(31).fill(4.32);
                break;
            case 3:
                let bands = document.getElementById("custom-bands").value;
                bands_arr = bands.split(", ");
                for (let i = 0; i < bands_arr.length; i++) {
                    bands_arr[i] = parseInt(bands_arr[i]);
                }
                Equalizer.config.GraphicEQFrequences = bands_arr;
                qFactors = new Array(bands_arr.length);
                for (i = 0; i < bands_arr.length - 1; i++) {
                    f1 = bands_arr[i];
                    f2 = bands_arr[i + 1];
                    bw = Math.log2(f2 / f1);
                    qFactors[i] = parseFloat((Math.sqrt(Math.pow(2, bw))/(Math.pow(2, bw) - 1)).toFixed(2));
                };
                qFactors[qFactors.length - 1] = parseFloat(qFactors[qFactors.length - 2]);
                break;
            default:
                Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                    new Array(10).fill(null)
                        .map((_, i) => Math.floor(20 * Math.pow(2, i))))).sort((a, b) => a - b);
                qFactors = new Array(10).fill(1.41);
        }
        let graphicEQ = Equalizer.as_graphic_eq(filters);
        eqBands = 1;
        updateFilterElements();
        let node = filtersContainer.querySelector("div.filter");
        eqBands = qFactors.length;
        node.querySelector("input[name='enabled']").value = "true";
        node.querySelector("select[name='type']").value = "PK";
        node.querySelector("input[name='freq']").value = graphicEQ[0][0];
        node.querySelector("input[name='q']").value = qFactors[0];
        node.querySelector("input[name='gain']").value = graphicEQ[0][1].toFixed(1);

        for (let i = 1; i < qFactors.length; i++) {
            let clone = node.cloneNode(true);
            clone.querySelector("input[name='enabled']").value = "true";
            clone.querySelector("select[name='type']").value = "PK";
            clone.querySelector("input[name='freq']").value = graphicEQ[i][0];
            clone.querySelector("input[name='q']").value = qFactors[i];
            clone.querySelector("input[name='gain']").value = graphicEQ[i][1].toFixed(1);
            clone.setAttribute("id", "graphic-eq-filter");
            filtersContainer.appendChild(clone);
        }
        updateFilterElements();
        applyEQ();
    });
    // Export filters as graphic eq (for wavelet)
    document.querySelector("div.extra-eq button.export-graphic-filters").addEventListener("click", () => {
        let graphicEQ = new Array();
        let phoneSelected = eqPhoneSelect.value;
        let phoneObj = phoneSelected && activePhones.filter(
            p => p.fullName == phoneSelected && p.eq)[0] || { fullName: "Unnamed" };
        if(isGraphicEQMode == true) {
            let startFilter = filtersContainer.querySelector("div.filter");
            graphicEQ.push([parseInt(startFilter.querySelector("input[name='freq']").value), parseFloat(startFilter.querySelector("input[name='gain']").value)])
            let filters = filtersContainer.querySelectorAll("#graphic-eq-filter");
            for(let i=0;i<filters.length;i++) {
                graphicEQ.push([parseInt(filters[i].querySelector("input[name='freq']").value), parseFloat(filters[i].querySelector("input[name='gain']").value)]);
            }
        }
        else {
            let filters = elemToFilters();
            if (!filters.length) {
                alert("Please add at least one filter before export.");
                return;
            }
            let selIdx = document.getElementById("band-setting").selectedIndex;
            switch (selIdx) {
                case 0:
                    Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                        new Array(10).fill(null)
                            .map((_, i) => Math.floor(32 * Math.pow(2, i))))).sort((a, b) => a - b);
                    break;
                case 1:
                    Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                        new Array(15).fill(null)
                            .map((_, i) => Math.floor(25 * Math.pow(2, i * 2 / 3))))).sort((a, b) => a - b);
                    break;
                case 2:
                    Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                        new Array(31).fill(null)
                            .map((_, i) => Math.floor(20 * Math.pow(2, i / 3))))).sort((a, b) => a - b);
                    break;
                case 3:
                    let bands = document.getElementById("custom-bands").value;
                    bands_arr = bands.split(", ");
                    for (let i = 0; i < bands_arr.length; i++) {
                        bands_arr[i] = parseInt(bands_arr[i]);
                    }
                    Equalizer.config.GraphicEQFrequences = bands_arr;
                    break;
                default:
                    Equalizer.config.GraphicEQFrequences = Array.from(new Set(
                        new Array(10).fill(null)
                            .map((_, i) => Math.floor(20 * Math.pow(2, i))))).sort((a, b) => a - b);
            }
            graphicEQ = Equalizer.as_graphic_eq(filters);
        }
        let settings = "GraphicEQ: " + graphicEQ.map(([f, gain]) =>
            f.toFixed(0) + " " + gain.toFixed(1)).join("; ");
        let exportElem = document.querySelector("#file-filters-export");
        exportElem.href && URL.revokeObjectURL(exportElem.href);
        exportElem.href = URL.createObjectURL(new Blob([settings]));
        exportElem.download = phoneObj.fullName.replace(/^Uploaded /, "") + " Graphic Filters.txt";
        exportElem.click();
    });
    // Readme
    document.querySelector("div.extra-eq button.readme").addEventListener("click", () => {
        alert("1. If you want to AutoEQ model A to B, display A B and remove target\n" +
            "2. Add/Remove bands before AutoEQ may give you a better result\n" +
            "3. Curve of PK filter close to 20K is implementation dependent, avoid such filter if you're not sure how your DSP software works\n" +
            "4. EQ treble require resonant peak matching and fine tune by ear, keep treble untouched if you're not sure how to do that\n" +
            "5. Tone generator is useful to find actual location of peaks and dips, notice the web version may not work on some platform\n");
    });
    document.querySelector("div.extra-eq button.fr-to-target").addEventListener("click", () => {
        let targetObj = activePhones.filter(p => p.isTarget)[0];
        if(!targetObj) {
            let phoneSelected = eqPhoneSelect.value;
            let phoneObj = phoneSelected && activePhones.filter(
                p => p.fullName == phoneSelected)[0];
            if(!phoneObj) {
                alert("측정치를 선택하세요!");
                return;
            }
            eqTarget = phoneObj.eq;
            if(!eqTarget) {
                alert("파라메트릭 EQ가 적용된 측정치가 있나 확인하세요!");
                return;
            }
            targetName = eqTarget.phone + "Target";
            targetObj = {
                isTarget: true,
                brand: brandTarget,
                dispName: targetName,
                phone: targetName,
                fullName: targetName,
                fileName: targetName,
                rawChannels: new Array(avgCurves(eqTarget.channels)),
                isDynamic: true,
                id: -brandTarget.phoneObjs.length
            };
            console.log(targetObj);
            showPhone(targetObj, true);
        }
        else {
            alert("이미 타겟이 있음! 모든 타겟을 지우고 다시 시도하세요.");
        }
    });
    // AutoEQ
    let autoEQFromInput = document.querySelector("div.extra-eq input[name='autoeq-from']");
    let autoEQToInput = document.querySelector("div.extra-eq input[name='autoeq-to']");
    let qFromInput = document.querySelector("div.extra-eq input[name='q-from']");
    let qToInput = document.querySelector("div.extra-eq input[name='q-to']");
    let qStepInput = document.querySelector("div.extra-eq select[name='q-step'] option:checked").value;
    let gainFromInput = document.querySelector("div.extra-eq input[name='gain-from']");
    let gainToInput = document.querySelector("div.extra-eq input[name='gain-to']");

    autoEQFromInput.value = Equalizer.config.AutoEQRange[0].toFixed(0);
    autoEQToInput.value = Equalizer.config.AutoEQRange[1].toFixed(0);
    qFromInput.value = Equalizer.config.OptimizeQRange[0].toFixed(4);
    qToInput.value = Equalizer.config.OptimizeQRange[1].toFixed(4);
    gainFromInput.value = Equalizer.config.OptimizeGainRange[0].toFixed(0);
    gainToInput.value = Equalizer.config.OptimizeGainRange[1].toFixed(0);

    document.querySelector("div.extra-eq button.autoeq").addEventListener("click", () => {
        isGraphicEQMode = false;
        // Generate filters automatically
        let phoneSelected = eqPhoneSelect.value;
        if (!phoneSelected) {
            let firstPhone = eqPhoneSelect.querySelectorAll("option")[1];
            if (firstPhone) {
                phoneSelected = eqPhoneSelect.value = firstPhone.value;
            }
        }
        let phoneObj = phoneSelected && activePhones.filter(
            p => p.fullName == phoneSelected)[0];
        let targetObj = (activePhones.filter(p => p.isTarget)[0] ||
            activePhones.filter(p => p !== phoneObj && !p.isTarget)[0]);
        console.log(targetObj);
        if (!phoneObj || !targetObj) {
            alert("Please select model and target, if there are no target and multiple models are displayed then the second one will be selected as target.");
            return;
        }
        let autoEQOverlay = document.querySelector(".extra-eq-overlay");
        autoEQOverlay.style.display = "block";
        setTimeout(() => {
            let autoEQFrom = Math.min(Math.max(parseInt(autoEQFromInput.value) || 0, 20), 20000);
            let autoEQTo = Math.min(Math.max(parseInt(autoEQToInput.value) || 0, autoEQFrom), 20000);
            let qFrom = Math.min(Math.max(parseFloat(qFromInput.value) || 0, 0.5), 33.3333);
            let qTo = Math.min(Math.max(parseFloat(qToInput.value) || 0, qFrom), 33.3333);
            let gainFrom = Math.min(Math.max(parseInt(gainFromInput.value) || 0, -12), 12);
            let gainTo = Math.min(Math.max(parseInt(gainToInput.value) || 0, gainFrom), 12);

            Equalizer.config.AutoEQRange = [autoEQFrom, autoEQTo];
            Equalizer.config.OptimizeQRange = [qFrom, qTo];
            Equalizer.config.OptimizeGainRange = [gainFrom, gainTo];
            for (let i = 1; i < 4; i++) {
                Equalizer.config.OptimizeDeltas[i] = [10, qTo, (Math.abs(gainTo) > Math.abs(gainFrom) ? Math.abs(gainTo) : Math.abs(gainFrom)), parseInt(5 / i), parseFloat(qStepInput), parseInt(5 / i) * 0.01];
            }
            let phoneCHs = (phoneObj.rawChannels.filter(c => c)
                .map(ch => ch.map(([f, v]) => [f, v + phoneObj.norm])));
            let phoneCH = (phoneCHs.length > 1) ? avgCurves(phoneCHs) : phoneCHs[0];
            let targetCH = targetObj.rawChannels.filter(c => c)[0].map(([f, v]) => [f, v + targetObj.norm]);
            let filters = Equalizer.autoeq(phoneCH, targetCH, eqBands);
            filtersToElem(filters);
            applyEQ();
            autoEQOverlay.style.display = "none";
        }, 100);
    });
    // Tone Generator
    let toneGeneratorFromInput = document.querySelector("div.extra-tone-generator input[name='tone-generator-from']");
    let toneGeneratorToInput = document.querySelector("div.extra-tone-generator input[name='tone-generator-to']");
    let toneGeneratorSlider = document.querySelector("div.extra-tone-generator input[name='tone-generator-freq']");
    let toneGeneratorPlayButton = document.querySelector("div.extra-tone-generator .play");
    let toneGeneratorText = document.querySelector("div.extra-tone-generator .freq-text");
    let toneGeneratorContext = null;
    let toneGeneratorOsc = null;
    let toneGeneratorTimeoutHandle = null
    toneGeneratorSlider.addEventListener("input", () => {
        let from = Math.min(Math.max(parseInt(toneGeneratorFromInput.value) || 0, 20), 20000);
        let to = Math.min(Math.max(parseInt(toneGeneratorToInput.value) || 0, from), 20000);
        let position = parseFloat(toneGeneratorSlider.value) || 0;
        let freq = Math.round(Math.exp( // Slider move in log scale
            Math.log(from) + (Math.log(to) - Math.log(from)) * position));
        toneGeneratorText.innerText = freq;
        if (toneGeneratorOsc) {
            let t = toneGeneratorContext.currentTime;
            toneGeneratorOsc.frequency.cancelScheduledValues(t);
            toneGeneratorOsc.frequency.setTargetAtTime(freq, t, 0.2); // Smoother transition but also delay
        }
    });
    toneGeneratorPlayButton.addEventListener("click", () => {
        if (toneGeneratorOsc) {
            toneGeneratorOsc.stop();
            toneGeneratorOsc = null;
            toneGeneratorPlayButton.innerText = "Play";
        } else {
            if (!toneGeneratorContext) {
                if (!window.AudioContext) {
                    alert("Web audio api is disabled, please enable it if you want to use tone generator.");
                    return;
                }
                toneGeneratorContext = new AudioContext();
            }
            toneGeneratorOsc = toneGeneratorContext.createOscillator();
            toneGeneratorOsc.type = "sine";
            toneGeneratorOsc.frequency.value = parseInt(toneGeneratorText.innerText);
            toneGeneratorOsc.connect(toneGeneratorContext.destination);
            toneGeneratorOsc.start();
            toneGeneratorPlayButton.innerText = "Stop";
        }
    });

}
addExtra();

// Add accessories to the bottom of the page, if configured
function addAccessories() {
    let accessoriesBar = document.querySelector("div.accessories"),
        accessoriesContainer = document.createElement("aside");

    accessoriesContainer.innerHTML = whichAccessoriesToUse;
    accessoriesBar.append(accessoriesContainer);
}
if (accessories) { addAccessories(); }

// Add header to alt layout
function addHeader() {
    let graphToolContainer = document.querySelector("div.graphtool"),
        altHeaderElem = document.createElement("header"),
        headerButton = document.createElement("button"),
        headerLogoElem = document.createElement("div"),
        headerLogoLink = document.createElement("a"),
        headerLogoImg = document.createElement("img"),
        headerLogoSpan = document.createElement("span"),
        linksList = document.createElement("ul");

    headerButton.className = "header-button";
    headerLogoElem.className = "logo";
    headerLogoLink.setAttribute('href', site_url);
    if (headerLogoText) {
        headerLogoSpan.innerText = headerLogoText;
        headerLogoLink.append(headerLogoSpan);
    } else if (headerLogoImgUrl) {
        headerLogoImg.setAttribute("src", headerLogoImgUrl);
        headerLogoLink.append(headerLogoImg);
    }

    altHeaderElem.append(headerButton);
    headerLogoElem.append(headerLogoLink);
    altHeaderElem.setAttribute("data-links", "");
    altHeaderElem.append(headerLogoElem);

    altHeaderElem.className = "header";
    graphToolContainer.prepend(altHeaderElem);

    linksList.className = "header-links";
    altHeaderElem.append(linksList);

    headerLinks.forEach(function (link) {
        let linkContainerElem = document.createElement("li"),
            linkElem = document.createElement("a");

        linkElem.setAttribute("href", link.url);
        linkElem.setAttribute("target", "_blank");
        linkElem.textContent = link.name;
        linkContainerElem.append(linkElem);
        linksList.append(linkContainerElem);
    })

    headerButton.addEventListener("click", function () {
        let headerLinksState = altHeaderElem.getAttribute("data-links");

        if (headerLinksState === "expanded") {
            altHeaderElem.setAttribute("data-links", "collapsed");
        } else {
            altHeaderElem.setAttribute("data-links", "expanded");
        }
    });
}
if (alt_layout && alt_header) { addHeader(); }

// Add external links to bar at bottom of page, if configured
function addExternalLinks() {
    const externalLinksBar = document.querySelector("div.external-links");

    linkSets.forEach(function (set) {
        let setLabelHtml = document.createElement("span"),
            setLabelText = set.label,
            links = set.links;

        setLabelHtml.textContent = setLabelText;
        externalLinksBar.append(setLabelHtml);

        links.forEach(function (link) {
            let linkHtml = document.createElement("a"),
                linkName = link.name,
                linkUrl = link.url;

            linkHtml.textContent = linkName;
            linkHtml.setAttribute("href", linkUrl);
            linkHtml.setAttribute("target", "_blank");
            externalLinksBar.append(linkHtml);
        });
    });
}
if (externalLinksBar) { addExternalLinks(); }

// Add tutorial to alt layout
function addTutorial() {
    let partsPrimary = document.querySelector("section.parts-primary")
    graphContainer = document.querySelector("div.graph-sizer"),
        manageContainer = document.querySelector("div.manage"),
        overlayContainer = document.createElement("div"),
        buttonContainer = document.createElement("div"),
        descriptionContainer = document.createElement("div"),
        zoomButtons = document.querySelectorAll("div.zoom button");

    overlayContainer.className = "tutorial-overlay";
    graphContainer.prepend(overlayContainer);

    buttonContainer.className = "tutorial-buttons";
    descriptionContainer.className = "tutorial-description";

    manageContainer.prepend(descriptionContainer);
    manageContainer.prepend(buttonContainer);

    confidenceDefinitions.forEach(function (def) {
        let defOverlay = document.createElement("div"),
            defButton = document.createElement("button"),
            defDescription = document.createElement("article"),
            defDescriptionCopy = document.createElement("p");

        defOverlay.setAttribute("tutorial-def", def.name);
        defOverlay.setAttribute("tutorial-on", "false");
        defOverlay.className = "overlay-segment";
        defOverlay.setAttribute("style", "width:" + def.width + ";left:84%;height: 90%;position: absolute;" + "z-index: 0.9;"
            + "float: right;background-color:red;");
        overlayContainer.append(defOverlay);

        defButton.setAttribute("tutorial-def", def.name);
        defButton.setAttribute("tutorial-on", "false");
        defButton.className = "button-segment";
        defButton.textContent = def.name;
        buttonContainer.append(defButton);

        defDescription.setAttribute("tutorial-def", def.name);
        defDescription.setAttribute("tutorial-on", "false");
        defDescription.className = "description-segment";
        defDescriptionCopy.innerHTML = def.description;
        defDescription.append(defDescriptionCopy);
        descriptionContainer.append(defDescription);

        defButton.addEventListener("click", function () {
            let activeStatus = defButton.getAttribute("tutorial-on"),
                activeTutorialElements = document.querySelectorAll("[tutorial-on='true']"),
                activeOverlay = document.querySelector("div.overlay-segment[tutorial-on='true']"),
                activeButton = document.querySelector("button.button-segment[tutorial-on='true']"),
                activeDescription = document.querySelector("article.description-segment[tutorial-on='true']");

            if (activeOverlay) { activeOverlay.setAttribute("tutorial-on", "false"); }
            if (activeButton) { activeButton.setAttribute("tutorial-on", "false"); }

            if (activeStatus === "false") {
                if (activeDescription) { activeDescription.setAttribute("tutorial-on", "false"); }

                defOverlay.setAttribute("tutorial-on", "true");
                defButton.setAttribute("tutorial-on", "true");
                defDescription.setAttribute("tutorial-on", "true");

                partsPrimary.setAttribute("tutorial-active", "true");
                disableZoom();

                // Analytics event
                if (analyticsEnabled) { pushEventTag("tutorial_activated", targetWindow, def.name); }
            } else {
                partsPrimary.setAttribute("tutorial-active", "false");
            }
        });

        defButton.addEventListener("mouseover", function () {
            defOverlay.setAttribute("tutorial-hover", "true");
        });

        defButton.addEventListener("mouseout", function () {
            defOverlay.setAttribute("tutorial-hover", "false");
        });

        defButton.addEventListener("touchend", function () {
            defOverlay.setAttribute("tutorial-hover", "false");
        });
    });

    tutorialDefinitions.forEach(function (def) {
        let defOverlay = document.createElement("div"),
            defButton = document.createElement("button"),
            defDescription = document.createElement("article"),
            defDescriptionCopy = document.createElement("p");

        defOverlay.setAttribute("tutorial-def", def.name);
        defOverlay.setAttribute("tutorial-on", "false");
        defOverlay.className = "overlay-segment";
        defOverlay.setAttribute("style", "flex-basis: " + def.width + ";")
        overlayContainer.append(defOverlay);

        defButton.setAttribute("tutorial-def", def.name);
        defButton.setAttribute("tutorial-on", "false");
        defButton.className = "button-segment";
        defButton.textContent = def.name;
        buttonContainer.append(defButton);

        defDescription.setAttribute("tutorial-def", def.name);
        defDescription.setAttribute("tutorial-on", "false");
        defDescription.className = "description-segment";
        defDescriptionCopy.innerHTML = def.description;
        defDescription.append(defDescriptionCopy);
        descriptionContainer.append(defDescription);

        defButton.addEventListener("click", function () {
            let activeStatus = defButton.getAttribute("tutorial-on"),
                activeTutorialElements = document.querySelectorAll("[tutorial-on='true']"),
                activeOverlay = document.querySelector("div.overlay-segment[tutorial-on='true']"),
                activeButton = document.querySelector("button.button-segment[tutorial-on='true']"),
                activeDescription = document.querySelector("article.description-segment[tutorial-on='true']");

            if (activeOverlay) { activeOverlay.setAttribute("tutorial-on", "false"); }
            if (activeButton) { activeButton.setAttribute("tutorial-on", "false"); }

            if (activeStatus === "false") {
                if (activeDescription) { activeDescription.setAttribute("tutorial-on", "false"); }

                defOverlay.setAttribute("tutorial-on", "true");
                defButton.setAttribute("tutorial-on", "true");
                defDescription.setAttribute("tutorial-on", "true");

                partsPrimary.setAttribute("tutorial-active", "true");
                disableZoom();

                // Analytics event
                if (analyticsEnabled) { pushEventTag("tutorial_activated", targetWindow, def.name); }
            } else {
                partsPrimary.setAttribute("tutorial-active", "false");
            }
        });

        defButton.addEventListener("mouseover", function () {
            defOverlay.setAttribute("tutorial-hover", "true");
        });

        defButton.addEventListener("mouseout", function () {
            defOverlay.setAttribute("tutorial-hover", "false");
        });

        defButton.addEventListener("touchend", function () {
            defOverlay.setAttribute("tutorial-hover", "false");
        });
    });

    // Disable zoom if tutorial is engaged
    function disableZoom() {
        let activeZoomButton = document.querySelector("div.zoom button.selected");

        if (activeZoomButton) { activeZoomButton.click(); }
    }

    // Disable tutorial if zoom is engaged
    zoomButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            let tutorialState = document.querySelector("section.parts-primary").getAttribute("tutorial-active");

            if (button.classList.contains("selected") && tutorialState === "true") {
                let activeOverlay = document.querySelector("div.overlay-segment[tutorial-on='true']"),
                    activeButton = document.querySelector("button.button-segment[tutorial-on='true']"),
                    activeDescription = document.querySelector("article.description-segment[tutorial-on='true']");

                document.querySelector("section.parts-primary").setAttribute("tutorial-active", "false");
                activeOverlay.setAttribute("tutorial-on", "false");
                activeButton.setAttribute("tutorial-on", "false");
            }
        });
    });
}
if (alt_tutorial) { addTutorial(); }

// Set active graph site link
function setActiveDatabase() {
    let url = targetWindow.location.href,
        dbLinks = document.querySelectorAll("div.external-links a");

    dbLinks.forEach(function (link) {
        let linkUrl = link.getAttribute("href");

        if (url.includes(linkUrl)) {
            link.setAttribute("class", "active");
        }
    });
}
setActiveDatabase();

// Expand / collapse function
function toggleExpandCollapse() {
    const graphIsIframe = (window.top !== window.self) ? true : false,
        graphBody = document.querySelector("body"),
        parentBody = window.top.document.querySelector("body"),
        expandCollapseButton = document.querySelector("button#expand-collapse");


    if (graphIsIframe) { graphBody.setAttribute("data-graph-frame", "collapsed"); }


    if (graphIsIframe && expandableOnly) {
        const expandOnlyMax = (expandableOnly === true) ? 1000000 : expandableOnly,
            expandOnlyStyle = document.createElement("style"),
            expandOnlyCss = `
            @media ( max-width: `+ expandOnlyMax + `px ) {
                body[data-expandable="only"][data-graph-frame="collapsed"] {
                    overflow: hidden;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse {
                    position: fixed;
                    top: 0;
                    left: 0;

                    display: flex;
                    justify-content: center;
                    align-items: center;

                    width: 100%;
                    height: 100%;
                    padding: 0;

                    background-color: var(--background-color);
                    background-color: transparent;
                    border: none;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse:after {
                    position: absolute;

                    content: 'Tap to launch graph tool';

                    color: var(--font-color-primary);
                    font-family: var(--font-secondary);
                    font-size: 11px;
                    line-height: 1em;
                    text-transform: uppercase;

                    pointer-events: none;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    width: 100%;
                    height: 100%;

                    background-color: transparent;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse:before {
                    position: relative;
                    z-index: 1;

                    transform: scale(7);
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] div.expand-collapse button#expand-collapse:after {
                    position: absolute;
                    top: 0;
                    left: 0;

                    content: '';

                    display: block;
                    width: 100%;
                    height: 100%;

                    background-color: var(--background-color);

                    opacity: 0.9;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] section.parts-primary {
                    flex: 100% 1 1;
                    overflow: hidden;
                }

                body[data-expandable="only"][data-graph-frame="collapsed"] section.parts-secondary {
                    display: none;
                }
            }
        `;

        expandOnlyStyle.textContent = expandOnlyCss;
        expandOnlyStyle.setAttribute("type", "text/css");
        document.querySelector("body").append(expandOnlyStyle);

        graphBody.setAttribute("data-expandable", "only");
    } else if (graphIsIframe && expandable) {
        graphBody.setAttribute("data-expandable", "true");
    }

    const parentStyle = window.top.document.createElement("style"),
        parentCss = `
            :root {
                --header-height: `+ headerHeight + `;
            }
            
            body[data-graph-frame="expanded"] {
                width: 100%;
                height: 100%;
                max-height: -webkit-fill-available;
                overflow: hidden;
            }
            
            body[data-graph-frame="expanded"] button.graph-frame-collapse {
                display: inherit;
            }
            
            body[data-graph-frame="expanded"] iframe#GraphTool {
                position: fixed;
                top: var(--header-height);
                left: 0;
                
                width: 100% !important;
                height: calc(100% - var(--header-height)) !important;

                animation-name: graph-tool-expand;
                animation-duration: 0.15s;
                animation-iteration-count: 1;
                animation-timing-function: ease-out;
                animation-fill-mode: forwards;
            }

            @keyframes graph-tool-expand {
                0% {
                    position: relative;
                    opacity: 1.0;
                    transform: scale(1.0);
                }
                48% {
                    position: relative;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                50% {
                    position: fixed;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                52% {
                    position: fixed;
                    opacity: 0.0;
                    transform: scale(0.9);
                }
                100% {
                    position: fixed;
                    opacity: 1.0;
                    transform: scale(1.0);
                }
            }`;

    parentStyle.textContent = parentCss;
    parentStyle.setAttribute("type", "text/css");
    parentBody.append(parentStyle);

    expandCollapseButton.addEventListener("click", function (e) {
        let frameState = document.querySelector("body").getAttribute("data-graph-frame");

        if (frameState === "expanded") {
            graphBody.setAttribute("data-graph-frame", "collapsed");
            parentBody.setAttribute("data-graph-frame", "collapsed");
        } else {
            graphBody.setAttribute("data-graph-frame", "expanded");
            parentBody.setAttribute("data-graph-frame", "expanded");
        }

        e.stopPropagation();
    });

}

if (expandable && accessDocumentTop) { toggleExpandCollapse(); }