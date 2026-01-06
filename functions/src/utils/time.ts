export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isOverlap(reqStart: number, reqEnd: number, existStart: number, existEnd: number): boolean {
  return reqStart < existEnd && reqEnd > existStart;
}
