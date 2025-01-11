import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  constructor() {}

  loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById(url);
      console.log(url);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.id = url;
      script.onload = () => resolve();
      script.onerror = (error) =>
        reject('Erreur de chargement du script : ' + error);

      document.body.appendChild(script);
    });
  }
}
