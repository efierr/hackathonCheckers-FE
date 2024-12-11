// Check if a move is valid
export const isValidMove = (fromRow, fromCol, toRow, toCol, gameState, currentPlayer) => {
    // Check if destination is within bounds
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
  
    // Check if destination square is empty
    if (gameState[toRow][toCol] !== null) return false;
  
    // Check if piece exists at the from position
    const piece = gameState[fromRow][fromCol];
    if (!piece) return false;
  
    // Check if piece belongs to current player
    if (piece.color !== currentPlayer) return false;
  
    // Calculate move distance
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
  
    // Regular move
    if (Math.abs(rowDiff) === 1 && colDiff === 1) {
      // Check direction based on piece color and king status
      if (!piece.isKing) {
        if (piece.color === 'red' && rowDiff > 0) return false;
        if (piece.color === 'black' && rowDiff < 0) return false;
      }
      return true;
    }
  
    // Jump move
    if (Math.abs(rowDiff) === 2 && colDiff === 2) {
      // Check direction for non-king pieces
      if (!piece.isKing) {
        if (piece.color === 'red' && rowDiff > 0) return false;
        if (piece.color === 'black' && rowDiff < 0) return false;
      }
  
      // Check if there's an opponent's piece to jump over
      const jumpedRow = fromRow + rowDiff / 2;
      const jumpedCol = fromCol + (toCol - fromCol) / 2;
      const jumpedPiece = gameState[jumpedRow][jumpedCol];
  
      return jumpedPiece && jumpedPiece.color !== currentPlayer;
    }
  
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