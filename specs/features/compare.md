# Compare

## Goal

Put any two Pokémon side by side and see who is stronger on each stat.

## Constraints

- The third tab, "Compare". The tab and screen follow the app's style: Daylight background,
  title in Rubik Bold 24, white cards with radius 8 and the soft shadow, Purple accent, a 24 pt
  line icon in the same style. Figma has no screen for this.
- Two slots side by side at the top, each half of the content width. An empty slot shows "+" and
  "Select Pokémon". A filled slot shows the sprite, badge, name and a way to change it.
- Tapping a slot opens a picker screen: the Search field and grid over the complete catalogue
  index, reusing the List and Search components. Tapping a card selects it for that slot and
  returns. The "⋮" menu is hidden in the picker.
- Stats come from `/pokemon/{id}` with the same query key as Detail (cached when already loaded).
- Comparison rows: HP, Attack, Defense, Special Attack, Special Defense, Speed, Total (sum of the
  six). Each row has the label, the value and bar for each side, bars on the same 0–255 scale as
  Detail (Total uses 0–1530).
  - The higher value and its bar are Purple and the value is bold.
  - The lower value is plain Midnight with a Silver bar.
  - Equal values: both plain, with "=" between them.
- The selection stays while the app runs, also when switching tabs. It is not saved after a restart.
- Layout adapts to the width without horizontal overflow.
- Decided while planning #6 (agreed with the user):
  - The picker is a stack screen above the tabs, `/compare-picker/left` or `/compare-picker/right`,
    with the app's back button. Going back without a tap changes nothing. A second tap is ignored.
  - The selection (`{ id, name }` per slot) is kept in memory above the root Stack, not in route
    params: the Expo Router 58 docs do not define how params are merged when returning to a
    screen. A slot shows its card at once; its stats load separately.
  - The same Pokémon in both slots uses the one `['pokemon', id]` cache entry. A replaced slot
    shows its loading state until its own stats arrive, never the previous Pokémon's stats.
  - Rows appear only when both sides have their stats. Equal values: both bars Silver
    (follows from "no highlight").
  - Assumptions without a design: slots are list-card sized; an empty slot is a white card with
    a Purple "+"; a filled slot is the list card without "⋮" plus a Purple "Change" label. The
    label is centred above both sides, bars grow from the centre outwards, and a Silver line
    sits above Total.

## Acceptance Criteria

- [ ] With no or one Pokémon selected, the empty slot(s) and the hint "Select two Pokémon to
      compare" are shown, without stat rows.
- [ ] Any Pokémon from the full catalogue can be picked, including one not scrolled to (for example
      "pecharunt" through the picker's search).
- [ ] With two selected, all seven rows show both values. The higher side is highlighted per row.
- [ ] Equal values show "=" and no highlight. The same Pokémon in both slots gives "=" on every row.
- [ ] Changing a slot recalculates the rows.
- [ ] Each slot has its own loading state and its own error with Try again. A failure on one side
      does not clear the other.

## Out of Scope

- More than two Pokémon.
- Type effectiveness, battle simulation, winners overall beyond the Total row.
- Saving comparisons after a restart.
- Starting a comparison from Detail or the options sheet.
