window.onload = inicializarGaleria
var token = null
var userID = null
var userName = null
var animacionCarga = null
var msgNoImagenes = null
var msgErrorImagenes = null
var galeria = null
var btnSignOut = null
var inputFoto = null
var nuevaImagen = null
var timeoutRecargaGaleria = null

/**
 * Se inicializa la galería al cargar la página
 */
function inicializarGaleria() {
  // Recuperamos los datos de localStorage para futuras peticiones
  //TODO HECHO
  token = localStorage.getItem('token') 
  userID = localStorage.getItem('id') 
  userName = localStorage.getItem('user') 

  // TODO HECHO
  // Si no hay token redirigir a index.html
  if ((token === null) || (token === '')){
    window.location = "index.html"
  }
  else{
  // Si hay token, inicializar elementos DOM
  animacionCarga = document.querySelector('.loading')
  msgNoImagenes = document.getElementById('msgNoImagenes')
  msgErrorImagenes = document.getElementById('msgErrorImagenes')
  galeria = document.getElementById('galeria')
  btnSignOut = document.getElementById('btnSignOut')
  inputFoto = document.querySelector('input[type=file]')
  var modal = document.getElementById('modalNuevaImagen')
  }
  // Añadimos eventos a los botones de cierre del modal
  modal.querySelectorAll('.cerrar-modal').forEach(
    btn => btn.addEventListener('click', function () {
      modal.classList.remove('is-active')
    })
  )
  // Añadimos los eventos de click al botón del modal
  modal.querySelector('button.is-success').addEventListener('click', postImagen)
  // Añadimos el evento al input del modal
  modal.querySelector('input.input').addEventListener('input', validarInputDescripcion)

  // TODO HECHO Añadimos el evento al boton para cerrar y salir de la galería -> cerrarGaleria
  btnSignOut.addEventListener('click', cerrarGaleria)
  // Añadimos el evento para crear la imagen
  inputFoto.addEventListener('change', onFileUpload)

  // Cargamos las imágenes de la galería
  cargarImagenesGaleria()
}

/**
 * Carga la información de las imágenes desde el servidor
 */
function cargarImagenesGaleria() {
  //TODO HECHO Se hace la petición GET al servidor
  axios.get(apiPrefix + 'gallery/images/?token=' + token + '&account_id=' + userID)
  // Petición OK
  .then(
    function(response){
    // Ocultar la animación de carga
    if(response.data === null){
      msgNoImagenes.classList.remove('is-hidden')
    }
    else{
      // TODO HECHO Si ha imágenes mostrarlas
     mostrarImagenes(response.data)
     animacionCarga.classList.add('is-hidden')
      // Si existe un timeout de regarga, lo reseteamos
      if (timeoutRecargaGaleria) {
      clearTimeout(timeoutRecargaGaleria)
      }
    }
    //TODO HECHO Cargamos las imágenes cada 30 segundos, por si nuevas imágenes se suben 
    timeoutRecargaGaleria = self.setInterval(cargarImagenesGaleria, 30000)
  }
  // TODO HECHO Petición ERROR
  ).catch(
    function(error){
  // Si no hay imágenes, mostrar msgNoImagenes(default)
  // TODO HECHO Mostramos por consola el error
    console.log(msgNoImagenes)
  // Ocultamos la animación de carga
  // Mostrar el mensaje de error de carga de imágenes msgErrorImagenes
    animacionCarga.classList.add('is-hidden')
    msgErrorImagenes.classList.remove('is-hidden')
    })
}
  

/**
 * Función que genera las imágenes en HTML usando un array con los datos de las imágenes
 * @param {Array} imagenes
 */
function mostrarImagenes(imagenes) {
  var img = null
  // Vaciamos la Galería
  galeria.innerHTML = ''
  //TODO HECHO Recorremos los cada una de las imágenes
  for(var index in imagenes){
  //TODO HECHO Se genera el HTML para cada imagen: div.column, div.box, figure.image, img y nav.level, img es la variable para cada elemento del array imagenes
  img = imagenes[index]
  var divCol = document.createElement('div')
  divCol.classList.add('column', 'is-3')
  var box = document.createElement('div')
  box.classList.add('box')
  var figure = document.createElement('figure')
  figure.classList.add('image')
  var image = document.createElement('img')
  image.setAttribute('title', img.description)
  image.setAttribute('src', img.lowres_url)
  //TODO HECHO Extraemos el número de likes y número de comentarios de img
  var numLikes = img.num_likes
  var numComments = img.num_comments
  var bottomBar = createLevel(
    createIconTags('fa-heart', numLikes, 'is-danger', 'is-dark'),
    createIconTags('fa-comment', numComments, 'is-info', 'is-dark')
  )
  bottomBar.classList.add('bottom-bar')

  figure.appendChild(image)
  box.appendChild(figure)
  box.appendChild(bottomBar)
  divCol.appendChild(box)
  galeria.appendChild(divCol)
  // Guardamos los datos de la imagen en una propiedad del box
  box.imagen = img
  //TODO HECHO Se añade el evento click al Box -> clickImagen
  box.addEventListener('click', clickImagen)
  }
}
/**
 * Función para gestionar los clicks en las imágenes
 */
function clickImagen() {  
  //TODO HECHO Se redirige a image.html pasando como parámetro la ID de la imagen con el parámentro en URL: image_id
  var image_id=this.imagen.id
  window.location = 'imagen.html?id=' + image_id 
}

/**
 * Función para cerrar y salir de la Galería
 */
function cerrarGaleria() {
  // TODO HECHO Borrar 
  localStorage.clear
  // TODO HECHO Redirigir a index.html
  window.location='index.html'
}

/**
 * Función para gestionar la subida de una nueva imagen
 * @param {Event} event
 */
function onFileUpload(event) {
  // Si se ha elegido una imagen
  if (this.files && this.files[0]) {
    // Declarar variables del modal
    var modalNuevaImagen = document.getElementById('modalNuevaImagen')
    var img = modalNuevaImagen.querySelector('img')
    // Se extrae la imagen
    nuevaImagen = this.files[0]
    var reader = new FileReader()
    // Evento de que la imagen se cargue en el navegador
    reader.onload = function (e) {
      // Al cargarse la imagen, mostrar la imagen en la vista previa
      img.setAttribute('src', e.target.result)
      // Mostrar el modal
      modalNuevaImagen.classList.add('is-active')
    }
    // Cargar la imagen en el Navegador
    reader.readAsDataURL(nuevaImagen)
  }
}

/**
 * Función de validación del Input de la descripción de la imagen
 * @param {HTMLInputElement} input
 */
function validarInputDescripcion(input) {
  // Extraer el input del evento, si es un evento
  if (input instanceof Event) {
    input = input.target
  }
  // TODO HECHO Extraer la descripción
  var desc = input.value 
  // TODO HECHO Declarar la Expresión de validación
  var regEx = /^[a-zA-Z\d\s]{6,1000}$/
  var parent = input.parentNode.parentNode
  // Ocultar todos los mensajes de validación
  parent.querySelectorAll('.help').forEach(h => h.classList.add('is-hidden'))
  var resultado = null
  if (desc.length === 0) {
    // Si no tiene contenido, mostrar un icono
    updateIcon(input, 'fa-ellipsis-h')
    // Asignar el resultado de la validación
    resultado = false

  } else if (regEx.test(desc)) {
    // Si la validación es correcta, mostrar el mensaje e icono de validación correcta
    parent.querySelector('.help.is-success').classList.remove('is-hidden')
    updateIcon(input, 'fa-check', 'has-text-success')
    // TODO HECHO Asignar el resultado de la validación
    resultado = true 
  } else {
    // Si la validación NO es correcta, mostrar el mensaje e icono de error de validación
    parent.querySelector('.help.is-danger').classList.remove('is-hidden')
    updateIcon(input, 'fa-exclamation', 'has-text-danger')
    // TODO HECHO Asignar el resultado de la validación
    resultado = false
  }
  // TODO HECHO Devolver el resultado de la validación
  return resultado
}

/**
 * Función encargada de llamar al servidor y publicar una nueva imagen
 */
function postImagen() {
  // Accedemos al modal y a la descripción
  var modal = document.querySelector('#modalNuevaImagen')
  var descInput = modal.querySelector('input.input')
  // Comprobar que existe una imagen y una descripción
  if (nuevaImagen && validarInputDescripcion(descInput)) {
    // Desactivar el input
    descInput.setAttribute('disabled', 'disabled')
    var btnCrearImagen = this
    // Mostrar animación en el botón
    btnCrearImagen.classList.add('is-loading')
    // Hacer la petición POST al servidor con la imagen y la descripción como parámetro en la URL. La petición no es JSON
    axios.post(apiPrefix + 'gallery/images/?token=' + token + '&account_id=' + userID + '&description=' + descInput.value.trim(), nuevaImagen,
      {
        headers: {
          'Content-Type': nuevaImagen.type
        }
      })
      .then(
        function () {
          // La imagen se ha creado correctamente
          // Reiniciar el input de descripción: activo, contenido y errores.
          // TODO HECHO quitar atributo disabled de descInput 
          descInput.removeAttribute('disabled', 'disabled')
          // TODO HECHO borrar el contenido de descInput
          descInput.value=''
          descInput.dispatchEvent(new Event('input'))
          // Quitar la animación del botón
          btnCrearImagen.classList.remove('is-loading')
          // Quitar la animación de carga general
          animacionCarga.classList.remove('is-hidden')
          // Ocultar el Modal
          modal.classList.remove('is-active')
          // TODO HECHO Regargar las imagenes de la galería, para mostrar la nueva imagen
          cargarImagenesGaleria()
        }
      )
      .catch(
        function (err) {
          // Error creando la imagen
          console.log(err)
          // Habilitar el input y botón
          descInput.removeAttribute('disabled')
          btnCrearImagen.classList.remove('is-loading')
          animacionCarga.classList.add('is-hidden')
        }
      )
  }
}
