import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

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

  // Save draft: store serializable form state in localStorage + file blobs in IndexedDB
  async saveDraft(form: FormGroup): Promise<void> {
    const snapshot = form.getRawValue();

    const filesMeta: Record<string, FileMeta> = {};

    let counter = Date.now();

    async function walk(node: any, parentKey = ''): Promise<any> {
      if (node === null || node === undefined) return node;
      if (node instanceof File) {
        const id = `f-${counter++}`;
        filesMeta[id] = { id, name: node.name, type: node.type, size: node.size };
        await draft.putFile(id, node);
        try {
          filesMeta[id].preview = await draft.fileToDataUrl(node);
        } catch (e) {
          // ignore preview failure
        }
        return { __fileRef: id };
      }
      if (Array.isArray(node)) {
        const arr = [];
        for (const v of node) arr.push(await walk(v, parentKey));
        return arr;
      }
      if (typeof node === 'object') {
        const out: any = {};
        for (const k of Object.keys(node)) out[k] = await walk(node[k], `${parentKey}.${k}`);
        return out;
      }
      return node;
    }

    const draft = this;
    const processed = await walk(snapshot);

    const meta = { processed, filesMeta };
    localStorage.setItem(this.metaKey, JSON.stringify(meta));
  }

  // Load draft and patch form (handles known file places: hostProfile.profilePhoto, libraryImages.libraryPhotos[*].file, requirements.selectedRequirements[*].sampleFile)
  async loadDraft(form: FormGroup): Promise<boolean> {
    const raw = localStorage.getItem(this.metaKey);
    if (!raw) return false;
    const meta = JSON.parse(raw);
    const { processed, filesMeta } = meta as any;

    // Patch non-file values first
    const clone = JSON.parse(JSON.stringify(processed));
    // Remove file refs from clone so patchValue won't choke
    function stripFiles(node: any): any {
      if (node === null || node === undefined) return node;
      if (Array.isArray(node)) return node.map(stripFiles);
      if (typeof node === 'object') {
        if (node.__fileRef) return null;
        const out: any = {};
        for (const k of Object.keys(node)) out[k] = stripFiles(node[k]);
        return out;
      }
      return node;
    }
    const stripped = stripFiles(clone);
    try {
      form.patchValue(stripped);
    } catch (e) {
      // ignore patch errors
    }

    // Now reconstruct file fields in known form locations
    // hostProfile.profilePhoto
    try {
      const hp = processed?.hostProfile;
      if (hp && hp.profilePhoto && hp.profilePhoto.__fileRef) {
        const ref = hp.profilePhoto.__fileRef;
        const blob = await this.getFile(ref);
        if (blob) {
          const metaF = filesMeta[ref];
          const file = new File([blob], metaF.name, { type: metaF.type });
          form.get('hostProfile')?.patchValue({ profilePhoto: file });
        }
      }
    } catch (e) {
      // ignore
    }

    // libraryImages.libraryPhotos (array of { fileRef or preview })
    try {
      const photos = processed?.libraryImages?.libraryPhotos ?? [];
      const arr = form.get(['libraryImages', 'libraryPhotos']) as FormArray;
      if (arr && Array.isArray(photos)) {
        // ensure form array length matches
        while (arr.length > photos.length) arr.removeAt(arr.length - 1);
        // if shorter, we won't create new groups automatically here; assume components push groups on UI when adding
        for (let i = 0; i < photos.length && i < arr.length; i++) {
          const p = photos[i];
          if (p && p.__fileRef) {
            const blob = await this.getFile(p.__fileRef);
            if (blob) {
              const metaF = filesMeta[p.__fileRef];
              const file = new File([blob], metaF.name, { type: metaF.type });
              try {
                arr.at(i).patchValue({ file, previewUrl: metaF.preview ?? '' });
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // requirements.selectedRequirements[*].sampleFile
    try {
      const reqs = processed?.requirements?.selectedRequirements ?? [];
      const arr = form.get(['requirements', 'selectedRequirements']) as FormArray;
      if (arr && Array.isArray(reqs)) {
        while (arr.length > reqs.length) arr.removeAt(arr.length - 1);
        for (let i = 0; i < reqs.length && i < arr.length; i++) {
          const r = reqs[i];
          if (r && r.sampleFile && r.sampleFile.__fileRef) {
            const blob = await this.getFile(r.sampleFile.__fileRef);
            if (blob) {
              const metaF = filesMeta[r.sampleFile.__fileRef];
              const file = new File([blob], metaF.name, { type: metaF.type });
              try {
                arr.at(i).patchValue({ sampleFile: file });
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return true;
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
