export class SpecialEntityRegistry {
  constructor() {
    this.registry = new Map();
  }

  register(type, factory) {
    this.registry.set(type, factory);
  }

  create(type, options) {
    const factory = this.registry.get(type);
    if (!factory) {
      throw new Error(`No special entity factory registered for ${type}`);
    }
    return factory(options);
  }
}
