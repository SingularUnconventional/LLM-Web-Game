interface RequestOptions extends RequestInit {
  // You can add custom options here if needed
}

// Function to get the token from localStorage
const getToken = (): string | null => {
  const userString = localStorage.getItem('user');
  if (userString) {
    const user = JSON.parse(userString);
    return user.token || null;
  }
  return null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const API_BASE_URL = '/api';
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return Promise.resolve(null as T);
}

export const api = {
  get: <T>(endpoint: string): Promise<T> => request<T>(endpoint),
  post: <T>(endpoint: string, body: any): Promise<T> =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any): Promise<T> =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE' }),
};
