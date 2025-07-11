// useSyncScroll.ts
import React, { useCallback, useEffect, useRef } from 'react';

// Define the types for the options object that the hook accepts
interface UseSyncScrollOptions {
    vertical?: boolean; // Whether to synchronize vertical scrolling
    horizontal?: boolean; // Whether to synchronize horizontal scrolling
    proportional?: boolean; // Whether to synchronize proportionally (based on scroll percentage) or directly (mirroring scrollTop/Left)
}

/**
 * A React custom hook to synchronize the scroll position of multiple DOM elements.
 *
 * @param refs An array of React RefObjects, each pointing to an HTMLElement (or null initially).
 * These are the elements whose scroll positions will be synchronized.
 * @param options An optional object to configure the synchronization behavior.
 * - `vertical`: (default: true) Synchronize vertical scroll.
 * - `horizontal`: (default: true) Synchronize horizontal scroll.
 * - `proportional`: (default: true) Synchronize based on scroll percentage,
 * useful for elements with different scrollable heights/widths.
 * If false, directly mirrors scrollTop/scrollLeft.
 */
export default function useSyncScroll(
    refs: React.RefObject<HTMLElement | null>[], // refs is an array of React RefObjects, each can hold an HTMLElement or be null
    options: UseSyncScrollOptions = {}, // Options for controlling scroll behavior
) {
    const { vertical = true, horizontal = true, proportional = true } = options;
    const isSyncing = useRef(false); // Flag to prevent infinite loop caused by scroll events triggering each other

    /**
     * Calculates the vertical and horizontal scroll percentages of an element.
     *
     * @param element The HTMLElement for which to calculate scroll percentages.
     * @returns An object containing `verticalPercent` and `horizontalPercent`.
     */
    const getScrollPercentage = useCallback((element: HTMLElement) => {
        // Destructure relevant scroll properties from the element
        const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = element;

        // Calculate the total scrollable range for vertical and horizontal scrolling
        const verticalScrollRange = scrollHeight - clientHeight;
        const horizontalScrollRange = scrollWidth - clientWidth;

        // Calculate the scroll percentage. If no scroll range exists, percentage is 0.
        const verticalPercent = verticalScrollRange > 0 ? scrollTop / verticalScrollRange : 0;
        const horizontalPercent = horizontalScrollRange > 0 ? scrollLeft / horizontalScrollRange : 0;

        return { verticalPercent, horizontalPercent };
    }, []); // Dependencies are empty as it only depends on DOM properties

    /**
     * Sets the scroll position of an element based on given vertical and horizontal percentages.
     *
     * @param element The HTMLElement whose scroll position is to be set.
     * @param verticalPercent The target vertical scroll percentage (0-1).
     * @param horizontalPercent The target horizontal scroll percentage (0-1).
     */
    const setScrollFromPercentage = useCallback(
        (element: HTMLElement, verticalPercent: number, horizontalPercent: number) => {
            // Destructure relevant scroll properties from the element
            const { scrollHeight, scrollWidth, clientHeight, clientWidth } = element;

            // Calculate the total scrollable range for vertical and horizontal scrolling
            const verticalScrollRange = scrollHeight - clientHeight;
            const horizontalScrollRange = scrollWidth - clientWidth;

            // Apply vertical scroll if enabled and a scroll range exists
            if (vertical && verticalScrollRange > 0) {
                element.scrollTop = verticalPercent * verticalScrollRange;
            }
            // Apply horizontal scroll if enabled and a scroll range exists
            if (horizontal && horizontalScrollRange > 0) {
                element.scrollLeft = horizontalPercent * horizontalScrollRange;
            }
        },
        [vertical, horizontal], // Dependencies: depends on the `vertical` and `horizontal` options
    );

    // Effect hook to attach and clean up scroll event listeners
    useEffect(() => {
        // If fewer than two refs are provided, there's nothing to sync
        if (refs.length < 2) return;

        /**
         * The core scroll event handler.
         * This function is triggered whenever one of the tracked elements is scrolled.
         * @param e The scroll event object.
         */
        const scrollHandler = (e: Event) => {
            // Prevent re-entry if a synchronization is already in progress
            if (isSyncing.current) return;

            isSyncing.current = true; // Set flag to indicate syncing is in progress

            // Get the element that triggered the scroll event
            const sourceElement = e.target as HTMLElement; // Cast to HTMLElement for DOM properties

            // Get the scroll percentage of the source element
            const { verticalPercent, horizontalPercent } = getScrollPercentage(sourceElement);

            // Iterate through all provided refs to synchronize them
            refs.forEach((ref) => {
                const targetElement = ref.current;
                // Ensure the target element exists and is not the source element (to avoid syncing with itself)
                if (targetElement && targetElement !== sourceElement) {
                    if (proportional) {
                        // Synchronize proportionally based on percentages
                        setScrollFromPercentage(targetElement, verticalPercent, horizontalPercent);
                    } else {
                        // Non-proportional synchronization (direct mirroring of scrollLeft/scrollTop)
                        // This works best if elements have the same content size and scrollable area.
                        if (vertical) targetElement.scrollTop = sourceElement.scrollTop;
                        if (horizontal) targetElement.scrollLeft = sourceElement.scrollLeft;
                    }
                }
            });

            // Reset the syncing flag after a short delay. This is crucial:
            // - It allows the browser to complete its scroll event processing on target elements.
            // - It prevents the newly set scroll on target elements from immediately triggering
            //   another scroll event and re-entering this handler, thus avoiding an infinite loop.
            setTimeout(() => {
                isSyncing.current = false;
            }, 0); // A timeout of 0 ms pushes the reset to the end of the current event loop cycle.
        };

        // Attach event listeners to all referenced elements when the component mounts or refs/options change
        refs.forEach((ref) => {
            if (ref.current) {
                // Only attach if the DOM element exists
                ref.current.addEventListener('scroll', scrollHandler);
            }
        });

        // Clean up event listeners when the component unmounts or dependencies change
        return () => {
            refs.forEach((ref) => {
                if (ref.current) {
                    // Only remove if the DOM element exists
                    ref.current.removeEventListener('scroll', scrollHandler);
                }
            });
        };
    }, [refs, getScrollPercentage, setScrollFromPercentage, proportional, vertical, horizontal]); // Dependencies for useEffect
}

export { useSyncScroll }; // Export the hook for use in other components
