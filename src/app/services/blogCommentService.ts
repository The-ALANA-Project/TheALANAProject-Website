import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-44fc6238`;

const headers = () => ({
  Authorization: `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

export interface BlogComment {
  id: string;
  articleSlug: string;
  walletAddress: string;
  displayName: string;
  role: 'apprentice' | 'specialist' | 'guardian';
  content: string;
  createdAt: string;
}

export async function getComments(slug: string): Promise<BlogComment[]> {
  const res = await fetch(`${BASE}/blog-comments/${encodeURIComponent(slug)}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
  return res.json();
}

export async function postComment(
  comment: Omit<BlogComment, 'createdAt'>
): Promise<BlogComment> {
  const res = await fetch(`${BASE}/blog-comments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error(`Failed to post comment: ${res.status}`);
  return res.json();
}

export async function deleteComment(slug: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/blog-comments/${encodeURIComponent(slug)}/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Failed to delete comment: ${res.status}`);
}
