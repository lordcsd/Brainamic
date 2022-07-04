export function getTwelveDataInterval(resolution: string) {
  return {
    '1': '1min',
    '5': '5min',
    '15': '15min',
    '30': '30min',
    '60': '1h',
    '240': '4h',
    D: '1day',
    W: '1week',
    M: '1month',
  }[resolution];
}
