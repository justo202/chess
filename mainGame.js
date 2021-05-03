/**
  The controller class of the game.
*/
function init() {
  createGrid(); //creates the grid
  precomputeData(); //initialises the pieces and starts the "loop"
  toogleOpponent(); //toogles AI on and off
  undoMove(); //undoes the most recent move
}
