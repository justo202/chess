
//Loads the necesarry assets for the game
function createGrid() {
  createChessGrid();
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);
  queue.on("progress", handleFileProgress);
  queue.on("fileload", handleFileLoad);
  queue.on("complete", handleComplete, this);
    queue.loadManifest([
     {id: "bdt", src:"./resources/Chess_bdt60.png"},
     {id: "blt", src:"./resources/Chess_blt60.png"},
     {id: "kdt", src:"./resources/Chess_kdt60.png"},
     {id: "klt", src:"./resources/Chess_klt60.png"},
     {id: "ndt", src:"./resources/Chess_ndt60.png"},
     {id: "nlt", src:"./resources/Chess_nlt60.png"},
     {id: "pdt", src:"./resources/Chess_pdt60.png"},
     {id: "plt", src:"./resources/Chess_plt60.png"},
     {id: "qdt", src:"./resources/Chess_qdt60.png"},
     {id: "qlt", src:"./resources/Chess_qlt60.png"},
     {id: "rdt", src:"./resources/Chess_rdt60.png"},
     {id: "rlt", src:"./resources/Chess_rlt60.png"}
 ]);
}

function handleFileProgress(event)
{
   console.log("Progress: "+queue.progress*100 + " %");
}

function handleFileLoad(event)
{
   var image = queue.getResult(event.item.id);
   var bitmap = new createjs.Bitmap(image);
   pieceImages.push(image);
}

//load the images only after the assets have been loaded
function handleComplete(event) {
  console.log("Loading Completed");
parseFen(fenstr) //sets the board up
}
//parses a given fen string
function parseFen(fenStr)
{
  let lines = fenStr.split("/");
  lines.forEach(parseLine);
}
//Parses each fen strings line and places the piece image on the correct spot
function parseLine(item, index)
{
  var y = index;
  var x = 0;
  for (var i = 0; i < item.length; i++) {
    var symbol = item[i];
    if(!isNaN(symbol)) //returns true if the symbol is a number
    {
      x+=parseInt(symbol);
    }
    else
    {
      //check which piece is it
    var piece = new createjs.Shape();
    var image;
    if(symbol == "p")
        image = pieceImages[7];
    else if(symbol == "P")
       image = pieceImages[6];
    else if(symbol == "k")
      image = pieceImages[3];
    else if (symbol == "K")
      image = pieceImages[2];
    else if (symbol == "q")
      image = pieceImages[9];
    else if (symbol == "Q")
      image = pieceImages[8];
    else if (symbol == "n")
      image = pieceImages[5];
    else if (symbol == "N")
      image = pieceImages[4];
    else if (symbol == "r")
      image = pieceImages[11];
    else if (symbol == "R")
      image = pieceImages[10];
    else if (symbol == "b")
      image = pieceImages[1];
    else if (symbol == "B")
      image = pieceImages[0];
    piece.graphics.beginBitmapFill(image, "no-repeat").drawRect(0,0,HEIGHT,WIDTH).endFill();
    piece.x = grid[x][y].x; //actual coordinates of a piece on the canvas
    piece.y = grid[x][y].y;
    piece.gridx = x;  //grid coordinates of a piece
    piece.gridy = y;
    piece.type = symbol;
    grid[x][y].placedPiece = piece;
    piece.setBounds(piece.x,piece.y,HEIGHT,WIDTH);
    piece.on("mousedown", onclickPiece);
    stage.addChild(piece);
    x++;
    }
  }
}
//Toogles AI off and on
function toogleOpponent()
{
  var btn = document.getElementById("toogle-btn");
  var txt = document.getElementById("btn-txt");
  btn.onclick = function()
{
  if (aiOn == 0)
  {
    aiOn = 1;
    txt.innerHTML = "Disable Ai opponent";
      if(currentTurn == "b")
        compColor = "w";
      else
        compColor = "b";
  }
  else
  {
    aiOn = 0;
    txt.innerHTML = "Enable Ai opponent"
  }
};
}
//function that runs when a piece is clicked, which also enables drag and drop
function onclickPiece(evt)
{
  var x = evt.currentTarget.gridx;
  var y = evt.currentTarget.gridy;
  var availableTiles = []; //array of lit up squares so that it would be easy to remove them later
  var tileNumber = y*8+x; //gets the tile number on which the piece is on
  var movable = 0; //0 is false
  for(var n = 0; n < moves.length;n++)
  {
    if(moves[n].startSquare == tileNumber) //if there's a move which has the piece on the start square, means the piece can be moved
    {
      movable = 1; //1 means it's true (piece is movable)
      var targetx = moves[n].targetSquare%8; //gets the x index
      var targety = Math.trunc(moves[n].targetSquare/8); //gets the y index

      var shape = new createjs.Shape(); //the square that will be lit up
      shape.graphics.beginFill("red").drawRect(0,0,HEIGHT,WIDTH).endFill();
      shape.gridx = targetx; //the grid coordinates for easy access later
      shape.gridy = targety;
      shape.x = grid[targetx][targety].x; //the actual coordinates of the shape
      shape.y = grid[targetx][targety].y;
      shape.alpha = .5;
      availableTiles.push(shape);
      stage.addChild(shape);
      stage.update();
    }
  }
  if(movable == 1) //allow a piece to be dragged and dropped only if there are available moves
  {
    evt.currentTarget.on("pressmove", dragPiece);
    evt.currentTarget.on("pressup", function(){
    dropPiece(evt, availableTiles, x, y);
    });
  }
}
//enables the piece to be dragged around
function dragPiece(evt)
{
  evt.currentTarget.x = evt.stageX-WIDTH/2;
  evt.currentTarget.y = evt.stageY-HEIGHT/2;
  stage.setChildIndex(evt.currentTarget, stage.getNumChildren()-1); //brings piece to the front
  stage.update();
}
//executes when the piece is dropped in a location
function dropPiece(evt, availableTiles, startx, starty)
{
  var correct = 0; //variable that decides if the piece was placed in the correct spot
  for(var i = 0; i < availableTiles.length;i++)
  {
    if(intersect(availableTiles[i]))
    {
      correct = 1;
      evt.currentTarget.x = availableTiles[i].x;
      evt.currentTarget.y = availableTiles[i].y;
      var x = evt.currentTarget.gridx;
      var y = evt.currentTarget.gridy;
      var tilex = availableTiles[i].gridx;
      var tiley = availableTiles[i].gridy;
      grid[x][y].placedPiece = ""; //since the piece has been moved the starting square is free now
      if(grid[tilex][tiley].placedPiece != "")
      {
        stage.removeChild(grid[tilex][tiley].placedPiece); //removes the piece that was on that square from the board
      }
      grid[tilex][tiley].placedPiece = evt.currentTarget; //updates the grid to show that there's a piece on the board at that location
      evt.currentTarget.gridx = tilex;
      evt.currentTarget.gridy = tiley;

      break;
    }
  }
  cleanBoard(availableTiles); // cleans the board of all pieces

  if(correct == 0) // if the piece was not placed in the correct place, then return it to it's original square.
  {
    evt.currentTarget.x = grid[startx][starty].x;
    evt.currentTarget.y = grid[startx][starty].y;
  }
  else { //if the piece was moved then a turn was made and swap turns and update info
    var startSquare = starty*8+x;
    var endSquare = evt.currentTarget.gridy*8+evt.currentTarget.gridx;

    moveMade(startSquare, endSquare); //updates the internal logic of the game
  }

  parseFen(fenstr); //refreshes the board
  stage.update();
}
//removes all the squares that indicate moves from the board and all the pieces
function cleanBoard(shapes)
{
  for(var i = 0; i < shapes.length;i++) //removes all the red squares
  {
    stage.removeChild(shapes[i]);
  }
  for (var j = 0; j < 8; j++) { //cleans the entire board
    for (var i = 0; i < 8; i++) {
      if(grid[j][i].placedPiece != "")
        stage.removeChild(grid[j][i].placedPiece);
    }
  }
}
  //check if piece is on a grid square small code snippet taken from https://codepen.io/samualli/pen/xbVGpP/
function intersect(obj){
  var rightSide = obj.x + WIDTH;
  var bottom = obj.y + HEIGHT;
  if(stage.mouseX > rightSide || stage.mouseX < obj.x) return false;
  if(stage.mouseY > bottom || stage.mouseY < obj.y) return false;
  return true;
}
//Creates the chess grid
function createChessGrid() {
  var color = "w";
  for (var j = 0; j < 8; j++) {
    let line = [];
    for (var i = 0; i < 8; i++) {
      var tile = createTile(j * WIDTH + 20, i * HEIGHT + 20, color);
      tile.placedPiece = "";
      line.push(tile);
      if (color == "w")
        color = "b";
      else {
        color = "w";
      }
    }
    if (color == "w")
      color = "b";
    else {
      color = "w";
    }
    grid.push(line);
  }
}
//creates a new tile for the grid
function createTile(x, y, color) {
  var tile = new createjs.Shape();
  if (color == "w")
    tile.graphics.beginFill("#fcfcfc");
  else if (color == "b")
    tile.graphics.beginFill("#545454");
  tile.graphics.drawRect(0, 0, WIDTH, HEIGHT);
  tile.graphics.endFill();
  stage.addChild(tile);
  tile.x = x;
  tile.y = y;
  tile.setBounds(tile.x,tile.y,WIDTH,HEIGHT);
  return tile;
}
