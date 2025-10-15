from flask import Flask, render_template
import os
def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    @app.route('/')
    def index():
        return render_template('dust.html')
    
    from .service import dust_data_bp, uv_data_bp, rf_data_bp, mask_bp
    app.register_blueprint(dust_data_bp)
    app.register_blueprint(uv_data_bp)
    app.register_blueprint(rf_data_bp)
    app.register_blueprint(mask_bp)

    return app