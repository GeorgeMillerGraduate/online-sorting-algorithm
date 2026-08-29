/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Sorting Visualizer
 * Application Controller
 * =========================================================
 */

$(document).ready(function () {

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const algorithmSelect =
        document.getElementById("algorithmSelect");

    const arraySizeInput =
        document.getElementById("arraySize");

    const arraySizeValue =
        document.getElementById("arraySizeValue");

    const speedInput =
        document.getElementById("sortSpeed");

    const speedValue =
        document.getElementById("sortSpeedValue");

    const volumeSlider =
        document.getElementById("volumeSlider");

    const volumeValue =
        document.getElementById("volumeValue");

    const muteButton =
        document.getElementById("muteButton");

    const generateButton =
        document.getElementById("generateButton");

    const startButton =
        document.getElementById("startButton");

    const pauseButton =
        document.getElementById("pauseButton");

    const stepButton =
        document.getElementById("stepButton");

    const resetButton =
        document.getElementById("resetButton");

    const shuffleButton =
        document.getElementById("shuffleButton");

    const visualisationTitle =
        document.getElementById("visualisationTitle");

    const elementCount =
        document.getElementById("elementCount");

    const comparisonCount =
        document.getElementById("comparisonCount");

    const swapCount =
        document.getElementById("swapCount");

    const sortingMessage =
        document.getElementById("sortingMessage");

    const algorithmButtons =
        document.querySelectorAll(
            ".preset-button"
        );


    /* =====================================================
       APPLICATION STATE
       ===================================================== */

    let currentArray = [];

    let originalArray = [];

    let currentSorter = null;

    let currentResult = null;


    /* =====================================================
       AUDIO
       ===================================================== */

    const sortAudio =
        new SortAudio();


    sortAudio.setVolume(
        volumeSlider.value
    );


    /* =====================================================
       RENDERER
       ===================================================== */

    const renderer =
        new SortRenderer("#sortingBars");


    /*
     * Statistics.
     */

    renderer.onComparisonChange =
        function (value) {

            comparisonCount.textContent =
                value.toLocaleString();
        };


    renderer.onSwapChange =
        function (value) {

            swapCount.textContent =
                value.toLocaleString();
        };


    renderer.onComplete =
        function () {

            startButton.textContent =
                "Sorted";

            pauseButton.textContent =
                "Pause";
        };


    /*
     * =====================================================
     * AUDIO OPERATION HOOK
     * =====================================================
     *
     * SortRenderer already reports every executed
     * operation through onOperation.
     *
     * This lets the audio system observe the animation
     * without putting sound code inside any sorting
     * algorithm.
     */

    renderer.onOperation =
        function (operation) {

            playOperationSound(
                operation
            );
        };


    /* =====================================================
       ALGORITHM NAMES
       ===================================================== */

    const algorithmNames = {

        bubble:
            "Bubble Sort",

        selection:
            "Selection Sort",

        insertion:
            "Insertion Sort",

        merge:
            "Merge Sort",

        quick:
            "Quick Sort"
    };


    /* =====================================================
       PLAY OPERATION SOUND
       ===================================================== */

    function playOperationSound(
        operation
    ) {

        if (
            !operation
            ||
            currentArray.length === 0
        ) {

            return;
        }


        /*
         * renderer.array represents the CURRENT visual
         * state of the sorting process.
         */

        const visualArray =
            renderer.array;


        if (
            !visualArray
            ||
            visualArray.length === 0
        ) {

            return;
        }


        const minimumValue =
            Math.min(
                ...visualArray
            );


        const maximumValue =
            Math.max(
                ...visualArray
            );


        switch (operation.type) {

            /*
             * Comparisons are the main source of the
             * sorting "melody".
             */

            case "compare": {

                const values =
                    getOperationValues(
                        operation.indices
                    );


                sortAudio.playValues(
                    values,
                    minimumValue,
                    maximumValue
                );

                break;
            }


            /*
             * Swaps produce a note corresponding to the
             * two values after they have moved.
             */

            case "swap": {

                const values =
                    getOperationValues(
                        operation.indices
                    );


                sortAudio.playValues(
                    values,
                    minimumValue,
                    maximumValue
                );

                break;
            }


            /*
             * Merge Sort changes individual array
             * positions using write operations.
             */

            case "write": {

                sortAudio.playValue(
                    operation.value,
                    minimumValue,
                    maximumValue
                );

                break;
            }


            /*
             * Quick Sort pivot.
             */

            case "pivot": {

                if (
                    operation.indices
                    &&
                    operation.indices.length > 0
                ) {

                    const index =
                        operation.indices[0];


                    const value =
                        visualArray[index];


                    if (
                        value !== undefined
                    ) {

                        sortAudio.playValue(
                            value,
                            minimumValue,
                            maximumValue
                        );
                    }
                }

                break;
            }


            /*
             * Selection Sort minimum candidate.
             */

            case "minimum": {

                if (
                    operation.indices
                    &&
                    operation.indices.length > 0
                ) {

                    const index =
                        operation.indices[0];


                    const value =
                        visualArray[index];


                    if (
                        value !== undefined
                    ) {

                        sortAudio.playValue(
                            value,
                            minimumValue,
                            maximumValue
                        );
                    }
                }

                break;
            }
        }
    }


    /* =====================================================
       GET OPERATION VALUES
       ===================================================== */

    function getOperationValues(
        indices
    ) {

        if (!Array.isArray(indices)) {

            return [];
        }


        const values = [];


        for (const index of indices) {

            if (
                index >= 0
                &&
                index < renderer.array.length
            ) {

                values.push(
                    renderer.array[index]
                );
            }
        }


        return values;
    }


    /* =====================================================
       GENERATE ARRAY
       ===================================================== */

    function generateArray() {

        const size =
            parseInt(
                arraySizeInput.value,
                10
            );


        const array = [];


        for (
            let index = 0;
            index < size;
            index++
        ) {

            const value =
                Math.floor(
                    Math.random() * 950
                ) + 50;


            array.push(value);
        }


        currentArray =
            [...array];

        originalArray =
            [...array];


        prepareArray();
    }


    /* =====================================================
       PREPARE ARRAY
       ===================================================== */

    function prepareArray() {

        renderer.stop();

        sortAudio.stopAllNotes();


        renderer.setArray(
            currentArray
        );


        elementCount.textContent =
            currentArray.length;


        comparisonCount.textContent =
            "0";

        swapCount.textContent =
            "0";


        startButton.textContent =
            "Sort";

        pauseButton.textContent =
            "Pause";


        hideMessage();


        prepareSort();
    }


    /* =====================================================
       CREATE SORTER
       ===================================================== */

    function createSorter(
        algorithm,
        array
    ) {

        switch (algorithm) {

            case "bubble":

                return new BubbleSort(
                    array
                );


            case "selection":

                return new SelectionSort(
                    array
                );


            case "insertion":

                return new InsertionSort(
                    array
                );


            case "merge":

                return new MergeSort(
                    array
                );


            case "quick":

                return new QuickSort(
                    array
                );


            default:

                throw new Error(
                    "Unknown sorting algorithm: "
                    + algorithm
                );
        }
    }


    /* =====================================================
       PREPARE SORT
       ===================================================== */

    function prepareSort() {

        const algorithm =
            algorithmSelect.value;


        currentSorter =
            createSorter(
                algorithm,
                currentArray
            );


        currentResult =
            currentSorter.sort();


        renderer.setOperations(
            currentResult.operations
        );


        renderer.setSpeed(
            speedInput.value
        );


        updateAlgorithmDisplay();
    }


    /* =====================================================
       UPDATE ALGORITHM DISPLAY
       ===================================================== */

    function updateAlgorithmDisplay() {

        const algorithm =
            algorithmSelect.value;


        visualisationTitle.textContent =
            algorithmNames[algorithm]
            || "Sorting";


        algorithmButtons.forEach(
            function (button) {

                const selected =
                    button.dataset.algorithm
                    ===
                    algorithm;


                button.classList.toggle(
                    "active",
                    selected
                );
            }
        );
    }


    /* =====================================================
       START / RESUME
       ===================================================== */

    function startSorting() {

        /*
         * IMPORTANT:
         *
         * Initialise/resume Web Audio as a direct result
         * of the user's click.
         *
         * Chrome and other browsers generally require
         * this before audio can be played.
         */

        sortAudio.initialise();


        if (
            sortAudio.audioContext
            &&
            sortAudio.audioContext.state
            ===
            "suspended"
        ) {

            sortAudio.audioContext.resume();
        }


        if (renderer.isComplete()) {

            return;
        }


        if (renderer.paused) {

            pauseButton.textContent =
                "Pause";


            startButton.textContent =
                "Sorting...";


            renderer.start();

            return;
        }


        startButton.textContent =
            "Sorting...";


        renderer.start();
    }


    /* =====================================================
       PAUSE
       ===================================================== */

    function pauseSorting() {

        if (!renderer.running) {

            return;
        }


        if (renderer.paused) {

            renderer.paused =
                false;


            pauseButton.textContent =
                "Pause";


            startButton.textContent =
                "Sorting...";

        } else {

            renderer.pause();


            sortAudio.stopAllNotes();


            pauseButton.textContent =
                "Resume";


            startButton.textContent =
                "Sort";
        }
    }


    /* =====================================================
       STEP
       ===================================================== */

    function stepSorting() {

        /*
         * Step is also a direct user interaction, so it
         * can safely unlock Web Audio.
         */

        sortAudio.initialise();


        if (
            renderer.running
            &&
            !renderer.paused
        ) {

            renderer.pause();


            sortAudio.stopAllNotes();


            pauseButton.textContent =
                "Resume";
        }


        const stepped =
            renderer.step();


        if (stepped) {

            startButton.textContent =
                renderer.isComplete()
                    ? "Sorted"
                    : "Continue";
        }
    }


    /* =====================================================
       RESET
       ===================================================== */

    function resetSorting() {

        renderer.stop();

        sortAudio.stopAllNotes();


        currentArray =
            [...originalArray];


        renderer.setArray(
            currentArray
        );


        prepareSort();


        comparisonCount.textContent =
            "0";

        swapCount.textContent =
            "0";


        startButton.textContent =
            "Sort";

        pauseButton.textContent =
            "Pause";
    }


    /* =====================================================
       SHUFFLE
       ===================================================== */

    function shuffleArray() {

        renderer.stop();

        sortAudio.stopAllNotes();


        const shuffled =
            [...currentArray];


        /*
         * Fisher-Yates shuffle.
         */

        for (
            let index = shuffled.length - 1;
            index > 0;
            index--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random()
                    *
                    (index + 1)
                );


            const temporary =
                shuffled[index];


            shuffled[index] =
                shuffled[randomIndex];


            shuffled[randomIndex] =
                temporary;
        }


        currentArray =
            shuffled;


        originalArray =
            [...shuffled];


        prepareArray();
    }


    /* =====================================================
       CHANGE ALGORITHM
       ===================================================== */

    function changeAlgorithm(
        algorithm
    ) {

        if (
            !algorithmNames[
                algorithm
            ]
        ) {

            return;
        }


        renderer.stop();

        sortAudio.stopAllNotes();


        algorithmSelect.value =
            algorithm;


        currentArray =
            [...originalArray];


        renderer.setArray(
            currentArray
        );


        prepareSort();


        comparisonCount.textContent =
            "0";

        swapCount.textContent =
            "0";


        startButton.textContent =
            "Sort";

        pauseButton.textContent =
            "Pause";
    }


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(text) {

        sortingMessage.textContent =
            text;


        sortingMessage.style.display =
            "block";
    }


    function hideMessage() {

        sortingMessage.style.display =
            "none";
    }


    /* =====================================================
       ARRAY SIZE
       ===================================================== */

    arraySizeInput.addEventListener(
        "input",
        function () {

            arraySizeValue.textContent =
                arraySizeInput.value;
        }
    );


    arraySizeInput.addEventListener(
        "change",
        function () {

            generateArray();
        }
    );


    /* =====================================================
       SPEED
       ===================================================== */

    speedInput.addEventListener(
        "input",
        function () {

            speedValue.textContent =
                speedInput.value;


            renderer.setSpeed(
                speedInput.value
            );
        }
    );


    /* =====================================================
       VOLUME
       ===================================================== */

    volumeSlider.addEventListener(
        "input",
        function () {

            const value =
                Number(
                    volumeSlider.value
                );


            volumeValue.textContent =
                value + "%";


            sortAudio.setVolume(
                value
            );


            /*
             * Moving the slider above zero while muted
             * does NOT automatically unmute.
             *
             * The mute button remains authoritative.
             */
        }
    );


    /* =====================================================
       MUTE
       ===================================================== */

    muteButton.addEventListener(
        "click",
        function () {

            /*
             * This click can also initialise Web Audio.
             */

            sortAudio.initialise();


            const muted =
                sortAudio.toggleMute();


            updateMuteButton(
                muted
            );
        }
    );


    /* =====================================================
       UPDATE MUTE BUTTON
       ===================================================== */

    function updateMuteButton(
        muted
    ) {

        if (muted) {

            muteButton.textContent =
                "Sound: Muted";


            muteButton.setAttribute(
                "aria-pressed",
                "true"
            );

        } else {

            muteButton.textContent =
                "Sound: On";


            muteButton.setAttribute(
                "aria-pressed",
                "false"
            );
        }
    }


    /* =====================================================
       ALGORITHM SELECT
       ===================================================== */

    algorithmSelect.addEventListener(
        "change",
        function () {

            changeAlgorithm(
                algorithmSelect.value
            );
        }
    );


    /* =====================================================
       ALGORITHM CARDS
       ===================================================== */

    algorithmButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    changeAlgorithm(
                        button.dataset.algorithm
                    );
                }
            );
        }
    );


    /* =====================================================
       BUTTON EVENTS
       ===================================================== */

    generateButton.addEventListener(
        "click",
        function () {

            generateArray();
        }
    );


    startButton.addEventListener(
        "click",
        function () {

            startSorting();
        }
    );


    pauseButton.addEventListener(
        "click",
        function () {

            pauseSorting();
        }
    );


    stepButton.addEventListener(
        "click",
        function () {

            stepSorting();
        }
    );


    resetButton.addEventListener(
        "click",
        function () {

            resetSorting();
        }
    );


    shuffleButton.addEventListener(
        "click",
        function () {

            shuffleArray();
        }
    );


    /* =====================================================
       INITIALISE
       ===================================================== */

    function initialise() {

        arraySizeValue.textContent =
            arraySizeInput.value;


        speedValue.textContent =
            speedInput.value;


        volumeValue.textContent =
            volumeSlider.value
            +
            "%";


        sortAudio.setVolume(
            volumeSlider.value
        );


        updateMuteButton(
            sortAudio.isMuted()
        );


        renderer.setSpeed(
            speedInput.value
        );


        showMessage(
            "Generating array..."
        );


        generateArray();
    }


    initialise();

});