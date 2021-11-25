
// Получение и работа с данными

const content = document.querySelector('.content')

const requestUsers = 'https://json.medrating.org/users/'
const requestAlbums = 'https://json.medrating.org/albums?userId='
const requestImage = 'https://json.medrating.org/photos?albumId='

let arrayUsers = []
let arrayAlbums = []
let arrayImages = []

function sendRequest(method, url) {
    try {
        return fetch(url, {
            method: method,
        }).then((response) => {
            if (response.ok) {
                return response.json()
            }
        
            return response.json().then(error => {
                content.innerHTML = ' '
                content.insertAdjacentHTML('beforeEnd', notice('./static/img/error.png', 'Сервер не отвечает', 'Уже работаем над этим', true))

                const e = new Error('Что-то пошло не так')
                e.data = error
                console.log(error)
                throw e
            })
        })
    } catch (e) {
        console.log(e)
    }
}

// Уведомления 

function notice(image, title, desc, needMT = false) {
    (needMT !== false) ? needMT = 'notice--mt' : needMT = ''
    return  `
                <div class="notice ${needMT}">
                    <div class="notice__block-img">
                        <img src="${image}" class="notice__img" alt="">
                    </div>
                    <div class="notice__block-info">
                        <div class="notice__block-title">
                            <span class="notice__title">${title}</span>
                        </div>
                        <div class="notice__block-desc">
                            <span class="notice__desc">${desc}</span>
                        </div>
                    </div>
                </div>
            `
}

// Работа списка
    
function toggleList(listItem) {
    const list = listItem.nextElementSibling
    if (list) {
        if (!list.classList.contains('hidden')) {
            list.classList.remove('show')
            list.classList.add('hidden')

            list.animate([
                { height: list.offsetHeight + 'px' },
                { height: 0 },
            ], {
                duration: 400,
                easing: 'linear',
            })

            setTimeout(() => {
                list.style.display = 'none'
                list.style.height = 'auto'
            }, 400)

            listItem.querySelector('.marker-list').classList.remove('marker-list--active')
        } else {
            list.classList.remove('hidden')
            list.classList.add('show')

            list.style.display = 'grid'
            list.animate([
                { height: 0 },
                { height: list.offsetHeight + 'px' },
            ], {
                duration: 400,
                easing: 'linear',
            })
            listItem.querySelector('.marker-list').classList.add('marker-list--active')
        }
    }
}

// Удаление класса

function removeClass(elem, removeClass) {
    document.querySelector(elem).classList.remove(removeClass)
}

// Добавление класса

function addClass(elem, addClass) {
    document.querySelector(elem).classList.add(addClass)
}

// Переключение состояния

function toggleClass(main, elem, toggleClass, mode = 1) {
    document.addEventListener('click', (event) => {
        if (event.target.closest(main) && event.target.closest(elem)) {
            const path = event.target.closest(main)
            const mainElem = event.target.closest(elem)
            switch(mode) {
                case 1: 
                    const allElem = path.querySelectorAll(elem)
                    allElem.forEach((item) => item.classList.remove(toggleClass))
                    mainElem.classList.add(toggleClass)
                    break;
                case 2: 
                    mainElem.classList.toggle(toggleClass)
                    break;  
                default:
                break;
            }
        }
    })
}
toggleClass('.nav', '.nav__link', 'btn--default-active')
toggleClass('.card', '.favorites-icon', 'favorites-icon--active', 2)

// Модальное окно

function modalWindow(main, img) {
    document.addEventListener('click', (event) => {
        if (event.target.closest(main) && event.target.closest(img)) {
            const image = event.target.closest(img)
            if (!image.getAttribute('data-src-full')) return
            const srcImage = image.getAttribute('data-src-full')
            
            const modalWindow = document.querySelector('.modal-window')
            const modalImage = document.querySelector('.modal-window__img')
            modalImage.setAttribute('src', srcImage)
            document.body.classList.add('body-lock-scroll')
            modalWindow.classList.add('modal-window--active')
        }
    })
}

modalWindow('.card', '.card__img')

{
    const modalOverlay = document.querySelector('.modal-window__overlay')
    const modalClose = document.querySelector('.modal-window__close')
    const modalWindow = document.querySelector('.modal-window')

    function closeModal(elment, closeElem, removeClass) {
        elment.addEventListener('click', () => {
            closeElem.classList.remove(removeClass)
            document.body.classList.remove('body-lock-scroll')
        })
    }

    closeModal(modalOverlay, modalWindow, 'modal-window--active')
    closeModal(modalClose, modalWindow, 'modal-window--active')
}

// Обновление данных из localStorage

function updateLocalStorage() {
    if (localStorage.getItem('favoritesImage') != '') arrayImages = JSON.parse(localStorage.getItem('favoritesImage'))
}

// Добавление и удаление картинок в избранное

content.addEventListener('click', (event) => {
    if (event.target.closest('.favorites-icon')) {
        const card = event.target.closest('.card')
        const cardImg = card.querySelector('.card__img')
        const cardTitle = card.querySelector('.card__data-title')
        const cardTitleText = cardTitle.textContent
        const favoritesIcon = event.target.closest('.favorites-icon')

        const dataImageSrc = cardImg.getAttribute('src')
        const datdImageSrcFull = cardImg.getAttribute('data-src-full')
        const cardImageId = cardImg.getAttribute('data-id-image')

        if (!favoritesIcon.classList.contains('favorites-icon--active')) {

            updateLocalStorage()

            arrayImages.push({id: cardImageId, src: dataImageSrc, srcFull: datdImageSrcFull, title: cardTitleText})
            localStorage.setItem('favoritesImage', JSON.stringify(arrayImages))
        } else {
            arrayImages = JSON.parse(localStorage.getItem('favoritesImage'))
            arrayImages.splice(arrayImages.findIndex(el => el.id === cardImageId), 1)
            localStorage.setItem('favoritesImage', JSON.stringify(arrayImages))
        }
    }
})

// Роутинг

window.addEventListener('hashchange', () => {
    const location = window.location.hash
    if (location) {
        router(location)
    }
})

window.addEventListener('load', () => {
    const location = window.location.href
    if (location) {
        router(location)
    }
})

function router(location) {
    const content = document.querySelector('.content')
    this.event.preventDefault()

    history.pushState('', '', location)

    switch (location) {
        case '#/favorites':
            removeClass('.nav__link[data-url="#/catalog"]', 'btn--default-active')
            addClass('.nav__link[data-url="#/favorites"]', 'btn--default-active')
            removeClass('.content', 'content--active')
            setTimeout(() => {
                addClass('.content', 'content--active')
            }, 0)
            content.innerHTML = ' '
            content.insertAdjacentHTML('beforeEnd',
                `
                    <ul class="list list-card list-card--content-center"></ul>
                `
            )
            let activeIcon = 'favorites-icon--active'

            updateLocalStorage()

            if (arrayImages !== undefined) {
                if (arrayImages.length > 0) {
                    arrayImages.forEach((image) => {
                        content.querySelector('ul').insertAdjacentHTML('beforeEnd', 
                            `
                                <li class="list-card__item">
                                    <div class="card">
                                        <div class="card__block-img">
                                            <img src="${image.src}" data-src-full="${image.srcFull}" data-id-image="${image.id}" alt="" class="card__img">
                                            <span class="card__data-title hide">${image.title}</span>
                                            <span class="favorites-icon ${activeIcon}"></span>
                                        </div>
                                        <div class="card__block-desc">
                                            <p>${image.title}</p>
                                        </div>
                                    </div>
                                </li>
                            `
                        )
                    })
                } else {
                    content.innerHTML = ' '
                    content.insertAdjacentHTML('beforeEnd', notice('./static/img/empty.png', 'Список избранного пуст', 'Добавляйте изображения, нажимая на звездочки', true))
                }
            }
            break
        default:
            addClass('.nav__link[data-url="#/catalog"]', 'btn--default-active')
            removeClass('.nav__link[data-url="#/favorites"]', 'btn--default-active')
            removeClass('.content', 'content--active')
            setTimeout(() => {
                addClass('.content', 'content--active')
            }, 0)
            content.innerHTML = ' '
            sendRequest('GET', requestUsers)
            .then((dataUsers) => {
                content.insertAdjacentHTML('beforeEnd', 
                    `
                        <ul class="list" data-lvl-one></ul>
                    `
                )
                return dataUsers
            })
            .then((dataUsers) => {
                const listLvl1 = document.querySelector('.list[data-lvl-one]')
                dataUsers.forEach((user) => {
                    arrayUsers.push(user.id)
                    
                    listLvl1.insertAdjacentHTML('beforeEnd', 
                        `
                            <li class="list__item" data-user-id="${user.id}">
                                <div class="list__block-item">
                                    <span class="marker-list"></span>
                                    <span class="list__text">${user.name}</span>
                                </div>
                            </li>
                        `
                    )
                })
            }).catch(err => console.log(err))
            .then(() => {
                content.addEventListener('click', (event) => {
                    if (event.target.closest('.list__block-item')) {
                        const listItem = event.target.closest('.list__block-item')
                        try {
                            if (!listItem.parentNode.hasAttribute('data-available') && listItem.parentNode.hasAttribute('data-user-id')) {
                                listItem.parentNode.setAttribute('data-available', '')
                                let parentListItem = Number(listItem.parentNode.getAttribute('data-user-id'))
                                sendRequest('GET', `${requestAlbums + parentListItem}`)
                                    .then((dataAlbums) => {
                                        if (arrayUsers.indexOf(dataAlbums[0].userId) !== -1 && parentListItem === dataAlbums[0].userId) {
                                            const listItem = document.querySelector(`.list__item[data-user-id="${dataAlbums[0].userId}"]`)
                                            listItem.insertAdjacentHTML('beforeEnd', `
                                                <ul class="list hidden" style="display: none;" data-lvl-two></ul>
                                                `
                                            )
                                            dataAlbums.forEach((album) => {
                                                arrayAlbums.push(album.id)
                                                listItem.querySelector('ul').insertAdjacentHTML('beforeEnd', 
                                                    `
                                                        <li class="list__item" data-album-id="${album.id}">
                                                            <div class="list__block-item">
                                                                <span class="marker-list"></span>
                                                                <span class="list__text">${album.title}</span>
                                                            </div>
                                                        </li>
                                                    `
                                                )
                                            })
                                        }
                                        return listItem
                                    }).then((listItem) => {
                                        toggleList(listItem)
                                    })
                                    .catch(err => console.log(err))
                            }
            
                            if (!listItem.parentNode.hasAttribute('data-available') && listItem.parentNode.hasAttribute('data-album-id')) {
                                listItem.parentNode.setAttribute('data-available', '')
                                let parentListItem = event.target.closest('.list__item[data-album-id]').getAttribute('data-album-id')
                                sendRequest('GET', `${requestImage + parentListItem}`)
                                    .then((dataImage) => {
                                        if (arrayAlbums.indexOf(dataImage[0].albumId) !== -1 && +parentListItem === dataImage[0].albumId) {
                                            let listItem = document.querySelector(`.list__item[data-album-id="${dataImage[0].albumId}"]`)
                                            listItem.insertAdjacentHTML('beforeEnd', 
                                                `
                                                    <ul class="list list-card hidden" style="display: none;" data-lvl-three></ul>
                                                `
                                            )
                                            let activeIcon = ''
                                            updateLocalStorage()

                                            dataImage.forEach((image) => {
                                                activeIcon = ''
                                                if (arrayImages !== undefined) {
                                                    if (arrayImages.findIndex(el => el.id == image.id) != -1) activeIcon = 'favorites-icon--active'
                                                }
                                                listItem.querySelector('ul').insertAdjacentHTML('beforeEnd', 
                                                    `
                                                        <li class="list-card__item">
                                                            <div class="card">
                                                                <div class="card__block-img">
                                                                    <img src="${image.thumbnailUrl}" data-src-full="${image.url}" data-id-image="${image.id}" alt="" class="card__img">
                                                                    <span class="card__data-title">${image.title}</span>
                                                                    <span class="favorites-icon ${activeIcon}"></span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    `
                                                )
                                            })
                                        }
                                        return listItem
                                    }).then((listItem) => {
                                        toggleList(listItem)
                                    })
                                    .catch(err => console.log(err))
                            }
                            
                        } catch (e) {
                            console.log(e);
                        }
                    }
                })
            })
            .catch(err => console.log(err))
        break
    }
}

content.addEventListener('click', (event) => {
    if (event.target.closest('.list__block-item')) {
        toggleList(event.target.closest('.list__block-item'))
    }
})