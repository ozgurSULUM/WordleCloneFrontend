import React from 'react';
function WordInput(props) {
    const { word, setWord, submitWord } = props;
    return (
        <div className='word-input mt-3' >
            <input type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitWord()}
                style={{ textTransform: 'uppercase' }}
            />
            <button
                onClick={submitWord}
                className='btn btn-light ms-3 mb-3'
            >enter</button>
        </div>
    );
}

export default WordInput;