let dust_o = [], dust_sv = [], dust_v = [], dust_c = ['rgb(88, 24, 69)', 'rgb(144, 12, 63)', 'rgb(199, 0, 57)', 'rgb(255, 87, 51)', 'rgb(255, 195, 0)', 'rgb(218, 247, 166)', 'rgb(255,255,255)'];
let dust_color = undefined;
async function dustSVG(dust_switch = false) {
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !dust_switch) {
        if (!d3.select('#dust-svg').empty()) {
            d3.select('#dust-svg').remove();
        }
        d3.select('#dust_legend_svg').remove();
        d3.select('#dust_level_svg').remove();
        return;
    }
    let dust = await d3.json(`dust/${CURR_TERRIAN_TASK}/${TIME_INDEX}/${LEVEL_INDEX}`);
    let t_dust_sv = dust_sv.slice(0);
    let t_dust_c = dust_c.slice(0);
    if (d3.select('#dust_legend_svg').empty()) {
        let lengendsvg = createLengendBar('dust_legend_svg', 10, 35, 250, t_dust_sv.reverse(), t_dust_c.reverse(), dust_o, 11, [5, 25, 5, 5], 'mg/m3');
        d3.select('#dust_lengend_div').append(() => lengendsvg.node());
    }
    if (d3.select('#dust_level_svg').empty()) {
        let levelsvg = createLevelBar('dust_level_svg', 10, 35, 250, [5, 25, 5, 5], 'hPa');
        d3.select('#dust_level_div').append(() => levelsvg.node());
    }
    let xy = d3.cross(d3.range(LNG.length), d3.range(LAT.length));//index
    let D = Math.floor(1 / d3.select('#resolution').property('value'));
    xy = xy.filter(d => d[1] % D === 0 && d[0] % D === 0);
    xy = d3.filter(xy, d => dust[d[1]][d[0]] > MIND);
    let projectXY = xy.map(d => PROJ([LNG[d[0]], LAT[d[1]]]));
    let svg = d3.select('#map-svg');
    let g = d3.select('#dust-svg');
    if (g.empty()) {
        g = svg.append('g')
            .datum(2)
            .attr('id', 'dust-svg');
    }
    g.selectAll('rect')
        .data(xy)
        .join('rect')
        .attr('x', (d, i) => projectXY[i][0] - D / 2)
        .attr('y', (d, i) => projectXY[i][1] - D / 2)
        .attr('width', D)
        .attr('height', D)
        .attr('fill', d => dust_color(dust[d[1]][d[0]]))
        .attr('fill-opacity', d => OPA(dust[d[1]][d[0]]));
    d3.select('#map-svg').selectAll('g').sort(d3.descending);
}
let BRUSH_GROUP = undefined;
function brushOnMap() {
    let svg = d3.select('#eventlayer');
    MAP.dragging.disable();
    BRUSH_GROUP = svg.append('g')
        .attr('id', 'brush_g');
    BRUSH_GROUP
        .call(d3.brush()
            .on("end", brushDust));
    return true;
}
let BRUSH_X0, BRUSH_X1, BRUSH_Y0, BRUSH_Y1;
async function brushDust(e) {
    if (!e.sourceEvent) return; // Only transition after input.
    if (!e.selection) return; // Ignore empty selections.
    [[x0, y0], [x1, y1]] = e.selection;
    [lng0, lat0] = PROJ.invert([x0, y1]);
    [lng1, lat1] = PROJ.invert([x1, y0]);
    [x0, x1] = [indexOfClosest(lng0, LNG), indexOfClosest(lng1, LNG)];
    [y0, y1] = [indexOfClosest(lat0, LAT), indexOfClosest(lat1, LAT)];
    BRUSH_X0 = x0, BRUSH_X1 = x1, BRUSH_Y0 = y0, BRUSH_Y1 = y1;
    dustAvgPlot(x0, x1, y0, y1);
}
async function dustAvgPlot(x0, x1, y0, y1) {
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK)) {
        if (!d3.select('#dustAvgSeries_svg').empty()) {
            d3.select('#dustAvgSeries_svg').remove();
        }
        return;
    }
    let dust = await d3.json(`dust/${CURR_TERRIAN_TASK}/${LEVEL_INDEX}/${x0}/${x1}/${y0}/${y1}`);
    let titleHeight = 30, numberHeight = 50, marginTop = 15, numberWidth = 70, titleWidth = 25, marginRight = 10;
    let width = 505 * 0.8 + numberWidth + titleWidth + marginRight;
    let height = 293;
    let min = 0;
    let max = 10000;
    let xScale = d3.scaleLinear()
        .domain([0, TIME.length - 1])
        .range([titleWidth + numberWidth, width - marginRight]);
    let cScale = d3.scaleLinear()
        .domain([0, 10000])
        .range([1, 0]);
    let x_values = d3.range(TIME.length).filter((_, i) => i % 48 == 0);
    let yScale = d3.scaleLinear()
        .domain([min, max])
        .range([height - titleHeight - numberHeight, marginTop]);
    let y_values = [];
    let t = (max - min) / 5;
    for (let i = 0; i < 6; i++) {
        y_values.push(min + i * t);
    }
    let xAxis = d3.axisBottom(xScale)
        .tickValues(x_values);
    let yAxis = d3.axisLeft(yScale)
        .tickValues(y_values)
        .tickFormat(d3.format(".2f"));
    if (!d3.select('#dustAvgSeries_svg').empty()) {
        d3.select('#dustAvgSeries_svg').remove();
    }
    let svg = d3.create("svg")
        .attr('id', 'dustAvgSeries_svg')
        .attr('width', `${width}px`)
        .attr('height', `${height}px`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style('background-color', 'whitesmoke');
    let maxY = yScale(max);
    let minY = yScale(min);
    let lg = svg.append('linearGradient')
        .attr('id', `dustavg-gradient`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", maxY)
        .attr("x2", 0)
        .attr("y2", minY);
    let v = createEvenlyDistributedArray(max, min, 10);
    lg.selectAll('stop')
        .data(v)
        .join('stop')
        .attr('offset', d => (yScale(d) / minY).toFixed(2))
        .attr('stop-color', d => d3.interpolateWarm(cScale(d)));
    svg.append("g")
        .attr("transform", `translate(0,${height - titleHeight - numberHeight})`)
        .call(xAxis)
        .selectAll("text")
        .text(d => TIME[d].slice(0, 10))
        .attr("transform", `rotate(-30)`)
        .style("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px");
    svg.append("g")
        .attr("transform", `translate(${titleWidth + numberWidth},0)`)
        .call(yAxis)
        .selectAll("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px");
    svg.append('text')
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .attr("transform", `translate(${titleWidth / 5 * 4},${height / 2})rotate(-90)`) //+ (height - marginTop - titleHeight - numberHeight)/3
        .text("Average Dust Concentration");
    svg.append('text')
        .attr("x", numberWidth + (width - titleWidth - numberWidth - marginRight) / 2)
        .attr("y", height - titleHeight / 5)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .text("Time");
    svg.append('text')
        .attr("x", titleWidth + numberWidth)
        .attr("y", marginTop)
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .attr("fill", "black")
        .text("mg/m3");
    svg.append("path")
        .datum(dust)
        .attr("fill", "none")
        .attr("stroke", "url(#dustavg-gradient)")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d))
        );
    let focus = svg.append('g').style("opacity", 0);
    let fcircle = focus.append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 4);
    let ft1 = focus.append('text');
    let ft2 = focus.append('text');
    svg.append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('x', titleWidth + numberWidth)
        .attr('y', marginTop)
        .attr('width', width - titleWidth - numberWidth - marginRight)
        .attr('height', height - titleHeight - numberHeight - marginTop)
        .on("click", () => { downloadSVGById('dustAvgSeries_svg'); })
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
    function mouseover() {
        focus.style("opacity", 1);
    }
    function mousemove(e) {
        let i = Math.round(xScale.invert(d3.pointer(e)[0]));
        fcircle
            .attr("cx", xScale(i))
            .attr("cy", yScale(dust[i]));
        ft1
            .html(`${dust[i].toFixed(2)}`)
            .attr("x", function () {
                if (i > TIME.length / 5 * 4) {
                    return xScale(i) - 60;
                }
                return xScale(i) + 7;
            })
            .attr("y", yScale(dust[i]))
        ft2
            .html(`${TIME[i].slice(0, 13)}`)
            .attr("x", function () {
                if (i > TIME.length / 5 * 4) {
                    return xScale(i) - 100;
                }
                return xScale(i) + 7;
            })
            .attr("y", yScale(dust[i]) + 13)
    }
    function mouseout() {
        focus.style("opacity", 0);
    }
    d3.select('#dustAvg_div').append(() => svg.node());
}

function closeBrushOnMap() {
    BRUSH_GROUP.remove();
    BRUSH_GROUP = undefined;
    d3.select('#dustAvgSeries_svg').remove();
    MAP.dragging.enable();
}
function indexOfClosest(v, arr) {
    let closest = arr.reduce(function (prev, curr) {
        return (Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev);
    });
    return arr.indexOf(closest);
}
function createEvenlyDistributedArray(start, end, count) {
    const step = (end - start) / (count - 1);
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(start + i * step);
    }
    return result;
}