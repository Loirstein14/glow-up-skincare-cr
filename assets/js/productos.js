/* ============================================================
   productos.js - Catálogo de Glow Up

   Consume el archivo JSON publicado en el mismo sitio como si
   fuera un API Rest, usando jQuery, y permite filtrar, buscar
   y ordenar los productos desde el navegador.
   ============================================================ */

/* Ruta del "API" propio del sitio */
var URL_PRODUCTOS = "assets/datos/productos.json";

/* Copia local de los productos ya descargados */
var listaProductos = [];

/* Estado actual de los filtros aplicados */
var filtroCategoria = "todos";
var filtroTexto = "";
var filtroOrden = "nombre";


/* Formato de colones */
function formatoColones(monto) {
    return "\u20A1" + monto.toLocaleString("es-CR");
}


/* Construye el HTML de una tarjeta de producto */
function crearTarjetaProducto(producto) {

    var html = "";

    html += '<div class="col-6 col-md-4 col-lg-3">';
    html += '  <article class="gu-product-card" data-id="' + producto.id + '">';
    html += '    <div class="gu-product-img">';
    html += '      <img src="' + producto.imagen + '" alt="' + producto.nombre + '" class="img-fluid" loading="lazy">';
    html += '    </div>';
    html += '    <div class="gu-product-body">';
    html += '      <span class="gu-product-marca">' + producto.marca + '</span>';
    html += '      <h3 class="gu-product-nombre">' + producto.nombre + '</h3>';
    html += '      <p class="gu-product-desc">' + producto.descripcion + '</p>';
    html += '      <span class="gu-product-precio">' + formatoColones(producto.precio) + '</span>';
    html += '      <button type="button" class="gu-product-btn">Ver detalle</button>';
    html += '    </div>';
    html += '  </article>';
    html += '</div>';

    return html;
}


/* Pinta un arreglo de productos dentro del contenedor indicado */
function pintarProductos(productos, idContenedor) {

    var contenido = "";

    if (productos.length === 0) {
        contenido = '<p class="text-center w-100 py-4">No encontramos productos con esos criterios. ' +
                    'Probá con otra búsqueda.</p>';
    } else {
        for (var i = 0; i < productos.length; i++) {
            contenido += crearTarjetaProducto(productos[i]);
        }
    }

    $("#" + idContenedor).html(contenido);
}


/* Descarga el JSON una sola vez y ejecuta la función indicada */
function cargarProductos(alTerminar) {

    if (listaProductos.length > 0) {
        alTerminar(listaProductos);
        return;
    }

    $.getJSON(URL_PRODUCTOS, function (datos) {
        listaProductos = datos.productos;
        alTerminar(listaProductos);
    }).fail(function (xhr) {
        console.error("Error al cargar productos. Estado: " + xhr.status);
        $(".gu-productos-grid").html(
            '<p class="text-center w-100 py-4">No se pudo cargar el catálogo en este momento.</p>'
        );
    });
}


/* ------------------------------------------------------------
   Productos destacados (página de inicio)
   ------------------------------------------------------------ */

function cargarDestacados() {

    cargarProductos(function (productos) {

        var destacados = [];

        for (var i = 0; i < productos.length; i++) {
            if (productos[i].destacado === true) {
                destacados.push(productos[i]);
            }
        }

        pintarProductos(destacados, "gu-destacados-grid");
    });
}


/* ------------------------------------------------------------
   Catálogo completo (página de productos)
   ------------------------------------------------------------ */

/* Quita tildes y pasa a minúsculas para que la búsqueda
   funcione aunque el usuario no escriba los acentos */
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* Aplica los tres filtros y vuelve a dibujar la grilla */
function aplicarFiltros() {

    var resultado = [];
    var busqueda = normalizarTexto(filtroTexto);

    for (var i = 0; i < listaProductos.length; i++) {

        var producto = listaProductos[i];

        // Filtro por categoría
        if (filtroCategoria !== "todos" && producto.categoria !== filtroCategoria) {
            continue;
        }

        // Filtro por texto: busca en nombre, marca y descripción
        if (busqueda !== "") {
            var contenido = normalizarTexto(
                producto.nombre + " " + producto.marca + " " +
                producto.descripcion + " " + producto.tipoPiel
            );

            if (contenido.indexOf(busqueda) === -1) {
                continue;
            }
        }

        resultado.push(producto);
    }

    // Ordenamiento
    resultado.sort(function (a, b) {
        if (filtroOrden === "precio-asc") {
            return a.precio - b.precio;
        }
        if (filtroOrden === "precio-desc") {
            return b.precio - a.precio;
        }
        return a.nombre.localeCompare(b.nombre);
    });

    pintarProductos(resultado, "gu-catalogo-grid");
    mostrarContador(resultado.length);
}


/* Muestra cuántos productos se están viendo */
function mostrarContador(cantidad) {

    var texto = cantidad + " producto";
    if (cantidad !== 1) {
        texto += "s";
    }

    if (filtroCategoria !== "todos" || filtroTexto !== "") {
        texto += " encontrado";
        if (cantidad !== 1) {
            texto += "s";
        }
    }

    $("#gu-contador").text(texto);
}


/* Carga inicial del catálogo completo */
function cargarCatalogo() {
    cargarProductos(function () {
        aplicarFiltros();
    });
}


/* Busca un producto por su id */
function buscarProductoPorId(id) {
    for (var i = 0; i < listaProductos.length; i++) {
        if (listaProductos[i].id === id) {
            return listaProductos[i];
        }
    }
    return null;
}


/* Llena y abre la ventana con el detalle del producto */
function abrirDetalle(id) {

    var producto = buscarProductoPorId(id);

    if (producto === null) {
        return;
    }

    $("#gu-modal-img").attr("src", producto.imagen).attr("alt", producto.nombre);
    $("#gu-modal-marca").text(producto.marca);
    $("#gu-modal-nombre").text(producto.nombre);
    $("#gu-modal-precio").text(formatoColones(producto.precio));
    $("#gu-modal-tipo").text(producto.tipoPiel);
    $("#gu-modal-detalle").text(producto.detalle);

    // El botón de WhatsApp lleva el nombre del producto en el mensaje
    var mensaje = "Hola Glow Up, me interesa el producto: " + producto.nombre;
    $("#gu-modal-whatsapp").attr("href",
        "https://wa.me/" + CONTACTO.whatsapp + "?text=" + encodeURIComponent(mensaje));

    var ventana = new bootstrap.Modal(document.getElementById("gu-modal-producto"));
    ventana.show();
}


/* ------------------------------------------------------------
   Eventos
   ------------------------------------------------------------ */

$(document).ready(function () {

    // Página de inicio: solo destacados
    if ($("#gu-destacados-grid").length > 0) {
        cargarDestacados();
    }

    // Página de catálogo: filtros, buscador y detalle
    if ($("#gu-catalogo-grid").length > 0) {

        cargarCatalogo();

        // Botones de categoría
        $(".gu-filtro-btn").click(function () {
            $(".gu-filtro-btn").removeClass("activo");
            $(this).addClass("activo");
            filtroCategoria = $(this).attr("data-categoria");
            aplicarFiltros();
        });

        // Buscador: filtra mientras se escribe
        $("#gu-buscador").on("keyup", function () {
            filtroTexto = $(this).val();
            aplicarFiltros();
        });

        // Selector de orden
        $("#gu-orden").change(function () {
            filtroOrden = $(this).val();
            aplicarFiltros();
        });

        // Botón para limpiar todos los filtros
        $("#gu-limpiar").click(function () {
            filtroCategoria = "todos";
            filtroTexto = "";
            filtroOrden = "nombre";
            $("#gu-buscador").val("");
            $("#gu-orden").val("nombre");
            $(".gu-filtro-btn").removeClass("activo");
            $('.gu-filtro-btn[data-categoria="todos"]').addClass("activo");
            aplicarFiltros();
        });
    }

    // El detalle se abre desde cualquier tarjeta, incluso las
    // creadas después de cargar la página
    $(document).on("click", ".gu-product-card", function () {
        var id = parseInt($(this).attr("data-id"));
        if (!isNaN(id)) {
            abrirDetalle(id);
        }
    });

});
