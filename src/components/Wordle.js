import React, { useEffect, useRef, useState } from 'react';
import GameBoard from './GameBoard';
import WordInput from './WordInput';
import Toast from './Toast';
import Header from './Header';
import axios from '../services/axios';

//Constant values.
const State = { GREEN: 'flip-card-back-bg-green', ORANGE: 'flip-card-back-bg-orange' };
const Animations = { VALIDATION_ANIMATION: 'validation_animation', INPUT_ANIMATION: 'inputAnimation', NONE_ANIMATION: 'none' };
const storedWordKey = 'quess_word';
const APIurls = { GET_WORD_URL: '/getword', CHECK_WORD_URL: '/checkword?word=' };
const toastStates = { SHOW: 'toast show', NO_SHOW: 'toast' };
const toastMessages = {
    WORD_NOT_FOUND: 'Bu kelime sözlükte bulunmuyor.', WORD_IS_FOUND: 'Bu kelime sözlükte var.'
    , CONGRATULATIONS: 'Tebrikler kelimeyi buldunuz.', GAME_OVER: "Kelimeyi bulamadınız kelime: "
};


class Char {
    constructor(char) {
        this.char = char;
        this.animation_name = 'none'; // For input animation inital state is none
        this.validationAnimation = ''; // For submit animation inital state empty
        this.validationColor = ''; // For submit animation inital state empty
    }
}

function Wordle() {
    const [quess, setQuess] = useState('');
    const [toastHeader, setToastHeader] = useState('');
    const [rowCounter, setRowCounter] = useState(0);
    const [gameBoard, setGameBoard] = useState([
        [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
        [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
        [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
        [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
        [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')]
    ]);
    const [word, setWord] = useState('');
    const toastRef = useRef(null);

    // Word request function
    const fetchQuessWord = () => {
        axios.get(APIurls.GET_WORD_URL).then((response) => {
            console.log("response.data.random_word: " + response.data.random_word);
            setQuess({ word: response.data.random_word });
            localStorage.setItem(storedWordKey, response.data.random_word);
        });
    }

    // Check if there any stored words in localStorage if not request from API
    useEffect(() => {

        const stored_word = localStorage.getItem(storedWordKey);

        if (stored_word === 'undefined' || stored_word === 'null' || stored_word === null || stored_word === undefined || stored_word === '') {
            console.log('request yapiliyor ve depolanaıyor.');
            fetchQuessWord();

        } else {
            console.log('store dan aliniyor');
            console.log("store'dan alinan kelime:" + stored_word);
            setQuess({ word: stored_word });
        }

    }, []);

    // If word changes update the gameboard.
    useEffect(() => {
        if (rowCounter === 5) return;
        const newGameBoard = [...gameBoard];
        const charArr = newGameBoard[rowCounter];
        for (let i = 0; i < 5; i++) {
            charArr[i].char = word[i]
            if (word[i] === undefined) {
                charArr[i].animation_name = Animations.NONE_ANIMATION;
            } else {
                charArr[i].animation_name = Animations.INPUT_ANIMATION;
            }
        }
        newGameBoard[rowCounter] = charArr;
        setGameBoard(newGameBoard);
    }, [word]);

    // Check word's characters and give them their corresponding states.
    const checkWord = () => {
        const char_states = { orange_chars: [], green_chars: [] };
        let green_set = new Set();
        let orange_set = new Set();
        let uppercase_word = word.toUpperCase();
        //console.log(uppercase_word);
        //console.log(quess.word);
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let char1 = uppercase_word[i];
                let char2 = quess.word[j];
                if (char1 === char2) {
                    if (i === j) {
                        green_set.add(i);
                    } else {
                        orange_set.add(i);
                    }
                }
            }
        }
        green_set.forEach((value) => {
            char_states.green_chars.push(value);
        });
        orange_set.forEach((value) => {
            if (green_set.has(value)) return;
            char_states.orange_chars.push(value);
        });
        console.log(char_states);
        return char_states;
    }

    //Show toast with given message
    const showToast = (message) => {
        setToastHeader(message);
        toastRef.current.className = toastStates.SHOW;
        setTimeout(() => {
            toastRef.current.className = toastStates.NO_SHOW;
        }, 3000);
        console.log("toast mesajı: " + message);
    }

    //Ask to API if the word is in dict or not.
    const isWordInDict = async () => {
        let url = APIurls.CHECK_WORD_URL.concat(word.toUpperCase());
        const response = await axios.get(url);
        if (!response.data.exists) {
            showToast(toastMessages.WORD_NOT_FOUND);
            return Promise.reject(toastMessages.WORD_NOT_FOUND);
        } else {
            console.log(toastMessages.WORD_IS_FOUND);
            return Promise.resolve(toastMessages.WORD_IS_FOUND);
        }
    }


    //resets gameboard after game ends
    const resetGameBoard = () => {
        setGameBoard([
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')]
        ]);
    }

    const submitWord = () => {
        isWordInDict().then((exists) => {
            console.log("exists" + exists);
            const newGameBoard = [...gameBoard];
            const charArr = newGameBoard[rowCounter];
            console.log(quess.word);
            const result_obj = checkWord();
            let successRate = 0;
            let i = 0;
            for (let character of charArr) {
                if (result_obj.green_chars.indexOf(i) > -1) {
                    character.validationColor = State.GREEN;
                    successRate += 1;
                }
                else if (result_obj.orange_chars.indexOf(i) > -1) {
                    character.validationColor = State.ORANGE;
                }
                character.validationAnimation = Animations.VALIDATION_ANIMATION;
                i += 1;
            }

            setGameBoard(newGameBoard);
            setRowCounter(prevRowCounter => ++prevRowCounter);
            setWord('');

            if (successRate === 5) {
                setToastHeader(toastMessages.CONGRATULATIONS);
                toastRef.current.className = toastStates.SHOW;
                setTimeout(() => {
                    toastRef.current.className = toastStates.NO_SHOW;
                }, 3000);
                console.log(toastMessages.CONGRATULATIONS);

                localStorage.removeItem(storedWordKey);
                fetchQuessWord();
                setTimeout(() => {
                    resetGameBoard();
                    setRowCounter(0);
                }, 4000)

            }
            else if (rowCounter === 4) {
                setToastHeader(toastMessages.GAME_OVER + quess.word);
                toastRef.current.className = toastStates.SHOW;
                setTimeout(() => {
                    toastRef.current.className = toastStates.NO_SHOW;
                }, 3000);
                console.log(toastMessages.GAME_OVER + quess.word);
                localStorage.removeItem(storedWordKey);
                fetchQuessWord();
                setTimeout(() => {
                    resetGameBoard();
                    setRowCounter(0);
                }, 4000)
            }
        }, (reject) => {
            console.log("reject" + reject);
        });
    };

    return (
        <div className="container-fluid vh-100">
            <div className="container h-100 d-flex flex-column align-items-center">
                <Header />
                <GameBoard gameBoard={gameBoard} />
                <WordInput word={word} setWord={setWord} submitWord={submitWord} />
                <Toast toastHeader={toastHeader} toastRef={toastRef} />
            </div>
        </div>
    );
}

export default Wordle;