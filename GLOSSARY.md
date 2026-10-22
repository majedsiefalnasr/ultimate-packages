# Ultimate

Ultimate is a company-owned, multi-framework UI platform derived from pinned MIT-licensed Prime source baselines. This glossary fixes the words used for Prime-derived concepts across docs, code and issues.

## Prime reference

**Prime baseline**:
The exact MIT-licensed Prime releases pinned by ADR-048, the only upstream versions Ultimate measures itself against.
_Avoid_: latest Prime, upstream (unqualified)

**Prime reference study**:
The committed description of the Prime baseline under `docs/prime-reference/`, built from the pinned archives alone.
_Avoid_: Prime audit, parity audit

**Prime catalog**:
The generated, machine-readable API listing of the Prime baseline, one per framework.
_Avoid_: API dump, apidoc

**Component record**:
One hand-written study entry describing a single Prime component across all three frameworks.
_Avoid_: component page, component doc

## Component names

**Canonical component name**:
The name a component carries in PrimeNG 21 and PrimeVue 4; Ultimate and its docs use this name.
_Avoid_: using a legacy alias as the primary name

**Legacy alias**:
An older Prime name for a component that now has a different canonical name, kept only for cross-reference.

**Select**:
The single-choice dropdown input.
_Avoid_: Dropdown

**DatePicker**:
The date and time input with a calendar overlay.
_Avoid_: Calendar

**Drawer**:
The panel that slides in from a screen edge.
_Avoid_: Sidebar

**Popover**:
The anchored overlay container opened from a target element.
_Avoid_: OverlayPanel

**ToggleSwitch**:
The on/off switch input.
_Avoid_: InputSwitch

**Tabs**:
The tabbed container built from tab list, tab and tab panel parts.
_Avoid_: TabView
