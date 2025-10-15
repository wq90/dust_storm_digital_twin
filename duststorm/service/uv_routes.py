from . import uv_data_bp
from netCDF4 import Dataset
from .dust_routes import dustfile
from flask import current_app

uvfile = "0/uvw_alllev.nc"
slpfile = "0/slp_gocart.nc"
geoptfile = "0/geopt_gocart.nc"

@uv_data_bp.route("/uv/<int:time_index>/<int:level_index>")
def uv_data(time_index=0, level_index=0):
    f = Dataset(f"{current_app.root_path}/data/{uvfile}")
    f2 = Dataset(f"{current_app.root_path}/data/0/{dustfile}")
    uv_time = f.variables["time"][:].tolist()
    dust_time = f2.variables["time"][:].tolist()
    if dust_time[time_index] in uv_time:
        i = uv_time.index(dust_time[time_index])
        u = f.variables["u"][i, level_index, :, :].tolist()
        v = f.variables["v"][i, level_index, :, :].tolist()
        f.close()
        f2.close()
        return [u, v]
    else:
        f.close()
        f2.close()
        return []

@uv_data_bp.route("/contour/<name>/<int:time_index>")
def contour_data(name="slp", time_index=0):
    f = Dataset(f"{current_app.root_path}/data/{slpfile}")
    if name == "geopt":
        f = Dataset(f"{current_app.root_path}/data/{geoptfile}")
    contour = f.variables[name][time_index, 0, :, :]
    f.close()
    return contour.tolist()
