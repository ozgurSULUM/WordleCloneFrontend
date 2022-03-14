import React, { useEffect, useRef, useState, useCallback } from 'react';
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
    CONGRATULATIONS: 'Tebrikler kelimeyi buldunuz.', GAME_OVER: "Kelimeyi bulamadınız kelime: "
};
const wordExists = { WORD_NOT_FOUND: 'Bu kelime sözlükte bulunmuyor.', WORD_IS_FOUND: 'Bu kelime sözlükte var.' };

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
    const fetchQuessWord = useCallback(() => {
        axios.get(APIurls.GET_WORD_URL).then((response) => {
            setQuess({ word: response.data.random_word });
            localStorage.setItem(storedWordKey, response.data.random_word);
        });
    }, []);

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

    }, [fetchQuessWord]);

    // If word changes update the gameboard.
    useEffect(() => {
        setGameBoard((prevGameBoard) => {
            if (rowCounter === 5) return;
            const newGameBoard = [...prevGameBoard];
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
            return newGameBoard;
        });
    }, [word]);

    // Check word's characters and give them their corresponding states.
    const checkWord = () => {
        const char_states = { orange_chars: [], green_chars: [] };
        let green_set = new Set();
        let orange_set = new Set();
        let uppercase_word = word.toUpperCase();
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
    const showToast = useCallback((message) => {
        setToastHeader(message);
        toastRef.current.className = toastStates.SHOW;
        setTimeout(() => {
            toastRef.current.className = toastStates.NO_SHOW;
        }, 3000);
        console.log("toast mesajı: " + message);
    }, []);

    //Ask to API if the word is in dict or not.
    const isWordInDict = async () => {
        let url = APIurls.CHECK_WORD_URL.concat(word.toUpperCase());
        const response = await axios.get(url);
        if (!response.data.exists) {
            showToast(wordExists.WORD_NOT_FOUND);
            return Promise.reject(wordExists.WORD_NOT_FOUND);
        } else {
            console.log(wordExists.WORD_IS_FOUND);
            return Promise.resolve(wordExists.WORD_IS_FOUND);
        }
    };

    //resets gameboard after game ends
    const resetGameBoard = useCallback(() => {
        setGameBoard([
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')],
            [new Char(''), new Char(''), new Char(''), new Char(''), new Char('')]
        ]);
    }, []);

    const submitWord = () => {
        const setValidationAnimation = (prevGameBoard) => {
            const newGameBoard = [...prevGameBoard];
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

            return newGameBoard;
        }
        isWordInDict().then((exists) => {
            console.log('word exists ' + exists);
            setGameBoard((prevGameBoard) => setValidationAnimation(prevGameBoard));
            setRowCounter(prevRowCounter => ++prevRowCounter);
            setWord('');

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