// Helper function to check if a move is within board boundaries
const isWithinBoard = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Function to validate if a move is legal for regular pieces
const isValidRegularMove = (from, toRow, toCol, gameState) => {
  const piece = gameState[from.row][from.col];
  if (!piece) return false;

  const moveDistance = Math.abs(from.row - toRow);
  const colDistance = Math.abs(from.col - toCol);

  if (moveDistance === 1 && colDistance === 1) {
    const direction = piece.color === "red" ? -1 : 1;
    return toRow - from.row === direction;
  }

  if (moveDistance === 2 && colDistance === 2) {
    const jumpedRow = (from.row + toRow) / 2;
    const jumpedCol = (from.col + toCol) / 2;
    const jumpedPiece = gameState[jumpedRow][jumpedCol];
    const direction = piece.color === "red" ? -1 : 1;
    return (
      jumpedPiece &&
      jumpedPiece.color !== piece.color &&
      toRow - from.row === 2 * direction
    );
  }

  return false;
};

// Function to validate if a move is legal for king pieces
const isValidKingMove = (from, toRow, toCol, gameState) => {
  const piece = gameState[from.row][from.col];
  if (!piece || !piece.isKing) return false;

  const moveDistance = Math.abs(from.row - toRow);
  const colDistance = Math.abs(from.col - toCol);

  // Must be diagonal movement and either 1 space (regular) or 2 spaces (capture)
  if (moveDistance !== colDistance || moveDistance > 2) return false;

  // Get direction of movement
  const rowDirection = toRow > from.row ? 1 : -1;
  const colDirection = toCol > from.col ? 1 : -1;

  // For captures (must be exactly distance of 2)
  if (moveDistance === 2) {
    const jumpedRow = from.row + rowDirection;
    const jumpedCol = from.col + colDirection;
    const jumpedPiece = gameState[jumpedRow][jumpedCol];
    
    // Can only capture if there's an opponent's piece and landing square is empty
    return jumpedPiece && 
           jumpedPiece.color !== piece.color && 
           gameState[toRow][toCol] === null;
  }

  // For regular moves (must be exactly distance of 1)
  if (moveDistance === 1) {
    return gameState[toRow][toCol] === null;
  }

  return false;
};

// Main function to validate if a move is legal based on checkers rules
export const isValidMove = (from, toRow, toCol, gameState, currentPlayer) => {
  if (!isWithinBoard(toRow, toCol) || !isWithinBoard(from.row, from.col)) {
    return false;
  }

  if (gameState[toRow][toCol] !== null) return false;

  const piece = gameState[from.row][from.col];
  if (!piece || piece.color !== currentPlayer) return false;

  return piece.isKing
    ? isValidKingMove(from, toRow, toCol, gameState)
    : isValidRegularMove(from, toRow, toCol, gameState);
};

// Function to get all possible moves for a piece
export const getPossibleMoves = (row, col, gameState, currentPlayer) => {
  const possibleMoves = [];
  const piece = gameState[row][col];

  if (!piece || piece.color !== currentPlayer) return [];

  const directions = piece.isKing ? 
    [
      { rowDir: -1, colDir: -1 }, // up-left
      { rowDir: -1, colDir: 1 },  // up-right
      { rowDir: 1, colDir: -1 },  // down-left
      { rowDir: 1, colDir: 1 }    // down-right
    ] :
    piece.color === "red" ?
      [{ rowDir: -1, colDir: -1 }, { rowDir: -1, colDir: 1 }] :  // red moves up
      [{ rowDir: 1, colDir: -1 }, { rowDir: 1, colDir: 1 }];     // black moves down

  // First, check for available jumps
  const jumps = [];
  directions.forEach(({ rowDir, colDir }) => {
    const jumpRow = row + (2 * rowDir);
    const jumpCol = col + (2 * colDir);
    const jumpedRow = row + rowDir;
    const jumpedCol = col + colDir;

    if (isWithinBoard(jumpRow, jumpCol) && 
        gameState[jumpRow][jumpCol] === null && 
        gameState[jumpedRow][jumpedCol]?.color !== currentPlayer && 
        gameState[jumpedRow][jumpedCol] !== null) {
      jumps.push({
        toRow: jumpRow,
        toCol: jumpCol,
        isJump: true
      });
    }
  });

  // If no jumps are available, check for regular moves
  if (jumps.length === 0) {
    directions.forEach(({ rowDir, colDir }) => {
      let currentRow = row;
      let currentCol = col;

      // For kings, keep checking in this direction until we hit something
      if (piece.isKing) {
        while (true) {
          currentRow += rowDir;
          currentCol += colDir;

          // Stop if we're off the board
          if (!isWithinBoard(currentRow, currentCol)) break;

          // Stop if we hit any piece
          if (gameState[currentRow][currentCol] !== null) break;

          possibleMoves.push({
            toRow: currentRow,
            toCol: currentCol,
            isJump: false
          });
        }
      } else {
        // Regular pieces only move one space
        const moveRow = row + rowDir;
        const moveCol = col + colDir;

        if (isWithinBoard(moveRow, moveCol) && gameState[moveRow][moveCol] === null) {
          possibleMoves.push({
            toRow: moveRow,
            toCol: moveCol,
            isJump: false
          });
        }
      }
    });
  } else {
    // If jumps are available, only allow jumps
    possibleMoves.push(...jumps);
  }

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
      row: Math.floor((fromRow + toRow) / 2),
      col: Math.floor((fromCol + toCol) / 2)
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

  // Update mapGameStateToArray to handle the board structure correctly
  export const mapGameStateToArray = (gameState) => {
    return gameState; // Simply return the game state as is
  };

  // Check if a square should be highlighted (selected piece)
  export const isHighlighted = (row, col, selectedPiece) => {
    if (!selectedPiece) return false;
    return selectedPiece.row === row && selectedPiece.col === col;
  };

  // Check if a square is a possible move
  export const isPossibleMove = (row, col, possibleMoves) => {
    if (!possibleMoves || !possibleMoves.length) return false;
    return possibleMoves.some(move => move.toRow === row && move.toCol === col);
  };

  

        // Helper function to check if a square is part of the AI's last move
        export const isAIMove = (row, col, aiLastMove) => {
          if (!aiLastMove) return false;
          return (
            (row === aiLastMove.from.row && col === aiLastMove.from.col) ||
            (row === aiLastMove.to.row && col === aiLastMove.to.col)
          );
        };
        
// Add this function to helpers.js
export const hasAdditionalJumps = (row, col, gameState, currentPlayer) => {
  const piece = gameState[row][col];
  if (!piece || piece.color !== currentPlayer) return false;

  const directions = piece.isKing ? 
    [[-2, -2], [-2, 2], [2, -2], [2, 2]] :  // King can move in all directions
    piece.color === 'red' ? 
      [[-2, -2], [-2, 2]] :  // Red moves up
      [[2, -2], [2, 2]];     // Black moves down

  for (const [rowDir, colDir] of directions) {
    const newRow = row + rowDir;
    const newCol = col + colDir;
    const jumpedRow = row + rowDir/2;
    const jumpedCol = col + colDir/2;

    // Check if the jump is within board boundaries
    if (!isWithinBoard(newRow, newCol)) continue;

    // Check if there's an opponent's piece to jump over
    const jumpedPiece = gameState[jumpedRow][jumpedCol];
    if (!jumpedPiece || jumpedPiece.color === currentPlayer) continue;

    // Check if landing square is empty
    if (gameState[newRow][newCol] === null) {
      return true;
    }
  }

  return false;
};
        