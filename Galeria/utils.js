// var apiPrefix = 'http://localhost:9192/api/'
var apiPrefix = 'https://tasklist.kydemy.com:9192/api/'

/**
 * Genera un nuevo icono para el input
 * @param {HTMLInputElement} input 
 * @param {string} iconClass 
 * @param {string} iconColor 
 */
function updateIcon (input, iconClass, iconColor) {
  var newIcon = document.createElement('i')
  var rightIcon = input.parentNode.querySelector('.icon.is-right')
  rightIcon.classList.remove('has-text-success', 'has-text-danger')
  input.parentNode.classList.remove('is-loading')
  if (iconColor) {
    rightIcon.classList.add(iconColor)
  }
  if (iconClass) {
    rightIcon.innerHTML = ''
    if (iconClass === 'loading') {
      input.parentNode.classList.add('is-loading')
    } else {
      newIcon.classList.add('fas', iconClass)
      rightIcon.appendChild(newIcon)
    }
  }
}

/**
 * Genera un nuevo icono FontAwesome
 * @param {string} iconName 
 * @param {string} color
 * @returns Element
 */
function createIcon (iconName, color) {
  var span = document.createElement('span')
  span.classList.add('icon')
  if (color) {
    span.classList.add(color)
  }
  var iTag = document.createElement('i')
  iTag.classList.add('fas', iconName)
  span.appendChild(iTag)
  return span
}

/**
 * @param {string} iconName 
 * @param {string} text 
 * @param {string} iconColor 
 * @param {string} textColor 
 * @param {string} size 
 * @returns Element
 */
function createIconTags (iconName, text, iconColor, textColor, size) {
  if (!size) {
    size = 'is-normal'
  }
  var tags = document.createElement('div')
  tags.classList.add('tags', 'has-addons')
  var tagLeft = document.createElement('span')
  tagLeft.classList.add('tag', iconColor, size)
  tagLeft.appendChild(createIcon(iconName))
  var tagRight = document.createElement('span')
  tagRight.classList.add('tag', textColor, size)
  tagRight.innerText = text
  tags.appendChild(tagLeft)
  tags.appendChild(tagRight)
  return tags
}

/**
 * Crea una estructura level de Bulma.io
 * @returns Element
 */
function createLevel () {
  var level = document.createElement('nav')
  level.classList.add('level')

  for (var index in arguments) {
    var levelItem = document.createElement('div')
    levelItem.classList.add('level-item')
    levelItem.appendChild(arguments[index])
    level.appendChild(levelItem)
  }
  return level
}
