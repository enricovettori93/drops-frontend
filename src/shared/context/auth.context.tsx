import {createContext, createSignal, onMount, useContext, Show} from "solid-js";
import createAuth0Client, {Auth0Client, User} from "@auth0/auth0-spa-js";
import authConfig from "../auth.config";
import {AUTH_REDIRECT_URI} from "../constants";
import {createStore} from "solid-js/store";
import {useNavigate} from "solid-app-router";
import Login from "../../pages/Login";
import LoginLoader from "../components/LoginLoader";

interface AuthDispatchContext {
  login: () => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<User | undefined>
  getToken: () => Promise<string | undefined>
  isAuthenticated: () => Promise<boolean | undefined>
  handleRedirectCallback: () => Promise<void>
  isComingFromRedirect: () => boolean
}

interface AuthStateContext {
  loading: boolean,
  isAuthenticated: boolean
}

const AuthDispatchContext = createContext<AuthDispatchContext>();
const AuthStateContext = createContext<AuthStateContext>();

const initialState: AuthStateContext = {
  loading: true,
  isAuthenticated: false
}

interface AuthProviderProps {
  children: any
}

const AuthProvider = (props: AuthProviderProps) => {
  const [store, setStore] = createStore(initialState);
  const [authClient, setAuthClient] = createSignal<Auth0Client | undefined>(undefined);
  const navigate = useNavigate();

  onMount(async () => {
    await configureClient();
    setStore("loading", false);
    const isAuthenticated = await authClient()?.isAuthenticated();

    if (typeof isAuthenticated === "boolean") {
      setStore("isAuthenticated", isAuthenticated);
    }
  });

  async function configureClient() {
    const client = await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId
    });

    setAuthClient(client);
  }

  async function login() {
    await authClient()?.loginWithRedirect({
      redirect_uri: AUTH_REDIRECT_URI
    });

    setStore('isAuthenticated', true);
  }

  async function logout() {
    await authClient()?.logout({
      returnTo: AUTH_REDIRECT_URI
    });

    setStore('isAuthenticated', false);
  }

  async function isAuthenticated() {
    return authClient()?.isAuthenticated();
  }

  async function getUser() {
    return authClient()?.getUser();
  }

  async function getToken() {
    return authClient()?.getTokenSilently();
  }

  function isComingFromRedirect() {
    const query = window.location.search;
    return query.includes("code=") && query.includes("state=");
  }

  async function handleRedirectCallback() {
    await authClient()?.handleRedirectCallback();
    navigate("/joypad", {replace: true});
  }

  return (
    <AuthStateContext.Provider value={store}>
      <AuthDispatchContext.Provider
        value={{
          logout,
          login,
          getToken,
          getUser,
          isAuthenticated,
          isComingFromRedirect,
          handleRedirectCallback
        }}
      >
        <Show when={!store.loading} fallback={LoginLoader}>
          {props.children}
        </Show>
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider;

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
