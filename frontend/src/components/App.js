import { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import { api } from "../utils/Api";
import Footer from "./Footer";
import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import ProtectedRoute from "./ProtectedRoute";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import CurrentUserContext from "../contexts/CurrentUserContext";
import * as auth from "../utils/Auth";

function App() {
  const [currentUser, setCurrentUser] = useState({});
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [cards, setCards] = useState([]);
  const [isDataLoad, setIsDataLoad] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState({
    isOpen: false,
    successful: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      Promise.all([api.getProfile(), api.getCards()])
        .then(([res, initialCards]) => {
          setCurrentUser(res);
          setCards(initialCards);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loggedIn]);

  const handleEditProfileClick = () => {
    setEditProfilePopupOpen(true);
  };

  const handleEditAvatarClick = () => {
    setEditAvatarPopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    setAddPlacePopupOpen(true);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleInfoTooltip = (res) => {
    setIsInfoTooltipOpen({
      ...isInfoTooltipOpen,
      isOpen: true,
      successful: res,
    });
  };

  const closeAllPopups = () => {
    setEditProfilePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setAddPlacePopupOpen(false);
    setSelectedCard({});
    setIsInfoTooltipOpen(false);
  };

  function handleUpdateUser(newUserData) {
    setIsDataLoad(true);
    api
      .editProfile(newUserData)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsDataLoad(false);
      });
  }

  function handleUpdateAvatar(newAvatar) {
    setIsDataLoad(true);
    api
      .addAvatar(newAvatar)
      .then((res) => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsDataLoad(false);
      });
  }

  function handleCardLike(card) {
    //* Снова проверяем, есть ли уже лайк на данной карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    //* Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeCardLike(card._id, isLiked)
      .then((newCard) => {
        //* Формируем новый массив на основе имеющегося, подставляя в него новую карточку
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard : c))
        );
        //* Обновляем стейт
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    setIsDataLoad(true);
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((cards) =>
          cards.filter((newCard) => newCard._id !== card._id)
        );
        //* Обновляем стейт
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsDataLoad(false);
      });
  }

  function handleAddPlaceSubmit(data) {
    setIsDataLoad(true);
    api
      .addCard(data)
      .then((res) => {
        setCards([res, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsDataLoad(false);
      });
  }

  //* Проверка токена и авторизация пользователя
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth
        .checkToken(jwt)
        .then((data) => {
          if (data) {
            setProfileEmail(data.data.email);
            setLoggedIn(true);
            navigate("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [navigate]);

  //* Вход в систему
  function handleLogin({ email, password }) {
    auth
      .login(email, password)
      .then((res) => {
        if (res.token) {
          setProfileEmail(email);
          setLoggedIn(true);
          localStorage.setItem("jwt", res.token);
          navigate("/");
        }
      })
      .catch((err) => {
        handleInfoTooltip(false);
        console.log(err);
      });
  }

  //* Регистрация пользователя
  function handleRegister({ email, password }) {
    auth
      .register(email, password)
      .then((data) => {
        if (data) {
          handleInfoTooltip(true);
        }
      })
      .catch((err) => {
        handleInfoTooltip(false);
        console.log(err);
      });
  }

  //* Выход из системы
  const handleSignOut = () => {
    localStorage.removeItem("jwt");
    setProfileEmail("");
    setLoggedIn(false);
  };

  return (
    <div className="page">
      <CurrentUserContext.Provider value={currentUser}>
        <Header
          loggedIn={loggedIn}
          email={profileEmail}
          onSignOut={handleSignOut}
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                path="/"
                loggedIn={loggedIn}
                component={Main}
                onEditAvatar={handleEditAvatarClick}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onCardClick={handleCardClick}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
                cards={cards}
              />
            }
          />

          <Route
            path="/sign-up"
            element={<Register onRegister={handleRegister} />}
          />
          <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        <PopupWithForm
          name="delete"
          title="Вы уверены?"
          buttonText="Да"
        ></PopupWithForm>
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          isDataLoad={isDataLoad}
        />
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
          isDataLoad={isDataLoad}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddCard={handleAddPlaceSubmit}
          isDataLoad={isDataLoad}
        />

        <InfoTooltip onClose={closeAllPopups} status={isInfoTooltipOpen} />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;