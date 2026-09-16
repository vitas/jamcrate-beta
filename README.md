# JamCrate landing source

Currently UNPUBLISHED on purpose (owner is rewriting the copy; a custom
domain may replace this host). The public repo `vitas/jamcrate-beta`
still serves the DMG via releases — that link stays valid.

Domain: `jamcrate.app` (Cloudflare DNS, owner buys). In Cloudflare the root
and www CNAMEs point at vitas.github.io in DNS-only mode; GitHub issues the
TLS cert automatically. The CNAME file below carries the domain on publish:
    echo jamcrate.app > CNAME   (kept in this folder already)

Republish after the text is final:

    gh api -X POST repos/vitas/jamcrate-beta/pages -f 'source[branch]=main' -f 'source[path]=/'
    gh api -X PATCH repos/vitas/jamcrate-beta/pages -f custom_domains=jamcrate.app
    ./tools/push-site.sh        # if the content itself changed too

If a domain wins instead: point it at the same Pages backend
(DNS CNAME + `repos/.../pages` custom_domains) and add `CNAME` here.
