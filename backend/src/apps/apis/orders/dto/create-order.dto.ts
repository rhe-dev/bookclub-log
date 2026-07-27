import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorMessage } from '../../../../shared/constants/error-message';

export class CreateOrderDto {
  /** 문집 제목 */
  @IsString()
  @IsNotEmpty({ message: ErrorMessage.ORDER_TITLE_REQUIRED })
  @MaxLength(100)
  title: string;

  /** 인쇄 부수 */
  @IsInt()
  @Min(1, { message: ErrorMessage.ORDER_COPIES_MIN })
  @Max(100)
  copies: number;

  /** 수록할 책 publicId 목록 */
  @IsArray()
  @ArrayNotEmpty({ message: ErrorMessage.ORDER_BOOKS_REQUIRED })
  @IsString({ each: true })
  bookIds: string[];
}
