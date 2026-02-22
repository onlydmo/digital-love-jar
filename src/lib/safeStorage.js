/**
 * Safe localStorage wrapper for mobile compatibility.
 * iOS Safari in Private Browsing mode throws QuotaExceededError on setItem.
 * Some in-app browsers (Instagram, Facebook) may also restrict storage.
 */

const memoryFallback = {};

export const safeGetItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return memoryFallback[key] || null;
    }
};

export const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        memoryFallback[key] = value;
    }
};

export const safeRemoveItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch {
        delete memoryFallback[key];
    }
};

export const safeClear = () => {
    try {
        localStorage.clear();
    } catch {
        Object.keys(memoryFallback).forEach(k => delete memoryFallback[k]);
    }
};
