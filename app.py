from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
data = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/load")
def load():
    return jsonify(data)

@app.route("/save", methods=["POST"])
def save():
    global data
    data = request.json.get("data", [])
    return jsonify({"status": "ok"})