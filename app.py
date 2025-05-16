from flask import Flask, render_template, request, redirect
from datetime import datetime

app = Flask(__name__)
data = []

@app.route("/", methods=["GET", "POST"])
def index():
    global data
    if request.method == "POST":
        form = request.form
        entry = {
            "model": form.get("model"),
            "number": form.get("number"),
            "status": form.get("status"),
            "sn": form.get("sn"),
            "location": form.get("location"),
            "state": form.get("state"),
            "who": form.get("who"),
            "date": form.get("date") or datetime.today().strftime("%Y-%m-%d"),
            "returned": datetime.today().strftime("%Y-%m-%d") if form.get("state") == "На КСП" else "",
            "notes": form.get("notes")
        }
        data.append(entry)
        return redirect("/")
    return render_template("index.html", data=data)