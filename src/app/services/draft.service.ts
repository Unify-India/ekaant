import { Injectable } from '@angular/core';

type FileMeta = { id: string; name: string; type: string; size: number; preview?: string };

@Injectable({ providedIn: 'root' })
export class DraftService {
  private dbName = 'ekaant.drafts.db';
  private filesStore = 'files';
  private metaKey = 'ekaant.libraryRegistrationDraft';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.filesStore)) db.createObjectStore(this.filesStore, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async putFile(id: string, blob: Blob): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.filesStore, 'readwrite');
      const store = tx.objectStore(this.filesStore);
      const r = store.put({ id, blob });
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  }

  private async getFile(id: string): Promise<Blob | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.filesStore, 'readonly');
      const store = tx.objectStore(this.filesStore);
      const r = store.get(id);
      r.onsuccess = () => resolve(r.result?.blob ?? null);
      r.onerror = () => reject(r.error);
    });
  }

  private async clearFiles(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.filesStore, 'readwrite');
      tx.objectStore(this.filesStore).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async saveDraft(formRawValue: any): Promise<void> {
    const snapshot = formRawValue;
    const filesMeta: Record<string, FileMeta> = {};
    let counter = Date.now();

    const draft = this;

    async function walk(node: any, parentKey = ''): Promise<any> {
      if (node === null || node === undefined) return node;
      if (node instanceof File) {
        const id = `f-${counter++}`;
        filesMeta[id] = { id, name: node.name, type: node.type, size: node.size };
        await draft.putFile(id, node);
        try {
          filesMeta[id].preview = await draft.fileToDataUrl(node);
        } catch (e) {
          // ignore
        }
        return { __fileRef: id };
      }
      if (Array.isArray(node)) {
        return Promise.all(node.map((v) => walk(v, parentKey)));
      }
      if (typeof node === 'object') {
        const out: any = {};
        for (const k of Object.keys(node)) {
          out[k] = await walk(node[k], `${parentKey}.${k}`);
        }
        return out;
      }
      return node;
    }

    try {
      const processed = await walk(snapshot);
      const meta = { processed, filesMeta };
      localStorage.setItem(this.metaKey, JSON.stringify(meta));
    } catch (error) {
      // ignore
    }
  }

  async getDraft(): Promise<any | null> {
    const raw = localStorage.getItem(this.metaKey);
    if (!raw) return null;

    let meta: any;
    try {
      meta = JSON.parse(raw);
    } catch (e) {
      return null;
    }

    const { processed, filesMeta } = meta;
    if (!processed) return null;

    const draft = this;

    async function hydrate(node: any): Promise<any> {
      if (node === null || node === undefined) return node;

      if (typeof node === 'object' && node.__fileRef) {
        const ref = node.__fileRef;
        const blob = await draft.getFile(ref);
        if (blob && filesMeta[ref]) {
          const metaF = filesMeta[ref];
          return new File([blob], metaF.name, { type: metaF.type });
        }
        return null;
      }

      if (Array.isArray(node)) {
        return Promise.all(node.map((v) => hydrate(v)));
      }

      if (typeof node === 'object') {
        const out: any = {};
        for (const k of Object.keys(node)) {
          out[k] = await hydrate(node[k]);
        }
        return out;
      }
      return node;
    }

    try {
      return await hydrate(processed);
    } catch (error) {
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    try {
      localStorage.removeItem(this.metaKey);
      await this.clearFiles();
    } catch (e) {
      // ignore
    }
  }
}