import geo from 'geoip-lite';
import { Request } from 'express';

export enum IpType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE'
}

export class IPService {
  static getIp(req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (ip) {
      if (Array.isArray(ip)) {
        return {
          ip: ip[0],
        }
      } else {
        return {
          ip,
        }
      }
    }

    return {
      error: 'Не удалось определить IP',
      ip: '',
    }
  }

  static isPrivateIp(ip: string) {
    return (
      ip === '127.0.0.1' || // IPv4-петля
      ip === '::1' || // IPv6-петля
      /^10\./.test(ip) || // приватная сеть класса A
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || // приватная сеть класса B
      /^192\.168\./.test(ip) // приватная сеть класса C
    );
  }

  static getIpInfo(ip: string) {
    if (IPService.isPrivateIp(ip)) {
      return {
        type: IpType.LOCAL,
        ip,
      }
    } else {
      return {
        ip,
        type: IpType.REMOTE,
        geo: geo.lookup(ip),
      }
    }
  }
}
