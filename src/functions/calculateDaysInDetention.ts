export function calculateDaysInDetention(
  dateArrested: string | null
): string | number {
  if (!dateArrested) {
    return 0;
  }

  const arrestDate = new Date(dateArrested);
  const currentDate = new Date();

  const diffTime = currentDate.getTime() - arrestDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays?.toString();
}
