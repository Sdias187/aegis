export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export type PageChangeHandler = (page: number) => void;

export type PageSizeChangeHandler = (pageSize: number) => void;
