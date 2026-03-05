import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

export interface ApiRequestOptions {
  params?: HttpParams | Record<string, string | number | boolean | null | undefined>;
  headers?: HttpHeaders | Record<string, string>;
  auth?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), this.buildOptions(options));
  }

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body ?? {}, this.buildOptions(options));
  }

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(path), body ?? {}, this.buildOptions(options));
  }

  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), this.buildOptions(options));
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const base = environment.apiBaseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private buildOptions(options?: ApiRequestOptions): {
    params?: HttpParams;
    headers?: HttpHeaders;
  } {
    let headers = this.toHttpHeaders(options?.headers);
    const token = this.session.playerToken();
    const shouldAttachToken = options?.auth !== false;

    if (shouldAttachToken && token) {
      headers = (headers ?? new HttpHeaders()).set('X-Player-Token', token);
    }

    return {
      params: this.toHttpParams(options?.params),
      headers
    };
  }

  private toHttpParams(
    source?: HttpParams | Record<string, string | number | boolean | null | undefined>
  ): HttpParams | undefined {
    if (!source) {
      return undefined;
    }

    if (source instanceof HttpParams) {
      return source;
    }

    let params = new HttpParams();
    for (const [key, value] of Object.entries(source)) {
      if (value === null || value === undefined) {
        continue;
      }
      params = params.set(key, String(value));
    }

    return params;
  }

  private toHttpHeaders(source?: HttpHeaders | Record<string, string>): HttpHeaders | undefined {
    if (!source) {
      return undefined;
    }

    if (source instanceof HttpHeaders) {
      return source;
    }

    let headers = new HttpHeaders();
    for (const [key, value] of Object.entries(source)) {
      headers = headers.set(key, value);
    }

    return headers;
  }
}
