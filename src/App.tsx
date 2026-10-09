import { Component, useCallback, useState, type ReactNode } from 'react';
import { Home } from './ui/Home';
import { LessonView } from './ui/LessonView';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>The 3D scene failed to load. Please try reloading the page.</p>
          <p style={{ fontSize: 12, opacity: 0.6 }}>{String(this.state.error.message)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const open = useCallback((id: string) => {
    setLessonId(id);
    window.scrollTo(0, 0);
  }, []);
  const back = useCallback(() => setLessonId(null), []);

  return (
    <ErrorBoundary>
      {lessonId ? (
        <LessonView key={lessonId} lessonId={lessonId} onBack={back} />
      ) : (
        <Home onOpen={open} />
      )}
    </ErrorBoundary>
  );
}
