export type UserRole = "ROLE_USER" | "ROLE_ADMIN";

export type User = {
  id: number;
  fullName: string;
  email: string;
  roles: UserRole[];
  phone: string | null;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  isbn: string;
  description: string;
  availableCopies: number;
  isAvailable: boolean;
  publishedAt: string;
  imageUrl?: string | null;
};

export type BorrowRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";

export type BorrowRequest = {
  id: number;
  status: BorrowRequestStatus;
  note: string | null;
  requestedAt: string;
  book: Book;
  user: User;
};

export type BooksResponse = {
  items: Book[];
  meta: {
    total: number;
    categories: string[];
  };
};

export type UsersResponse = {
  items: User[];
  meta: {
    total: number;
  };
};

export type RequestsResponse = {
  items: BorrowRequest[];
  meta: {
    total: number;
  };
};

export type StatsResponse = {
  message: string;
  stats: {
    overview: {
      borrowedBooks: number;
      registeredUsers: number;
      pendingRequests: number;
      catalogBooks: number;
    };
    requestStatusBreakdown: Array<{
      status: BorrowRequestStatus;
      count: number;
    }>;
    inventory: {
      totalAvailableCopies: number;
      unavailableTitles: number;
    };
    users: {
      admins: number;
      members: number;
    };
    catalogSnapshot: Array<{
      category: string;
      title: string;
      availableCopies: number;
    }>;
    recentRequests: Array<{
      id: number;
      bookTitle: string;
      requester: string;
      status: BorrowRequestStatus;
      requestedAt: string;
    }>;
  };
};
