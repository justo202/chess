/*
  Holds most of the variables used in the game for easy access
*/

const bQueen = "bq";
const bKing = "bk";
const bPawn = "bp";
const bRook = "br";
const bNight = "bn";
const bBishop = "bb";
const bEnPassantPawn = "be"; //invisible pawn only used for the "en passant" rule

const wQueen = "wq";
const wKing = "wk";
const wPawn = "wp";
const wRook = "wr";
const wNight = "wn";
const wBishop = "wb";
const wEnPassantPawn = "we"; //invisible pawn only used for the "en passant" rule

var currentTurn = "w";

var moves; //holds all the possible moves, updated after every turn
var directionOffsets = [-8, 8, 1, -1, -9, -7, 7, 9];
var squaresToEdge = [];
var prevBoardState = new Array(64).fill(""); //previous board state
var board = new Array(64).fill("");
var castling = [0, 0, 0, 0]; //array that determines if castling is possible for the king (0 means it's possible, 1 means it's not)
var previousCastling = [0, 0, 0, 0];
var gameOver = 0;
var aiOn = 0; //toogles computer player on and off
var compColor = "b";
var fenstr = "RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr"; //starting fen string
var turnNumber = 1; //the current turn
var backup = 0; //turns to 1 if theres a turned saved before


const WIDTH = 70;
const HEIGHT = 70;
var stage = new createjs.Stage("demoCanvas");
var canvas = document.getElementById("demoCanvas");
canvas.style.backgroundColor = "#009113";
let grid = []; // the grid
let pieceImages = []; //contains the map to every piece image

var pieces = [];
var queue = new createjs.LoadQueue();
