export function epochDateToString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('.')[0].replace('T', ' ');
}

export function stringToEpoch(dateString: string): number {
  return +new Date(dateString);
}
