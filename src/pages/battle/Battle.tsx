import JoyPad from "./phases/JoyPad";
import Intro from "./phases/Intro";
import {useAuthState} from "../../shared/context/auth.context";
import {User} from "@auth0/auth0-spa-js";
import {useGameDispatch, useGameState} from "../../shared/context/game.context";
import Queue from "./phases/Queue";
import Ended from "./phases/Ended";
import {BattleInfoCurrentPlayer} from "../../models/user";

const Battle = () => {
  const useAuth = useAuthState();
  const gameDispatch = useGameDispatch();
  const gameState = useGameState();

  const isInIntro = () => gameState?.ui === "intro";
  const isInGame = () => gameState?.ui === "playing" && gameState?.currentPlayerStats !== null;
  const isInQueue = () => gameState?.ui === "queue" && (gameState?.relayQueue.length || 0) > 0;
  const isGameEnded = () => gameState?.ui === "ended";

  const handleUserJoin = () => {
    gameDispatch?.startGameLoop(useAuth?.user as User);
  }

  const handleSliderChange = (values: {military: number, research: number, production: number}) => {
    gameDispatch?.sendSliderValues(values);
  }

  return (
    <>
      {
        isInIntro() && (
          <Intro
            user={useAuth!.user as User}
            onJoin={handleUserJoin}
          />
        )
      }
      {
        isInQueue() && (
          <Queue players={gameState?.relayQueue}/>
        )
      }
      {
        isInGame() && (
          <JoyPad onChange={handleSliderChange} playerStats={gameState?.currentPlayerStats as BattleInfoCurrentPlayer}/>
        )
      }
      {
        isGameEnded() && (
          <Ended/>
        )
      }
    </>
  )
}

export default Battle;
