/*
 * PROTOTYPE — "Squad quiz": variant A (the swipe deck) wrapped as a 3-phase quiz.
 *   intro → play (SwipeDeck) → result
 * The quiz framing turns the solo keep/sell deck into an inviting front door and a
 * shareable payoff: a manager archetype, the war chest / gaps, and a you-vs-crowd
 * compare (previews product feature #4). One shared decision state throughout.
 * Delete this file + the App.jsx branch to remove.
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../board';
import { SwipeDeck } from './variants';
import { summaryOf, archetypeOf, crowdCallsOf, fmtM } from './data';

// ---- shared bits ----------------------------------------------------------
function Wordmark({ T }) {
  return (
    <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-.02em', fontFamily: T.display }}>
      <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
    </span>
  );
}
function Chip({ T, label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: T.pill, background: T.soft, border: `1px solid ${T.hair2}` }}>
      <span style={{ fontSize: 10, opacity: 0.6 }}>{label}</span>
      <b style={{ fontSize: 12, color }}>{value}</b>
    </span>
  );
}
const primaryBtn = (T) => ({ padding: '13px 28px', borderRadius: T.pill, border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', fontWeight: 800, fontSize: 15, color: T.onAccent,
  background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, boxShadow: '0 8px 24px rgba(20,99,255,.35)' });
const ghostBtn = (T) => ({ padding: '13px 22px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, cursor: 'pointer',
  fontFamily: 'inherit', fontWeight: 800, fontSize: 14, color: T.text, background: T.soft });

// ===========================================================================
// Intro — the front door
// ===========================================================================
function Intro({ T, total, onStart }) {
  const step = (glyph, glyphColor, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: T.pill, background: T.soft, border: `1px solid ${T.hair2}`, fontSize: 13, fontWeight: 700 }}>
      <span style={{ color: glyphColor, fontWeight: 800 }}>{glyph}</span>{label}
    </span>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24, textAlign: 'center' }}>
      <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.accent }}>The squad quiz</span>
      <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>Keep or sell?</h1>
      <p style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.5, opacity: 0.7 }}>
        You're the sporting director. Go through all {total} players one at a time —
        <b style={{ opacity: 1 }}> up to keep, down to sell</b>. We'll tally your war chest
        and the gaps you leave behind.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
        {step(`${total}`, T.accent, 'players')}
        {step('↑', T.solid, 'Keep')}
        {step('↓', T.gap, 'Sell')}
      </div>
      <button onClick={onStart} style={{ ...primaryBtn(T), marginTop: 8, padding: '15px 34px', fontSize: 16 }}>Start the quiz →</button>
    </div>
  );
}

// ===========================================================================
// Play — the swipe deck (variant A), with a finish bar
// ===========================================================================
function Play({ T, decisions, decide, idx, setIdx, summary, onFinish }) {
  const done = summary.decided === summary.total;
  const started = summary.decided > 0;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SwipeDeck T={T} decisions={decisions} decide={decide} idx={idx} setIdx={setIdx} />
      </div>
      {started && (
        <div style={{ flexShrink: 0, padding: '12px 16px', borderTop: `1px solid ${T.hair}`, display: 'flex', justifyContent: 'center', background: T.bg }}>
          {done ? (
            <button onClick={onFinish} style={{ ...primaryBtn(T), padding: '12px 28px', fontSize: 14 }}>See your result →</button>
          ) : (
            <button onClick={onFinish} style={{ padding: '10px 18px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, color: T.text, background: T.soft }}>
              End early — see result ({summary.decided}/{summary.total}) ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Result — the payoff
// ===========================================================================
function Stat({ T, label, value, color, sub }) {
  return (
    <div style={{ flex: 1, minWidth: 130, padding: '14px 16px', background: T.panel, border: `1px solid ${T.hair}`, borderRadius: T.radius }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.55 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || T.text, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function CallRow({ T, call }) {
  const { player, verdict, crowd, crowdPct, agrees } = call;
  const youColor = verdict === 'keep' ? T.solid : T.gap;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${T.hair}` }}>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, minWidth: 0 }}>{player.name}
        <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 400 }}> {player.pos[0]}</span>
      </span>
      <span style={{ fontSize: 12, fontWeight: 800, color: youColor, width: 62, textAlign: 'right' }}>You {verdict}</span>
      <div style={{ width: 132 }}>
        <div style={{ height: 6, borderRadius: 999, background: T.soft, overflow: 'hidden' }}>
          <div style={{ width: `${crowdPct}%`, height: '100%', background: agrees ? T.solid : T.thin }} />
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>{crowdPct}% of fans would {crowd}</div>
      </div>
    </div>
  );
}
function Result({ T, decisions, summary, onApply, onRestart }) {
  const arch = archetypeOf(summary);
  const calls = crowdCallsOf(decisions);
  const agreed = calls.filter((c) => c.agrees).length;
  const contrarian = calls.filter((c) => !c.agrees);
  const showCalls = (contrarian.length ? contrarian : calls).slice(0, 3);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '28px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: T.display, fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.accent }}>Your verdict</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: T.display, fontSize: 'clamp(34px,6vw,56px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>{arch.title}</h1>
          <p style={{ margin: '10px auto 0', maxWidth: 460, fontSize: 15, lineHeight: 1.5, opacity: 0.7 }}>{arch.blurb}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Stat T={T} label="War chest" value={fmtM(summary.warChest)} color={T.solid} sub={`${summary.wagesFreed}k/wk wages freed`} />
          <Stat T={T} label="Sold" value={String(summary.sellCount)} sub={`${summary.keepCount} kept`} />
          <Stat T={T} label="Squad gaps" value={summary.gaps.length ? String(summary.gaps.length) : 'None'} color={summary.gaps.length ? T.gap : T.solid} sub={summary.gaps.length ? summary.gaps.join(' · ') : 'Squad still stands up'} />
        </div>

        <div style={{ padding: '16px 18px', background: T.panel, border: `1px solid ${T.hair}`, borderRadius: T.radius }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: T.display, fontSize: 16, fontWeight: 800 }}>You vs. the crowd</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.6 }}>agreed on {agreed}/{calls.length}</span>
          </div>
          <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 2 }}>{contrarian.length ? 'Where you went against the grain:' : 'Your boldest calls:'}</div>
          {showCalls.map((c) => <CallRow key={c.player.num} T={T} call={c} />)}
          <div style={{ fontSize: 11, opacity: 0.4, marginTop: 10 }}>Crowd numbers are illustrative — this is where real fan votes plug in.</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
          <button onClick={onApply} style={primaryBtn(T)}>Apply to my board →</button>
          <button onClick={onRestart} style={ghostBtn(T)}>Start over</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// Host — phase machine + ribbon
// ===========================================================================
export function QuizFlow() {
  const T = DEFAULT_SKIN;
  const [phase, setPhase] = React.useState('intro'); // 'intro' | 'play' | 'result'
  const [decisions, setDecisions] = React.useState({});
  const [idx, setIdx] = React.useState(0);
  const decide = React.useCallback((num, patch) => setDecisions((d) => ({ ...d, [num]: { ...d[num], ...patch } })), []);
  const summary = React.useMemo(() => summaryOf(decisions), [decisions]);

  const restart = () => { setDecisions({}); setIdx(0); setPhase('intro'); };
  const apply = () => { window.location.search = '?board=tactics'; };

  return (
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', flexShrink: 0,
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`, borderBottom: `1px solid ${T.hair}` }}>
        <Wordmark T={T} />
        <span style={{ fontSize: 13, opacity: 0.55, fontWeight: 600 }}>Squad quiz</span>
        {phase === 'play' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Chip T={T} label="War chest" value={fmtM(summary.warChest)} color={T.solid} />
            <Chip T={T} label="Sell" value={String(summary.sellCount)} color={T.gap} />
            <Chip T={T} label="Gaps" value={summary.gaps.length ? summary.gaps.join(' ') : '0'} color={summary.gaps.length ? T.gap : T.text} />
            <Chip T={T} label="Decided" value={`${summary.decided}/${summary.total}`} color={T.accent} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {phase === 'intro' && <Intro T={T} total={summary.total} onStart={() => { setIdx(0); setPhase('play'); }} />}
        {phase === 'play' && <Play T={T} decisions={decisions} decide={decide} idx={idx} setIdx={setIdx} summary={summary} onFinish={() => setPhase('result')} />}
        {phase === 'result' && <Result T={T} decisions={decisions} summary={summary} onApply={apply} onRestart={restart} />}
      </div>
    </div>
  );
}
