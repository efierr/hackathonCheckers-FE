import React, { useState, useEffect } from "react";
import { isValidMove, isAIMove, mapGameStateToArray, isHighlighted, isPossibleMove, getPossibleMoves, shouldCrownPiece, hasAdditionalJumps } from "../utils/helpers";
import { executeMove } from "../utils/moves";
import Square from "./Square";
import { getAIMoveWithDifficulty, getBestMove } from '../utils/api';
import SuggestionBtn from './suggestionBtn';

const Board = () => {
  const boardSize = 8;
  // State for the currently selected piece
  const [selectedPiece, setSelectedPiece] = useState(null);
  // State to store the winner of the game
  const [winner, setWinner] = useState(null);
  //state to store when a double jump is available
  const [doubleJumpAvailable, setDoubleJumpAvailable] = useState(false);
  // State to store possible moves
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [piecesWithJumps, setPiecesWithJumps] = useState([]);
  const [suggestedMove, setSuggestedMove] = useState("")
  // Modified game settings state
  const [gameSettings, setGameSettings] = useState({
    mode: null,    // 'ai' or 'local'
    playerColor: null,  // 'red' or 'black'
    difficulty: null // easy medium hard
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  // Add isPlayerTurn state
  const [isPlayerTurn, setIsPlayerTurn] = useState(null); // Start as null until color is selected
  // Add state to track AI's last move
  const [aiLastMove, setAiLastMove] = useState(null); // { from: {row, col}, to: {row, col} }

  // Remove the initial state setup from useState and make it a function
  const initializeBoard = () => {
    const initialState = Array(boardSize)
      .fill()
      .map(() => Array(8).fill(null));

    // Always place black pieces on top (rows 0-2)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "black", isKing: false };
        }
      }
    }

    // Always place red pieces on bottom (rows 5-7)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 0) {
          initialState[row][col] = { color: "red", isKing: false };
        }
      }
    }

    return initialState;
  };

  // Initialize gameState as empty board
  const [gameState, setGameState] = useState(Array(boardSize).fill().map(() => Array(8).fill(null)));
  
  //console logs to visualize the game state and the array representation to be sent to AI
  console.log("Array Representation:", mapGameStateToArray(gameState));
  
  // Effect to check for a winner after each move
  useEffect(() => {
    // Only check for winner if game has started (playerColor and difficulty are set)
    if (gameSettings.playerColor && gameSettings.difficulty) {
      const gameWinner = checkWinner();
      if (gameWinner) {
        setWinner(gameWinner);
      }
    }
  }, [gameState, gameSettings.playerColor, gameSettings.difficulty]);

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

    // Only declare winner if one side has no pieces left
    // and we're not in initialization phase
    if (gameSettings.playerColor && gameSettings.difficulty) {
      if (redPieces === 0) return "Black Wins!";
      if (blackPieces === 0) return "Red Wins!";
    }
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
  const handleSquareClick = async (row, col) => {
    // Clear AI move highlight when player makes a move
    if (gameSettings.mode === 'ai') {
      setAiLastMove(null);
    }

    // If it's not the player's turn in AI mode, do nothing
    if (gameSettings.mode === 'ai' && !isPlayerTurn) return;

    const currentPlayer = gameSettings.mode === 'ai' 
      ? gameSettings.playerColor 
      : isPlayerTurn ? 'red' : 'black';

    // If there's a piece that must jump, only allow that piece to move
    if (piecesWithJumps.length > 0 && !doubleJumpAvailable) {
      const mustJumpPiece = piecesWithJumps.find(p => p.row === row && p.col === col);
      if (!selectedPiece && !mustJumpPiece) {
        return; // Can't select other pieces when jumps are available
      }
    }

    // If there's no selected piece
    if (!selectedPiece) {
      const piece = gameState[row][col];
      // Check if the clicked square has a piece of the current player's color
      if (piece && piece.color === currentPlayer) {
        const moves = getPossibleMoves(row, col, gameState, currentPlayer);
        if (moves.length > 0) {
          setSelectedPiece({ row, col });
          setPossibleMoves(moves);
        }
      }
      return;
    }

    // If a piece is already selected
    if (isPossibleMove(row, col, possibleMoves)) {
      const moveResult = executeMove(selectedPiece, row, col, gameState);
      let newGameState = moveResult.newGameState;

      // Check for king promotion
      if (shouldCrownPiece(row, newGameState[row][col])) {
        newGameState[row][col].isKing = true;
      }

      setGameState(newGameState);

      // Check for additional jumps
      if (moveResult.jumpMade && hasAdditionalJumps(row, col, newGameState, currentPlayer)) {
        setSelectedPiece({ row, col });
        setPossibleMoves(getPossibleMoves(row, col, newGameState, currentPlayer));
        setDoubleJumpAvailable(true);
      } else {
        // End turn
        setSelectedPiece(null);
        setPossibleMoves([]);
        setDoubleJumpAvailable(false);
        setIsPlayerTurn(!isPlayerTurn);
      }

      // Update pieces that must jump for next turn
      const nextPlayer = !isPlayerTurn ? 'red' : 'black';
      const jumpingPieces = findPiecesWithJumps(newGameState, nextPlayer);
      setPiecesWithJumps(jumpingPieces);
    } else {
      // If clicking on a different piece of the same color, select it instead
      const piece = gameState[row][col];
      if (piece && piece.color === currentPlayer && !doubleJumpAvailable) {
        const moves = getPossibleMoves(row, col, gameState, currentPlayer);
        if (moves.length > 0) {
          setSelectedPiece({ row, col });
          setPossibleMoves(moves);
        }
      } else {
        // If clicking on an invalid square, deselect the piece
        setSelectedPiece(null);
        setPossibleMoves([]);
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
    setIsPlayerTurn(false);
  };

  // Add this function to find all pieces that can jump
  const findPiecesWithJumps = (gameState, player) => {
    const pieces = [];
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const piece = gameState[row][col];
        if (piece?.color === player) {
          const moves = getPossibleMoves(row, col, gameState, player);
          if (moves.some(move => move.isJump)) {
            pieces.push({ row, col });
          }
        }
      }
    }
    return pieces;
  };

  // Add an effect to check for required jumps at the start of each turn
  useEffect(() => {
    if (!winner && gameState) {
      const currentPlayer = isPlayerTurn ? 'red' : 'black';
      const jumpingPieces = findPiecesWithJumps(gameState, currentPlayer);
      setPiecesWithJumps(jumpingPieces);
    }
  }, [gameState, isPlayerTurn, winner]);

  // Function to create the board UI
  const createBoard = () => {
    const board = [];
    
    // Add column labels (0-7) at the top
    board.push(
      <div key="top-labels" className="coordinate-row">
        <div className="coordinate-label corner">x,y</div>
        {[...Array(8)].map((_, i) => (
          <div key={`top-${i}`} className="coordinate-label column-label">
            {i}
          </div>
        ))}
      </div>
    );

    // Create board rows with row labels
    for (let row = 0; row < boardSize; row++) {
      const squares = [];
      
      // Add row label
      squares.push(
        <div key={`row-${row}`} className="coordinate-label row-label">
          {row}
        </div>
      );

      // Add squares
      for (let col = 0; col < boardSize; col++) {
        squares.push(
          <Square
            key={`${row}-${col}`}
            isBlack={(row + col) % 2 === 0}
            piece={gameState[row][col]}
            isSelected={selectedPiece?.row === row && selectedPiece?.col === col}
            onClick={() => handleSquareClick(row, col)}
            highlight={isHighlighted(row, col, selectedPiece)}
            isPossibleMove={isPossibleMove(row, col, possibleMoves)}
            isAIMove={gameSettings.mode === 'ai' ? isAIMove(row, col, aiLastMove) : false}
            currentPlayer={gameSettings.playerColor}
            mustJump={piecesWithJumps.some(p => p.row === row && p.col === col)}
          />
        );
      }

      board.push(
        <div key={`row-${row}`} className="board-row">
          {squares}
        </div>
      );
    }

    return board;
  };

  const handleGetSuggestion = async () => {
    const bestMove = await getBestMove(gameState, gameSettings.playerColor);
    setSuggestedMove(bestMove);
  };
  // Update the AI move useEffect
  useEffect(() => {
    const makeAIMove = async () => {
      const isAITurn = gameSettings.mode === 'ai' && 
                      gameSettings.difficulty && 
                      !isPlayerTurn && 
                      !winner;

      if (isAITurn) {
        setIsAIThinking(true);
        
        // Add timeout before making the AI move
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Log the current game state being sent to AI
          console.log("Sending game state to AI:", mapGameStateToArray(gameState));

          const aiColor = gameSettings.playerColor === 'red' ? 'black' : 'red';
          console.log("Sending game state to AI:", gameState);
          
          const suggestedAi = await getAIMoveWithDifficulty(
            gameState,
            aiColor,
            gameSettings.difficulty
          );
          
          console.log("AI suggested move:", suggestedAi);
          
          if (suggestedAi) {
            const [fromCoord, toCoord] = suggestedAi.split(" ");
            const [fromRow, fromCol] = fromCoord.split(",").map(Number);
            const [toRow, toCol] = toCoord.split(",").map(Number);

            const moveResult = executeMove(
              { row: fromRow, col: fromCol-1 },
              toRow,
              toCol-1,
              gameState
            );

            let newGameState = moveResult.newGameState;

            if (newGameState[toRow]?.[toCol]) {
              if (shouldCrownPiece(toRow, newGameState[toRow][toCol])) {
                newGameState[toRow][toCol].isKing = true;
              }
            }

            setAiLastMove({
              from: { row: fromRow, col: fromCol-1 },
              to: { row: toRow, col: toCol-1 }
            });

            setGameState(newGameState);
            setIsPlayerTurn(true);
          }
        } catch (error) {
          console.error('Error making AI move:', error);
        } finally {
          setIsAIThinking(false);
        }
      }
    };

    // Add debounce to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      if (!isAIThinking) {
        makeAIMove();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameSettings.mode, gameSettings.playerColor, gameSettings.difficulty, gameState, winner, isPlayerTurn]);

  // Game mode selection UI
  if (!gameSettings.mode) {
    return (
      <div className="game-mode-selection">
        <h2>Select Game Mode</h2>
        <div className="mode-buttons">
          <button 
            onClick={() => {
              setGameSettings({...gameSettings, mode: 'local'});
              setGameState(initializeBoard()); // Initialize for local play
              setIsPlayerTurn(true); // Red goes first in local play
            }}
          >
            Local Play
          </button>
          <button onClick={() => setGameSettings({...gameSettings, mode: 'ai'})}>
            vs AI
          </button>
        </div>
      </div>
    );
  }

  // Color selection UI for AI mode
  if (gameSettings.mode === 'ai' && !gameSettings.playerColor) {
    return (
      <div className="game-mode-selection">
        <h2>Choose Your Color</h2>
        <div className="color-selection">
          <button 
            onClick={() => {
              setGameSettings({...gameSettings, playerColor: 'red'});
              setIsPlayerTurn(false); // AI goes first when player picks red
              setGameState(initializeBoard());
            }}
            className="color-btn red-btn"
          >
            Play as Red
          </button>
          <button 
            onClick={() => {
              setGameSettings({...gameSettings, playerColor: 'black'});
              setIsPlayerTurn(true); // Player goes first when they pick black
              setGameState(initializeBoard());
            }}
            className="color-btn black-btn"
          >
            Play as Black
          </button>
        </div>
      </div>
    );
  }

  // Difficulty selection UI for AI mode
  if (gameSettings.mode === 'ai' && gameSettings.playerColor && !gameSettings.difficulty) {
    return (
      <div className="game-mode-selection">
        <h2>Select AI Difficulty</h2>
        <div className="difficulty-selection">
          <button 
            onClick={() => setGameSettings({...gameSettings, difficulty: 'easy'})}
            className="difficulty-btn"
          >
            Easy
          </button>
          <button 
            onClick={() => setGameSettings({...gameSettings, difficulty: 'medium'})}
            className="difficulty-btn"
          >
            Medium
          </button>
          <button 
            onClick={() => setGameSettings({...gameSettings, difficulty: 'hard'})}
            className="difficulty-btn"
          >
            Hard
          </button>
        </div>
      </div>
    );
  }

  // Modified game board UI
  return (
    <div className="game-container">
      <div className="status">
        {winner ? winner : 
         gameSettings.mode === 'ai' ? 
           (isAIThinking ? "AI is thinking..." : 
            `Current Turn: ${isPlayerTurn ? gameSettings.playerColor : 'AI'}`) :
           `Current Turn: ${isPlayerTurn ? 'Red' : 'Black'}`
        }
      </div>
      <div className="board">{createBoard()}</div>
      {gameSettings.mode === 'ai' && (
        <SuggestionBtn 
          onGetSuggestion={handleGetSuggestion}
          disabled={!!winner || !isPlayerTurn}
        />
      )}
    </div>
  );
};

export default Board;