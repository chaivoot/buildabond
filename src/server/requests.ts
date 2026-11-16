import type { RequestKind, RequestStatus, ShopRequest } from '../lib/types';
import { sql, toJson } from './db';

interface Row { id: string; kind: string; created_at: string | Date; status: string; name: string; contact: string; data: Record<string, string> }

const fromRow = (r: Row): ShopRequest => ({
  id: r.id, kind: r.kind as RequestKind, createdAt: new Date(r.created_at).toISOString(), status: r.status as RequestStatus,
  name: r.name, contact: r.contact, data: r.data ?? {},
});

export async function listRequests(): Promise<ShopRequest[]> {
  return (await sql<Row>(`SELECT * FROM requests ORDER BY created_at DESC`)).map(fromRow);
}

export async function createRequest(kind: RequestKind, name: string, contact: string, data: Record<string, string>): Promise<void> {
  await sql(`INSERT INTO requests (id, kind, name, contact, data) VALUES ($1,$2,$3,$4,$5)`, [crypto.randomUUID(), kind, name, contact, toJson(data)]);
}

export async function setRequestStatus(id: string, status: RequestStatus): Promise<void> {
  await sql(`UPDATE requests SET status = $2 WHERE id = $1`, [id, status]);
}
