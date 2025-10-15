let MODEL_COMPARISION = false;
const MODEL_COMPARISION_DUST_RES = 0.5;
function updateModelComparision(btno = [0, 1]) {
    if (!MODEL_COMPARISION) return;
    for (let i = 0; i < btno.length; i++) {
        const taskno = Number(d3.select(`#select_btn_${btno[i]}`).property('value'));
        d3.json(`dust/${taskno}/${TIME_INDEX}/${LEVEL_INDEX}`)
            .then(d => {
                let svg = scalar(`window_${btno[i]}`, LNG, LAT, d, PROJ, MODEL_COMPARISION_DUST_RES, [], dust_color);
                let polygons
                if (TERRIAN_POLYGONS.size === 0) {
                    polygons = deserializeMap(JSON.parse(localStorage.getItem('TERRIAN_POLYGONS'))).get(taskno);
                } else {
                    polygons = TERRIAN_POLYGONS.get(taskno);
                }
                if (polygons !== null) {
                    let g = svg.append('g');
                    g.selectAll('polygon')
                        .data(Array.from(polygons.keys()))
                        .join('polygon')
                        .attr('id', d => d)
                        .attr('class', 'added-area')
                        .attr("points", d => {
                            return d3.polygonHull(polygons.get(d).points).map(d => d.join(',')).join(' ');
                        })
                        .attr("stroke", d => polygons.get(d).color)
                        .attr('fill', d => polygons.get(d).color)
                        .attr("stroke-width", 1)
                        .attr('fill-opacity', 0.5)
                        .attr('stroke-opacity', 1);
                }
                d3.select(`#window_${btno[i]}`).node().replaceWith(svg.node());
            });
    }
}
function updatePolygonPosition() {
    TERRIAN_POLYGONS.set(0, undefined);
    for (let i = 1; i <= 3; i++) {
        let polygons = deserializeMap(JSON.parse(localStorage.getItem('TERRIAN_POLYGONS'))).get(i);
        polygons.forEach(polygon => {
            polygon.points.forEach(point => {
                point[0] += 41.8;
                point[1] += 25.1;
            });
        });
        TERRIAN_POLYGONS.set(i, deepCopyMap(polygons));
    }
    localStorage.setItem('TERRIAN_POLYGONS', JSON.stringify(serializeMap(TERRIAN_POLYGONS)));
}
async function createModelComparision() {
    let svgList = [];
    for (let i = 0; i < 2; i++) {
        if (FINISHED_TASK[i] == undefined) {
            svgList[i] = [scalar(`window_${i}`, LNG, LAT, [], PROJ, MODEL_COMPARISION_DUST_RES, [], dust_color), geoJsonToSvg(`worldmap_${i}`, LNG.length, LAT.length, PROJ, geoJson_world)];
        } else {
            let v = await d3.json(`dust/${FINISHED_TASK[i]}/${TIME_INDEX}/${LEVEL_INDEX}`);
            svgList[i] = [scalar(`window_${i}`, LNG, LAT, v, PROJ, MODEL_COMPARISION_DUST_RES, [], dust_color), geoJsonToSvg(`worldmap_${i}`, LNG.length, LAT.length, PROJ, geoJson_world)];
        }
        let btn = d3.select('#model_comparision_div').append('select')
            .attr("id", `select_btn_${i}`);
        btn.selectAll("option")
            .data(FINISHED_TASK)
            .enter()
            .append("option")
            .text(d => `Task No. ${d}`)
            .attr("value", d => d);
        btn.property("value", FINISHED_TASK[i]);
        btn.on("change", async function (e) {
            const id = d3.select(this).property('id').slice(-1);
            updateModelComparision([id]);
        });
    }
    let titleHeight = 40, left = 10, right = 10, bottom = 40, interval = 10;
    let fwidth = LNG.length, fheight = LAT.length;
    let width = left + right + fwidth * 2 + interval;
    let height = titleHeight + bottom + fheight;
    let svg = d3.create('svg')
        .attr('id', 'comparision_svg')
        .attr('width', `${width}px`)
        .attr('height', `${height}px`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("display", "block")
        .style('background-color', 'whitesmoke');
    svg.append('text')
        .attr("x", width / 5 * 1.7)
        .attr("y", 0.7 * titleHeight)
        .text('The Comparison of the Dust Concentration Simulation Results')
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("font-weight", "bold")
        .attr("fill", "black");
    g = svg.append('g').attr('id', 'dustmodel');
    g1 = svg.append('g');
    for (let i = 0; i < svgList.length; i++) {
        g.append(() => svgList[i][0].node());
        g1.append(() => svgList[i][1].node());
    }
    g.selectAll('svg')
        .attr('x', (d, i) => {
            return left + fwidth * i + interval * i;
        })
        .attr('y', (d, i) => {
            return titleHeight;
        })
        .attr('width', fwidth)
        .attr('height', fheight);
    g1.selectAll('svg')
        .attr('x', (d, i) => {
            return left + fwidth * i + interval * i;
        })
        .attr('y', (d, i) => {
            return titleHeight;
        })
        .attr('width', fwidth)
        .attr('height', fheight);
    g1.selectAll('rect')
        .data(svgList)
        .join('rect')
        .attr('x', (d, i) => {
            return left + fwidth * i + interval * i;
        })
        .attr('y', (d, i) => {
            return titleHeight;
        })
        .attr('width', fwidth)
        .attr('height', fheight)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    d3.select('#model_comparision_div').append(() => svg.node());
}