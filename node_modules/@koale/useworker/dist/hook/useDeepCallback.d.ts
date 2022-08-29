import React from 'react';
export declare const useDeepCallback: <T extends (...args: any[]) => any>(callback: T, dependencies: React.DependencyList) => T;
