import axios from "axios";
import { mapGameStateToArray } from './helpers';

const apiUrl = "http://localhost:3040/bestmove";
const aiMoveUrl = "http://localhost:3040/botmove";

export const getBestMove = async (board, playerColor) => {
    try {
       const response = await axios.post(apiUrl, {board, playerColor});
       console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching best move:", error);
    }
};

export const getAIMoveWithDifficulty = async (board, playerColor, difficultyLevel) => {
    try {
        const response = await axios.post(aiMoveUrl, {
            board: mapGameStateToArray(board),
            playerColor,
            difficulty: difficultyLevel
        });
        console.log("AI Move response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching AI move with difficulty:", error);
    }
};


