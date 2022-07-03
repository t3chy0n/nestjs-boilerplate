import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

export class HttpMockClient extends HttpService {
  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    throw new Error('MOCK THIS');
  }
}
