window.onload = () => {
     // `класс` роутера
    let Router = {

        // маршруты и соответствующие им обработчики
        routes: {
            "/catalog.html": "catalog",
            "/favorites.html": "favorites",
        },


        // метод проходиться по массиву routes и создает
        // создает объект на каждый маршрут
        init: function() {
        
            // объявляем свойство _routes
            this._routes = [];
            for( let route in this.routes ) {
    
                // имя метода-обрботчика
                let method = this.routes[route];
            
                // добавляем в массив роутов объект
                this._routes.push({
                
                    // регулярное выражение с которым будет сопоставляться ссылка
                    // ее надо преобразовать из формата :tag в RegEx
                    // модификатор g обязателен
                    pattern: new RegExp('^' + route.replace(/:\w+/g,'(\\w+)') + '$'),
                
                    // метод-обработчик
                    // определяется в объекте Route
                    // для удобства
                    callback: this[method]
                });

            }

        },
    
    
    
        dispatch: function(path) {
        
            // количество маршрутов в массиве
            var i = this._routes.length;
        
            // цикл до конца
            while( i-- ) {
            
                // если запрошенный путь соответствует какому-либо
                // маршруту, смотрим есть ли маршруты
                var args = path.match(this._routes[i].pattern);
            
                // если есть аргументы
                if( args ) {
                
                    // вызываем обработчик из объекта, передавая ему аргументы
                    // args.slice(1) отрезает всю найденную строку
                    this._routes[i].callback.apply(this,args.slice(1))
                }
            }
        },


        // обработчик
        // главной страницы
        catalog: function() {
            console.log("Catalog page");
        },


        // Избранное
        favorites: function() {
            console.log('Favorites page');
        },

    }
}