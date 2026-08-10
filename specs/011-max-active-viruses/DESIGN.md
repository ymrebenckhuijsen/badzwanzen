---
Status: No UI Impact
---

# Design Addendum: Max Active Viruses

Confirmed by the developer at feature-start: this feature has no UI surface. The 4-virus cap
only changes which card is drawn next (existing draw flow); unique end messages are a card
content change (`liftText`) rendered through the existing `VirusLiftCard`/`DrawnCardView`
components with no visual changes needed.
