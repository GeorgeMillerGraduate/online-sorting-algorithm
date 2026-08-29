/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Insertion Sort
 * =========================================================
 *
 * Generates a sequence of sorting operations that can be
 * animated by SortRenderer.
 *
 * Insertion Sort builds a sorted section from left to right.
 * Each new value is moved backwards until it reaches its
 * correct position within the sorted section.
 */

class InsertionSort {

    /**
     * Create a new Insertion Sort instance.
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
     * Perform Insertion Sort while recording every
     * comparison and swap.
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
         * Empty arrays require no operations.
         */
        if (length === 0) {

            return this.getResult();
        }


        /*
         * The first element initially forms a sorted
         * section by itself.
         */
        this.operations.push({
            type: "sorted",
            indices: [0]
        });


        /*
         * Begin with the second element and insert each
         * value into the sorted section to its left.
         */
        for (
            let index = 1;
            index < length;
            index++
        ) {

            let currentIndex = index;


            /*
             * Move the current value left while it is
             * smaller than the value immediately before it.
             */
            while (currentIndex > 0) {

                const leftIndex =
                    currentIndex - 1;


                /*
                 * Record the comparison.
                 */
                this.operations.push({
                    type: "compare",
                    indices: [
                        leftIndex,
                        currentIndex
                    ]
                });


                this.comparisons++;


                /*
                 * If the values are already in the correct
                 * order, this insertion is complete.
                 */
                if (
                    this.array[leftIndex]
                    <=
                    this.array[currentIndex]
                ) {

                    this.operations.push({
                        type: "clear",
                        indices: [
                            leftIndex,
                            currentIndex
                        ]
                    });


                    break;
                }


                /*
                 * Swap the neighbouring values.
                 */
                const temporary =
                    this.array[leftIndex];


                this.array[leftIndex] =
                    this.array[currentIndex];


                this.array[currentIndex] =
                    temporary;


                this.swaps++;


                /*
                 * Record the swap using the values after
                 * the exchange.
                 */
                this.operations.push({
                    type: "swap",

                    indices: [
                        leftIndex,
                        currentIndex
                    ],

                    values: [
                        this.array[leftIndex],
                        this.array[currentIndex]
                    ]
                });


                /*
                 * Clear the comparison state before moving
                 * on to the next pair.
                 */
                this.operations.push({
                    type: "clear",
                    indices: [
                        leftIndex,
                        currentIndex
                    ]
                });


                currentIndex--;
            }


            /*
             * Everything from zero through index is now
             * internally sorted.
             *
             * These markers allow the renderer to show the
             * growing sorted region.
             */
            for (
                let sortedIndex = 0;
                sortedIndex <= index;
                sortedIndex++
            ) {

                this.operations.push({
                    type: "sorted",
                    indices: [sortedIndex]
                });
            }
        }


        return this.getResult();
    }


    /**
     * =====================================================
     * RESULT
     * =====================================================
     *
     * Return the sorted array, animation operations and
     * statistics required by the visualiser.
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
     * Reuse this sorter with a different array.
     *
     * @param {number[]} array
     */
    setArray(array) {

        this.originalArray = [...array];

        this.reset();
    }
}