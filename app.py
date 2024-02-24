import random 
import json
import pyodbc
from datetime import datetime
from threading import Thread

from paho.mqtt import client as mqtt_client
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO

# mqtt
host = "localhost"
port = 1883
topic_sub = "esp/dht"
topic_pub1 = "esp/lamp1"
topic_pub2 = "esp/lamp2"
topic_pub3 = "esp/lamp3"

# sql
SERVER = 'localhost'
DATABASE = 'IOT'
USERNAME = 'sa'
PASSWORD = '123456'
connectionString = f'DRIVER={{ODBC Driver 17 for SQL Server}}; SERVER={SERVER}; DATABASE={DATABASE}; UID={USERNAME}; PWD={PASSWORD}'



client = mqtt_client.Client()

def on_connect(client, userdata, flags, rc):
    print("Kết nối thành công với mã trạng thái: " + str(rc))
    client.subscribe("esp/dht")

def get_current_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y %H:%M:%S")

def on_message(client, userdata, msg):
    dht_json = json.loads(msg.payload)
    connect_mssql = pyodbc.connect(connectionString)
    cursor = connect_mssql.cursor()
    sql_query1 = "insert into sensorData(ssid, temperature, humidity, light, dust, time) values (?,?,?,?,?,?)"
    cursor.execute(sql_query1, (dht_json['ssid'], dht_json['temperature'], dht_json['humidity'], dht_json['light'], dht_json['dust'], get_current_datetime()))
    connect_mssql.commit()
    cursor.close()
    connect_mssql.close()

client.on_connect = on_connect
client.on_message = on_message
client.connect(host, port)
client.loop_start()

thread = None
app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('giaodien.html')

@app.route('/sensordata')
def sensorData():
    return render_template('sensordata.html')

@app.route('/action')
def action():
    return render_template('action.html')

@app.route('/thongtincanhan')
def thongtincanhan():
    return render_template('thongtincanhan.html')

def background_thread():
    connect_mssql = pyodbc.connect(connectionString)
    cursor = connect_mssql.cursor()
    while True:
        cursor.execute("select * from (select top 6  * from sensorData order by id desc) subquery order by id asc")
        record = cursor.fetchall()
        data_json = []
        for r in record:
            item = {'temperature': r[2], 'humidity': r[3], 'light': r[4], 'dust': r[5], 'time': str(r[6])}
            data_json.append(item)
        socketio.emit('data',data_json)

        cursor.execute("select * from sensorData order by id desc")
        records2 = cursor.fetchall()
        json_list = []
        for r in records2:
            item = {'id': int(r[0]), 'ssid': int(r[1]), 'temperature': r[2], 'humidity': r[3], 'light': r[4], 'dust': r[5], 'time': str(r[6])}
            json_list.append(item)
        socketio.emit('listdata', json_list)

        cursor.execute("select * from actiontbl order by id desc")
        records3 = cursor.fetchall()
        action_json = []
        for r in records3:
            item = {'id': int(r[0]), 'device': r[1], 'action': int(r[2]), 'time': str(r[3])}
            action_json.append(item) 
        socketio.emit('listaction', action_json)
        socketio.sleep(1)
    

@socketio.on('connect')
def connect():
    global thread
    print('Client connected')

    if thread is None:
        thread = Thread(target=background_thread)
        thread.daemon = True
        thread.start()

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')

@socketio.on('event')
def event(data):
    print(data)
    device = data['device']
    status = data['status']

    if data['device'] == 'light 1':
        if int(data['status']) == 1:
            client.publish(topic_pub1, '1')
        else:
            client.publish(topic_pub1, '0')
    elif data['device'] == 'light 2':
        if int(data['status']) == 1:
            client.publish(topic_pub2, '1')
        else:
            client.publish(topic_pub2, '0')
    else:
        if int(data['status']) == 1:
            client.publish(topic_pub3, '1')
        else:
            client.publish(topic_pub3, '0')

    connect_mssql = pyodbc.connect(connectionString)
    cursor = connect_mssql.cursor()
    cursor.execute('insert into actiontbl(device, action, time) values (?, ?, ?)', (data['device'], int(data['status']), get_current_datetime()))
    connect_mssql.commit()
    cursor.close()
    connect_mssql.close()




if __name__ == '__main__':
    socketio.run(app)