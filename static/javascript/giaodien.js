var socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Connected to server');
});



function lamp1(){
    var btn = document.querySelector('.switch_device_transition_button_1');
    btn.classList.toggle('active');

    var title = document.getElementById('lamp1');
    if(btn.classList.contains('active')){
        title.textContent = "ON";
        var dataSend = {device: 'light 1', status: 1}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_lamp1_on').style.display = "block";
        document.querySelector('.switch_device_img_lamp1_off').style.display = "none";
    }
    else {
        title.textContent = "OFF";
        var dataSend = {device: 'light 1', status: 0}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_lamp1_on').style.display = "none";
        document.querySelector('.switch_device_img_lamp1_off').style.display = "block";
    }
};


function lamp2(){
    var btn = document.querySelector('.switch_device_transition_button_2');
    btn.classList.toggle('active');

    var title = document.getElementById('lamp2');
    if(btn.classList.contains('active')){
        title.textContent = "ON";
        var dataSend = {device: 'light 2', status: 1}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_lamp2_on').style.display = "block";
        document.querySelector('.switch_device_img_lamp2_off').style.display = "none";
    }
    else {
        title.textContent = "OFF";
        var dataSend = {device: 'light 2', status: 0}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_lamp2_on').style.display = "none";
        document.querySelector('.switch_device_img_lamp2_off').style.display = "block";
    }
};

function fan(){
    var btn = document.querySelector('.switch_device_transition_button_3');
    btn.classList.toggle('active');

    var title = document.getElementById('fan');
    if(btn.classList.contains('active')){
        title.textContent = "ON";
        var dataSend = {device: 'fan', status: 1}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_fan_on').style.display = "block";
        document.querySelector('.switch_device_img_fan_off').style.display = "none";
    }
    else {
        title.textContent = "OFF";
        var dataSend = {device: 'fan', status: 0}
        socket.emit('event', dataSend);
        document.querySelector('.switch_device_img_fan_on').style.display = "none";
        document.querySelector('.switch_device_img_fan_off').style.display = "block";
    }
};



let dataDust = [];
let dataTemp = [];
let dataHumi = [];
let dataLight = [];
let dataTime = [];
let comboCtx = document.getElementById('comboChart').getContext('2d');
let comboChart;
socket.on('data', function(data) {
    console.log('Received data:', data);
    let dataDust2 = [];
    let dataTemp2 = [];
    let dataHumi2 = [];
    let dataLight2 = [];
    let dataTime2 = [];
    data.forEach(d => {
        dataDust2.push(parseFloat(d.dust));
        dataTemp2.push(parseFloat(d.temperature));
        dataHumi2.push(parseFloat(d.humidity));
        dataLight2.push(parseFloat(d.light));
        dataTime2.push(d.time);
    });
    if (!arraysHaveSameValues(dataTime, dataTime2)){
        for( let i=0; i<6; i++){
            dataDust[i] = dataDust2[i];
            dataTemp[i] = dataTemp2[i];
            dataHumi[i] = dataHumi2[i];
            dataLight[i] = dataLight2[i];
            dataTime[i] = dataTime2[i];
        }

        document.getElementById('db').textContent = dataDust[5];
        nd = document.querySelector('.color4');
        if(dataDust[5] < 35) {
            nd.classList.add('active1');
            nd.classList.remove('active2');
            nd.classList.remove('active3');

        }
        else if (dataDust[5] < 70){
            nd.classList.add('active2');
            nd.classList.remove('active1');
            nd.classList.remove('active3');
        }
        else {
            nd.classList.add('active3');
            nd.classList.remove('active2');
            nd.classList.remove('active1');
        }


        document.getElementById('nd').textContent = dataTemp[5];
        nd = document.querySelector('.color1');
        if(dataTemp[5] < 27) {
            nd.classList.add('active1');
            nd.classList.remove('active2');
            nd.classList.remove('active3');

        }
        else if (dataTemp[5] < 45){
            nd.classList.add('active2');
            nd.classList.remove('active1');
            nd.classList.remove('active3');
        }
        else {
            nd.classList.add('active3');
            nd.classList.remove('active2');
            nd.classList.remove('active1');
        }

        
        document.getElementById('da').textContent = dataHumi[5];
        da = document.querySelector('.color2');
        if(dataHumi[5] < 30) {
            da.classList.add('active1');
            da.classList.remove('active2');
            da.classList.remove('active3');

        }
        else if (dataHumi[5] < 70){
            da.classList.add('active2');
            da.classList.remove('active1');
            da.classList.remove('active3');
        }
        else {
            da.classList.add('active3');
            da.classList.remove('active2');
            da.classList.remove('active1');
        }

        document.getElementById('ds').textContent = dataLight[5];
        ds = document.querySelector('.color3');
        if(dataLight[5] < 100) {
            ds.classList.add('active1');
            ds.classList.remove('active2');
            ds.classList.remove('active3');

        }
        else if (dataLight[5] < 500){
            ds.classList.add('active2');
            ds.classList.remove('active1');
            ds.classList.remove('active3');
        }
        else {
            ds.classList.add('active3');
            ds.classList.remove('active2');
            ds.classList.remove('active1');
        }


        updateChart();
    }
    
});

function arraysHaveSameValues(data1, data2){
    for( let i=0; i<6; i++){
        if(data1[i] != data2[i]) return false;
    }
    return true;
};

function updateChart() {
    if (comboChart) {
        comboChart.destroy(); // Hủy biểu đồ cũ nếu tồn tại
    }
    comboChart = new Chart(comboCtx, {
        type: 'line',
        data: {
            labels: dataTime,
            // chứa một mảng các nhãn trục x của biểu đồ.

            datasets: [
                {
                    label: 'Độ bụi (lux)',
                    data: dataDust,
                    borderColor: 'green',
                    // fill: false
                },
                {
                    label: 'Nhiệt độ (°C)',
                    data: dataTemp,
                    borderColor: 'red',
                    // fill: false
                },
                {
                    label: 'Độ ẩm (%)',
                    data: dataHumi,
                    borderColor: 'blue',
                    // fill: false
                },
                {
                    label: 'Độ sáng (lux)',
                    data: dataLight,
                    borderColor: 'yellow',
                    // fill: false
                }
            
            ]
        }
    });
};
