# SET ENVIRONMENT VARIABLE PROCESSING_DIR TO THE DIRECTORY WHERE processing-py.jar EXISTS

gameoflife:
	java -jar ${PROCESSING_DIR}/processing-py.jar py/gameoflife_processing.py

bubbles:
	java -jar ${PROCESSING_DIR}/processing-py.jar py/bubbles_processing.py

line_growth:
	java -jar ${PROCESSING_DIR}/processing-py.jar py/line_growth_processing.py

rotating_squares:
	java -jar ${PROCESSING_DIR}/processing-py.jar py/rotating_squares_processing.py

waves:
	java -jar ${PROCESSING_DIR}/processing-py.jar py/waves_processing.py
