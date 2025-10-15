from . import mask_bp
from flask import current_app, request, jsonify
from netCDF4 import Dataset
import shutil, os

Erosion = [-1, 0.1, 0, 0.5]
DATA_FILE = "local_storage_data.json"

@mask_bp.route("/mask", methods=["POST"])
def mask():
    data = request.get_json()
    taskno = data.get("task_no")
    indices = data.get("indices")
    copy_and_modify_netcdf(
        f"{current_app.root_path}/data/geo_em.d01_org.nc",
        f"{current_app.root_path}/data/{taskno}",
        "EROD",
        indices,
    )
    return "OK"

def copy_and_modify_netcdf(source, dest, variable_name, indices):
    os.makedirs(dest, exist_ok=True)
    shutil.copyfile(source, f"{dest}/mask.nc")
    with Dataset(f"{dest}/mask.nc", "r+") as ds:
        if variable_name not in ds.variables:
            raise ValueError(
                f"Variable '{variable_name}' not found in the NetCDF file."
            )
        var = ds.variables[variable_name]
        for i in indices:
            for j in i[1]:
                var[:, :, j[0], j[1]] = 0

@mask_bp.route("/finishedtasks/<int:no>")
def finished_task(no=0):
    taskno = []
    for i in range(no + 1):
        if os.path.isfile(f"{current_app.root_path}/data/{i}/tot_Dust_gocart.nc"):
            taskno.append(i)
    return taskno

@mask_bp.route("/submit", methods=["POST"])
def submit():
    data = request.json.get("data")
    with open(f"{current_app.root_path}/data/{DATA_FILE}", "w") as file:
        file.write(data)
    
    # Call the Shell script to transfer the mask file and start the simulation with Paramiko library
    # see the Note in the README.md for more details
    
    return jsonify({"status": "success"}), 200

@mask_bp.route("/tasks", methods=["GET"])
def tasks():
    if os.path.exists(f"{current_app.root_path}/data/{DATA_FILE}"):
        with open(f"{current_app.root_path}/data/{DATA_FILE}", "r") as file:
            data = file.read()
        return jsonify({"data": data}), 200
    return jsonify({"data": None}), 200
