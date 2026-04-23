# Guitar Chord Generator — Project Roadmap

## Version 0.1.0 (MVP) — Current Status: SHIPPED ✓

**Released:** 2026-04-23

### Completed Features

- [x] Chord parsing from lyrics text using `[ChordName]` notation
- [x] SVG fingering diagram rendering (6-string fretboard, frets 0-12)
- [x] Voicing selection (cycle through alternate fingerings per chord)
- [x] Three design variants (Editorial, Paper, Mono)
- [x] PNG export (copy to clipboard via html-to-image)
- [x] Print support (A4 CSS @media print)
- [x] State persistence (lyrics, title, artist, voicing choices via localStorage)
- [x] Chord data pipeline (JSON source → JavaScript generator)
- [x] CLI tools (add-chord, add-voicing, list-chords)
- [x] Task runner (Justfile)
- [x] GitHub Actions (UI-based chord addition workflow)
- [x] Cloudflare Workers Assets deployment (Git-connected auto-deploy)

### MVP Success Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Load time** | <2s | ~1.2s | ✓ |
| **Parse & render (20 chords)** | <500ms | ~350ms | ✓ |
| **Chord database** | 50+ chords | 100+ chords | ✓ |
| **Browser compatibility** | Chrome 90+, Firefox 88+, Safari 14+ | All tested | ✓ |
| **Export reliability** | >95% | PNG + print both working | ✓ |
| **Documentation** | README + 4 doc files | Complete | ✓ |

---

## Future Roadmap (Post-MVP)

### Phase 1: Accessibility & Polish (Estimated: Q3 2026)

**Priority:** High  
**Effort:** 2–3 weeks

#### Goals
- Achieve WCAG 2.1 AA accessibility compliance
- Improve mobile responsiveness
- Add keyboard navigation + screen reader support

#### Features
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard shortcuts (↑/↓ for voicing, Tab navigation)
- [ ] High-contrast mode toggle
- [ ] Font size adjustment slider
- [ ] Screen reader testing with NVDA/JAWS
- [ ] Mobile-optimized touch targets (48px min)
- [ ] Responsive layout for tablets + phones

#### Success Criteria
- [ ] Lighthouse accessibility score 90+
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard-only navigation works end-to-end
- [ ] Mobile UI passes usability testing

---

### Phase 2: Chord Library Expansion (Ongoing)

**Priority:** Medium  
**Effort:** Continuous

#### Goals
- Grow chord database to 500+ chords with multiple voicings
- Support more chord types (jazz extensions, alternate tunings)
- Improve alias coverage

#### Features
- [ ] Extended chord types: maj9, min11, min13, dim7, sus2sus4, etc.
- [ ] Slash chords with proper bass note indication
- [ ] Barre chord alternatives (marked as "easier voicing")
- [ ] Community-contributed voicings (via GitHub Issues)
- [ ] Voicing difficulty ratings (beginner, intermediate, advanced)

#### Success Criteria
- [ ] 500+ chords in database
- [ ] Every standard jazz chord available
- [ ] User submissions integrated monthly

---

### Phase 3: Transposition & Arrangement Tools (Estimated: Q4 2026)

**Priority:** High  
**Effort:** 3–4 weeks

#### Goals
- Add built-in transposition (no copy/paste needed)
- Simplify chord arrangement workflow

#### Features
- [ ] Transpose input: select key, auto-shift all chords
  - Example: "C → F" shifts C→F, Dm→Gm, G→C, etc.
- [ ] Capo calculator: "Play with capo on fret X for key Y"
- [ ] Key signature display (show which chords are diatonic)
- [ ] Relative key suggestions (C major ↔ A minor)
- [ ] Export transposed chart with original + new chords

#### Success Criteria
- [ ] Transpose all standard chords correctly
- [ ] Capo suggestion accurate for all keys
- [ ] UI ergonomic (no more than 2 clicks to transpose)

---

### Phase 4: Song Database & Discovery (Estimated: Q1 2027)

**Priority:** Medium  
**Effort:** 4–6 weeks

#### Goals
- Build curated library of songs with pre-parsed chords
- Enable song search + discovery
- Foster community contributions

#### Features
- [ ] Song database (title, artist, key, difficulty, BPM)
- [ ] Pre-parsed chord charts (verified, quality-checked)
- [ ] Search by title/artist/key/difficulty
- [ ] Song collections (e.g., "Beatles Classics", "Jazz Standards")
- [ ] User ratings + comments on song charts
- [ ] Submit new songs (user-contributed, moderated)

#### Implementation Notes
- Optional feature (not core to app)
- Could live in separate `/songs` endpoint or database
- Requires moderation system for quality control

#### Success Criteria
- [ ] 100+ verified song charts
- [ ] Search works across all metadata
- [ ] User submissions processed weekly

---

### Phase 5: Offline Support (Estimated: Q2 2027)

**Priority:** Low–Medium  
**Effort:** 2–3 weeks

#### Goals
- Full offline capability (Service Worker)
- Work without internet after first load

#### Features
- [ ] Service Worker: cache all assets + chord database
- [ ] Offline indicator (connection status display)
- [ ] Sync changes when back online (if song database added)
- [ ] Background sync for user-submitted chords

#### Success Criteria
- [ ] App loads without network
- [ ] All features work offline (except external APIs)
- [ ] Tested on WiFi-disabled airplane mode

---

### Phase 6: Mobile Native Apps (Estimated: Q3 2027)

**Priority:** Low  
**Effort:** 6–8 weeks per platform

#### Goals
- iOS + Android native apps
- App store distribution

#### Features
- [ ] React Native wrapper for web app
- [ ] Native file export (iOS share sheet, Android share)
- [ ] Home screen icon + app badge
- [ ] Push notifications (practice reminders, new chords added)
- [ ] Offline-by-default (all data cached)

#### Success Criteria
- [ ] iOS App Store & Google Play listing
- [ ] 4+ star rating (100+ downloads minimum)
- [ ] Feature parity with web version

---

### Phase 7: Advanced Features (Backlog)

**Low priority, speculative features** — not planned for near term.

#### Features (Not Scheduled)
- [ ] **Tab viewer:** Full tablature notation (separate feature)
- [ ] **MIDI playback:** Hear chord voicings
- [ ] **Alternate tunings:** Open G, Drop D, DADGAD, etc.
- [ ] **Difficulty metrics:** Finger stretch, speed requirements per voicing
- [ ] **Practice mode:** Timed chord changes, visual metronome
- [ ] **Video integration:** YouTube lesson links, synchronized playback
- [ ] **Social features:** Share charts, collaborate on arrangements
- [ ] **A/B chord comparison:** Side-by-side voicing analysis
- [ ] **PDF generation:** Generate printable lead sheets (with notation)

---

## Completed Initiatives (Historical)

### ✓ Data Migration & Automation (Completed: 2026-04-23)

**Plan reference:** `plans/260423-1403-chord-automation/`

- [x] **Phase 1: Data Pipeline** — Migrated chord-data.js → chord-data.json, built chord-build.js
- [x] **Phase 2: CLI Scripts** — Created chord-add.js with validation, auto-rebuild
- [x] **Phase 3: Automation** — Created Justfile + GitHub Actions workflow

**Impact:** Eliminates manual chord additions; community can contribute via CLI or UI.

---

## Backlog (Not Prioritized)

These features are recognized as valuable but don't have a scheduled phase:

- **Chord name aliases:** Map common variations (Dm7 ↔ D-7)
- **Voicing difficulty ratings:** Show beginner/intermediate/advanced labels
- **Fretboard heat map:** Visualize difficulty (finger stretch, hand position)
- **Audio playback:** MIDI or synthesized sound for chord voicings
- **Collaborative editing:** Real-time shared chord sheets (requires backend)
- **API for integrations:** Let other tools fetch chord data
- **Analytics:** Track popular chords, songs, user behavior
- **Dark mode:** System-aware theme switching

---

## Known Issues & Limitations

| Issue | Severity | Workaround | Target Phase |
|-------|----------|-----------|--------------|
| **Not WCAG 2.1 AA** | Medium | Manual adjustments | Phase 1 (Accessibility) |
| **Desktop-optimized only** | Medium | Works on mobile (not ideal) | Phase 1 (Responsive) |
| **Print layout fixed A4** | Low | Manual page setup | Phase 3 or later |
| **Standard tuning only** | Medium | Users suggest voicings | Phase 7 (Advanced) |
| **No transposition UI** | Medium | Copy/paste + manual edit | Phase 3 (Transposition) |
| **No song database** | Low | Users manage own chords | Phase 4 (Songs) |
| **No offline mode** | Low | Works in browser cache (temporary) | Phase 5 (Offline) |

---

## Success Metrics by Phase

### Phase 1: Accessibility
- [ ] WCAG 2.1 AA compliance score
- [ ] Keyboard navigation usability test (5 users)
- [ ] Screen reader compatibility verified

### Phase 2: Chord Library
- [ ] 500+ chords in database
- [ ] <10ms lookup time for any chord
- [ ] Alias coverage >90% (Dm7 → D-7 → Dm, etc.)

### Phase 3: Transposition
- [ ] Transpose accuracy 100% (all test cases pass)
- [ ] Capo calculator verified against music theory
- [ ] User feedback: "Easier than copy/paste"

### Phase 4: Song Database
- [ ] 100+ verified song charts
- [ ] Search response time <100ms
- [ ] User submissions: 10+ per week (by steady state)

### Phase 5: Offline
- [ ] App loads without network
- [ ] Service Worker cache size <5MB
- [ ] Offline functionality audit: 100% feature parity

### Phase 6: Mobile Apps
- [ ] iOS/Android store presence
- [ ] 4+ star ratings
- [ ] Feature parity with web version

---

## Release Schedule (Estimated)

| Version | Target Date | Focus | Status |
|---------|-------------|-------|--------|
| **0.1.0** | 2026-04-23 | MVP (shipping now) | ✓ SHIPPED |
| **0.2.0** | 2026-Q3 | Accessibility + responsive | Planned |
| **0.3.0** | 2026-Q4 | Transposition + capo | Planned |
| **0.4.0** | 2027-Q1 | Song database | Planned |
| **0.5.0** | 2027-Q2 | Offline support | Planned |
| **1.0.0** | 2027-Q3 | Native apps + stability | Planned |

---

## Metrics & Feedback Loop

### Current Metrics (MVP Phase)

**Post-MVP, track:**
- User engagement: daily/weekly active users
- Feature usage: which variants, export vs print, most-used chords
- Performance: real-world load times, errors
- Community contributions: chords submitted per week
- Retention: return user rate

### Feedback Collection

- [ ] GitHub Issues for feature requests
- [ ] User surveys (quarterly)
- [ ] Analytics dashboard (if analytics added)
- [ ] User testing (accessibility, usability)
- [ ] Community feedback on Discord/Reddit (if community forms)

---

## Dependencies & Constraints

### Technical Constraints
- **No backend:** Roadmap assumes static app or minimal backend (Cloudflare Workers)
- **Browser APIs:** Limited to what modern browsers support (no legacy IE support)
- **CDN availability:** Dependent on external CDNs (React, Babel, fonts)

### Resource Constraints
- **Team:** Currently solo developer (Gerard Nguyen)
- **If scaling:** Will need contributors for community moderation, testing

### External Dependencies
- **React 18 via CDN:** Breaking changes unlikely (stable API)
- **Babel standalone:** Stable, no updates expected
- **html-to-image:** Active maintenance, alternatives exist
- **Cloudflare Workers:** Long-term availability (enterprise provider)

---

## Decision Log

### Q2 2026: Why No Backend?

**Decision:** Keep app static, no database or authentication.

**Rationale:**
- Simplicity: no server infrastructure, no secrets management
- Cost: zero hosting costs (Cloudflare Workers free tier)
- Privacy: user data (lyrics) stays local only
- Speed: no API latency

**Trade-off:** Can't offer real-time collaboration, cloud sync. (Revisit if demand high.)

---

### Q2 2026: Why React via CDN (No Bundler)?

**Decision:** Load React 18 from CDN, use Babel standalone for JSX transpilation.

**Rationale:**
- Instant iteration: edit JSX, refresh browser (no build step)
- Accessibility: educational codebase (students can read raw code)
- Cost: zero build infrastructure

**Trade-off:** No tree-shaking, slightly larger bundle. (Not a concern for this app size.)

---

### Q2 2026: Why Cloudflare Workers?

**Decision:** Deploy via Cloudflare Workers Assets (Git-connected).

**Rationale:**
- Auto-deploy on push to main
- No CI/CD setup (handled by CF)
- Global CDN included
- Free tier sufficient for current traffic

**Trade-off:** Vendor lock-in (CF proprietary). But portable to Netlify/Vercel if needed.

---

## Future Decision Points

### Phase 3+: Backend?
- **If** song database + user accounts added → lightweight backend needed
- **Options:** Firebase, Supabase, or simple Node.js + PostgreSQL
- **Decision point:** Q3 2026 (during Phase 3 planning)

### Phase 6+: React Native?
- **If** mobile apps demanded → React Native or Flutter
- **Decision point:** Q2 2027 (measure iOS/Android demand first)

### Phase 7+: Monetization?
- **If** significant user base → consider licensing (optional)
- **Always:** Keep free tier with all core features
- **Decision point:** When DAU > 10K

---

## Contact & Ownership

- **Product Owner:** Gerard Nguyen (gerard@replicated.com)
- **Lead Developer:** Gerard Nguyen
- **GitHub:** (project repository)
- **Discussions:** Use GitHub Issues for feature requests + roadmap feedback

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-23 | Gerard Nguyen | Initial roadmap (MVP shipped, future phases outlined) |

**Last updated:** 2026-04-23
