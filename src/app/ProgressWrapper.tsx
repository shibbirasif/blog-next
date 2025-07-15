'use client';

import { ProgressProvider } from '@bprogress/next/app';

export default function ProgressWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ProgressProvider
            height="4px"
            color="#6e5bf4"
            options={{ showSpinner: false }}
            shallowRouting
        >
            {children}
        </ProgressProvider>
    );
};
