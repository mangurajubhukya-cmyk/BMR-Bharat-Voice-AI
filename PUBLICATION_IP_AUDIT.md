# Zynvori AI Publication Intellectual-Property Audit

> **Working legal note:** This engineering audit is not legal advice or trademark clearance. Before a commercial launch, have a qualified IP lawyer review the final name, logo, terms, privacy notice, commercial dependencies, and target markets.

## Scope and result

The audit reviewed the public app shell, visible graphics, remote font/image references, and direct production dependencies. The app now uses an original simple Zynvori SVG mark both for the favicon and the workspace identity. It no longer fetches external Google web fonts or a hosted signal image from the public application shell.

| Area | Finding | Release action |
|---|---|---|
| Product name | **Zynvori AI** is a coined working name. A preliminary public screen found no exact result, but this is not a legal clearance. | Do not present the name as registered. Complete WIPO and country-level searches, domain checks, and attorney review before filing or major advertising.[1] |
| Logo and favicon | The current geometric Zynvori SVG mark was authored in this project. | Retain the source SVG and change log; do not substitute third-party marks without a documented commercial license. |
| Fonts | The public shell no longer fetches Google Fonts and uses the browser/system font stack. | If branded typefaces are added later, retain the font license and attribution requirements. |
| Images and media | The former hosted signal image was removed from the visible workspace. No externally sourced public image asset is required by the current UI. | Add a source-and-license record before adding photography, illustration, audio, or video. |
| Direct production packages | `THIRD_PARTY_LICENSE_INVENTORY.md` is generated from installed direct production dependencies by `scripts/audit-licenses.mjs`. | Re-run after dependency changes; review any UNVERIFIED entry and full notice obligations before shipping. |
| User submissions and AI output | Users can provide material that may be protected, and AI output cannot be promised infringement-free. | Publish Terms, Privacy, Acceptable Use, and a copyright-report/takedown process before accepting public user content. |

## Required commercial-release checks

1. Run formal word-mark searches for **Zynvori AI**, similar spellings, and the proposed logo in every first-launch market. WIPO notes that its Global Brand Database should be supplemented with national or regional registers.[1]
2. Check the domain name, social handles, mobile-app stores, and company-register availability before public advertising.
3. Preserve a dependency lockfile and re-run `node scripts/audit-licenses.mjs` whenever packages change. Review direct and transitive package notices with counsel for the distribution model.
4. Keep a source record and license proof for every future public asset. Copyright protects original software, images, and other fixed expression, while names and short phrases raise trademark rather than copyright questions.[2]
5. Before live sales, publish jurisdiction-appropriate Terms of Service, Privacy Notice, refund/cancellation policy, acceptable-use rules, and contact details. The payment policy must match the live Stripe configuration.

## References

[1] [WIPO Global Brand Database](https://www.wipo.int/en/web/global-brand-database)

[2] [U.S. Copyright Office: What is Copyright?](https://www.copyright.gov/what-is-copyright/)
