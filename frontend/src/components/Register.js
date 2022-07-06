import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = ({ onRegister }) => {

  const [profileData, setProfileData] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setProfileData((profileData) => ({ ...profileData, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onRegister(profileData)
  }

  return (
    <form className="register" onSubmit={handleSubmit}>
      <h1 className="register__title">Регистрация</h1>
      <input
        autoComplete="on"
        className="register__input"
        placeholder="Email"
        id="email"
        name="email"
        type="email"
        value={profileData.email}
        onChange={handleChange}
        minLength="2"
        maxLength="40"
        required
      />
      <span id="register-email-error" className="error"></span>
      <input
        autoComplete="on"
        className="register__input"
        placeholder="Пароль"
        id="password"
        name="password"
        type="password"
        value={profileData.password}
        onChange={handleChange}
        minLength="2"
        maxLength="40"
        required
      />
      <span id="register-password-error" className="error"></span>
      <button type="submit" className="register__button">
        Зарегистрироваться
      </button>
      <Link to="/sign-in" className="register__link">
        Уже зарегистрированы? Войти
      </Link>
    </form>
  );
}

export default Register;
