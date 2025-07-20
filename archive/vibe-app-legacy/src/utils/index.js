// This file contains utility functions for the application.

export function logError(message) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
}

export function logInfo(message) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
}

export function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}