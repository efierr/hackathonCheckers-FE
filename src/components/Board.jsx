import React, { useState, useEffect } from "react";
import Square from "./Square";

const Board = () => {
  const boardSize = 8;
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [winner, setWinner] = useState(null);

  // Initialize board state
  const [gameState, setGameState] = useState(() => {
    const initialState = Array(boardSize)
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
