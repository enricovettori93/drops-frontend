import {createContext, createSignal, onMount, Show, useContext} from "solid-js";
import {createStore} from "solid-js/store";
import * as Colyseus from "colyseus.js";
import {Client, Room} from "colyseus.js";
import GameLoader from "../components/GameLoader";
import {useAuthDispatch} from "./auth.context";
import {User} from "@auth0/auth0-spa-js";
import {BATTLE_ROOM, LOCALSTORAGE, RELAY_ROOM} from "../constants";

interface GameDispatchContext {
  init: () => void
  startGameLoop: (user: User) => Promise<void>
  joinRelayRoom: (user: User) =>  Promise<void>
  waitForBattleReady: () => Promise<void>
  waitForBattleStart: () => Promise<void>
  clearBattleRoomOnStorage: () => void
  werePlayingAGame: () => boolean
  saveBattleSessionOnStorage: () => void
  joinBattleRoom: (user: User) => Promise<void>
  handleStateChange: (user: User) => void
  sendSliderValues: ({ military, production, research}: { military: number, production: number, research: number }) => void
}

interface GameStateContext {
  battleRoom: Room | null,
  relayRoom: Room | null,
  relayQueue: any[],
  bootstrapped: boolean
}

interface GameProviderProps {
  children: any
}

const GameDispatchContext = createContext<GameDispatchContext>();
const GameStateContext = createContext<GameStateContext>();

const initialState: GameStateContext = {
  battleRoom: null,
  relayQueue: [],
  relayRoom: null,
  bootstrapped: false
}

const GameProvider = (props: GameProviderProps) => {
  const [store, setStore] = createStore(initialState);
  const [gameClient, setClientClient] = createSignal<Client>();
  const authDispatch = useAuthDispatch();

  onMount(async () => {
    await init();
  });

  const init = async () => {
    setClientClient(new Colyseus.Client('ws://localhost:2567'));
    setStore("bootstrapped", true);

    const user = await authDispatch?.getUser();
    if (user) {
      await startGameLoop(user);
    }
  }

  const startGameLoop = async (user: User) => {
    try {
      console.log('Joining relay room...');
      await joinRelayRoom(user);

      console.log('Waiting for enough players...');
      await waitForBattleReady();

      console.log('Joining battle room...');
      await joinBattleRoom(user);

      console.log('Waiting for start battle message...');
      await waitForBattleStart();

      console.log("Battle started");

      await handleStateChange(user);
    } catch (err) {
      console.error(err);
    }
  }

  const joinRelayRoom = async (user: User) => {
    const relayRoom = await gameClient()?.join("relay");

    if (relayRoom) {
      setStore("relayRoom", relayRoom);

      console.log('sending identity');
      store.relayRoom?.send(RELAY_ROOM.IDENTITY, buildIdentityString(user))
      console.log("Joined lobby");

      store.relayRoom?.onMessage(RELAY_ROOM.QUEUE, (queue: any) => {
        store.relayQueue = queue;
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

    saveBattleSessionOnStorage();

    store.battleRoom?.send(BATTLE_ROOM.IDENTITY, buildIdentityString(user))
  }

  const handleStateChange = (user: User) => {
    // TODO: serve? copiato e incollato dal codice originale ma non sembra essere usato da nessuna parte
    store.battleRoom?.onStateChange(state => {
      const field = []
      state.field.cols.forEach((col: any) => {
        const column: any[] = [];
        col.col.forEach((cell: any) => {
          column.push(cell);
        });
        field.push(column);
      });
    });
  }

  const buildIdentityString = (user: User) => {
    console.log(`user`, user)
    return `${user.sub}#${user.name}#${user.picture}`;
  }

  const sendSliderValues = ({military, production, research}: { military: number, production: number, research: number }) => {
    const toSend: number[] = [];
    toSend[0] = military;
    toSend[1] = production;
    toSend[2] = research;
    store.battleRoom?.send(BATTLE_ROOM.ACTION, toSend.join(','));
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
        sendSliderValues
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
