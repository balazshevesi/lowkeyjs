type id = number | string;
type attribute = string | number | boolean | null | undefined;

export class Table<Row extends object, Id extends id> {
  private rows = new Map<Id, Row>();
  private getKey: (row: Row) => Id;
  private indexes = new Map<string, Map<attribute, Set<Id>>>();

  constructor(getKey: (row: Row) => Id) {
    this.getKey = getKey;
  }

  insert(row: Row): void {
    const key = this.getKey(row);
    if (this.rows.has(key)) throw new Error(`Key already exists`);
    this.rows.set(key, row);
    const rowAttributes = Object.keys(row);
    rowAttributes.forEach((attribute) => {
      const attributeMap = this.indexes.get(attribute);
      if (!attributeMap) {
        const newMap = new Map<attribute, Set<Id>>();
        newMap.set(row[attribute], new Set([key]));
        this.indexes.set(attribute, newMap);
      } else {
        if (!attributeMap.has(row[attribute])) {
          attributeMap.set(row[attribute], new Set([key]));
        } else {
          const keysSet = attributeMap.get(row[attribute]);
          if (keysSet) keysSet.add(key);
        }
      }
    });
  }

  findByAttribute(attribute: keyof Row, value: attribute): Row[] {
    const attributeMap = this.indexes.get(String(attribute));
    if (!attributeMap) return [];
    const keysSet = attributeMap.get(value);
    if (!keysSet) return [];
    return Array.from(keysSet)
      .map((key) => this.rows.get(key))
      .filter((row) => row !== undefined);
  }

  get(key: Id): Row | null {
    const row = this.rows.get(key);
    return row ? row : null;
  }

  update(row: Row): void {
    const key = this.getKey(row);
    if (!this.rows.has(key)) throw new Error(`Key not found`);
    const oldRow = this.rows.get(key);
    if (!oldRow) throw new Error(`Key not found`);
    const oldRowAttributes = Object.keys(oldRow);
    const newRowAttributes = Object.keys(row);
    const attributesToUpdate = newRowAttributes.filter(
      (attribute) => oldRow[attribute] !== row[attribute]
    );
    if (attributesToUpdate.length === 0) return;
    attributesToUpdate.forEach((attribute) => {
      const attributeMap = this.indexes.get(attribute);
      if (!attributeMap) return;
      const oldValue = oldRow[attribute];
      const newValue = row[attribute];
      const oldKeysSet = attributeMap.get(oldValue);
      if (oldKeysSet) {
        oldKeysSet.delete(key);
        if (oldKeysSet.size === 0) attributeMap.delete(oldValue);
      }
      if (!attributeMap.has(newValue)) {
        attributeMap.set(newValue, new Set([key]));
      } else {
        const newKeysSet = attributeMap.get(newValue);
        if (newKeysSet) newKeysSet.add(key);
      }
    });
  }

  delete(key: Id): boolean {
    const row = this.rows.has(key);
    if (!row) return false;

    const rowAttributes = Object.keys(row);
    rowAttributes.forEach((attribute) => {
      const attributeMap = this.indexes.get(attribute);
      if (attributeMap) {
        const keysSet = attributeMap.get(row[attribute]);
        if (keysSet) keysSet.delete(key);
        if (keysSet && keysSet.size === 0) attributeMap.delete(row[attribute]);
      }
    });
    return this.rows.delete(key);
  }

  getAll(): Row[] {
    return Array.from(this.rows.values());
  }
}
