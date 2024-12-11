import React from "react";
import Piece from "./Piece";
import "../styles/Square.css";

const Square = ({ isBlack, piece, onClick, highlight, isPossibleMove, currentPlayer, mustJump }) => {
  const getSquareClassName = () => {
    let className = `square ${isBlack ? "black" : "white"}`;
    if (highlight) {
      className += ` highlight-${currentPlayer}`;
    }
    if (isPossibleMove) {
      className += ' possible-move';
    }
    if (mustJump) {
      className += ' must-jump';
    }
    return className;
  };

  return (
    <div 
      className={getSquareClassName()} 
      onClick={onClick}
      data-possible-move={isPossibleMove}
    >
      {piece && <Piece color={piece.color} isKing={piece.isKing} />}
    </div>
  );
};

export default Square;
