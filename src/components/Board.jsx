import React, { useState, useEffect } from "react";
import { isValidMove, executeMove, hasAdditionalJumps } from "../utils/moves";
import Square from "./Square";

const Board = () => {
  const boardSize = 8;
  // State for the currently selected piece
  const [selectedPiece, setSelectedPiece] = useState(null);
  // State to keep track of the current player
  const [currentPlayer, setCurrentPlayer] = useState("red");
  // State to store the winner of the game
  const [winner, setWinner] = useState(null);

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
    console.log(`Square clicked: (${row}, ${col})`);

    if (!gameState) {
      console.error("Game state is undefined");
      return;
    }

    if (selectedPiece === null) {
      // Selecting a piece
      if (gameState[row][col] && gameState[row][col].color === currentPlayer) {
        console.log(`Selected piece at (${row}, ${col})`);
        setSelectedPiece({ row, col });
      }
    } else {
      // Moving a piece
      if (isValidMove(selectedPiece, row, col, gameState, currentPlayer)) {
        console.log("Valid move detected");
        const { newGameState, jumpMade } = executeMove(
          selectedPiece,
          row,
          col,
          gameState,
          currentPlayer
        );

        if (jumpMade) {
          console.log("Jump made, checking for additional jumps");
          const additionalJumps = hasAdditionalJumps(
            row,
            col,
            newGameState,
            currentPlayer
          );
          if (additionalJumps) {
            console.log("Additional jumps available");
            setGameState(newGameState);
            setSelectedPiece({ row, col, mustJump: true });
          } else {
            console.log("No additional jumps, ending turn");
            const turnResult = finishTurn(newGameState, currentPlayer);
            console.log("Turn result:", turnResult);
            if (turnResult && turnResult.gameState) {
              setGameState(turnResult.gameState);
              setCurrentPlayer(turnResult.currentPlayer);
              setSelectedPiece(null);
            } else {
              console.error("Invalid turn result:", turnResult);
            }
          }
        } else {
          console.log("Regular move, ending turn");
          const turnResult = finishTurn(newGameState, currentPlayer);
          console.log("Turn result:", turnResult);
          if (turnResult && turnResult.gameState) {
            setGameState(turnResult.gameState);
            setCurrentPlayer(turnResult.currentPlayer);
            setSelectedPiece(null);
          } else {
            console.error("Invalid turn result:", turnResult);
          }
        }
      } else {
        console.log("Invalid move");
        setSelectedPiece(null);
      }
    }
  };

  const finishTurn = (newGameState, currentPlayer) => {
    console.log("Finishing turn");

    // Check for new kings
    newGameState = checkForKing(newGameState);

    // Switch to the other player
    const nextPlayer = currentPlayer === "red" ? "black" : "red";

    console.log(`Next player: ${nextPlayer}`);
    return {
      gameState: newGameState,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      jumpCount: 0,
    };
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
