import React from "react";

const Piece = ({ color, isKing }) => {
  return (
    <div className={`piece ${color} ${isKing ? "king" : ""}`}>
      {isKing && <span className="crown">♔</span>}
    </div>
  );
};

export default Piece;
