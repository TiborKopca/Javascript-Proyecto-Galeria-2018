// TODO HECHO Al cargar la página, llamamos a inicializarDetallesImagen
window.onload = inicializarDetallesImagen

// Inicializamos variables globales
var imgID = null
var token = null
var userID = null
var userName = null
var animacionCarga = null
var marcoImagen = null
var btnLikeImage = null
var datosImagen = null
var nuevoComentario = null
var timeoutCargarDetalles = null

/**
 * Se ejecuta una vez al cargar la página.
 */
function inicializarDetallesImagen() {
  imgID = getImageID()
  // TODO HECHO Si no existe o no es válido el ID de la imagen en la URL, se redirige a gallery.html
  if (isNaN(imgID) || imgID <= 0) {
    window.location = 'gallery.html'
  } else {
    // TODO HECHO Se inicializan variables globales desde localStorage: token, userID y userName
    token = localStorage.getItem('token')
    userID = localStorage.getItem('id')
    userName = localStorage.getItem('user')
    // Se inicializan variables DOM
    animacionCarga = document.querySelector('.loading')
    marcoImagen = document.querySelector('figure.image')
    btnLikeImage = document.getElementById('btnLikeImage')

    // Se inicializan Eventos
    btnLikeImage.addEventListener('click', onClickLike)

    // Se piden los detalles de la imagen al servidor
    cargarDetallesImagen()

    // Se pide al servidor si el usuario Likes la imagen
    comprobarUsuarioLikesImagen()

    // Se inicilizan los comentarios
    inicializarComentarios()
  }
}

/**
 * Esta función devuelve el ID de la image de la URL
 * ?image_id=1 devuelve el valor del parámetro de URL image_id, 1 como Number, no como string
 * Los parametros de la URL están en: window.location.search
 */
function getImageID() {
  // TODO HECHO Se puede implementar trabajando con strings o mediante expresiones regulares
  return Number(window.location.search.replace(/\D/g, ''))
}

/**
 * Solicitar al Servidor los detalles de la imagen
 */
function cargarDetallesImagen() {
  // TODO HECHO Petición GET al servidor para recuperar los datos de la imagen
  var URL = apiPrefix + 'gallery/images/' + imgID + '/?token=' + token + '&account_id=' + userID
  axios.get(URL)
    // Petición OK
    .then(
      // TODO HECHO Los datos se recuperan y guardan en la variable global: datosImagen
      function (response) {
        datosImagen = response.data
        // Se oculta la animacionCarga
        animacionCarga.classList.add('is-hidden')
        // Se busca el elemento img de la página
        var img = marcoImagen.querySelector('img')
        // TODO HECHO Se cambia el atributo SRC de la imagen con la url de la imagen,reemplazar null por la URL de la imagen
        img.setAttribute('src', datosImagen.highres_url)
        // TODO HECHO Se cambia el artributo ALT con la descripción de la imagen.reemplazar null por la descripción de la imagen
        img.setAttribute('alt', datosImagen.description)
        // TODO HECHO Cargamos la descripción de la imagen en tagDescripcion,reemplazar null por la descripción de la imagen
        document.getElementById('tagDescripcion').innerText = img.alt
        // TODO HECHO Cargamos el número de likes en tagNumLikes,reemplazar null por el número de likes de la imagen 
        document.getElementById('tagNumLikes').innerText = datosImagen.num_likes
        // TODO HECHO Cargamos el número de comentarios en tagNumComentarios,
        // Buscar el elemento tag de número de comentarios y asignar el valor de número de comentarios de la imagen
        document.getElementById('tagNumComentarios').innerText = datosImagen.num_comments
        // Si existe un timeout de regarga, lo reseteamos
        if (timeoutCargarDetalles) {
          clearTimeout(timeoutCargarDetalles)
          // TODO HECHO Cargamos los detalles cada minuto
          timeoutCargarDetalles = setInterval(cargarDetallesImagen, 60000)
        }

      }
      // TODO HECHO Petición Error
    ).catch(
      function (error) {
        // Si hay un error ocultamos la animación de carga
        animacionCarga.classList.add('is-hidden')
        // Habría que mostrar un mensaje de error de carga
        document.getElementById('msgError').classList.remove('is-hidden')
      }
    )
}

/**
 * Esta función pide al servidor si el usuario actual Likes la imagen abierta
 */
function comprobarUsuarioLikesImagen() {
  // Petición GET para recuperar el estado de Like
  // Si OK
  axios.get(apiPrefix + 'gallery/images/' + imgID + '/likes/?token=' + token + '&account_id=' + userID)
    .then(
      function (response) {
        // TODO HECHO Mostrar el corazón completo añadiendo al botón btnLikeImage la clase 'is-liked'
        btnLikeImage.classList.add('is-liked')
      }
    ).catch(
      function (error) {
        // TODO HECHO Si el código de estado de respuesta es 404, ocultar el corazón completo
        if (error.response.status === 404) {
          btnLikeImage.classList.remove('is-liked')
        } else {
          // TODO HECHO Si es otro error, mostrar el error en consola  
          console.log('error comprobacion likes:' + error)
        }
      }
    )
}

/**
 * Función que gestión los clicks del botón btnLikeImage
 */
function onClickLike() {
  //TODO HECHO Si actualmente la imagen está Liked por el usuario actual, llamar a unLikeImagen()
  if (btnLikeImage.classList.contains('is-liked')) {
    unLikeImagen()
  }
  // TODO HECHO Si no, es decir, la imagen no está Liked por el usuario actual, llamar a likeImagen()
  else {
    likeImagen()
  }
}

/**
 * Esta función hace un POST al servidor para likear la imagen
 */
function likeImagen() {
  //TODO HECHO Petición POST
  var URL = apiPrefix + 'gallery/images/' + imgID + '/likes/?token=' + token + '&account_id=' + userID
  axios.post(URL)
    // Petición OK
    //TODO HECHO Actualizar el estado del corazón y recargarlos detalles de la imagen.
    .then(
      function (response) {
        btnLikeImage.classList.add('is-liked')
        cargarDetallesImagen()
        //TODO HECHO Si error, mostrar el error en consola
      }).catch(
      function (error) {
        console.log('Error: ' + error)
      }
    )
}

/**
 * Esta función elimina el Like de la imagen del usuario actual mediante una petición DELETE
 */
function unLikeImagen() {
  var URL = apiPrefix + 'gallery/images/' + imgID + '/likes/?token=' + token + '&account_id=' + userID
  axios.delete(URL)
    // Petición DELETE
    // Si OK
    // TODO HECHO Actualizar el estado del corazón y recargarlos detalles de la imagen.
    .then(
      function (response) {
        btnLikeImage.classList.remove('is-liked')
        cargarDetallesImagen()
        // TODO HECHO Si error, mostrar el error en consola
      }).catch(
      function (error) {
        console.log('Error: ' + error)
      }
    )
}

/**
 * Inicializa los elementos para comentarios
 */
function inicializarComentarios() {
  // TODO HECHO Inicializar variables con objetos del DOM
  nuevoComentario = document.getElementById('nuevoComentario')
  nuevoComentario.querySelector('.autorUsuario').innerText = userName
  nuevoComentario.querySelector('textarea').addEventListener('input', validarComentario)
  nuevoComentario.querySelector('button').addEventListener('click', onNuevoComentarioClick)
  // Cargar los comentarios
  cargarComentarios()
}

/**
 * Función que solicita y carga en pantalla los comentarios
 */
function cargarComentarios() {
  // TODO HECHO Petición GET al servidor para cargar los comentarios 
  var URLCommentarios = apiPrefix + 'gallery/images/' + imgID + '/comments/?token=' + token + '&account_id=' + userID
  axios.get(URLCommentarios)
    .then(
      function (response) {
        // Inicializar los elementos necesarios del DOM
        var plantillaComentario = document.getElementById('plantillaComentario')
        var marcoComentarios = document.getElementById('marcoComentarios')
        // Elminamos los comentarios cargados anteriormente
        marcoComentarios.querySelectorAll('.comentario:not(#plantillaComentario)').forEach(c => c.remove())
        moment.locale('es')
        // TODO HECHO Para cada comentario, generar un comentario.
        for (var index in response.data) {
          var datosComentario = response.data[index]
          var newCom = document.createElement('article')
          newCom.classList.add('media', 'comentario')
          newCom.innerHTML = plantillaComentario.innerHTML
          // TODO HECHO
          newCom.querySelector('.contenido').innerText = datosComentario.comment
          newCom.querySelector('.tiempo').innerText = moment.duration(moment(datosComentario.datetime).diff(moment())).humanize()
          // TODO HECHO
          newCom.querySelector('.autorUsuario').innerText = datosComentario.username
          newCom.querySelector('.autorUsuario').setAttribute('href', 'usuario.html?user_id=' + datosComentario.user_id)
          // TODO HECHO
          newCom.querySelector('.autorNombre').innerText = datosComentario.fullname
          //TODO HECHO Si el usuario actual es el autor del comentario...
          if (userName == datosComentario.username) {
            // TODO HECHO mostrar el botón eliminar
            var btnEliminar = newCom.querySelector('button.is-danger')
            // TODO HECHO guardamos la referencia a los datos del comentario en el botón de eliminar
            btnEliminar.comentario = datosComentario
            // TODO HECHO añadimos un evento click al botón para que llame a la función eliminarComentario si se hace click
            btnEliminar.addEventListener('click', eliminarComentario)
            // TODO HECHO Si no es el usuario actual el autor
          } else {
            //TODO HECHO Ocultar el botón eliminar
            var btnEliminar = newCom.querySelector('button.is-danger')
            btnEliminar.classList.add('is-hidden')
          }
          // Se iserta el comentario en la lista de comentarios
          marcoComentarios.insertBefore(newCom, nuevoComentario)
        }
        // TODO HECHO Se recargan los comentarios cada minuto
        setTimeout(cargarComentarios, 60000)
        // Petición ERROR
      }).catch(
      function (error) {
        // TODO HECHO Mostrar en consola el error de carga de comentarios
        console.log('Error de carga de comentarios:' + error)
      })
}


/**
 * Validación del TextArea del comentario
 * @param {HTMLTextAreaElement} input 
 */
function validarComentario(input) {
  // Si input es un evento...
  if (input instanceof Event) {
    // acceder al campo del evento
    input = input.target
  }
  // TODO HECHO Validar que el contenido tiene entre 3 y 1000 carácteres
  var valido = /^.{3,1000}$/.test(input.value)
  // Ocultamos los mensajes de validación
  nuevoComentario.querySelectorAll('.help').forEach(h => h.classList.add('is-hidden'))
  var msgErrorComment = document.querySelector('.help.is-danger')
  var msgOk = document.querySelector('.help.is-success')
  if (valido) {
    // TODO HECHO Mostramos el mensaje de OK si la validación es satisfactoria
    msgOk.classList.remove('is-hidden')
  } else {
    // TODO HECHO Mostramos el mensaje de Error si la validación falla
    msgErrorComment.classList.remove('is-hidden')
  }
  // Devolvemos el resultado de la validación
  return valido
}

/**
 * Función para gestionar el click del botón de crear nuevo comentario
 */
function onNuevoComentarioClick() {
  // Inicializamos una variable con el textarea
  var areaComentario = nuevoComentario.querySelector('textarea')
  // TODO HECHO Validamos el text area antes de continuar
  validarComentario(areaComentario.value)
  // Accedemos al botón del comentario y mostramos animación de carga
  var botonComentario = nuevoComentario.querySelector('button')
  // Mostrar animación de carga en el botón
  botonComentario.classList.add('is-loading')
  // Desactivar el textarea
  areaComentario.setAttribute('disabled', 'disabled')
  var comentario = areaComentario.value.trim()
  // TODO HECHO Preparar el objeto comentario para enviarlo al servidor
  var Comment = {
    user_id: Number(userID), //tiene ser numero! Number(userID)
    image_id: imgID,
    comment: comentario
  }
  // TODO HECHO Petición POST al servidor con los datos del comentario
  axios.post(apiPrefix + 'gallery/images/' + imgID + '/comments/?token=' + token + '&account_id=' + userID, Comment)
    .then(
      // TODO HECHO Petición OK
      function (response) {
        // Si la petición funciona
        // Reiniciar los campos del comentario: valor, activo y validación
        areaComentario.value = ''
        areaComentario.removeAttribute('disabled')
        // Quitar al botón la animación de carga
        botonComentario.classList.remove('is-loading')
        nuevoComentario.querySelectorAll('.help').forEach(h => h.classList.add('is-hidden'))
        // TODO HECHO Cargar de nuevo los comentarios y los detalles de la imagen
        inicializarComentarios()
        //TODO HECHO cargarComentarios()
        cargarDetallesImagen()
      }
    ).catch(
      // TODO HECHO Petición ERROR
      function (error) {
        // Si falla la petición, mostrar el error en consola
        console.log('Error creando comentario', error)
        // Habilitar de nuevo el campo y el botón
        areaComentario.removeAttribute('disabled')
        botonComentario.classList.remove('is-loading')
      })
}

/**
 * Elemina un comentario del usuario actual
 */
function eliminarComentario() {
  // TODO HECHO Extraer el ID del comentario a borrar
  var id_borrar = this.comentario.id
  // TODO HECHO Petición DELETE para borrar el comentario
  var URL = apiPrefix + 'gallery/images/' + imgID + '/comments/' + id_borrar + '/?token=' + token + '&account_id=' + userID
  axios.delete(URL)
    .then(
      // Si se elimina el comentario
      // TODO HECHO Cargar de nuevo los comentarios y los detalles de la imagen
      function (response) {
        // Si se elimina el comentario
        // TODO HECHO Cargar de nuevo los comentarios y los detalles de la imagen
        cargarComentarios()
        cargarDetallesImagen()
      }
      // TODO HECHO Si falla la petición, mostrar el error en consola
    ).catch(
      function (error) {
        console.log('Peticion ha fallado:' + error)
      }
    )
}