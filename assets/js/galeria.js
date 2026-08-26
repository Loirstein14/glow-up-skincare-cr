/* ============================================================
   galeria.js - Galeria multimedia de Glow Up

   Carga las imagenes desde un archivo JSON publicado en el
   mismo sitio y permite filtrarlas y verlas ampliadas.
   ============================================================ */

/* Ruta del "API" propio del sitio */
var URL_GALERIA = "assets/datos/galeria.json";

/* Copia local de las imagenes ya descargadas */
var listaGaleria = [];

/* Categoria seleccionada en este momento */
var categoriaGaleria = "todas";


/* Construye el HTML de una imagen de la galeria */
function crearItemGaleria(item) {

    var html = "";

    html += '<div class="col-6 col-md-4 col-lg-3">';
    html += '  <figure class="gu-galeria-item" data-id="' + item.id + '">';
    html += '    <img src="' + item.imagen + '" alt="' + item.titulo + '" loading="lazy">';
    html += '    <figcaption>';
    html += '      <span class="gu-galeria-titulo">' + item.titulo + '</span>';
    html += '      <i class="bi bi-arrows-fullscreen"></i>';
    html += '    </figcaption>';
    html += '  </figure>';
    html += '</div>';

    return html;
}


/* Dibuja las imagenes que corresponden a la categoria activa */
function pintarGaleria() {

    var contenido = "";
    var visibles = 0;

    for (var i = 0; i < listaGaleria.length; i++) {

        var item = listaGaleria[i];

        if (categoriaGaleria !== "todas" && item.categoria !== categoriaGaleria) {
            continue;
        }

        contenido += crearItemGaleria(item);
        visibles++;
    }

    if (visibles === 0) {
        contenido = '<p class="text-center w-100 py-4">No hay imagenes en esta categoria.</p>';
    }

    $("#gu-galeria-grid").html(contenido);
    $("#gu-galeria-contador").text(visibles + (visibles === 1 ? " imagen" : " imagenes"));
}


/* Descarga el JSON de la galeria */
function cargarGaleria() {

    $.getJSON(URL_GALERIA, function (datos) {
        listaGaleria = datos.galeria;
        pintarGaleria();
    }).fail(function (xhr) {
        console.error("Error al cargar la galeria. Estado: " + xhr.status);
        $("#gu-galeria-grid").html(
            '<p class="text-center w-100 py-4">No se pudo cargar la galeria en este momento.</p>'
        );
    });
}


/* Busca una imagen por su id */
function buscarItemGaleria(id) {
    for (var i = 0; i < listaGaleria.length; i++) {
        if (listaGaleria[i].id === id) {
            return listaGaleria[i];
        }
    }
    return null;
}


/* Abre el visor con la imagen ampliada */
function abrirVisor(id) {

    var item = buscarItemGaleria(id);

    if (item === null) {
        return;
    }

    $("#gu-visor-img").attr("src", item.imagen).attr("alt", item.titulo);
    $("#gu-visor-titulo").text(item.titulo);
    $("#gu-visor-epigrafe").text(item.epigrafe);

    var ventana = new bootstrap.Modal(document.getElementById("gu-visor"));
    ventana.show();
}


/* ------------------------------------------------------------
   Eventos
   ------------------------------------------------------------ */

$(document).ready(function () {

    if ($("#gu-galeria-grid").length === 0) {
        return;
    }

    cargarGaleria();

    // Filtros por categoria
    $(".gu-galeria-filtro").click(function () {
        $(".gu-galeria-filtro").removeClass("activo");
        $(this).addClass("activo");
        categoriaGaleria = $(this).attr("data-categoria");
        pintarGaleria();
    });

    // El visor se abre desde cualquier imagen, incluso las
    // creadas despues de aplicar un filtro
    $(document).on("click", ".gu-galeria-item", function () {
        var id = parseInt($(this).attr("data-id"));
        if (!isNaN(id)) {
            abrirVisor(id);
        }
    });
});
