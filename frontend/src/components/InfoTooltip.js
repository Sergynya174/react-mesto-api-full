import React, { useEffect } from "react";

function InfoTooltip({ onClose, status: { isOpen, successful } }) {

  useEffect(() => {
    if (!isOpen) return;
    const handleEscapeClose = (evt) => {
      if (evt.key === 'Escape') {
        onClose()
      };
    };
    document.addEventListener('keyup', handleEscapeClose);
    return () => {
      document.removeEventListener('keyup', handleEscapeClose);
    };
  }, [isOpen, onClose])

  return (
    <div className={`popup ${isOpen && 'popup_opened'}`}>
      <form className="popup__container">
        <div className={`popup__status ${successful ? 'popup__status_ok' : 'popup__status_stop'}`}></div>
        <h2 className="popup__title-status">{successful ? 'Вы успешно зарегистрировались!' : 'Что-то пошло не так! Попробуйте еще раз.'}</h2>
        <button type="button" onClick={onClose} className="popup__close-btn"></button>
        <div onClick={onClose} className="popup__overlay"></div>
      </form>
    </div>
  );
}

export default InfoTooltip;
