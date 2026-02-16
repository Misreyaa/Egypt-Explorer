const API_BASE = (import.meta as any).env.VITE_API_BASE ?? 'http://127.0.0.1:8080';

export interface PlaceSummary {
  place_id: string;
  name?: string | null;
  category?: string | null;
  city?: string | null;
}

export interface QueryRequest {
  query: string;
  wheelchair_only?: boolean;
  city?: string | null;
  category?: string | null;
  limit?: number;
}

export interface QueryResponse {
  response: string;
  sources: { place_id?: string; field_type?: string }[];
  confidence?: number | null;
  matched_filters?: {
    city?: string | null;
    category?: string | null;
    wheelchair_only?: boolean;
  } | null;
  places?: PlaceSummary[] | null;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function login(
  username = 'admin',
  password = 'password',
): Promise<string> {
  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
  };

  return data.access_token;
}

export async function askRag(
  body: QueryRequest,
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized - please log in again.');
    }
    throw new Error(`Query failed with status ${res.status}`);
  }

  return (await res.json()) as QueryResponse;
}

