/**
 * Frontend interface for creating a new donation
 * This is a plain interface without decorators to avoid issues in frontend builds
 */
export interface ICreateDonation {
  helpRequestId: number;
  donatorName: string; // Donator's name for contacting
  donatorMobileNumber: string; // Donator's mobile number for contacting
  rationItems: Record<string, number>; // Map of ration item IDs to counts
}

