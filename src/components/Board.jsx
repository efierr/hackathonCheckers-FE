import React, { useState, useEffect } from "react";
import Square from "./Square";

const Board = () => {
  const boardSize = 8;
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [winner, setWinner] = useState(null);
  const [mustJump, setMustJump] = useState(null);

  // Initialize board state
  const [gameState, setGameState] = useState(() => {
    const initialState = Array(8)
      .fill()
      .map(() => Array(8).fill(null));

    // Place black pieces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "black", isKing: false };
        }
      }
    }

    // Place red pieces
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "red", isKing: false };
        }
      }
    }

    return initialState;
  });

  // Check for winner after each move
  useEffect(() => {
    const gameWinner = checkWinner();
    if (gameWinner) {
      setWinner(gameWinner);
    }
  }, [gameState]);

  const checkWinner = () => {
    let redPieces = 0;
    let blackPieces = 0;

    gameState.forEach((row) => {
      row.forEach((piece) => {
        if (piece?.color === "red") redPieces++;
        if (piece?.color === "black") blackPieces++;
      });
    });

    if (redPieces === 0) return "Black Wins!";
    if (blackPieces === 0) return "Red Wins!";
    return null;
  };

  const isValidMove = (from, toRow, toCol) => {
    if (!gameState[toRow]?.[toCol] === null) return false;

    const piece = gameState[from.row][from.col];
    const moveDistance = Math.abs(from.row - toRow);
    const colDistance = Math.abs(from.col - toCol);

    // Regular move rules
    if (!piece.isKing) {
      const direction = piece.color === "red" ? -1 : 1;
      if (toRow - from.row !== direction && moveDistance !== 2) return false;
    }

    // Jump validation
    if (moveDistance === 2 && colDistance === 2) {
      const jumpedRow = (from.row + toRow) / 2;
      const jumpedCol = (from.col + toCol) / 2;
      const jumpedPiece = gameState[jumpedRow][jumpedCol];
      return jumpedPiece && jumpedPiece.color !== piece.color;
    }

    // Regular move
    return moveDistance === 1 && colDistance === 1 && !mustJump;
  };

  const checkForJumps = (row, col) => {
    const piece = gameState[row][col];
    if (!piece) return false;

    const directions = piece.isKing
      ? [-2, 2]
      : [piece.color === "red" ? -2 : 2];

    for (let rowDir of directions) {
      for (let colDir of [-2, 2]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;
        if (isValidMove({ row, col }, newRow, newCol)) {
          return true;
        }
      }
    }
    return false;
  };

  const movePiece = (from, toRow, toCol) => {
    const newGameState = gameState.map((row) => [...row]);

    // Move piece
    newGameState[toRow][toCol] = newGameState[from.row][from.col];
    newGameState[from.row][from.col] = null;

    // Handle jumps
    if (Math.abs(from.row - toRow) === 2) {
      const jumpedRow = (from.row + toRow) / 2;
      const jumpedCol = (from.col + toCol) / 2;
      newGameState[jumpedRow][jumpedCol] = null;

      // Check for additional jumps
      if (checkForJumps(toRow, toCol)) {
        setMustJump({ row: toRow, col: toCol });
        setGameState(newGameState);
        return;
      }
    }

    // King promotion
    if (toRow === 0 || toRow === 7) {
      newGameState[toRow][toCol].isKing = true;
    }

    setGameState(newGameState);
    setMustJump(null);
    setCurrentPlayer(currentPlayer === "red" ? "black" : "red");
  };

  const handleSquareClick = (row, col) => {
    if (winner) return;

    if (!selectedPiece) {
      // Select piece if it belongs to current player
      if (gameState[row][col]?.color === currentPlayer) {
        setSelectedPiece({ row, col });
      }
    } else {
      // Attempt to move piece if valid
      if (isValidMove(selectedPiece, row, col)) {
        movePiece(selectedPiece, row, col);
        if (!mustJump) {
          setSelectedPiece(null);
        }
      } else {
        // Deselect if clicking on invalid square
        setSelectedPiece(null);
      }
    }
  };

  const createBoard = () => {
    const board = [];
    for (let row = 0; row < boardSize; row++) {
      const rowSquares = [];
      for (let col = 0; col < boardSize; col++) {
        const isBlack = (row + col) % 2 === 0;
        const isSelected =
          selectedPiece?.row === row && selectedPiece?.col === col;

        rowSquares.push(
          <Square
            key={`${row}-${col}`}
            isBlack={isBlack}
            piece={gameState[row][col]}
            isSelected={isSelected}
            onClick={() => handleSquareClick(row, col)}
          />
        );
      }
      board.push(
        <div key={row} className="board-row">
          {rowSquares}
        </div>
      );
    }
    return board;
  };

  return (
    <div className="game-container">
      <div className="status">
        {winner ? winner : `Current Player: ${currentPlayer}`}
      </div>
      <div className="board">{createBoard()}</div>
    </div>
  );
};

export default Board;
