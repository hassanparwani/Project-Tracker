import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

const BOOTSTRAP_ADMIN_EMAIL = 'hassanparwani12@gmail.com';
const VALID_WORKSTREAMS = ['PMO', 'Payer Contracts', 'Recruitment', 'MSSP & C-SNP', 'Legal'] as const;
const VALID_STATUSES = ['Not started', 'In progress', 'Needs attention', 'Blocked', 'Done'] as const;
const FIELDS = ['ws', 't', 'a', 'r', 'c', 's', 'd', 'dl', 'st', 'n'] as const;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export interface RoadmapItem {
  id: string;
  ws: string;
  t: string;
  a: string;
  r: string;
  c: string;
  s: string;
  d: string;
  dl: string;
  st: string;
  n: string;
}

export interface AuditLogItem {
  at: string;
  who: string;
  role?: string;
  id?: string;
  itemId?: string;
  t: string;
  act: string;
  changes?: string[];
  ch?: [string, string, string][];
}

export interface SessionUser {
  uid: string;
  who: string;
  role: 'admin' | 'team';
}

function clamp(val: unknown, maxLen: number): string {
  return String(val ?? '').slice(0, maxLen);
}

function sanitizeItemInput(raw: Partial<RoadmapItem>) {
  const ws = VALID_WORKSTREAMS.includes(raw.ws as (typeof VALID_WORKSTREAMS)[number])
    ? (raw.ws as string)
    : VALID_WORKSTREAMS[0];
  const st = VALID_STATUSES.includes(raw.st as (typeof VALID_STATUSES)[number])
    ? (raw.st as string)
    : VALID_STATUSES[0];

  return {
    ws,
    t: clamp(raw.t, 600).trim(),
    a: clamp(raw.a, 600),
    r: clamp(raw.r, 600),
    c: clamp(raw.c, 600),
    s: clamp(raw.s, 32),
    d: clamp(raw.d, 32),
    dl: clamp(raw.dl, 100),
    st,
    n: clamp(raw.n, 1000),
  };
}

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}

let pendingPreferredName = '';
let authSyncChain: Promise<SessionUser | null> = Promise.resolve(null);

let seedPromise: Promise<void> | null = null;

export async function seedFirestoreIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const itemsPath = 'roadmap_items';
    let isEmpty = false;
    try {
      const checkSnap = await getDocs(
        query(collection(db, itemsPath), where('visibility', '==', 'workspace'), limit(1))
      );
      isEmpty = checkSnap.empty;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, itemsPath);
    }

    if (!isEmpty) return;

    let res = await fetch('/seed.json');
    if (!res.ok) res = await fetch('/api/seed');
    if (!res.ok) return;
    const data = (await res.json()) as { items?: RoadmapItem[] };
    const seedItems = data.items || [];
    if (!seedItems.length) return;

    const actorUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
    try {
      const batch = writeBatch(db);
      for (const rawItem of seedItems) {
        const clean = sanitizeItemInput(rawItem);
        const id = clamp(rawItem.id, 128).replace(/[^a-zA-Z0-9_-]/g, '');
        if (!id || !clean.t) continue;
        batch.set(doc(db, itemsPath, id), {
          id,
          ...clean,
          visibility: 'workspace',
          createdBy: actorUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const logId = makeId('L');
      batch.set(doc(db, 'audit_logs', logId), {
        at: new Date().toISOString(),
        who: 'System',
        uid: actorUid,
        role: 'system',
        itemId: '',
        t: '',
        act: 'Seeded',
        changes: ['Initialized from 23-Nov meeting, Puja plan v2, payer slide'],
        visibility: 'workspace',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, itemsPath);
    }
  })().finally(() => {
    seedPromise = null;
  });

  return seedPromise;
}

async function syncUserProfile(user: User, preferredName?: string): Promise<SessionUser> {
  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const cleanPreferred = preferredName ? preferredName.trim().slice(0, 80) : '';
  const fallbackName = (user.displayName || user.email?.split('@')[0] || 'Team Member').slice(0, 80);

  let role: 'admin' | 'team' =
    user.email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified ? 'admin' : 'team';
  let displayName = cleanPreferred || fallbackName;

  let existingSnap;
  try {
    existingSnap = await getDoc(doc(db, 'users', user.uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    role = data.role === 'admin' ? 'admin' : role;
    displayName = cleanPreferred || clamp(data.displayName, 80) || fallbackName;
    if (cleanPreferred && cleanPreferred !== data.displayName) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    }
  } else {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  }

  if (user.email) {
    try {
      await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
        uid: user.uid,
        email: clamp(user.email, 200),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, privatePath);
    }
  }

  return { uid: user.uid, who: displayName, role };
}

function runSerializedAuthSync(user: User, preferredName?: string): Promise<SessionUser> {
  if (preferredName && preferredName.trim()) {
    pendingPreferredName = preferredName.trim().slice(0, 80);
  }
  const task = authSyncChain.then(
    async () => {
      const nameToUse = pendingPreferredName;
      pendingPreferredName = '';
      const sessionUser = await syncUserProfile(user, nameToUse);
      await seedFirestoreIfEmpty();
      return sessionUser;
    },
    async () => {
      const nameToUse = pendingPreferredName;
      pendingPreferredName = '';
      const sessionUser = await syncUserProfile(user, nameToUse);
      await seedFirestoreIfEmpty();
      return sessionUser;
    }
  );
  authSyncChain = task.catch(() => null);
  return task;
}

export async function signInWithGoogle(preferredName?: string): Promise<SessionUser> {
  if (preferredName && preferredName.trim()) {
    pendingPreferredName = preferredName.trim().slice(0, 80);
  }
  const result = await signInWithPopup(auth, googleAuthProvider);
  return runSerializedAuthSync(result.user, preferredName);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(callback: (user: SessionUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const sessionUser = await runSerializedAuthSync(fbUser);
      callback(sessionUser);
    } catch (error) {
      console.error('Auth sync error:', error);
      callback(null);
    }
  });
}

export function subscribeWorkspace(
  onData: (state: { items: RoadmapItem[]; log: AuditLogItem[]; emptyInDb: boolean }) => void,
  onError: (err: Error) => void
): () => void {
  let latestItems: RoadmapItem[] = [];
  let latestLogs: AuditLogItem[] = [];
  let itemsLoaded = false;
  let logsLoaded = false;

  const emit = () => {
    if (!itemsLoaded && !logsLoaded) return;
    onData({
      items: latestItems,
      log: latestLogs,
      emptyInDb: itemsLoaded && latestItems.length === 0,
    });
  };

  const itemsQuery = query(
    collection(db, 'roadmap_items'),
    where('visibility', '==', 'workspace')
  );
  const logsQuery = query(
    collection(db, 'audit_logs'),
    where('visibility', '==', 'workspace')
  );

  const unsubItems = onSnapshot(
    itemsQuery,
    (snap) => {
      latestItems = snap.docs.map((d) => {
        const v = d.data();
        return {
          id: String(v.id || d.id),
          ws: String(v.ws || ''),
          t: String(v.t || ''),
          a: String(v.a || ''),
          r: String(v.r || ''),
          c: String(v.c || ''),
          s: String(v.s || ''),
          d: String(v.d || ''),
          dl: String(v.dl || ''),
          st: String(v.st || 'Not started'),
          n: String(v.n || ''),
        };
      });
      itemsLoaded = true;
      emit();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'roadmap_items');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );

  const unsubLogs = onSnapshot(
    logsQuery,
    (snap) => {
      latestLogs = snap.docs
        .map((d) => {
          const v = d.data();
          return {
            at: String(v.at || ''),
            who: String(v.who || ''),
            role: String(v.role || ''),
            itemId: String(v.itemId || ''),
            t: String(v.t || ''),
            act: String(v.act || ''),
            changes: Array.isArray(v.changes) ? v.changes.map(String) : [],
          };
        })
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 1500);
      logsLoaded = true;
      emit();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'audit_logs');
      } catch (wrapped) {
        onError(wrapped as Error);
      }
    }
  );

  return () => {
    unsubItems();
    unsubLogs();
  };
}

export async function saveRoadmapItem(
  rawItem: Partial<RoadmapItem>,
  existingItem: RoadmapItem | undefined,
  user: SessionUser | null,
  guestName?: string
): Promise<void> {
  const clean = sanitizeItemInput(rawItem);
  if (!clean.t) {
    throw new Error('Title is required');
  }

  const at = new Date().toISOString();
  const actorUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
  const actorRole = user ? user.role : 'guest';
  const who = clamp((user?.who || guestName || 'Guest').trim() || 'Guest', 80);

  if (!existingItem) {
    const id = makeId('N');
    const itemPath = `roadmap_items/${id}`;
    try {
      await setDoc(doc(db, 'roadmap_items', id), {
        id,
        ...clean,
        visibility: 'workspace',
        createdBy: actorUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, itemPath);
    }

    const logId = makeId('L');
    try {
      await setDoc(doc(db, 'audit_logs', logId), {
        at,
        who,
        uid: actorUid,
        role: actorRole,
        itemId: id,
        t: clean.t,
        act: 'Created',
        changes: [],
        visibility: 'workspace',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `audit_logs/${logId}`);
    }
    return;
  }

  const itemPath = `roadmap_items/${existingItem.id}`;
  const changes: string[] = [];
  for (const f of FIELDS) {
    const nextVal = clean[f];
    const prevVal = existingItem[f] || '';
    if (nextVal !== prevVal) {
      changes.push(`${f}: "${prevVal}" → "${nextVal}"`.slice(0, 300));
    }
  }

  if (changes.length === 0) return;

  try {
    await updateDoc(doc(db, 'roadmap_items', existingItem.id), {
      ws: clean.ws,
      t: clean.t,
      a: clean.a,
      r: clean.r,
      c: clean.c,
      s: clean.s,
      d: clean.d,
      dl: clean.dl,
      st: clean.st,
      n: clean.n,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, itemPath);
  }

  const logId = makeId('L');
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      at,
      who,
      uid: actorUid,
      role: actorRole,
      itemId: existingItem.id,
      t: clean.t,
      act: 'Edited',
      changes: changes.slice(0, 10),
      visibility: 'workspace',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audit_logs/${logId}`);
  }
}

export async function deleteRoadmapItem(
  existingItem: RoadmapItem,
  user: SessionUser | null,
  guestName?: string
): Promise<void> {
  const itemPath = `roadmap_items/${existingItem.id}`;
  const actorUid = auth.currentUser ? auth.currentUser.uid : 'anonymous';
  const actorRole = user ? user.role : 'guest';
  const who = clamp((user?.who || guestName || 'Guest').trim() || 'Guest', 80);

  try {
    await deleteDoc(doc(db, 'roadmap_items', existingItem.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, itemPath);
  }

  const logId = makeId('L');
  try {
    await setDoc(doc(db, 'audit_logs', logId), {
      at: new Date().toISOString(),
      who,
      uid: actorUid,
      role: actorRole,
      itemId: existingItem.id,
      t: clamp(existingItem.t, 600),
      act: 'Deleted',
      changes: [],
      visibility: 'workspace',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `audit_logs/${logId}`);
  }
}

export async function fetchSeedFallback(): Promise<{ items: RoadmapItem[]; log: AuditLogItem[] }> {
  let res = await fetch('/seed.json');
  if (!res.ok) res = await fetch('/api/seed');
  if (!res.ok) throw new Error('Could not load initial roadmap items');
  return res.json();
}
