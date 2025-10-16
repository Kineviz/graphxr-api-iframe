const TIMEOUT = 1000;

export default function (selector = "#graphxr-iframe") {
  const task = {};
  let queue = [];

  const run = async (resolve, reject) => {
    try {
      // Wait for canvas to be loaded before running commands
      await waitForIframeLoaded(selector);
      await waitForCanvasLoaded(selector);
      const result = await runWithTimeout(queue, selector, TIMEOUT);
      queue = [];
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  };

  const proxy = new Proxy(task, {
    get(target, action, receiver) {
      if (action === "then") {
        return (resolve, reject) => run(resolve, reject);
      }

      const wrapped = (...args) => {
        args.forEach((arg) => checkForFunctions(arg));
        queue.push({ action, args });
        return proxy;
      };

      return wrapped;
    },
  });

  return proxy;
}

async function waitForIframeLoaded(selector = "#graphxr-iframe") {
  while (true) {
    const iframe = document.querySelector(selector);
    if (iframe) {
      return iframe;
    }
    await new Promise(resolve => setTimeout(resolve, TIMEOUT));
  }
}

async function waitForCanvasLoaded(selector = "#graphxr-iframe") {
  while (true) {
    try {
      const result = await runWithTimeout(
        [{ action: "isCanvasLoaded", args: [] }],
        selector,
        TIMEOUT
      );
      if (result === true) {
        return;
      }
    } catch (err) {}
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
  }
}

async function runWithTimeout(
  queue,
  selector = "#graphxr-iframe",
  timeout = TIMEOUT
) {
  const iframe = document.querySelector(selector);
  const iframeWindow = iframe.contentWindow;
  const origin = new URL(iframe.src).origin;

  return new Promise((resolve, reject) => {
    let timeoutId;
    let resolved = false;

    // Wait for a response from GraphXR
    const listener = async (e) => {
      if (e.data._type === "gxr") {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          window.removeEventListener("message", listener);
          resolve(e.data.result);
        }
      }
    };
    window.addEventListener("message", listener);

    // Set up timeout to prevent hanging forever
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener("message", listener);
        reject(
          new Error(
            `GraphXR API response timeout - no response received within ${timeout}ms`
          )
        );
      }
    }, timeout);

    // Send the queue of actions to GraphXR
    iframeWindow.postMessage({ _type: "gxr", queue }, origin);
  });
}

// Recursively walk an object and throw an error on any function
const checkForFunctions = (obj) => {
  if (!obj) return;
  if (typeof obj === "function") {
    throw new Error("Cannot pass functions to iframe");
  }
  if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      checkForFunctions(obj[key]);
    });
  }
};
