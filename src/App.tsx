import type { Component } from 'solid-js';
import { Routes, Route } from "solid-app-router"
import {lazy, onMount} from "solid-js";
import {useAuthDispatch} from "./shared/context/auth.context";
const JoypadLayout = lazy(() => import("./shared/layout/JoypadLayout"));
const Landing = lazy(() => import("./pages/Home"));
const Joypad = lazy(() => import("./pages/Joypad"));
const Viewer = lazy(() => import("./pages/Viewer"));
const Login = lazy(() => import( "./pages/Login"));
const GameProvider = lazy(() => import( "./shared/context/game.context"));

const gamePage = () => {
  return (
    <GameProvider>
      <Joypad/>
    </GameProvider>
  )
}

const App: Component = () => {
  const authDispatch = useAuthDispatch();

  onMount(async () => {
    if (authDispatch?.isComingFromRedirect()) {
      await authDispatch?.handleRedirectCallback();
    }
  });

  return (
    <Routes>
      <Route path="/" component={Landing} />
      <Route path="/joypad" component={JoypadLayout}>
        <Route path="" component={gamePage}/>
      </Route>
      <Route path="/viewer" element={Viewer} />
      <Route path="/auth/login" component={Login} />
    </Routes>
  );
};

export default App;
