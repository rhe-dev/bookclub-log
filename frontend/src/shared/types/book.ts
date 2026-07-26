import type { components } from './api.generated';

/** GET /clubs/:id/books 항목 · GET /books/:id 응답 */
export type Book = components['schemas']['BookResponse'];

export type BookStatus = Book['status'];

/** POST /clubs/:id/books 바디 */
export type CreateBookBody = components['schemas']['CreateBookDto'];

/** PATCH /books/:id 바디 — null은 해당 값 해제 */
export type UpdateBookBody = components['schemas']['UpdateBookDto'];
