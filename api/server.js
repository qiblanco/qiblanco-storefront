const createCache = () => {
  const store = new Map();

  return {
    async match(request) {
      const key = typeof request === 'string' ? request : request.url;
      const response = store.get(key);
      return response ? response.clone() : undefined;
    },
    async put(request, response) {
      const key = typeof request === 'string' ? request : request.url;
      store.set(key, response.clone());
    },
    async delete(request) {
      const key = typeof request === 'string' ? request : request.url;
      return store.delete(key);
    },
  };
};

if (!globalThis.caches) {
  const cacheMap = new Map();
  globalThis.caches = {
    async open(name) {
      if (!cacheMap.has(name)) cacheMap.set(name, createCache());
      return cacheMap.get(name);
    },
    async match(request) {
      for (const cache of cacheMap.values()) {
        const response = await cache.match(request);
        if (response) return response;
      }
      return undefined;
    },
    async has(name) {
      return cacheMap.has(name);
    },
    async delete(name) {
      return cacheMap.delete(name);
    },
  };
}

let serverPromise;

const getServer = async () => {
  serverPromise ??= import('../dist/server/index.js').then(
    (module) => module.default,
  );
  return serverPromise;
};

const readBody = async (request) => {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
};

const toWebRequest = async (request) => {
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return new Request(`${protocol}://${host}${request.url}`, {
    method: request.method,
    headers,
    body: await readBody(request),
  });
};

const sendResponse = async (response, webResponse) => {
  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => response.setHeader(key, value));
  response.end(Buffer.from(await webResponse.arrayBuffer()));
};

export default async function handler(request, response) {
  try {
    const webRequest = await toWebRequest(request);
    const executionContext = {
      waitUntil(promise) {
        Promise.resolve(promise).catch((error) => console.error(error));
      },
      passThroughOnException() {},
    };
    const server = await getServer();
    const webResponse = await server.fetch(
      webRequest,
      process.env,
      executionContext,
    );
    await sendResponse(response, webResponse);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end('An unexpected error occurred');
  }
}
