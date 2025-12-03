# backend-ai/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from recognizer import FaceProctor
from dss_engine import LearningPathDSS
from config import DB_PATH
import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

proctor = FaceProctor()
dss = LearningPathDSS()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS exam_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                answers TEXT,
                score INTEGER,
                total INTEGER,
                percentage REAL,
                package TEXT,
                weak_areas TEXT,
                recommendations TEXT,
                total_study_hours INTEGER,
                created_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS course_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                module_title TEXT,
                lesson_index INTEGER,
                lesson_title TEXT,
                completed INTEGER DEFAULT 0,
                last_position REAL DEFAULT 0,
                updated_at TEXT,
                UNIQUE(user_id, module_title, lesson_index)
            )
            """
        )
        conn.commit()

init_db()

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
    correct_answers = [1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]

    result = dss.analyze_performance(user_id, answers, correct_answers, package)

    with get_db() as conn:
        conn.execute(
            "INSERT INTO exam_submissions (user_id, answers, score, total, percentage, package, weak_areas, recommendations, total_study_hours, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id,
                json.dumps(answers),
                result["score"],
                result["total"],
                result["percentage"],
                result["package"],
                json.dumps(result.get("weak_areas", [])),
                json.dumps(result.get("recommendations", [])),
                result.get("total_study_hours", 0),
                datetime.utcnow().isoformat()
            )
        )
        conn.commit()

    return jsonify(result)

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"success": False, "error": "invalid_input"}), 400
    ph = generate_password_hash(password)
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (name, email, ph, datetime.utcnow().isoformat())
            )
            conn.commit()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "error": "email_exists"}), 409

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"success": False, "error": "invalid_input"}), 400
    with get_db() as conn:
        row = conn.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,)).fetchone()
    if not row:
        return jsonify({"success": False, "error": "not_found"}), 404
    if not check_password_hash(row[3], password):
        return jsonify({"success": False, "error": "invalid_credentials"}), 401
    return jsonify({"success": True, "user": {"id": row[0], "name": row[1], "email": row[2]}})

@app.route("/user", methods=["GET"])
def get_user():
    uid = request.args.get("id")
    email = request.args.get("email")
    with get_db() as conn:
        if uid:
            row = conn.execute("SELECT id, name, email FROM users WHERE id = ?", (uid,)).fetchone()
        elif email:
            row = conn.execute("SELECT id, name, email FROM users WHERE email = ?", (email.lower(),)).fetchone()
        else:
            row = None
    if not row:
        return jsonify({"success": False, "error": "not_found"}), 404
    return jsonify({"success": True, "user": {"id": row[0], "name": row[1], "email": row[2]}})

@app.route("/progress/update", methods=["POST"])
def progress_update():
    data = request.json
    user_id = (data.get("user_id") or "").strip()
    module_title = (data.get("module_title") or "").strip()
    lesson_index = int(data.get("lesson_index") or 0)
    lesson_title = (data.get("lesson_title") or "").strip()
    completed = 1 if data.get("completed") else 0
    last_position = float(data.get("last_position") or 0)
    ts = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO course_progress (user_id, module_title, lesson_index, lesson_title, completed, last_position, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, module_title, lesson_index) DO UPDATE SET
                lesson_title=excluded.lesson_title,
                completed=excluded.completed,
                last_position=excluded.last_position,
                updated_at=excluded.updated_at
            """,
            (user_id, module_title, lesson_index, lesson_title, completed, last_position, ts)
        )
        conn.commit()
    return jsonify({"success": True})

@app.route("/progress", methods=["GET"])
def progress_list():
    user_id = request.args.get("user_id") or ""
    module_title = request.args.get("module_title") or ""
    limit = int(request.args.get("limit", "100"))
    q = "SELECT user_id, module_title, lesson_index, lesson_title, completed, last_position, updated_at FROM course_progress WHERE 1=1"
    params = []
    if user_id:
        q += " AND user_id = ?"
        params.append(user_id)
    if module_title:
        q += " AND module_title = ?"
        params.append(module_title)
    q += " ORDER BY lesson_index ASC LIMIT ?"
    params.append(limit)
    with get_db() as conn:
        rows = conn.execute(q, tuple(params)).fetchall()
    items = [
        {
            "user_id": r[0],
            "module_title": r[1],
            "lesson_index": r[2],
            "lesson_title": r[3],
            "completed": int(r[4]),
            "last_position": float(r[5]),
            "updated_at": r[6],
        }
        for r in rows
    ]
    return jsonify({"items": items})

@app.route("/submissions", methods=["GET"])
def submissions():
    user_id = request.args.get("user_id")
    limit = int(request.args.get("limit", "20"))
    query = "SELECT * FROM exam_submissions ORDER BY id DESC LIMIT ?" if not user_id else "SELECT * FROM exam_submissions WHERE user_id = ? ORDER BY id DESC LIMIT ?"
    with get_db() as conn:
        rows = conn.execute(query, (limit,) if not user_id else (user_id, limit)).fetchall()
    data = []
    for r in rows:
        item = dict(r)
        try:
            item["answers"] = json.loads(item["answers"]) if item.get("answers") else []
        except:
            item["answers"] = []
        try:
            item["weak_areas"] = json.loads(item["weak_areas"]) if item.get("weak_areas") else []
        except:
            item["weak_areas"] = []
        try:
            item["recommendations"] = json.loads(item["recommendations"]) if item.get("recommendations") else []
        except:
            item["recommendations"] = []
        data.append(item)
    return jsonify({"items": data})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
