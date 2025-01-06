import { getProductos } from "../js/sheets.js"; // Importar la función `getProductos` de `sheets.js`
// Definir `total` globalmente dentro de `auth.js`
let total = 0;
let productos = []; // Asegúrate de que 'productos' esté definida aquí a nivel global.
let totalPriceElement = 0;

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID =
  "675172685345-ntphot9tfl34upqnnh0c266qqjs9e269.apps.googleusercontent.com";
const API_KEY = "AIzaSyC76rfUZEarE49OqnT9-tbltAnO91KaCRo";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("gapi").addEventListener("load", gapiLoaded());
document.getElementById("gis").addEventListener("load", gisLoaded());

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  // Solo proceder si las bibliotecas están cargadas
  if (gapiInited && gisInited) {
    // Obtener el token
    const token = gapi.client.getToken();

    if (token) {
      // Si hay un token, mostramos el botón "Cerrar sesión" y el contenido
      document.getElementById("authorize_button").style.display = "none"; // Ocultar "Iniciar sesión"
      document.getElementById("signout_button").style.display = "inline-block"; // Mostrar "Cerrar sesión"
      document.getElementById("total-container").style.display = "block"; // Mostrar el contenedor de total
    } else {
      // Si no hay token, mostramos el botón "Iniciar sesión"
      document.getElementById("authorize_button").style.display =
        "inline-block"; // Mostrar "Iniciar sesión"
      document.getElementById("signout_button").style.display = "none"; // Ocultar "Cerrar sesión"
      document.getElementById("total-container").style.display = "none"; // Ocultar el contenedor de total
    }
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    // Mostrar el botón de "Cerrar Sesión"
    // Actualizar el estado de los botones
    document.getElementById("authorize_button").style.display = "none";
    document.getElementById("signout_button").style.display = "inline-block";
    document.getElementById("total-container").style.display = "block";

    // Aquí puedes hacer algo con el nombre, como registrarlo en el pedido
    productos = await getProductos();
    cargarProductos(); // Asegúrate de que esta función esté definida
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();

  if (token !== null) {
    // Revocar el token de acceso
    google.accounts.oauth2.revoke(token.access_token, function () {
      // Limpiar el token de cliente
      gapi.client.setToken("");

      // Verificar si el elemento "content" existe antes de intentar modificarlo
      const contentElement = document.getElementById("content");
      if (contentElement) {
        contentElement.innerText = ""; // Limpiar contenido
      }

      // Mostrar el botón de autorizar e hidde el botón de cierre de sesión
      const authorizeButton = document.getElementById("authorize_button");
      const signoutButton = document.getElementById("signout_button");
      const totalContainer = document.getElementById("total-container");

      if (authorizeButton) {
        authorizeButton.style.display = "inline-block";
      }
      if (signoutButton) {
        signoutButton.style.display = "none";
      }
      if (totalContainer) {
        totalContainer.style.display = "none";
      }
    });
  } else {
    console.log("Error...");
  }
}

// Función para cargar los productos
function cargarProductos() {
  const container = document.getElementById("items-container");
  totalPriceElement = document.getElementById("total-price");

  if (productos && productos.length > 0) {
    productos.forEach((producto) => {
      const itemHTML = `
      <div class="col-12 my-1 border border-left-0 border-top-0 border-right-0 mb-0 item">
        <a href="#" class="pb-0 d-block text-dark text-decoration-none">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong class="item-name">${producto.producto}</strong>
              <p class="mt-1 mb-0">${producto.descripcion}</p>
            </div>
            <div class="col-3 text-end">
              <h6 class="text-primary">S/. ${producto.precio}</h6>
            </div>
          </div>
        </a>
        <div class="d-flex align-items-center justify-content-center mt-2 mb-3">
          <button class="decrease-quantity btn btn-danger btn-sm mx-1">-</button>
          <input
            type="number"
            class="form-control text-center"
            style="width: 50px"
            value="0"
            min="0"
            data-price="${producto.precio}"
          />
          <button class="increase-quantity btn btn-success btn-sm mx-1">+</button>
        </div>
      </div>
    `;
      container.insertAdjacentHTML("beforeend", itemHTML);

      // Agregar listeners de botones para incrementar y decrementar la cantidad
      const lastItem = container.lastElementChild;
      const decreaseButton = lastItem.querySelector(".decrease-quantity");
      const increaseButton = lastItem.querySelector(".increase-quantity");
      const quantityInput = lastItem.querySelector("input");

      // Decrementar cantidad
      decreaseButton.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 0) {
          quantityInput.value = currentValue - 1;
          updateTotal();
        }
      });

      // Incrementar cantidad
      increaseButton.addEventListener("click", () => {
        const currentValue = parseInt(quantityInput.value);
        quantityInput.value = currentValue + 1;
        updateTotal();
      });
    });
  } else {
    container.innerHTML = "<p>No se encontraron productos.</p>";
  }
}

// Función para actualizar el total de los productos seleccionados
function updateTotal() {
  total = 0;
  const inputs = document.querySelectorAll(
    '#items-container input[type="number"]'
  );
  inputs.forEach((input) => {
    const price = parseFloat(input.dataset.price);
    const quantity = parseInt(input.value) || 0;
    total += price * quantity;
  });
  totalPriceElement.textContent = `S/. ${total.toFixed(2)}`;

  // Obtener el botón de realizar pedido
  const pedidoButton = document.getElementById("hacer-pedido");
  // Activar o desactivar el botón de "Hacer Pedido" basado en el total
  if (total === 0) {
    pedidoButton.setAttribute("disabled", "true"); // Deshabilitar si el total es 0
  } else {
    pedidoButton.removeAttribute("disabled"); // Habilitar si el total es mayor a 0
  }
}

// Exponer las funciones a nivel global
window.handleAuthClick = handleAuthClick;
window.handleSignoutClick = handleSignoutClick;
window.productos = productos; // Hacer 'productos' accesible globalmente
