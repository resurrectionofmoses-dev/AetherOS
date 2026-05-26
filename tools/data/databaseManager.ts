/**
 * Database Manager
 * Handles data persistence, queries, and schema management
 */

export interface DbSchema {
  name: string;
  fields: Field[];
  indexes?: Index[];
  constraints?: Constraint[];
}

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json';
  required?: boolean;
  default?: any;
}

export interface Index {
  name: string;
  fields: string[];
  unique?: boolean;
}

export interface Constraint {
  type: 'unique' | 'foreign' | 'check';
  fields: string[];
}

export interface Query {
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  offset?: number;
}

export class DatabaseManager {
  private collections: Map<string, any[]> = new Map();
  private schemas: Map<string, DbSchema> = new Map();
  private transactions: any[] = [];

  createCollection(schema: DbSchema): void {
    this.schemas.set(schema.name, schema);
    this.collections.set(schema.name, []);
  }

  insert(collectionName: string, document: any): string {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    const id = `doc-${Date.now()}-${Math.random()}`;
    const doc = { ...document, _id: id };

    this.validateDocument(collectionName, doc);
    collection.push(doc);

    return id;
  }

  find(collectionName: string, query?: Query): any[] {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    let results = [...collection];

    if (query?.filter) {
      results = results.filter(doc => this.matchesFilter(doc, query.filter!));
    }

    if (query?.sort) {
      results.sort((a, b) => {
        for (const [field, direction] of Object.entries(query.sort!)) {
          if (a[field] < b[field]) return direction === 1 ? -1 : 1;
          if (a[field] > b[field]) return direction === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    if (query?.offset) {
      results = results.slice(query.offset);
    }

    if (query?.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  findOne(collectionName: string, filter: Record<string, any>): any | null {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    return collection.find(doc => this.matchesFilter(doc, filter)) || null;
  }

  update(collectionName: string, filter: Record<string, any>, updates: Record<string, any>): number {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    let updated = 0;
    collection.forEach(doc => {
      if (this.matchesFilter(doc, filter)) {
        Object.assign(doc, updates);
        this.validateDocument(collectionName, doc);
        updated++;
      }
    });

    return updated;
  }

  delete(collectionName: string, filter: Record<string, any>): number {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    const initialLength = collection.length;
    const filtered = collection.filter(doc => !this.matchesFilter(doc, filter));
    
    this.collections.set(collectionName, filtered);
    return initialLength - filtered.length;
  }

  private matchesFilter(doc: any, filter: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'object' && value !== null) {
        // Handle operators like $gt, $lt, etc.
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$gt':
              if (!(doc[key] > opValue)) return false;
              break;
            case '$lt':
              if (!(doc[key] < opValue)) return false;
              break;
            case '$eq':
              if (doc[key] !== opValue) return false;
              break;
            case '$in':
              if (!(Array.isArray(opValue) && opValue.includes(doc[key]))) return false;
              break;
          }
        }
      } else {
        if (doc[key] !== value) return false;
      }
    }
    return true;
  }

  private validateDocument(collectionName: string, document: any): void {
    const schema = this.schemas.get(collectionName);
    if (!schema) return;

    schema.fields.forEach(field => {
      const value = document[field.name];
      if (field.required && value === undefined) {
        throw new Error(`Field ${field.name} is required`);
      }
      // Type validation could be added here
    });
  }

  createBackup(collectionName: string): string {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    const backup = JSON.stringify(collection);
    return backup;
  }

  restore(collectionName: string, backup: string): void {
    try {
      const data = JSON.parse(backup);
      this.collections.set(collectionName, data);
    } catch (error) {
      throw new Error('Invalid backup format');
    }
  }

  getStats(collectionName: string): any {
    const collection = this.collections.get(collectionName);
    if (!collection) throw new Error(`Collection ${collectionName} not found`);

    return {
      name: collectionName,
      documentCount: collection.length,
      schema: this.schemas.get(collectionName),
      averageDocumentSize: collection.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0) / collection.length
    };
  }
}

export const databaseManager = new DatabaseManager();
