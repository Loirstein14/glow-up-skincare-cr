/* ============================================================
   ubicacion.js - Geolocalizacion con Google Maps API

   Muestra en un mapa el punto de entrega de Glow Up, obtiene la
   ubicacion del visitante y traza la ruta mas corta entre ambos.
   ============================================================ */


/* API KEY de Google Maps */
var API_KEY_MAPS = "AIzaSyC9n-3aw89zeTvKHdyBTSbx4ojO731AYNg";


/* Ubicacion real del punto de entrega */
var TIENDA = {
    lat: 9.99412316830603,
    lng: -84.11022464069269,
    nombre: "Glow Up",
    direccion: "Heredia, Costa Rica"
};


/* Objetos del mapa que se reutilizan durante toda la pagina */
var mapa = null;
var servicioRutas = null;
var dibujanteRutas = null;
var marcadorTienda = null;
var marcadorUsuario = null;
var posicionUsuario = null;
var modoViaje = "DRIVING";


/* Estilo en escala de grises para que el mapa combine con el sitio */
var ESTILO_MAPA = [
    { elementType: "geometry", stylers: [{ saturation: -100 }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#4a4a4a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#dcdcdc" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f4f4f4" }] }
];


/* ------------------------------------------------------------
   Mensajes en pantalla
   ------------------------------------------------------------ */

function mostrarAviso(texto, tipo) {
    $("#gu-mapa-aviso")
        .removeClass("d-none gu-aviso-ok gu-aviso-error")
        .addClass(tipo === "error" ? "gu-aviso-error" : "gu-aviso-ok")
        .text(texto);
}


function ocultarAviso() {
    $("#gu-mapa-aviso").addClass("d-none");
}


/* ------------------------------------------------------------
   Construccion del mapa
   ------------------------------------------------------------ */

/* Llama Google cuando termina de cargar su libreria */
function iniciarMapa() {

    mapa = new google.maps.Map(document.getElementById("gu-mapa"), {
        center: { lat: TIENDA.lat, lng: TIENDA.lng },
        zoom: 14,
        styles: ESTILO_MAPA,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Marcador del punto de entrega
    marcadorTienda = new google.maps.Marker({
        position: { lat: TIENDA.lat, lng: TIENDA.lng },
        map: mapa,
        title: TIENDA.nombre
    });

    var globo = new google.maps.InfoWindow({
        content: "<strong>" + TIENDA.nombre + "</strong><br>" + TIENDA.direccion
    });

    globo.open(mapa, marcadorTienda);

    marcadorTienda.addListener("click", function () {
        globo.open(mapa, marcadorTienda);
    });

    // Servicios para calcular y dibujar la ruta
    servicioRutas = new google.maps.DirectionsService();
    dibujanteRutas = new google.maps.DirectionsRenderer({
        map: mapa,
        suppressMarkers: false,
        polylineOptions: { strokeColor: "#111111", strokeWeight: 5, strokeOpacity: 0.8 }
    });

    $("#gu-mapa-cargando").addClass("d-none");
}


/* Carga la libreria de Google Maps agregando su script a la pagina. */
function cargarGoogleMaps() {

    if (API_KEY_MAPS.indexOf("PEGAR_AQUI") === 0) {
        $("#gu-mapa-cargando").text("Falta configurar la llave de Google Maps.");
        return;
    }

    var script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY_MAPS +
                 "&callback=iniciarMapa&language=es&region=CR";
    script.async = true;

    script.onerror = function () {
        $("#gu-mapa-cargando").text("No se pudo cargar Google Maps.");
    };

    document.head.appendChild(script);
}


/* ------------------------------------------------------------
   Geolocalizacion y ruta
   ------------------------------------------------------------ */

/* Pide la ubicacion del visitante y traza la ruta hasta la tienda */
function ubicarYTrazar() {

    if (mapa === null) {
        mostrarAviso("El mapa todavia se esta cargando, intentalo en unos segundos.", "error");
        return;
    }

    if (!navigator.geolocation) {
        mostrarAviso("Tu navegador no permite obtener la ubicacion.", "error");
        return;
    }

    mostrarAviso("Obteniendo tu ubicacion...", "ok");

    navigator.geolocation.getCurrentPosition(

        function (posicion) {
            posicionUsuario = {
                lat: posicion.coords.latitude,
                lng: posicion.coords.longitude
            };
            colocarMarcadorUsuario();
            trazarRuta();
        },

        function (error) {
            var mensaje = "No se pudo obtener tu ubicacion.";

            if (error.code === error.PERMISSION_DENIED) {
                mensaje = "Diste permiso denegado. Activa la ubicacion en el navegador para ver la ruta.";
            }

            mostrarAviso(mensaje, "error");
        },

        { enableHighAccuracy: true, timeout: 10000 }
    );
}


/* Coloca o mueve el marcador del visitante */
function colocarMarcadorUsuario() {

    if (marcadorUsuario !== null) {
        marcadorUsuario.setMap(null);
    }

    marcadorUsuario = new google.maps.Marker({
        position: posicionUsuario,
        map: mapa,
        title: "Tu ubicacion",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#111111",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3
        }
    });
}


/* Calcula la ruta entre el visitante y el punto de entrega */
function trazarRuta() {

    if (posicionUsuario === null) {
        mostrarAviso("Primero hay que obtener tu ubicacion.", "error");
        return;
    }

    var peticion = {
        origin: posicionUsuario,
        destination: { lat: TIENDA.lat, lng: TIENDA.lng },
        travelMode: google.maps.TravelMode[modoViaje]
    };

    servicioRutas.route(peticion, function (resultado, estado) {

        if (estado === "OK") {

            dibujanteRutas.setDirections(resultado);

            // El primer tramo trae la distancia y el tiempo estimado
            var tramo = resultado.routes[0].legs[0];

            $("#gu-ruta-distancia").text(tramo.distance.text);
            $("#gu-ruta-tiempo").text(tramo.duration.text);
            $("#gu-ruta-origen").text(tramo.start_address);
            $("#gu-ruta-datos").removeClass("d-none");

            ocultarAviso();

        } else if (estado === "ZERO_RESULTS") {
            mostrarAviso("No hay una ruta disponible para ese medio de transporte.", "error");
        } else {
            mostrarAviso("No se pudo calcular la ruta. Estado: " + estado, "error");
        }
    });
}


/* ------------------------------------------------------------
   Eventos
   ------------------------------------------------------------ */

$(document).ready(function () {

    if ($("#gu-mapa").length === 0) {
        return;
    }

    cargarGoogleMaps();

    // Enlace directo para abrir la ruta en la app de Google Maps
    $("#gu-abrir-maps").attr("href",
        "https://www.google.com/maps/dir/?api=1&destination=" + TIENDA.lat + "," + TIENDA.lng);

    $("#gu-btn-ubicarme").click(function () {
        ubicarYTrazar();
    });

    // Cambio de medio de transporte recalcula la ruta si ya hay ubicacion
    $(".gu-modo-btn").click(function () {
        $(".gu-modo-btn").removeClass("activo");
        $(this).addClass("activo");
        modoViaje = $(this).attr("data-modo");

        if (posicionUsuario !== null) {
            trazarRuta();
        }
    });
});
