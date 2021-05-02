const pawn = 100;
const knight = 300;
const bishop = 400;
const rook = 500;
const queen = 900;
const king = 50000;


function computerMakeMove()
{
  var bestMove = searchForMove(6);
  moveMade(bestMove.startSquare, bestMove.targetSquare);
}
function searchForMove(depth)
{
  //first clone the board state so that we could return to it easily later on
  var tBoard = cloneBoard(board);
  var tcastling = cloneCastle(castling);

  var tempMoves = generateMoves(); //Sees all the moves the computer can make
  var randomIndex = Math.floor(Math.random() * moves.length);
  var bestMove = tempMoves[randomIndex]; // the best possible move (picked at random at the very start)
  var bestScore = -40000;

    //loop through each move and check what posibilities are there for later
    for(var x = 0; x < tempMoves.length;x++)
    {
      simulateMoves(tempMoves[x].startSquare, tempMoves[x].targetSquare); //simulate the move
      for(var i = 0; i < depth;i++) //how much we are going to look into the future
      {
        var responseBoard = cloneBoard(board);
        var responseCastling = cloneCastle(castling);
        var responseMoves = generateMoves();
        var bestResponseMove = -40000; //calculates the score of the response move
        var responseMove = responseMoves[0];
        var evaluation;
        for(var p = 0; p < responseMoves.length;p++)
        {
          simulateMoves(responseMoves[p].startSquare, responseMoves[p].targetSquare);
          changeTurn(); //reset the turn, because it will be changed
          evaluation = evaluateBothSides(board)
          if(evaluation > bestResponseMove)
          {
            bestResponseMove = evaluation;
            responseMove = responseMoves[p];
          }
          board = cloneBoard(responseBoard);
          castling = cloneCastle(responseCastling)
        }
        simulateMoves(responseMove.startSquare, responseMove.targetSquare);
      }
      currentTurn = compColor;
    var evaluate = evaluateBothSides(board);
    if(bestScore < evaluate)
    {

      bestMove = tempMoves[x];
      bestScore = evaluate;
    }
    //reset the board to the starting position
    board = cloneBoard(tBoard);
    castling = cloneCastle(tcastling)

  }
  gameOver = 0;
  return bestMove;
}

function evaluateBothSides(tempBoard)
{
  var white = positionEvaluation(tempBoard, "w");
  var black = positionEvaluation(tempBoard, "b");


  var difference = white - black; //see the difference to know which is the more favorable position at that time
  if(currentTurn == "b")
    difference = black - white;
  else {
    difference = white - black;
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
        sum+= evaluateKnight(i);
      else if(tempBoard[i].charAt(1) == "b")
        sum+= evaluateBishop(i);
      else if(tempBoard[i].charAt(1) == "r")
        sum+=rook;
      else if(tempBoard[i].charAt(1) == "q")
        sum+=evaluateQueen(i);
      else if(tempBoard[i].charAt(1) == "k")
        sum+=king;
    }
  }
  return sum;
}
function evaluateKnight(i)
{
  var val;
  var y = Math.trunc(i/8);
  var x = i%8;
  var centerDistanceY;
  var centerDistanceX;
  if(compColor == "w")
    {
     centerDistanceY = y - 3;
    }
  else {
     centerDistanceY = y - 4;
  }
  if(centerDistanceY < 0)
    centerDistanceY*=-1;
    centerDistanceX = x-4;
    if(centerDistanceX < 0)
      centerDistanceX*=-1;
  val = knight+20-(centerDistanceY*2)-(centerDistanceX*2);
  return val;
}
function evaluateBishop(i)
{
  var val;
  var y = Math.trunc(i/8);
  var centerDistanceY;
  if(compColor == "w")
    {
     centerDistanceY = y - 3;
    }
  else {
     centerDistanceY = y - 4;
  }
  if(centerDistanceY < 0)
    centerDistanceY*=-1;
  val = bishop+10-(centerDistanceY);
  return val;
}
function evaluateQueen(i)
{
  var val = knight;
  var y = Math.trunc(i/8);
  var centerDistanceY;
  if(compColor == "w")
    {
     centerDistanceY = y - 3;
    }
  else {
     centerDistanceY = y - 4;
  }
  if(centerDistanceY < 0)
    centerDistanceY*=-1;
  val = queen+30-(centerDistanceY*4);
  return val;
}
function eveluatePawn(i)
{
  var val;
  var y = Math.trunc(i/8);
  if(compColor == "w")
  {
    val = pawn+1*((y-7)*-1);
  }
  else {
    val = pawn+1*y;
  }

  return val;
}
