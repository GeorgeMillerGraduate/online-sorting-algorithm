/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Merge Sort
 * =========================================================
 *
 * Generates a sequence of sorting operations that can be
 * animated by SortRenderer.
 *
 * Merge Sort recursively divides the array into smaller
 * sections, sorts those sections, then merges them back
 * together in ascending order.
 */

class MergeSort {

    /**
     * Create a new Merge Sort instance.
     *
     * @param {number[]} array
     */
    constructor(array) {

        this.originalArray = [...array];

        this.array = [...array];

        this.operations = [];

        this.comparisons = 0;

        /*
         * Merge Sort normally writes values rather than
         * swapping neighbouring elements.
         *
         * We keep the "swaps" statistic for compatibility
         * with the rest of the visualiser and count each
         * changed array position as a movement.
         */
        this.swaps = 0;
    }


    /**
     * =====================================================
     * SORT
     * =====================================================
     *
     * Perform Merge Sort while recording the operations
     * required by the visualiser.
     *
     * @returns {Object}
     */
    sort() {

        this.array = [...this.originalArray];

        this.operations = [];

        this.comparisons = 0;

        this.swaps = 0;


        if (this.array.length === 0) {

            return this.getResult();
        }


        if (this.array.length === 1) {

            this.operations.push({
                type: "sorted",
                indices: [0]
            });


            return this.getResult();
        }


        /*
         * Temporary array used while merging.
         */
        const auxiliary =
            new Array(this.array.length);


        this.mergeSort(
            0,
            this.array.length - 1,
            auxiliary
        );


        /*
         * Once the complete merge has finished every
         * element is in its final position.
         */
        for (
            let index = 0;
            index < this.array.length;
            index++
        ) {

            this.operations.push({
                type: "sorted",
                indices: [index]
            });
        }


        return this.getResult();
    }


    /**
     * =====================================================
     * MERGE SORT
     * =====================================================
     *
     * Recursively divide the selected section into two
     * halves before merging them back together.
     *
     * @param {number} left
     * @param {number} right
     * @param {number[]} auxiliary
     */
    mergeSort(left, right, auxiliary) {

        /*
         * A section containing one element is already
         * sorted.
         */
        if (left >= right) {

            return;
        }


        const middle =
            Math.floor(
                (left + right) / 2
            );


        /*
         * Sort the left half.
         */
        this.mergeSort(
            left,
            middle,
            auxiliary
        );


        /*
         * Sort the right half.
         */
        this.mergeSort(
            middle + 1,
            right,
            auxiliary
        );


        /*
         * Merge the two sorted halves.
         */
        this.merge(
            left,
            middle,
            right,
            auxiliary
        );
    }


    /**
     * =====================================================
     * MERGE
     * =====================================================
     *
     * Merge two neighbouring sorted sections.
     *
     * Left:
     *     left -> middle
     *
     * Right:
     *     middle + 1 -> right
     *
     * @param {number} left
     * @param {number} middle
     * @param {number} right
     * @param {number[]} auxiliary
     */
    merge(
        left,
        middle,
        right,
        auxiliary
    ) {

        /*
         * Copy the section that is about to be merged.
         */
        for (
            let index = left;
            index <= right;
            index++
        ) {

            auxiliary[index] =
                this.array[index];
        }


        let leftIndex = left;

        let rightIndex =
            middle + 1;

        let destinationIndex =
            left;


        /*
         * Compare values at the front of each half until
         * one of the halves has been exhausted.
         */
        while (
            leftIndex <= middle
            &&
            rightIndex <= right
        ) {

            /*
             * Highlight the two values currently being
             * compared.
             */
            this.operations.push({
                type: "compare",

                indices: [
                    leftIndex,
                    rightIndex
                ]
            });


            this.comparisons++;


            let value;


            if (
                auxiliary[leftIndex]
                <=
                auxiliary[rightIndex]
            ) {

                value =
                    auxiliary[leftIndex];

                leftIndex++;

            } else {

                value =
                    auxiliary[rightIndex];

                rightIndex++;
            }


            /*
             * Write the selected value into its new
             * position.
             */
            this.writeValue(
                destinationIndex,
                value
            );


            /*
             * Remove the comparison highlighting.
             */
            this.operations.push({
                type: "clear",

                indices: [
                    Math.min(
                        leftIndex,
                        middle
                    ),

                    Math.min(
                        rightIndex,
                        right
                    )
                ]
            });


            destinationIndex++;
        }


        /*
         * Copy any remaining values from the left half.
         */
        while (leftIndex <= middle) {

            this.writeValue(
                destinationIndex,
                auxiliary[leftIndex]
            );


            leftIndex++;

            destinationIndex++;
        }


        /*
         * Copy any remaining values from the right half.
         */
        while (rightIndex <= right) {

            this.writeValue(
                destinationIndex,
                auxiliary[rightIndex]
            );


            rightIndex++;

            destinationIndex++;
        }


        /*
         * Tell the renderer that this section has now
         * completed a merge.
         *
         * "merged" is useful for briefly highlighting
         * completed Merge Sort ranges.
         */
        this.operations.push({
            type: "merged",

            indices:
                this.createIndexRange(
                    left,
                    right
                )
        });
    }


    /**
     * =====================================================
     * WRITE VALUE
     * =====================================================
     *
     * Record a value being written into an array position.
     *
     * Merge Sort does not naturally operate using swaps,
     * so the renderer receives a "write" operation.
     *
     * @param {number} index
     * @param {number} value
     */
    writeValue(index, value) {

        const previousValue =
            this.array[index];


        this.array[index] =
            value;


        /*
         * Only count an actual movement when the value
         * occupying the position changes.
         */
        if (previousValue !== value) {

            this.swaps++;
        }


        this.operations.push({
            type: "write",

            index: index,

            value: value
        });
    }


    /**
     * =====================================================
     * CREATE INDEX RANGE
     * =====================================================
     *
     * Generate an array containing every index between
     * start and end.
     *
     * Example:
     *
     * createIndexRange(2, 5)
     *
     * returns:
     *
     * [2, 3, 4, 5]
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
     * Reuse the MergeSort instance with another array.
     *
     * @param {number[]} array
     */
    setArray(array) {

        this.originalArray = [...array];

        this.reset();
    }
}