from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

MODELS = ['ND', 'R7e', 'R7', 'DP4400', 'DP4400e', 'DP4401e']
STATUSES = ['ND', 'Не учтеная', 'Списаная', 'Учтеная']
LOCATIONS = ['ND', 'КСП', 'СП', 'РЕР', 'БПЛА']
STATES = ['ND', 'На КСП', 'Выдано', 'На выход', 'Утеряна', 'Неизвестно', 'Дежурная']

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model = db.Column(db.String(50))
    number = db.Column(db.String(50))
    status = db.Column(db.String(50))
    serial = db.Column(db.String(50))
    location = db.Column(db.String(50))
    state = db.Column(db.String(50))
    recipient = db.Column(db.String(100))
    date_issued = db.Column(db.String(50))
    date_returned = db.Column(db.String(50))
    notes = db.Column(db.Text)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    items = Inventory.query.all()
    return render_template('index.html', items=items, models=MODELS,
                           statuses=STATUSES, locations=LOCATIONS, states=STATES)

@app.route('/update', methods=['POST'])
def update():
    data = request.get_json()
    item = Inventory.query.get(data['id'])
    if item and hasattr(item, data['field']):
        setattr(item, data['field'], data['value'])
        if data['field'] == 'state':
            now = datetime.now().strftime('%Y-%m-%d %H:%M')
            if data['value'] in ['Выдано', 'На выход']:
                item.date_issued = now
            elif data['value'] == 'На КСП':
                item.date_returned = now
                item.date_issued = ''
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False)

@app.route('/add', methods=['POST'])
def add():
    new_item = Inventory(model='', number='', status='', serial='', location='РЕР',
                         state='', recipient='', date_issued='', date_returned='', notes='')
    db.session.add(new_item)
    db.session.commit()
    return jsonify(id=new_item.id)

@app.route('/delete', methods=['POST'])
def delete():
    data = request.get_json()
    ids = data.get('ids', [])
    for item_id in ids:
        item = Inventory.query.get(item_id)
        if item:
            db.session.delete(item)
    db.session.commit()
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)
