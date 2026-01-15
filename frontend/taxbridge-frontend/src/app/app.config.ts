import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { browserHttpInterceptor } from './interceptors/browser-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideNoopAnimations(), 
    provideHttpClient(
      withFetch(),
      withInterceptors([browserHttpInterceptor])
    )
  ]
};

