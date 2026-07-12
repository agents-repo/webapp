import { Component, type ErrorInfo, type ReactNode } from 'react'
import RouteErrorFallback from './RouteErrorFallback'

interface LazyRouteErrorBoundaryProps {
  readonly children: ReactNode
}

interface LazyRouteErrorBoundaryState {
  hasError: boolean
  retryKey: number
}

class LazyRouteErrorBoundary extends Component<
  LazyRouteErrorBoundaryProps,
  LazyRouteErrorBoundaryState
> {
  state: LazyRouteErrorBoundaryState = {
    hasError: false,
    retryKey: 0,
  }

  static getDerivedStateFromError(): Pick<LazyRouteErrorBoundaryState, 'hasError'> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Lazy route failed to render:', error, errorInfo)
  }

  private handleRetry = (): void => {
    this.setState((currentState) => ({
      hasError: false,
      retryKey: currentState.retryKey + 1,
    }))
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <RouteErrorFallback onRetry={this.handleRetry} />
    }

    return <div key={this.state.retryKey}>{this.props.children}</div>
  }
}

export default LazyRouteErrorBoundary
