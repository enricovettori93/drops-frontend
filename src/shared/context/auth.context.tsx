import {createContext, createSignal, onMount, useContext, Show} from "solid-js";
import createAuth0Client, {Auth0Client, User} from "@auth0/auth0-spa-js";
import authConfig from "../auth.config";
import {AUTH_REDIRECT_URI} from "../constants";
import {createStore} from "solid-js/store";

interface AuthDispatchContext {
  login: () => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<User | undefined>
  getToken: () => Promise<string | undefined>
  isAuthenticated: () => Promise<boolean | undefined>
}

interface AuthStateContext {
  loading: boolean,
  isAuthenticated: boolean
}

const AuthDispatchContext = createContext<AuthDispatchContext>();
const AuthStateContext = createContext<AuthStateContext>();

const initialState: AuthStateContext = {
  loading: false,
  isAuthenticated: false
}

interface AuthProviderProps {
  children: any
}

const LoginLoader = () => {
  return (
    <>
      Loading...
    </>
  )
}

const AuthProvider = (props: AuthProviderProps) => {
  const [store, setStore] = createStore(initialState);
  const [auth, setAuth] = createSignal<Auth0Client | undefined>(undefined)

  onMount(async () => {
    await configureClient();
  });

  async function configureClient() {
    setAuth(await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId
    }));
  }

  async function login() {
    await auth()?.loginWithRedirect({
      redirect_uri: AUTH_REDIRECT_URI
    });

    setStore('isAuthenticated', true);
  }

  async function logout() {
    await auth()?.logout({
      returnTo: AUTH_REDIRECT_URI
    });

    setStore('isAuthenticated', false);
  }

  async function handleRedirectCallback() {
    await auth()?.handleRedirectCallback()
    window.history.replaceState({}, document.title, "/joypad/");
  }

  async function isAuthenticated() {
    return auth()?.isAuthenticated();
  }

  async function getUser() {
    return auth()?.getUser();
  }

  async function getToken() {
    return auth()?.getTokenSilently();
  }

  return (
    <AuthStateContext.Provider value={store}>
      <AuthDispatchContext.Provider
        value={{
          logout,
          login,
          getToken,
          getUser,
          isAuthenticated
        }}
      >
        <Show when={!store.loading} fallback={<LoginLoader/>}>
          {props.children}
        </Show>
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider;

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
