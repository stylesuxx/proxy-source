# Proxy Source
[![Build Status](https://travis-ci.org/stylesuxx/proxy-source.svg?branch=master)](https://travis-ci.org/stylesuxx/proxy-source) [![dependencies Status](https://david-dm.org/stylesuxx/proxy-source/status.svg)](https://david-dm.org/stylesuxx/proxy-source) [![devDependencies Status](https://david-dm.org/stylesuxx/proxy-source/dev-status.svg)](https://david-dm.org/stylesuxx/proxy-source?type=dev)

> You need a working proxy for your project? Look no further.

This library provides you with a simple way to get tested and working proxy.

Under the hood it uses the [proxy-lists](https://github.com/chill117/proxy-lists) and [proxy-verify]() library and adds some own magic.

Options are directly passed to the [proxy-lists](https://github.com/chill117/proxy-lists) library thus all those settings are available, extended by the following options:

```js
const options = {
  timeout: 30000,
  maxResponse: 3000,
  check: {
    anonymityLevel: false,
    protocols: false,
    tunneling: false,
    speed: false,
  },
};
```

### timeout
Sometimes it takes a long time for [proxy-lists](https://github.com/chill117/proxy-lists) to finish gathering proxies - if you know you only need a couple of proxies set this timeout to abort proxy gathering early.

By default it will stop after 30 seconds.

### maxResponse
The amount of microsecods to wait for test results to return. This can also be used to filter out slow proxies.

This makes only sense in combination with the **speed** check.

Be careful about setting it too low or a lot of proxies might not pass

### check
This property controls which checks are being applied. Some of the checks require you to pass according parameters to [proxy-lists](https://github.com/chill117/proxy-lists)

#### anonymityLevel
Check that the proxy matches at least one of the supplied anonymity levels.

#### protocols
Check that the proxy matches at least one of the requested protocols.

#### tunneling
Make sure that the proxy supports tunneling. In practical use, this option check if **https** request can be made through this proxy.

#### speed
In combination with the maxResponse option this checks that the proxy responds in a certain amount of time.

## Usage
### ES6 with Promises
```js
import { ProxySource } from 'proxy-source';

const options = {
  timeout: 10000,
  maxResponse: 3000,
  check: {
    anonymityLevel: false,
    protocols: true,
    tunneling: true,
  },
  /* proxy-lists config follows*/
  series: false,
  protocols: ['http', 'https'],
};

const proxySource = new ProxySource(options);
proxySource.initialize().then(() => {
  proxySource.get().then((proxy) => {
    console.log(proxy);
  });
});
```

### ES7 with async/await
```js
import { ProxySource } from 'proxy-source';

const options = {
  timeout: 10000,
  maxResponse: 3000,
  check: {
    anonymityLevel: false,
    protocols: true,
    tunneling: true,
  },
  /* proxy-lists config follows*/
  series: false,
  protocols: ['http', 'https'],
};

const func = async () => {
  const proxySource = new ProxySource(options);
  await proxySource.initialize();

  const proxy = await proxySource.get();
  console.log(proxy);
}

func();
```

Even if no checks are active, the get method will return a proxy that you can at least connect to.

## Development
Clone the repository and install the dependencies via yarn:

    yarn install

**PR** requests are very welcome. If you add functionality, make sure that test cases are in place and that they pass locally. Travis might sometimes fail, especially when it comes to calling external API's like it is the case when gathering the proxies.

### Running the tests

    yarn test
