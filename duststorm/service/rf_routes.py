from . import rf_data_bp
from netCDF4 import Dataset
from flask import current_app

@rf_data_bp.route("/rf/<int:time_index>")
def rf(time_index=0, level_index=0):
    f = Dataset(f"{current_app.root_path}/data/Radiation_budget.nc")
    swb = f.variables["SWB"][time_index, 0, :, :]
    lwb = f.variables["LWB"][time_index, 0, :, :]
    netb = f.variables["NETB"][time_index, 0, :, :]
    swa = f.variables["SWATM"][time_index, 0, :, :]
    lwa = f.variables["LWATM"][time_index, 0, :, :]
    neta = f.variables["NETATM"][time_index, 0, :, :]
    f.close()
    return [
        swb.tolist(),
        lwb.tolist(),
        netb.tolist(),
        swa.tolist(),
        lwa.tolist(),
        neta.tolist(),
    ]
