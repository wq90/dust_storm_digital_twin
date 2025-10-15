from . import dust_data_bp
from flask import current_app
from netCDF4 import num2date, Dataset
import numpy as np
dustfile = "tot_Dust_gocart.nc"
@dust_data_bp.route("/dust/<int:task_no>/<int:time_index>/<int:level_index>")
def dust_data(task_no=0, time_index=0, level_index=0):
    f = Dataset(f"{current_app.root_path}/data/{task_no}/{dustfile}")
    variable = "DUST"
    dust = f.variables[variable][time_index, level_index, :, :]
    f.close()
    return dust.tolist()

@dust_data_bp.route(
    "/dust/<int:task_no>/<int:level_index>/<int:x0>/<int:x1>/<int:y0>/<int:y1>"
)
def dust_data_xy(task_no=0, level_index=0, x0=0, x1=1, y0=0, y1=1):
    f = Dataset(f"{current_app.root_path}/data/{task_no}/{dustfile}")
    variable = "DUST"
    dust = f.variables[variable][:, level_index, y0:y1, x0:x1]
    f.close()
    dust_avg = np.mean(dust, axis=(1, 2))
    return dust_avg.tolist()

@dust_data_bp.route("/dust_at_lat/<int:task_no>/<int:time_index>/<int:lat_index>")
def dust_at_lat(task_no=0, time_index=0, lat_index=0):
    f = Dataset(f"{current_app.root_path}/data/{task_no}/{dustfile}")
    variable = "DUST"
    dust = f.variables[variable][time_index, :, lat_index, :]
    f.close()
    return dust.tolist()

@dust_data_bp.route("/dust_at_lon/<int:task_no>/<int:time_index>/<int:lon_index>")
def dust_at_lon(task_no=0, time_index=0, lon_index=0):
    f = Dataset(f"{current_app.root_path}/data/{task_no}/{dustfile}")
    variable = "DUST"
    dust = f.variables[variable][time_index, :, :, lon_index]
    f.close()
    return dust.tolist()

@dust_data_bp.route("/dust_time")
def dust_time():
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile}")
    time_var = f.variables["time"]
    time = num2date(time_var[:], time_var.units, only_use_cftime_datetimes=False)
    time = [str(t) for t in time]
    f.close()
    return time

@dust_data_bp.route("/dust_level")
def dust_level():
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile}")
    level = f.variables["lev_2"][:]
    f.close()
    return level.tolist()

@dust_data_bp.route("/dust_lon")
def dust_lon():
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile}")
    lon = f.variables["lon"][:]
    f.close()
    return lon.tolist()

@dust_data_bp.route("/dust_lat")
def dust_lat():
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile}")
    lat = f.variables["lat"][:]
    f.close()
    return lat.tolist()

@dust_data_bp.route("/dust_lon_old")
def dust_lon_old():
    dustfile_old = "tot_Dust_gocart_old.nc"
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile_old}")
    lon = f.variables["lon"][:]
    f.close()
    return lon.tolist()

@dust_data_bp.route("/dust_lat_old")
def dust_lat_old():
    dustfile_old = "tot_Dust_gocart_old.nc"
    f = Dataset(f"{current_app.root_path}/data/0/{dustfile_old}")
    lat = f.variables["lat"][:]
    f.close()
    return lat.tolist()

@dust_data_bp.route("/max_dust/<int:task_no>")
def dust_max(task_no=0):
    f = Dataset(f"{current_app.root_path}/data/{task_no}/{dustfile}")
    variable = "DUST"
    dust = f.variables[variable][:].max()
    f.close()
    return [dust]
