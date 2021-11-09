
let stockProductos = []
const cargarProductos = async () => {
    const resp = await fetch('./stock.json')
    const data = await resp.json()

    stockProductos = data
    mostrarProductos(stockProductos)
}

cargarProductos()


const contenedorProductos = document.getElementById('contenedor-productos')
const contenedorCarrito = document.getElementById('carrito-contenedor')
const selectFiltro = document.getElementById('estilo')
const selectPrecios = document.getElementById('precios')

const contadorCarrito = document.getElementById('contadorCarrito')
const precioTotal = document.getElementById('precioTotal')

const carrito = []



function mostrarProductos(array) {

    contenedorProductos.innerHTML = ''

    array.forEach( (producto) => {
        const div = document.createElement('div')
        div.classList.add('producto')
        div.innerHTML = `
                    <img class="producto__image"src=${producto.img} alt="">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.desc}</p>
                    <p>Estilo: ${producto.estilo}</p>
                    <p class="precioProducto">Precio: $${producto.precio}</p>
                    <button onclick=agregarAlCarrito(${producto.id}) class="boton-agregar">Agregar <i class="fas fa-shopping-cart"></i></button>
        `
        
        contenedorProductos.appendChild(div)
    } )
}

function agregarAlCarrito(itemId) {

    let itemEnCarrito = carrito.find(el => el.id == itemId)

    if (itemEnCarrito) {
        itemEnCarrito.cantidad += 1
    } else {
        let {id, nombre, precio} = stockProductos.find( el => el.id == itemId )
        carrito.push({id: id, nombre: nombre, precio: precio, cantidad: 1})
    }


    localStorage.setItem('carrito', JSON.stringify(carrito))

    console.log(carrito)

    actualizarCarrito()
}

function eliminarProducto(id) {
    let productoAEliminar = carrito.find( el => el.id == id )

    productoAEliminar.cantidad--

    if (productoAEliminar.cantidad == 0) {
        let indice = carrito.indexOf(productoAEliminar)
        carrito.splice(indice, 1)
    }

    console.log(carrito)
    actualizarCarrito()
}


function actualizarCarrito() {
    contenedorCarrito.innerHTML=''

    carrito.forEach( (producto) => {

        const div = document.createElement('div')
        div.classList.add('productoEnCarrito')
        div.innerHTML = ` 
                        <p>${producto.nombre}</p>
                        <p>Precio: $${producto.precio * producto.cantidad}</p>
                        <p>Cantidad: ${producto.cantidad}</p>
                        <button onclick=eliminarProducto(${producto.id}) class="boton-eliminar"><i class="fas fa-trash-alt"></i></button>
                    `

        contenedorCarrito.appendChild(div)
    })

    contadorCarrito.innerText = carrito.length
    precioTotal.innerText = carrito.reduce( (acc, el) => acc + (el.precio * el.cantidad), 0 )
}




function filtrar() {
    let valorFiltroEstilo = selectFiltro.value
    
    let arrayFiltrado = []

    if (valorFiltroEstilo == 'all') {
        arrayFiltrado = stockProductos
    } else {
        arrayFiltrado = stockProductos.filter( el => el.estilo == selectFiltro.value) 
    }
    mostrarProductos(arrayFiltrado)

}

selectFiltro.addEventListener('change', ()=>{
    filtrar()
})



// ========= API MERCADO PAGO =============

const finalizarCompra = async () => {

    const itemsToMP = carrito.map( (prod) => {
        return {
            title: prod.nombre,
            description: "",
            picture_url: "",
            category_id: prod.id,
            quantity: prod.cantidad,
            currency_id: "ARS",
            unit_price: prod.precio
        }
    })

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    Authorization: " Bearer TEST-1349216653569662-092400-8b34b7dfd4899ef16b0325dbc8e167b7-19664127"
                },
                body: JSON.stringify({
                    items: itemsToMP,
                    back_urls: {
                        success: window.location.href,
                        failure: window.location.href
                    }

                })
            })
    const data = await response.json()

    window.location.replace(data.init_point)

}

