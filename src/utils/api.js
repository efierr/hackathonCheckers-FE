import axios from "axios";

const apiUrl = "http://localhost:3040/bestmove";

export const getBestMove = async (board, playerColor) => {
    try {
       const response = await axios.post(apiUrl, {board, playerColor});
       console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching best move:", error);
    }
};


