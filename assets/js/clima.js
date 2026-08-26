/* ============================================================
   clima.js - Consumo de API Rest EXTERNO (OpenWeatherMap)

   Funcionalidad adicional: según el clima del lugar se
   recomienda qué tipo de textura y cuidado usar ese día.
   ============================================================ */

/* TODO: pegar aquí la API KEY de openweathermap.org */
var API_KEY_CLIMA = "AIzaSyAuibMb4C6Yl-Z9accErq8I42JjlFZFlPg";

/* Endpoint del servicio Current Weather Data */
var URL_CLIMA = "https://api.openweathermap.org/data/2.5/weather";

/* Ubicación por defecto: San José, Costa Rica.
   Se usa al cargar para no pedir permisos apenas entra el usuario. */
var CIUDAD_DEFECTO = { lat: 9.93, lon: -84.08 };


/* Decide la recomendación de cuidado según temperatura y humedad */
function obtenerRecomendacion(temperatura, humedad) {

    if (temperatura >= 28) {
        return {
            titulo: "Día caluroso",
            texto: "Con este calor la piel produce más grasa. Usá texturas ligeras en gel " +
                   "y reaplicá el protector solar cada dos horas.",
            icono: "bi-brightness-high"
        };
    }

    if (humedad >= 80) {
        return {
            titulo: "Ambiente húmedo",
            texto: "La humedad alta puede sentirse pesada sobre la piel. Preferí serums " +
                   "acuosos y evitá las cremas muy oclusivas.",
            icono: "bi-droplet-half"
        };
    }

    if (humedad <= 50) {
        return {
            titulo: "Ambiente seco",
            texto: "El aire seco deshidrata. Sumá un serum de ácido hialurónico y sellá " +
                   "con una crema más rica de lo habitual.",
            icono: "bi-wind"
        };
    }

    return {
        titulo: "Clima equilibrado",
        texto: "Buen día para mantener tu rutina completa: limpieza, tónico, serum, " +
               "hidratante y protector solar.",
        icono: "bi-stars"
    };
}


/* Pinta la información del clima y la recomendación en el home */
function mostrarClima(datos) {

    var temperatura = datos.main.temp;
    var humedad = datos.main.humidity;
    var lugar = datos.name;
    var icono = datos.weather[0].icon;
    var descripcion = datos.weather[0].description;

    $("#gu-clima-lugar").text(lugar);
    $("#gu-clima-temp").text(Math.round(temperatura) + "\u00B0C");
    $("#gu-clima-desc").text(descripcion);
    $("#gu-clima-humedad").text(humedad + "%");
    $("#gu-clima-icono").attr("src",
        "https://openweathermap.org/img/wn/" + icono + "@2x.png");

    var recomendacion = obtenerRecomendacion(temperatura, humedad);

    $("#gu-clima-reco-icono").attr("class", "bi " + recomendacion.icono);
    $("#gu-clima-reco-titulo").text(recomendacion.titulo);
    $("#gu-clima-reco-texto").text(recomendacion.texto);

    $("#gu-clima-contenido").removeClass("d-none");
    $("#gu-clima-cargando").addClass("d-none");
}


/* Consulta el servicio para unas coordenadas dadas */
function consultarClima(latitud, longitud) {

    var parametros = "?lat=" + latitud +
                     "&lon=" + longitud +
                     "&units=metric" +
                     "&lang=es" +
                     "&appid=" + API_KEY_CLIMA;

    $.getJSON(URL_CLIMA + parametros, function (datos) {
        mostrarClima(datos);
    }).fail(function (xhr) {
        console.error("Error al consultar el clima. Estado: " + xhr.status);
        $("#gu-clima-cargando").text("No se pudo obtener el clima en este momento.");
    });
}


/* Usa la ubicación real del navegador si el usuario lo autoriza */
function usarMiUbicacion() {

    if (!navigator.geolocation) {
        alert("Tu navegador no permite obtener la ubicación.");
        return;
    }

    $("#gu-clima-contenido").addClass("d-none");
    $("#gu-clima-cargando").removeClass("d-none").text("Obteniendo tu ubicación...");

    navigator.geolocation.getCurrentPosition(
        function (posicion) {
            consultarClima(posicion.coords.latitude, posicion.coords.longitude);
        },
        function () {
            $("#gu-clima-cargando").text("No se pudo obtener tu ubicación. Mostrando San José.");
            consultarClima(CIUDAD_DEFECTO.lat, CIUDAD_DEFECTO.lon);
        }
    );
}


/* Al cargar el home se consulta el clima de la ciudad por defecto */
$(document).ready(function () {

    if ($("#gu-clima").length > 0) {
        consultarClima(CIUDAD_DEFECTO.lat, CIUDAD_DEFECTO.lon);

        $("#gu-clima-btn-ubicacion").click(function () {
            usarMiUbicacion();
        });
    }
});
