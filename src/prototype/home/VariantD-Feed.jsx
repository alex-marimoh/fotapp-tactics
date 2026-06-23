/**
 * PROTOTYPE D — Squad Feed
 * News-first: stories about your players; tap a name to see their depth chart.
 */
import { useState } from 'react';
import { NEWS, SQUAD } from '../../shared';
import { TEAM, getPositionRows, getPlayerByNum } from './home-data';
import { injectHomeStyles, PlayerDetailSheet, TAG_COLOR } from './home-shared';

export const VARIANT_NAME = 'Squad Feed';

const MENTIONS = buildMentions();

export function VariantD() {
  const [selectedNum, setSelectedNum] = useState(null);
  injectHomeStyles();
  const rows = getPositionRows();
  const player = selectedNum ? getPlayerByNum(selectedNum) : null;
  const row = player ? rows.find((r) => r.starter.num === player.num || r.backups.some((b) => b.num === player.num)) : null;
  const relatedNews = player
    ? NEWS.filter((n) => mentionsPlayer(n, player))
    : [];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <header style={{
        padding: '24px 24px 16px', maxWidth: 560, margin: '0 auto',
        borderBottom: '1px solid #eee',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#0040ff', letterSpacing: '0.06em' }}>YOUR SQUAD</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#0a1124' }}>{TEAM.name}</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6c7384', lineHeight: 1.5 }}>
          What&apos;s happening with your players — tap a name to see who backs them up.
        </p>
      </header>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '8px 16px 100px' }}>
        {NEWS.map((item, i) => (
          <FeedCard
            key={item.head}
            item={item}
            mentions={MENTIONS[item.head] ?? []}
            onPlayerClick={setSelectedNum}
            isFirst={i === 0}
          />
        ))}

        <div style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e3e6eb' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6c7384', letterSpacing: '0.06em', marginBottom: 12 }}>QUICK PICK — TAP A PLAYER</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SQUAD.filter((p) => p.num <= 15).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedNum(p.num)}
                style={{
                  padding: '6px 12px', borderRadius: 20, border: '1px solid #e3e6eb',
                  background: selectedNum === p.num ? '#0040ff' : '#fff',
                  color: selectedNum === p.num ? '#fff' : '#0a1124',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {p.name.split(' ').pop()} <span style={{ opacity: 0.6 }}>· {p.pos}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {player && (
        <PlayerDetailSheet
          player={player}
          row={row}
          news={relatedNews.length > 0 ? relatedNews : NEWS.slice(0, 2)}
          onClose={() => setSelectedNum(null)}
        />
      )}
    </div>
  );
}

function FeedCard({ item, mentions, onPlayerClick, isFirst }) {
  const when = item.when ?? item.height ?? '';
  return (
    <article style={{
      padding: '20px 8px', borderBottom: '1px solid #eee',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: TAG_COLOR[item.tag] ?? '#6c7384',
          background: `${TAG_COLOR[item.tag] ?? '#6c7384'}15`,
          padding: '3px 8px', borderRadius: 4,
        }}>{item.tag}</span>
        <span style={{ fontSize: 11, color: '#9aa0ad' }}>{when}</span>
      </div>
      <h2 style={{
        margin: 0, fontSize: isFirst ? 20 : 16, fontWeight: 700, lineHeight: 1.3,
        letterSpacing: '-0.02em', color: '#0a1124',
      }}>{item.head}</h2>
      <p style={{ margin: '10px 0 0', fontSize: 14, color: '#3b4254', lineHeight: 1.55 }}>{item.body}</p>
      {mentions.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {mentions.map((m) => (
            <button
              key={m.num}
              type="button"
              onClick={() => onPlayerClick(m.num)}
              style={{
                padding: '5px 10px', borderRadius: 6, border: 'none',
                background: '#dde4ff', color: '#0040ff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {m.name} → see depth
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function mentionsPlayer(n, player) {
  const last = player.name.split(' ').pop().toLowerCase();
  return n.head.toLowerCase().includes(last) || n.body.toLowerCase().includes(last);
}

function buildMentions() {
  const map = {};
  NEWS.forEach((n) => {
    const found = SQUAD.filter((p) => mentionsPlayer(n, p));
    if (found.length > 0) map[n.head] = found.map((p) => ({ num: p.num, name: p.name.split(' ').pop() }));
  });
  return map;
}
