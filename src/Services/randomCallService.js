import Config from "../config";

export async function joinRandomQueue(username) {
  try {
    const res = await fetch(Config.RANDOM_CALL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      console.error("Random call API returned non-200", res.status);
      return { status: "ERROR", message: "Server error" };
    }

    const data = await res.json();

    // safety: ensure validity
    if (!data.status) {
      return { status: "ERROR", message: "Invalid backend response" };
    }

    return data;

  } catch (err) {
    console.error("Random call API failed:", err);
    return { status: "ERROR", message: "Network error" };
  }
}
