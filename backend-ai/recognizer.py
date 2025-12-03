import cv2
import os
import numpy as np
import base64
import tempfile
from config import DATASET_DIR, TRAINING_MODEL, HAAR_FACE

class FaceProctor:
    """
    Kelas utama untuk menjalankan Face Recognition Proctoring menggunakan LBPH dan Haar Cascade.
    Logika diperkuat untuk Anti-Intruder, yang mendeteksi dan menandai lebih dari satu wajah.
    """
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(HAAR_FACE)
        if self.face_cascade.empty():
            raise Exception(f"ERROR: haarcascade_frontalface_default.xml not found at {HAAR_FACE} or corrupted!")

        self.recognizer = cv2.face.LBPHFaceRecognizer_create(
            radius=2,
            neighbors=8,
            grid_x=8,
            grid_y=8,
            threshold=65.0
        )

        self.label_map = self._get_current_label_map()

        if os.path.exists(TRAINING_MODEL):
            try:
                self.recognizer.read(TRAINING_MODEL)
                print(f"[AI-PROCTOR] Model loaded successfully: {TRAINING_MODEL} for {len(self.label_map)} user(s).")
            except Exception as e:
                print(f"[AI-PROCTOR] Existing model corrupted ({e}). A new one will be created after training.")
        else:
            print("[AI-PROCTOR] No trained model found. It will be created after training.")

        os.makedirs(DATASET_DIR, exist_ok=True)

    def _get_current_label_map(self):
        label_map = {}
        lid = 0
        for uf in sorted(os.listdir(DATASET_DIR)):
            if os.path.isdir(os.path.join(DATASET_DIR, uf)):
                label_map[uf] = lid
                lid += 1
        return label_map

    def enroll(self, user_id: str, video_b64: str) -> tuple[bool, int]:
        folder = os.path.join(DATASET_DIR, user_id)
        os.makedirs(folder, exist_ok=True)

        total_samples = 0
        try:
            if ',' in video_b64:
                video_b64 = video_b64.split(',')[1]
            video_bytes = base64.b64decode(video_b64)
            img = cv2.imdecode(np.frombuffer(video_bytes, np.uint8), cv2.IMREAD_COLOR)

            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))
                if len(faces) > 0:
                    x, y, w, h = faces[0]
                    face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
                    current_files = [f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                    filename = os.path.join(folder, f"{user_id}_{len(current_files)+1:04d}.jpg")
                    cv2.imwrite(filename, face_roi)
        except Exception:
            pass

        total_samples = len([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        MIN_SAMPLES = 30

        if total_samples >= MIN_SAMPLES:
            print(f"Sufficient data collected ({total_samples} samples). Starting model training...")
            success = self.train_model()
            return success, total_samples
        else:
            print(f"Insufficient data collected: only {total_samples} images found. Need at least {MIN_SAMPLES}.")
            return False, total_samples

    def train_model(self) -> bool:
        faces = []
        labels = []

        self.label_map = self._get_current_label_map()
        print("[AI-PROCTOR] Starting model training with all registered users...")

        for user_folder, label_id in self.label_map.items():
            folder_path = os.path.join(DATASET_DIR, user_folder)
            for filename in os.listdir(folder_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(folder_path, filename)
                    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                    if img is not None:
                        img = cv2.resize(img, (200, 200))
                        faces.append(img)
                        labels.append(label_id)

        if len(faces) < 1:
            print(f"[ERROR] Insufficient training data: only {len(faces)} images found. Need at least 1.")
            return False

        try:
            self.recognizer.train(faces, np.array(labels))
            self.recognizer.write(TRAINING_MODEL)
            print(f"[AI-PROCTOR] Training successful! Model saved with {len(faces)} images from {len(self.label_map)} user(s).")
            return True
        except Exception as e:
            print(f"[ERROR] Training failed: {e}")
            return False

    def verify(self, image_b64: str, user_id: str) -> dict:
        try:
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]
            img_bytes = base64.b64decode(image_b64)
        except Exception:
            return {"error": "Invalid image format or decoding failed"}

        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return {"error": "Failed to decode image from bytes"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))

        bboxes = []
        valid_user_count = 0
        intruder_count = 0

        expected_label = self._get_current_label_map().get(user_id, -1)
        CONFIDENCE_THRESHOLD_LBPH = 65

        for (x, y, w, h) in faces:
            face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
            try:
                label, confidence = self.recognizer.predict(face_roi)
                confidence = float(confidence)
            except Exception:
                label = -1
                confidence = 999.0

            if label == expected_label and confidence < CONFIDENCE_THRESHOLD_LBPH:
                status = "user"
                valid_user_count += 1
                color = (0, 255, 0)
            else:
                status = "intruder"
                intruder_count += 1
                color = (0, 0, 255)

            cv2.rectangle(img, (x, y), (x+w, y+h), color, 3)
            cv2.putText(img, status.upper(), (x, y-10), cv2.FONT_HERSHEY_DUPLEX, 1.0, color, 2)
            cv2.putText(img, f"Conf: {confidence:.0f}", (x, y+h+30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

            bboxes.append({
                "x": int(x), "y": int(y), "w": int(w), "h": int(h),
                "label": status, "conf": round(confidence, 1)
            })

        if len(faces) == 0:
            overall = "warning"
        elif valid_user_count == 1 and intruder_count == 0:
            overall = "safe"
        elif intruder_count >= 1 or valid_user_count > 1:
            overall = "intruder"
        else:
            overall = "warning"

        _, buffer = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        preview = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"

        return {
            "bboxes": bboxes,
            "status": overall,
            "preview": preview
        }
