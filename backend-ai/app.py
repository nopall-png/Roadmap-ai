# backend-ai/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from recognizer import FaceProctor
from dss_engine import LearningPathDSS

app = Flask(__name__)
CORS(app)

proctor = FaceProctor()
dss = LearningPathDSS()

@app.route('/enroll', methods=['POST'])
def enroll():
    data = request.json
    user_id = data['user_id']
    video_b64 = data['video']
    success, count = proctor.enroll(user_id, video_b64)
    return jsonify({"success": success, "faces": count})

@app.route("/train", methods=["POST"])
def train():
    success = proctor.train_model()
    return jsonify({"success": success})

@app.route('/verify', methods=['POST'])
def verify():
    data = request.json
    user_id = data['user_id']
    image_b64 = data['image']
    result = proctor.verify(image_b64, user_id)
    return jsonify(result)

@app.route("/submit-exam", methods=["POST"])
def submit_exam():
    data = request.json
    answers = data["answers"]  # list string ["1", "2", ...]
    user_id = data["user_id"]
    package = data.get("package", "pro")

    # Correct answers dari soal (sesuai urutan questions di frontend)
    correct_answers = [1,1,1,1,2,0,1,0,3,2,0,3,0,0,1,2,1,1,0,2]

    result = dss.analyze_performance(answers, correct_answers, package)

    # Simpan ke DB atau log (opsional)
    print(f"\nRESULT FOR {user_id}: {result['score']}/{result['total']}")
    print("Recommended Path:", result["learning_path_url"])

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)