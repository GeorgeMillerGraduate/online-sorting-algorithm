/**
 * =========================================================
 * MIDLIFE PROGRAMMER
 * Sorting Visualizer
 * Musical Audio Engine
 * =========================================================
 *
 * The array values remain the primary source of pitch.
 *
 * Instead of mapping values onto arbitrary frequencies,
 * values are quantised onto a musical pentatonic scale.
 *
 * Low value  -> low musical note
 * High value -> high musical note
 *
 * The result preserves the audible shape of the data while
 * making the sorting process substantially more musical.
 */

class SortAudio {

    constructor() {

        /* =================================================
           WEB AUDIO
           ================================================= */

        this.audioContext = null;

        this.masterGain = null;


        /* =================================================
           VOLUME
           ================================================= */

        this.volume = 0.35;

        this.muted = false;


        /* =================================================
           MUSICAL SCALE
           =================================================
         *
         * C major pentatonic:
         *
         * C D E G A
         *
         * Pentatonic scales work especially well here
         * because almost any combination of notes remains
         * reasonably consonant.
         *
         * MIDI:
         *
         * C2 = 36
         * ...
         * C6 = 84
         */

        this.scaleMidiNotes =
            this.createPentatonicScale(
                36,
                84
            );


        /* =================================================
           NOTE CHARACTER
           ================================================= */

        this.noteDuration = 0.085;

        this.minimumNoteInterval = 0.012;

        this.lastNoteTime = 0;


        /*
         * Keep active oscillators so mute/reset can stop
         * them immediately.
         */

        this.activeOscillators =
            new Set();


        /*
         * Small variation in velocity makes repeated notes
         * less mechanically identical.
         */

        this.noteCounter = 0;
    }


    /**
     * =====================================================
     * INITIALISE
     * =====================================================
     */

    initialise() {

        if (this.audioContext) {

            if (
                this.audioContext.state
                ===
                "suspended"
            ) {

                this.audioContext.resume();
            }

            return;
        }


        const AudioContextClass =
            window.AudioContext
            ||
            window.webkitAudioContext;


        if (!AudioContextClass) {

            console.warn(
                "Web Audio API is not supported by this browser."
            );

            return;
        }


        this.audioContext =
            new AudioContextClass();


        this.masterGain =
            this.audioContext.createGain();


        /*
         * Keep some headroom because comparisons can
         * occasionally play two notes.
         */

        this.masterGain.gain.value =
            this.muted
                ? 0
                : this.volume;


        this.masterGain.connect(
            this.audioContext.destination
        );
    }


    /**
     * =====================================================
     * CREATE PENTATONIC SCALE
     * =====================================================
     *
     * C major pentatonic intervals:
     *
     * C  = 0
     * D  = 2
     * E  = 4
     * G  = 7
     * A  = 9
     */

    createPentatonicScale(
        lowestMidi,
        highestMidi
    ) {

        const intervals =
            [
                0,
                2,
                4,
                7,
                9
            ];


        const notes = [];


        /*
         * Start sufficiently far below the requested range
         * and simply keep notes that fall inside it.
         */

        for (
            let octaveBase = 24;
            octaveBase <= 96;
            octaveBase += 12
        ) {

            for (
                const interval
                of intervals
            ) {

                const midi =
                    octaveBase
                    +
                    interval;


                if (
                    midi >= lowestMidi
                    &&
                    midi <= highestMidi
                ) {

                    notes.push(
                        midi
                    );
                }
            }
        }


        return notes;
    }


    /**
     * =====================================================
     * PLAY VALUE
     * =====================================================
     *
     * Used for individual operations such as:
     *
     * Merge Sort writes
     * Quick Sort pivots
     * Selection Sort minimums
     */

    playValue(
        value,
        minimumValue,
        maximumValue
    ) {

        if (!this.canPlay()) {
            return;
        }


        this.initialise();


        if (!this.audioContext) {
            return;
        }


        if (!this.allowNextNote()) {
            return;
        }


        const frequency =
            this.valueToFrequency(
                value,
                minimumValue,
                maximumValue
            );


        this.playMusicalNote(
            frequency,
            0,
            1.0
        );
    }


    /**
     * =====================================================
     * PLAY VALUES
     * =====================================================
     *
     * Used mainly for comparisons and swaps.
     *
     * The values still determine the pitches.
     *
     * Two active bars therefore produce a musical interval
     * corresponding to their relative heights.
     */

    playValues(
        values,
        minimumValue,
        maximumValue
    ) {

        if (
            !Array.isArray(values)
            ||
            values.length === 0
        ) {

            return;
        }


        if (!this.canPlay()) {
            return;
        }


        this.initialise();


        if (!this.audioContext) {
            return;
        }


        if (!this.allowNextNote()) {
            return;
        }


        /*
         * Sorting comparisons normally contain two values.
         */

        const valuesToPlay =
            values.slice(
                0,
                2
            );


        /*
         * A single value simply becomes one note.
         */

        if (
            valuesToPlay.length
            ===
            1
        ) {

            const frequency =
                this.valueToFrequency(
                    valuesToPlay[0],
                    minimumValue,
                    maximumValue
                );


            this.playMusicalNote(
                frequency,
                0,
                1.0
            );


            return;
        }


        /*
         * Two-value comparisons.
         *
         * Rather than hitting both notes at exactly the
         * same moment, slightly arpeggiate them.
         *
         * This makes rapid comparisons sound more like
         * musical runs than computer alarm tones.
         */

        const firstFrequency =
            this.valueToFrequency(
                valuesToPlay[0],
                minimumValue,
                maximumValue
            );


        const secondFrequency =
            this.valueToFrequency(
                valuesToPlay[1],
                minimumValue,
                maximumValue
            );


        this.playMusicalNote(
            firstFrequency,
            0,
            0.72
        );


        /*
         * If both values quantise to exactly the same note,
         * don't create two identical oscillators.
         */

        if (
            Math.abs(
                firstFrequency
                -
                secondFrequency
            )
            >
            0.1
        ) {

            this.playMusicalNote(
                secondFrequency,
                0.018,
                0.62
            );
        }
    }


    /**
     * =====================================================
     * VALUE TO FREQUENCY
     * =====================================================
     *
     * THIS IS THE IMPORTANT PART.
     *
     * The value's position between the smallest and largest
     * array elements determines its position in the scale.
     *
     * Example:
     *
     * smallest value
     *      |
     *      v
     *      C2 D2 E2 G2 A2 C3 ... A5 C6
     *                                   ^
     *                                   |
     *                              largest value
     *
     * Therefore the melody is still generated directly
     * from the data.
     */

    valueToFrequency(
        value,
        minimumValue,
        maximumValue
    ) {

        const midi =
            this.valueToMidiNote(
                value,
                minimumValue,
                maximumValue
            );


        return this.midiToFrequency(
            midi
        );
    }


    /**
     * =====================================================
     * VALUE TO MIDI NOTE
     * =====================================================
     */

    valueToMidiNote(
        value,
        minimumValue,
        maximumValue
    ) {

        const numericValue =
            Number(value);


        const minimum =
            Number(minimumValue);


        const maximum =
            Number(maximumValue);


        if (
            !Number.isFinite(numericValue)
            ||
            !Number.isFinite(minimum)
            ||
            !Number.isFinite(maximum)
            ||
            this.scaleMidiNotes.length
            ===
            0
        ) {

            return 60;
        }


        /*
         * If every value is identical, use the middle
         * note of the available musical range.
         */

        if (maximum <= minimum) {

            const middleIndex =
                Math.floor(
                    this.scaleMidiNotes.length
                    /
                    2
                );


            return this.scaleMidiNotes[
                middleIndex
            ];
        }


        /*
         * Determine the value's relative position in the
         * actual array value range.
         */

        let normalised =
            (
                numericValue
                -
                minimum
            )
            /
            (
                maximum
                -
                minimum
            );


        normalised =
            Math.max(
                0,
                Math.min(
                    1,
                    normalised
                )
            );


        /*
         * Convert that position onto the pentatonic scale.
         *
         * This is quantisation:
         *
         * arbitrary numerical value
         *          ↓
         * nearest available musical note
         */

        const scaleIndex =
            Math.round(
                normalised
                *
                (
                    this.scaleMidiNotes.length
                    -
                    1
                )
            );


        return this.scaleMidiNotes[
            scaleIndex
        ];
    }


    /**
     * =====================================================
     * MIDI TO FREQUENCY
     * =====================================================
     *
     * Standard equal temperament:
     *
     * A4 = MIDI 69 = 440 Hz
     */

    midiToFrequency(midiNote) {

        return (
            440
            *
            Math.pow(
                2,
                (
                    midiNote
                    -
                    69
                )
                /
                12
            )
        );
    }


    /**
     * =====================================================
     * PLAY MUSICAL NOTE
     * =====================================================
     *
     * Generates a warmer synthesised note than the old
     * single sine oscillator.
     */

    playMusicalNote(
        frequency,
        delay = 0,
        velocity = 1
    ) {

        if (
            !this.audioContext
            ||
            !this.masterGain
        ) {

            return;
        }


        const context =
            this.audioContext;


        const startTime =
            context.currentTime
            +
            delay;


        const duration =
            this.noteDuration;


        const endTime =
            startTime
            +
            duration;


        /* =================================================
           MAIN OSCILLATOR
           =================================================
         *
         * Triangle waves contain more harmonic information
         * than sine waves while remaining much softer than
         * square or sawtooth waves.
         */

        const mainOscillator =
            context.createOscillator();


        mainOscillator.type =
            "triangle";


        mainOscillator.frequency.setValueAtTime(
            frequency,
            startTime
        );


        /* =================================================
           SECOND HARMONIC
           =================================================
         *
         * A quiet sine oscillator one octave above gives
         * the tone a little brightness.
         */

        const harmonicOscillator =
            context.createOscillator();


        harmonicOscillator.type =
            "sine";


        harmonicOscillator.frequency.setValueAtTime(
            frequency * 2,
            startTime
        );


        /* =================================================
           INDIVIDUAL GAINS
           ================================================= */

        const mainGain =
            context.createGain();


        const harmonicGain =
            context.createGain();


        /* =================================================
           FILTER
           =================================================
         *
         * Smooth off some of the harsher high-frequency
         * content from the triangle oscillator.
         */

        const filter =
            context.createBiquadFilter();


        filter.type =
            "lowpass";


        filter.frequency.setValueAtTime(
            Math.min(
                5000,
                Math.max(
                    1200,
                    frequency * 5
                )
            ),
            startTime
        );


        filter.Q.setValueAtTime(
            0.7,
            startTime
        );


        /* =================================================
           CONNECT AUDIO GRAPH
           ================================================= */

        mainOscillator.connect(
            mainGain
        );


        harmonicOscillator.connect(
            harmonicGain
        );


        mainGain.connect(
            filter
        );


        harmonicGain.connect(
            filter
        );


        filter.connect(
            this.masterGain
        );


        /* =================================================
           AMPLITUDE
           ================================================= */

        const safeVelocity =
            Math.max(
                0.1,
                Math.min(
                    1,
                    velocity
                )
            );


        const mainPeak =
            0.115
            *
            safeVelocity;


        const harmonicPeak =
            0.025
            *
            safeVelocity;


        /* =================================================
           ENVELOPE
           =================================================
         *
         * A very short attack removes clicks.
         *
         * The short decay gives the notes a plucked,
         * mallet-like quality.
         */

        const attack =
            0.008;


        const decayStart =
            Math.min(
                0.030,
                duration * 0.40
            );


        mainGain.gain.setValueAtTime(
            0.0001,
            startTime
        );


        mainGain.gain.exponentialRampToValueAtTime(
            mainPeak,
            startTime + attack
        );


        mainGain.gain.exponentialRampToValueAtTime(
            mainPeak * 0.55,
            startTime + decayStart
        );


        mainGain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime
        );


        harmonicGain.gain.setValueAtTime(
            0.0001,
            startTime
        );


        harmonicGain.gain.exponentialRampToValueAtTime(
            harmonicPeak,
            startTime + attack
        );


        harmonicGain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime
        );


        /* =================================================
           START
           ================================================= */

        mainOscillator.start(
            startTime
        );


        harmonicOscillator.start(
            startTime
        );


        mainOscillator.stop(
            endTime + 0.02
        );


        harmonicOscillator.stop(
            endTime + 0.02
        );


        this.activeOscillators.add(
            mainOscillator
        );


        this.activeOscillators.add(
            harmonicOscillator
        );


        /* =================================================
           CLEANUP
           ================================================= */

        let finishedOscillators = 0;


        const cleanup =
            () => {

                finishedOscillators++;


                if (
                    finishedOscillators
                    <
                    2
                ) {

                    return;
                }


                this.activeOscillators.delete(
                    mainOscillator
                );


                this.activeOscillators.delete(
                    harmonicOscillator
                );


                try {

                    mainOscillator.disconnect();

                    harmonicOscillator.disconnect();

                    mainGain.disconnect();

                    harmonicGain.disconnect();

                    filter.disconnect();

                } catch (error) {

                    /*
                     * Nodes may already have been
                     * disconnected during reset/mute.
                     */
                }
            };


        mainOscillator.addEventListener(
            "ended",
            cleanup
        );


        harmonicOscillator.addEventListener(
            "ended",
            cleanup
        );


        this.noteCounter++;
    }


    /**
     * =====================================================
     * CAN PLAY
     * =====================================================
     */

    canPlay() {

        return (
            !this.muted
            &&
            this.volume > 0
        );
    }


    /**
     * =====================================================
     * ALLOW NEXT NOTE
     * =====================================================
     *
     * Prevent the audio engine from attempting to create
     * hundreds of notes at effectively the same instant.
     */

    allowNextNote() {

        if (!this.audioContext) {

            return false;
        }


        const currentTime =
            this.audioContext.currentTime;


        if (
            currentTime
            -
            this.lastNoteTime
            <
            this.minimumNoteInterval
        ) {

            return false;
        }


        this.lastNoteTime =
            currentTime;


        return true;
    }


    /**
     * =====================================================
     * SET VOLUME
     * =====================================================
     */

    setVolume(value) {

        let numericValue =
            Number(value);


        if (!Number.isFinite(numericValue)) {

            return;
        }


        numericValue =
            Math.max(
                0,
                Math.min(
                    100,
                    numericValue
                )
            );


        this.volume =
            numericValue
            /
            100;


        if (
            this.masterGain
            &&
            !this.muted
        ) {

            this.setMasterGain(
                this.volume
            );
        }
    }


    /**
     * =====================================================
     * GET VOLUME
     * =====================================================
     */

    getVolume() {

        return Math.round(
            this.volume
            *
            100
        );
    }


    /**
     * =====================================================
     * MUTE
     * =====================================================
     */

    mute() {

        this.muted =
            true;


        if (this.masterGain) {

            this.setMasterGain(
                0
            );
        }


        this.stopAllNotes();
    }


    /**
     * =====================================================
     * UNMUTE
     * =====================================================
     */

    unmute() {

        this.muted =
            false;


        this.initialise();


        if (this.masterGain) {

            this.setMasterGain(
                this.volume
            );
        }
    }


    /**
     * =====================================================
     * TOGGLE MUTE
     * =====================================================
     */

    toggleMute() {

        if (this.muted) {

            this.unmute();

        } else {

            this.mute();
        }


        return this.muted;
    }


    /**
     * =====================================================
     * IS MUTED
     * =====================================================
     */

    isMuted() {

        return this.muted;
    }


    /**
     * =====================================================
     * SET MASTER GAIN
     * =====================================================
     */

    setMasterGain(value) {

        if (
            !this.audioContext
            ||
            !this.masterGain
        ) {

            return;
        }


        const currentTime =
            this.audioContext.currentTime;


        const gain =
            Math.max(
                0,
                Math.min(
                    1,
                    value
                )
            );


        this.masterGain.gain.cancelScheduledValues(
            currentTime
        );


        this.masterGain.gain.setValueAtTime(
            this.masterGain.gain.value,
            currentTime
        );


        this.masterGain.gain.linearRampToValueAtTime(
            gain,
            currentTime + 0.025
        );
    }


    /**
     * =====================================================
     * STOP ALL NOTES
     * =====================================================
     */

    stopAllNotes() {

        for (
            const oscillator
            of this.activeOscillators
        ) {

            try {

                oscillator.stop();

            } catch (error) {

                /*
                 * Oscillator may already have stopped.
                 */
            }
        }


        this.activeOscillators.clear();
    }


    /**
     * =====================================================
     * SET NOTE DURATION
     * =====================================================
     */

    setNoteDuration(seconds) {

        const duration =
            Number(seconds);


        if (
            !Number.isFinite(duration)
            ||
            duration <= 0
        ) {

            return;
        }


        this.noteDuration =
            Math.max(
                0.025,
                Math.min(
                    0.30,
                    duration
                )
            );
    }


    /**
     * =====================================================
     * SET NOTE INTERVAL
     * =====================================================
     */

    setMinimumNoteInterval(seconds) {

        const interval =
            Number(seconds);


        if (
            !Number.isFinite(interval)
            ||
            interval < 0
        ) {

            return;
        }


        this.minimumNoteInterval =
            Math.max(
                0,
                Math.min(
                    0.10,
                    interval
                )
            );
    }
}