import React from "react";
import Piece from "./Piece";

const Square = ({ isBlack, piece, onClick }) => {
  return (
    <div className={`square ${isBlack ? "black" : "white"}`} onClick={onClick}>
      {piece && <Piece color={piece.color} isKing={piece.isKing} />}
    </div>
  );
};

export default Square;
