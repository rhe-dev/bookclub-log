/** 생성 시 createdAt·updatedAt이 밀리초 단위로 어긋날 수 있어 1초 여유를 둔다 */
export const isCommentEdited = (createdAt: Date, updatedAt: Date) =>
  updatedAt.getTime() - createdAt.getTime() > 1000;
