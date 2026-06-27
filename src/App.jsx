import { lazy, Suspense } from 'react';
import { TacticsBoard } from './board';
import { DEFAULT_SKIN } from './default-skin';
import { getTeam, DEFAULT_TEAM_SLUG, isAdminFor } from './data/store';
import { navigate, useAppRoute } from './navigation/appRoute';
import { RouteErrorBoundary } from './ui/RouteErrorBoundary';

const AdminPage = lazy(() =>
  import('./admin/AdminPage').then((m) => ({ default: m.AdminPage })),
);
const QuizFlow = lazy(() =>
  import('./prototype/dyt/QuizFlow').then((m) => ({ default: m.QuizFlow })),
);

function RouteLoading() {
  const T = DEFAULT_SKIN;
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bg, color: T.text, fontFamily: T.font,
    }}>
      <p style={{ fontSize: 14, opacity: 0.6 }}>Loading…</p>
    </div>
  );
}

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
          onClick={() => navigate(slug ? { team: slug } : {})}
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
  const route = useAppRoute();

  let content;
  if (route.screen === 'admin') {
    const adminSlug = route.admin;
    if (!isAdminFor(adminSlug)) {
      content = <AccessDenied slug={adminSlug} />;
    } else {
      content = (
        <Suspense fallback={<RouteLoading />}>
          <AdminPage team={getTeam(adminSlug)} />
        </Suspense>
      );
    }
  } else {
    const team = getTeam(route.team || DEFAULT_TEAM_SLUG);
    if (route.screen === 'quiz') {
      content = (
        <Suspense fallback={<RouteLoading />}>
          <QuizFlow team={team} />
        </Suspense>
      );
    } else {
      content = <TacticsBoard team={team} />;
    }
  }

  return <RouteErrorBoundary>{content}</RouteErrorBoundary>;
}
