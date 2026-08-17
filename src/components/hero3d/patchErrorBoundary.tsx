import { Component, type ErrorInfo, type ReactNode } from "react";

type BoundaryProps = {
  onError: () => void;
  children: ReactNode;
};

/** Catches render throws in the DOM tree or the R3F canvas reconciler. */
export class PatchErrorBoundary extends Component<
  BoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
