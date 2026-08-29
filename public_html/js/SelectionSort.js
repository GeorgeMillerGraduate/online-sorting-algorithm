/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Selection Sort
 * =========================================================
 *
 * Generates a sequence of sorting operations that can be
 * animated by SortRenderer.
 *
 * Selection Sort repeatedly searches the unsorted section
 * for its smallest value and moves that value to the next
 * available position in the sorted section.
 */

class SelectionSort {

    /**
     * Create a new Selection Sort instance.
     *
     * @param {number[]} array
     */
    constructor(array) {

        this.originalArray = [...array];

        this.array = [...array];

        this.operations = [];

        this.comparisons = 0;

        this.swaps = 0;
    }


    /**
     * =====================================================
     * SORT
     * =====================================================
     *
     * Perform Selection Sort while recording each
     * operation for the renderer.
     *
     * @returns {Object}
     */
    sort() {

        this.array = [...this.originalArray];

        this.operations = [];

        this.comparisons = 0;

        this.swaps = 0;


        const length = this.array.length;


        /*
         * Empty array.
         */
        if (length === 0) {

            return this.getResult();
        }


        /*
         * Single value is already sorted.
         */
        if (length === 1) {

            this.operations.push({
                type: "sorted",
                indices: [0]
            });


            return this.getResult();
        }


        /*
         * Move the boundary between the sorted and
         * unsorted portions from left to right.
         */
        for (
            let startIndex = 0;
            startIndex < length - 1;
            startIndex++
        ) {

            let minimumIndex =
                startIndex;


            /*
             * Highlight the current minimum candidate.
             */
            this.operations.push({
                type: "minimum",
                indices: [minimumIndex]
            });


            /*
             * Search the remaining unsorted section for
             * a value smaller than the current minimum.
             */
            for (
                let currentIndex = startIndex + 1;
                currentIndex < length;
                currentIndex++
            ) {

                /*
                 * Compare the current value against the
                 * smallest value found so far.
                 */
                this.operations.push({
                    type: "compare",

                    indices: [
                        minimumIndex,
                        currentIndex
                    ]
                });


                this.comparisons++;


                if (
                    this.array[currentIndex]
                    <
                    this.array[minimumIndex]
                ) {

                    /*
                     * Remove the old minimum marker.
                     */
                    this.operations.push({
                        type: "clearMinimum",
                        indices: [minimumIndex]
                    });


                    minimumIndex =
                        currentIndex;


                    /*
                     * Mark the newly discovered minimum.
                     */
                    this.operations.push({
                        type: "minimum",
                        indices: [minimumIndex]
                    });
                }


                /*
                 * Remove comparison highlighting from the
                 * value that has just been inspected.
                 *
                 * The minimum marker remains active.
                 */
                this.operations.push({
                    type: "clear",
                    indices: [currentIndex]
                });
            }


            /*
             * Move the smallest discovered value into the
             * first position of the unsorted section.
             */
            if (
                minimumIndex
                !==
                startIndex
            ) {

                this.swap(
                    startIndex,
                    minimumIndex
                );
            }


            /*
             * Remove the temporary minimum highlighting.
             */
            this.operations.push({
                type: "clearMinimum",
                indices: [minimumIndex]
            });


            /*
             * startIndex now contains its final value.
             */
            this.operations.push({
                type: "sorted",
                indices: [startIndex]
            });
        }


        /*
         * Once every earlier position has been selected,
         * the final element must also be sorted.
         */
        this.operations.push({
            type: "sorted",
            indices: [length - 1]
        });


        return this.getResult();
    }


    /**
     * =====================================================
     * SWAP
     * =====================================================
     *
     * Exchange two values and record their new values.
     *
     * @param {number} firstIndex
     * @param {number} secondIndex
     */
    swap(firstIndex, secondIndex) {

        const temporary =
            this.array[firstIndex];


        this.array[firstIndex] =
            this.array[secondIndex];


        this.array[secondIndex] =
            temporary;


        this.swaps++;


        this.operations.push({
            type: "swap",

            indices: [
                firstIndex,
                secondIndex
            ],

            values: [
                this.array[firstIndex],
                this.array[secondIndex]
            ]
        });
    }


    /**
     * =====================================================
     * RESULT
     * =====================================================
     *
     * Return everything needed by the visualiser.
     */
    getResult() {

        return {

            array: [...this.array],

            operations: [...this.operations],

            comparisons: this.comparisons,

            swaps: this.swaps
        };
    }


    /**
     * =====================================================
     * RESET
     * =====================================================
     *
     * Restore the sorter to its original state.
     */
    reset() {

        this.array = [...this.originalArray];

        this.operations = [];

        this.comparisons = 0;

        this.swaps = 0;
    }


    /**
     * =====================================================
     * SET ARRAY
     * =====================================================
     *
     * Reuse the SelectionSort object with another array.
     *
     * @param {number[]} array
     */
    setArray(array) {

        this.originalArray = [...array];

        this.reset();
    }
}