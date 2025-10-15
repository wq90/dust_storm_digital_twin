RUN the project with the following command:
gunicorn -w 4 -b 0.0.0.0:5000 'duststorm:create_app()'
   
Note #1:
The shell script used to run the model on the KAUST supercomputing system is not included in this repository, as it contains environment-specific configurations and sensitive information. This script is solely used for file transfer, job submission and system setup, and is not related to the main methodological contributions of the paper. Accordingly, it has been removed from the submit() function. It does not affect the core methods, results, or reproducibility of the study.

#2:
All the visualizations in this project are fully data-driven and generated dynamically based on the implemented framework. The related datasets should be indexed and stored in the data/ folder within the project structure.

Because the data volume is too large (for example, the case study discussed in the paper used 185.4 GB of data), the datasets are not included in this repository. Without the data, the framework will run but will display only a blank white page instead of the visualizations.

The datasets used in this study can be provided upon reasonable request to the corresponding authors.
