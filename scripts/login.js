window.addEventListener('load', function () {
    /* ---------------------- Global variables ---------------------- */
    const form = document.forms[0];
    const email = document.querySelector('#inputEmail')
    const password = document.querySelector('#inputPassword')
    const url = 'https://ctd-fe2-todo.herokuapp.com/v1';


    /* -------------------------------------------------------------------------- */
    /*            FUNCTION 1: Submit listener & Request settings                  */
    /* -------------------------------------------------------------------------- */
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        //Request body
        const payload = {
            email: email.value,
            password: password.value
        };
        //Fetch request configuration
        const settings = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        //Send login to API
        realizarLogin(settings);

        //Clean form
        form.reset();
    });


    /* -------------------------------------------------------------------------- */
    /*                     FUNCTION 2: Login [POST]                               */
    /* -------------------------------------------------------------------------- */
    function realizarLogin(settings) {
        console.log("Lanzando la consulta a la API...");
        fetch(`${url}/users/login`, settings)
            .then(response => {
                console.log(response);

                if (response.ok != true) {
                    alert("Alguno de los datos es incorrecto.")
                }

                return response.json();

            })
            .then(data => {
                console.log("Promesa cumplida:");
                console.log(data);

                if (data.jwt) {
                    //Store object with token in LocalStorage
                    localStorage.setItem('jwt', JSON.stringify(data.jwt));

                    //Redirection
                    location.replace('./mis-tareas.html');
                }
            }).catch(err => {
                console.log("Promesa rechazada:");
                console.log(err);
            })
    };


});