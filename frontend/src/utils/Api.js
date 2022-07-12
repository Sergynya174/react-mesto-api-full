class Api {
    constructor(options){
        this._options = options;
    }

    _getResponseData(res) {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
    }

    getProfile() {
        return fetch(`${this._options.url}/users/me`, {
            method: 'GET',
            headers: this._options.headers
        }).then(this._getResponseData);
    }
    
    getCards() {
        return fetch(`${this._options.url}/cards`, {
            method: 'GET',
            headers: this._options.headers
        }).then(this._getResponseData);
    }
    
    editProfile(userData) {
        return fetch(`${this._options.url}/users/me`, {
            method: 'PATCH',
            headers: this._options.headers,
            body: JSON.stringify({
                name: userData.name,
                about: userData.about
            })
        }).then(this._getResponseData);
    }

    addCard(data) {
        return fetch(`${this._options.url}/cards`, {
            method: 'POST',
            headers: this._options.headers,
            body: JSON.stringify({
                name: data.name,
                link: data.link
            })
        }).then(this._getResponseData);
    }

    deleteCard(id) {
        return fetch(`${this._options.url}/cards/${id}`, {
            method: 'DELETE',
            headers: this._options.headers
        }).then(this._getResponseData);
    }

    changeCardLike(id, isLiked) {
        return fetch(`${this._options.url}/cards/${id}/likes`, {
            method: !isLiked ? 'PUT' : 'DELETE',
            headers: this._options.headers
        }).then(this._getResponseData);
    }

    addAvatar(data) {
        return fetch(`${this._options.url}/users/me/avatar`, {
            method: 'PATCH',
            headers: this._options.headers,
            body: JSON.stringify({
                avatar: data.url
            })
        }).then(this._getResponseData);
    }
}

export const api = new Api ({
    url: 'https://api.sergynya174.developer.nomoredomains.xyz',
    headers: {
    authorization: `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json; charset=utf-8'
  }
})

export default api;