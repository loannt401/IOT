let actionlist = [];
const quantityItem = 30;
let page = 1;
function displayData(page){
    const startIndex = (page - 1) * quantityItem;
    const endIndex = startIndex + quantityItem;
    const dataPage = actionlist.slice(startIndex, endIndex);

    const tbody = document.querySelector("#table-action tbody");
    tbody.innerHTML = '';

    dataPage.forEach(data => {
        const row = tbody.insertRow();
        const idCell = row.insertCell(0);
        const deviceCell = row.insertCell(1);
        const actionCell = row.insertCell(2);
        const timeCell = row.insertCell(3);

        idCell.textContent = data.id;
        deviceCell.textContent = data.device;
        actionCell.textContent = data.action;
        timeCell.textContent = data.time;
    });
}

function updatePagination(){
    const pageDisplay = document.getElementById('page-number');
    pageDisplay.textContent = page;
    document.getElementById('page-total').textContent = Math.ceil(actionlist.length / quantityItem);
    displayData(page);
}

document.getElementById('prev-page').addEventListener('click', () => {
    if(page > 1){
        page--;
        updatePagination();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPage = Math.ceil(actionlist.length / quantityItem);
    if (page < totalPage){
        page++;
        updatePagination();
    }
});


var socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('listaction', function(listaction) {
    console.log('Received data:', listaction);
    actionlist = [];
    listaction.forEach(d => {
        actionlist.push(d);
    })
    updatePagination();

});
// updatePagination();


function submitData() {
    // Lấy tham chiếu đến biểu mẫu và trường nhập dữ liệu
    var form = document.getElementById("myForm");
    var inputField = document.getElementById("inputField");
  
    // Lấy giá trị từ trường nhập dữ liệu
    var data = inputField.value;
    console.log(data);
    socket.emit('searchaction', data)
    inputField.value = "";
};