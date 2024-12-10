import React from 'react';

const Board = () => {
  const boardSize = 8;

  const createBoard = () => {
    const board = [];
    for (let row = 0; row < boardSize; row++) {
      const rowSquares = [];
      for (let col = 0; col < boardSize; col++) {
        const isDarkSquare = (row + col) % 2 === 0;
        rowSquares.push(isDarkSquare? 0 : 1 );
      }
      board.push(<div key={row} className="board-row">{rowSquares}</div>);
    }
    return board;
  };

  return (
    <div className="board">
      {createBoard()}
    </div>
  );
};

export default Board;