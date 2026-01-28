export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type Entity = {
  id: string
  created_at: string
}
