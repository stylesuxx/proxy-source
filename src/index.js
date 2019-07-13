import ProxyLists from 'proxy-lists';
import ProxyVerifier from 'proxy-verifier';

class ProxySourceEmpty extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ProxySourceNonePassed extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ProxySource {
  constructor(options) {
    this.options = Object.assign({
      check: {},
    }, options);

    this.maxResponse = this.options.maxResponse || 3000;
    this.timeout = this.options.timeout || 30000;

    this.check = Object.assign({
      anonymityLevel: false,
      protocols: false,
      tunneling: false,
      speed: false,
    }, this.options.check);

    this.proxies = [];
    this.count = 0;
    this.dismissed = 0;

    this.getProxies = () => new Promise((resolve) => {
      let proxies = [];
      const proxyGetter = ProxyLists.getProxies(this.options);
      const timeout = setTimeout(() => {
        resolve(proxies);
      }, this.timeout);
      proxyGetter.on('data', (data) => {
        proxies = proxies.concat(data);
        this.count += data.length;
      });
      proxyGetter.once('end', () => {
        clearTimeout(timeout);
        resolve(proxies);
      });
    });

    this.getRandom = () => {
      if (this.proxies.length > 0) {
        const random = Math.floor(Math.random() * this.proxies.length);
        const chosen = this.proxies.splice(random, 1)[0];

        return chosen;
      }

      throw new ProxySourceEmpty('Probably there is no proxy matching your criteria');
    };

    this.testAll = proxy => new Promise((resolve, reject) => {
      const reqOptions = {
        requestOptions: {},
      };
      if (this.check.speed) {
        reqOptions.requestOptions.timeout = this.maxResponse;
      }

      ProxyVerifier.testAll(proxy, reqOptions, (error, results) => {
        if (error) return reject();

        return resolve(results);
      });
    });

    this.test = async (proxy) => {
      const { tunnel, protocols } = this.check;

      if (!proxy.ipAddress || !proxy.port) {
        return false;
      }

      try {
        const results = await this.testAll(proxy);
        if (tunnel) {
          if (!results.tunnel.ok) {
            return false;
          }
        }

        if (protocols) {
          const keys = Object.keys(results.protocols);
          for (let i = 0; i < keys.length; i += 1) {
            if (!results.protocols[keys[i]].ok) {
              return false;
            }
          }
        }
      } catch (e) {
        return false;
      }

      return true;
    };

    this.sanitizeProxies = (proxies) => {
      const sanitized = [];
      const checked = [];

      for (let i = 0; i < proxies.length; i += 1) {
        const current = proxies[i];
        const unique = `${current.ipAddress}:${current.port}`;
        if (checked.indexOf(unique) < 0) {
          checked.push(unique);
          sanitized.push(current);
        }
      }

      return sanitized;
    };
  }

  async initialize() {
    const proxies = await this.getProxies();
    const sanitizedProxies = this.sanitizeProxies(proxies);
    this.proxies = sanitizedProxies;
  }

  async get() {
    if (this.proxies.length > 0) {
      /* eslint-disable no-await-in-loop */
      while (this.proxies.length > 0) {
        const current = this.getRandom();
        const result = await this.test(current);
        if (result) {
          return current;
        }

        this.dismissed += 1;
      }
      /* eslint-enable no-await-in-loop */

      throw new ProxySourceNonePassed('No proxy server passed the tests');
    }

    throw new ProxySourceEmpty('Probably there is no proxy matching your criteria');
  }
}

export {
  ProxySource,
  ProxySourceEmpty,
  ProxySourceNonePassed,
};
