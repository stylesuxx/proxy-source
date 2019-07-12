import test from 'tape';
import { ProxySource } from '../src';

test('ProxySource instance without options', async (t) => {
  try {
    const options = {
      sourcesWhiteList: [
        'proxylists-net',
      ],
    };
    const proxySource = new ProxySource(options);
    t.notEqual(proxySource, null, 'should create instance');

    await proxySource.initialize();
    const count = proxySource.proxies.length;
    t.ok(count > 0, `should have results (${count})`);

    const proxy = await proxySource.get();
    const { dismissed } = proxySource;
    t.notEqual(proxy, null, `should return a proxy (dismissed ${dismissed})`);
    t.ok('ipAddress' in proxy, 'proxy should have an IP address');
    t.ok('port' in proxy, 'proxy should have a port');

    const proxy1 = await proxySource.get();
    const dismissed1 = proxySource.dismissed;
    t.notEqual(`${proxy.ipAddress}:${proxy.port}`, `${proxy1.ipAddress}:${proxy1.port}`, `should return a different proxy(dismissed ${dismissed1})`);

    t.end();
  } catch (e) {
    t.fail(e);
  }
});

test('ProxySource instance with options and checks', async (t) => {
  try {
    const options = {
      timeout: 5000,
      maxResponse: 1000,
      check: {
        anonymityLevel: false,
        protocols: true,
        tunnel: true,
        speed: true,
      },
      series: false,
      protocols: ['http', 'https', 'socks4', 'socks5'],
      // anonymityLevels: ['anonymous', 'elite'],
      sourcesBlackList: [
        'bitproxies',
        // 'proxylists-net',
        // 'gatherproxy',
      ],
      sourcesWhiteList: [
        'proxylists-net',
      ],
    };
    const proxySource = new ProxySource(options);
    t.notEqual(proxySource, null, 'should create instance');

    await proxySource.initialize();
    const count = proxySource.proxies.length;
    t.ok(count > 0, `should have results (${count})`);

    const proxy = await proxySource.get();
    const { dismissed } = proxySource;
    t.notEqual(proxy, null, `should return a proxy (dismissed ${dismissed})`);
    t.ok('ipAddress' in proxy, 'proxy should have an IP address');
    t.ok('port' in proxy, 'proxy should have a port');

    const proxy1 = await proxySource.get();
    const dismissed1 = proxySource.dismissed;
    t.notEqual(`${proxy.ipAddress}:${proxy.port}`, `${proxy1.ipAddress}:${proxy1.port}`, `should return a different proxy(dismissed ${dismissed1})`);

    /*
    const received = [];
    try {
      for (let i = 0; i < proxySource.count; i += 1) {
        console.log('get', i);
        const proxy = await proxySource.get();
        received.push(proxy);
        console.log(proxy);
      }
    } catch (e) {
      console.log(e);
      console.log(proxySource.count, proxySource.dismissed, received.length);
    }
    */

    t.end();
  } catch (e) {
    t.fail(e);
  }
});
