export interface Player {
  id: string
  name: string
  order: number
  status?: 'active' | 'removed'
}
