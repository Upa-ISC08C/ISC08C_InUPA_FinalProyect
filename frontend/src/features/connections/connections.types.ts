export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower: {
    id: string;
    titular_profesional: string | null;
    url_foto: string | null;
  };
  following: {
    id: string;
    titular_profesional: string | null;
    url_foto: string | null;
  };
}

export interface ConnectionsResponse {
  success: boolean;
  data: Connection[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateConnectionDTO {
  follower_id: string;
  following_id: string;
}