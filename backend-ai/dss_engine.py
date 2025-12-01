# backend-ai/dss_engine.py
# Decision Support System – Personalized Learning Recommendation Engine

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

        # Mapping soal ke topik
        self.topic_map = {
            0: "Binary Search",
            1: "Stack & Queue",
            2: "Binary Search Tree",
            3: "QuickSort & Sorting",
            4: "MergeSort & Stability",
            5: "Graph Theory Basics",
            6: "Dijkstra Algorithm",
            7: "DFS & BFS",
            8: "Hashing & HashMap",
            9: "Dynamic Programming",
            10: "Binary Heap",
            11: "AVL & Red-Black Tree",
            12: "Bellman-Ford",
            13: "Topological Sort",
            14: "Heap Operations",
            15: "Minimum Spanning Tree",
            16: "BFS vs DFS",
            17: "Sorting Algorithms",
            18: "Graph Cycles",
            19: "Complete Graph"
        }

        self.topic_groups = {
            "Binary Heaps & Priority Queues": [10, 14],
            "Graph Algorithms": [6, 12, 15],
            "Dynamic Programming": [9],
            "Tree Data Structures": [2, 11],
            "Sorting Algorithms": [3, 4, 17],
            "Hashing": [8],
            "Search Algorithms": [0],
            "Basic Data Structures": [1, 7, 16]
        }

    def analyze_performance(self, answers: list, correct_indices: list, package: str = "pro"):
        total = len(answers)
        score = sum(1 for i, ans in enumerate(answers) if ans == str(correct_indices[i]))
        percentage = (score / total) * 100

        # Hitung salah per topik
        wrong_topics = {}
        for i, ans in enumerate(answers):
            if ans != str(correct_indices[i]):
                topic = self.topic_map.get(i, "Unknown")
                topic_group = self._get_group(topic)
                wrong_topics[topic_group] = wrong_topics.get(topic_group, 0) + 1

        # Sort by most wrong
        weak_areas = sorted(wrong_topics.items(), key=lambda x: x[1], reverse=True)[:4]

        # Generate recommendation
        recommendations = []
        total_hours = 0

        priority = ["Binary Heaps & Priority Queues", "Graph Algorithms", "Dynamic Programming", "Tree Data Structures"]

        for area, count in weak_areas:
            if area in priority:
                prio = "HIGH"
            else:
                prio = "MEDIUM"

            hours = {"HIGH": 6, "MEDIUM": 4, "LOW": 2}.get(prio, 3)
            if total_hours + hours > self.packages[package]["max_hours"]:
                hours = max(2, self.packages[package]["max_hours"] - total_hours)

            recommendations.append({
                "topic": area,
                "wrong_count": count,
                "priority": prio,
                "hours": hours,
                "resources": self._get_resources(area, package)
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
        for group, topics in self.topic_groups.items():
            if any(str(t) in topic_name or topic_name in str(t) for t in topics):
                return group
        return topic_name

    def _get_resources(self, topic, package):
        base = {
            "Binary Heaps & Priority Queues": "Heaps Masterclass + 30 LeetCode",
            "Graph Algorithms": "Graph Theory Pro + Dijkstra Animation",
            "Dynamic Programming": "DP Zero to Hero + Pattern List",
            "Tree Data Structures": "BST & Balanced Trees Full Course"
        }
        if package == "elite":
            return base.get(topic, "Advanced Course") + " + 1-on-1 Coaching Session"
        elif package == "pro":
            return base.get(topic, "Pro Course") + " + Mock Interview"
        else:
            return base.get(topic, "Basic Video Series")