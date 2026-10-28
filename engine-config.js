/* Renov8ers engine endpoints for direct website-lead intake, tried in order;
   "" entries are skipped. Point the first entry at STUMF's public funnel on
   port 8443, e.g. "https://<beelink>.<tailnet>.ts.net:8443" (on the Beelink:
   `tailscale status --json | jq -r .Self.DNSName`, drop the trailing dot).
   When none respond, the estimate form falls back to text/email/call with
   the answers prefilled, which still reaches the business line (516) 986-8621. */
window.R8_ENGINE_URLS = [
  "https://fedora.vimba-rigel.ts.net:8443"  // STUMF public funnel (kept current by STUMF)
];
