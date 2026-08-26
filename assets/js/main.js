/* ============================================================
   main.js - Comportamientos comunes de todo el sitio
   Glow Up - ISW-512 Diseño de Aplicaciones Web
   ============================================================ */


/* Datos de contacto centralizados.
   Al cambiarlos aquí se actualizan en todas las páginas. */
var CONTACTO = {
    whatsapp: "50689678911",              // TODO: número real (formato 506XXXXXXXX)
    instagram: "https://www.instagram.com/glowupskinhair",   // TODO: perfil real
    facebook: "https://www.facebook.com/",     // TODO: perfil real
    tiktok: "https://www.tiktok.com/",         // TODO: perfil real
    correo: "info@glowup.cr",             // TODO: correo real
    mensaje: "Hola Glow Up, me gustaría más información sobre sus productos."
};


/* Arma el enlace directo a WhatsApp con el mensaje prellenado */
function armarEnlaceWhatsApp() {
    return "https://wa.me/" + CONTACTO.whatsapp +
           "?text=" + encodeURIComponent(CONTACTO.mensaje);
}


/* Coloca los enlaces de redes sociales en la barra correspondiente */
function cargarRedesSociales() {
    $(".gu-link-whatsapp").attr("href", armarEnlaceWhatsApp());
    $(".gu-link-instagram").attr("href", CONTACTO.instagram);
    $(".gu-link-facebook").attr("href", CONTACTO.facebook);
    $(".gu-link-tiktok").attr("href", CONTACTO.tiktok);
    $(".gu-link-correo").attr("href", "mailto:" + CONTACTO.correo);
}


/* Marca como activo el enlace del menú que corresponde a la página actual */
function marcarPaginaActiva() {

    // Obtiene el nombre del archivo actual, por ejemplo "productos.html"
    var ruta = window.location.pathname;
    var archivo = ruta.substring(ruta.lastIndexOf("/") + 1);

    if (archivo === "") {
        archivo = "index.html";
    }

    $("#gu-navbar .nav-link, #gu-navbar .dropdown-item").each(function () {
        if ($(this).attr("href") === archivo) {
            $(this).addClass("active");
            // Si está dentro de un menú emergente, también marca al padre
            $(this).closest(".dropdown").find(".dropdown-toggle").addClass("active");
        }
    });
}


/* Escribe el año actual en el aviso de derechos de autor */
function cargarAnioActual() {
    $(".gu-anio").text(new Date().getFullYear());
}


/* Se ejecuta cuando el documento está listo */
$(document).ready(function () {
    cargarRedesSociales();
    marcarPaginaActiva();
    cargarAnioActual();
});
