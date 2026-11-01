/**
 * Whether an address belongs to a hosting or cloud provider rather than a home
 * or mobile network (doitac-3010 #020, rule 4).
 *
 * People open partner links from phones and home Wi-Fi; a script that floods
 * them usually runs on a rented server. An address on this list is one reason
 * among several for a click's bot score — never a refusal on its own, since a
 * VPN or an office proxy can sit in a data centre too.
 *
 * The list is a starting set of the big providers' blocks (AWS, Google Cloud,
 * Azure, DigitalOcean, Hetzner, OVH, Linode, Vultr, Oracle, Contabo). More can
 * be added without a release through `PARTNER_DATACENTER_CIDRS`
 * ("1.2.3.0/24,5.6.0.0/16"). IPv4 only; an IPv6 address is never flagged.
 */

const BUILT_IN_CIDRS = [
  // Amazon Web Services
  "3.0.0.0/8", "52.0.0.0/11", "54.144.0.0/12", "54.160.0.0/11",
  // Google Cloud
  "34.64.0.0/10", "35.184.0.0/13", "35.192.0.0/12", "35.208.0.0/12",
  // Microsoft Azure
  "13.64.0.0/11", "40.64.0.0/10",
  // DigitalOcean
  "64.225.0.0/16", "104.131.0.0/16", "128.199.0.0/16", "134.209.0.0/16",
  "138.68.0.0/16", "142.93.0.0/16", "159.89.0.0/16", "159.203.0.0/16",
  "167.99.0.0/16", "178.62.0.0/16", "188.166.0.0/16", "206.189.0.0/16",
  // Hetzner
  "5.9.0.0/16", "5.161.0.0/16", "49.12.0.0/15", "65.21.0.0/16",
  "65.108.0.0/16", "78.46.0.0/15", "88.198.0.0/16", "95.216.0.0/16",
  "116.202.0.0/15", "135.181.0.0/16", "168.119.0.0/16",
  // OVH
  "37.59.0.0/16", "51.38.0.0/16", "51.68.0.0/16", "51.75.0.0/16",
  "51.77.0.0/16", "51.89.0.0/16", "51.91.0.0/16", "51.178.0.0/16",
  "51.195.0.0/16", "54.36.0.0/15", "54.38.0.0/16", "137.74.0.0/16",
  "145.239.0.0/16", "149.202.0.0/16", "178.32.0.0/15", "188.165.0.0/16",
  // Linode (Akamai)
  "45.79.0.0/16", "50.116.0.0/16", "139.162.0.0/16", "172.104.0.0/15",
  // Vultr
  "45.32.0.0/16", "45.63.0.0/16", "45.76.0.0/15", "108.61.0.0/16",
  "144.202.0.0/16", "149.28.0.0/16",
  // Oracle Cloud
  "129.146.0.0/16", "132.145.0.0/16", "140.238.0.0/16", "152.67.0.0/16",
  "158.101.0.0/16",
  // Contabo
  "5.189.128.0/17", "161.97.0.0/16", "173.212.192.0/18", "207.180.192.0/18",
];

type Block = { base: number; mask: number };

function ipv4ToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = value * 256 + n;
  }
  return value;
}

function parseCidr(cidr: string): Block | null {
  const [ip, bitsText] = cidr.trim().split("/");
  const base = ip ? ipv4ToInt(ip) : null;
  const bits = Number(bitsText);
  if (base === null || !Number.isInteger(bits) || bits < 1 || bits > 32) {
    return null;
  }
  const mask = bits === 32 ? 0xffffffff : (0xffffffff << (32 - bits)) >>> 0;
  return { base: (base & mask) >>> 0, mask };
}

let blocks: Block[] | null = null;

function datacenterBlocks(): Block[] {
  if (!blocks) {
    const extra = (process.env.PARTNER_DATACENTER_CIDRS ?? "").split(",");
    blocks = [...BUILT_IN_CIDRS, ...extra]
      .map(parseCidr)
      .filter((block): block is Block => block !== null);
  }
  return blocks;
}

export function isDatacenterIp(ip: string | null | undefined): boolean {
  // "::ffff:1.2.3.4" is an IPv4 address written for an IPv6 socket.
  const value = ipv4ToInt((ip ?? "").replace(/^::ffff:/i, ""));
  if (value === null) return false;
  return datacenterBlocks().some(
    ({ base, mask }) => ((value & mask) >>> 0) === base
  );
}
