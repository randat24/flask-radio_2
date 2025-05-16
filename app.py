from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB = "database.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS radios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model TEXT, number TEXT, status TEXT, sn TEXT,
            location TEXT, state TEXT, who TEXT,
            date TEXT, returned TEXT, notes TEXT
        )
        """)
        conn.commit()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/load")
def load():
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT model, number, status, sn, location, state, who, date, returned, notes FROM radios")
        rows = cursor.fetchall()
    keys = ["model", "number", "status", "sn", "location", "state", "who", "date", "returned", "notes"]
    return jsonify([dict(zip(keys, row)) for row in rows])

@app.route("/save", methods=["POST"])
def save():
    data = request.json.get("data", [])
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM radios")
        for row in data:
            cursor.execute("""
                INSERT INTO radios (model, number, status, sn, location, state, who, date, returned, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["model"], row["number"], row["status"], row["sn"],
                row["location"], row["state"], row["who"], row["date"],
                row["returned"], row["notes"]
            ))
        conn.commit()
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    init_db()
    app.run()