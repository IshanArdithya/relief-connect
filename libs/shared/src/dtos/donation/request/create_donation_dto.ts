import { IsNumber, IsNotEmpty, IsObject, IsString, Min, Length } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';
import { ICreateDonation } from '../../../interfaces/donation/ICreateDonation';

/**
 * DTO for creating a new donation
 * Backend DTO with validation decorators
 * Frontend should use ICreateDonation interface instead
 */
export class CreateDonationDto extends BaseDto implements IBodyDto, ICreateDonation {
  @IsNumber({}, { message: 'Help request ID must be a number' })
  @IsNotEmpty({ message: 'Help request ID is required' })
  @Min(1, { message: 'Help request ID must be greater than 0' })
  helpRequestId!: number;

  @IsString({ message: 'Donator name must be a string' })
  @IsNotEmpty({ message: 'Donator name is required' })
  @Length(1, 100, { message: 'Donator name must be between 1 and 100 characters' })
  donatorName!: string;

  @IsString({ message: 'Donator mobile number must be a string' })
  @IsNotEmpty({ message: 'Donator mobile number is required' })
  @Length(1, 20, { message: 'Donator mobile number must be between 1 and 20 characters' })
  donatorMobileNumber!: string;

  @IsObject({ message: 'Ration items must be an object' })
  @IsNotEmpty({ message: 'Ration items are required' })
  rationItems!: Record<string, number>;

  constructor(data?: Partial<ICreateDonation>) {
    super();
    if (data) {
      this.helpRequestId = data.helpRequestId || 0;
      this.donatorName = data.donatorName || '';
      this.donatorMobileNumber = data.donatorMobileNumber || '';
      this.rationItems = data.rationItems || {};
    }
  }
}

