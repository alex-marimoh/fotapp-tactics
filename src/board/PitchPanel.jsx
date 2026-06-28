import React from 'react';
import { FORMATION_NAMES, effectiveStarterNum, healthOf, HEALTH_LABEL } from '../squad-data';
import { withA } from '../lib/format';
import { TeamPicker } from '../ui/TeamPicker';
import { useDismissOnEscape } from '../ui/a11y';
import { CompChip } from './CompChip';
import { InfoLegend } from './InfoLegend';
import { PitchSvg } from './PitchSvg';
import { useT, hcOf } from './theme';

export const PitchPanel = React.memo(function PitchPanel({
  phone,
  wide,
  pitchBox,
  pitchWrapRef,
  formation,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  formationTriggerRef,
  formationListId,
  onChooseFormation,
  team,
  comp,
  slots,
  depth,
  leaving,
  selected,
  allByNum,
  onSelectSlot,
}) {
  const T = useT();
  const hc = hcOf(T);
  useDismissOnEscape(menuOpen, onCloseMenu, formationTriggerRef);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column',
      padding: phone ? 12 : 16, gap: 12, minHeight: 0, minWidth: 0,
      background: T.flat ? T.pitch[1] : `radial-gradient(120% 90% at 50% 0%, ${T.pitch[0]} 0%, ${T.pitch[1]} 55%, ${T.pitch[2]} 100%)` }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <button
            ref={formationTriggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? formationListId : undefined}
            onClick={onToggleMenu}
            style={{ padding: '8px 16px', borderRadius: T.pill, border: 'none',
              background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, color: T.onAccent, fontWeight: 800,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {formation} <span aria-hidden="true">▾</span>
          </button>
          {menuOpen && (
            <>
              <div
                role="presentation"
                onClick={onCloseMenu}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div
                id={formationListId}
                role="listbox"
                aria-label="Choose formation"
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
                  background: T.surface, border: `1px solid ${T.hair2}`, borderRadius: T.radius,
                  padding: 4, minWidth: 150, boxShadow: '0 12px 32px rgba(0,0,0,.5)',
                  maxHeight: 320, overflowY: 'auto' }}
              >
                {FORMATION_NAMES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    aria-selected={name === formation}
                    onClick={() => onChooseFormation(name)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                      background: name === formation ? withA(T.accent, 0.18) : 'transparent',
                      color: T.text, padding: '9px 12px', borderRadius: Math.max(0, T.radius - 5), fontSize: 13,
                      fontWeight: name === formation ? 800 : 500, fontFamily: 'inherit' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <TeamPicker T={T} team={team} param="team" onPitch />
        <div style={{ flex: 1 }} />
        <CompChip label="Non-EU" c={comp.noneu} />
        <CompChip label="Homegrown" c={comp.home} />
      </div>

      <div ref={pitchWrapRef} style={{ flex: phone ? 'none' : 1, height: phone ? '58vh' : undefined,
        minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: pitchBox.w || '100%', height: pitchBox.h || '100%' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} aria-hidden="true" style={{ position: 'absolute', background: i % 2 ? T.soft : 'transparent',
              ...(wide
                ? { top: 0, bottom: 0, left: `${(i / 9) * 100}%`, width: `${100 / 9}%` }
                : { left: 0, right: 0, top: `${(i / 9) * 100}%`, height: `${100 / 9}%` }) }} />
          ))}
          <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true"><PitchSvg horizontal={wide} /></div>

          {slots.map((slot) => {
            const h = healthOf(depth, slot.id, leaving);
            const pn = effectiveStarterNum(depth, slot.id, leaving);
            const p = pn && allByNum[pn];
            const isSel = selected === slot.id;
            const nx = wide ? 100 - slot.top : slot.left;
            const ny = wide ? slot.left : slot.top;
            const sz = wide ? 46 : 42;
            const markerLabel = p
              ? `${slot.label}, ${p.name}, ${HEALTH_LABEL[h]}`
              : `${slot.label}, ${slot.label} gap, ${HEALTH_LABEL[h]}`;
            return (
              <button key={slot.id} type="button" onClick={() => onSelectSlot(slot.id)}
                aria-label={markerLabel} aria-current={isSel ? 'true' : undefined}
                style={{ position: 'absolute', left: `${nx}%`, top: `${ny}%`,
                  transform: `translate(-50%,-50%) scale(${isSel ? 1.08 : 1})`, transition: 'transform .15s',
                  cursor: 'pointer', textAlign: 'center', zIndex: isSel ? 6 : 3,
                  border: 'none', background: 'transparent', padding: 0, fontFamily: 'inherit', color: 'inherit' }}>
                <div aria-hidden="true" style={{ width: sz, height: sz, borderRadius: '50%', margin: '0 auto',
                  background: withA(T.bg, 0.8), border: `2.5px solid ${hc[h]}`,
                  boxShadow: T.glow ? `0 0 14px ${hc[h]}66, 0 4px 10px rgba(0,0,0,.45)` : 'none',
                  display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: wide ? 15 : 14 }}>{p ? p.num : '!'}</span>
                </div>
                <div aria-hidden="true" style={{ marginTop: 5, display: 'inline-block', padding: '2px 8px', borderRadius: T.pill,
                  background: withA(T.bg, 0.74), fontSize: wide ? 12 : 11, fontWeight: 700,
                  color: p ? T.text : hc.gap, whiteSpace: 'nowrap' }}>
                  {p ? p.name : `${slot.label} gap`}
                </div>
              </button>
            );
          })}

        </div>
      </div>
      <InfoLegend />
    </div>
  );
});
