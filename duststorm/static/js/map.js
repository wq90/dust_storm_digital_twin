var MAP, LatLngBounds;
const LEVEL_FACTOR = 5, WIND_LENGTH = 10, WIND_HEIGHT = 5;
const colorGradientforLatLon = d3.interpolateYlOrBr;
const colorGradientforWind = d3.interpolateRdYlBu;
const colorGradientforSlp = d3.interpolatePurples;
var TIME_INDEX = 0, LEVEL_INDEX = 0;
const root = document.documentElement.style;
const style = getComputedStyle(document.documentElement);
var LNG, LAT, TIME, LEVEL, PROJ, OPA, MAXD = 10000, MIND;
const SLICE_WIDTH = 1;
let LAT_INDEX = null, LNG_INDEX = null;
const street = 'http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}';
const hybrid = 'http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}';
const satellite = 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
const terrain = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
const BACKGROUND = {
    "street": street,
    "hybrid": hybrid,
    "satellite": satellite,
    "terrain": terrain
}
var rf_proj, rf_lon, rf_lat;
init();
let geo;
async function init() {
    LNG = await d3.json('dust_lon');
    LAT = await d3.json('dust_lat');
    TIME = await d3.json('dust_time');
    LEVEL = await d3.json('dust_level');
    geo = composeGeoJoson(LNG, LAT);
    PROJ = d3.geoMercator();
    PROJ.fitWidth(LNG.length, geo);
    rf_lon = await d3.json('rf_lon');
    rf_lat = await d3.json('rf_lat');
    geo = composeGeoJoson(rf_lon, rf_lat);
    rf_proj = d3.geoMercator();
    rf_proj.fitWidth(rf_lon.length, geo);
    OPA = d3.scaleLinear([0, MAXD], [0.5, 1]);
    MIND = OPA.invert(0.51);
    LatLngBounds = L.latLngBounds([
        [LAT[0], LNG[0]], [LAT[LAT.length - 1], LNG[LNG.length - 1]]
    ]);
    MAP = L.map('map').fitBounds(LatLngBounds);
    L.tileLayer(BACKGROUND['terrain'], {
        maxZoom: 10,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(MAP);
    let svg = d3.create("svg")
        .attr('id', 'map-svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + LNG.length + " " + LAT.length)
        .style("display", "block")
    L.svgOverlay(svg.node(), LatLngBounds, {
        opacity: 1,
        interactive: true
    }).addTo(MAP);
    d3.select(`#map-svg`)
        .style("position", "absolute")
        .style("z-index", 1);
    svg = d3.create("svg")
        .attr('id', 'eventlayer')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + LNG.length + " " + LAT.length)
        .style("display", "block")
        .on('click', clickOnMap);
    L.svgOverlay(svg.node(), LatLngBounds, {
        opacity: 1,
        interactive: true
    }).addTo(MAP);
    d3.select(`#eventlayer`)
        .style("position", "absolute")
        .style("z-index", 3);
    MAP.doubleClickZoom.disable();
    MAP.setView([LAT[180], LNG[Math.floor(LNG.length / 5 * 4.3)]]);
    menu();
    if (dust_color === undefined) {
        for (let i = 0; i < dust_c.length; i++) {
            // dust_v.push(1 - (10000 - i * 10000 / (dust_c.length - 1)) / 10000);
            dust_sv.push(10000 - i * 10000 / (dust_c.length - 1));
            dust_o.push(1); //opacity
        }
        dust_color = d3.scaleLinear(dust_sv, dust_c);
    }
    d3.json(`finishedtasks/${Number(localStorage.getItem('TERRIAN_COUNT'))}`)
        .then(async function (data) {
            FINISHED_TASK = data;
            await createModelComparision();
            MODEL_COMPARISION = true;
            updateModelComparision([0, 1]);
            MODEL_COMPARISION = false;
        })
        .catch(function (error) {
            console.error("Error loading JSON:", error);
        });
    loadLocalStorageFromServer();
}
function clickOnMap(e) {
    if (BRUSH_GROUP == undefined) {
        clickOnMapDrawPolygon(e, PROJ, d3.select(this));
    }
}
function composeGeoJoson(lon, lat) {
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [lon[0], lat[0]],
                    "type": "Point"
                }
            },
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "coordinates": [lon[lon.length - 1], lat[lat.length - 1]],
                    "type": "Point"
                }
            }
        ]
    };
}
async function reRender() {
    dustSVG(DUST_SWITCH);
    // --> Wind SVG || Wind Canvas
    windSVG(WIND_SWITCH);
    // windCanvas(WIND_SWITCH);
    drawLineOnMap(LAT_SLICE_SWITCH, LNG_SLICE_SWITCH);
    renderDustAtLat(LAT_INDEX, LAT_SLICE_SWITCH);
    renderDustAtLng(LNG_INDEX, LNG_SLICE_SWITCH);
    contourSVG('slp', SEA_LEVEL_PRESSURE_SWITCH);
    renderRF(RF_SWITCH);
    if (BRUSH_GROUP != undefined) {
        dustAvgPlot(BRUSH_X0, BRUSH_X1, BRUSH_Y0, BRUSH_Y1);
    }
    updateModelComparision();
}
async function renderDustSource() {
    let [ds, lon, lat] = await d3.json(`ds/0`);
    let proj = d3.geoMercator();
    let geo = composeGeoJoson(lon, lat);
    proj.fitWidth(lon.length, geo);
    let max = d3.max(ds.flat());
    let colorScale = d3.scaleLinear([0.02, 0.1, 0.15, 0.2, max], ['rgba(1,0,87,0.2)', 'rgba(64,224,208,0.3)', 'rgba(255,217,102,0.4)', 'rgba(255,165,0,0.5)', 'rgba(204, 0, 0,0.6)']);
    let svg = scalar(`ds_svg`, lon, lat, ds, proj, 1, [0.02, max], colorScale);
    svg.style("position", "absolute")
        .style("z-index", 0);
    LatLngBounds = L.latLngBounds([
        [lat[0], lon[0]], [lat[lat.length - 1], lon[lon.length - 1]]
    ]);
    L.svgOverlay(svg.node(), LatLngBounds, {
        opacity: 1,
        interactive: false
    }).addTo(MAP);
    let v = [0, 0.02, 0.1, 0.15, 0.2, max];
    let c = ['rgb(100,100,100)', 'rgb(1,0,87)', 'rgb(64,224,208)', 'rgb(255,217,102)', 'rgb(255,165,0)', 'rgb(204,0,0)'];
    let o = [0, 0.2, 0.3, 0.4, 0.5, 0.6];
    let lengendsvg = createLengendBarH('erod_legend_svg', 300, 0, 15, v, c, o, 10, [10, 20, 15, 25], '%');//10, 30, 250
    d3.select('#erod_lengend_div').append(() => lengendsvg.node());
}
function createLevelBar(id, rw, lw, height, [top, bottom, left, right], unit) {
    let svg = d3.create("svg")
        .attr('id', `${id}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${rw + lw + left + right} ${height + top + bottom}`)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .style("display", "block");
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .attr('fill', 'whitesmoke');
    let yscale = d3.scaleLinear([LEVEL[0], LEVEL[LEVEL.length - 1]], [top + height, top]);
    let yaxis = d3.axisRight(yscale);
    yaxis.tickValues(LEVEL)
        .tickFormat(d3.format(".0f"));
    svg.append("g")
        .attr("transform", `translate(${left + rw},0)`)
        .call(yaxis)
    svg.append('text')
        .attr("x", (rw + lw + left + right) / 2)
        .attr("y", top + height + 20)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text(unit);
    svg.append('rect')
        .attr('id', 'barscale')
        .attr('x', left)
        .attr('y', yscale(LEVEL[LEVEL_INDEX]) - 6 / 2)
        .attr('width', rw)
        .attr('height', 6)
        .attr('fill', 'black')
        .call(d3.drag()
            .on("drag", barDrag)
            .on('end', barEnd));
    function barDrag(e) {
        let y = e.y;
        if (y < (top - 3)) {
            y = top - 3;
        } else if (y > (top + height - 3)) {
            y = top + height - 3;
        }
        d3.select('#barscale')
            .attr("y", y);
    }
    function barEnd(e) {
        let y = e.y;
        let level_v = yscale.invert((y + 6 / 2));
        console.log(level_v);
        let curr = 0;
        for (let i in LEVEL) {
            if (Math.abs(LEVEL[i] - level_v) < Math.abs(LEVEL[curr] - level_v)) {
                curr = i;
            }
            if (i > curr) {
                break;
            }
        }
        console.log(`${curr} LEVEL[${curr}]=${LEVEL[curr]}`);
        d3.select('#barscale')
            .attr("y", yscale(LEVEL[curr]) - 6 / 2);
        LEVEL_INDEX = curr;
        reRender();
    }
    return svg;
}
function createLengendBarH(id, rw, lw, height, v, c, o, n, [top, bottom, left, right], unit) {
    let svg = d3.create("svg")
        .attr('id', `${id}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${rw + lw + left + right} ${height + top + bottom}`)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .style("display", "block");
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .attr('fill', 'whitesmoke');
    let defs = svg.append('defs');
    var lg = defs.append('linearGradient')
        .attr('id', `lg${id}`)
        .attr('x1', 0)
        .attr('x2', 1)
        .attr('y1', 0)
        .attr('y2', 0);
    lg.selectAll('stop')
        .data(v)
        .join('stop')
        .attr('offset', d => {
            return (d - v[0]) / (v[v.length - 1] - v[0]);
        })
        .attr('stop-color', (d, i) => c[i])
        .attr('stop-opacity', (d, i) => o[i])
    svg.append('rect')
        .attr('x', left)
        .attr('y', top)
        .attr('width', rw)
        .attr('height', height)
        .style("fill", `url(#lg${id})`);
    svg.append('text')
        .attr("x", left + rw + 8)
        .attr("y", (top + height + bottom) / 2)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("text-anchor", "left")
        .text(unit);
    let xscale = d3.scaleLinear([v[0], v[v.length - 1]], [left, left + rw]);
    let xaxis = d3.axisBottom(xscale);
    if (v.length !== n) {
        let vv = [v[0]];
        let t = (v[v.length - 1] - v[0]) / (n - 1);
        for (let i = 1; i < n; i++) {
            vv.push(vv[i - 1] + t);
        }
        xaxis.tickValues(vv)
    } else {
        xaxis.tickValues(v)
    }
    svg.append("g")
        .attr("transform", `translate(0,${top + height})`)
        .call(xaxis)
    return svg;
}

function createLengendBar(id, rw, lw, height, v, c, o, n, [top, bottom, left, right], unit) {
    let svg = d3.create("svg")
        .attr('id', `${id}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${rw + lw + left + right} ${height + top + bottom}`)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .style("display", "block");
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', rw + lw + left + right)
        .attr('height', height + top + bottom)
        .attr('fill', 'whitesmoke');
    let defs = svg.append('defs');
    var lg = defs.append('linearGradient')
        .attr('id', `lg${id}`)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 1)
        .attr('y2', 0);
    lg.selectAll('stop')
        .data(v)
        .join('stop')
        .attr('offset', d => {
            // console.log(`v=${d}, %=${(d - v[0]) / (v[v.length - 1] - v[0])}`);
            return (d - v[0]) / (v[v.length - 1] - v[0]);
        })
        .attr('stop-color', (d, i) => c[i])
        .attr('stop-opacity', (d, i) => o[i])
    svg.append('rect')
        .attr('x', left)
        .attr('y', top)
        .attr('width', rw)
        .attr('height', height)
        .style("fill", `url(#lg${id})`);
    svg.append('text')
        .attr("x", (rw + lw + left + right) / 2)
        .attr("y", top + height + 20)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text(unit);
    let yscale = d3.scaleLinear([v[0], v[v.length - 1]], [top + height, top]);
    let yaxis = d3.axisRight(yscale);
    if (v.length !== n) {
        let vv = [v[0]];
        let t = (v[v.length - 1] - v[0]) / (n - 1);
        for (let i = 1; i < n; i++) {
            vv.push(vv[i - 1] + t);
        }
        yaxis.tickValues(vv)
    } else {
        yaxis.tickValues(v)
    }
    svg.append("g")
        .attr("transform", `translate(${left + rw},0)`)
        .call(yaxis)
    return svg;
}
async function renderRF(rf_switch = false) {
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !rf_switch) {
        if (!d3.select('#rf_svg').empty()) {
            d3.select('#rf_svg').remove();
        }
        return;
    }
    let v = await d3.json(`rf/${TIME_INDEX}`);
    let min = -150;
    let max = 150;
    let colorScale = d3.scaleLinear([min, (min + max) / 2, max], ["blue", "white", "red"]);
    let svgList = [];
    for (let i = 0; i < 6; i++) {
        svgList[i] = [scalar(`sub_${i + 1}`, rf_lon, rf_lat, v[i], rf_proj, 0.25, [], colorScale), geoJsonToSvg(`sub_boundary_${i + 1}`, rf_lon.length, rf_lat.length, rf_proj, geoJson_world)];
    }
    let titleHeight = 20, titleWidth = 35, legendWidth = 10 + 30 + 5 + 5;
    let figureWidth = rf_lon.length / 3, figureHeight = rf_lat.length / 3;
    let interval = 10;
    let width = figureWidth * 3 + interval * 2 + titleWidth + legendWidth;
    let height = figureHeight * 2 + interval + titleHeight + 2;
    let titlesOnX = ['SW DRE', 'LW DRE', 'Net DRE'];
    let titlesOnY = ['SUF', 'ATM'];
    let background_svg = d3.select('#rf_svg');
    let g;
    if (background_svg.empty()) {
        background_svg = d3.create('svg')
            .attr('id', 'rf_svg')
            .attr('width', `${width}px`)
            .attr('height', `${height}px`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("preserveAspectRatio", "none")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("display", "block")
            .style('background-color', 'whitesmoke');
        background_svg.append('g')
            .selectAll('text')
            .data(titlesOnX)
            .join('text')
            .attr("x", (d, i) => titleWidth + (i + 0.3) * (figureWidth + interval))
            .attr("y", 0.7 * titleHeight)
            .text(d => d)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .style("font-weight", "bold")
            .attr("fill", "black");
        background_svg.append('g')
            .selectAll('text')
            .data(titlesOnY)
            .join('text')
            .attr("x", 0.2 * titleWidth)
            .attr("y", (d, i) => titleHeight + (i + 0.5) * figureHeight)
            .text(d => d)
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .style("font-weight", "bold")
            .attr("fill", "black");
        g = background_svg.append('g').attr('id', 'rf_svgs');
        for (let i = 0; i < svgList.length; i++) {
            let subg = g.append('g').attr('id', `rf_svgs${i}`);
            subg.append(() => svgList[i][0].node());
            subg.append(() => svgList[i][1].node());
            subg.selectAll('svg')
                .attr('x', () => {
                    let n = i < 3 ? i : i - 3;
                    return titleWidth + n * (figureWidth + interval);
                })
                .attr('y', () => {
                    let n = i < 2 ? i : i < 4 ? i - 2 : i - 4;
                    return titleHeight + n * (figureHeight + interval);
                })
                .attr('width', figureWidth)
                .attr('height', figureHeight);
        }
    } else {
        for (let i = 0; i < svgList.length; i++) {
            let subg = d3.select(`#rf_svgs${i}`);
            subg.append(() => svgList[i][0].node());
            subg.append(() => svgList[i][1].node());
            subg.selectAll('svg')
                .attr('x', () => {
                    let n = i < 3 ? i : i - 3;
                    return titleWidth + n * (figureWidth + interval);
                })
                .attr('y', () => {
                    let n = i < 2 ? i : i < 4 ? i - 2 : i - 4;
                    return titleHeight + n * (figureHeight + interval);
                })
                .attr('width', figureWidth)
                .attr('height', figureHeight);
        }
    }
    let t = [min, (min + max) / 2, max];
    let c = ["blue", "white", "red"];
    let o = [1, 1, 1];
    d3.select('#rf_legend_svg').remove();
    let lengendsvg = createLengendBar('rf_legend_svg', 10, 30, height - titleHeight, t, c, o, 10, [5, 5, 5, 5]);
    lengendsvg.attr('x', width - legendWidth)
        .attr('y', titleHeight - 5 - 5);
    background_svg.append(() => lengendsvg.node());
    d3.select('#rf_div').append(() => background_svg.node());
}
function geoJsonToSvg(id, x, y, proj, geoJs, strokeWidth = 1, stroke = 'black', strokeOpacity = 1) {
    let geoPath = d3.geoPath().projection(proj);
    let svg;
    if (typeof id === 'undefined') {
        svg = d3.create('svg');
    } else {
        svg = d3.select(`#${id}`);
        if (svg.empty()) {
            svg = d3.create('svg')
                .attr('id', id);
        }
    }
    svg.attr("preserveAspectRatio", "xMinYMin meet")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${x} ${y}`)
        .style("display", "block");
    svg.selectAll('path')
        .data(geoJs.features)
        .join('path')
        .attr('d', geoPath)
        .style("fill", 'none')
        .style('stroke-width', strokeWidth)
        .style('stroke', stroke)
        .style("stroke-opacity", strokeOpacity);
    return svg;
}
function scalar(id, lng, lat, v, proj, sr = 0, td = [], colorScale) {
    if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
        let svg;
        if (typeof id === 'undefined') {
            svg = d3.create('svg');
        } else {
            svg = d3.select(`#${id}`);
            if (svg.empty()) {
                svg = d3.create('svg')
                    .attr('id', id);
            }
        }
        svg.attr("preserveAspectRatio", "xMinYMin meet")
            .attr("preserveAspectRatio", "none")
            .attr("viewBox", `0 0 ${lng.length} ${lat.length}`)
            .style("display", "block");
        return svg;
    }
    sr = (sr <= 0 || sr > 1) ? 1 : Math.floor(1 / sr);
    let xy = d3.cross([...Array(lng.length).keys()], [...Array(lat.length).keys()])
        .filter(d => d[0] % sr === 0 && d[1] % sr === 0);

    if (typeof td !== 'undefined' && td?.length === 2) {
        xy = d3.filter(xy, d => v[d[1]][d[0]] >= td[0] && v[d[1]][d[0]] <= td[1]);
    }
    let xyOnMap = xy.map(d => proj([lng[d[0]], lat[d[1]]]));
    let svg;
    if (typeof id === 'undefined') {
        svg = d3.create('svg');
    } else {
        svg = d3.select(`#${id}`);
        if (svg.empty()) {
            svg = d3.create('svg')
                .attr('id', id);
        } else {
            svg.selectAll("*").remove();
        }
    }
    svg.attr("preserveAspectRatio", "xMinYMin meet")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${lng.length} ${lat.length}`)
        .style("display", "block");
    if (typeof colorScale === 'undefined') {
        let min = d3.min(v.flat());
        let max = d3.max(v.flat());
        colorScale = d3.scaleLinear([min, (min + max) / 2, max], ["blue", "white", "red"]);
    }
    svg.append('g')
        .attr('id', `${id}_rect`)
        .selectAll('rect')
        .data(xy)
        .join('rect')
        .attr('x', (d, i) => xyOnMap[i][0] - sr / 2)
        .attr('y', (d, i) => xyOnMap[i][1] - sr / 2)
        .attr('width', sr)
        .attr('height', sr)
        .attr('fill', d => {
            return colorScale(v[d[1]][d[0]]);
        });
    return svg;
}
async function contourSVG(variable = 'slp', flag = false) {
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !flag) {
        if (!d3.select(`#${variable}-svg`).empty()) {
            d3.select(`#${variable}-svg`).remove();
        }
        d3.select('#slp_legend_svg').remove();
        return;
    }
    let L = 23, N = 10;
    let v = await d3.json(`/contour/${variable}/${TIME_INDEX}`);
    let t = v.map(d => d.map(d => Math.round(d)));
    let tt = [];
    for (r of t) for (e of r) tt.push(e);
    tt = tt.filter((v, i, a) => a.indexOf(v) === i).sort(d3.ascending);
    let ts = [];
    if (tt.length > N) {
        for (let i = 0; i <= N; i++) {
            ts.push(tt[Math.floor((tt.length - 1) * i / N)])
        }
    }
    else {
        ts = tt;
    }
    vf = v.filter((d, i) => i % L === 0).map(d => d.filter((d, i) => i % L === 0));
    let c = [];
    for (row of vf) for (e of row) c.push(e);
    let svg = d3.select('#map-svg');
    let g = d3.select(`#${variable}-svg`);
    if (g.empty()) {
        g = svg.append('g')
            .datum(10)
            .attr('id', `${variable}-svg`);
    }
    let path = d3.geoPath()
        .projection(PROJ);
    let contours = d3.contours()
        .size([vf[0].length, vf.length]);
    function transform(coordinates) {
        return coordinates.map((d, i) => {
            return d.map((d, i) => {
                return d.map((d, i) => {
                    return d.map((d, i) => {
                        d = d < 0.5 ? 0 : Math.round((d - 0.5) * L);
                        if (i === 0) {
                            if (d > LNG.length - 1) {
                                d = LNG.length - 1;
                            }
                            return LNG[d];
                        }
                        else if (i === 1) {
                            if (d > LAT.length - 1) {
                                d = LAT.length - 1;
                            }
                            return LAT[d];
                        }
                    })
                });
            })
        });
    }
    let color = d3.scaleLinear([ts[0], ts[ts.length - 1]], [0, 1]);
    g.selectAll('path')
        .data(ts)
        .join('path')
        .attr('d', d => {
            geoObj = contours.contour(c, d);
            geoObj.coordinates = transform(geoObj.coordinates);
            return path(geoObj);
        })
        .attr("fill", d => colorGradientforSlp(color(d)))
        .attr("fill-opacity", 0.5)
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr("stroke-opacity", 0.5);
    d3.select('#map-svg').selectAll('g').sort(d3.descending);
    if (d3.select('#slp_legend_svg').empty()) {
        let lc = [], lo = [];
        for (let i = 0; i < ts.length; i++) {
            lc.push(colorGradientforSlp(color(ts[i])));
            lo.push(0.5);
        }
        let lengendsvg = createLengendBarH('slp_legend_svg', 300, 0, 15, ts, lc, lo, ts.length, [10, 20, 15, 38], 'hPa');//10, 30, 250
        d3.select('#slp_lengend_div').append(() => lengendsvg.node());
    }
}
function drawLineOnMap(latSlice = false, lngSlice = false) {
    if ((!FINISHED_TASK.includes(CURR_TERRIAN_TASK)) || (!latSlice && !lngSlice)) {
        if (!d3.select('#slices-svg').empty()) {
            d3.select('#slices-svg').remove();
        }
        return;
    }
    let svg = d3.select('#eventlayer');
    let g = svg.select('#slices-svg');
    if (g.empty()) {
        g = svg.append('g')
            .attr('id', 'slices-svg');
    }
    let halfBoxheight = 20;
    if (latSlice) {
        if (d3.select('#latSliceLine').empty()) {
            let lat_index = LAT_INDEX === null ? Math.round(LAT.length / 2) : LAT_INDEX;
            let x1y1 = PROJ([LNG[0], LAT[lat_index]]);
            let x2y2 = PROJ([LNG[LNG.length - 1], LAT[lat_index]]);
            g.append('line')
                .attr('id', 'latSliceLine')
                .attr("x1", x1y1[0])
                .attr("y1", x1y1[1])
                .attr("x2", x2y2[0])
                .attr("y2", x2y2[1])
                .attr("stroke", "black")
                .attr("stroke-width", SLICE_WIDTH);
            g.append('rect')
                .attr('id', 'latSliceBox')
                .attr('x', x1y1[0])
                .attr('y', x1y1[1] - halfBoxheight)
                .attr('width', x2y2[0] - x1y1[0])
                .attr('height', halfBoxheight * 2)
                .style('fill', 'rgba(255,255,255,0)')
                .call(d3.drag()
                    .on("drag", dragLatLineBar)
                    .on("end", dragLatLine));
        }
    } else {
        d3.select('#latSliceLine').remove();
        d3.select('#latSliceBox').remove();
    }
    function dragLatLineBar(e) {
        let lnglat = PROJ([LNG[0], LAT[0]]);
        let y = e.y;
        if (y < 0) {
            y = 0;
        } else if (y > lnglat[1]) {
            y = lnglat[1];
        }
        d3.select('#latSliceLine')
            .attr("y1", y)
            .attr("y2", y)
        d3.select('#latSliceBox')
            .attr('y', y - halfBoxheight);
    }
    function dragLatLine(e) {
        let lnglat = PROJ([LNG[0], LAT[0]]);
        let y = e.y;
        if (y < 0) {
            y = 0;
        } else if (y > lnglat[1]) {
            y = lnglat[1];
        }
        d3.select('#latSliceLine')
            .attr("y1", y)
            .attr("y2", y)
        d3.select('#latSliceBox')
            .attr('y', y - halfBoxheight);
        xy = PROJ.invert([e.x, y])
        LAT_INDEX = search(xy[1], LAT);
        renderDustAtLat(LAT_INDEX, latSlice);
    }
    if (lngSlice) {
        if (d3.select('#lngSliceLine').empty()) {
            let lng_index = LNG_INDEX === null ? Math.round(LNG.length / 2) : LNG_INDEX;
            let x1y1 = PROJ([LNG[lng_index], LAT[0]]);
            let x2y2 = PROJ([LNG[lng_index], LAT[LAT.length - 1]]);
            g.append('line')
                .attr('id', 'lngSliceLine')
                .attr("x1", d => x1y1[0])
                .attr("y1", d => x1y1[1])
                .attr("x2", d => x2y2[0])
                .attr("y2", d => x2y2[1])
                .attr("stroke", "black")
                .attr("stroke-width", SLICE_WIDTH);
            g.append('rect')
                .attr('id', 'lngSliceBox')
                .attr('x', x1y1[0] - halfBoxheight)
                .attr('y', x2y2[1])
                .attr('width', halfBoxheight * 2)
                .attr('height', x1y1[1] - x2y2[1])
                .style('fill', 'rgba(255,255,255,0)')
                .call(d3.drag()
                    .on("drag", dragLngLineBar)
                    .on('end', dragLngLine));
        }
    } else {
        d3.select('#lngSliceLine').remove();
        d3.select('#lngSliceBox').remove();
    }
    function dragLngLineBar(e) {
        let lnglat = PROJ([LNG[LNG.length - 1], LAT[0]]);
        let x = e.x;
        if (x < 0) {
            x = 0;
        } else if (x > lnglat[0]) {
            x = lnglat[0];
        }
        d3.select('#lngSliceLine')
            .attr("x1", x)
            .attr("x2", x)
        d3.select('#lngSliceBox')
            .attr('x', x - halfBoxheight);
    }
    function dragLngLine(e) {
        let lnglat = PROJ([LNG[LNG.length - 1], LAT[0]]);
        let x = e.x;
        if (x < 0) {
            x = 0;
        } else if (x > lnglat[0]) {
            x = lnglat[0];
        }
        d3.select('#lngSliceLine')
            .attr("x1", x)
            .attr("x2", x)
        d3.select('#lngSliceBox')
            .attr('x', x - halfBoxheight);
        xy = PROJ.invert([x, e.y])
        LNG_INDEX = search(xy[0], LNG);
        renderDustAtLng(LNG_INDEX, lngSlice);
    }
}
function search(v, l) {
    if (v < l[0]) {
        return 0;
    }
    if (v > l[l.length - 1]) {
        return l.length - 1;
    }
    let lo = 0;
    let hi = l.length - 1;
    while (lo <= hi) {
        let mid = Math.floor((hi + lo) / 2);

        if (v < l[mid]) {
            hi = mid - 1;
        } else if (v > l[mid]) {
            lo = mid + 1;
        } else {
            return mid;
        }
    }
    return (l[lo] - v) < (v - l[hi]) ? lo : hi;
}

async function renderDustAtLat(lat_index = null, latSlice = false) {
    let div = d3.select('#lat_slice');
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !latSlice) {
        div.remove();
        return;
    }
    lat_index = lat_index === null ? Math.round(LAT.length / 2) : lat_index;
    let dust = await d3.json(`dust_at_lat/${CURR_TERRIAN_TASK}/${TIME_INDEX}/${lat_index}`);
    let svg = drawDustAtLat(dust, lat_index);
    if (div.empty()) {
        d3.select('#map')
            .append('div')
            .attr('id', 'lat_slice')
            .append(() => svg);
    }
    let viewbox = svg.getAttribute('viewBox').split(" ");
    let top = style.getPropertyValue('--margin-top');
    if (!d3.select('#lng_slice').empty()) {
        top = top < parseInt(style.getPropertyValue('--lon-top')) ? top : parseInt(style.getPropertyValue('--margin-middle')) + parseInt(style.getPropertyValue('--lon-height')) + parseInt(style.getPropertyValue('--lon-top'));
    }
    root.setProperty(`--lat-top`, `${top}px`);
    root.setProperty(`--lat-right`, `${style.getPropertyValue('--margin-right')}px`);
    root.setProperty(`--lat-length`, `${viewbox[2]}px`);
    root.setProperty(`--lat-height`, `${viewbox[3]}px`);
}
async function renderDustAtLng(lng_index = null, lngSlice = false) {
    let div = d3.select('#lng_slice');
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !lngSlice) {
        div.remove();
        return;
    }
    lng_index = lng_index === null ? Math.round(LNG.length / 2) : lng_index;
    let dust = await d3.json(`dust_at_lon/${CURR_TERRIAN_TASK}/${TIME_INDEX}/${lng_index}`);
    let svg = drawDustAtLng(dust, lng_index);
    if (div.empty()) {
        d3.select('#map')
            .append('div')
            .attr('id', 'lng_slice')
            .append(() => svg);
    }
    let viewbox = svg.getAttribute('viewBox').split(" ");
    let top = style.getPropertyValue('--margin-top');
    if (!d3.select('#lat_slice').empty()) {
        top = top < parseInt(style.getPropertyValue('--lat-top')) ? top : parseInt(style.getPropertyValue('--margin-middle')) + parseInt(style.getPropertyValue('--lat-height')) + parseInt(style.getPropertyValue('--lat-top'));
    }
    root.setProperty(`--lon-top`, `${top}px`);
    root.setProperty(`--lon-right`, `${style.getPropertyValue('--margin-right')}px`);
    root.setProperty(`--lon-length`, `${viewbox[2]}px`);
    root.setProperty(`--lon-height`, `${viewbox[3]}px`);
}
function drawDustAtLat(dust, lat) {
    let margin = { top: 18, left: 40, bottom: 40, right: 10 }; // right: 70
    let xy = d3.cross(d3.range(LNG.length), d3.range(LEVEL.length));
    xy = d3.filter(xy, d => dust[d[1]][d[0]] > MIND);
    let height = LEVEL.length * LEVEL_FACTOR;
    let x = d3.scaleLinear([0, LNG.length - 1], [0, LNG.length - 1]);
    let y = d3.scaleLinear([0, LEVEL.length - 1], [height, 0]);
    let svg = d3.select('#lat-svg');
    let lines;
    let title;
    if (svg.empty()) {
        svg = d3.create("svg")
            .attr('id', 'lat-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("preserveAspectRatio", "none")
            .attr("viewBox", "0 0 " + (LNG.length + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .style("display", "block");
        lines = svg.append('g')
            .attr('id', 'lat_svg_lines')
            .attr("transform", `translate(${margin.left},${margin.top - LEVEL_FACTOR})`);
        svg.append('g')
            .attr("transform", `translate(${margin.left},${height + margin.top})`)
            .call(d3.axisBottom(x)
                .tickFormat(d => LNG[d]))
        svg.append('text')
            .attr("x", margin.left + LNG.length * 0.5)
            .attr("y", height + margin.top + margin.bottom * 0.75)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text("Longitude");
        title = svg.append('text')
            .attr('id', 'lat_svg_title')
            .attr("x", margin.left + LNG.length * 0.5 - 25)
            .attr("y", margin.top * 0.5)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text(`Latitude=${LAT[lat]}`);
        svg.append('g')
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(d3.axisLeft(y).tickFormat(d => LEVEL[d]));
        svg.append('text')
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text("hPa");
        let lg = svg.append('defs').append('linearGradient')
            .attr('id', 'lat_slice_bar')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 1);
        lg.selectAll('stop')
            .data(dust_v)
            .join('stop')
            .attr('offset', d => d)
            .attr('stop-color', (d, i) => dust_c[i]);
        svg.append('rect')
            .attr('x', margin.left + LNG.length + 10)
            .attr('y', margin.top)
            .attr('width', 10)
            .attr('height', height)
            .style("fill", "url(#lat_slice_bar)");
    } else {
        lines = svg.select('#lat_svg_lines');
        title = svg.select('#lat_svg_title');
    }
    let projectXY = xy.map(d => [x(d[0]), y(d[1])]);
    lines.selectAll('line')
        .data(xy)
        .join('line')
        .attr("x1", (d, i) => projectXY[i][0])
        .attr("y1", (d, i) => projectXY[i][1])
        .attr("x2", (d, i) => projectXY[i][0])
        .attr("y2", (d, i) => projectXY[i][1] + LEVEL_FACTOR)
        .attr("stroke", d => dust_color(dust[d[1]][d[0]]))
        .attr("stroke-width", 1);

    title.text(`Latitude=${LAT[lat]}`);
    return svg.node();
}
function drawDustAtLng(dust, lng) {
    let margin = { top: 18, left: 40, bottom: 40, right: 10 };
    let xy = d3.cross(d3.range(LAT.length), d3.range(LEVEL.length));
    xy = d3.filter(xy, d => dust[d[1]][d[0]] > MIND);
    let height = LEVEL.length * LEVEL_FACTOR;
    let x = d3.scaleLinear([0, LAT.length - 1], [0, LAT.length - 1]);
    let y = d3.scaleLinear([0, LEVEL.length - 1], [height, 0]);
    let svg = d3.select('#lon-svg');
    let lines;
    let title;
    if (svg.empty()) {
        svg = d3.create("svg")
            .attr('id', 'lon-svg')
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + (LAT.length + margin.right + margin.left) + " " + (height + margin.top + margin.bottom))
            .style("display", "block");
        lines = svg.append('g')
            .attr('id', 'lon_svg_lines')
            .attr("transform", `translate(${margin.left},${margin.top - LEVEL_FACTOR})`);
        svg.append('g')
            .attr("transform", `translate(${margin.left},${height + margin.top})`)
            .call(d3.axisBottom(x).tickFormat(d => LAT[d]));
        svg.append('text')
            .attr("x", margin.left + LAT.length * 0.5)
            .attr("y", height + margin.top + margin.bottom * 0.75)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text("Latitude");
        title = svg.append('text')
            .attr('id', 'lon_svg_title')
            .attr("x", margin.left + LAT.length * 0.5 - 25)
            .attr("y", margin.top * 0.5)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text(`Longitude=${LNG[lng]}`);
        svg.append('g')
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(d3.axisLeft(y).tickFormat(d => LEVEL[d]));
        svg.append('text')
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .text("hPa");
        let lg = svg.append('defs').append('linearGradient')
            .attr('id', 'lon_slice_bar')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 1);
        lg.selectAll('stop')
            .data(dust_v)
            .join('stop')
            .attr('offset', d => d)
            .attr('stop-color', (d, i) => dust_c[i]);
        svg.append('rect')
            .attr('x', margin.left + LAT.length + 10)
            .attr('y', margin.top)
            .attr('width', 10)
            .attr('height', height)
            .style("fill", "url(#lon_slice_bar)");
    } else {
        lines = svg.select('#lon_svg_lines');
        title = svg.select('#lon_svg_title');
    }
    let projectXY = xy.map(d => [x(d[0]), y(d[1])]);
    lines.selectAll('line')
        .data(xy)
        .join('line')
        .attr("x1", (d, i) => projectXY[i][0])
        .attr("y1", (d, i) => projectXY[i][1])
        .attr("x2", (d, i) => projectXY[i][0])
        .attr("y2", (d, i) => projectXY[i][1] + LEVEL_FACTOR)
        .attr("stroke", d => dust_color(dust[d[1]][d[0]]))
        .attr("stroke-width", 1);
    title.text(`Longitude=${LNG[lng]}`);
    return svg.node();
}
function legend_lonlat_slice(height, width, opacity) {
    let margin = { top: 10, bottom: 10, left: 0, right: 40 };
    let svg = d3.create("svg")
        .attr('id', 'slice-color-scale-svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.right) + " " + height)
        .style("display", "block");
    let defs = svg.append('defs');
    var lg = defs.append('linearGradient')
        .attr('id', 'slice_color_scale')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 1);
    lg.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorGradientforLatLon(0));
    lg.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorGradientforLatLon(1));
    svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .style("fill", "url(#slice_color_scale)");
    return svg.node();
}
async function windCanvas(wind = false) {
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !wind) {
        removeWindCanvas();
        d3.select('#wind_legend_svg').remove();
        return;
    }
    let uv2 = await d3.json(`uv/${TIME_INDEX}/${LEVEL_INDEX}`); // LAT, LNG
    WIND_DENSITY = parseFloat(d3.select('#windResolution').property('value'));
    initWindCanvas(MAP, uv2, LNG, LAT);
    WIND_CANVAS_LAYER._canvas.id = "windlayer";
    d3.select(`#windlayer`)
        .style("position", "absolute")
        .style("z-index", 2);
    let v = [];
    let c = [];
    let o = [];
    for (let i = 0; i <= WIND_MAX_VELOCITY; i++) {
        v.push(i);
        c.push(WIND_COLOR_SCALE(i / WIND_MAX_VELOCITY));
        o.push(1);
    }
    if (d3.select('#wind_legend_svg').empty()) {
        let windlegend = createLengendBarH('wind_legend_svg', 300, 0, 15, v, c, o, 10, [10, 20, 15, 35], 'm/s');//10, 30, 250
        d3.select('#wind_lengend_div').append(() => windlegend.node());
    }
}
async function windSVG(wind = false) {
    if (!wind) {
        if (!d3.select('#wind-svg').empty()) {
            d3.select('#wind-svg').remove();
        }
        return;
    }
    let uv2 = await d3.json(`uv/${TIME_INDEX}/${LEVEL_INDEX}`); // LAT, LNG
    let L = Math.floor(1 / 0.03125);
    let S = 2;
    let all = d3.cross(d3.range(LNG.length), d3.range(LAT.length));//index
    let points = all.filter(d => d[1] % L === 0 && d[0] % L === 0);
    let svg = d3.select('#map-svg');
    g = d3.select('#wind-svg');
    if (g.empty()) {
        g = svg.append('g')
            .datum(1)
            .attr('id', 'wind-svg');
    }
    let viewTopLeft = PROJ([LNG[0], LAT[0]]);
    let viewBottomRight = PROJ([LNG[16], LAT[10]])
    let arrW = viewBottomRight[0] - viewTopLeft[0];
    let arrH = viewTopLeft[1] - viewBottomRight[1];
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 16, 10])
        .attr('refX', 16)
        .attr('refY', 5)
        .attr('markerWidth', arrW)
        .attr('markerHeight', arrH)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', "M 11 3 L 16 5 L 11 7")
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    function pointPaths(d, i) {
        let x = d[0];
        let y = d[1];
        let xyOnScreen = PROJ([LNG[d[0]], LAT[d[1]]]);
        let particles = [];
        particles.push(xyOnScreen);
        for (let i = 0; i < S; i++) {
            [u, v] = [uv2[0][y][x], uv2[1][y][x]];
            x = Math.floor(x + u);
            y = Math.floor(y + v);
            if (x < 0 || x >= LNG.length || y < 0 || y >= LAT.length) break;
            xyOnScreen = PROJ([LNG[x], LAT[y]]);
            particles.push(xyOnScreen);
        }
        let line = d3.line().curve(d3.curveBasis);
        if (Math.sqrt(Math.pow(particles[0][0] - particles[particles.length - 1][0], 2) + Math.pow(particles[0][1] - particles[particles.length - 1][1], 2)) <= 2) return;
        return line(particles);
    }
    g.selectAll('path')
        .data(points)
        .join('path')
        .attr('d', (d, i) => pointPaths(d, i))
        .attr('marker-end', 'url(#arrow)')
        .style('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    d3.select('#map-svg').selectAll('g').sort(d3.descending);
}