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
var board =  new Array(64).fill("");

var fenstr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

const WIDTH = 70;
const HEIGHT = 70;
var stage = new createjs.Stage("demoCanvas");
var canvas = document.getElementById("demoCanvas");
canvas.style.backgroundColor = "#009113";
let grid = []; // the grid
let pieceImages = []; //contains the map to every piece image

var pieces = [];
var queue = new createjs.LoadQueue();
