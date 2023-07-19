const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
	res.header("Content-Type", "application/json; charset=utf-8");
	next();
});

// Ruta de inicio
app.get("/", (req, res) => {
	res.status(200).end("Bienvenidos a la API de Computación");
});

//Ruta para obtener todos los productos
app.get("/productos", async (req, res) => {
	try {
		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
			return;
		}

		// Obtener la colección computacion y convertir los documentos a un array
		const db = client.db("computacion");
		const productos = await db.collection("computacion").find().toArray();
		res.json(productos);
	} catch (error) {
		// Manejo de errores al obtener las productos
		res.status(500).send("Error al obtener los productos de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Ruta para obtener el producto por su ID
app.get("/productos/:codigo", async (req, res) => {
	const codigo = parseInt(req.params.codigo);
	try {
		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
			return;
		}

		// Obtener la colección computacion y buscar el producto por su ID
		const db = client.db("computacion");
		const producto = await db
			.collection("computacion")
			.findOne({ codigo: codigo });
		if (producto) {
			res.json(producto);
		} else {
			res.status(404).send("Producto no encontrado");
		}
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Ruta para obtener productos por parte de su nombre
app.get("/productos/nombre/:nombre", async (req, res) => {
	const productoQuery = req.params.nombre;
	let productoNombre = RegExp(productoQuery, "i");
	try {
		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
			return;
		}

		// Obtener la colección computacion y buscarlos por parte de su nombre
		const db = client.db("computacion");
		const producto = await db
			.collection("computacion")
			.find({ nombre: productoNombre })
			.toArray();

		if (producto.length > 0) {
			res.json(producto);
		} else {
			res.status(404).send("Producto no encontrada");
		}
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Ruta para obtener los productos según su categoría
app.get("/productos/categoria/:categoria", async (req, res) => {
	const categoriaQuery = req.params.categoria;
	let categoriaNombre = RegExp(categoriaQuery, "i");
	try {
		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
			return;
		}

		// Obtener la colección computacion y buscarlos según su categoría
		const db = client.db("computacion");
		const productos = await db
			.collection("computacion")
			.find({
				categoria: categoriaNombre,
			})
			.toArray();
		if (productos.length > 0) {
			res.json(productos);
		} else {
			res.status(404).send("la categoria no existe");
		}
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Ruta para agregar un nuevo producto
app.post("/productos", async (req, res) => {
	const nuevoProducto = req.body;
	try {
		if (nuevoProducto === undefined) {
			res.status(400).send("Error en el formato de datos a crear.");
		}

		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
		}

		const db = client.db("computacion");
		const collection = db.collection("computacion");
		await collection.insertOne(nuevoProducto);
		console.log("Nuevo producto creado");
		res.status(201).send(nuevoProducto);
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

//Ruta para modificar un recurso
app.patch("/productos/:codigo", async (req, res) => {
	const codigoProducto = parseInt(req.params.codigo);
	const { precio } = req.body;
	try {
		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
		}

		const db = client.db("computacion");
		const collection = db.collection("computacion");

		await collection.updateOne(
			{ codigo: codigoProducto },
			{ $set: { precio: precio } }
		);

		console.log("Precio del Producto Modificado");

		res.status(200).send("Precio del Producto Modificado");
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Ruta para eliminar un recurso
app.delete("/productos/:codigo", async (req, res) => {
	const codigoProducto = parseInt(req.params.codigo);
	try {
		if (!codigoProducto) {
			res.status(400).send("Error en el formato de datos a eliminar.");
			return;
		}

		// Conexión a la base de datos
		const client = await connectToDB();
		if (!client) {
			res.status(500).send("Error al conectarse a MongoDB");
			return;
		}

		// Obtener la colección productos, buscar el producto por su ID y eliminarla
		const db = client.db("computacion");
		const collection = db.collection("computacion");
		const resultado = await collection.deleteOne({ codigo: codigoProducto });
		if (resultado.deletedCount === 0) {
			res
				.status(404)
				.send("No se encontró ningun producto con el id seleccionado.");
		} else {
			console.log("Producto Eliminado");
			res.status(204).send();
		}
	} catch (error) {
		// Manejo de errores al obtener el producto
		res.status(500).send("Error al obtener el producto de la base de datos");
	} finally {
		// Desconexión de la base de datos
		await disconnectFromMongoDB();
	}
});

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
});
