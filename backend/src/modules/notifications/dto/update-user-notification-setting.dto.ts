import { IsBoolean } from 'class-validator';

export class UpdateUserNotificationSettingDto {
  @IsBoolean()
  habilitado: boolean;
}
