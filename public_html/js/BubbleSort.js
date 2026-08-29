/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Bubble Sort
 * =========================================================
 *
 * Generates a sequence of sorting operations that can be
 * animated by SortRenderer.
 *
 * Bubble Sort repeatedly compares neighbouring values and
 * swaps them when they are in the wrong order.
 */

class BubbleSort {

    /**
     * Create a new Bubble Sort instance.
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
     * Perform Bubble Sort while recording every operation.
     *
     * The original array is never modified.
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
         * Nothing needs to be done for arrays containing
         * fewer than two elements.
         */
        if (length < 2) {

            if (length === 1) {

                this.operations.push({
                    type: "sorted",
                    indices: [0]
                });
            }

            return this.getResult();
        }


        /*
         * Each pass moves the largest unsorted value to
         * the right-hand side of the array.
         */
        for (
            let end = length - 1;
            end > 0;
            end--
        ) {

            let swapped = false;


            for (
                let index = 0;
                index < end;
                index++
            ) {

                const leftIndex = index;

                const rightIndex = index + 1;


                /*
                 * Record comparison.
                 */
                this.operations.push({
                    type: "compare",
                    indices: [
                        leftIndex,
                        rightIndex
                    ]
                });


                this.comparisons++;


                /*
                 * Swap values if they are in the
                 * incorrect order.
                 */
                if (
                    this.array[leftIndex]
                    >
                    this.array[rightIndex]
                ) {

                    const temporary =
                        this.array[leftIndex];


                    this.array[leftIndex] =
                        this.array[rightIndex];


                    this.array[rightIndex] =
                        temporary;


                    this.swaps++;


                    /*
                     * Record the swap after changing the
                     * internal array.
                     */
                    this.operations.push({
                        type: "swap",

                        indices: [
                            leftIndex,
                            rightIndex
                        ],

                        values: [
                            this.array[leftIndex],
                            this.array[rightIndex]
                        ]
                    });


                    swapped = true;
                }


                /*
                 * Tell the renderer that the comparison
                 * has finished.
                 */
                this.operations.push({
                    type: "clear",
                    indices: [
                        leftIndex,
                        rightIndex
                    ]
                });
            }


            /*
             * The element at 'end' is now guaranteed to
             * be in its final position.
             */
            this.operations.push({
                type: "sorted",
                indices: [end]
            });


            /*
             * If an entire pass completed without a swap,
             * the remaining array is already sorted.
             */
            if (!swapped) {

                for (
                    let index = 0;
                    index < end;
                    index++
                ) {

                    this.operations.push({
                        type: "sorted",
                        indices: [index]
                    });
                }

                break;
            }
        }


        /*
         * The first element is also sorted once every
         * pass has completed.
         */
        this.operations.push({
            type: "sorted",
            indices: [0]
        });


        return this.getResult();
    }


    /**
     * =====================================================
     * RESULT
     * =====================================================
     *
     * Return everything required by the visualiser.
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
     * Restore the sorter to its initial state.
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
     * Allow the same BubbleSort object to be reused with
     * a newly generated array.
     *
     * @param {number[]} array
     */
    setArray(array) {

        this.originalArray = [...array];

        this.reset();
    }
}