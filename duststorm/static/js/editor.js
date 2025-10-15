let POLYGON_DRAWING_ENABLE = false;
const COMPLETE_POLYGONS = new Map();
let CLICKED_POINTS = [];
let FINISHED_TASK = undefined;
let TYEP_INDEX = -1, COLOR_INDEX = '';
const TREE_TYPE = 1, WATER_TYPE = 2, EROSION_TYPE = 3, NORMAL_TYPE = 4;
const TREE_COLOR = '#2A7E19', WATER_COLOR = '#3ea4f0', EROSION_COLOR = '#F7AC2B', NORMAL_COLOR = '#FFFFFF';
let CURR_AREA_ID = undefined;
let POLYGON_EVENT_ENABLE = false;
let POLYGON_COUNT = -1;
let TERRIAN_COUNT = -1;
let TASK_TREE = new Map();
let TERRIAN_POLYGONS = new Map();
let POLYGON_GROUP = undefined;
let CURR_TERRIAN_TASK = 0;
function newTerrian() {
    if (BRUSH_GROUP != undefined) {
        alert("Please close the brush on the map first.");
    }
    if (TERRIAN_POLYGONS.has(CURR_TERRIAN_TASK)) {
        TERRIAN_COUNT = TERRIAN_COUNT + 1;
        TASK_TREE.get(CURR_TERRIAN_TASK).children.push(TERRIAN_COUNT);
        TASK_TREE.set(TERRIAN_COUNT, {
            name: TERRIAN_COUNT,
            children: [],
        })
        CURR_TERRIAN_TASK = TERRIAN_COUNT;
        drawTree();
        POLYGON_DRAWING_ENABLE = true;
    }
}
function indexOfLonLat(points) {
    return points.map(p => {
        let [lon, lat] = PROJ.invert(p);
        let absx = mask_lon.map(e => Math.abs(e - lon));
        let absy = mask_lat.map(e => Math.abs(e - lat));
        return [absx.indexOf(Math.min(...absx)), absy.indexOf(Math.min(...absy))];
    });
}
function maskNetCDF() {
    let allPoints = d3.cross(d3.range(549), d3.range(449));
    let r = [];
    COMPLETE_POLYGONS.forEach((v, k) => {
        let hull = d3.polygonHull(indexOfLonLat(v.points));
        let insidePoints = allPoints.filter(point => d3.polygonContains(hull, point));
        r.push([v.type, insidePoints.map(p => [p[1], p[0]])]);
    });
    const data = {
        task_no: CURR_TERRIAN_TASK,
        indices: r
    };
    fetch("/mask", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(result => console.log("Response from server:", result))
        .catch(error => console.error("Error:", error));
}
function interpolateToNewResolution(points) {
    let x_diff_original = LNG.length - 1;
    let y_diff_original = LAT.length - 1;
    let x_diff_new = 548;
    let y_diff_new = 448;
    const newPoints = points.map(p => [p[0] / x_diff_original * x_diff_new, 448 - p[1] / y_diff_original * y_diff_new]);
    return newPoints
}
function finishTerian() {
    if (TERRIAN_POLYGONS.has(CURR_TERRIAN_TASK))
        return;
    completeArea();
    if (COMPLETE_POLYGONS.size === 0) return;
    TERRIAN_POLYGONS.set(CURR_TERRIAN_TASK, deepCopyMap(COMPLETE_POLYGONS));
    maskNetCDF();
    COMPLETE_POLYGONS.clear();
    POLYGON_GROUP.selectAll('*').remove();
    POLYGON_DRAWING_ENABLE = false;
    POLYGON_EVENT_ENABLE = false;
    CURR_TERRIAN_TASK = 0;
    drawTree();
    localStorage.setItem('TASK_TREE', JSON.stringify(serializeMap(TASK_TREE)));
    localStorage.setItem('TERRIAN_POLYGONS', JSON.stringify(serializeMap(TERRIAN_POLYGONS)));
    localStorage.setItem('POLYGON_COUNT', POLYGON_COUNT);
    localStorage.setItem('TERRIAN_COUNT', TERRIAN_COUNT);
    saveLocalStorageToServer();
}
function mapToHierarchy(nodeId) {
    const nodeData = TASK_TREE.get(nodeId);
    return {
        name: nodeData.name,
        children: nodeData.children.map(mapToHierarchy)
    };
}
function drawTree() {
    const treeData = mapToHierarchy(0);
    const root = d3.hierarchy(treeData);
    let n = root.height < 5 ? root.height : 5;
    let margin = { top: -20, right: 30, bottom: -10, left: 30 },
        width = 50 * n + margin.right + margin.left, //400 - -
        height = 200 - margin.top - margin.bottom; //200 - -
    const cluster = d3.cluster().size([height, width]);
    cluster(root);
    const maxDepth = Math.max(...root.descendants().map(d => d.depth));
    const depthSpacing = width / (maxDepth);
    root.descendants().forEach(d => {
        d.y = d.depth * depthSpacing;
    });
    d3.select("#terrian_tree_svg").selectAll('*').remove();
    const svg = d3.select("#terrian_tree_svg")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical() //linkHorizontal
            .x(d => d.y)
            .y(d => d.x));
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr('id', d => `tree_node_${d.data.name}`)
        .attr("class", d => {
            if (FINISHED_TASK.includes(d.data.name)) {
                if (CURR_TERRIAN_TASK == d.data.name) {
                    return "node selected"
                }
                return "node"
            } else if (TERRIAN_POLYGONS.has(d.data.name)) {
                if (CURR_TERRIAN_TASK == d.data.name) {
                    return "node running selected"
                }
                return "node running";
            } else {
                if (CURR_TERRIAN_TASK == d.data.name) {
                    return "node new selected"
                }
                return "node new";
            }
        })
        .attr("transform", d => `translate(${d.y}, ${d.x})`)
        .on("click", function (event, d) {
            if (TERRIAN_POLYGONS.size !== TASK_TREE.size) return;
            d3.selectAll(".node").classed("selected", false);
            d3.select(this).classed("selected", true);
            CURR_TERRIAN_TASK = d.data.name;
            COMPLETE_POLYGONS.clear();
            POLYGON_GROUP.selectAll('*').remove();
            if (TERRIAN_POLYGONS.get(CURR_TERRIAN_TASK)) {
                TERRIAN_POLYGONS.get(CURR_TERRIAN_TASK).forEach((v, k) => {
                    COMPLETE_POLYGONS.set(k, JSON.parse(JSON.stringify(v)));
                });
                drawPolygons();
            }
            if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK)) {
                alert("The task has not been completed yet, waiting for data..");
            }
            reRender();
        })
        .on('dblclick', (event, d) => {
            if (TERRIAN_POLYGONS.has(d.data.name)) return;
            deleteId = d.data.name;
            TASK_TREE.delete(deleteId);
            TERRIAN_COUNT = TERRIAN_COUNT - 1;
            for (const [k, v] of TASK_TREE) {
                let index = v.children.indexOf(deleteId);
                if (index !== -1) {
                    v.children.splice(index, 1);
                }
            }
            COMPLETE_POLYGONS.clear();
            POLYGON_GROUP.selectAll('*').remove();
            CURR_TERRIAN_TASK = 0;
            drawTree();
        });
    node.append("circle")
        .attr("r", 8);
    node.append("text")
        .attr("y", 25)
        .attr("x", 30)
        .style("text-anchor", 'end')
        .text(d => `Task No. ${d.data.name}`);
}
function drawPolygons() {
    POLYGON_GROUP.selectAll('polygon')
        .data(Array.from(COMPLETE_POLYGONS.keys()))
        .join('polygon')
        .attr('id', d => d)
        .attr('class', 'added-area')
        .attr("points", d => {
            return d3.polygonHull(COMPLETE_POLYGONS.get(d).points).map(d => d.join(',')).join(' ');
        })
        .attr("stroke", d => COMPLETE_POLYGONS.get(d).color)
        .attr('fill', d => COMPLETE_POLYGONS.get(d).color)
        .attr("stroke-width", 1)
        .attr('fill-opacity', 0.5)
        .attr('stroke-opacity', 1)
        .on("dblclick", function (event) {
            if (POLYGON_EVENT_ENABLE) {
                CURR_AREA_ID = this.id;
                CLICKED_POINTS = COMPLETE_POLYGONS.get(CURR_AREA_ID).points;
                TYEP_INDEX = COMPLETE_POLYGONS.get(CURR_AREA_ID).type;
                COLOR_INDEX = COMPLETE_POLYGONS.get(CURR_AREA_ID).color;
                POLYGON_EVENT_ENABLE = false;
                MAP.dragging.disable();
            }
        })
        .call(d3.drag()
            .on("drag", draggedPolygon));
}
function initPolygonEditor() {
    POLYGON_GROUP = d3.select('#eventlayer').append('g').attr('id', 'polygon_g');
    COMPLETE_POLYGONS.clear();
    CLICKED_POINTS = [];
    TYEP_INDEX = -1;
    COLOR_INDEX = '';
    CURR_AREA_ID = undefined;
    if (localStorage.getItem('TASK_TREE') != null) {
        TASK_TREE = deserializeMap(JSON.parse(localStorage.getItem('TASK_TREE')));
        TERRIAN_POLYGONS = deserializeMap(JSON.parse(localStorage.getItem('TERRIAN_POLYGONS')));
        TERRIAN_COUNT = Number(localStorage.getItem('TERRIAN_COUNT'));
        POLYGON_COUNT = Number(localStorage.getItem('POLYGON_COUNT'));
    } else {
        TASK_TREE.set(0, {
            name: 0,
            children: [],
        });
        TERRIAN_POLYGONS.set(0, undefined);
        TERRIAN_COUNT = 0;
        POLYGON_COUNT = 0;
    }
    drawTree();
}
function clickOnMapDrawPolygon(event, proj, svg) {
    if (!POLYGON_DRAWING_ENABLE || MAP.dragging.enabled() || POLYGON_EVENT_ENABLE || TERRIAN_POLYGONS.has(CURR_TERRIAN_TASK)) return;
    if (TYEP_INDEX !== -1) {
        let [x, y] = d3.pointer(event);
        CLICKED_POINTS.push([x, y]);
        if (CLICKED_POINTS.length == 1) {
            POLYGON_COUNT = POLYGON_COUNT + 1;
            CURR_AREA_ID = `polygon_${POLYGON_COUNT}`;
            POLYGON_GROUP.append('polygon')
                .attr('id', CURR_AREA_ID)
                .attr('class', 'added-area')
                .on("dblclick", function (event) {
                    if (POLYGON_EVENT_ENABLE) {
                        CURR_AREA_ID = this.id;
                        CLICKED_POINTS = COMPLETE_POLYGONS.get(CURR_AREA_ID).points;
                        TYEP_INDEX = COMPLETE_POLYGONS.get(CURR_AREA_ID).type;
                        COLOR_INDEX = COMPLETE_POLYGONS.get(CURR_AREA_ID).color;
                        POLYGON_EVENT_ENABLE = false;
                        MAP.dragging.disable();
                    }
                })
                .call(d3.drag()
                    .on("drag", draggedPolygon));
        }
        drawPolygon(CLICKED_POINTS, COLOR_INDEX, POLYGON_GROUP);
    }
}
function draggedPolygon(event) {
    if (POLYGON_EVENT_ENABLE) {
        CURR_AREA_ID = this.id;
        CLICKED_POINTS = COMPLETE_POLYGONS.get(CURR_AREA_ID).points;
        CLICKED_POINTS.forEach(point => {
            point[0] += event.dx;
            point[1] += event.dy;
        });
        d3.select(this).attr("points", d3.polygonHull(CLICKED_POINTS).map(d => d.join(',')).join(' '));
    }
}
function drawPolygon(points, color, svg) {
    if (points.length < 3) {
        if (points.length == 1) {
            svg.append('circle')
                .attr('id', 'firstClickOfArea')
                .attr('cx', points[0][0])
                .attr('cy', points[0][1])
                .attr('r', 1)
                .attr('fill', color);
        } else if (points.length == 2) {
            svg.select('#firstClickOfArea').remove();
            points = points.map(d => d.join(',')).join(' ');
        }
    } else {
        points = d3.polygonHull(points).map(d => d.join(',')).join(' ');
    }
    try {
        svg.select(`#${CURR_AREA_ID}`)
            .attr("points", points)
            .attr("stroke", color)
            .attr('fill', color)
            .attr("stroke-width", 1)
            .attr('fill-opacity', 0.5)
            .attr('stroke-opacity', 1);
    } catch (err) {
        console.log(err);
    }
}
function plantArea() {
    TYEP_INDEX = TREE_TYPE;
    COLOR_INDEX = TREE_COLOR;
    changeCurrArea();
}
function changeCurrArea() {
    MAP.dragging.disable();
    POLYGON_EVENT_ENABLE = false;
    if (CURR_AREA_ID !== undefined) {
        d3.select(`#${CURR_AREA_ID}`)
            .attr("stroke", COLOR_INDEX)
            .attr('fill', COLOR_INDEX);
    }
}
function waterArea() {
    TYEP_INDEX = WATER_TYPE;
    COLOR_INDEX = WATER_COLOR;
    changeCurrArea();
}
function erosionArea() {
    TYEP_INDEX = EROSION_TYPE;
    COLOR_INDEX = EROSION_COLOR;
    changeCurrArea();
}
function revertLastClicking() {
    if (CURR_AREA_ID !== undefined && CLICKED_POINTS.length > 3) {
        CLICKED_POINTS.pop();
        drawPolygon(CLICKED_POINTS, COLOR_INDEX, POLYGON_GROUP);
    }
}
function completeArea() {
    console.log(`CURR_AREA_ID=${CURR_AREA_ID}`);
    if (CURR_AREA_ID == undefined) return;
    COMPLETE_POLYGONS.set(CURR_AREA_ID, {
        type: TYEP_INDEX,
        color: COLOR_INDEX,
        points: CLICKED_POINTS
    });
    CLICKED_POINTS = [];
    CURR_AREA_ID = undefined;
    console.log(COMPLETE_POLYGONS);
}
function deleteArea() {
    console.log(`${CURR_AREA_ID == undefined} && ${!COMPLETE_POLYGONS.has(CURR_AREA_ID)}`);
    if (CURR_AREA_ID == undefined && !COMPLETE_POLYGONS.has(CURR_AREA_ID)) return;
    console.log(`delete ${CURR_AREA_ID}`);
    COMPLETE_POLYGONS.delete(CURR_AREA_ID);
    d3.select(`#${CURR_AREA_ID}`).remove();
    CURR_AREA_ID = undefined;
    CLICKED_POINTS = [];
}
function editorMenu() {
    d3.select('#editor_menu_div').attr('class', 'editor-menu-visible');
    d3.select('#terrian_tree_div').attr('class', 'terrian-tree-visible');
    initPolygonEditor();
    return true;
}
function closeEditorMenu() {
    d3.select('#editor_menu_div').attr('class', 'editor-menu-hidden');
    d3.select('#terrian_tree_div').attr('class', 'terrian-tree-hidden');
    COMPLETE_POLYGONS.clear();
    POLYGON_GROUP.remove();
    POLYGON_GROUP = undefined;
}
function moveBackground() {
    if (BRUSH_GROUP != undefined) {
        alert("Please close the brush on the map first.");
    }
    MAP.dragging.enabled() ? MAP.dragging.disable() : MAP.dragging.enable();
}
function selectPolygon() {
    completeArea();
    if (TERRIAN_POLYGONS.has(CURR_TERRIAN_TASK)) return;
    POLYGON_EVENT_ENABLE = !POLYGON_EVENT_ENABLE;
}
function deepCopyMap(originalMap) {
    const newMap = new Map();
    originalMap.forEach((value, key) => {
        if (value instanceof Map) {
            newMap.set(key, deepCopyMap(value));
        } else if (value instanceof Object) {
            newMap.set(key, JSON.parse(JSON.stringify(value)));
        } else {
            newMap.set(key, value);
        }
    });
    return newMap;
}
function serializeMap(map) {
    return Array.from(map.entries()).map(([key, value]) => {
        return [key, value instanceof Map ? serializeMap(value) : value];
    });
}
function deserializeMap(array) {
    return new Map(array.map(([key, value]) => {
        return [key, Array.isArray(value) ? deserializeMap(value) : value];
    }));
}
async function saveLocalStorageToServer() {
    const data = JSON.stringify(localStorage);
    await fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
    });
}
async function loadLocalStorageFromServer() {
    const response = await fetch('/tasks');
    const result = await response.json();
    if (result.data) {
        const data = JSON.parse(result.data);
        for (const key in data) {
            localStorage.setItem(key, data[key]);
        }
    }
}
const mask_lon = [
    23.22635, 23.32406, 23.42177, 23.51949, 23.6172, 23.71492, 23.81263,
    23.91034, 24.00806, 24.10577, 24.20349, 24.3012, 24.39891, 24.49663,
    24.59434, 24.69205, 24.78977, 24.88748, 24.9852, 25.08291, 25.18063,
    25.27834, 25.37605, 25.47377, 25.57148, 25.6692, 25.76691, 25.86463,
    25.96234, 26.06005, 26.15777, 26.25548, 26.3532, 26.45091, 26.54862,
    26.64634, 26.74405, 26.84177, 26.93948, 27.03719, 27.13491, 27.23262,
    27.33034, 27.42805, 27.52576, 27.62348, 27.72119, 27.81891, 27.91662,
    28.01433, 28.11205, 28.20976, 28.30748, 28.40519, 28.5029, 28.60062,
    28.69833, 28.79605, 28.89376, 28.99148, 29.08919, 29.1869, 29.28462,
    29.38233, 29.48005, 29.57776, 29.67547, 29.77319, 29.8709, 29.96862,
    30.06633, 30.16404, 30.26176, 30.35947, 30.45719, 30.5549, 30.65261,
    30.75033, 30.84804, 30.94576, 31.04347, 31.14118, 31.2389, 31.33661,
    31.43433, 31.53204, 31.62976, 31.72747, 31.82518, 31.9229, 32.02061,
    32.11832, 32.21604, 32.31376, 32.41147, 32.50918, 32.6069, 32.70461,
    32.80232, 32.90004, 32.99775, 33.09547, 33.19318, 33.29089, 33.38861,
    33.48632, 33.58404, 33.68175, 33.77946, 33.87718, 33.97489, 34.07261,
    34.17032, 34.26804, 34.36575, 34.46346, 34.56118, 34.65889, 34.75661,
    34.85432, 34.95203, 35.04975, 35.14746, 35.24518, 35.34289, 35.44061,
    35.53831, 35.63603, 35.73375, 35.83146, 35.92918, 36.02689, 36.1246,
    36.22232, 36.32003, 36.41774, 36.51546, 36.61317, 36.71089, 36.8086,
    36.90631, 37.00403, 37.10174, 37.19946, 37.29717, 37.39489, 37.4926,
    37.59031, 37.68803, 37.78574, 37.88345, 37.98117, 38.07888, 38.1766,
    38.27431, 38.37202, 38.46974, 38.56745, 38.66517, 38.76288, 38.8606,
    38.95831, 39.05602, 39.15374, 39.25145, 39.34917, 39.44688, 39.54459,
    39.64231, 39.74002, 39.83774, 39.93545, 40.03316, 40.13088, 40.22859,
    40.32631, 40.42402, 40.52174, 40.61945, 40.71716, 40.81488, 40.91259,
    41.01031, 41.10802, 41.20573, 41.30345, 41.40116, 41.49888, 41.59659,
    41.69431, 41.79202, 41.88973, 41.98745, 42.08516, 42.18288, 42.28059,
    42.3783, 42.47602, 42.57373, 42.67144, 42.76916, 42.86687, 42.96459,
    43.0623, 43.16002, 43.25773, 43.35544, 43.45316, 43.55087, 43.64859,
    43.7463, 43.84401, 43.94173, 44.03944, 44.13716, 44.23487, 44.33258,
    44.4303, 44.52801, 44.62572, 44.72344, 44.82116, 44.91887, 45.01658,
    45.1143, 45.21201, 45.30972, 45.40744, 45.50515, 45.60287, 45.70058,
    45.79829, 45.89601, 45.99372, 46.09144, 46.18915, 46.28687, 46.38458,
    46.48229, 46.58001, 46.67772, 46.77544, 46.87315, 46.97086, 47.06858,
    47.16629, 47.26401, 47.36172, 47.45943, 47.55715, 47.65486, 47.75257,
    47.85029, 47.94801, 48.04572, 48.14343, 48.24115, 48.33886, 48.43658,
    48.53429, 48.632, 48.72972, 48.82743, 48.92514, 49.02286, 49.12057,
    49.21829, 49.316, 49.41372, 49.51143, 49.60914, 49.70686, 49.80457,
    49.90229, 50, 50.09771, 50.19543, 50.29314, 50.39086, 50.48857, 50.58628,
    50.684, 50.78171, 50.87943, 50.97714, 51.07486, 51.17257, 51.27028,
    51.368, 51.46571, 51.56342, 51.66114, 51.75885, 51.85657, 51.95428,
    52.05199, 52.14971, 52.24743, 52.34514, 52.44285, 52.54057, 52.63828,
    52.73599, 52.83371, 52.93142, 53.02914, 53.12685, 53.22456, 53.32228,
    53.41999, 53.51771, 53.61542, 53.71313, 53.81085, 53.90856, 54.00628,
    54.10399, 54.20171, 54.29942, 54.39713, 54.49485, 54.59256, 54.69028,
    54.78799, 54.8857, 54.98342, 55.08113, 55.17884, 55.27656, 55.37428,
    55.47199, 55.5697, 55.66742, 55.76513, 55.86284, 55.96056, 56.05827,
    56.15599, 56.2537, 56.35141, 56.44913, 56.54684, 56.64456, 56.74227,
    56.83998, 56.9377, 57.03541, 57.13313, 57.23084, 57.32856, 57.42627,
    57.52398, 57.6217, 57.71941, 57.81712, 57.91484, 58.01255, 58.11027,
    58.20798, 58.30569, 58.40341, 58.50112, 58.59884, 58.69655, 58.79427,
    58.89198, 58.98969, 59.08741, 59.18512, 59.28284, 59.38055, 59.47826,
    59.57598, 59.67369, 59.77141, 59.86912, 59.96684, 60.06455, 60.16226,
    60.25998, 60.35769, 60.45541, 60.55312, 60.65083, 60.74855, 60.84626,
    60.94398, 61.04169, 61.1394, 61.23712, 61.33483, 61.43255, 61.53026,
    61.62798, 61.72569, 61.8234, 61.92112, 62.01883, 62.11655, 62.21426,
    62.31197, 62.40969, 62.5074, 62.60511, 62.70283, 62.80054, 62.89826,
    62.99597, 63.09369, 63.1914, 63.28911, 63.38683, 63.48454, 63.58226,
    63.67997, 63.77768, 63.8754, 63.97311, 64.07082, 64.16854, 64.26625,
    64.36397, 64.46169, 64.55939, 64.65711, 64.75482, 64.85254, 64.95026,
    65.04797, 65.14568, 65.24339, 65.34111, 65.43882, 65.53654, 65.63425,
    65.73196, 65.82968, 65.92739, 66.02511, 66.12282, 66.22054, 66.31825,
    66.41596, 66.51368, 66.61139, 66.70911, 66.80682, 66.90453, 67.00224,
    67.09996, 67.19768, 67.29539, 67.3931, 67.49081, 67.58853, 67.68625,
    67.78396, 67.88168, 67.97939, 68.0771, 68.17482, 68.27253, 68.37024,
    68.46796, 68.56567, 68.66339, 68.7611, 68.85882, 68.95653, 69.05424,
    69.15196, 69.24967, 69.34738, 69.4451, 69.54282, 69.64053, 69.73824,
    69.83595, 69.93367, 70.03139, 70.1291, 70.22681, 70.32452, 70.42224,
    70.51996, 70.61767, 70.71539, 70.8131, 70.91081, 71.00852, 71.10624,
    71.20395, 71.30167, 71.39938, 71.49709, 71.59481, 71.69252, 71.79024,
    71.88795, 71.98566, 72.08338, 72.18109, 72.27881, 72.37652, 72.47424,
    72.57195, 72.66966, 72.76738, 72.8651, 72.96281, 73.06052, 73.15823,
    73.25595, 73.35366, 73.45138, 73.54909, 73.6468, 73.74452, 73.84223,
    73.93994, 74.03766, 74.13538, 74.23309, 74.3308, 74.42852, 74.52623,
    74.62395, 74.72166, 74.81937, 74.91708, 75.0148, 75.11252, 75.21023,
    75.30795, 75.40565, 75.50337, 75.60109, 75.6988, 75.79652, 75.89423,
    75.99194, 76.08966, 76.18737, 76.28508, 76.3828, 76.48051, 76.57822,
    76.67594, 76.77365];
const mask_lat = [
    1.7556, 1.853264, 1.950928, 2.048576, 2.146225, 2.243866, 2.341507,
    2.439133, 2.536758, 2.634377, 2.731979, 2.829575, 2.927162, 3.02475,
    3.122322, 3.219887, 3.317444, 3.414986, 3.512527, 3.610046, 3.707558,
    3.805061, 3.902565, 4.000046, 4.097519, 4.194969, 4.292419, 4.389847,
    4.487274, 4.584679, 4.682076, 4.779457, 4.876823, 4.974174, 5.071518,
    5.168839, 5.266151, 5.363434, 5.460716, 5.557991, 5.655228, 5.752457,
    5.849678, 5.946869, 6.044052, 6.141212, 6.238358, 6.33548, 6.432587,
    6.529686, 6.626755, 6.723808, 6.820839, 6.917854, 7.014839, 7.111809,
    7.208763, 7.305695, 7.402603, 7.499496, 7.596359, 7.693207, 7.790031,
    7.886833, 7.983612, 8.08036, 8.177101, 8.273811, 8.370491, 8.467155,
    8.563789, 8.6604, 8.756989, 8.853554, 8.950096, 9.0466, 9.143097,
    9.239548, 9.335983, 9.432388, 9.528763, 9.625122, 9.721443, 9.817741,
    9.914009, 10.01025, 10.10646, 10.20264, 10.29881, 10.39492, 10.49102,
    10.58709, 10.68312, 10.77913, 10.8751, 10.97105, 11.06696, 11.16284,
    11.25869, 11.35451, 11.45029, 11.54605, 11.64177, 11.73745, 11.83311,
    11.92873, 12.02432, 12.11987, 12.21539, 12.31087, 12.40633, 12.50174,
    12.59711, 12.69246, 12.78777, 12.88304, 12.97828, 13.07348, 13.16863,
    13.26376, 13.35885, 13.4539, 13.54892, 13.64389, 13.73883, 13.83373,
    13.92859, 14.02341, 14.11819, 14.21294, 14.30764, 14.40231, 14.49693,
    14.59151, 14.68605, 14.78056, 14.87502, 14.96944, 15.0638, 15.15814,
    15.25243, 15.34669, 15.4409, 15.53506, 15.62918, 15.72327, 15.8173,
    15.91129, 16.00525, 16.09915, 16.19301, 16.28682, 16.38058, 16.47432,
    16.56799, 16.66164, 16.75523, 16.84876, 16.94226, 17.03571, 17.1291,
    17.22247, 17.31577, 17.40903, 17.50225, 17.59542, 17.68854, 17.78161,
    17.87463, 17.9676, 18.06052, 18.1534, 18.24623, 18.339, 18.43173,
    18.52441, 18.61703, 18.70961, 18.80213, 18.89461, 18.98703, 19.07941,
    19.17172, 19.26399, 19.35621, 19.44838, 19.54049, 19.63255, 19.72456,
    19.81651, 19.90841, 20.00026, 20.09206, 20.18379, 20.27548, 20.36712,
    20.45869, 20.55021, 20.64169, 20.73309, 20.82445, 20.91576, 21.007,
    21.0982, 21.18933, 21.28041, 21.37143, 21.46239, 21.55331, 21.64417,
    21.73495, 21.8257, 21.91638, 22.007, 22.09757, 22.18807, 22.27853,
    22.36891, 22.45924, 22.54951, 22.63974, 22.72989, 22.81998, 22.91002,
    22.99999, 23.08991, 23.17976, 23.26956, 23.35931, 23.44897, 23.53859,
    23.62814, 23.71763, 23.80707, 23.89643, 23.98574, 24.07499, 24.16417,
    24.25329, 24.34235, 24.43134, 24.52028, 24.60915, 24.69795, 24.78669,
    24.87537, 24.96399, 25.05255, 25.14104, 25.22946, 25.31782, 25.40612,
    25.49435, 25.58252, 25.67062, 25.75865, 25.84663, 25.93453, 26.02238,
    26.11015, 26.19786, 26.28551, 26.37309, 26.46059, 26.54803, 26.63542,
    26.72272, 26.80997, 26.89715, 26.98425, 27.0713, 27.15827, 27.24518,
    27.33202, 27.41879, 27.50549, 27.59212, 27.6787, 27.7652, 27.85163,
    27.93799, 28.02427, 28.1105, 28.19665, 28.28274, 28.36874, 28.4547,
    28.54057, 28.62638, 28.71211, 28.79778, 28.88337, 28.96889, 29.05434,
    29.13972, 29.22503, 29.31027, 29.39545, 29.48055, 29.56557, 29.65052,
    29.73541, 29.82023, 29.90496, 29.98963, 30.07423, 30.15874, 30.24319,
    30.32758, 30.41189, 30.49612, 30.58028, 30.66437, 30.74838, 30.83232,
    30.91618, 30.99998, 31.0837, 31.16734, 31.25092, 31.33443, 31.41785,
    31.50119, 31.58448, 31.66767, 31.75081, 31.83386, 31.91683, 31.99974,
    32.08257, 32.16531, 32.248, 32.3306, 32.41313, 32.49558, 32.57796,
    32.66026, 32.74249, 32.82464, 32.90672, 32.98871, 33.07063, 33.15248,
    33.23425, 33.31594, 33.39757, 33.4791, 33.56056, 33.64195, 33.72327,
    33.8045, 33.88565, 33.96674, 34.04773, 34.12865, 34.20951, 34.29027,
    34.37096, 34.45158, 34.53211, 34.61257, 34.69296, 34.77326, 34.85349,
    34.93363, 35.01369, 35.09369, 35.17361, 35.25343, 35.33318, 35.41286,
    35.49246, 35.57198, 35.65142, 35.73078, 35.81006, 35.88927, 35.96839,
    36.04743, 36.1264, 36.20528, 36.2841, 36.36282, 36.44147, 36.52003,
    36.59852, 36.67693, 36.75526, 36.8335, 36.91168, 36.98977, 37.06776,
    37.1457, 37.22355, 37.30132, 37.37901, 37.45661, 37.53413, 37.61159,
    37.68894, 37.76624, 37.84344, 37.92056, 37.9976, 38.07457, 38.15144,
    38.22824, 38.30496, 38.38161, 38.45816, 38.53464, 38.61102, 38.68735,
    38.76358, 38.83972, 38.9158, 38.99178, 39.06769, 39.14351, 39.21925,
    39.29491, 39.3705, 39.446, 39.52142, 39.59674, 39.672, 39.74716,
    39.82227, 39.89726, 39.9722, 40.04703, 40.1218, 40.19647, 40.27107,
    40.34558, 40.42001, 40.49437, 40.56862, 40.64281, 40.71692, 40.79094,
    40.86487, 40.93874, 41.0125, 41.0862, 41.15981, 41.23332, 41.30678,
    41.38013
];