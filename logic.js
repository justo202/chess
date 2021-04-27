

function precomputeData() //calculates the distance to the side from each square
{
  alert("yes");
  for (var j = 0; j < 8; j++){

    for (var i = 0; i < 8; i++){

      //calculates the distance to the edge of a square from every direction
      var north = j;
      var south = 7-j;
      var west = i;
      var east = 7-i;

      var square = [north, south, east, west, Math.min(north,west), Math.min(north,east), Math.min(south,west),Math.min(south,east)];
      squaresToEdge.push(square);
    }
  }
  initialiseFenString(fenstr);
  moves = generateMoves();
}
function initialiseFenString(fenStr)
{
  let lines = fenStr.split("/");
  lines.forEach(parseFenLine);
}
function parseFenLine(item, index)
{
  var x = 8*index; //since all squares are from 0-63 this is how we calculate where to check each piece
  for (var i = 0; i < item.length; i++) {
    var symbol = item[i];
    if(!isNaN(symbol)) //returns true if the symbol is a number
    {
      x+=parseInt(symbol);
    }
    else
    {
      //check which piece is it
    if(symbol == "p")
        board[x] = wPawn;
    else if(symbol == "P")
         board[x] = bPawn;
    else if(symbol == "k")
          board[x] = wKing;
    else if (symbol == "K")
          board[x] = bKing;
    else if (symbol == "q")
          board[x] = wQueen;
    else if (symbol == "Q")
          board[x] = bQueen;
    else if (symbol == "n")
          board[x] = wNight;
    else if (symbol == "N")
          board[x] = bNight;
    else if (symbol == "r")
          board[x] = wRook;
    else if (symbol == "R")
          board[x] = bRook;
    else if (symbol == "b")
          board[x] = wBishop;
    else if (symbol == "B")
          board[x] = bBishop;
    x++;
    }
  }
}

// generates a list of all possible moves for each square
function generateMoves()
{
  var moves = [];

  for(var startSquare = 0; startSquare < 64;startSquare++)
  {
    if (isValidPiece(board[startSquare], currentTurn))
    {
        generateSlidingPiece(startSquare, board[startSquare], moves);
        generatePawnMoves(startSquare, board[startSquare], moves);
        generateKnightMoves(startSquare,board[startSquare],moves);
    }
  }
  return moves;
}
function isValidPiece(piece, turn) //check if it's a valid piece to generate moves to
{
  return (piece != "" && piece.charAt(0) == turn);
}
function generateKnightMoves(startSquare, piece, moves)
{
  var sideDirection;
  var end;
  if(piece.charAt(1) == "n")
  {
    for(var direction = 0; direction < 4;direction++)
    {
      if(squaresToEdge[startSquare][direction] < 2) //if there aren't at least 2 open spaces in that direction then skip it
        continue;
      if(direction < 2)
      {
        sideDirection = 2;
        end = 4;
      } else if(direction >= 2)
      {
        sideDirection = 0;
        end = 2;
      }
      for(sideDirection;sideDirection < end;sideDirection++)
      {
        if(squaresToEdge[startSquare][sideDirection] == 0) //skip iteration of loop if there is no space in that direction
          continue;

        var targetSquare = startSquare + directionOffsets[direction]*2 + directionOffsets[sideDirection]; //gets the target square
        var pieceOnSquare = board[targetSquare];

        if(pieceOnSquare != "" && pieceOnSquare.charAt(1) != "e" && pieceOnSquare.charAt(0) == currentTurn) //if it's a friendly piece on that square then the piece cannot be moved
          continue;
        var move = {startSquare: startSquare, targetSquare: targetSquare};
        moves.push(move);
      }
    }
  }
}
function generatePawnMoves(startSquare, piece, moves)
{
  var directions;
  if(piece.charAt(1) == "p")
  {
    if(piece.charAt(0) == "w")
      directions = [1, 6, 7]; // the directions that the piece can go to 2 - south, 6 - south west, 7 - south east
    else if(piece.charAt(0) == "b")
    {
      directions = [0,4,5];
    }
    for(var i = 0; i < 3;i++)
    {
      if(squaresToEdge[startSquare][directions[i]] == 0) //if there are no squares in that direction of the piece skip it
      {
        continue;
      }
      if(i == 0) // check north/south of the pawn first
      {
        var depth = 1;
        if(startSquare > 7 && startSquare < 16 && piece.charAt(0) == "w") //if it hasn't been moved then it can move 2 squares instead of 1
        {
          depth = 2;
        }else if(startSquare > 47 && startSquare < 56 && piece.charAt(0) == "b")
        {
          depth = 2;
        }
        for(var n = 0; n < depth;n++) //generate moves
        {
          var targetSquare = startSquare + directionOffsets[directions[i]]*(n+1);
          var pieceOnSquare = board[targetSquare];
          if(pieceOnSquare != "")
          {
            break;
          }
          var move = {startSquare: startSquare, targetSquare: targetSquare};
          moves.push(move);
        }
      } else { //genertae moves diagnally of the pawn only if there is an enemy piece to capture on it
        var targetSquare = startSquare + directionOffsets[directions[i]];
        var pieceOnSquare = board[targetSquare];
        if(pieceOnSquare != "" && pieceOnSquare.charAt(0) != currentTurn)
        {
          var move = {startSquare: startSquare, targetSquare: targetSquare};
          moves.push(move);
        }

      }
    }
  }
}
function generateSlidingPiece(startSquare, piece, moves)
{
  var direction = 0;
  var directionCount = 0;
  if(piece.charAt(1) == "q" || piece.charAt(1) == "k") //queen and king can move in all directions
  {
    direction = 0;
    directionCount = 8;
  }
  else if(piece.charAt(1) == "b") //if it's a bishop only take diagnal directions
  {
    direction = 4;
    directionCount = 8;
  }
  else if(piece.charAt(1) == "r")
  {
    direction = 0;
    directionCount = 4;
  }

  for(direction; direction < directionCount; direction++)
  {
    for(var n = 0; n < squaresToEdge[startSquare][direction];n++)
    {
      var targetSquare = startSquare + directionOffsets[direction] * (n+1);
      var pieceOnSquare = board[targetSquare];
      if(pieceOnSquare != "" && pieceOnSquare.charAt(0) == currentTurn && pieceOnSquare.charAt(1) != "e")  //if it's a friendly piece then skip to the next direction
      {
        break;
      }
      var move = {startSquare: startSquare, targetSquare: targetSquare};
      moves.push(move);
      if((pieceOnSquare != "" && pieceOnSquare.charAt(1) != "e" && pieceOnSquare.charAt(0) != currentTurn) || (piece.charAt(1) == "k")) //if it's the opposite color piece then capture it and move to the next direction
      {
        break;
      }
    }
  }
}
function moveMade(startSquare, targetSquare)
{
  upgradePawnLogic(startSquare,targetSquare);
  enPassantCheck(startSquare,targetSquare);
  board[targetSquare] = board[startSquare];
  board[startSquare] = "";
  if(currentTurn == "w")
    currentTurn = "b";
  else
    currentTurn = "w";

  removeHidden(currentTurn);
  moves = generateMoves(); //generates new moves

  fenstr = updateFenStr();
  console.log(fenstr);
}
function removeHidden(curTurn)
{
  for(var i = 0; i < 64;i++)
  {
    if(board[i] == wEnPassantPawn && curTurn == "w")
    {
      board[i] = "";
    }
    else if(board[i] == bEnPassantPawn && curTurn == "b")
    {
      board[i] = "";
    }
  }
}
function updateFenStr()
{
  var x = 0;
  var fen = "";
  for(var i = 0; i < 64; i++)
  {
    if(i > 0 && i%8 == 0) //if it's a new line
    {
      if(x > 0)
        fen+=x.toString();
      x = 0; //reset x
      fen+="/";
    }
    var symbol = findFenSymbol(board[i]);
    if(symbol == " ")
    {
      x++;
    }
    else {
      if(x > 0)
        fen+=x.toString();
      x = 0; //reset x
      fen+=symbol;
    }
  }

  return fen;
}
function findFenSymbol(item)
{
  var symbol;
  if(item == bQueen)
    symbol = "Q";
  else if(item == bKing)
    symbol = "K";
  else if(item == bPawn)
    symbol = "P";
  else if(item == bRook)
    symbol = "R";
  else if(item == bNight)
    symbol = "N";
  else if(item == bBishop)
    symbol = "B";
  else if(item == wQueen)
      symbol = "q";
  else if(item == wKing)
      symbol = "k";
  else if(item == wPawn)
      symbol = "p";
  else if(item == wRook)
      symbol = "r";
  else if(item == wNight)
      symbol = "n";
  else if(item == wBishop)
      symbol = "b";
  else
    symbol = " ";
    return symbol
}
function enPassantCheck(startSquare, targetSquare)
{


  //now check the enpassant thingies
  if(board[startSquare] == wPawn && startSquare+directionOffsets[1]*2 == targetSquare) //check if it's a white pawn and has moved 2 squares at the start
  {
    board[startSquare+directionOffsets[1]] = wEnPassantPawn;
  }else if(board[startSquare] == bPawn && startSquare+directionOffsets[0]*2 == targetSquare)
  {
    board[startSquare+directionOffsets[0]] = bEnPassantPawn;
  }
  //now check if the target square was on an enpassant piece and that a pawn moved on it
  if(board[targetSquare] != "" && board[targetSquare].charAt(1) == "e" && board[startSquare].charAt(1) == "p")
  {
    for(var i = 0; i < 2;i++)
    {
      var dir = targetSquare+directionOffsets[i];
      if(board[dir] != "" && board[dir].charAt(0) != currentTurn && board[dir].charAt(1) == "p")
      {
        board[dir] = "";
      }
    }
  }
}
function upgradePawnLogic(startSquare, targetSquare)
{
  if(targetSquare > -1 && targetSquare < 8 && board[startSquare] == bPawn)
  {
    board[startSquare] = bQueen;
  }
  else if (targetSquare > 55 && targetSquare < 64 && board[startSquare] == wPawn)
  {
    board[startSquare] = wQueen;
  }
}
