let productos;

export async function getCarta() {
  let response;
  try {
    // Obtener la carta especial sin necesidad de iniciar sesión
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1Q6bWjxzIDk5KJzow7_BP0dZ_52c8w6QBguviHkSyuxI",
      range: "Pedidos!A4:G", // Cambia este rango a la hoja y rango donde está la carta especial
    });
  } catch (err) {
    console.error(err);
    return;
  }

  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    console.warn("No se encontraron productos en la carta especial");
    return;
  }

  const carta = [];

  range.values.forEach((row) => {
    const newProducto = {
      id: row[0],
      producto: row[1],
      cantidad: row[2],
      precio: row[3],
      descripcion: row[4],
      categoria: row[5],
      imagen: row[6],
    };
    carta.push(newProducto);
  });

  return carta;
}

export async function getProductos() {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1Q6bWjxzIDk5KJzow7_BP0dZ_52c8w6QBguviHkSyuxI",
      range: "Pedidos!A4:F",
    });
  } catch (err) {
    console.error(err);
    // document.getElementById('content').innerText = err.message;
    return;
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    console.warn("No data found");
    // document.getElementById('content').innerText = 'No values found.';
    return;
  }

  productos = [];

  range.values.forEach((row) => {
    const newProductos = {
      id: row[0],
      producto: row[1],
      cantidad: row[2],
      precio: row[3],
      descripcion: row[4],
      categoria: row[5],
      imagen: row[6],
    };
    productos.push(newProductos);
  });

  return productos;
}

export async function subirPedido(contenido) {
  const update = [
    contenido.id, // ID único del pedido (puedes usar Date.now() o algún otro método)
    contenido.nombreCliente, // Nombre del cliente
    contenido.productos.map((p) => `${p.producto} x${p.cantidad}`).join(", "), // Nombres de los productos y cantidades (ej: "Café Americano x2")
    contenido.total, // El total de la orden
    contenido.metodoPago, // El método de pago
    "NO", // Puedes agregar el estado del pedido si lo deseas
    new Date().toISOString(), // Fecha y hora en que se realizó el pedido
  ];

  try {
    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: "1Q6bWjxzIDk5KJzow7_BP0dZ_52c8w6QBguviHkSyuxI", // ID de la hoja de cálculo
      range: "Pedidos!I4:O", // El rango donde agregarás los datos del pedido
      valueInputOption: "USER_ENTERED", // El tipo de entrada, para permitir formatos como fechas
      resource: {
        values: [update], // Los datos del pedido a insertar
      },
    });
    return response;
  } catch (error) {
    throw new Error("Error al subir el pedido");
  }
}

window.subirPedido = subirPedido;
