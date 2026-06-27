import { TacticsBoard } from './board';
import { DEFAULT_SKIN } from './default-skin';
import { QuizFlow } from './prototype/dyt/QuizFlow';
import { AdminPage } from './admin/AdminPage';
import { getTeam, DEFAULT_TEAM_SLUG, isAdminFor } from './data/store';

function AccessDenied({ slug }) {
  const T = DEFAULT_SKIN;
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: T.bg, color: T.text, fontFamily: T.font,
    }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <h1 style={{ fontFamily: T.display, fontSize: 24, margin: '0 0 8px' }}>Admin access required</h1>
        <p style={{ fontSize: 14, opacity: 0.65, margin: '0 0 16px' }}>
          You don&apos;t have permission to manage {slug ? getTeam(slug).name : 'this team'}.
        </p>
        <button
          type="button"
          onClick={() => { window.location.search = slug ? `?team=${slug}` : ''; }}
          style={{
            padding: '9px 18px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13, color: T.text, background: T.soft,
          }}
        >
          ← Back to board
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const adminSlug = params.get('admin');
  if (adminSlug) {
    if (!isAdminFor(adminSlug)) return <AccessDenied slug={adminSlug} />;
    return <AdminPage team={getTeam(adminSlug)} />;
  }

  const team = getTeam(params.get('team') || DEFAULT_TEAM_SLUG);
  if (params.get('quiz') === 'squad') return <QuizFlow team={team} />;
  return <TacticsBoard team={team} />;
}
