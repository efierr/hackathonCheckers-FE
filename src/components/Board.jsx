import React, { useState, useEffect } from "react";
import { isValidMove, chessToCoordinates } from "../utils/moves";
import Square from "./Square";
import { getBestMove } from '../utils/api';
import SuggestionBtn from './suggestionBtn';

const Board = () => {
  const boardSize = 8;
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [winner, setWinner] = useState(null);
  const [doubleJumpAvailable, setDoubleJumpAvailable] = useState(false);
  const [suggestedMove, setSuggestedMove] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);

  const [gameState, setGameState] = useState(() => {
    const initialState = Array(boardSize)
      .fill()
      .map(() => Array(8).fill(null));

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "black", isKing: false };
        }
      }
    }

    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "red", isKing: false };
        }
      }
    }

    return initialState;
  });

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
        if (piece) {
          if (piece.color === "red") redPieces++;
          if (piece.color === "black") blackPieces++;
        }
      });
    });

    if (redPieces === 0) return "Black";
    if (blackPieces === 0) return "Red";
    return null;
  };

  const handleSquareClick = (row, col) => {
    const piece = gameState[row][col];

    if (piece && piece.color === currentPlayer) {
      setSelectedPiece({ row, col });

      if (suggestedMove) {
        const [from, to] = suggestedMove.split(' ');
        const fromCoord = chessToCoordinates(from);
        const toCoord = chessToCoordinates(to);

        if (fromCoord.row === row && fromCoord.col === col) {
          setHighlightedSquares([toCoord]);
        } else {
          setHighlightedSquares([]);
        }
      }
    } else if (selectedPiece) {
      handleMove(row, col);
    }
  };

  const handleMove = (toRow, toCol) => {
    if (isValidMove(selectedPiece, toRow, toCol, gameState, currentPlayer)) {
      const newGameState = [...gameState.map(row => [...row])];
      newGameState[toRow][toCol] = newGameState[selectedPiece.row][selectedPiece.col];
      newGameState[selectedPiece.row][selectedPiece.col] = null;

      if (Math.abs(selectedPiece.row - toRow) === 2) {
        const jumpedRow = (selectedPiece.row + toRow) / 2;
        const jumpedCol = (selectedPiece.col + toCol) / 2;
        newGameState[jumpedRow][jumpedCol] = null;
      }

      finishTurn(newGameState);
      setHighlightedSquares([]);
    }
  };

  const createBoard = () => {
    const board = [];
    for (let row = 0; row < boardSize; row++) {
      const rowSquares = [];
      for (let col = 0; col < boardSize; col++) {
        const isBlack = (row + col) % 2 === 0;
        const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
        const isHighlighted = highlightedSquares.some(
          square => square.row === row && square.col === col
        );

        rowSquares.push(
          <Square
            key={`${row}-${col}`}
            isBlack={isBlack}
            piece={gameState[row][col]}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
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
w
export default Board;