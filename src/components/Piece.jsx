import React from "react";
import red from "../assets/red.png"
import yellow from "../assets/yellow.png"

const Piece = ({ color, isKing }) => {
  return (
    <div className= "piece">
    {color === "red" ? <img src={red} alt="red" /> : <img src={yellow} alt="yellow" />}
    </div>
    // <div className={`piece ${color} ${isKing ? "king" : ""}`}>
    //   {isKing && <span className="crown">♔</span>}
    // </div>
  );
};

export default Piece;
