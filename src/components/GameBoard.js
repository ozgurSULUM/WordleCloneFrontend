import React from 'react';
import '../css/GameBoard.css';
function GameBoard(props) {
    return (
        <div className="gameboard mt-3">
            {
                props.gameBoard.map((charArr, ind1) => (
                    <div className="row" key={ind1}>
                        { charArr.map((charObj, ind2) => (
                            <div key={ind2} className="card-custom-style" >
                                <div className={`flip-card-inner ${charObj.validationAnimation}`} style={{ animationName: charObj.animation_name }}>
                                    <div className='flip-card-front'>{charObj.char}</div>
                                    <div className={`flip-card-back ${charObj.validationColor}`}>{charObj.char}</div>
                                </div>

                            </div>

                        ))}
                    </div>
                ))
            }
        </div>
    );
}

export default GameBoard;