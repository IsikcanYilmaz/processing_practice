# SET ENVIRONMENT VARIABLE PROCESSING_DIR TO THE DIRECTORY WHERE processing-py.jar EXISTS

gameoflife:
	java -jar ${PROCESSING_DIR}/processing-py.jar gameoflife_processing.py

bubbles:
	java -jar ${PROCESSING_DIR}/processing-py.jar bubbles_processing.py
