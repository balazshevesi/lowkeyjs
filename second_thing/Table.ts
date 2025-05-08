import {
  object,
  InferInput,
  GenericSchema,
  ObjectSchema,
  parse,
  ValiError,
} from "valibot";

export class Table<Shape extends Record<string, GenericSchema>> {
  private schema: ObjectSchema<Shape, undefined>;
  private readonly rows = new Map<
    InferInput<typeof this.schema>["id"],
    InferInput<typeof this.schema>
  >();

  constructor(private name: string, private shape: Shape) {
    this.schema = object(this.shape);
  }

  /** List of field names from the schema */
  get fields() {
    const fields = Object.keys(this.schema.entries) as InferInput<
      typeof this.schema
    >[];
    const object = {};
    fields.forEach((field) => (object[String(field)] = field));
    return object as Record<
      keyof InferInput<typeof this.schema>,
      keyof InferInput<typeof this.schema>
    >;
  }

  insert(input: InferInput<typeof this.schema>): void {
    const row = parse(this.schema, input);
    const key = row.id;
    if (this.rows.has(key)) {
      throw new Error(`Key '${String(key)}' already exists`);
    }
    this.rows.set(key, row);
  }

  safeInsert(input: InferInput<typeof this.schema>) {
    try {
      this.insert(input);
      const row = this.get(input.id) ?? null;
      return { data: row, error: null };
    } catch (err: unknown) {
      return { data: null, error: err };
    }
  }

  /** Get a row by primary key */
  get(
    key: InferInput<typeof this.schema>["id"]
  ): InferInput<typeof this.schema> | null {
    return this.rows.get(key) ?? null;
  }

  /** Find rows where a field equals a value */
  findByAttribute(
    attr: keyof InferInput<typeof this.schema>,
    value: any
  ): InferInput<typeof this.schema>[] {
    const res: InferInput<typeof this.schema>[] = [];
    for (const row of this.rows.values()) {
      if ((row as any)[attr] === value) res.push(row);
    }
    return res;
  }

  /** Update an existing row (must have same id) */
  update(input: unknown): void {
    const row = parse(this.schema, input);
    const key = row.id;
    if (!this.rows.has(key)) {
      throw new Error(`Key '${String(key)}' not found`);
    }
    this.rows.set(key, row);
  }

  /** Delete a row by primary key */
  delete(key: InferInput<typeof this.schema>["id"]): boolean {
    return this.rows.delete(key);
  }

  /** Return all rows */
  getAll(): InferInput<typeof this.schema>[] {
    return Array.from(this.rows.values());
  }
}
