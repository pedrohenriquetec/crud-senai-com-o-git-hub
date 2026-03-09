
const API_BASE_URL = "http://localhost:3000";


function getToken() {
  return localStorage.getItem("token");
}


export function setToken(token) {
  if (!token) {
    localStorage.removeItem("token");
    return;
  }
  localStorage.setItem("token", token);
}






export async function apiRequest(
  path,
  { method = "GET", body, auth = true } = {}
) {
  const headers = {
    "Content-type": "application/json"
  };


  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));


  if (!response.ok) {
    const error = new Error(data.message || `Erro HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;

}
