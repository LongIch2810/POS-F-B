export function notifySessionChange(event: 'login' | 'logout' | 'revoked'): void {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel('pos-session');
  channel.postMessage(event);
  channel.close();
}
