import { HttpClient, provideHttpClient } from '@angular/common/http';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';
import { getDatabase, provideDatabase, connectDatabaseEmulator } from '@angular/fire/database';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { routes, staticRoutes } from './app/app.routes';
import { TranslateConfigService } from './app/services/translation/translation.service';
import { environment } from './environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter([...routes, ...staticRoutes], withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators && environment.emulatorUrls?.auth) {
        try {
          // Connect to auth emulator (runs on http(s) origin)
          connectAuthEmulator(auth, environment.emulatorUrls.auth, { disableWarnings: true });
          // console.log('Auth connected to emulator at', environment.emulatorUrls.auth);
        } catch (e) {
          console.warn('Failed to connect Auth emulator:', e);
        }
      }
      return auth;
    }),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    // Only enable App Check in non-emulator (staging/prod) environments.
    // When using local Firebase emulators this prevents the app from calling
    // the App Check exchange endpoint (which can return 403) during development.
    ...(environment.useEmulators
      ? []
      : [
          provideAppCheck(() => {
            const provider = new ReCaptchaEnterpriseProvider(environment.reCaptchaId);
            return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
          }),
        ]),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        try {
          const host = environment.emulatorUrls?.firestore || 'http://127.0.0.1:9100';
          // connectFirestoreEmulator expects host (without http://) and port as numbers
          const url = new URL(host);
          const hostname = url.hostname;
          const port = Number(url.port) || environment.ports?.firestore || 9100;
          connectFirestoreEmulator(firestore, hostname, port);
          // console.log('Firestore connected to emulator at', hostname + ':' + port);
        } catch (e) {
          console.warn('Failed to connect Firestore emulator:', e);
        }
      }
      return firestore;
    }),
    provideDatabase(() => {
      const db = getDatabase();
      if (environment.useEmulators) {
        try {
          const dbPort = environment.ports?.database || 9000;
          connectDatabaseEmulator(db, '127.0.0.1', dbPort);
          // console.log('Realtime Database connected to emulator on port', dbPort);
        } catch (e) {
          console.warn('Failed to connect RTDB emulator:', e);
        }
      }
      return db;
    }),
    provideFunctions(() => {
      const functions = getFunctions(undefined, 'asia-south1');
      if (environment.useEmulators) {
        try {
          const host = environment.emulatorUrls?.functions || 'http://localhost:5001';
          const url = new URL(host);
          const hostname = url.hostname;
          const port = Number(url.port) || environment.ports?.functions || 5001;
          connectFunctionsEmulator(functions, hostname, port);
        } catch (e) {
          console.warn('Failed to connect Functions emulator:', e);
        }
      }
      return functions;
    }),
    provideMessaging(() => getMessaging()),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        try {
          const host =
            environment.emulatorUrls && (environment.emulatorUrls as any).storage
              ? (environment.emulatorUrls as any).storage
              : 'http://127.0.0.1:9199';
          const url = new URL(host);
          const hostname = url.hostname;
          const port = Number(url.port) || environment.ports?.storage || 9199;
          connectStorageEmulator(storage, hostname, port);
          // console.log('Storage connected to emulator at', hostname + ':' + port);
        } catch (e) {
          console.warn('Failed to connect Storage emulator:', e);
        }
      }
      return storage;
    }),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    TranslateConfigService,
  ],
});
