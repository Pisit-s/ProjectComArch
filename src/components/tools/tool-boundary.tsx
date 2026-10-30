'use client';

import { TriangleAlert } from 'lucide-react';
import { Component, type ReactNode } from 'react';

/** One broken tool never takes the whole page down (PLAN.md 7.1). */
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
          <span>เครื่องมือนี้มีปัญหา ลองรีเฟรชหน้า</span>
        </div>
      );
    }
    return this.props.children;
  }
}
