/* ============================================================
   rutina.js - Paso a paso de la rutina

   Carga los pasos desde un archivo JSON publicado en el mismo
   sitio y permite abrir y cerrar el detalle de cada uno.
   ============================================================ */

/* Ruta del "API" propio del sitio */
var URL_RUTINA = "assets/datos/rutina.json";


/* Construye el HTML de un paso de la rutina */
function crearPaso(paso) {

    var html = "";

    html += '<article class="gu-rutina-paso" data-paso="' + paso.paso + '">';

    html += '  <div class="gu-rutina-cabecera">';
    html += '    <span class="gu-rutina-num">' + paso.paso + '</span>';
    html += '    <div class="gu-rutina-titulo">';
    html += '      <h3><i class="bi ' + paso.icono + '"></i> ' + paso.nombre + '</h3>';
    html += '      <span class="gu-rutina-momento">' + paso.momento + '</span>';
    html += '    </div>';
    html += '    <i class="bi bi-chevron-down gu-rutina-flecha"></i>';
    html += '  </div>';

    html += '  <div class="gu-rutina-cuerpo">';
    html += '    <p>' + paso.descripcion + '</p>';
    html += '    <p class="gu-rutina-consejo"><strong>Consejo:</strong> ' + paso.consejo + '</p>';
    html += '    <div class="gu-rutina-productos">';
    html += '      <span class="gu-rutina-etiqueta">Productos recomendados</span>';
    html += '      <ul>';

    for (var i = 0; i < paso.productos.length; i++) {
        html += '<li>' + paso.productos[i] + '</li>';
    }

    html += '      </ul>';
    html += '      <a href="productos.html" class="gu-rutina-enlace">Ver en el catalogo</a>';
    html += '    </div>';
    html += '  </div>';

    html += '</article>';

    return html;
}


/* Descarga el JSON y dibuja todos los pasos */
function cargarRutina() {

    $.getJSON(URL_RUTINA, function (datos) {

        var contenido = "";

        for (var i = 0; i < datos.rutina.length; i++) {
            contenido += crearPaso(datos.rutina[i]);
        }

        $("#gu-rutina-lista").html(contenido);

        // El primer paso queda abierto para que se vea el contenido
        $(".gu-rutina-paso").first().addClass("abierto");

    }).fail(function (xhr) {
        console.error("Error al cargar la rutina. Estado: " + xhr.status);
        $("#gu-rutina-lista").html(
            '<p class="text-center py-4">No se pudo cargar la rutina en este momento.</p>'
        );
    });
}


/* ------------------------------------------------------------
   Eventos
   ------------------------------------------------------------ */

$(document).ready(function () {

    if ($("#gu-rutina-lista").length === 0) {
        return;
    }

    cargarRutina();

    // Abrir y cerrar cada paso al hacer clic en su cabecera
    $(document).on("click", ".gu-rutina-cabecera", function () {
        $(this).closest(".gu-rutina-paso").toggleClass("abierto");
    });

    // Botones para abrir o cerrar todos a la vez
    $("#gu-rutina-abrir").click(function () {
        $(".gu-rutina-paso").addClass("abierto");
    });

    $("#gu-rutina-cerrar").click(function () {
        $(".gu-rutina-paso").removeClass("abierto");
    });
});
