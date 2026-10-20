import { createApiApp } from '../server';

let cachedApp: any = null;

export default function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = createApiApp();
  }
  return cachedApp(req, res);
}
