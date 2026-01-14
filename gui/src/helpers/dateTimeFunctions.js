const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
  timeZone: timeZone,
};

export function reformatDate(date) {
  return new Intl.DateTimeFormat(navigator.language, options).format(
    new Date(date),
  );
}
