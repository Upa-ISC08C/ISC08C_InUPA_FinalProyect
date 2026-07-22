//nota porque no me deja subirlo a git

export interface CreateConnectionDTO {
  follower_id: string;
  following_id: string;
}

export interface ConnectionFilters {
  follower_id?: string;
  following_id?: string;
  page?: number;
  limit?: number;
}