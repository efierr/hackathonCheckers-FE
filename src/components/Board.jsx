import React, { useState, useEffect } from "react";
import { isValidMove, mapGameStateToArray, isHighlighted, isPossibleMove, getPossibleMoves, getJumpedPiecePosition, shouldCrownPiece, hasAvailableJumps } from "../utils/helpers";
import Square from "./Square";
import { getBestMove } from '../utils/api';
import SuggestionBtn from './suggestionBtn';

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
  // State to store possible moves
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [piecesWithJumps, setPiecesWithJumps] = useState([]);

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

    // If a piece is already selected
    if (selectedPiece) {
      if (isPossibleMove(row, col, possibleMoves)) {
        // Handle the move logic here
        const newGameState = [...gameState];
        const fromRow = selectedPiece.row;
        const fromCol = selectedPiece.col;

        // Move the piece
        newGameState[row][col] = newGameState[fromRow][fromCol];
        newGameState[fromRow][fromCol] = null;

        // Check if it's a jump move
        const move = possibleMoves.find(move => move.toRow === row && move.toCol === col);
        if (move.isJump) {
          // Remove the jumped piece
          const jumpedPosition = getJumpedPiecePosition(fromRow, fromCol, row, col);
          newGameState[jumpedPosition.row][jumpedPosition.col] = null;

          // Check for additional jumps
          const additionalJumps = getPossibleMoves(row, col, newGameState, currentPlayer)
            .filter(m => m.isJump);
          
          if (additionalJumps.length > 0) {
            // Allow for another jump
            setSelectedPiece({ row, col });
            setPossibleMoves(additionalJumps);
            setGameState(newGameState);
            return;
          }
        }

        // Crown the piece if it reaches the opposite end
        if (shouldCrownPiece(row, newGameState[row][col])) {
          newGameState[row][col].isKing = true;
        }

        // Update the game state
        setGameState(newGameState);
        setSelectedPiece(null);
        setPossibleMoves([]);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
      } else {
        setSelectedPiece(null);
        setPossibleMoves([]);
      }
    } else if (piece?.color === currentPlayer) {
      // Check if there are any jumps available for the current player
      const hasJumps = hasAvailableJumps(gameState, currentPlayer);
      const pieceMoves = getPossibleMoves(row, col, gameState, currentPlayer);
      
      // If jumps are available, only allow selecting pieces that can jump
      if (hasJumps && !pieceMoves.some(move => move.isJump)) {
        return; // Can't select this piece when jumps are available elsewhere
      }

      setSelectedPiece({ row, col });
      setPossibleMoves(pieceMoves);
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

  // Add this function to find all pieces that can jump
  const findPiecesWithJumps = (gameState, currentPlayer) => {
    const pieces = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState[row][col];
        if (piece?.color === currentPlayer) {
          const moves = getPossibleMoves(row, col, gameState, currentPlayer);
          if (moves.some(move => move.isJump)) {
            pieces.push({ row, col });
          }
        }
      }
    }
    return pieces;
  };

  // Update this useEffect to check for pieces that must jump
  useEffect(() => {
    const pieces = findPiecesWithJumps(gameState, currentPlayer);
    setPiecesWithJumps(pieces);
  }, [gameState, currentPlayer]);

  // Function to create the board UI
  const createBoard = () => {
    const board = [];
    for (let row = 0; row < boardSize; row++) {
      const rowSquares = [];
      for (let col = 0; col < boardSize; col++) {
        // Determine if the square should be black
        const isBlack = (row + col) % 2 === 0;
        const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
        const mustJump = piecesWithJumps.some(
          piece => piece.row === row && piece.col === col
        );

        // Create a Square component for each position
        rowSquares.push(
          <Square
            key={`${row}-${col}`}
            isBlack={isBlack}
            piece={gameState[row][col]}
            isSelected={isSelected}
            onClick={() => handleSquareClick(row, col)}
            highlight={isHighlighted(row, col, selectedPiece)}
            isPossibleMove={isPossibleMove(row, col, possibleMoves)}
            currentPlayer={currentPlayer}
            mustJump={mustJump}
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

  const handleGetSuggestion = async () => {
    const bestMove = await getBestMove(gameState, currentPlayer);
    setSuggestedMove(bestMove);
  };

  return (
    <div className="game-container">
      <div className="status">
        {winner ? winner : `Current Player: ${currentPlayer}`}
      </div>
      <div className="board">{createBoard()}</div>
      <SuggestionBtn 
        onGetSuggestion={handleGetSuggestion}
        disabled={!!winner}
      />
    </div>
  );
};

export default Board;