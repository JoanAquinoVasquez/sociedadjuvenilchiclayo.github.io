let productos;

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
      imagen: row[5],
    };
    productos.push(newProductos);
  });
  
  return productos;
}
