import {createContext, createSignal, onMount, Show, useContext} from "solid-js";
import {createStore, produce} from "solid-js/store";
import * as Colyseus from "colyseus.js";
import {Client, Room} from "colyseus.js";
import GameLoader from "../components/GameLoader";
import {User} from "@auth0/auth0-spa-js";
import {BATTLE_ROOM, LOCALSTORAGE, MULTIPLAYER_HOST, RELAY_ROOM} from "../constants";
import {BattleInfoCurrentPlayer} from "../../models/user";
import {SliderValuesPayload} from "../../models/game";

interface GameDispatchContext {
  init: () => Promise<void>
  startGameLoop: (user: User) => Promise<void>
  joinRelayRoom: (user: User) =>  Promise<void>
  waitForBattleReady: () => Promise<void>
  waitForBattleStart: () => Promise<void>
  clearBattleRoomOnStorage: () => void
  werePlayingAGame: () => boolean
  saveBattleSessionOnStorage: () => void
  joinBattleRoom: (user: User) => Promise<void>
  sendSliderValues: ({ military, production, research}: SliderValuesPayload) => void
  playAgain: () => void
}

interface GameStateContext {
  battleRoom: Room | null,
  relayRoom: Room | null,
  relayQueue: string[],
  bootstrapped: boolean,
  ui: UI,
  currentPlayerStats: BattleInfoCurrentPlayer | null,
  loading: {
    relayRoom: boolean,
    battleRoom: boolean
  }
}

interface GameProviderProps {
  children: any
}

type UI = "intro" | "queue" | "playing" | "ended" | "scoreboard";

const GameDispatchContext = createContext<GameDispatchContext>();
const GameStateContext = createContext<GameStateContext>();

const initialState: GameStateContext = {
  battleRoom: null,
  relayQueue: [],
  relayRoom: null,
  bootstrapped: false,
  ui: "intro",
  currentPlayerStats: null,
  loading: {
    relayRoom: true,
    battleRoom: true
  }
}

const GameProvider = (props: GameProviderProps) => {
  const [store, setStore] = createStore<GameStateContext>(initialState);
  const [gameClient, setClientClient] = createSignal<Client>();

  onMount(async () => {
    await init();
  });

  const init = async () => {
    console.log("[GAME PROVIDER] bootstrapping... connecting at", MULTIPLAYER_HOST)
    setClientClient(new Colyseus.Client(MULTIPLAYER_HOST));
    setStore("bootstrapped", true);
  }

  const startGameLoop = async (user: User) => {
    try {
      setStore("ui", "queue");

      console.log('Joining relay room...');
      await joinRelayRoom(user);

      console.log('Waiting for enough players...');
      await waitForBattleReady();

      console.log('Joining battle room...');
      await joinBattleRoom(user);

      console.log('Waiting for start battle message...');
      await waitForBattleStart();

      console.log("Battle started");

      handleBattleStateChange(user);

      setStore("ui", "playing");

      await waitForEndGame();
    } catch (err) {
      console.error(err);
    }
  }

  const handleBattleStateChange = (user: User) => {
    store.battleRoom?.onStateChange(state => {
      let currentPlayer: any;

      state.players.forEach((player: any) => {
        if (player.sub === user.sub) {
          currentPlayer = {...player};
        }
      });

      if (currentPlayer) {
        setStore("currentPlayerStats", (oldValue) => {
          return {
            ...oldValue,
            resources: currentPlayer.resources || 0,
            score: currentPlayer.score || 0,
            development: currentPlayer.development || 0,
            milestones_reached: currentPlayer.milestones_reached || 0,
            color: currentPlayer.color
          }
        })
      }
    });
  }

  const joinRelayRoom = async (user: User) => {
    const relayRoom = await gameClient()?.join("relay");

    setStore(
      produce(state => {
        state.loading.relayRoom = false;
      })
    )

    if (relayRoom) {
      setStore("relayRoom", relayRoom);

      console.log('sending identity');
      store.relayRoom?.send(RELAY_ROOM.IDENTITY, buildIdentityString(user))
      console.log("Joined lobby");

      store.relayRoom?.onMessage(RELAY_ROOM.QUEUE, (queue: any) => {
        setStore("relayQueue",(prev) => [...queue]);
      });
    }
  }

  const waitForBattleReady = async () => {
    return await new Promise<void>((resolve) => {
      store.relayRoom?.onMessage(RELAY_ROOM.BATTLE_READY, () => {
        console.log("Battle ready");
        store.relayRoom?.leave();
        resolve();
      })
    })
  }

  const waitForEndGame = async () => {
    return await new Promise<void>((resolve) => {
      store.battleRoom?.onMessage(BATTLE_ROOM.END_GAME, () => {
        console.log("Battle ended");
        store.battleRoom?.leave();
        setStore("relayQueue", (old) => ([]));
        setStore("ui", "ended");
        resolve();
      })
    })
  }

  const waitForBattleStart = async () => {
    return await new Promise<void>((resolve) => {
      store.battleRoom?.onMessage(BATTLE_ROOM.BATTLE_START, () => {
        resolve();
      });
    })
  }

  const clearBattleRoomOnStorage = () => {
    localStorage.removeItem(LOCALSTORAGE.BATTLE_ROOM_ID);
    localStorage.removeItem(LOCALSTORAGE.BATTLE_SESSION_ID);
  }

  const werePlayingAGame = () => {
    return Boolean(localStorage.getItem(LOCALSTORAGE.BATTLE_SESSION_ID));
  }

  const saveBattleSessionOnStorage = () => {
    store.battleRoom && localStorage.setItem(LOCALSTORAGE.BATTLE_SESSION, store.battleRoom?.sessionId);
  }

  const joinBattleRoom = async (user: User) => {
    if (werePlayingAGame()) {
      const sessionId = localStorage.getItem(LOCALSTORAGE.BATTLE_SESSION_ID) || "";
      const reconnected = await gameClient()?.reconnect("battle", sessionId);
      reconnected && setStore("battleRoom", reconnected);
    } else {
      clearBattleRoomOnStorage();
      const joined = await gameClient()?.join("battle");
      joined && setStore("battleRoom", joined);
    }

    setStore(
      produce(state => {
        state.loading.battleRoom = false;
      })
    )

    saveBattleSessionOnStorage();

    store.battleRoom?.send(BATTLE_ROOM.IDENTITY, buildIdentityString(user))
  }

  const buildIdentityString = (user: User) => {
    return `${user.sub}#${user.name}#${user.picture}`;
  }

  const sendSliderValues = ({military, production, research}: SliderValuesPayload) => {
    const toSend: number[] = [];
    toSend[0] = military;
    toSend[1] = production;
    toSend[2] = research;
    store.battleRoom?.send(BATTLE_ROOM.ACTION, toSend.join(','));
  }

  const playAgain = () => {
    setStore("ui", "intro");
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
        sendSliderValues,
        playAgain
      }}>
        <Show when={store.bootstrapped} fallback={GameLoader}>
          {props.children}
        </Show>
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  )
}

export default GameProvider;

export const useGameState = () => useContext(GameStateContext);
export const useGameDispatch = () => useContext(GameDispatchContext);
