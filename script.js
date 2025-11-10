(function () {
    'use strict';

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function toUniqueList(values) {
        return Array.from(new Set(values));
    }

    function renderList(targetEl, items) {
        // Reset state
        targetEl.innerHTML = 'None found.';
        targetEl.classList.add('empty-state');
        
        if (!items || items.length === 0) {
            return;
        }
        
        // Render success state
        targetEl.classList.remove('empty-state');
        const escaped = items.map(escapeHtml);
        const lis = escaped.map(v => `<li>${v}</li>`).join('');
        targetEl.innerHTML = `<ul>${lis}</ul>`;
    }

    function extractEntities() {
        const input = document.getElementById('paragraph-input');
        const emailsOut = document.getElementById('emails-output');
        const datesOut = document.getElementById('dates-output');
        const timesOut = document.getElementById('times-output');

        const text = (input.value || '').trim();
        if (text.length === 0) {
            // Force rendering of empty state when text is empty
            renderList(emailsOut, []);
            renderList(datesOut, []);
            renderList(timesOut, []);
            return;
        }

        // Enhanced RegEx patterns
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
        // Date: Captures formats like 01/01/2025, 1-1-2025, Jan 1, 2025, or January 1st
        const dateRegex = /\b(?:(?:[01]?\d[\/\-.]\d{1,2}[\/\-.]\d{2,4})|(?:\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{2,4})|(?:\d{1,2}(?:st|nd|rd|th)? \w+ \d{2,4}))\b/gi;
        // Time: Captures 1:00 PM, 13:00, 1:00, 13:00:00, or 1pm
        const timeRegex = /\b(\d{1,2}(?::\d{2}){1,2}(?:\s*(?:AM|PM))?|\d{1,2}(?:am|pm))\b/gi;

        // Collect matches
        const emailMatches = Array.from(text.matchAll(emailRegex), m => m[1]);
        const dateMatches = Array.from(text.matchAll(dateRegex), m => m[1]);
        const timeMatches = Array.from(text.matchAll(timeRegex), m => m[1]);

        // Deduplicate and Normalize Time
        const emails = toUniqueList(emailMatches);
        const dates = toUniqueList(dateMatches);
        const times = toUniqueList(timeMatches).map(t => {
             return t.replace(/([a|p]m)/gi, (match) => match.toUpperCase());
        });

        // Render
        renderList(emailsOut, emails);
        renderList(datesOut, dates);
        renderList(timesOut, times);
    }

    onReady(function () {
        const button = document.getElementById('extract-button');
        const input = document.getElementById('paragraph-input');

        if (button) {
            button.addEventListener('click', extractEntities);
        }

        if (input) {
            input.addEventListener('keydown', function (e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    extractEntities();
                }
            });
        }
    });
})();