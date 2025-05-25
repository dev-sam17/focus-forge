import 'react';

declare module 'react' {
    interface CSSProperties {
        '-webkit-app-region'?: 'drag' | 'no-drag';
    }
}
