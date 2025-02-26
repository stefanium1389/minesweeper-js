let boardHeight = 16;
let boardWidth = 30;
let numOfMines = 99;
let states = ["hidden", "flag", "mine", "revealed"];
let lose = false;
let win = false;
let gameFinished = false;
let numOfFlags = 0
let mouseButtonPressed = false;
const smiley = document.getElementById("smiley");
const timer = document.getElementById("time-elapsed");
let timeElapsed = 0
let firstClicked = false

smiley.addEventListener("mouseenter", function () {
    if(!gameFinished){
        smiley.innerText = "😉"
    }
} )
smiley.addEventListener("mouseleave", function () {
    if(!gameFinished){
        smiley.innerText = "🙂"
    }
} )

setInterval( function(){
    if(!gameFinished && firstClicked){
        timeElapsed++;
        if(timeElapsed < 10){
            timer.innerText = "00"+timeElapsed
        }
        else if(timeElapsed < 100){
            timer.innerText = "0"+timeElapsed
        }
        else {
            timer.innerText = timeElapsed
        }
        
    }
    
},1000)

const board = []

function initBoard(){
    for(let i = 0; i < boardHeight; i++){
        let row = []
        for(let j=0; j < boardWidth; j++){
            row.push({i, j, state: "hidden", mine: false, text:"", hold: false})
        }
        board.push(row)
    }
    populateMines();
} 

function populateMines(){
    let x = 0;
    while(x < numOfMines){
        let i = Math.floor(Math.random() * boardHeight)
        let j = Math.floor(Math.random() * boardWidth)
        if (!board[i][j].mine){
            board[i][j].mine = true
            x++;
        }  
    }
}
initBoard()

function showBoard() {
    const boardElement = document.getElementById("game-board");
    const mineCounter = document.getElementById("mines-left");
    let minesLeft = numOfMines - numOfFlags
    
    if(minesLeft <= -10){
        mineCounter.innerText = minesLeft;
    }
    else if(minesLeft < 0){
        mineCounter.innerText = "0"+minesLeft;
    }
    else if (minesLeft < 10){
        mineCounter.innerText = "00"+minesLeft;
    }
    else if(minesLeft < 100) {
        mineCounter.innerText = "0"+minesLeft;
    }
    else {
        mineCounter.innerText = minesLeft;
    }
    
    boardElement.innerHTML = "";
    for(let i = 0; i < boardHeight; i++){
        let row = document.createElement("div")
        for(let j = 0; j < boardWidth; j++){
            let cell = document.createElement("div")
            cell.classList.add("cell")
            switch (board[i][j].text) {
                case 1: {cell.classList.add("one"); break;}
                case 2: {cell.classList.add("two"); break;}
                case 3: {cell.classList.add("three"); break;}
                case 4: {cell.classList.add("four"); break;}
                case 5: {cell.classList.add("five"); break;}
                case 6: {cell.classList.add("six"); break;}
                case 7: {cell.classList.add("seven"); break;}
                case 8: {cell.classList.add("eight"); break;}
                default: {break;}
            }
            cell.addEventListener("mouseup", e => { 
                switch(e.button){
                    case 0: { onClick(i,j); unhighlightAdjecent(i,j); mouseButtonPressed = false; break; }
                    case 2: { onRightClick(i,j); break;}
                 }})
            cell.addEventListener("mousedown", e => { 
                if(e.button === 0){
                    mouseButtonPressed = true;
                    firstClicked = true;
                    highlightAdjecent(i,j);
                }
            })
            cell.addEventListener("mouseenter", e => {
                if (mouseButtonPressed) {
                    highlightAdjecent(i,j);
                }
            })
            cell.addEventListener("mouseleave", e => {
                unhighlightAdjecent(i,j);
            })
            cell.addEventListener("contextmenu",  e => { 
                e.preventDefault()  
            })
            if(board[i][j].hold){
                cell.classList.add("revealed")
            }
            if(board[i][j].state === "hidden"){
                if(board[i][j].mine && gameFinished){
                    cell.innerText="🏴"
                }
            }
            if(board[i][j].state === "mine"){
                cell.innerText="💣"
            }
            if(board[i][j].state === "flag"){
                if(board[i][j].mine && gameFinished){
                    cell.innerText="🏴"
                }
                else{
                    cell.innerText="🚩"
                }
            }
            if(board[i][j].state === "revealed"){
                cell.innerText = board[i][j].text
                cell.classList.add("revealed")
            }
            row.appendChild(cell)
        }
        boardElement.appendChild(row)
    }
}

showBoard()

function onRightClick(i,j){
    if(gameFinished){
        return;
    }
    if(board[i][j].state === "revealed"){
        return;
    }
    if(board[i][j].state === "flag"){
        board[i][j].state = "hidden"
        numOfFlags--;
    }
    else{
        board[i][j].state = "flag"
        numOfFlags++;
    }
    showBoard();
}

function onClick(i,j) {
    if(gameFinished){
        return
    }
    if(board[i][j].state === "flag"){
        return
    }
    if(board[i][j].state === "revealed"){
        const cells = getNearbyCells(i,j);
        flagCount = 0;
        cells.forEach(cell => {
            if(cell.state === "flag") {
                flagCount++;
            }
        })
        if(board[i][j].text === flagCount && board[i][i].text !== 0){ 
            cells.forEach(cell => {
                if(cell.state !== "flag"){
                    revealTile(cell.i, cell.j)
                }
            })  
        }
        
    }
    if(board[i][j].mine){
        board.forEach(row => 
            row.forEach(cell => {
                if(cell.mine && cell.state !== "flag"){
                    cell.state="mine"
                }
            })
        )
        lose = true
    }
    else{
        revealTile(i,j)
    }
    checkWin();
    showBoard();
}

function setSmiley(){
    let smileyElement = document.getElementById("smiley")
    if(!gameFinished){
        smileyElement.innerText = "🙂"
    }
    else{
        if(win){
            smileyElement.innerText = "😎"

        }
        else{
            smileyElement.innerText = "😵"

        }
    }
}
function checkWin(){
    let revealedCells = 0
    
    if (lose){
        gameFinished = true;
    }
    board.forEach(row => {
        row.forEach(cell => {
            if(cell.state === "revealed")
                revealedCells++;
        })
    })
    let totalNonMineCells = boardHeight * boardWidth - numOfMines
    if(revealedCells === totalNonMineCells){
        win = true;
        gameFinished = true
        numOfFlags = numOfMines
    }
    setSmiley();
}
function revealTile(i,j) {

    if(board[i][j].mine){
        board.forEach(row => 
            row.forEach(cell => {
                if(cell.mine && cell.state !== "flag"){
                    cell.state="mine"
                }
            })
        )
        lose = true
    }

    if(board[i][j].state === "revealed") {
        return;
    }
    if(!board[i][j].mine){
        board[i][j].state = "revealed";
    }
    let mineCount = 0;
    let tiles = getNearbyCells(i,j)
    tiles.forEach(tile => {
        if(tile.mine){mineCount++}
    })
    if(mineCount === 0 ){
        tiles.forEach(tile => {
            revealTile(tile.i, tile.j)
        })
    }
    else{
        board[i][j].text = mineCount;
    }
}

function getNearbyCells(i,j){
    const tiles = []
    for(x = i - 1; x <= i + 1; x++ ){
        for( y = j - 1; y <= j + 1; y++){
            if (board[x]?.[y]){
                tiles.push(board[x][y])
            }
        }
    }
    return tiles;
}

function onButtonClick(){
    while(board.length > 0) {
        board.pop();
    }
    numOfFlags = 0
    timeElapsed = 0
    timer.innerText = "00"+timeElapsed
    gameFinished = false;
    firstClicked = false;
    lose = false;
    win = false;
    minesLeft = numOfMines - numOfFlags
    let width = document.getElementById("width-input").value;
    let height = document.getElementById("height-input").value;
    let mines = document.getElementById("mines-input").value;
    try {
        width = Math.floor(Number(width))
        height = Math.floor(Number(height))
        mines = Math.floor(Number(mines))
        if (mines >= width * height){
            return 
        }
    }
    catch{
        return
    }
    boardWidth = width
    boardHeight = height
    numOfMines = mines;
    console.log(((boardWidth/2)-2)*30-10);
    smiley.style.setProperty('margin-left',`${((boardWidth/2)-2.5)*30-14}px`)
    smiley.style.setProperty('margin-right',`${((boardWidth/2)-2.5)*30-14}px`)
    initBoard();
    showBoard();
    setSmiley();
}

function onSmileyClick(){
    if(gameFinished){
        onButtonClick()
    }
}

function highlightAdjecent(i,j){
    if(board[i][j].state !== "revealed"){
        return;
    }
    const cells = getNearbyCells(i,j)
    cells.forEach(cell => {
        if(cell.state === "hidden"){
            cell.hold = true;
        }
    })
    showBoard();    
}
function unhighlightAdjecent(i,j) {
    const cells = getNearbyCells(i,j)
    cells.forEach(cell => {
        if(cell.hold){
            cell.hold = false;
        }
    })
    showBoard();
}

function preset(value){
    if(value === "Easy"){
        document.getElementById("width-input").value = 10;
        document.getElementById("height-input").value = 10;
        document.getElementById("mines-input").value = 10;
    }
    if(value === "Medium"){
        document.getElementById("width-input").value = 16;
        document.getElementById("height-input").value = 16;
        document.getElementById("mines-input").value = 40;
    }
    if(value === "Hard"){
        document.getElementById("width-input").value = 30;
        document.getElementById("height-input").value = 16;
        document.getElementById("mines-input").value = 99;
    }
}
