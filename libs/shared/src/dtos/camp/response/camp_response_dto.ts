import { ICamp } from '../../../interfaces/camp/ICamp';

/**
 * DTO for camp response
 */
export class CampResponseDto implements ICamp {
  id: number;
  lat: number;
  lng: number;
  campType: string;
  name: string;
  peopleRange: string;
  needs: string[];
  shortNote: string;
  contactType: string;
  contact?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(camp: ICamp) {
    this.id = camp.id!;
    this.lat = camp.lat;
    this.lng = camp.lng;
    this.campType = camp.campType;
    this.name = camp.name;
    this.peopleRange = camp.peopleRange;
    this.needs = camp.needs;
    this.shortNote = camp.shortNote;
    this.contactType = camp.contactType;
    this.contact = camp.contact;
    this.createdAt = camp.createdAt;
    this.updatedAt = camp.updatedAt;
  }
}

