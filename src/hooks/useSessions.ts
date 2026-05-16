import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useSessions() {
  return useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().toArray(),
    [],
    []
  );
}

export function useActiveSession() {
  return useLiveQuery(
    () => db.sessions.filter((s) => s.endedAt === null).first(),
    []
  );
}

export function useLastCompletedSession() {
  return useLiveQuery(async () => {
    const list = await db.sessions
      .where('endedAt')
      .above(0)
      .reverse()
      .sortBy('endedAt');
    return list[0];
  }, []);
}
