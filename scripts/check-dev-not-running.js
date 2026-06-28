const net = require("net");

const DEV_PORT = Number(process.env.PORT || 3001);

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });

    const finish = (inUse) => {
      socket.removeAllListeners();
      if (!socket.destroyed) socket.destroy();
      resolve(inUse);
    };

    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    setTimeout(() => finish(false), 1000);
  });
}

isPortInUse(DEV_PORT).then((inUse) => {
  if (!inUse) return;

  console.error("");
  console.error(`Build blocked: port ${DEV_PORT} is in use (dev server likely running).`);
  console.error("Stop `npm run dev` before building — running both corrupts `.next`.");
  console.error("To build anyway: npx next build");
  console.error("");
  process.exit(1);
});
