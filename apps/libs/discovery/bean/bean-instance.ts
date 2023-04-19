export class BeanInstance<T> {
  private instance: T;
  private proxy: ProxyHandler<any>;
  constructor(private injected: Record<string, any> = null) {}

  setInstance(instance: T) {
    this.instance = instance;
  }
  setProxy(proxy: ProxyHandler<any>) {
    this.proxy = proxy;
  }
  setInjected(injected: Record<string, any>) {
    this.injected = injected;
  }
  getInstance() {
    return this.instance;
  }
  getProxy() {
    return this.proxy;
  }
  getInjected() {
    return this.injected;
  }
}
