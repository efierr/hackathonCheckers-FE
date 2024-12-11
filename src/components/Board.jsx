import React, { useState, useEffect } from "react";
import { isValidMove, mapGameStateToArray } from "../utils/helpers";
import Square from "./Square";

const Board = () => {
  const boardSize = 8;
  // State for the currently selected piece
  const [selectedPiece, setSelectedPiece] = useState(null);
  // State to keep track of the current player
  const [currentPlayer, setCurrentPlayer] = useState("red");
  // State to store the winner of the game
  const [winner, setWinner] = useState(null);
  //state to store when a double jump is available
  const [doubleJumpAvailable, setDoubleJumpAvailable] = useState(false);

  // State for the game board, initialized with a function
  const [gameState, setGameState] = useState(() => {
    // Create an empty 8x8 board
    const initialState = Array(boardSize)
      .fill()
      .map(() => Array(8).fill(null));

    // Place black pieces on the top three rows
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "black", isKing: false };
        }
      }
    }

    // Place red pieces on the bottom three rows
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "red", isKing: false };
        }
      }
    }

    return initialState;
  });
  
  //console logs to visualize the game state and the array representation to be sent to AI
  console.log(gameState);
  console.log(mapGameStateToArray(gameState));

  // Effect to check for a winner after each move
  useEffect(() => {
    const gameWinner = checkWinner();
    if (gameWinner) {
      setWinner(gameWinner);
    }
  }, [gameState]);

  // Function to check if there's a winner
  const checkWinner = () => {
    let redPieces = 0;
    let blackPieces = 0;

    // Count the number of pieces for each player
    gameState.forEach((row) => {
      row.forEach((piece) => {
        if (piece?.color === "red") redPieces++;
        if (piece?.color === "black") blackPieces++;
      });
    });

    // Determine the winner based on piece count
    if (redPieces === 0) return "Black Wins!";
    if (blackPieces === 0) return "Red Wins!";
    return null;
  };

  // Function to check and promote pieces to kings
  const checkForKing = (newGameState) => {
    for (let col = 0; col < boardSize; col++) {
      // Check if red piece reached the top row
      if (
        newGameState[0][col]?.color === "red" &&
        !newGameState[0][col].isKing
      ) {
        newGameState[0][col].isKing = true;
      }
      // Check if black piece reached the bottom row
      if (
        newGameState[7][col]?.color === "black" &&
        !newGameState[7][col].isKing
      ) {
        newGameState[7][col].isKing = true;
      }
    }
    return newGameState;
  };

  // Function to handle square clicks
  const handleSquareClick = (row, col) => {
    const piece = gameState[row][col];

    if (selectedPiece === null) {
      // If no piece is selected, select the current player's piece
      if (piece && piece.color === currentPlayer) {
        setSelectedPiece({ row, col });
      }
    } else {
      // If a piece is already selected
      if (isValidMove(selectedPiece, row, col, gameState, currentPlayer)) {
        // Execute the move
        let newGameState = [...gameState];
        newGameState[row][col] =
          newGameState[selectedPiece.row][selectedPiece.col];
        newGameState[selectedPiece.row][selectedPiece.col] = null;

        // Check if the move was a jump
        if (Math.abs(selectedPiece.row - row) === 2) {
          // Remove the jumped piece
          const jumpedRow = (selectedPiece.row + row) / 2;
          const jumpedCol = (selectedPiece.col + col) / 2;
          newGameState[jumpedRow][jumpedCol] = null;

          // Check if this was the second jump
          if (selectedPiece.isDoubleJumping) {
            // End the turn after the second jump
            finishTurn(newGameState);
            return;
          }

          // Check for double jump opportunity
          const directions = [
            { dr: -2, dc: -2 },
            { dr: -2, dc: 2 },
            { dr: 2, dc: -2 },
            { dr: 2, dc: 2 },
          ];

          const doubleJumpAvailable = directions.some(({ dr, dc }) => {
            const newRow = row + dr;
            const newCol = col + dc;
            return isValidMove(
              { row, col },
              newRow,
              newCol,
              newGameState,
              currentPlayer
            );
          });

          if (doubleJumpAvailable) {
            // Set the new position as the selected piece for the next jump
            setSelectedPiece({ row, col, isDoubleJumping: true });
            setGameState(newGameState);
            return; // Don't end the turn yet
          }
        }

        // If it's not a jump or no double jump is available, finish the turn
        finishTurn(newGameState);
      } else if (piece && piece.color === currentPlayer) {
        // If clicking on another of the current player's pieces, select it
        setSelectedPiece({ row, col });
      } else {
        // If an invalid move, deselect the piece
        setSelectedPiece(null);
      }
    }
  };

  const finishTurn = (newGameState) => {
    // Check for new kings
    newGameState = checkForKing(newGameState);
    // Update the game state
    setGameState(newGameState);
    // Deselect the piece
    setSelectedPiece(null);
    // Switch to the other player
    setCurrentPlayer(currentPlayer === "red" ? "black" : "red");
  };

  // Function to create the board UI
  const createBoard = () => {
    const board = [];
    for (let row = 0; row < boardSize; row++) {
      const rowSquares = [];
      for (let col = 0; col < boardSize; col++) {
        // Determine if the square should be black
        const isBlack = (row + col) % 2 === 0;
        // Check if this square contains the selected piece
        const isSelected =
          selectedPiece?.row === row && selectedPiece?.col === col;

        // Create a Square component for each position
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
      // Add each row to the board
      board.push(
        <div key={row} className="board-row">
          {rowSquares}
        </div>
      );
    }
    return board;
  };

  // Render the game board and status
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
