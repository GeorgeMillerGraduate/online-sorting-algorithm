# Jenga Code — Sorting Studio

Extract the archive into your sorting project folder, with `index.html`, `css/` and `js/` directly inside it. Open `index.html` or upload to your static hosting. No build step, API key or external JavaScript is required.

## Layout

Shared Jenga Code header and blue/white styling. The controls are on the left, with a large animated bar display on the right. Readouts and a compact colour legend sit beneath the bars. Explanations, sound settings and blank advertising space are in the sidebar. Desktop layout uses the viewport height; narrow screens stack the controls and display.

## Features retained

- Bubble, Selection, Insertion, Merge and Quick Sort.
- Arrays of 10–200 values, animation speed, sound volume and mute.
- Sort, Pause/Resume, Step, Reset, Shuffle and Generate new array.
- Comparison counts and combined swaps/value-changing writes.

Reset restores the original unsorted array. Switching algorithms also returns to that original data. Shuffle rearranges the existing values and makes that the new starting array. Generate creates new values. Sound starts only after user interaction and requires Web Audio support.

Bar states: pale blue unsorted, gold comparing, coral swapping/writing, purple pivot/minimum, muted teal merged and blue sorted. Merged ranges are temporary and are not necessarily in their final positions.

The five algorithm implementations and audio engine are unchanged. The app startup now uses native DOMContentLoaded instead of jQuery. The animation renderer uses a run identifier to cancel old loops safely after reset/restart and handles manual completion while paused.

## Site integration

Shared links assume this project is two folders below the website root, for example `/projects/sorting/`. The logo loads from `../../images/logo.png`, with a text fallback when unavailable. Other website pages and the shared logo are not included.

## Validation

All five algorithms were exercised through the app's Step control and produced ascending results, with reset checked after each. Immediate restart and paused manual completion also passed. The DOM was simulated; audible playback and full browser layout were not verified. Check your desktop/mobile layout and sound in your browser after extraction.
