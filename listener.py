"""
ORION High-Frequency Telemetry Engine - Entrypoint Wrapper.
Imports and executes the core unified service from engine.py.
"""
import multiprocessing
from engine import main

if __name__ == '__main__':
    # Required for Windows multiprocessing compatibility
    multiprocessing.freeze_support()
    main()
