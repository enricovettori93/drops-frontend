const url = new URL(window.location.href);
const HOSTNAME = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
const HOSTNAME_NO_PROTOCOL = `${url.hostname}${url.port ? `:${url.port}` : ''}`;
const AUTH_REDIRECT_URI = `${HOSTNAME}${url.pathname}`;
enum SLIDER_TYPE {
  MILITARY = "military",
  PRODUCTION = "production",
  RESEARCH = "research"
}
const DEVELOPMENT_AT_END_ROUND = 5;
const RESOURCES_AT_END_ROUND = 50;

export {url, HOSTNAME, HOSTNAME_NO_PROTOCOL, AUTH_REDIRECT_URI, SLIDER_TYPE, RESOURCES_AT_END_ROUND, DEVELOPMENT_AT_END_ROUND};