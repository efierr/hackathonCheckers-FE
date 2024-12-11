// Function to execute a move and return new game state
export const executeMove = (from, toRow, toCol, gameState) => {
  const newGameState = [...gameState];
  newGameState[toRow][toCol] = newGameState[from.row][from.col];
  newGameState[from.row][from.col] = null;

  const moveDistance = Math.abs(from.row - toRow);
  const jumpMade = moveDistance === 2;

  

  if (jumpMade) {
    const jumpedRow = (from.row + toRow) / 2;
    const jumpedCol = (from.col + toCol) / 2;
    newGameState[jumpedRow][jumpedCol] = null;
  }

  return { newGameState, jumpMade };
};

export const isValidDoubleJump = (
  from,
  toRow,
  toCol,
  gameState,
  currentPlayer
) => {
  const piece = gameState[from.row][from.col];
  const midRow1 = (from.row + toRow) / 2;
  const midCol1 = (from.col + toCol) / 2;
  const midRow2 = (midRow1 + toRow) / 2;
  const midCol2 = (midCol1 + toCol) / 2;

  // Check if middle squares contain opponent's pieces
  const jumpedPiece1 = gameState[midRow1][midCol1];
  const jumpedPiece2 = gameState[midRow2][midCol2];

  if (
    !jumpedPiece1 ||
    !jumpedPiece2 ||
    jumpedPiece1.color === piece.color ||
    jumpedPiece2.color === piece.color
  ) {
    return false;
  }

  // For kings, allow jumps in any direction
  if (piece.isKing) {
    return true;
  }

  // For regular pieces, check if the jump is in the correct direction
  const direction = piece.color === "red" ? -1 : 1;
  return toRow - from.row === 4 * direction;
};

export const hasAdditionalJumps = (row, col, gameState, currentPlayer) => {
  const directions = [
    { row: -2, col: -2 },
    { row: -2, col: 2 },
    { row: 2, col: -2 },
    { row: 2, col: 2 },
  ];

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;
    if (isValidMove({ row, col }, newRow, newCol, gameState, currentPlayer)) {
      return true;
    }
  }
  return false;
};

export const finishTurn = (newGameState, currentPlayer) => {
  // Check for new kings
  newGameState = checkForKing(newGameState);

  // Switch to the other player
  const nextPlayer = currentPlayer === "red" ? "black" : "red";

  return {
    gameState: newGameState,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    jumpCount: 0,
  };
};
