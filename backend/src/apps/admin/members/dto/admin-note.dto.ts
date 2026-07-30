import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

/** 운영자 메모 수정 — 빈 문자열이면 메모를 지운다 */
export class AdminNoteDto {
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @MaxLength(1000, { message: ErrorCode.ADMIN_NOTE_MAX })
  note?: string;
}
