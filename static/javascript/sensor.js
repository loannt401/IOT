let listsensor = []
const quantityItem = 30;
let page = 1;

function displayData(page){
    const startIndex = (page - 1) * quantityItem;
    const endIndex = startIndex + quantityItem;
    const dataPage = listsensor.slice(startIndex, endIndex);

    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = '';

    dataPage.forEach(data => {
        const row = tbody.insertRow();
        const idCell = row.insertCell(0);
        const ssidCell = row.insertCell(1);
        const temperatureCell = row.insertCell(2);
        const humidityCell = row.insertCell(3);
        const lightCell = row.insertCell(4);
        const dustCell = row.insertCell(5);
        const timeCell = row.insertCell(6);

        idCell.textContent = data.id;
        ssidCell.textContent = data.ssid;
        temperatureCell.textContent = data.temperature;
        humidityCell.textContent = data.humidity;
        lightCell.textContent = data.light;
        dustCell.textContent = data.dust;
        timeCell.textContent = data.time;
    });
}

function updatePagination(){
    const pageDisplay = document.getElementById('page-number');
    pageDisplay.textContent = page;
    document.getElementById('page-total').textContent = Math.ceil(listsensor.length / quantityItem);
    displayData(page);
}

document.getElementById('prev-page').addEventListener('click', () => {
    if(page > 1){
        page--;
        updatePagination();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPage = Math.ceil(listsensor.length / quantityItem);
    if (page < totalPage){
        page++;
        updatePagination();
    }
});

var socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('listdata', function(listdata) {
    console.log('Received data:', listdata);
    listsensor = [];
    listdata.forEach(d => {
        listsensor.push(d);
    })
    updatePagination();

});

updatePagination();