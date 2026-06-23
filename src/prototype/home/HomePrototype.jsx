/**
 * PROTOTYPE — Home page UI exploration
 * Five radically different ways to visualize a real-team roster for everyday users.
 */
import { PrototypeSwitcher } from '../PrototypeSwitcher';
import { useSearchParam } from '../useSearchParam';
import { VariantA, VARIANT_NAME as nameA } from './VariantA-MatchDay';
import { VariantB, VARIANT_NAME as nameB } from './VariantB-Inbox';
import { VariantC, VARIANT_NAME as nameC } from './VariantC-Timeline';
import { VariantD, VARIANT_NAME as nameD } from './VariantD-Feed';
import { VariantE, VARIANT_NAME as nameE } from './VariantE-Poster';

const VARIANTS = ['A', 'B', 'C', 'D', 'E'];
const LABELS = { A: nameA, B: nameB, C: nameC, D: nameD, E: nameE };

const RENDERERS = { A: VariantA, B: VariantB, C: VariantC, D: VariantD, E: VariantE };

export function HomePrototype() {
  const [variant, setVariant] = useSearchParam('variant', 'A');
  const key = VARIANTS.includes(variant) ? variant : 'A';
  const View = RENDERERS[key];

  return (
    <>
      <View />
      <PrototypeSwitcher variants={VARIANTS} labels={LABELS} current={key} onChange={setVariant} />
    </>
  );
}
