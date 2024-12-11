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

  // Must be diagonal movement (equal row and column distance)
  if (moveDistance !== colDistance) return false;

  // Get direction of movement
  const rowDirection = toRow > from.row ? 1 : -1;
  const colDirection = toCol > from.col ? 1 : -1;

  // Check each square along the path
  for (let i = 1; i < moveDistance; i++) {
    const checkRow = from.row + (i * rowDirection);
    const checkCol = from.col + (i * colDirection);
    const checkSquare = gameState[checkRow][checkCol];

    // If there's a piece in the path
    if (checkSquare) {
      // Only allow one jump over an opponent's piece
      if (i === 1 && checkSquare.color !== piece.color && moveDistance === 2) {
        return true;
      }
      return false;
    }
  }

  // Allow move if path is clear
  return true;
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

  if (piece.isKing) {
    // Check all diagonal directions
    const directions = [
      { rowDir: -1, colDir: -1 },
      { rowDir: -1, colDir: 1 },
      { rowDir: 1, colDir: -1 },
      { rowDir: 1, colDir: 1 }
    ];

    directions.forEach(({ rowDir, colDir }) => {
      // Check each distance in this direction
      for (let distance = 1; distance < 8; distance++) {
        const newRow = row + (distance * rowDir);
        const newCol = col + (distance * colDir);

        // Stop checking this direction if we're off the board
        if (!isWithinBoard(newRow, newCol)) break;

        // Check if this move is valid
        if (isValidMove({ row, col }, newRow, newCol, gameState, currentPlayer)) {
          // Determine if it's a jump move (distance of 2 with a piece in between)
          const isJump = distance === 2 && gameState[row + rowDir][col + colDir] !== null;
          possibleMoves.push({
            toRow: newRow,
            toCol: newCol,
            isJump: isJump
          });
        }

        // Stop checking this direction if we hit any piece
        if (gameState[newRow][newCol] !== null) break;
      }
    });
  } else {
    // Regular piece movement (unchanged)
    const directions = piece.color === "red"
      ? [{ rowDir: -1, colDir: -1 }, { rowDir: -1, colDir: 1 }]
      : [{ rowDir: 1, colDir: -1 }, { rowDir: 1, colDir: 1 }];

    directions.forEach(({ rowDir, colDir }) => {
      // Regular move
      const moveRow = row + rowDir;
      const moveCol = col + colDir;

      if (isWithinBoard(moveRow, moveCol) &&
          isValidMove({ row, col }, moveRow, moveCol, gameState, currentPlayer)) {
        possibleMoves.push({
          toRow: moveRow,
          toCol: moveCol,
          isJump: false
        });
      }

      // Jump move
      const jumpRow = row + (2 * rowDir);
      const jumpCol = col + (2 * colDir);

      if (isWithinBoard(jumpRow, jumpCol) &&
          isValidMove({ row, col }, jumpRow, jumpCol, gameState, currentPlayer)) {
        possibleMoves.push({
          toRow: jumpRow,
          toCol: jumpCol,
          isJump: true
        });
      }
    });
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

  export const mapGameStateToArray = (gameState) => {
    return gameState.flat().map(piece => {
      if (!piece) return '.';
      if (piece.color === 'black') return piece.isKing ? 'B' : 'b';
      if (piece.color === 'red') return piece.isKing ? 'R' : 'r';
    });
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
