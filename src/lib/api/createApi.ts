// src/lib/api/create-api.ts

import { api } from "./axios";

export function createApi(prefix: string) {
  return {
    get: (url: string, config = {}) =>
      api.get(`${prefix}${url}`, config),

    post: (url: string, data?: unknown, config = {}) =>
      api.post(`${prefix}${url}`, data, config),

    put: (url: string, data?: unknown, config = {}) =>
      api.put(`${prefix}${url}`, data, config),

    patch: (url: string, data?: unknown, config = {}) =>
      api.patch(`${prefix}${url}`, data, config),

    delete: (url: string, config = {}) =>
      api.delete(`${prefix}${url}`, config),
  };
}