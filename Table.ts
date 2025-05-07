export class Table<T, K extends string | number> {
  private rows = new Map<K, T>();
  private getKey: (row: T) => K;

  constructor(getKey: (row: T) => K) {
    this.getKey = getKey;
  }

  insert(row: T): void {
    const key = this.getKey(row);
    if (this.rows.has(key)) throw new Error(`Key already exists`);
    this.rows.set(key, row);
  }

  get(key: K): T | null {
    const row = this.rows.get(key);
    return row ? row : null;
  }

  update(row: T): void {
    const key = this.getKey(row);
    if (!this.rows.has(key)) throw new Error(`Key not found`);
    this.rows.set(key, row);
  }

  delete(key: K): boolean {
    return this.rows.delete(key);
  }

  getAll(): T[] {
    return Array.from(this.rows.values());
  }
}
