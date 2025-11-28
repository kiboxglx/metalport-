import React from 'react';

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/60 dark:from-gray-950/60 dark:via-transparent dark:to-gray-950/60" />
        </div>
    );
}
