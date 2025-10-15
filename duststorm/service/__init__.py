from flask import Blueprint

dust_data_bp = Blueprint("dust_bp", __name__)
uv_data_bp = Blueprint("uv_bp", __name__)
rf_data_bp = Blueprint("rf_bp", __name__)
mask_bp = Blueprint("mask_bp", __name__)

from . import dust_routes, uv_routes, rf_routes, mask_routes