import { z } from "zod";

export const ipv4 = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/,
    "Invalid IPv4 address",
  );

const IPV6_RE =
  /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^(?:[0-9a-fA-F]{1,4}:){1,6}(?::[0-9a-fA-F]{1,4}){1,1}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^(?:[0-9a-fA-F]{1,4}:){1,1}(?::[0-9a-fA-F]{1,4}){1,6}$|^::$|^::1$|^::ffff:(?:\d{1,3}\.){3}\d{1,3}$/;

export const ipv6 = z.string().regex(IPV6_RE, "Invalid IPv6 address");

export const ipAddress = z.union([ipv4, ipv6]);

export const cidrV4 = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\/(?:3[0-2]|[12]?\d)$/,
    "Invalid IPv4 CIDR (e.g. 10.147.20.0/24)",
  );

export const cidrV6 = z
  .string()
  .regex(/^[0-9a-fA-F:]+\/(?:12[0-8]|1[01]\d|\d{1,2})$/, "Invalid IPv6 CIDR");

export const cidr = z.union([cidrV4, cidrV6]);

export const macAddr = z
  .string()
  .regex(
    /^[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5}$/,
    "Invalid MAC (e.g. aa:bb:cc:dd:ee:ff)",
  );

export const nwid = z.string().regex(/^[0-9a-fA-F]{16}$/, "Invalid NWID");
export const memberId = z
  .string()
  .regex(/^[0-9a-fA-F]{10}$/, "Invalid member address (10 hex chars)");
export const nodeAddr = memberId;

export const portNumber = z.number().int().min(0).max(65535);
export const ethertypeHex = z
  .string()
  .regex(/^0x[0-9a-fA-F]{1,4}$/, "Hex like 0x0800");
