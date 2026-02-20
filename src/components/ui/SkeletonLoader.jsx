import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const items = Array.from({ length: count });

    const renderSkeleton = (index) => {
        switch (type) {
            case 'card':
                return (
                    <div key={index} className="glass p-6 rounded-3xl animate-pulse space-y-4">
                        <div className="h-6 w-3/4 bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-full bg-white/5 rounded-lg"></div>
                        <div className="h-4 w-5/6 bg-white/5 rounded-lg"></div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="h-8 w-20 bg-white/10 rounded-xl"></div>
                            <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                        </div>
                    </div>
                );
            case 'note':
                return (
                    <div key={index} className="w-full h-48 glass rounded-2xl animate-pulse flex flex-col items-center justify-center p-6 border-white/5">
                        <div className="h-3 w-1/2 bg-white/10 rounded-full mb-4"></div>
                        <div className="h-8 w-3/4 bg-white/5 rounded-lg mb-2"></div>
                        <div className="h-8 w-2/3 bg-white/5 rounded-lg"></div>
                    </div>
                );
            case 'stat':
                return (
                    <div key={index} className="glass p-8 rounded-3xl animate-pulse">
                        <div className="h-4 w-24 bg-white/10 rounded-lg mb-4"></div>
                        <div className="h-10 w-16 bg-white/20 rounded-lg"></div>
                    </div>
                );
            default:
                return <div key={index} className="h-10 w-full glass animate-pulse rounded-lg"></div>;
        }
    };

    return (
        <div className="grid gap-6 w-full">
            {items.map((_, i) => renderSkeleton(i))}
        </div>
    );
};

export default SkeletonLoader;
