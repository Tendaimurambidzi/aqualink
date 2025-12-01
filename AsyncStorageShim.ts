// Minimal AsyncStorage shim to keep persistence working without native module install.
// In production, swap to '@react-native-async-storage/async-storage'.
type Value = string | null;

const memory = new Map<string, string>();

const AsyncStorage = {
  async getItem(key: string): Promise<Value> {
    return memory.has(key) ? memory.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    memory.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    memory.delete(key);
  },
  async clear(): Promise<void> {
    memory.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return Array.from(memory.keys());
  },
  async multiGet(keys: string[]): Promise<[string, Value][]> {
    return Promise.all(keys.map(k => this.getItem(k).then(v => [k, v])));
  },
  async multiSet(pairs: [string, string][]): Promise<void> {
    await Promise.all(pairs.map(([k, v]) => this.setItem(k, v)));
  },
  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map(k => this.removeItem(k)));
  },
};

export default AsyncStorage;
