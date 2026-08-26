/* ============================================================
   contacto.js - Formulario de registro de Glow Up

   Incluye las validaciones escritas en JavaScript propio y el
   cálculo automático de la edad a partir de la fecha de
   nacimiento, que se guarda en un campo oculto del formulario.
   ============================================================ */


/* ------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------ */

/* Calcula la edad en años cumplidos a partir de la fecha de nacimiento */
function calcularEdad(fechaNacimiento) {

    var nacimiento = new Date(fechaNacimiento + "T00:00:00");
    var hoy = new Date();

    var edad = hoy.getFullYear() - nacimiento.getFullYear();
    var mes = hoy.getMonth() - nacimiento.getMonth();

    // Si todavía no ha cumplido años este año, se resta uno
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad = edad - 1;
    }

    return edad;
}


/* Da formato de colones al rango de ingreso */
function formatoIngreso(monto) {
    return "\u20A1" + Number(monto).toLocaleString("es-CR");
}


/* Muestra un mensaje de error debajo del campo indicado */
function marcarError(idCampo, mensaje) {
    $("#" + idCampo).addClass("gu-campo-error");
    $("#error-" + idCampo).text(mensaje).show();
}


/* Quita la marca de error de un campo */
function limpiarError(idCampo) {
    $("#" + idCampo).removeClass("gu-campo-error");
    $("#error-" + idCampo).text("").hide();
}


/* Quita todos los mensajes de error del formulario */
function limpiarTodosLosErrores() {
    $(".gu-campo-error").removeClass("gu-campo-error");
    $(".gu-error").text("").hide();
    $("#gu-form-aviso").addClass("d-none").removeClass("gu-aviso-ok gu-aviso-error");
}


/* ------------------------------------------------------------
   Validaciones individuales
   ------------------------------------------------------------ */

/* El nombre debe tener al menos dos palabras de dos letras */
function validarNombre() {

    var valor = $("#nombre").val().trim();

    if (valor === "") {
        marcarError("nombre", "Escribí tu nombre completo.");
        return false;
    }

    var palabras = valor.split(/\s+/);

    if (palabras.length < 2 || palabras[0].length < 2 || palabras[1].length < 2) {
        marcarError("nombre", "Indicá al menos nombre y un apellido.");
        return false;
    }

    limpiarError("nombre");
    return true;
}


/* El correo debe tener un formato válido */
function validarCorreo() {

    var valor = $("#correo").val().trim();

    if (valor === "") {
        marcarError("correo", "Escribí tu correo electrónico.");
        return false;
    }

    // Patrón simple: texto@texto.dominio
    var patron = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!patron.test(valor)) {
        marcarError("correo", "El formato del correo no es válido.");
        return false;
    }

    limpiarError("correo");
    return true;
}


/* La fecha no puede estar vacía, ser futura ni corresponder a un menor */
function validarFechaNacimiento() {

    var valor = $("#fechaNacimiento").val();

    if (valor === "") {
        marcarError("fechaNacimiento", "Seleccioná tu fecha de nacimiento.");
        return false;
    }

    var nacimiento = new Date(valor + "T00:00:00");
    var hoy = new Date();

    if (nacimiento > hoy) {
        marcarError("fechaNacimiento", "La fecha no puede ser futura.");
        return false;
    }

    var edad = calcularEdad(valor);

    if (edad < 15) {
        marcarError("fechaNacimiento", "Debés tener al menos 15 años para registrarte.");
        return false;
    }

    if (edad > 110) {
        marcarError("fechaNacimiento", "Revisá la fecha, el año parece incorrecto.");
        return false;
    }

    limpiarError("fechaNacimiento");
    return true;
}


/* Debe haber una opción de género seleccionada */
function validarGenero() {

    if ($("input[name='genero']:checked").length === 0) {
        marcarError("genero", "Seleccioná una opción.");
        return false;
    }

    limpiarError("genero");
    return true;
}


/* Debe seleccionarse al menos un grado académico */
function validarGrado() {

    var seleccionados = $("#gradoAcademico").val();

    if (seleccionados === null || seleccionados.length === 0) {
        marcarError("gradoAcademico", "Seleccioná al menos un grado académico.");
        return false;
    }

    limpiarError("gradoAcademico");
    return true;
}


/* ------------------------------------------------------------
   Cálculo de la edad y campo oculto
   ------------------------------------------------------------ */

/* Actualiza el campo oculto de edad y el texto informativo */
function actualizarEdad() {

    var valor = $("#fechaNacimiento").val();

    if (valor === "") {
        $("#edad").val("");
        $("#gu-edad-texto").text("");
        return;
    }

    var edad = calcularEdad(valor);

    // El enunciado pide que la edad viaje oculta en el formulario
    $("#edad").val(edad);

    if (edad >= 0 && edad < 120) {
        $("#gu-edad-texto").text("Edad calculada: " + edad + " años");
    } else {
        $("#gu-edad-texto").text("");
    }
}


/* ------------------------------------------------------------
   Envío del formulario
   ------------------------------------------------------------ */

/* Arma el cuerpo del correo con todos los datos del formulario */
function armarCuerpoCorreo() {

    var grados = $("#gradoAcademico").val();

    var cuerpo = "";
    cuerpo += "Nombre: " + $("#nombre").val().trim() + "\n";
    cuerpo += "Correo: " + $("#correo").val().trim() + "\n";
    cuerpo += "Fecha de nacimiento: " + $("#fechaNacimiento").val() + "\n";
    cuerpo += "Edad: " + $("#edad").val() + " anios\n";
    cuerpo += "Rango de ingreso: " + formatoIngreso($("#ingreso").val()) + "\n";
    cuerpo += "Genero: " + $("input[name='genero']:checked").val() + "\n";
    cuerpo += "Grado academico: " + grados.join(", ") + "\n";

    var comentario = $("#mensaje").val().trim();
    if (comentario !== "") {
        cuerpo += "\nComentario:\n" + comentario + "\n";
    }

    return cuerpo;
}


/* Valida todo el formulario y, si está correcto, abre el correo */
function enviarFormulario() {

    limpiarTodosLosErrores();

    // Se ejecutan todas las validaciones para que el usuario vea
    // de una vez todos los campos que debe corregir
    var ok = true;
    ok = validarNombre() && ok;
    ok = validarCorreo() && ok;
    ok = validarFechaNacimiento() && ok;
    ok = validarGenero() && ok;
    ok = validarGrado() && ok;

    if (!ok) {
        $("#gu-form-aviso")
            .removeClass("d-none")
            .addClass("gu-aviso-error")
            .text("Revisá los campos marcados antes de enviar.");
        return;
    }

    var asunto = "Registro Glow Up - " + $("#nombre").val().trim();
    var cuerpo = armarCuerpoCorreo();

    // El sitio es estático, por eso el envío se hace abriendo el
    // cliente de correo del usuario con los datos ya cargados
    var enlace = "mailto:" + CONTACTO.correo +
                 "?subject=" + encodeURIComponent(asunto) +
                 "&body=" + encodeURIComponent(cuerpo);

    window.location.href = enlace;

    $("#gu-form-aviso")
        .removeClass("d-none")
        .addClass("gu-aviso-ok")
        .text("Listo. Se abrió tu correo con los datos para que los envíes.");
}


/* Deja el formulario como estaba al cargar la página */
function limpiarFormulario() {
    document.getElementById("gu-form-registro").reset();
    limpiarTodosLosErrores();
    $("#gu-edad-texto").text("");
    $("#gu-ingreso-valor").text(formatoIngreso($("#ingreso").val()));
    $("#edad").val("");
}


/* ------------------------------------------------------------
   Eventos
   ------------------------------------------------------------ */

$(document).ready(function () {

    if ($("#gu-form-registro").length === 0) {
        return;
    }

    // Valor inicial del rango de ingreso
    $("#gu-ingreso-valor").text(formatoIngreso($("#ingreso").val()));

    // El rango muestra el monto mientras se arrastra
    $("#ingreso").on("input", function () {
        $("#gu-ingreso-valor").text(formatoIngreso($(this).val()));
    });

    // La edad se recalcula cada vez que cambia la fecha
    $("#fechaNacimiento").change(function () {
        actualizarEdad();
        validarFechaNacimiento();
    });

    // Validación en el momento en que el usuario sale del campo
    $("#nombre").blur(validarNombre);
    $("#correo").blur(validarCorreo);
    $("input[name='genero']").change(validarGenero);
    $("#gradoAcademico").change(validarGrado);

    $("#gu-btn-enviar").click(enviarFormulario);
    $("#gu-btn-limpiar-form").click(limpiarFormulario);
});
