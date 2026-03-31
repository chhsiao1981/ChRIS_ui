export default (bytes: number) => {
  if (bytes === 0) return "  0.00 B ";
  const k = 1024;
  const dm = 2; // Decimal places
  const sizes = [" B ", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNumber = (bytes / k ** i).toFixed(dm).padStart(6, " ");
  return `${formattedNumber} ${sizes[i]}`;
};
