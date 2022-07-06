import React from "react";
import logo from "../images/logo.svg";
import { useLocation, Link } from "react-router-dom";

function Header({ email, onSignOut }) {

  const location = useLocation();

  return (
    <header className="header" href='/'>
      <a className="header__link">
        <img className="header__logo" src={logo} alt="Логотип" />
      </a>
      {location.pathname === "/" && (
        <div className="header__contener">
          <p className="header__user-email">{email}</p>
          <Link className="header__button" to="/sign-in" onClick={onSignOut}>
            Выйти
          </Link>
        </div>
      )}
      {location.pathname === "/sign-up" && (
        <div className="header__contener">
          <Link className="header__button" to="/sign-in">
            Войти
          </Link>
        </div>
      )}
      {location.pathname === "/sign-in" && (
        <div className="header__contener">
          <Link className="header__button" to="/sign-up">
            Регистрация
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
