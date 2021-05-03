/*
  The AI
*/
//the values of each piece
const pawn = 100;
const knight = 300;
const bishop = 400;
const rook = 500;
const queen = 900;
const king = 80000;

//Makes the computer search for the best move and execute it
function computerMakeMove()
{
  var bestMove = searchForMove(3);
  moveMade(bestMove.startSquare, bestMove.targetSquare);
}
//searches for the best move the AI can make
function searchForMove(depth)
{
  //first clone the board state so that we could return to it easily later on
  var tBoard = cloneBoard(board);
  var tcastling = cloneCastle(castling);

  var tempMoves = generateMoves(); //Sees all the moves the computer can make
  var randomIndex = Math.floor(Math.random() * moves.length); //pick a move at random for the start
  var bestMove = tempMoves[randomIndex]; // the best possible move (picked at random at the very start)
  var bestScore = -40000;

    //loop through each move and check what posibilities are there for later
    for(var x = 0; x < tempMoves.length;x++)
    {
      simulateMoves(tempMoves[x].startSquare, tempMoves[x].targetSquare); //simulate the move on the board
      for(var i = 0; i < depth;i++) //how much we are going to look into the future
      {
        var responseBoard = cloneBoard(board); //clones the board to return to it later
        var responseCastling = cloneCastle(castling);
        var responseMoves = generateMoves();
        var bestResponseMove = -40000; //calculates the score of the response move
        var responseMove = responseMoves[0];
        var evaluation;
        for(var p = 0; p < responseMoves.length;p++)
        {
          simulateMoves(responseMoves[p].startSquare, responseMoves[p].targetSquare);
          changeTurn(); //reset the turn, because it will be changed
          evaluation = evaluateBothSides(board) //evaluates how benefitial the move is for the current turn
          if(evaluation > bestResponseMove) //if it's more benefitial than the current best move then use it
          {
            bestResponseMove = evaluation;
            responseMove = responseMoves[p];
          }
          board = cloneBoard(responseBoard); //reset the board state back to how it was before the simulated move
          castling = cloneCastle(responseCastling)
        }
        simulateMoves(responseMove.startSquare, responseMove.targetSquare); //simulate the best possible move
      }
      currentTurn = compColor;
    //after the search is done for the move, see what state of the board will be in by the end of the "depth" search and if it's better than what the AI had before save the move
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

//evaluates both sides positions on the current state of the board
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
//evaluates a position
function positionEvaluation(tempBoard, c)
{
  var sum = 0;
  for(var i = 0; i < tempBoard.length; i++) //checks all the pieces on the board
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
//evaluates a knight. The closer to the center a knight is the bigger it's value
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
  val = knight+20-(centerDistanceY*3)-(centerDistanceX*3);
  return val;
}
//evaluates a bishop, the closer to center the better the value
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
  val = bishop+10-(centerDistanceY*2);
  return val;
}
//evaluates the queen, the closer to center the better
function evaluateQueen(i)
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
  val = queen+20-(centerDistanceY*2);
  return val;
}
//Evaluates the pawn, the closer the pawn is to the opponent, the better the value
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
