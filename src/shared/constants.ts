const url = new URL(window.location.href);
const HOSTNAME = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
const HOSTNAME_NO_PROTOCOL = `${url.hostname}${url.port ? `:${url.port}` : ''}`;
const AUTH_REDIRECT_URI = `${HOSTNAME}${url.pathname}`;

export {url, HOSTNAME, HOSTNAME_NO_PROTOCOL, AUTH_REDIRECT_URI};