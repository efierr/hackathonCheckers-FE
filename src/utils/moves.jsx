// Function to validate if a move is legal based on checkers rules
export const isValidMove = (from, toRow, toCol, gameState, currentPlayer) => {
  // Check if destination square is empty
  if (gameState[toRow][toCol] !== null) return false;

  // Get the piece that's trying to move
  const piece = gameState[from.row][from.col];
  // Calculate absolute distance of movement in rows
  const moveDistance = Math.abs(from.row - toRow);
  // Calculate absolute distance of movement in columns
  const colDistance = Math.abs(from.col - toCol);

  // Check if it's a regular one-square diagonal move
  if (moveDistance === 1 && colDistance === 1) {
    // If the piece is a king, it can move in any direction
    if (piece.isKing) return true;

    // For regular pieces, determine direction based on piece color
    const direction = piece.color === "red" ? -1 : 1;
    // Verify piece is moving in the correct direction
    return toRow - from.row === direction;
  }

  // Check if it's a jump move (two squares diagonally)
  if (moveDistance === 2 && colDistance === 2) {
    // Calculate position of jumped piece
    const jumpedRow = (from.row + toRow) / 2;
    const jumpedCol = (from.col + toCol) / 2;
    // Get the piece being jumped over
    const jumpedPiece = gameState[jumpedRow][jumpedCol];

    // For kings, allow jumps in any direction
    if (piece.isKing) {
      return jumpedPiece && jumpedPiece.color !== piece.color;
    }

    // For regular pieces, check if the jump is in the correct direction
    const direction = piece.color === "red" ? -1 : 1;
    return (
      jumpedPiece &&
      jumpedPiece.color !== piece.color &&
      toRow - from.row === 2 * direction
    );
  }

  // Check for double jump (four squares diagonally)
  if (moveDistance === 4 && colDistance === 4) {
    return isValidDoubleJump(from, toRow, toCol, gameState, currentPlayer);
  }

  // If neither condition is met, move is invalid
  return false;
};

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
