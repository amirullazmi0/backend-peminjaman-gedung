export function formatIndonesianDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (hours === 0 && minutes === '00') {
    hours = 24;
  }
  const hourStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} ${hourStr}.${minutes}`;
}