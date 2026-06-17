import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentData,
  QueryConstraint,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Helper: Recursively remove undefined values from an object
// Firestore does not accept `undefined` as a field value.
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Timestamp) && typeof value.toDate !== "function") {
      result[key] = stripUndefined(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// Generic add document
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const cleanData = stripUndefined(data);
  const docRef = await addDoc(collection(db, collectionName), {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Generic update document
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const cleanData = stripUndefined(data as Record<string, any>);
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  });
}

// Generic delete document
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Generic get single document
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  }
  return null;
}

// Generic get documents with query
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as T & { id: string }
  );
}

// Paginated query
export async function getDocumentsPaginated<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  pageSize: number = 20,
  lastDoc?: DocumentData
): Promise<{ data: (T & { id: string })[]; lastDoc: DocumentData | null }> {
  const allConstraints = [...constraints, limit(pageSize)];
  if (lastDoc) {
    allConstraints.push(startAfter(lastDoc));
  }

  const q = query(collection(db, collectionName), ...allConstraints);
  const snapshot = await getDocs(q);

  const data = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as T & { id: string }
  );

  const newLastDoc =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;

  return { data, lastDoc: newLastDoc };
}

// Batch operations
export async function batchUpdate(
  operations: {
    collectionName: string;
    docId: string;
    data: DocumentData;
  }[]
): Promise<void> {
  const batch = writeBatch(db);
  operations.forEach(({ collectionName, docId, data }) => {
    const docRef = doc(db, collectionName, docId);
    batch.update(docRef, { ...stripUndefined(data), updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

// Helper: Create Timestamp from Date
export function toTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Helper: Convert Timestamp to Date string
export function formatTimestamp(
  timestamp: Timestamp | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timestamp) return "-";
  const date = timestamp.toDate();
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

// Re-export commonly used Firestore functions
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
