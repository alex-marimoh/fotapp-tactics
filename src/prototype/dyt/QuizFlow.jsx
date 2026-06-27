/*
 * "Squad quiz": deck keep/drop flow as intro → play → result.
 * Reachable from the board via ?quiz=squad.
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../default-skin';
import { SwipeDeck } from './SwipeDeck';
import { createQuizModel, archetypeOf, fmtM, fmtSalaryYear } from './data';
import { getTeam, DEFAULT_TEAM_SLUG, saveQuizResult, listQuizResults } from '../../data/store';
import { AccountChip } from '../../auth/AccountChip';
import { decidedCount } from './quiz-shared-utils';

// ---- shared bits ----------------------------------------------------------
function Wordmark({ T }) {
  return (
    <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-.02em', fontFamily: T.display }}>
      <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
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
function Intro({ T, total, onStart, last }) {
  const step = (glyph, glyphColor, label) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: T.pill, background: T.soft, border: `1px solid ${T.hair2}`, fontSize: 13, fontWeight: 700 }}>
      <span style={{ color: glyphColor, fontWeight: 800 }}>{glyph}</span>{label}
    </span>
  );
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24, textAlign: 'center' }}>
      <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.accent }}>The squad quiz</span>
      <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>Keep or drop?</h1>
      <p style={{ margin: 0, maxWidth: 480, fontSize: 16, lineHeight: 1.5, opacity: 0.7 }}>
        One player at a time — their name and your call.
        <b style={{ opacity: 1 }}> Keep or drop</b>; expiring deals are
        <b style={{ opacity: 1 }}> renew or release</b>.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
        {step(`${total}`, T.accent, 'players')}
        {step('♥', T.solid, 'Keep')}
        {step('✕', T.gap, 'Drop')}
      </div>
      <button onClick={onStart} style={{ ...primaryBtn(T), marginTop: 8, padding: '15px 34px', fontSize: 16 }}>Start the quiz →</button>
      {last && (
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.65 }}>
          Last time: <b style={{ opacity: 1 }}>{last.archetype}</b> · war chest {fmtM(last.warChest)} · {last.sellCount} sold
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Play — deck
// ===========================================================================
function Play({ T, model, decisions, decide, idx, setIdx, summary, onFinish }) {
  const done = summary.decided === summary.total;
  const started = decidedCount(decisions) > 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <SwipeDeck T={T} model={model} decisions={decisions} decide={decide} idx={idx} setIdx={setIdx} />
      </div>
      {done && (
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
          <button type="button" onClick={onFinish} style={{ ...primaryBtn(T), padding: '14px 32px', fontSize: 15, boxShadow: '0 12px 40px rgba(20,99,255,.4)' }}>
            See your result →
          </button>
        </div>
      )}
      {!done && started && (
        <button type="button" onClick={onFinish}
          style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 20, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: T.text, opacity: 0.4, textDecoration: 'underline' }}>
          End early
        </button>
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
  const youColor = verdict === 'keep' || verdict === 'renew' ? T.solid : T.gap;
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
function Result({ T, model, decisions, summary, onApply, onRestart }) {
  const arch = archetypeOf(summary);
  const calls = model.crowdCallsOf(decisions);
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
          <Stat T={T} label="War chest" value={fmtM(summary.warChest)} color={T.solid} sub={`${fmtSalaryYear(summary.wagesFreed)} wages freed`} />
          <Stat T={T} label="Dropped" value={String(summary.sellCount)} sub={summary.releaseCount ? `${summary.releaseCount} released` : `${summary.keepCount} kept`} />
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
export function QuizFlow({ team = getTeam(DEFAULT_TEAM_SLUG) }) {
  const T = DEFAULT_SKIN;
  const model = React.useMemo(() => createQuizModel(team), [team]);
  const [phase, setPhase] = React.useState('intro'); // 'intro' | 'play' | 'result'
  const [decisions, setDecisions] = React.useState({});
  const [idx, setIdx] = React.useState(0);
  const decide = React.useCallback((num, patch) => setDecisions((d) => ({ ...d, [num]: { ...d[num], ...patch } })), []);
  const summary = React.useMemo(() => model.summaryOf(decisions), [model, decisions]);

  const restart = () => { setDecisions({}); setIdx(0); setPhase('intro'); };
  const goBoard = () => { window.location.search = `?team=${team.slug}`; };

  const savedRef = React.useRef(false);
  React.useEffect(() => {
    if (phase !== 'result') { savedRef.current = false; return; }
    if (savedRef.current) return;
    savedRef.current = true;
    const arch = archetypeOf(summary);
    saveQuizResult(team.slug, {
      archetype: arch.title, warChest: summary.warChest, sellCount: summary.sellCount,
      keepCount: summary.keepCount, decided: summary.decided, total: summary.total, gaps: summary.gaps,
    });
  }, [phase, summary, team.slug]);

  const lastResult = phase === 'intro' ? listQuizResults(team.slug)[0] || null : null;

  return (
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', flexShrink: 0,
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`, borderBottom: `1px solid ${T.hair}` }}>
        <button onClick={goBoard} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
          <Wordmark T={T} />
        </button>
        <span style={{ fontSize: 13, opacity: 0.55, fontWeight: 600 }}>Squad quiz · {team.name}</span>
        {phase === 'play' && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, opacity: 0.45, fontVariantNumeric: 'tabular-nums' }}>
            {idx + 1} / {summary.total}
          </span>
        )}
        <div style={{ marginLeft: phase === 'play' ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AccountChip T={T} />
          <button onClick={goBoard} style={{ padding: '7px 14px', borderRadius: T.pill, border: `1px solid ${T.hair2}`,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, color: T.text, background: T.soft }}>
            ← Back to board
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {phase === 'intro' && <Intro T={T} total={summary.total} last={lastResult} onStart={() => { setIdx(0); setPhase('play'); }} />}
        {phase === 'play' && <Play T={T} model={model} decisions={decisions} decide={decide} idx={idx} setIdx={setIdx} summary={summary} onFinish={() => setPhase('result')} />}
        {phase === 'result' && <Result T={T} model={model} decisions={decisions} summary={summary} onApply={goBoard} onRestart={restart} />}
      </div>
    </div>
  );
}
