import Config from "../config";

export async function joinRandomQueue(username) {
  const res = await fetch(Config.RANDOM_CALL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  return res.json();
}
