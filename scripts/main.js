window.onload = function() {

    /* Получение и работа с данными */

    
    const requestUsers = 'https://json.medrating.org/users/'
    const requestAlbums = 'https://json.medrating.org/albums?userId=1'
    const requestImage = 'https://json.medrating.org/photos?albumId=1'

    function sendRequest(method, url) {
        try {
            return fetch(url, {
                method: method,
            }).then(response => {
                if (response.ok) {
                    return response.json()
                }
            
                return response.json().then(error => {
                    const e = new Error('Что-то пошло не так')
                    e.data = error
                    throw e
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    let arrayUsers = []
    let arrayAlbums = []
          
    sendRequest('GET', requestUsers)
        .then(dataUsers => {
            const listLvl1 = document.querySelector('.list[data-lvl-one]')
            dataUsers.forEach((user) => {
                arrayUsers.push(user.id)
                listLvl1.insertAdjacentHTML('beforeEnd', `
                    <li class="list__item" data-user-id="${user.id}">
                        <div class="list__block-item">
                            <span class="marker-list"></span>
                            <span class="list__text">${user.name}</span>
                        </div>
                    </li>
                    `
                )
            })
        })
        .catch(err => console.log(err))
    
    setTimeout(() => {
        console.log('optionsApp')
        /* Переключение состояния */

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
        // toggleClass('.nav', '.nav__link', 'btn--default-active')
        toggleClass('.card', '.favorites-icon', 'favorites-icon--active', 2)

        /* Модальное окно */

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

        /* Открытие и закрытие списака */
        
        const listItem = document.querySelectorAll('.list__block-item');
        listItem.forEach((item) => {
            item.addEventListener('click', () => {
                try {
                    if (!item.parentNode.hasAttribute('data-available') && item.parentNode.parentNode.hasAttribute('data-lvl-one')) {
                        item.parentNode.setAttribute('data-available', '')
                        sendRequest('GET', requestAlbums)
                        .then(dataAlbums => {
                            if (arrayUsers.indexOf(dataAlbums[0].userId) !== -1) {
                                const listItem = document.querySelector(`.list__item[data-user-id="${dataAlbums[0].userId}"]`)
                                listItem.insertAdjacentHTML('beforeEnd', `
                                    <ul class="list hidden" style="display: none;" data-lvl-two></ul>
                                    `
                                )
                                dataAlbums.forEach((album) => {
                                    arrayAlbums.push(album.id)
                                    listItem.querySelector('ul').insertAdjacentHTML('beforeEnd', `
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
                        })
                        .catch(err => console.log(err))
                    }

                    if (!item.parentNode.hasAttribute('data-available') && item.parentNode.hasAttribute('data-album-id')) {
                        console.log('true')
                        item.parentNode.setAttribute('data-available', '')
                        sendRequest('GET', requestImage)
                        .then(dataImage => {
                            if (arrayAlbums.indexOf(dataImage[0].albumId) !== -1) {
                                const listItem = document.querySelector(`.list__item[data-album-id="${dataImage[0].albumId}"]`)
                                listItem.insertAdjacentHTML('beforeEnd', `
                                    <ul class="list hidden" style="display: none;" data-lvl-three></ul>
                                    `
                                )
                                dataImage.forEach((image) => {
                                    listItem.querySelector('ul').insertAdjacentHTML('beforeEnd', `
                                        <li class="list__item">
                                            <div class="list__block-item">
                                                <span class="marker-list"></span>
                                                <span class="list__text">${image.title}</span>
                                            </div>
                                        </li>
                                        `
                                    )
                                })
                            }
                        })
                        .catch(err => console.log(err))
                    }

                    setTimeout(() => {
                        if (item.nextElementSibling.classList[0] === 'list') {
                            if (!item.nextElementSibling.classList.contains('hidden')) {
                                item.nextElementSibling.classList.remove('show')
                                item.nextElementSibling.classList.add('hidden')

                                item.nextElementSibling.animate([
                                    { height: item.nextElementSibling.offsetHeight + 'px' },
                                    { height: 0 },
                                ], {
                                    duration: 400,
                                    easing: 'linear',
                                })

                                setTimeout(() => {
                                    item.nextElementSibling.style.display = 'none'
                                    item.nextElementSibling.style.height = 'auto'
                                }, 400)

                                item.querySelector('.marker-list').classList.remove('marker-list--active')
                            } else {
                                item.nextElementSibling.classList.remove('hidden')
                                item.nextElementSibling.classList.add('show')
                                setTimeout(() => {
                                    item.nextElementSibling.style.display = 'grid'
                                    item.nextElementSibling.animate([
                                        { height: 0 },
                                        { height: item.nextElementSibling.offsetHeight + 'px' },
                                    ], {
                                        duration: 400,
                                        easing: 'linear',
                                    })
                                }, 0)
                                item.querySelector('.marker-list').classList.add('marker-list--active')
                            }
                        }
                    }, 300)
                } catch (e) {
                    console.log(e);
                }
            })
        })
        
    }, 1000)
    
}