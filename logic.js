/*
  The model of the game. Holds all the calculations for the game
*/

//calculates the distance to the side from each square and initialises the starting position of the board
function precomputeData() {
  for (var j = 0; j < 8; j++) {
    for (var i = 0; i < 8; i++) {
      //calculates the distance to the edge of a square from every direction
      var north = j;
      var south = 7 - j;
      var west = i;
      var east = 7 - i;
      var square = [north, south, east, west, Math.min(north, west), Math.min(north, east), Math.min(south, west), Math.min(south, east)];
      squaresToEdge.push(square);
    }
  }
  initialiseFenString(fenstr);
  moves = generateMoves();

}
//undoes the most recent move
function undoMove() {
  var btn = document.getElementById("undo-btn");
  btn.onclick = function() {
    if (turnNumber > 1 && (aiOn == 0) && backup == 1) //only available when AI is off
    {
      backup = 0;
      board = cloneBoard(prevBoardState);
      castling = cloneCastle(previousCastling);
      fenstr = updateFenStr()
      var temp = [];
      cleanBoard(temp);
      parseFen(fenstr); //refreshes the board
      stage.update();
      changeTurn();
      moves = generateMoves();
    }

  };
}
//Used at the very beging of launching to initialise the starting position of the board
function initialiseFenString(fenStr) {
  let lines = fenStr.split("/");
  lines.forEach(parseFenLine);
  prevBoardState = cloneBoard(board);
}

//Parses all fen symbols
function parseFenLine(item, index) {
  var x = 8 * index; //since all squares are from 0-63 this is how we calculate where to check each piece
  for (var i = 0; i < item.length; i++) {
    var symbol = item[i];
    if (!isNaN(symbol)) //returns true if the symbol is a number
    {
      x += parseInt(symbol);
    } else {
      //check which piece is it
      if (symbol == "p")
        board[x] = wPawn;
      else if (symbol == "P")
        board[x] = bPawn;
      else if (symbol == "k")
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
function generateMoves() {
  var moves = [];

  for (var startSquare = 0; startSquare < 64; startSquare++) {
    if (isValidPiece(board[startSquare], currentTurn)) {
      generateSlidingPiece(startSquare, board[startSquare], moves);
      generatePawnMoves(startSquare, board[startSquare], moves);
      generateKnightMoves(startSquare, board[startSquare], moves);
    }
  }
  return moves;
}
//clones the current state of the board
function cloneBoard(toClone) {
  var bClone = new Array(64).fill("");
  for (var i = 0; i < bClone.length; i++) {
    bClone[i] = toClone[i];
  }
  return bClone
}

//clones the castling states for each rook
function cloneCastle(cast) {
  var cClone = [0, 0, 0, 0];
  for (var i = 0; i < castling.length; i++) {
    cClone[i] = cast[i];
  }
  return cClone;
}

//check if it's a valid piece to generate moves to
function isValidPiece(piece, turn)
{
  return (piece != "" && piece.charAt(0) == turn);
}

//Generates moves for the "knight" piece
function generateKnightMoves(startSquare, piece, moves) {
  var sideDirection;
  var end;
  if (piece.charAt(1) == "n") {
    for (var direction = 0; direction < 4; direction++) {
      if (squaresToEdge[startSquare][direction] < 2) //if there aren't at least 2 open spaces in that direction then skip it
        continue;
      if (direction < 2) { //if it's north or south look east and west for open spaces
        sideDirection = 2;
        end = 4;
      } else if (direction >= 2) { //if it's east or west then look north or south for open spaces
        sideDirection = 0;
        end = 2;
      }
      for (sideDirection; sideDirection < end; sideDirection++) {
        if (squaresToEdge[startSquare][sideDirection] == 0) //skip iteration of loop if there is no space in that direction
          continue;

        var targetSquare = startSquare + directionOffsets[direction] * 2 + directionOffsets[sideDirection]; //gets the target square
        var pieceOnSquare = board[targetSquare];

        if (pieceOnSquare != "" && pieceOnSquare.charAt(1) != "e" && pieceOnSquare.charAt(0) == currentTurn) //if it's a friendly piece on that square then the piece cannot be moved
          continue;
        if (pieceOnSquare.charAt(1) == "k" && pieceOnSquare.charAt(0) != currentTurn) { //if there's a king on that square then that means the current turn won
          gameOver = 1;
        }
        var move = {
          startSquare: startSquare,
          targetSquare: targetSquare
        };

        moves.push(move);
      }
    }
  }
}

//Generates moves for the pawn piece
function generatePawnMoves(startSquare, piece, moves) {
  var directions;
  if (piece.charAt(1) == "p") {
    if (piece.charAt(0) == "w")
      directions = [0, 4, 5]; // the directions that the piece can go to 0 - north, 4 - north west, 5 - north east
    else if (piece.charAt(0) == "b") {
      directions = [1, 6, 7]; // the directions that the piece can go to 1 - south, 6 - south west, 7 - south east
    }
    for (var i = 0; i < 3; i++) {
      if (squaresToEdge[startSquare][directions[i]] == 0) //if there are no squares in that direction of the piece skip it
      {
        continue;
      }
      if (i == 0) // check north/south of the pawn first
      {
        var depth = 1;
        if (startSquare > 47 && startSquare < 56 && piece.charAt(0) == "w") //if it hasn't been moved then it can move 2 squares instead of 1
        {
          depth = 2;
        } else if (startSquare > 7 && startSquare < 16 && piece.charAt(0) == "b") {
          depth = 2;
        }
        for (var n = 0; n < depth; n++) //generate moves
        {
          var targetSquare = startSquare + directionOffsets[directions[i]] * (n + 1);
          var pieceOnSquare = board[targetSquare];
          if (pieceOnSquare != "") {
            break;
          }
          var move = {
            startSquare: startSquare,
            targetSquare: targetSquare
          };

          moves.push(move);
        }
      } else { //genertae moves diagnally of the pawn only if there is an enemy piece to capture on it
        var targetSquare = startSquare + directionOffsets[directions[i]];
        var pieceOnSquare = board[targetSquare];
        if (pieceOnSquare != "" && pieceOnSquare.charAt(0) != currentTurn) {
          if (pieceOnSquare.charAt(1) == "k") //if there's a move that can capture the opponents king the game is over
          {
            gameOver = 1;
          }
          var move = {
            startSquare: startSquare,
            targetSquare: targetSquare
          };
          moves.push(move);
        }
      }
    }
  }
}

//Generates moves for rook, queen, bishop, king
function generateSlidingPiece(startSquare, piece, moves) {
  var direction = 0;
  var directionCount = 0;
  if (piece.charAt(1) == "q" || piece.charAt(1) == "k") //queen and king can move in all directions
  {
    direction = 0;
    directionCount = 8;
  } else if (piece.charAt(1) == "b") //if it's a bishop only take diagnal directions
  {
    direction = 4;
    directionCount = 8;
  } else if (piece.charAt(1) == "r") {
    direction = 0;
    directionCount = 4;
  }

  for (direction; direction < directionCount; direction++) { //loop through the selected directions
    for (var n = 0; n < squaresToEdge[startSquare][direction]; n++) {
      var targetSquare = startSquare + directionOffsets[direction] * (n + 1);
      var pieceOnSquare = board[targetSquare];
      if (pieceOnSquare != "" && pieceOnSquare.charAt(0) == currentTurn && pieceOnSquare.charAt(1) != "e") //if it's a friendly piece then skip to the next direction
      {
        break;
      }
      var move = {
        startSquare: startSquare,
        targetSquare: targetSquare
      };
      if (pieceOnSquare != "" && pieceOnSquare.charAt(1) == "k" && pieceOnSquare.charAt(0) != currentTurn) //if there's a move that can capture the opponents king the game is over
      {
        gameOver = 1;
        break;
      }

      moves.push(move);
      if ((pieceOnSquare != "" && pieceOnSquare.charAt(1) != "e" && pieceOnSquare.charAt(0) != currentTurn) || (!castlingMove(direction, piece, n, targetSquare) && piece.charAt(1) == "k")) //if it's the opposite color piece then capture it and move to the next direction
      {
        break;
      }
    }
  }
}
//check if a king can castle
function castlingMove(curDirection, piece, num, targetSquare) {
  var p = board[targetSquare + directionOffsets[3] * 2]; //checks if there are no pieces between the rook and the king, else castling can't be done
  if (curDirection == 2 && num < 1) //right
  {
    if (piece == wKing)
      return (castling[3] == 0);
    else if (piece == bKing)
      return (castling[1] == 0)
  } else if (curDirection == 3 && num < 1 && p == "") //left
  {
    if (piece == wKing)
      return (castling[2] == 0);
    else if (piece == bKing)
      return (castling[0] == 0);
  }
  return false;
}

//Executes a move. This can also be considered the "Game loop" of the game
function moveMade(startSquare, targetSquare) {
  if (aiOn == 0) { //the Undo button works only if AI is dissabled
    backup = 1;
  }
  turnNumber++; //incriment the turn number
  previousCastling = cloneCastle(castling); //save the previous board state before doing anything else
  prevBoardState = cloneBoard(board);
  if (castling.includes(0)) //check if its still possible for a king to castle
  {
    executeCastling(startSquare, targetSquare);
    checkCastling(startSquare, targetSquare);
  }
  upgradePawnLogic(startSquare, targetSquare);
  enPassantCheck(startSquare, targetSquare);
  board[targetSquare] = board[startSquare]; //moves the pieces
  board[startSquare] = "";
  changeTurn();
  removeHidden(currentTurn);
  moves = generateMoves(board); //generates new moves
  if (gameOver == 1) //check if game is over
  {
    var endText;
    if (currentTurn == "w") {
      endText = "White wins!";
    } else {
      endText = "Black wins!";
    }
    document.getElementById("top").style.display = "block";
    document.getElementById("end-text").innerHTML = endText;
  }
  fenstr = updateFenStr(); //updates the fenstr with the current state of the board
  if (aiOn == 1 && compColor == currentTurn) { // if the ai is on the makes the computer make the move
    computerMakeMove();
  }
}

//Used for the AI to simulate moves on the board
function simulateMoves(startSquare, targetSquare) {
  if (castling.includes(0)) //check if its still possible for a king to castle
  {
    executeCastling(startSquare, targetSquare);
    checkCastling(startSquare, targetSquare);
  }
  upgradePawnLogic(startSquare, targetSquare);
  enPassantCheck(startSquare, targetSquare);
  board[targetSquare] = board[startSquare];
  board[startSquare] = "";
  changeTurn();
  removeHidden(currentTurn);
}

//Changes the current turn
function changeTurn() {
  if (currentTurn == "w")
    currentTurn = "b";
  else
    currentTurn = "w";
}
//executes the castling for the king if needed
function executeCastling(startSquare, targetSquare) {
  if (board[startSquare].charAt(1) == "k") //only perform the check if the moved piece is a king
  {
    var diff = targetSquare - startSquare; //check how much did the piece move
    if (diff == directionOffsets[2] * 2) //if the piece was moved 2 squares to the right
    {
      var moveTarget = targetSquare + directionOffsets[3];
      if (board[startSquare] == wKing) { //check which king is it
        board[63] = ""; //move the rook at the start to the left of the king
        board[moveTarget] = wRook;
      } else {
        board[7] = "";
        board[moveTarget] = bRook;
      }
    } else if (diff == directionOffsets[3] * 2) //if the piece was moved 2 squares to the left
    {
      var moveTarget = targetSquare + directionOffsets[2];
      if (board[startSquare] == wKing) {
        board[56] = ""; //move the rook at the start to the right of the king
        board[moveTarget] = wRook;
      } else {
        board[0] = "";
        board[moveTarget] = bRook;
      }
    }
  }
}
//function that checks if it's still possible for a king to castle during the game
function checkCastling(startSquare, targetSquare) {
  var rook = bRook;
  var p = board[startSquare];
  if (p == wKing) //if white king moved then castling is not possible in both directions
  {
    castling[2] = 1;
    castling[3] = 1;
  } else if (p == bKing) {
    castling[0] = 1;
    castling[1] = 1;
  }
  for (var i = 0; i < 2; i++) {
    for (var n = 0; n < 2; n++) {
      var temp = n * 7 + i * 56; //gets the coordinates of a rooks starting position
      if ((p == rook && startSquare == temp) || (targetSquare == temp)) //if a rook moved or a rook was captured then remove the castling posibility for that rook
      {
        castling[n + 2 * i] = 1;
      }
    }
    rook = wRook; //check the white rook now
  }
}
// removes the themporary invisible pieces for "enpassant" move
function removeHidden(curTurn) {
  for (var i = 0; i < 64; i++) {
    if (board[i] == wEnPassantPawn && curTurn == "w") {
      board[i] = "";
    } else if (board[i] == bEnPassantPawn && curTurn == "b") {
      board[i] = "";
    }
  }
}
//updates the fen str of the board with a move made
function updateFenStr() {
  var x = 0;
  var fen = "";
  for (var i = 0; i < 64; i++) {
    if (i > 0 && i % 8 == 0) //if it's a new line
    {
      if (x > 0)
        fen += x.toString();
      x = 0; //reset x
      fen += "/";
    }
    var symbol = findFenSymbol(board[i]);
    if (symbol == " ") {
      x++;
    } else {
      if (x > 0)
        fen += x.toString();
      x = 0; //reset x
      fen += symbol;
    }
  }

  return fen;
}
//gets the pieces symbol to be reprisented in a fen string
function findFenSymbol(item) {
  var symbol;
  if (item == bQueen)
    symbol = "Q";
  else if (item == bKing)
    symbol = "K";
  else if (item == bPawn)
    symbol = "P";
  else if (item == bRook)
    symbol = "R";
  else if (item == bNight)
    symbol = "N";
  else if (item == bBishop)
    symbol = "B";
  else if (item == wQueen)
    symbol = "q";
  else if (item == wKing)
    symbol = "k";
  else if (item == wPawn)
    symbol = "p";
  else if (item == wRook)
    symbol = "r";
  else if (item == wNight)
    symbol = "n";
  else if (item == wBishop)
    symbol = "b";
  else
    symbol = " ";
  return symbol
}

//Check if it's possible to make an en Passant move for a pawn
function enPassantCheck(startSquare, targetSquare) {
  //now check the enpassant thingies
  if (board[startSquare] == wPawn && startSquare + directionOffsets[0] * 2 == targetSquare) //check if it's a white pawn and has moved 2 squares at the start
  {
    board[startSquare + directionOffsets[0]] = wEnPassantPawn;
  } else if (board[startSquare] == bPawn && startSquare + directionOffsets[1] * 2 == targetSquare) {
    board[startSquare + directionOffsets[1]] = bEnPassantPawn;
  }
  //now check if the target square was on an enpassant piece and that a pawn moved on it
  if (board[targetSquare] != "" && board[targetSquare].charAt(1) == "e" && board[startSquare].charAt(1) == "p") {
    for (var i = 0; i < 2; i++) {
      var dir = targetSquare + directionOffsets[i];
      if (board[dir] != "" && board[dir].charAt(0) != currentTurn && board[dir].charAt(1) == "p") {
        board[dir] = "";
      }
    }
  }
}
//Upgrades a pawn to a queen if it reached the end of the board
function upgradePawnLogic(startSquare, targetSquare) {
  if (targetSquare > -1 && targetSquare < 8 && board[startSquare] == wPawn) {
    board[startSquare] = wQueen;
  } else if (targetSquare > 55 && targetSquare < 64 && board[startSquare] == bPawn) {
    board[startSquare] = bQueen;
  }
}
