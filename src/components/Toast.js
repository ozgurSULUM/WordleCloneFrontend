import React from 'react';

function Toast(props) {
    const { toastHeader, toastRef } = props;
    return (
        <>
            <div ref={toastRef} className='toast smooth-show' style={{ transition: 'All 0.4s' }}>
                <div className="toast-header">
                    <strong className='mx-auto'>{toastHeader}</strong>
                </div>
            </div>
        </>
    );
};

export default Toast;