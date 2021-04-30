const pawn = 100;
const knight = 300;
const bishop = 400;
const rook = 500;
const queen = 900;
const king = 50000;


function computerMakeMove()
{
  var randomElement = moves[Math.floor(Math.random() * moves.length)];
  var bestMove = searchForMove(1);
  moveMade(bestMove.startSquare, bestMove.targetSquare);


}

function searchForMove(depth)
{
  //first clone the board state so that we could return to it easily later on
  var tBoard = cloneBoard(board);
  var tcastling = cloneCastle(castling);

  var tempMoves = generateMoves(); //Sees all the moves the computer can make
  var bestMove = tempMoves[0]; // the best possible move
  var bestScore = -1;

    //loop through each move and check what posibilities are there for later
    for(var x = 0; x < tempMoves.length;x++)
    {
      simulateMoves(tempMoves[x].startSquare, tempMoves[x].targetSquare); //simulate the move
      for(var i = 0; i < depth;i++) //how much we are going to look into the future
      {
        var bestResponseMove = -50000; //calculates the score of the response move
        var responseMove = {startSquare: -1, endSquare: -1};
        var responseBoard = cloneBoard(board);
        var responseCastling = cloneCastle(castling);
        var responseMoves = generateMoves();
        for(var p = 0; p < responseMoves.length;p++)
        {
          simulateMoves(responseMoves[p].startSquare, responseMoves[p].targetSquare);
          changeTurn(); //reset the turn, because it will be changed
          if(evaluateBothSides(board) > bestResponseMove)
          {
            bestResponseMove = evaluateBothSides(board);
            responseMove = responseMoves[p];
          }
          board = cloneBoard(responseBoard);
          castling = cloneCastle(responseCastling)
        }
        simulateMoves(responseMove.startSquare, responseMove.targetSquare);
      }
    if(bestScore < evaluateBothSides(board))
    {
      bestMove = tempMoves[x];
      bestScore = evaluateBothSides(board);
    }
    //reset the board to the starting position
    board = cloneBoard(tBoard);
    castling = cloneCastle(tcastling)
    currentTurn = compColor;
  }
  gameOver = 0;
  return bestMove;
}

function evaluateBothSides(tempBoard)
{
  var white = positionEvaluation(tempBoard, "w");
  var black = positionEvaluation(tempBoard, "b");


  var difference = white - black; //see the difference to know which is the more favorable position at that time
  if(compColor == "b")
    difference = black- white;
  else {
    difference = white -black;
  }
    return difference;
}
function positionEvaluation(tempBoard, c)
{
  var sum = 0;
  for(var i = 0; i < tempBoard.length; i++)
  {
    if(tempBoard[i].charAt(0) == c)
    {
      if(tempBoard[i].charAt(1) == "p")
        sum+= eveluatePawn(i);
      else if(tempBoard[i].charAt(1) == "n")
        sum+= knight;
      else if(tempBoard[i].charAt(1) == "b")
        sum+= bishop;
      else if(tempBoard[i].charAt(1) == "r")
        sum+=rook;
      else if(tempBoard[i].charAt(1) == "q")
        sum+=queen;
      else if(tempBoard[i].charAt(1) == "k")
        sum+=king;
    }
  }
  return sum;
}
function eveluatePawn(i)
{
  var val;
  var y = Math.trunc(i/8);
  if(compColor == "w")
  {
    val = pawn+2*((y-7)*-1);
  }
  else {
    val = pawn+2*y;
  }

  return val;
}
