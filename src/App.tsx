// src/App.tsx
import React, { useState } from 'react';

type Card = {
  suit: string;
  value: string;
  score: number;
};

type Player = {
  hand: Card[];
  score: number;
};

const suits = ["♠", "♣", "♥", "♦"];
const values = [
  { value: "A", score: 11 },
  { value: "2", score: 2 },
  { value: "3", score: 3 },
  { value: "4", score: 4 },
  { value: "5", score: 5 },
  { value: "6", score: 6 },
  { value: "7", score: 7 },
  { value: "8", score: 8 },
  { value: "9", score: 9 },
  { value: "10", score: 10 },
  { value: "J", score: 10 },
  { value: "Q", score: 10 },
  { value: "K", score: 10 },
];

const App: React.FC = () => {
  const [player, setPlayer] = useState<Player>({ hand: [], score: 0 });
  const [dealer, setDealer] = useState<Player>({ hand: [], score: 0 });
  const [deck, setDeck] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [dealerRevealed, setDealerRevealed] = useState(false);  
  const [bet, setBet] = useState<string>("");  // เปลี่ยนเป็น string เพื่อให้สามารถกรอกเลขได้ง่ายขึ้น
  const [playerMoney, setPlayerMoney] = useState<number>(100);  

  const initializeDeck = (): Card[] => {
    let deck: Card[] = [];
    suits.forEach((suit) => {
      values.forEach(({ value, score }) => {
        deck.push({ suit, value, score });
      });
    });
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: Card[]): Card[] => {
    return deck.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const betAmount = Number(bet);
    if (betAmount <= 0 || betAmount > playerMoney) {
      alert("Please place a valid bet.");
      return;
    }
    const newDeck = initializeDeck();
    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const dealerHand = [newDeck.pop()!, newDeck.pop()!];
    setPlayer({ hand: playerHand, score: calculateScore(playerHand) });
    setDealer({ hand: dealerHand, score: calculateScore(dealerHand) });
    setDeck(newDeck);
    setGameOver(false);
    setDealerRevealed(false);  
  };

  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((acc, card) => acc + card.score, 0);
    let aces = hand.filter(card => card.value === "A").length;
    while (score > 21 && aces) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const drawCard = (player: Player, setPlayer: React.Dispatch<React.SetStateAction<Player>>) => {
    if (deck.length > 0) {
      const card = deck.pop()!;
      const newHand = [...player.hand, card];
      const newScore = calculateScore(newHand);
      setPlayer({ hand: newHand, score: newScore });
    }
  };

  const handleStand = () => {
    let dealerScore = dealer.score;
    while (dealerScore < 17 && deck.length > 0) {
      drawCard(dealer, setDealer);
      dealerScore = calculateScore(dealer.hand);
    }
    setDealerRevealed(true);  
    setGameOver(true);
    calculateWinner();
  };

  const calculateWinner = () => {
    let updatedMoney = playerMoney;
    const betAmount = Number(bet);
    if (player.score > 21) {
      updatedMoney -= betAmount;  
    } else if (dealer.score > 21 || player.score > dealer.score) {
      updatedMoney += betAmount;  
    } else if (player.score < dealer.score) {
      updatedMoney -= betAmount;  
    }
    setPlayerMoney(updatedMoney);  
  };

  const renderResult = () => {
    if (player.score > 21) return "You Bust! Dealer Wins!";
    if (dealer.score > 21) return "Dealer Busts! You Win!";
    if (player.score === dealer.score) return "It's a Tie!";
    return player.score > dealer.score ? "You Win!" : "Dealer Wins!";
  };

  const calculateDealerVisibleScore = (hand: Card[]): number => {
    const visibleHand = dealerRevealed ? hand : hand.slice(1); 
    return calculateScore(visibleHand);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "40px" }}>Blackjack</h1>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "24px" }}>Your Money: ${playerMoney}</h3>
        <input 
          type="number" 
          value={bet} 
          onChange={(e) => setBet(e.target.value)} 
          placeholder="Enter Bet"
          style={{ fontSize: "18px", padding: "10px", width: "200px", marginRight: "10px" }}
        />
        <button onClick={startGame} style={{ fontSize: "18px", padding: "10px 20px" }}>
          Start Game
        </button>
      </div>
      <div style={{ margin: "20px" }}>
        <h2 style={{ fontSize: "30px" }}>Player's Hand</h2>
        <div>{player.hand.map((card, i) => <span key={i} style={{ fontSize: "24px" }}>{card.value + card.suit} </span>)}</div>
        <p style={{ fontSize: "24px" }}>Score: {player.score}</p>
        <button onClick={() => drawCard(player, setPlayer)} disabled={gameOver} style={{ fontSize: "18px", padding: "10px 20px" }}>Hit</button>
        <button onClick={handleStand} disabled={gameOver} style={{ fontSize: "18px", padding: "10px 20px", marginLeft: "10px" }}>Stand</button>
      </div>
      <div style={{ margin: "20px" }}>
        <h2 style={{ fontSize: "30px" }}>Dealer's Hand</h2>
        <div>
          {dealer.hand.map((card, i) => {
            if (i === 0 && !dealerRevealed) {
              return <span key={i} style={{ fontSize: "24px" }}>🂠 </span>;
            }
            return <span key={i} style={{ fontSize: "24px" }}>{card.value + card.suit} </span>;
          })}
        </div>
        <p style={{ fontSize: "24px" }}>Score: {dealerRevealed ? dealer.score : calculateDealerVisibleScore(dealer.hand)}</p>
      </div>
      {gameOver && <h2 style={{ fontSize: "30px" }}>{renderResult()}</h2>}
    </div>
  );
};

export default App;
