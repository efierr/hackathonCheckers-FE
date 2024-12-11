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

  
  // Get all possible moves for a piece
  export const getPossibleMoves = (row, col, gameState, currentPlayer) => {
    const possibleMoves = [];
    const piece = gameState[row][col];
    
    if (!piece || piece.color !== currentPlayer) return [];
  
    // Check all possible directions
    const directions = piece.isKing ? [-1, 1] : piece.color === 'red' ? [-1] : [1];
    
    directions.forEach(rowDir => {
      [-1, 1].forEach(colDir => {
        // Check regular move
        if (isValidMove(row, col, row + rowDir, col + colDir, gameState, currentPlayer)) {
          possibleMoves.push({ toRow: row + rowDir, toCol: col + colDir, isJump: false });
        }
        
        // Check jump move
        if (isValidMove(row, col, row + (2 * rowDir), col + (2 * colDir), gameState, currentPlayer)) {
          possibleMoves.push({ toRow: row + (2 * rowDir), toCol: col + (2 * colDir), isJump: true });
        }
      });
    });
  
    return possibleMoves;
  };
  
  // Check if a piece should be crowned
  export const shouldCrownPiece = (row, piece) => {
    if (piece.isKing) return false;
    return (piece.color === 'red' && row === 0) || (piece.color === 'black' && row === 7);
  };
  
  // Get the position of the jumped piece
  export const getJumpedPiecePosition = (fromRow, fromCol, toRow, toCol) => {
    return {
      row: fromRow + (toRow - fromRow) / 2,
      col: fromCol + (toCol - fromCol) / 2
    };
  };
  
  // Check if any jumps are available for the current player
  export const hasAvailableJumps = (gameState, currentPlayer) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState[row][col];
        if (piece?.color === currentPlayer) {
          const moves = getPossibleMoves(row, col, gameState, currentPlayer);
          if (moves.some(move => move.isJump)) {
            return true;
          }
        }
      }
    }}

  export const mapGameStateToArray = (gameState) => {
    return gameState.flat().map(piece => {
      if (!piece) return '.';
      if (piece.color === 'black') return piece.isKing ? 'B' : 'b';
      if (piece.color === 'red') return piece.isKing ? 'R' : 'r';
    });
  };