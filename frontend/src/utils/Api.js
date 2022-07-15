class Api {
    constructor({ baseUrl }){
        this._baseUrl = baseUrl;
    }

    _getResponseData(res) {
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
    }

    getProfile() {
        return fetch(`${this._baseUrl}/users/me`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
        }).then(this._getResponseData);
    }
    
    getCards() {
        return fetch(`${this._baseUrl}/cards`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
        }).then(this._getResponseData);
    }
    
    editProfile(data) {
        return fetch(`${this._baseUrl}/users/me`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify({
                name: data.name,
                about: data.about
            })
        }).then(this._getResponseData);
    }

    addCard(data) {
        return fetch(`${this._baseUrl}/cards`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
            body: JSON.stringify({
                name: data.name,
                link: data.link
            })
        }).then(this._getResponseData);
    }

    deleteCard(id) {
        return fetch(`${this._baseUrl}/cards/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
        }).then(this._getResponseData);
    }

    changeCardLike(id, isLiked) {
        return fetch(`${this._baseUrl}/cards/${id}/likes`, {
            method: !isLiked ? 'PUT' : 'DELETE',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
        }).then(this._getResponseData);
    }

    addAvatar(data) {
        return fetch(`${this._baseUrl}/users/me/avatar`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
              },
            body: JSON.stringify({
                avatar: data.url
            })
        }).then(this._getResponseData);
    }
}

export const api = new Api ({
    baseUrl: 'https://api.sergynya174.developer.nomoredomains.xyz',
})

export default api;