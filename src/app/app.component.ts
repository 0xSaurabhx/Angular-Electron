import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <div style="padding: 24px;">
    <h1>Electron + Angular Boilerplate</h1>
    <p>This small demo shows Angular running inside Electron.</p>
    <button (click)="onPing()">Ping from Angular to Electron</button>
    <button style="margin-left: 8px;" (click)="onApiPing()">Call local API via HTTP</button>
    <div *ngIf="message">Response from Electron: {{ message }}</div>
    <div *ngIf="apiMessage">HTTP API response: {{ apiMessage }}</div>
  </div>
  `,
})
export class AppComponent {
  message?: string;
  apiMessage?: string;

  async onPing() {
    // We can use the Electron IPC if preload exposes it
    // Keep it safe if not available
    try {
      const result = await (window as any).electronAPI?.ping?.();
      this.message = result;
    } catch (e) {
      this.message = 'IPC not available (dev server)';
    }
  }

  async onApiPing() {
    try {
      const apiUrl = await (window as any).electronAPI?.getApiUrl?.();
      if (!apiUrl) {
        this.apiMessage = 'API URL not found';
        return;
      }
      const res = await fetch(`${apiUrl}/ping`);
      const json = await res.json();
      this.apiMessage = json?.message ?? JSON.stringify(json);
    } catch (e) {
      this.apiMessage = 'Failed to call HTTP API: ' + (e as any)?.message;
    }
  }
}
