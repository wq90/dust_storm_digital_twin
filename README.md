Project Setup and Execution

This project is managed using Pipenv, a tool that integrates pip, virtualenv, and Pipfile into a unified environment management workflow. Installation and usage documentation for Pipenv is available at: https://pipenv.pypa.io/en/latest/

Running the Project

1. Enable in-project virtual environments (recommended):
    $ export PIPENV_VENV_IN_PROJECT=1
This ensures the virtual environment is created inside the project directory.
2. Install dependencies:
    $ pipenv install
3. Activate the virtual environment:
    $ pipenv shell
4. Start the application:
    $ gunicorn -c gunicorn.conf.py wsgi:app
   
Notes

Note #1: HPC Shell Script

The shell script used to execute the model on the KAUST supercomputing system is not included in this repository due to environment-specific configurations and sensitive information. The script handles file transfer and remote command execution only. As explained in Section 3.2 of the paper, this script can be replaced by equivalent workflows on any HPC infrastructure. Its absence does not affect the methods, results, or reproducibility of the framework.

Note #2: Data Requirements

All visualizations in this framework are fully data-driven and generated dynamically. Required datasets must be indexed and placed in:
    
    /duststorm/data/

Due to the large data volume used in the study (e.g., the case study generated over 160 GB of simulation data), the complete dataset is not distributed with this repository. The framework will run without the dataset, but the visualizations described in the paper will not appear.

The complete datasets used in this study can be provided upon reasonable request to the corresponding authors.
