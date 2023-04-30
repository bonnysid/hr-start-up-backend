import DefaultDTO from './DefaultDTO';

export default class SessionDTO extends DefaultDTO {
  ip: string
  country: string;
  city: string;
  isCurrent?: boolean;

  constructor(model: any, isCurrent?: boolean) {
    super(model);
    this.country = model.country;
    this.city = model.city;
    this.ip = model.ip;
    this.isCurrent = isCurrent;
  }
}
