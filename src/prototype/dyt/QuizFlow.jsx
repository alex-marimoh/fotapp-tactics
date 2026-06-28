/*
 * "Squad quiz": deck keep/drop flow as intro → play → result.
 * Reachable from the board via ?quiz=squad.
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../default-skin';
import { SwipeDeck } from './SwipeDeck';
import { createQuizModel, archetypeOf, fmtM, fmtSalaryYear } from './data';
import { getTeam, DEFAULT_TEAM_SLUG, saveQuizResult, listQuizResults } from '../../data/store';
import { navigate } from '../../navigation/appRoute';
import { AccountChip } from '../../auth/AccountChip';
import { decidedCount } from './quiz-shared-utils';
import { withA } from '../../lib/format';
import { primaryBtn, ghostBtn } from '../../ui/styles';

// ---- shared bits ----------------------------------------------------------
function Wordmark({ T }) {
  return (
    <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-.02em', fontFamily: T.display }}>
      <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
    </span>
  );
}
const quizPrimaryBtn = (T) => primaryBtn(T, {
  padding: '13px 28px', fontSize: 15, boxShadow: '0 8px 24px rgba(20,99,255,.35)',
});
const quizGhostBtn = (T) => ghostBtn(T, { padding: '13px 22px', fontWeight: 800, fontSize: 14 });

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
      <button onClick={onStart} style={{ ...quizPrimaryBtn(T), marginTop: 8, padding: '15px 34px', fontSize: 16 }}>Start the quiz →</button>
      {last && (
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.65 }}>
          Last time: <b style={{ opacity: 1 }}>{last.archetype}</b> · war chest {fmtM(last.warChest)} · {last.sellCount} sold
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Setup — choose deck order before play
// ===========================================================================
function FormationIcon() {
  const dot = (cx, cy, fill) => (
    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill={fill} />
  );
  return (
    <svg viewBox="0 0 68 88" width="112" height="112" aria-hidden="true">
      <rect x="3" y="3" width="62" height="82" rx="5" fill="#2f9249" stroke="rgba(255,255,255,.45)" strokeWidth="1.2" />
      <line x1="3" y1="44" x2="65" y2="44" stroke="rgba(255,255,255,.28)" strokeWidth="1" />
      <circle cx="34" cy="44" r="7" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1" />
      {dot(34, 78, '#fff')}
      {dot(12, 64, '#fff')}
      {dot(26, 64, '#fff')}
      {dot(42, 64, '#fff')}
      {dot(56, 64, '#fff')}
      {dot(22, 48, '#1463ff')}
      {dot(34, 48, '#1463ff')}
      {dot(46, 48, '#1463ff')}
      {dot(16, 22, '#ff5a1f')}
      {dot(34, 18, '#ff5a1f')}
      {dot(52, 22, '#ff5a1f')}
    </svg>
  );
}

function DiceIcon() {
  const pip = (x, y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.8" fill="#141a22" />;
  const die = (x, y, rot, pips) => (
    <g key={`${x}-${y}`} transform={`rotate(${rot} ${x + 18} ${y + 18})`}>
      <rect x={x} y={y} width="36" height="36" rx="7" fill="#f4f6fa" stroke="rgba(20,26,34,.15)" strokeWidth="1.2" />
      {pips.map(([px, py]) => pip(x + px, y + py))}
    </g>
  );
  return (
    <svg viewBox="0 0 88 88" width="112" height="112" aria-hidden="true">
      {die(6, 22, -14, [[9, 9], [27, 27], [18, 18], [9, 27], [27, 9]])}
      {die(38, 8, 12, [[9, 9], [27, 27], [18, 18]])}
    </svg>
  );
}

function OrderModeCard({ T, title, onClick, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" onClick={onClick} aria-label={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
      <div style={{
        width: 'min(240px, 42vw)', minWidth: 168,
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        background: 'linear-gradient(165deg, #1c2433 0%, #0f141c 55%, #1a1028 100%)',
        border: `2px solid ${withA(T.accent2, 0.5)}`,
        boxShadow: hover
          ? `0 32px 64px rgba(0,0,0,.5), 0 0 0 2px ${withA(T.accent, 0.35)}`
          : `0 28px 56px rgba(0,0,0,.45), 0 0 0 1px ${withA(T.accent, 0.15)}`,
        color: '#f4f6fa',
        transform: hover ? 'translateY(-4px)' : undefined,
        transition: 'transform .15s, box-shadow .15s',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -30, width: 120, height: 120,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
          transform: 'rotate(25deg)', opacity: 0.85,
        }} />
        <div style={{ position: 'relative', padding: '14px 16px 18px' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: T.textMutedOnDark }}>DECK MODE</span>
          <div style={{
            margin: '16px auto 12px', width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle at 30% 25%, ${withA(T.accent, 0.35)}, #0a0e14)`,
            border: `3px solid ${T.accent2}`, display: 'grid', placeItems: 'center',
          }}>
            {children}
          </div>
          <h2 style={{
            margin: 0, textAlign: 'center', fontFamily: T.display,
            fontSize: 22, fontWeight: 800, letterSpacing: '-.02em',
          }}>{title}</h2>
        </div>
      </div>
    </button>
  );
}

function OrderSetup({ T, onChoose, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.accent }}>Before we start</span>
      <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.1 }}>How should we deal the cards?</h1>
      <p style={{ margin: 0, maxWidth: 460, fontSize: 15, lineHeight: 1.5, opacity: 0.7 }}>
        Pick the order you&apos;ll see players in.
      </p>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 4 }}>
        <OrderModeCard T={T} title="Positional" onClick={() => onChoose('position')}>
          <FormationIcon />
        </OrderModeCard>
        <OrderModeCard T={T} title="Random" onClick={() => onChoose('random')}>
          <DiceIcon />
        </OrderModeCard>
      </div>
      <button type="button" onClick={onBack}
        style={{ marginTop: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 13, fontWeight: 700, color: T.textMuted, textDecoration: 'underline' }}>
        ← Back
      </button>
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
          <button type="button" onClick={onFinish} style={{ ...quizPrimaryBtn(T), padding: '14px 32px', fontSize: 15, boxShadow: '0 12px 40px rgba(20,99,255,.4)' }}>
            See your result →
          </button>
        </div>
      )}
      {!done && started && (
        <button type="button" onClick={onFinish}
          style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 20, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: T.textMuted, textDecoration: 'underline' }}>
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
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: T.textMuted }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || T.text, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function CallRow({ T, call }) {
  const { player, verdict, crowd, crowdPct, agrees } = call;
  const youColor = verdict === 'keep' || verdict === 'renew' ? T.solid : T.gap;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${T.hair}` }}>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, minWidth: 0 }}>{player.name}
        <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 400 }}> {player.pos[0]}</span>
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
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 2 }}>{contrarian.length ? 'Where you went against the grain:' : 'Your boldest calls:'}</div>
          {showCalls.map((c) => <CallRow key={c.player.num} T={T} call={c} />)}
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 10 }}>Crowd numbers are illustrative — this is where real fan votes plug in.</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
          <button onClick={onApply} style={quizPrimaryBtn(T)}>Apply to my board →</button>
          <button onClick={onRestart} style={quizGhostBtn(T)}>Start over</button>
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
  const [orderMode, setOrderMode] = React.useState(/** @type {'position'|'random'|null} */ (null));
  const model = React.useMemo(
    () => createQuizModel(team, orderMode ?? 'position'),
    [team, orderMode],
  );
  const [phase, setPhase] = React.useState('intro'); // 'intro' | 'setup' | 'play' | 'result'
  const [decisions, setDecisions] = React.useState({});
  const [idx, setIdx] = React.useState(0);
  const decide = React.useCallback((num, patch) => setDecisions((d) => ({ ...d, [num]: { ...d[num], ...patch } })), []);
  const summary = React.useMemo(() => model.summaryOf(decisions), [model, decisions]);

  const restart = () => { setDecisions({}); setIdx(0); setOrderMode(null); setPhase('intro'); };
  const goBoard = () => navigate({ team: team.slug });

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
        <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>Squad quiz · {team.name}</span>
        {phase === 'play' && (
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: T.textMuted, fontVariantNumeric: 'tabular-nums' }}>
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
        {phase === 'intro' && <Intro T={T} total={summary.total} last={lastResult} onStart={() => setPhase('setup')} />}
        {phase === 'setup' && (
          <OrderSetup
            T={T}
            onBack={() => setPhase('intro')}
            onChoose={(mode) => { setOrderMode(mode); setIdx(0); setPhase('play'); }}
          />
        )}
        {phase === 'play' && <Play T={T} model={model} decisions={decisions} decide={decide} idx={idx} setIdx={setIdx} summary={summary} onFinish={() => setPhase('result')} />}
        {phase === 'result' && <Result T={T} model={model} decisions={decisions} summary={summary} onApply={goBoard} onRestart={restart} />}
      </div>
    </div>
  );
}
