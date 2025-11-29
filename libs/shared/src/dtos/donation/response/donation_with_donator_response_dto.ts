import { IDonation } from '../../../interfaces/donation/IDonation';
import { IUser } from '../../../interfaces/user/IUser';

/**
 * Extended DTO for donation response that includes donator information
 * Contact info (name and mobile) is only included if:
 * - The requester is the help request owner, OR
 * - The requester is the donator themselves
 */
export class DonationWithDonatorResponseDto {
  id: number;
  helpRequestId: number;
  donatorId: number;
  donatorUsername?: string;
  donatorName?: string; // Only included if requester is owner or donator
  donatorMobileNumber?: string; // Only included if requester is owner or donator
  rationItems: Record<string, number>;
  donatorMarkedScheduled: boolean;
  donatorMarkedCompleted: boolean;
  ownerMarkedCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    donation: IDonation & { donator?: { id: number; username: string; contactNumber?: string } },
    showContactInfo: boolean = false
  ) {
    this.id = donation.id!;
    this.helpRequestId = donation.helpRequestId;
    this.donatorId = donation.donatorId;
    this.donatorUsername = donation.donator?.username;
    // Show contact info only if requester is owner or donator
    if (showContactInfo) {
      this.donatorName = donation.donatorName;
      this.donatorMobileNumber = donation.donatorMobileNumber;
    }
    this.rationItems = donation.rationItems;
    this.donatorMarkedScheduled = donation.donatorMarkedScheduled || false;
    this.donatorMarkedCompleted = donation.donatorMarkedCompleted || false;
    this.ownerMarkedCompleted = donation.ownerMarkedCompleted || false;
    this.createdAt = donation.createdAt;
    this.updatedAt = donation.updatedAt;
  }
}

