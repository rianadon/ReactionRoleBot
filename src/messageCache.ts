export default class TimedMessageCache<K,V> {
	private store: Map<K, Set<V>> = new Map();
	private timers: Map<K, NodeJS.Timeout> = new Map();
	private readonly TTL_MS = 60 * 60 * 1000;

	set(item: K, key: V): number {
		if (!this.store.has(item)) {
			this.store.set(item, new Set());
			const timer = setTimeout(() => {
				this.store.delete(item);
				this.timers.delete(item);
			}, this.TTL_MS);
			this.timers.set(item, timer);
		}
		const keys = this.store.get(item)!;
		keys.add(key);
		return keys.size;
	}

	get(item: K): V[] {
		const keys = this.store.get(item);
		return keys ? Array.from(keys) : [];
	}

	remove(item: K, key: V): number {
		const keys = this.store.get(item);
		if (!keys) return 0;

		keys.delete(key);

		// Skip cleanup
		return keys.size;
	}
}
