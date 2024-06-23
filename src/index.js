export default function (iframeId) {
  const task = {isRunning:false};
  let queue = [];

  const run = () => new Promise((resolve) => {
    task.isRunning = true;
    const iframe = document.getElementById(iframeId);
    const iframeWindow = iframe.contentWindow;
    const origin = new URL(iframe.src).origin;

    // Wait for a response from GraphXR
    const listener = async (e) => {
      if (e.data._type === 'gxr') {
        window.removeEventListener('message', listener);
        resolve(e.data.result);
      }
    }
    window.addEventListener('message', listener);

    // Send the queue of actions to GraphXR)
    iframeWindow.postMessage({_type: "gxr", queue}, origin);
    queue = [];
  });

  const proxy = new Proxy(task, {
    get(target, action, receiver) {
      if (action === 'isRunning') {
        return task.isRunning;
      }

      if (action === "run") {
        return run;
      }

      const wrapped = (...args) => {
        args.forEach(arg => checkForFunctions(arg))
        queue.push({ action, args });
        return proxy;
      };

      return wrapped;
    }
  });

  return proxy;
}

// Recursively walk an object and throw an error on any function
const checkForFunctions = (obj) => {
  if (!obj) return;

  if (typeof obj === 'function') {
    throw new Error('Cannot pass functions to iframe');
  }

  if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      checkForFunctions(obj[key]);
    });
  }
}
