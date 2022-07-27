import createAuth0Client, {Auth0Client} from "@auth0/auth0-spa-js";
import authConfig from "./auth.config";
import {AUTH_REDIRECT_URI} from "./constants";

// TODO: to be removed
class Authenticator {
  private Auth: Auth0Client | undefined;

  constructor() {
    this.configureClient();
  }

  private async configureClient() {
    this.Auth = await createAuth0Client({
      domain: authConfig.domain,
      client_id: authConfig.clientId
    });
  }

  public async login() {
    await this.Auth?.loginWithRedirect({
      redirect_uri: AUTH_REDIRECT_URI
    });
  }

  public async logout() {
    await this.Auth?.logout({
      returnTo: AUTH_REDIRECT_URI
    });
  }

  public async handleRedirectCallback() {
    await this.Auth?.handleRedirectCallback()
    window.history.replaceState({}, document.title, "/joypad/");
  }

  public isAuthenticated() {
    return this.Auth?.isAuthenticated();
  }

  public getUser() {
    return this.Auth?.getUser();
  }
  public getToken() {
    return this.Auth?.getTokenSilently();
  }
}