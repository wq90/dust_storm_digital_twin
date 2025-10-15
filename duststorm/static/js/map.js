var MAP, LatLngBounds;
const LEVEL_FACTOR = 5, WIND_LENGTH = 10, WIND_HEIGHT = 5;
const colorGradientforLatLon = d3.interpolateYlOrBr;
const colorGradientforWind = d3.interpolateRdYlBu;
const colorGradientforSlp = d3.interpolatePurples;
var TIME_INDEX = 264, LEVEL_INDEX = 0;
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
var WIND_LAT = [7.568912, 7.6100917, 7.6512637, 7.692443, 7.7336087, 7.7747674, 7.8159328, 7.8570848, 7.8982434, 7.9393888, 7.9805336, 8.021679, 8.06281, 8.103941, 8.145073, 8.186191, 8.227308, 8.268426, 8.30953, 8.350641, 8.391738, 8.432842, 8.473933, 8.515023, 8.556107, 8.597183, 8.63826, 8.6793375, 8.7204, 8.761463, 8.80252, 8.8435755, 8.884619, 8.925661, 8.966703, 9.007739, 9.048768, 9.089797, 9.130813, 9.171828, 9.212843, 9.253844, 9.294847, 9.335848, 9.376836, 9.417824, 9.458805, 9.49978, 9.540753, 9.581721, 9.622682, 9.663642, 9.704589, 9.7455435, 9.786476, 9.827423, 9.86835, 9.909276, 9.950203, 9.991116, 10.032028, 10.072934, 10.113841, 10.154733, 10.195625, 10.236511, 10.27739, 10.318268, 10.359133, 10.399999, 10.440856, 10.481714, 10.522559, 10.563404, 10.604241, 10.645072, 10.685903, 10.72672, 10.767537, 10.808354, 10.849158, 10.889948, 10.930745, 10.971535, 11.012318, 11.053094, 11.0938635, 11.134633, 11.175388, 11.216145, 11.256893, 11.297635, 11.33837, 11.379099, 11.419827, 11.460542, 11.501257, 11.541965, 11.582665, 11.62336, 11.664047, 11.704728, 11.745409, 11.786082, 11.82675, 11.86741, 11.908063, 11.9487095, 11.989349, 12.029982, 12.070615, 12.11124, 12.151853, 12.192465, 12.23307, 12.273663, 12.314261, 12.354846, 12.395424, 12.435995, 12.476567, 12.517124, 12.557675, 12.598227, 12.638763, 12.679294, 12.719824, 12.760347, 12.800864, 12.841367, 12.88187, 12.922373, 12.962855, 13.0033455, 13.04382, 13.084283, 13.124745, 13.165207, 13.205655, 13.246097, 13.286531, 13.32696, 13.36738, 13.407795, 13.448209, 13.488609, 13.529003, 13.56939, 13.60977, 13.65015, 13.690516, 13.730876, 13.771229, 13.811575, 13.851914, 13.892253, 13.932571, 13.972891, 14.013203, 14.053507, 14.093805, 14.134096, 14.174381, 14.214652, 14.254923, 14.295187, 14.3354435, 14.375688, 14.415931, 14.456161, 14.49639, 14.536607, 14.576816, 14.617019, 14.657214, 14.697403, 14.737585, 14.77776, 14.817922, 14.858083, 14.898237, 14.938378, 14.978513, 15.018647, 15.058767, 15.098881, 15.1389885, 15.179089, 15.219174, 15.259261, 15.299334, 15.339406, 15.379465, 15.4195175, 15.459563, 15.499601, 15.539634, 15.579652, 15.61967, 15.659674, 15.699672, 15.739662, 15.779646, 15.819616, 15.859587, 15.89955, 15.9395, 15.979436, 16.019373, 16.059301, 16.099224, 16.139133, 16.179035, 16.21893, 16.258818, 16.2987, 16.338568, 16.378428, 16.418282, 16.45813, 16.49797, 16.537798, 16.577618, 16.61743, 16.657236, 16.697037, 16.736822, 16.776608, 16.81638, 16.856138, 16.89589, 16.935642, 16.97538, 17.015112, 17.054836, 17.094545, 17.13425, 17.173946, 17.21363, 17.253313, 17.29299, 17.332647, 17.372303, 17.411945, 17.45158, 17.491209, 17.530832, 17.57044, 17.61004, 17.649635, 17.689224, 17.728798, 17.768358, 17.807926, 17.847471, 17.887012, 17.926546, 17.966064, 18.005577, 18.04509, 18.084581, 18.124067, 18.163546, 18.203018, 18.242476, 18.281933, 18.321371, 18.36081, 18.400232, 18.43965, 18.479053, 18.51845, 18.557838, 18.597221, 18.636591, 18.675953, 18.71531, 18.754644, 18.79398, 18.833307, 18.872622, 18.91193, 18.951223, 18.99051, 19.02979, 19.069065, 19.108324, 19.147572, 19.186811, 19.226044, 19.265268, 19.304482, 19.343687, 19.382877, 19.422062, 19.461248, 19.500412, 19.539562, 19.578712, 19.61785, 19.65698, 19.696096, 19.735207, 19.774303, 19.813393, 19.852474, 19.891542, 19.930605, 19.96966, 20.008701, 20.04773, 20.086756, 20.125763, 20.16477, 20.203764, 20.242744, 20.281717, 20.320684, 20.359636, 20.398575, 20.437513, 20.476439, 20.51535, 20.554255, 20.593153, 20.632038, 20.670908, 20.70978, 20.748636, 20.787472, 20.826315, 20.865139, 20.903954, 20.942757, 20.981552, 21.020334, 21.059109, 21.097878, 21.136631, 21.175379, 21.214113, 21.252834, 21.291548, 21.330254, 21.368946, 21.407625, 21.446299, 21.484964, 21.523617, 21.562262, 21.600893, 21.639511, 21.678122, 21.716719, 21.75531, 21.793894, 21.832464, 21.871027, 21.909576, 21.948112, 21.98664, 22.025158, 22.063665, 22.102161, 22.140648, 22.179123, 22.21759, 22.256044, 22.294493, 22.332926, 22.371346, 22.409758, 22.448158, 22.48655, 22.52493, 22.563301, 22.60166, 22.64001, 22.67834, 22.716673, 22.75499, 22.793293, 22.831583, 22.869873, 22.908144, 22.946405, 22.984661, 23.022898, 23.061127, 23.099348, 23.137556, 23.175756, 23.213945, 23.25212, 23.29028, 23.328432, 23.36658, 23.404713, 23.442831, 23.480936, 23.519035, 23.557127, 23.595205, 23.63327, 23.671322, 23.709366, 23.747396, 23.78542, 23.82343, 23.861425, 23.899416, 23.937391, 23.97536, 24.013315, 24.051258, 24.089186, 24.127108, 24.165022, 24.202915, 24.240803, 24.278683, 24.31655, 24.354395, 24.39224, 24.430067, 24.467892, 24.505697, 24.543495, 24.58128, 24.619051, 24.656809, 24.694565, 24.73231, 24.770039, 24.807756, 24.845459, 24.883146, 24.920835, 24.958498, 24.996159, 25.033808, 25.071442, 25.109062, 25.146683, 25.184277, 25.22187, 25.259449, 25.297016, 25.334568, 25.372107, 25.409645, 25.44717, 25.484669, 25.522165, 25.55965, 25.59712, 25.634577, 25.672033, 25.709476, 25.746893, 25.78431, 25.82171, 25.859098, 25.896488, 25.93385, 25.97121, 26.008543, 26.045877, 26.083199, 26.120504, 26.157797, 26.19509, 26.232355, 26.26962, 26.306873, 26.344097, 26.38132, 26.418533, 26.45573, 26.492928, 26.530096, 26.567266, 26.60441, 26.641552, 26.67868, 26.715796, 26.752897, 26.789986, 26.827074, 26.864134, 26.901196, 26.938242, 26.975262, 27.012281, 27.049288, 27.086279, 27.123272, 27.160236, 27.197187, 27.234138, 27.271076, 27.307987, 27.344898, 27.381794, 27.418676, 27.455547, 27.492416, 27.529259, 27.566086, 27.602915, 27.639715, 27.676517, 27.713305, 27.750078, 27.786839, 27.823584, 27.860317, 27.89705, 27.933756, 27.970448, 28.00714, 28.043804, 28.080467, 28.117119, 28.153755, 28.19038, 28.22699, 28.263586, 28.300167, 28.336737, 28.373306, 28.409847, 28.446388, 28.482903, 28.519417, 28.555918, 28.59239, 28.628864, 28.665323, 28.701769, 28.738201, 28.774633, 28.811039, 28.84743, 28.883821, 28.920185, 28.956535, 28.992886, 29.029222, 29.06553, 29.101841, 29.138136, 29.174417, 29.210686, 29.24694, 29.283182, 29.31941, 29.355623, 29.391823, 29.428022, 29.464195, 29.500368, 29.536514, 29.572659, 29.608778, 29.644896, 29.680986, 29.717077, 29.753153, 29.789217, 29.825268, 29.86129, 29.897326, 29.933334, 29.96933, 30.00531, 30.041279, 30.077232, 30.113173, 30.149113, 30.185026, 30.220926, 30.256826, 30.292698, 30.32857, 30.364414, 30.400259, 30.436077, 30.471895, 30.507698, 30.54349, 30.579266, 30.615015, 30.650763, 30.686499, 30.722221, 30.757929, 30.793623, 30.829304, 30.864971, 30.900625, 30.936266, 30.971891, 31.007504, 31.043102, 31.078688, 31.114273, 31.149832, 31.185375, 31.220907, 31.256437, 31.29194, 31.32743, 31.36292, 31.398382, 31.43383, 31.46928, 31.504702, 31.540123, 31.575516, 31.61091, 31.646276, 31.681644, 31.716984, 31.752323, 31.78765, 31.822947, 31.858246, 31.893517, 31.928787, 31.964031, 31.999275, 32.034504, 32.06971, 32.10491, 32.1401, 32.175262, 32.210423, 32.24557, 32.280693, 32.315815, 32.35092, 32.386013, 32.42108, 32.456146, 32.4912, 32.526222, 32.56125, 32.59625, 32.631245, 32.66623, 32.7012, 32.73614, 32.771088, 32.806015, 32.84092, 32.87582, 32.91071, 32.945583, 32.98043, 33.015278, 33.050114, 33.08492, 33.119728, 33.154507, 33.189285, 33.224052, 33.25879, 33.293526, 33.32824, 33.36295, 33.397633, 33.432316, 33.466972, 33.50163, 33.53626, 33.57089, 33.605488, 33.64009, 33.674667, 33.709225, 33.743786, 33.77832, 33.812855, 33.84736, 33.88185, 33.916344, 33.95081, 33.98526, 34.0197, 34.05414, 34.088547, 34.122944, 34.15733, 34.191696, 34.22605, 34.260395, 34.294724, 34.32904, 34.36334, 34.39763, 34.4319, 34.46616, 34.50041, 34.53464, 34.56886, 34.603054, 34.637245, 34.67142, 34.705574, 34.739723, 34.77386, 34.807972, 34.842083, 34.876163, 34.910248, 34.9443, 34.97836, 35.012386, 35.0464, 35.080414, 35.114403, 35.148373, 35.182346, 35.216293, 35.250214, 35.284145, 35.31805, 35.35194, 35.38582, 35.41968, 35.453533, 35.48736, 35.52118, 35.55499, 35.588783, 35.622555, 35.656322, 35.690075, 35.723804, 35.75752, 35.791233, 35.824917, 35.858593, 35.892265, 35.92591, 35.95954, 35.99316, 36.026764, 36.060368, 36.093945, 36.12751, 36.16106, 36.19458, 36.228104, 36.261612, 36.29511, 36.328575, 36.362045, 36.395485, 36.428925, 36.462337, 36.49575, 36.529137, 36.56251, 36.59587, 36.629227, 36.66256, 36.695877, 36.72918, 36.76247, 36.795746, 36.829, 36.862247, 36.89548, 36.92869, 36.9619, 36.99508, 37.02826, 37.061428, 37.09457, 37.127693, 37.16081, 37.193905, 37.227005, 37.260063, 37.29312, 37.32618, 37.359196, 37.392216, 37.425217, 37.458195, 37.49117, 37.52413, 37.557068, 37.58999, 37.62291, 37.655804, 37.688686, 37.721554];
var WIND_LON = [26.656292, 26.697836, 26.73938, 26.780924, 26.82247, 26.864014, 26.905558, 26.947102, 26.988646, 27.030191, 27.071735, 27.11328, 27.154823, 27.19637, 27.237913, 27.279457, 27.321001, 27.362547, 27.40409, 27.445635, 27.487179, 27.528725, 27.570269, 27.611813, 27.653357, 27.6949, 27.736446, 27.77799, 27.819534, 27.861078, 27.902624, 27.944168, 27.985712, 28.027256, 28.068802, 28.110346, 28.15189, 28.193434, 28.23498, 28.276524, 28.318068, 28.359612, 28.401155, 28.442701, 28.484245, 28.52579, 28.567333, 28.60888, 28.650423, 28.691967, 28.733511, 28.775057, 28.8166, 28.858145, 28.899689, 28.941233, 28.982779, 29.024323, 29.065866, 29.10741, 29.148956, 29.1905, 29.232044, 29.273588, 29.315134, 29.356678, 29.398222, 29.439766, 29.481312, 29.522856, 29.5644, 29.605944, 29.647488, 29.689034, 29.730577, 29.772121, 29.813665, 29.855211, 29.896755, 29.9383, 29.979843, 30.021389, 30.062933, 30.104477, 30.14602, 30.187567, 30.22911, 30.270655, 30.312199, 30.353743, 30.395288, 30.436832, 30.478376, 30.51992, 30.561466, 30.60301, 30.644554, 30.686098, 30.727644, 30.769188, 30.810732, 30.852276, 30.893822, 30.935366, 30.97691, 31.018454, 31.059998, 31.101543, 31.143087, 31.184631, 31.226175, 31.267721, 31.309265, 31.35081, 31.392353, 31.433899, 31.475443, 31.516987, 31.55853, 31.600075, 31.64162, 31.683165, 31.724709, 31.766253, 31.807798, 31.849342, 31.890886, 31.93243, 31.973976, 32.01552, 32.057064, 32.09861, 32.140152, 32.181698, 32.223244, 32.264786, 32.30633, 32.347874, 32.38942, 32.430965, 32.472507, 32.514053, 32.555595, 32.59714, 32.638687, 32.68023, 32.721775, 32.76332, 32.804863, 32.84641, 32.88795, 32.929497, 32.971043, 33.012585, 33.05413, 33.095673, 33.13722, 33.178764, 33.220306, 33.261852, 33.3034, 33.34494, 33.386486, 33.42803, 33.469574, 33.51112, 33.55266, 33.594208, 33.63575, 33.677296, 33.71884, 33.760384, 33.80193, 33.843475, 33.885017, 33.926563, 33.968105, 34.00965, 34.051197, 34.09274, 34.134285, 34.17583, 34.217373, 34.25892, 34.30046, 34.342007, 34.383553, 34.425095, 34.46664, 34.508183, 34.54973, 34.591274, 34.632816, 34.674362, 34.715908, 34.75745, 34.798996, 34.840538, 34.882084, 34.92363, 34.96517, 35.006718, 35.04826, 35.089806, 35.13135, 35.172894, 35.21444, 35.255985, 35.297527, 35.339073, 35.380615, 35.42216, 35.463707, 35.50525, 35.546795, 35.588337, 35.629883, 35.67143, 35.71297, 35.754517, 35.796062, 35.837605, 35.87915, 35.920692, 35.96224, 36.003784, 36.045326, 36.086872, 36.128418, 36.16996, 36.211506, 36.253048, 36.294594, 36.33614, 36.37768, 36.419228, 36.46077, 36.502316, 36.54386, 36.585403, 36.62695, 36.668495, 36.710037, 36.751583, 36.793125, 36.83467, 36.876217, 36.91776, 36.959305, 37.000847, 37.042393, 37.08394, 37.12548, 37.167027, 37.208572, 37.250114, 37.29166, 37.333202, 37.37475, 37.416294, 37.457836, 37.499382, 37.540928, 37.58247, 37.624016, 37.665558, 37.707104, 37.74865, 37.79019, 37.831738, 37.87328, 37.914825, 37.95637, 37.997913, 38.03946, 38.081005, 38.122547, 38.164093, 38.205635, 38.24718, 38.288727, 38.33027, 38.371815, 38.413357, 38.454903, 38.49645, 38.53799, 38.579536, 38.621082, 38.662624, 38.70417, 38.745712, 38.78726, 38.828804, 38.870346, 38.911892, 38.953434, 38.99498, 39.036526, 39.078068, 39.119614, 39.16116, 39.2027, 39.244247, 39.28579, 39.327335, 39.36888, 39.410423, 39.45197, 39.493515, 39.535057, 39.576603, 39.618145, 39.65969, 39.701237, 39.74278, 39.784325, 39.825867, 39.867413, 39.90896, 39.9505, 39.992046, 40.033592, 40.075134, 40.11668, 40.158222, 40.199768, 40.241314, 40.282856, 40.3244, 40.365944, 40.40749, 40.449036, 40.490578, 40.532124, 40.57367, 40.61521, 40.656757, 40.6983, 40.739845, 40.78139, 40.822933, 40.86448, 40.90602, 40.947567, 40.989113, 41.030655, 41.0722, 41.113747, 41.15529, 41.196835, 41.238377, 41.279922, 41.32147, 41.36301, 41.404556, 41.446102, 41.487644, 41.52919, 41.570732, 41.612278, 41.653824, 41.695366, 41.73691, 41.778454, 41.82, 41.861546, 41.903088, 41.944633, 41.98618, 42.02772, 42.069267, 42.11081, 42.152355, 42.1939, 42.235443, 42.27699, 42.31853, 42.360077, 42.401623, 42.443165, 42.48471, 42.526257, 42.5678, 42.609344, 42.650887, 42.692432, 42.73398, 42.77552, 42.817066, 42.858612, 42.900154, 42.9417, 42.983242, 43.024788, 43.066334, 43.107876, 43.14942, 43.190964, 43.23251, 43.274055, 43.315598, 43.357143, 43.39869, 43.44023, 43.481777, 43.52332, 43.564865, 43.60641, 43.647953, 43.6895, 43.73104, 43.772587, 43.814133, 43.855675, 43.89722, 43.938766, 43.98031, 44.021854, 44.063396, 44.104942, 44.14649, 44.18803, 44.229576, 44.27112, 44.312664, 44.35421, 44.395752, 44.437298, 44.478844, 44.520386, 44.56193, 44.603474, 44.64502, 44.686565, 44.728107, 44.769653, 44.8112, 44.85274, 44.894287, 44.93583, 44.977375, 45.01892, 45.060463, 45.10201, 45.14355, 45.185097, 45.226643, 45.268185, 45.30973, 45.351276, 45.39282, 45.434364, 45.475906, 45.517452, 45.559, 45.60054, 45.642086, 45.683628, 45.725174, 45.76672, 45.80826, 45.849808, 45.891354, 45.932896, 45.97444, 46.015984, 46.05753, 46.099075, 46.140617, 46.182163, 46.223705, 46.26525, 46.306797, 46.34834, 46.389885, 46.43143, 46.472973, 46.51452, 46.55606, 46.597607, 46.639153, 46.680695, 46.72224, 46.763786, 46.80533, 46.846874, 46.888416, 46.929962, 46.971508, 47.01305, 47.054596, 47.096138, 47.137684, 47.17923, 47.22077, 47.262318, 47.303864, 47.345406, 47.38695, 47.428493, 47.47004, 47.511585, 47.553127, 47.594673, 47.636215, 47.67776, 47.719307, 47.76085, 47.802395, 47.84394, 47.885483, 47.92703, 47.96857, 48.010117, 48.051662, 48.093204, 48.13475, 48.176296, 48.21784, 48.259384, 48.300926, 48.342472, 48.384018, 48.42556, 48.467106, 48.508648, 48.550194, 48.59174, 48.63328, 48.674828, 48.716373, 48.757915, 48.79946, 48.841003, 48.88255, 48.924095, 48.965637, 49.007183, 49.048725, 49.09027, 49.131817, 49.17336, 49.214905, 49.25645, 49.297993, 49.33954, 49.38108, 49.422626, 49.464172, 49.505714, 49.54726, 49.588802, 49.63035, 49.671894, 49.713436, 49.754982, 49.796528, 49.83807, 49.879616, 49.921158, 49.962704, 50.00425, 50.04579, 50.087337, 50.128883, 50.170425, 50.21197, 50.253513, 50.29506, 50.336605, 50.378147, 50.419693, 50.461235, 50.50278, 50.544327, 50.58587, 50.627415, 50.66896, 50.710503, 50.75205, 50.79359, 50.835136, 50.876682, 50.918224, 50.95977, 51.001312, 51.04286, 51.084404, 51.125946, 51.167492, 51.209038, 51.25058, 51.292126, 51.333668, 51.375214, 51.41676, 51.4583, 51.499847, 51.54139, 51.582935, 51.62448, 51.666023, 51.70757, 51.749115, 51.790657, 51.832203, 51.873745, 51.91529, 51.956837, 51.99838, 52.039925, 52.08147, 52.123013, 52.16456, 52.2061, 52.247646, 52.289192, 52.330734, 52.37228, 52.413822, 52.455368, 52.496914, 52.538456, 52.58, 52.621548, 52.66309, 52.704636, 52.746178, 52.787724, 52.82927, 52.87081, 52.912357, 52.9539, 52.995445, 53.03699, 53.078533, 53.12008, 53.161625, 53.203167, 53.244713, 53.286255, 53.3278, 53.369347, 53.41089, 53.452435, 53.49398, 53.535522, 53.57707, 53.61861, 53.660156, 53.701702, 53.743244, 53.78479, 53.826332, 53.867878, 53.909424, 53.950966, 53.99251, 54.034058, 54.0756, 54.117146, 54.158688, 54.200233, 54.24178, 54.28332, 54.324867, 54.36641, 54.407955, 54.4495, 54.491043, 54.53259, 54.574135, 54.615677, 54.657223, 54.698765, 54.74031, 54.781857, 54.8234, 54.864944, 54.906487, 54.948032, 54.98958, 55.03112, 55.072666, 55.114212, 55.155754, 55.1973, 55.238842, 55.280388, 55.321934, 55.363476, 55.40502, 55.446568, 55.48811, 55.529655, 55.571198, 55.612743, 55.65429, 55.69583, 55.737377, 55.77892, 55.820465, 55.86201, 55.903553, 55.9451, 55.986645, 56.028187, 56.069733, 56.111275, 56.15282, 56.194366, 56.23591, 56.277454, 56.318996, 56.360542, 56.40209, 56.44363, 56.485176, 56.526722, 56.568264, 56.60981, 56.651352, 56.692898, 56.734444, 56.775986, 56.81753, 56.859074, 56.90062, 56.942165, 56.983707, 57.025253, 57.0668, 57.10834, 57.149887, 57.19143, 57.232975, 57.27452, 57.316063, 57.35761, 57.399155, 57.440697, 57.482243, 57.523785, 57.56533, 57.606876, 57.64842, 57.689964, 57.731506, 57.773052, 57.814598, 57.85614, 57.897686, 57.93923, 57.980774, 58.02232, 58.06386, 58.105408, 58.146954, 58.188496, 58.23004, 58.271584, 58.31313, 58.354675, 58.396217, 58.437763, 58.47931, 58.52085, 58.562397, 58.60394, 58.645485, 58.68703, 58.728573, 58.77012, 58.811665, 58.853207, 58.894753, 58.936295, 58.97784, 59.019386, 59.06093, 59.102474, 59.144016, 59.185562, 59.227108, 59.26865, 59.310196, 59.35174, 59.393284, 59.43483, 59.47637, 59.517918, 59.559464, 59.601006, 59.64255, 59.684093, 59.72564, 59.767185, 59.808727, 59.850273, 59.89182, 59.93336, 59.974907, 60.01645, 60.057995, 60.09954, 60.141083, 60.18263, 60.22417, 60.265717, 60.307262, 60.348804, 60.39035, 60.431896, 60.47344, 60.514984, 60.556526, 60.598072, 60.639618, 60.68116, 60.722706, 60.76425, 60.805794, 60.84734, 60.88888, 60.930428, 60.971973, 61.013515, 61.05506, 61.096603, 61.13815, 61.179695, 61.221237, 61.262783, 61.30433, 61.34587, 61.387417, 61.42896, 61.470505, 61.51205, 61.553593, 61.59514, 61.63668, 61.678226, 61.719772, 61.761314, 61.80286, 61.844406, 61.88595, 61.927494, 61.969036, 62.010582, 62.052128, 62.09367, 62.135216, 62.176758, 62.218304, 62.25985, 62.30139, 62.342937, 62.384483, 62.426025, 62.46757, 62.509113, 62.55066, 62.592205, 62.633747, 62.675293, 62.71684, 62.75838, 62.799927, 62.84147, 62.883015, 62.92456, 62.966103, 63.00765, 63.04919, 63.090736, 63.132282, 63.173824, 63.21537, 63.256916, 63.29846, 63.340004, 63.381546, 63.42309, 63.464638, 63.50618, 63.547726, 63.589268, 63.630814, 63.67236, 63.7139, 63.755447, 63.796993, 63.838535, 63.88008, 63.921623, 63.96317, 64.004715, 64.04626, 64.0878, 64.12935, 64.17089, 64.21243, 64.25398, 64.295525, 64.33707, 64.37862, 64.42016, 64.4617, 64.50325, 64.54479, 64.586334, 64.62788, 64.669426, 64.71097, 64.75251, 64.79406, 64.8356, 64.877144, 64.91869, 64.960236, 65.00178, 65.04333, 65.08487, 65.12641, 65.16795, 65.2095, 65.251045, 65.29259, 65.33414, 65.37568, 65.41722, 65.45877, 65.50031, 65.541855, 65.583405, 65.62495, 65.66649, 65.70803, 65.74958, 65.79112, 65.832664, 65.874214, 65.91576, 65.9573, 65.99885, 66.04039, 66.08193, 66.12348, 66.16502, 66.206566, 66.24811, 66.28966, 66.3312, 66.37274, 66.41429, 66.45583, 66.497375, 66.538925, 66.58047, 66.62201, 66.66356, 66.7051, 66.74664, 66.78819, 66.829735, 66.87128, 66.91282, 66.95437, 66.99591, 67.03745, 67.079, 67.120544, 67.16209, 67.203636, 67.24518, 67.28672, 67.32827, 67.36981, 67.411354, 67.452896, 67.494446, 67.53599, 67.57753, 67.61908, 67.66062, 67.70216, 67.74371];
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
    rf_lon = await d3.json('dust_lon_old');
    rf_lat = await d3.json('dust_lat_old');
    geo = composeGeoJoson(rf_lon, rf_lat);
    rf_proj = d3.geoMercator();
    rf_proj.fitWidth(LNG.length, geo);
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
let rfv;
async function renderRF(rf_switch = false) {
    console.log('rf');
    if (!FINISHED_TASK.includes(CURR_TERRIAN_TASK) || !rf_switch) {
        if (!d3.select('#rf_svg').empty()) {
            d3.select('#rf_svg').remove();
        }
        return;
    }
    let timeIndex = TIME_INDEX - 264;
    timeIndex = timeIndex < 0 ? 0 : timeIndex;
    let v = await d3.json(`rf/${timeIndex}`);
    rfv = v;
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