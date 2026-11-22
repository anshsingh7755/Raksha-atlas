function istParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function startScheduler({ runHourly, runDaily, onError = console.error }) {
  let lastHourlyKey = null;
  let lastDailyKey = null;
  let hourlyBusy = false;
  let dailyBusy = false;
  const tick = async () => {
    const { year, month, day, hour, minute } = istParts(new Date());
    const dateKey = `${year}-${month}-${day}`;
    if (minute !== "00") return;
    const hourKey = `${dateKey}T${hour}`;
    if (!hourlyBusy && hourKey !== lastHourlyKey) {
      lastHourlyKey = hourKey;
      hourlyBusy = true;
      void Promise.resolve(runHourly())
        .catch(onError)
        .finally(() => {
          hourlyBusy = false;
        });
    }
    if (hour === "04" && !dailyBusy && lastDailyKey !== dateKey) {
      lastDailyKey = dateKey;
      dailyBusy = true;
      void Promise.resolve(runDaily())
        .catch(onError)
        .finally(() => {
          dailyBusy = false;
        });
    }
  };
  const timer = setInterval(() => {
    void tick().catch(onError);
  }, 15_000);
  timer.unref?.();
  return () => clearInterval(timer);
}
