import { ApiProperty } from '@nestjs/swagger';

export function dataResponse<T>(data: T): { data: T } {
  return { data };
}

export function errorResponse(error: { code: string; message: string }, details: unknown[], requestId: string) {
  return { error: { ...error, details, requestId } };
}

export class EmptyDataDto {}

export class EmptyResponseDto {
  @ApiProperty({ type: EmptyDataDto }) data!: EmptyDataDto;
}

export class ErrorDetailDto {
  @ApiProperty({ enum: ['path', 'query', 'header', 'body'] }) location!: string;
  @ApiProperty() field!: string;
  @ApiProperty() message!: string;
}

export class ErrorDto {
  @ApiProperty() code!: string;
  @ApiProperty() message!: string;
  @ApiProperty({ type: [ErrorDetailDto] }) details!: ErrorDetailDto[];
  @ApiProperty() requestId!: string;
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorDto }) error!: ErrorDto;
}
