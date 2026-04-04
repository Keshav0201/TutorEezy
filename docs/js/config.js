export const BASE_URL = window.location.hostname === "127.0.0.1"
    ? "http://localhost:3016/api"
    : "https://todo-1-zju0.onrender.com";;

export async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error("Request failed");
    }

    return res;
  } catch (err) {
    if (retries === 0) throw err;

    console.log(`Retrying... (${retries} left)`);

    await new Promise(resolve => setTimeout(resolve, delay));

    return fetchWithRetry(url, options, retries - 1, delay);
  }
}