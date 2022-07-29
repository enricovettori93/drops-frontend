import {createContext, createSignal, useContext} from "solid-js";
import {createStore} from "solid-js/store";
import * as Colyseus from "colyseus.js";
import {Client} from "colyseus.js";

// TODO: type
interface GameDispatchContext {
  init: () => void
  startGameLoop: (client: any, user: any) => Promise<void>
  joinRelayRoom: (client: any, user: any) =>  Promise<void>
  waitForBattleReady: () => Promise<void>
  waitForBattleStart: () => Promise<void>
  clearBattleRoomOnStorage: () => void
  werePlayingAGame: () => boolean
  saveBattleSessionOnStorage: () => void
  joinBattleRoom: () => Promise<void>
  handleStateChange: () => Promise<void>
}

// TODO: type
interface GameStateContext {
  battleRoom: any,
  relayRoom: any,
  relayQueue: any[]
}

interface GameProviderProps {
  children: any
}

const GameDispatchContext = createContext<GameDispatchContext>();
const GameStateContext = createContext<GameStateContext>();

const initialState: GameStateContext = {
  battleRoom: null,
  relayQueue: [],
  relayRoom: null
}

const GameProvider = (props: GameProviderProps) => {
  const [store, setStore] = createStore(initialState);
  const [client, setClient] = createSignal<Client>();

  const init = () => {
    setClient(new Colyseus.Client('ws://localhost:2567'));
  }

  const startGameLoop = (client: any, user: any) => {
    return Promise.resolve();
  }

  const joinRelayRoom = (client: any, user: any) => {
    return Promise.resolve();
  }

  const waitForBattleReady = () => {
    return Promise.resolve();
  }

  const waitForBattleStart = () => {
    return Promise.resolve();
  }

  const clearBattleRoomOnStorage = () => {

  }

  const werePlayingAGame = () => {
    return true;
  }

  const saveBattleSessionOnStorage = () => {

  }

  const joinBattleRoom = () => {
    return Promise.resolve();
  }

  const handleStateChange = () => {
    return Promise.resolve();
  }

  return (
    <GameStateContext.Provider value={store}>
      <GameDispatchContext.Provider value={{
        init,
        startGameLoop,
        joinRelayRoom,
        waitForBattleReady,
        waitForBattleStart,
        clearBattleRoomOnStorage,
        werePlayingAGame,
        saveBattleSessionOnStorage,
        joinBattleRoom,
        handleStateChange,

      }}>
        {props.children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  )
}

export default GameProvider;

export const useGameState = () => useContext(GameStateContext);
export const useGameDispatch = () => useContext(GameDispatchContext);