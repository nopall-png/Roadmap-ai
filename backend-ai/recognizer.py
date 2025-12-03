import cv2
import os
import numpy as np
import base64
import tempfile
from config import DATASET_DIR, TRAINING_MODEL, HAAR_FACE
try:
    from deepface import DeepFace
except Exception:
    DeepFace = None

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
        self.df_model = None
        self.user_embeddings = {}
        if DeepFace is not None:
            try:
                self.df_model = DeepFace.build_model('ArcFace')
            except Exception:
                self.df_model = None

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

        total = 0
        try:
            if ',' in video_b64:
                video_b64 = video_b64.split(',')[1]
            video_bytes = base64.b64decode(video_b64)
        except Exception:
            video_bytes = b""

        img = None
        try:
            img = cv2.imdecode(np.frombuffer(video_bytes, np.uint8), cv2.IMREAD_COLOR)
        except Exception:
            img = None

        if img is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))
            if len(faces) > 0:
                x, y, w, h = faces[0]
                face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
                filename = os.path.join(folder, f"{user_id}_{len(os.listdir(folder))+1:04d}.jpg")
                cv2.imwrite(filename, face_roi)
                total += 1
        else:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
                tmp.write(video_bytes)
                tmp_path = tmp.name
            cap = cv2.VideoCapture(tmp_path)
            frame_count = 0
            target = 120
            while cap.isOpened() and total < target:
                ret, frame = cap.read()
                if not ret:
                    break
                if frame_count % 3 == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(80, 80))
                    for (x, y, w, h) in faces:
                        if total >= target:
                            break
                        face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
                        filename = os.path.join(folder, f"{user_id}_{len(os.listdir(folder))+1:04d}.jpg")
                        cv2.imwrite(filename, face_roi)
                        total += 1
                frame_count += 1
            cap.release()
            try:
                os.remove(tmp_path)
            except Exception:
                pass

        total_files = len([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        min_req = 30
        if total_files >= min_req:
            ok = self.train_model()
            return ok, total_files
        return False, total_files

    def train_model(self) -> bool:
        faces = []
        labels = []

        self.label_map = self._get_current_label_map()
        print("[AI-PROCTOR] Starting model training with all registered users...")

        for user_folder, label_id in self.label_map.items():
            folder_path = os.path.join(DATASET_DIR, user_folder)
            embs = []
            for filename in os.listdir(folder_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(folder_path, filename)
                    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                    if img is not None:
                        img = cv2.resize(img, (200, 200))
                        faces.append(img)
                        labels.append(label_id)
                        if self.df_model is not None and DeepFace is not None:
                            try:
                                rep = DeepFace.represent(img_path=img_path, model_name='ArcFace', model=self.df_model, enforce_detection=False, detector_backend='opencv')
                                vec = rep[0]['embedding'] if isinstance(rep, list) else rep['embedding']
                                embs.append(np.array(vec, dtype=np.float32))
                            except Exception:
                                pass
            if len(embs) > 0:
                try:
                    mean_vec = np.mean(np.vstack(embs), axis=0)
                    self.user_embeddings[user_folder] = mean_vec
                except Exception:
                    pass

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

    def identify(self, image_b64: str) -> dict:
        try:
            if ',' in image_b64:
                image_b64 = image_b64.split(',')[1]
            img_bytes = base64.b64decode(image_b64)
        except Exception:
            return {"success": False, "error": "decode_failed"}

        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            return {"success": False, "error": "imdecode_failed"}

        if self.df_model is not None and len(self.user_embeddings) > 0 and DeepFace is not None:
            try:
                rep = DeepFace.represent(img_path=img, model_name='ArcFace', model=self.df_model, enforce_detection=False, detector_backend='opencv')
                vec = rep[0]['embedding'] if isinstance(rep, list) else rep['embedding']
                v = np.array(vec, dtype=np.float32)
                best_uid = None
                best_dist = None
                for uid, mean_vec in self.user_embeddings.items():
                    a = v / (np.linalg.norm(v) + 1e-8)
                    b = mean_vec / (np.linalg.norm(mean_vec) + 1e-8)
                    d = 1.0 - float(np.dot(a, b))
                    if best_dist is None or d < best_dist:
                        best_dist = d
                        best_uid = uid
                if best_uid is not None and best_dist is not None and best_dist < 0.4:
                    return {"success": True, "user_id": best_uid, "distance": best_dist}
            except Exception:
                pass

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))
        if len(faces) == 0:
            return {"success": False, "error": "no_face"}
        lm = self._get_current_label_map()
        rev = {v: k for k, v in lm.items()}
        best = None
        for (x, y, w, h) in faces:
            face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
            try:
                label, confidence = self.recognizer.predict(face_roi)
                confidence = float(confidence)
            except Exception:
                label, confidence = -1, 999.0
            if best is None or confidence < best[1]:
                best = (label, confidence)
        if best is None:
            return {"success": False, "error": "predict_failed"}
        label, conf = best
        uid = rev.get(label)
        if uid and conf < 65.0:
            return {"success": True, "user_id": uid, "confidence": conf}
        return {"success": False, "error": "threshold"}
