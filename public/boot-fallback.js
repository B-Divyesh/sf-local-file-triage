setTimeout(() => {
  const mount = document.getElementById('app');
  if (mount && !mount.firstElementChild) {
    mount.innerHTML = '<main id="main" style="max-width:42rem;margin:12vh auto;padding:2rem;font:17px/1.55 system-ui,sans-serif;color:#17251f"><p style="letter-spacing:.12em">OFFLINE</p><h1 style="font-size:clamp(2.5rem,9vw,4.5rem);line-height:1">Triagebox has not finished loading.</h1><p>Reconnect once to cache the app. No file details were sent or changed.</p></main>';
  }
}, 1200);
