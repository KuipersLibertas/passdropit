import axios from 'axios';

type CreateRequestParams = {
  endpoint: string,
  method: string,
  headers?: { [k: string]: string },
  body?: { [k: string]: any },
}

// Client-side helper that calls our own Next.js gateway API.
// All actual Supabase logic lives in src/lib/db/ — this is just the HTTP bridge.
export const createRequest = async ({ endpoint, method, headers, body }: CreateRequestParams) => {
  // Map old Laravel endpoint paths to our new gateway paths
  // e.g. "/auth/login" → not used (handled by NextAuth directly)
  // e.g. "/link/save-link" → POST /api/gateway/save-link
  const path = endpoint.replace(/^\/(auth|link|user|admin)\//, '/');
  const url = `/api/gateway${path}`;

  return axios({
    url,
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    data: body,
    responseType: 'json',
  })
    .then(response => response.data)
    .catch(error => {
      if (error?.code === 'ERR_NETWORK') {
        throw new Error('The network connection is failed');
      } else if (error?.code === 'ECONNREFUSED') {
        throw new Error('The server is down');
      } else if (error?.response?.data) {
        if (error?.response.data.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error('An error occurred');
        }
      }
      throw new Error('An error occurred');
    });
};
