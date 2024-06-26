import React from "react";
import * as SortingAlgorithms from "../SortingAlgorithms/SortingAlgorithms.js";
import "./SortingVisualizer.css";

// Change this value for the speed of the animations.
const ANIMATION_SPEED_MS = 20;

// Change this value for the number of bars (value) in the array.
const NUMBER_OF_ARRAY_BARS = 50


export default class SortingVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            array: [],
            selectedAlgorithm: null,
            mainColor: "#9b9b9b",
            mainColorDark: "#FFFFFF",
            isAnimating: false,
        };
    }

    componentDidMount() {
        this.resetArray();
    }

    resetArray() {
        if (this.state.isAnimating) return;

        const array = [];
        for (let i = 0; i < NUMBER_OF_ARRAY_BARS; i++) {
            array.push(randomIntFromInterval(10, 650));
        }
        this.setState({ array });
    }

    setButtonColor(algorithm, color) {
        const button = document.querySelector(`.algorithm-button[data-algorithm="${algorithm}"]`);
        button.style.backgroundColor = color;
    }

    setSelectedAlgorithm(algorithm, selectedColor, selectedColorDark) {
        if (this.state.isAnimating) return;

        // Creamy orange: #F67451
        const defaultColor = "#363030";

        // Update selected button color
        const selectedButton = document.querySelector(`.algorithm-button[data-algorithm="${algorithm}"]`);
        selectedButton.style.backgroundColor = selectedColor;

        // Set algorithm button colors to default color
        const buttons = document.querySelectorAll(".algorithm-button");
        buttons.forEach(button => {
            if (button !== selectedButton) {
                button.style.backgroundColor = defaultColor;
            }
        });

        // Update bar colors
        const arrayBars = document.getElementsByClassName("array-bar");
        for (let i = 0; i < arrayBars.length; i++) {
            arrayBars[i].style.backgroundColor = selectedColor;
        }

        const playButton = document.getElementsByClassName("play-button")[0];
        const resetButton = document.getElementsByClassName("reset-button")[0];

        // Remove existing hover-effect style element if any
        const existingStyleElement = document.getElementById("hover-effect-style");
        if (existingStyleElement) {
            existingStyleElement.remove();
        }

        // Create a new style element for the hover effect
        const style = document.createElement("style");
        style.id = "hover-effect-style";
        style.innerHTML = `
        .hover-effect:hover {
            background-color: ${selectedColor};
        }
    `;
        document.head.appendChild(style);

        // Add the hover effect class to the buttons
        playButton.classList.add("hover-effect");
        resetButton.classList.add("hover-effect");


        this.setState({
            selectedAlgorithm: algorithm,
            mainColor: selectedColor,
            mainColorDark: selectedColorDark,
        });
    }

    play() {
        const selectedAlgorithm = this.state.selectedAlgorithm;

        if (this.state.isAnimating || !selectedAlgorithm) return;

        const array = this.state.array.slice();
        const animations = SortingAlgorithms[selectedAlgorithm](array);
        this.animate(animations);

        // hacky fix
        setTimeout(() => {
            SortingAlgorithms[selectedAlgorithm](this.state.array);
        }, animations.length * ANIMATION_SPEED_MS);
    }

    animate(animations) {
        this.setState({ isAnimating: true });

        const originalColor = this.state.mainColor;
        const compareColor = this.state.mainColorDark;

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName("array-bar");
            const [barOneIdx, barTwoIdx] = animations[i].indices;
            const animationType = animations[i].type;

            setTimeout(() => {
                if (animationType === "swap") {
                    const barOneHeight = arrayBars[barOneIdx].style.height;
                    const barTwoHeight = arrayBars[barTwoIdx].style.height;
                    arrayBars[barOneIdx].style.height = barTwoHeight;
                    arrayBars[barTwoIdx].style.height = barOneHeight;

                } else if (animationType === "compare") {
                    // Change the colors to indicate comparison
                    arrayBars[barOneIdx].style.backgroundColor = compareColor;
                    arrayBars[barTwoIdx].style.backgroundColor = compareColor;

                    // Change the colors back to original after a short delay
                    setTimeout(() => {
                        arrayBars[barOneIdx].style.backgroundColor = originalColor;
                        arrayBars[barTwoIdx].style.backgroundColor = originalColor;
                    }, ANIMATION_SPEED_MS);
                } else if (animationType === "insert") {
                    const newHeight = barTwoIdx;
                    arrayBars[barOneIdx].style.height = `${newHeight}px`;
                }
            }, i * ANIMATION_SPEED_MS);
        }
        // Set isAnimating to false after all animations are done
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, animations.length * ANIMATION_SPEED_MS);
    }

    render() {
        const { array } = this.state;

        return (
            <div className="visualizer-container">

                <div className="button-container">
                    <button className="reset-button" onClick={() => this.resetArray()}>Generate New Array</button>

                    {/* add defualt-color attribute */}
                    <button className="algorithm-button" data-algorithm="quickSort" onClick={() => this.setSelectedAlgorithm("quickSort", "#68bbd6", "#1c6c87")}
                        onMouseEnter={() => this.setButtonColor("quickSort", "#68bbd6")}
                        onMouseLeave={() => { if (this.state.selectedAlgorithm !== "quickSort") { this.setButtonColor("quickSort", "#363030") } }}>Quick Sort</button>
                    <button className="algorithm-button" data-algorithm="heapSort" onClick={() => this.setSelectedAlgorithm("heapSort", "#a977ea", "#50218d")}
                        onMouseEnter={() => this.setButtonColor("heapSort", "#a977ea")}
                        onMouseLeave={() => { if (this.state.selectedAlgorithm !== "heapSort") { this.setButtonColor("heapSort", "#363030") } }}>Heap Sort</button>
                    <button className="algorithm-button" data-algorithm="mergeSort" onClick={() => this.setSelectedAlgorithm("mergeSort", "#f47b89", "#8c1a27")}
                        onMouseEnter={() => this.setButtonColor("mergeSort", "#f47b89")}
                        onMouseLeave={() => { if (this.state.selectedAlgorithm !== "mergeSort") { this.setButtonColor("mergeSort", "#363030") } }}>Merge Sort</button>
                    <button className="algorithm-button" data-algorithm="bubbleSort" onClick={() => this.setSelectedAlgorithm("bubbleSort", "#5abe91", "#15754a")}
                        onMouseEnter={() => this.setButtonColor("bubbleSort", "#5abe91")}
                        onMouseLeave={() => { if (this.state.selectedAlgorithm !== "bubbleSort") { this.setButtonColor("bubbleSort", "#363030") } }}>Bubble Sort</button>

                    <button className="play-button" onClick={() => this.play()}>Play</button>
                </div>

                <div className="array-container">
                    {array.map((value, idx) => (
                        <div
                            className="array-bar"
                            key={idx}
                            style={{ height: `${value}px` }}></div>
                    ))}
                </div>

            </div>
        );
    }
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}