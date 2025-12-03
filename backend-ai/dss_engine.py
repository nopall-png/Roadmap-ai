# backend-ai/dss_engine.py
# Decision Support System – Personalized Learning Recommendation Engine
import math
import sqlite3
import json
from config import DB_PATH
import pandas as pd
from urllib.parse import quote

class LearningPathDSS:
    def __init__(self):
        self.packages = {
            "basic": {
                "name": "Basic Package",
                "features": ["Video Lessons", "Practice Questions"],
                "max_hours": 15
            },
            "pro": {
                "name": "Pro Package",
                "features": ["Video + Live Mentoring", "LeetCode Premium", "Mock Interviews"],
                "max_hours": 40
            },
            "elite": {
                "name": "Elite Package",
                "features": ["1-on-1 Coaching", "Guaranteed Interview", "Resume Review"],
                "max_hours": 80
            }
        }

        # Mapping soal ke topik (Software Engineer Final Exam)
        self.topic_map = {
            0: "Python Basics",
            1: "Python Basics",
            2: "Data Structures (DSA)",
            3: "Data Structures (DSA)",
            4: "Data Structures (DSA)",
            5: "Web Basics (HTML/CSS)",
            6: "Web Basics (HTML/CSS)",
            7: "Web Basics (HTML/CSS)",
            8: "React.js Framework",
            9: "React.js Framework",
            10: "Backend (Node.js)",
            11: "Backend (Node.js)",
            12: "Backend (Node.js)",
            13: "Databases (SQL)",
            14: "Databases (SQL)",
            15: "Databases (SQL)",
            16: "Python Basics",
            17: "Backend (Node.js)",
            18: "React.js Framework",
            19: "Data Structures (DSA)",
        }

        self.topic_groups = {
            "Python Basics": [0, 1, 16],
            "Web Basics (HTML/CSS)": [5, 6, 7],
            "React.js Framework": [8, 9, 18],
            "Backend (Node.js)": [10, 11, 12, 17],
            "Databases (SQL)": [13, 14, 15],
            "Data Structures (DSA)": [2, 3, 4, 19],
        }

        # Map group ke course (judul sesuai halaman Course di frontend)
        self.group_course_map = {
            "Python Basics": ["Variables and Types", "Functions", "Errors and Exceptions"],
            "Web Basics (HTML/CSS)": ["HTML Basics", "CSS Basics", "Flexbox"],
            "React.js Framework": ["JSX and Components", "Managing State", "useEffect Hook"],
            "Backend (Node.js)": ["Node Basics", "npm and Modules", "Express Intro"],
            "Databases (SQL)": ["Intro to SQL", "SELECT", "JOIN"],
            "Data Structures (DSA)": ["Big O Notation", "Arrays", "Linked Lists"],
        }

    def analyze_performance(self, user_id: str, answers: list, correct_indices: list, package: str = "pro"):
        total = len(answers)
        score = sum(1 for i, ans in enumerate(answers) if ans == str(correct_indices[i]))
        percentage = (score / total) * 100

        # Current exam wrong rate per topic
        topic_counts = {}
        topic_wrong = {}
        for i, ans in enumerate(answers):
            topic = self.topic_map.get(i, "Unknown")
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
            if ans != str(correct_indices[i]):
                topic_wrong[topic] = topic_wrong.get(topic, 0) + 1
        current_rate = {t: (topic_wrong.get(t, 0) / max(1, c)) for t, c in topic_counts.items()}

        # Historical wrong rate via pandas (last 5 submissions with 20 questions)
        hist_rate = {t: 0.0 for t in current_rate.keys()}
        try:
            conn = sqlite3.connect(DB_PATH)
            df = pd.read_sql_query(
                "SELECT answers, total, created_at FROM exam_submissions WHERE user_id = ? ORDER BY id DESC LIMIT 50",
                conn,
                params=(user_id,),
            )
            rows = []
            for _, r in df.iterrows():
                try:
                    ans_list = json.loads(r["answers"]) if r["answers"] else []
                except:
                    ans_list = []
                if len(ans_list) != 20:
                    continue
                for qi, a in enumerate(ans_list):
                    rows.append({
                        "q": qi,
                        "answer": str(a),
                        "correct": str(correct_indices[qi]),
                        "topic": self.topic_map.get(qi, "Unknown"),
                        "is_wrong": str(a) != str(correct_indices[qi]),
                    })
            if rows:
                hdf = pd.DataFrame(rows)
                agg = hdf.groupby("topic")["is_wrong"].mean()
                for t, val in agg.items():
                    hist_rate[t] = float(val)
        except Exception:
            pass

        # Blend current and history (EMA style)
        alpha = 0.6
        blended = {t: alpha * current_rate.get(t, 0.0) + (1 - alpha) * hist_rate.get(t, 0.0) for t in current_rate.keys()}

        # Rank weak areas
        ranked = sorted(blended.items(), key=lambda x: x[1], reverse=True)
        weak_topics = [t for t, r in ranked if r > 0][:4]

        # Recommendations
        recommendations = []
        total_hours = 0
        for t in weak_topics:
            rate = blended.get(t, 0.0)
            prio = "HIGH" if rate >= 0.5 else "MEDIUM" if rate >= 0.25 else "LOW"
            q_count = topic_counts.get(t, 1)
            base_per_wrong = 3.0
            hours = int(math.ceil(base_per_wrong * max(1.0, rate * q_count) * (1.5 if prio == "HIGH" else 1.0 if prio == "MEDIUM" else 0.75)))
            remaining = self.packages[package]["max_hours"] - total_hours
            if hours > remaining:
                hours = max(1, remaining)
            recommendations.append({
                "topic": t,
                "wrong_count": int(round(rate * q_count)),
                "priority": prio,
                "hours": hours,
                "resources": self._get_resources(t, package),
                "courses": self._get_courses(t),
            })
            total_hours += hours
            if total_hours >= self.packages[package]["max_hours"]:
                break

        return {
            "score": score,
            "total": total,
            "percentage": round(percentage, 1),
            "package": self.packages[package]["name"],
            "weak_areas": [r["topic"] for r in recommendations],
            "recommendations": recommendations,
            "total_study_hours": total_hours,
            "learning_path_url": f"https://academy.kulyeah.com/path/{package}/recommended?weak={','.join([r['topic'].lower().replace(' ', '-') for r in recommendations])}"
        }

    def _get_group(self, topic_name):
        # In new schema, topic_name already equals group
        return topic_name

    def _get_resources(self, topic, package):
        base = {
            "Python Basics": "Mosh Python + Practice Sets",
            "Web Basics (HTML/CSS)": "SuperSimpleDev HTML/CSS + Flexbox/Grid",
            "React.js Framework": "Mosh React + Hooks Deep Dive",
            "Backend (Node.js)": "Mosh Node.js + Express Basics",
            "Databases (SQL)": "FreeCodeCamp SQL + Exercises",
            "Data Structures (DSA)": "Mosh DSA Intro + Arrays/Linked Lists",
        }
        if package == "elite":
            return base.get(topic, "Advanced Course") + " + 1-on-1 Coaching Session"
        elif package == "pro":
            return base.get(topic, "Pro Course") + " + Mock Interview"
        else:
            return base.get(topic, "Basic Video Series")

    def _get_courses(self, group_name):
        titles = self.group_course_map.get(group_name, [group_name])
        mod = quote(group_name, safe="")
        return [{
            "title": t,
            "href": f"/course?title={mod}&lesson={quote(t, safe='')}"
        } for t in titles]
