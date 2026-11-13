/** Toca um sino curto usando Web Audio (sem arquivo de áudio). */
export const playChime = () => {
  try {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + 1.4);
    });
    setTimeout(() => ctx.close(), 1600);
  } catch {
    /* áudio indisponível */
  }
};

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window;

export const requestNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const sendNotification = (body: string) => {
  if (notificationsSupported() && Notification.permission === "granted") {
    try {
      new Notification("Nocturne", { body });
    } catch {
      /* alguns navegadores móveis só permitem via service worker */
    }
  }
};
