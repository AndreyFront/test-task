window.onload = () => {

    /* Получение и работа с данными */

    const content = document.querySelector('.content')

    const requestUsers = 'https://json.medrating.org/users/'
    const requestAlbums = 'https://json.medrating.org/albums?userId='
    const requestImage = 'https://json.medrating.org/photos?albumId='

    let arrayUsers = []
    let arrayAlbums = []
    let arrayImages = [1, 2]

    function sendRequest(method, url) {
        try {
            return fetch(url, {
                method: method,
            }).then((response) => {
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
          
    sendRequest('GET', requestUsers)
        .then(dataUsers => {
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
        }).then(() => {
            content.addEventListener('click', (event) => {
                if (event.target.closest('.list__block-item')) {
                    const listItem = event.target.closest('.list__block-item')
                    try {
                        if (!listItem.parentNode.hasAttribute('data-available') && listItem.parentNode.hasAttribute('data-user-id')) {
                            listItem.parentNode.setAttribute('data-available', '')
                            let parentListIten = Number(listItem.parentNode.getAttribute('data-user-id'))
                            sendRequest('GET', `${requestAlbums + parentListIten}`)
                                .then((dataAlbums) => {
                                    if (arrayUsers.indexOf(dataAlbums[0].userId) !== -1 && parentListIten === dataAlbums[0].userId) {
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
                                }).then(() => {
                                    toggleList(listItem)
                                })
                                .catch(err => console.log(err))
                        }
        
                        if (!listItem.parentNode.hasAttribute('data-available') && listItem.parentNode.hasAttribute('data-album-id')) {
                            listItem.parentNode.setAttribute('data-available', '')
                            let parentListIten = Number(listItem.parentNode.getAttribute('data-album-id'))
                            sendRequest('GET', `${requestImage + parentListIten}`)
                                .then((dataImage) => {
                                    if (arrayAlbums.indexOf(dataImage[0].albumId) !== -1 && parentListIten === dataImage[0].albumId) {
                                        const listItem = document.querySelector(`.list__item[data-album-id="${dataImage[0].albumId}"]`)
                                        listItem.insertAdjacentHTML('beforeEnd', 
                                            `
                                                <ul class="list list-card hidden" style="display: none;" data-lvl-three></ul>
                                            `
                                        )
                                        let activeIcon = ''
                                        dataImage.forEach((image) => {
                                            activeIcon = ''
                                            if (arrayImages.indexOf(image.id) !== -1) activeIcon = 'favorites-icon--active'
                                            listItem.querySelector('ul').insertAdjacentHTML('beforeEnd', 
                                                `
                                                    <li class="list-card__item">
                                                        <div class="card">
                                                            <div class="card__block-img">
                                                                <img src="${image.thumbnailUrl}" data-src-full="${image.url}" alt="" class="card__img">
                                                                <span class="card__data-title">${image.title}</span>
                                                                <span class="favorites-icon ${activeIcon}" data-id-image="${image.id}"></span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                `
                                            )
                                        })
                                    }
                                }).then(() => {
                                    toggleList(listItem)
                                })
                                .catch(err => console.log(err))
                        }
                        toggleList(listItem)
                    } catch (e) {
                        console.log(e);
                    }
                }
            })
        })
        .catch(err => console.log(err))


    function toggleList(listItem) {
        if (listItem.nextElementSibling.classList[0] === 'list') {
            if (!listItem.nextElementSibling.classList.contains('hidden')) {
                listItem.nextElementSibling.classList.remove('show')
                listItem.nextElementSibling.classList.add('hidden')

                listItem.nextElementSibling.animate([
                    { height: listItem.nextElementSibling.offsetHeight + 'px' },
                    { height: 0 },
                ], {
                    duration: 400,
                    easing: 'linear',
                })

                setTimeout(() => {
                    listItem.nextElementSibling.style.display = 'none'
                    listItem.nextElementSibling.style.height = 'auto'
                }, 400)

                listItem.querySelector('.marker-list').classList.remove('marker-list--active')
            } else {
                listItem.nextElementSibling.classList.remove('hidden')
                listItem.nextElementSibling.classList.add('show')
                setTimeout(() => {
                    listItem.nextElementSibling.style.display = 'grid'
                    listItem.nextElementSibling.animate([
                        { height: 0 },
                        { height: listItem.nextElementSibling.offsetHeight + 'px' },
                    ], {
                        duration: 400,
                        easing: 'linear',
                    })
                }, 0)
                listItem.querySelector('.marker-list').classList.add('marker-list--active')
            }
        }
    }
    
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

    /* Добавление и удаление картинок в избранное */

    content.addEventListener('click', (event) => {
        if (event.target.closest('.favorites-icon')) {
            const favoritesIcon = event.target.closest('.favorites-icon')
            if (!favoritesIcon.classList.contains('favorites-icon--active')) {
                arrayImages.push(favoritesIcon.getAttribute('data-id-image'))
            } else {
                arrayImages.splice(arrayImages.indexOf(favoritesIcon.getAttribute('data-id-image')), 1)
            }
            console.log(arrayImages)
        }
    })
}