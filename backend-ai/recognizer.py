# backend-ai/recognizer.py
# Professional Face Recognition Proctoring System – Final Version (English & Competition-Ready)

import cv2
import os
import numpy as np
import base64
import tempfile

from config import DATASET_DIR, HAAR_FACE, TRAINING_MODEL

class FaceProctor:
    def __init__(self):
        # Load Haar Cascade for face detection
        self.face_cascade = cv2.CascadeClassifier(HAAR_FACE)
        if self.face_cascade.empty():
            raise Exception("ERROR: haarcascade_frontalface_default.xml not found or corrupted!")

        # LBPH Face Recognizer – best balance between speed and accuracy
        self.recognizer = cv2.face.LBPHFaceRecognizer_create(
            radius=2,
            neighbors=8,
            grid_x=8,
            grid_y=8,
            threshold=100.0
        )

        # Load existing model if available
        if os.path.exists(TRAINING_MODEL):
            try:
                self.recognizer.read(TRAINING_MODEL)
                print(f"Model loaded successfully: {TRAINING_MODEL}")
            except Exception as e:
                print(f"Existing model corrupted ({e}). A new one will be created after enrollment.")
        else:
            print("No trained model found. It will be created after first enrollment.")

        os.makedirs(DATASET_DIR, exist_ok=True)

    def enroll(self, user_id: str, video_b64: str) -> tuple[bool, int]:
        """
        Enroll a new user by extracting faces from a recorded video (or single image).
        Records for a long time to collect rich facial data (up to 120 samples).
        """
        folder = os.path.join(DATASET_DIR, user_id)
        os.makedirs(folder, exist_ok=True)

        # Clean base64 data (remove data:image/jpeg;base64, or data:video/webm;base64,)
        try:
            if ',' in video_b64:
                video_b64 = video_b64.split(',')[1]
            video_bytes = base64.b64decode(video_b64)
        except Exception as e:
            print(f"Base64 decoding failed: {e}")
            return False, 0

        # First try to decode as a single image
        img = cv2.imdecode(np.frombuffer(video_bytes, np.uint8), cv2.IMREAD_COLOR)
        saved_count = 0

        if img is not None:
            # Single photo enrollment
            print(f"Processing single photo for user: {user_id}")
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))

            for (x, y, w, h) in faces:
                face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
                filename = f"{folder}/{user_id}_{len(os.listdir(folder))+1:04d}.jpg"
                cv2.imwrite(filename, face_roi)
                saved_count += 1
        else:
            # Video enrollment – extract many faces (long recording)
            print(f"Processing video enrollment video for {user_id} – collecting rich facial data...")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
                tmp.write(video_bytes)
                tmp_path = tmp.name

            cap = cv2.VideoCapture(tmp_path)
            frame_count = 0
            target_samples = 120  # Aim for 120 high-quality face samples

            while cap.isOpened() and saved_count < target_samples:
                ret, frame = cap.read()
                if not ret:
                    break

                # Process every 3rd frame for better variation and performance
                if frame_count % 3 == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    faces = self.face_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.1,
                        minNeighbors=4,
                        minSize=(80, 80)
                    )

                    for (x, y, w, h) in faces:
                        if saved_count >= target_samples:
                            break
                        face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))
                        filename = f"{folder}/{user_id}_{saved_count+1:04d}.jpg"
                        cv2.imwrite(filename, face_roi)
                        saved_count += 1
                        print(f"  Face captured: {saved_count}/{target_samples}", end="\r")

                frame_count += 1

            cap.release()
            os.remove(tmp_path)
            print(f"\nEnrollment complete! Collected {saved_count} face samples for {user_id}")

        # Train the model if enough data was collected
        if saved_count < 30:
            print("Not enough face samples collected (minimum 30 required). Please record longer.")
            return False, saved_count
        else:
            print(f"Sufficient data collected ({saved_count} samples). Starting model training...")
            success = self.train_model()
            if success:
                print("Model training completed successfully!")
            else:
                print("Model training failed. Please try enrolling again.")
            return success, saved_count

    def train_model(self) -> bool:
        """Train (or retrain) the recognizer using all data in the dataset folder."""
        faces = []
        labels = []
        label_map = {}
        label_id = 0

        print("Starting model training with all registered users...")

        for user_folder in os.listdir(DATASET_DIR):
            folder_path = os.path.join(DATASET_DIR, user_folder)
            if not os.path.isdir(folder_path):
                continue

            if user_folder not in label_map:
                label_map[user_folder] = label_id
                label_id += 1

            for filename in os.listdir(folder_path):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(folder_path, filename)
                    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
                    if img is not None:
                        img = cv2.resize(img, (200, 200))
                        faces.append(img)
                        labels.append(label_map[user_folder])

        if len(faces) < 30:
            print(f"Insufficient training data: only {len(faces)} images found. Need at least 30.")
            return False

        try:
            self.recognizer.train(faces, np.array(labels))
            self.recognizer.write(TRAINING_MODEL)
            print(f"Training successful! Model saved with {len(faces)} images from {len(label_map)} user(s).")
            return True
        except Exception as e:
            print(f"Training failed: {e}")
            return False

    def verify(self, image_b64: str, user_id: str) -> dict:
        """Verify face in real-time during exam. Returns bounding boxes and status."""
        try:
            img_bytes = base64.b64decode(image_b64.split(',')[1])
        except:
            return {"error": "Invalid image format"}

        img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), -1)
        if img is None:
            return {"error": "Failed to decode image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.2, 6, minSize=(100, 100))

        bboxes = []

        # Build current label map
        label_map = {}
        lid = 0
        for uf in os.listdir(DATASET_DIR):
            if os.path.isdir(os.path.join(DATASET_DIR, uf)):
                label_map[uf] = lid
                lid += 1
        expected_label = label_map.get(user_id, -1)

        for (x, y, w, h) in faces:
            face_roi = cv2.resize(gray[y:y+h, x:x+w], (200, 200))

            try:
                label, confidence = self.recognizer.predict(face_roi)
                confidence = float(confidence)
            except:
                label = -1
                confidence = 999.0

            # Strict rule: must match BOTH label AND low confidence
            if label == expected_label and confidence < 65:
                status = "user"
                color = (0, 255, 0)  # Green
            else:
                status = "intruder"
                color = (0, 0, 255)  # Red

            # Draw rectangle and text
            cv2.rectangle(img, (x, y), (x+w, y+h), color, 6)
            cv2.putText(img, status.upper(), (x, y-25), cv2.FONT_HERSHEY_DUPLEX, 1.8, color, 4)
            cv2.putText(img, f"Conf: {confidence:.0f}", (x, y+h+40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

            bboxes.append({
                "x": int(x),
                "y": int(y),
                "w": int(w),
                "h": int(h),
                "label": status,
                "conf": round(confidence, 1)
            })

        # Overall session status
        if len(faces) == 0:
            overall = "warning"
        elif len(faces) == 1 and bboxes[0]["label"] == "user":
            overall = "safe"
        else:
            overall = "intruder"

        # Encode annotated image for frontend preview
        _, buffer = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        preview = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode()}"

        return {
            "bboxes": bboxes,
            "status": overall,
            "preview": preview
        }