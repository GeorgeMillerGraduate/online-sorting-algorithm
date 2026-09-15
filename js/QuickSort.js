/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Quick Sort
 * =========================================================
 *
 * Generates a sequence of sorting operations that can be
 * animated by SortRenderer.
 *
 * Quick Sort selects a pivot and partitions the array so
 * that smaller values appear before the pivot and larger
 * values appear after it.
 */

class QuickSort {

    /**
     * Create a new Quick Sort instance.
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
     * Perform Quick Sort while recording all operations.
     *
     * @returns {Object}
     */
    sort() {

        this.array = [...this.originalArray];

        this.operations = [];

        this.comparisons = 0;

        this.swaps = 0;


        const length = this.array.length;


        if (length === 0) {

            return this.getResult();
        }


        if (length === 1) {

            this.operations.push({
                type: "sorted",
                indices: [0]
            });

            return this.getResult();
        }


        /*
         * Begin recursive Quick Sort over the complete
         * array.
         */
        this.quickSort(
            0,
            length - 1
        );


        /*
         * Ensure every bar ends in the final sorted state.
         */
        this.operations.push({
            type: "sorted",
            indices: this.createIndexRange(
                0,
                length - 1
            )
        });


        return this.getResult();
    }


    /**
     * =====================================================
     * QUICK SORT
     * =====================================================
     *
     * Recursively partition the selected range.
     *
     * @param {number} low
     * @param {number} high
     */
    quickSort(low, high) {

        if (low > high) {
            return;
        }


        /*
         * A range containing one value is already sorted.
         */
        if (low === high) {

            this.operations.push({
                type: "sorted",
                indices: [low]
            });

            return;
        }


        /*
         * Partition the current section and obtain the
         * final location of its pivot.
         */
        const pivotIndex =
            this.partition(
                low,
                high
            );


        /*
         * The pivot is now permanently in its correct
         * sorted position.
         */
        this.operations.push({
            type: "sorted",
            indices: [pivotIndex]
        });


        /*
         * Recursively sort values to the left and right
         * of the pivot.
         */
        this.quickSort(
            low,
            pivotIndex - 1
        );


        this.quickSort(
            pivotIndex + 1,
            high
        );
    }


    /**
     * =====================================================
     * PARTITION
     * =====================================================
     *
     * Lomuto partitioning.
     *
     * The final element is selected as the pivot.
     * Values <= the pivot are moved to its left.
     *
     * @param {number} low
     * @param {number} high
     *
     * @returns {number}
     */
    partition(low, high) {

        const pivotValue =
            this.array[high];


        /*
         * Tell the renderer which bar currently represents
         * the pivot.
         */
        this.operations.push({
            type: "pivot",
            indices: [high]
        });


        let smallerIndex =
            low - 1;


        /*
         * Compare every value in the partition against
         * the pivot.
         */
        for (
            let currentIndex = low;
            currentIndex < high;
            currentIndex++
        ) {

            /*
             * Highlight the current value and pivot.
             */
            this.operations.push({
                type: "compare",

                indices: [
                    currentIndex,
                    high
                ]
            });


            this.comparisons++;


            /*
             * Values smaller than or equal to the pivot
             * belong on its left-hand side.
             */
            if (
                this.array[currentIndex]
                <=
                pivotValue
            ) {

                smallerIndex++;


                /*
                 * Avoid recording meaningless swaps where
                 * an element would simply swap with itself.
                 */
                if (
                    smallerIndex
                    !==
                    currentIndex
                ) {

                    this.swap(
                        smallerIndex,
                        currentIndex
                    );
                }
            }


            /*
             * Clear comparison highlighting. The renderer
             * can retain the separate pivot state.
             */
            this.operations.push({
                type: "clear",
                indices: [currentIndex]
            });
        }


        /*
         * Move the pivot between the smaller and larger
         * partitions.
         */
        const finalPivotIndex =
            smallerIndex + 1;


        if (
            finalPivotIndex
            !==
            high
        ) {

            this.swap(
                finalPivotIndex,
                high
            );
        }


        /*
         * The old pivot marker can now be removed.
         */
        this.operations.push({
            type: "clearPivot",
            indices: [high]
        });


        /*
         * Briefly mark its new position as the pivot before
         * the recursive calls continue.
         */
        this.operations.push({
            type: "pivot",
            indices: [finalPivotIndex]
        });


        this.operations.push({
            type: "clearPivot",
            indices: [finalPivotIndex]
        });


        return finalPivotIndex;
    }


    /**
     * =====================================================
     * SWAP
     * =====================================================
     *
     * Exchange two values and record the operation.
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


        /*
         * Record the new values so SortRenderer does not
         * need to perform any sorting logic itself.
         */
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
     * CREATE INDEX RANGE
     * =====================================================
     *
     * Generate an array containing all indices between
     * start and end.
     *
     * @param {number} start
     * @param {number} end
     *
     * @returns {number[]}
     */
    createIndexRange(start, end) {

        const indices = [];


        for (
            let index = start;
            index <= end;
            index++
        ) {

            indices.push(index);
        }


        return indices;
    }


    /**
     * =====================================================
     * RESULT
     * =====================================================
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
     * Reuse the QuickSort object with another array.
     *
     * @param {number[]} array
     */
    setArray(array) {

        this.originalArray = [...array];

        this.reset();
    }
}