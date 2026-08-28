setTimeout(() => {
  const mount = document.getElementById('app');
  if (mount && !mount.firstElementChild) {
    mount.innerHTML = '<main id="main" style="max-width:42rem;margin:12vh auto;padding:2rem;font:17px/1.55 system-ui,sans-serif;color:#17251f"><p style="letter-spacing:.12em">FIELD NOTE · OFFLINE</p><h1 style="font-size:clamp(2.5rem,9vw,4.5rem);line-height:1">Offline, with your files still local.</h1><p>The workbench script is not in this browser cache yet. Reconnect once to finish installing Triagebox; no file data was sent or changed.</p></main>';
  }
}, 1200);
