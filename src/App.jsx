import { TelemetryBoard } from './c-telemetry';
import { FloodlightBoard } from './a-floodlight';
import { ChalkboardBoard } from './b-chalkboard';
import { HomeBoard } from './d-home';
import { HomeLab } from './home-lab';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const board = params.get('board');
  if (board === 'lab') return <HomeLab v={Number(params.get('v')) || 1} />;
  if (board === 'home') return <HomeBoard />;
  if (board === 'floodlight') return <FloodlightBoard />;
  if (board === 'chalkboard') return <ChalkboardBoard />;
  return <TelemetryBoard />;
}
