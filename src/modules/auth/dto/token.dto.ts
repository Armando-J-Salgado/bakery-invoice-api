import { IsNotEmpty } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  access_token: string;
}
