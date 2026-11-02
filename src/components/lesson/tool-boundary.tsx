'use client';

import { TriangleAlert } from 'lucide-react';
import { Component, type ReactNode } from 'react';
import { TOOL_ERROR } from '@/content/lesson/copy';

/** One broken tool never takes the whole page down (docs/plans/stage1-floating-point.md 7.1). */
export class ToolBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="alert alert-error">
          <TriangleAlert className="h-5 w-5" aria-hidden />
          <span>{TOOL_ERROR}</span>
        </div>
      );
    }
    return this.props.children;
  }
}
