# backend-ai/config.py
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
HAAR_FACE = os.path.join(BASE_DIR, "haarcascade_frontalface_default.xml")
HAAR_EYE = os.path.join(BASE_DIR, "haarcascade_eye.xml")
TRAINING_MODEL = os.path.join(BASE_DIR, "training.xml")
DB_PATH = os.path.join(BASE_DIR, "database.sqlite3")
