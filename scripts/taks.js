// SECURITY: If it's not user info on localStorage, denegate access and redirect to login.
if (!localStorage.jwt) {
  location.replace('./index.html');
}

/* ------ First load document, then functionalities ------ */
window.addEventListener('load', function () {
  /* ------------------------- iniciamos libreria AOS ------------------------- */
  AOS.init();

  const urlTareas = 'https://ctd-fe2-todo.herokuapp.com/v1/tasks';
  const urlUsuario = 'https://ctd-fe2-todo.herokuapp.com/v1/users/getMe';
  const token = JSON.parse(localStorage.jwt);

  const formCrearTarea = document.querySelector('.nueva-tarea');
  const nuevaTarea = document.querySelector('#nuevaTarea');
  const btnCerrarSesion = document.querySelector('#closeApp');

  obtenerNombreUsuario();
  consultarTareas();


  /* -------------------------------------------------------------------------- */
  /*                          FUNCTION 1 - Close session                        */
  /* -------------------------------------------------------------------------- */

  btnCerrarSesion.addEventListener('click', function () {

    Swal.fire({
      title: '¿Desea cerrar sesión?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          '¡Hasta luego!',
          'Te esperamos pronto.',
          'success'
        );
        localStorage.clear();
        location.replace('./index.html');
      }
    });

  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCTION 2 - Get user name  [GET]                          */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    };
    console.log("Consultando mi usuario...");
    fetch(urlUsuario, settings)
      .then(response => response.json())
      .then(data => {
        console.log("Nombre de usuario:");
        console.log(data.firstName);
        const nombreUsuario = document.querySelector('.user-info p');
        nombreUsuario.innerText = data.firstName;
      })
      .catch(error => console.log(error));
  }


  /* -------------------------------------------------------------------------- */
  /*                 FUNCTION 3 - Get tasks list   [GET]                        */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    };
    console.log("Consultando mis tareas...");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tareas => {
        console.log("Tareas del usuario");
        console.table(tareas);

        renderizarTareas(tareas);
        botonesCambioEstado();
        botonBorrarTarea();
      })
      .catch(error => console.log(error));
  };


  /* -------------------------------------------------------------------------- */
  /*                    FUNCTION 4 - Create new task [POST]                     */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log("crear terea");
    console.log(nuevaTarea.value);

    const payload = {
      description: nuevaTarea.value.trim()
    };
    const settings = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    }
    console.log("Creando un tarea en la base de datos");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tarea => {
        console.log(tarea)
        consultarTareas();
      })
      .catch(error => console.log(error));


    //Clean form
    formCrearTarea.reset();
  })


  /* -------------------------------------------------------------------------- */
  /*                  FUNCTION 5 - Renderize tasks                              */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {

    // Get lists and clean content
    const tareasPendientes = document.querySelector('.tareas-pendientes');
    const tareasTerminadas = document.querySelector('.tareas-terminadas');
    tareasPendientes.innerHTML = "";
    tareasTerminadas.innerHTML = "";

    // Get finished tasks quantity
    const numeroFinalizadas = document.querySelector('#cantidad-finalizadas');
    let contador = 0;
    numeroFinalizadas.innerText = contador;

    listado.forEach(tarea => {
      //Aux variable for date
      let fecha = new Date(tarea.createdAt);

      if (tarea.completed) {
        contador++;
        //Add to finished tasks
        tareasTerminadas.innerHTML += `
          <li class="tarea" data-aos="fade-up">
            <div class="hecha">
              <i class="fa-regular fa-circle-check"></i>
            </div>
            <div class="descripcion">
              <p class="nombre">${tarea.description}</p>
              <div class="cambios-estados">
                <button class="change incompleta" id="${tarea.id}" ><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar" id="${tarea.id}"><i class="fa-regular fa-trash-can"></i></button>
              </div>
            </div>
          </li>
                        `
      } else {
        //Add to unfinished tasks
        tareasPendientes.innerHTML += `
          <li class="tarea" data-aos="fade-down">
            <button class="change" id="${tarea.id}"><i class="fa-regular fa-circle"></i></button>
            <div class="descripcion">
              <p class="nombre">${tarea.description}</p>
              <p class="timestamp">${fecha.toLocaleDateString()}</p>
            </div>
          </li>
                        `
      }
      //Refresh counter
      numeroFinalizadas.innerText = contador;
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCTION 6 - Change task status  [PUT]                    */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado() {
    const btnCambioEstado = document.querySelectorAll('.change');

    btnCambioEstado.forEach(boton => {
      //a cada boton le asignamos una funcionalidad
      boton.addEventListener('click', function (event) {
        console.log("Cambiando estado de tarea...");
        console.log(event);

        const id = event.target.id;
        const url = `${urlTareas}/${id}`
        const payload = {};

        //segun el tipo de boton que fue clickeado, cambiamos el estado de la tarea
        if (event.target.classList.contains('incompleta')) {
          // si está completada, la paso a pendiente
          payload.completed = false;
        } else {
          // sino, está pendiente, la paso a completada
          payload.completed = true;
        }

        const settingsCambio = {
          method: 'PUT',
          headers: {
            "Authorization": token,
            "Content-type": "application/json"
          },
          body: JSON.stringify(payload)
        }
        fetch(url, settingsCambio)
          .then(response => {
            console.log(response.status);
            //vuelvo a consultar las tareas actualizadas y pintarlas nuevamente en pantalla
            consultarTareas();
          })
      })
    });

  }


  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea() {
    //obtenemos los botones de borrado
    const btnBorrarTarea = document.querySelectorAll('.borrar');

    btnBorrarTarea.forEach(boton => {
      //a cada boton de borrado le asignamos la funcionalidad
      boton.addEventListener('click', function (event) {
        Swal.fire({
          title: '¿Confirma eliminar la tarea?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            /* -------------------- disparamos el fetch para eliminar ------------------- */
            const id = event.target.id;
            const url = `${urlTareas}/${id}`

            const settingsCambio = {
              method: 'DELETE',
              headers: {
                "Authorization": token,
              }
            }
            fetch(url, settingsCambio)
              .then(response => {
                console.log("Borrando tarea...");
                console.log(response.status);
                //vuelvo a consultar las tareas actualizadas y pintarlas nuevamente en pantalla
                consultarTareas();
              })

            Swal.fire(
              'Tarea eliminada.',
            );

          }
        });

      })
    });
  }

});