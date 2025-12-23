import { Injectable, inject } from '@angular/core';
import { getDatabase, ref, get, push, set, connectDatabaseEmulator } from '@angular/fire/database';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private functions = inject(Functions);
  private db = getDatabase();

  constructor() {
    if (environment.useEmulators) {
      const dbPort = 9000;
      // console.log('Using Firebase Realtime Database Emulator on port:', dbPort);
      connectDatabaseEmulator(this.db, 'localhost', dbPort);
    } else {
      console.log('Using Firebase Realtime Database Cloud');
    }
  }

  async verifyConnection() {
    const verifyConnection = httpsCallable(this.functions, 'helloWorld');
    const result = await verifyConnection({}).then((result) => {
      return result;
    });
    return result.data;
  }

  async getDataFromRealtimeDB(path: string) {
    const dbRef = ref(this.db, path);
    // console.log('dbRef:', dbRef);

    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('No data available');
    }
  }

  async createQuestion(question: any): Promise<string> {
    try {
      const questionsRef = ref(this.db, 'questions');
      const newQuestionRef = push(questionsRef);
      await set(newQuestionRef, {
        ...question,
        id: newQuestionRef.key,
        createdAt: Date.now(),
      });
      return newQuestionRef.key || '';
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }
}
