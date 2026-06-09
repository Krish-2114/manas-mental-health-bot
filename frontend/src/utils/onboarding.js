const keyFor = (username) => `manas_onboarding_${username}`;

export function needsOnboarding() {
  const username = localStorage.getItem("manas_username");
  if (!username) return false;
  return localStorage.getItem(keyFor(username)) === "true";
}

export function startOnboarding() {
  const username = localStorage.getItem("manas_username");
  if (username) localStorage.setItem(keyFor(username), "true");
}

export function completeOnboarding() {
  const username = localStorage.getItem("manas_username");
  if (username) localStorage.removeItem(keyFor(username));
}
