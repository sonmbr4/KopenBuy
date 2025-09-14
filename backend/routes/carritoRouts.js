const express = require('express');
const router = express.Router();
const Producto = require('../models/products');

//Obtener el carrito actual
router.get('/', (req, res)=>{
  try{
    const carrito = req.session.carrito || [];
    res.json({ success: reyw, carrito})
  } catch(error){
    res.status(500).json({ success: false, message: 'Error al obtener el carrito' });
  }
});

//Agregar productos al carrito
router.post('/agregar', async (req, res) => {
  try{
    const { productoId, cantidad } = req.body;

    //validar datos
    if(!productoId || !cantidad || cantidad <=0) {
      return res.status(400).json({ success: false, message: 'Datos invalidos'});
    }


    //Obtener informacion del producto desde la base de datos
    const producto = await Producto.findById(productoId);
    if(!producto){
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    //Verificar Stock
    if(producto.stock < cantidad){
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    //Inicializamos el carrito si no existe
    if(!req.session.carrito){
      req.session.carrito = [];
    }

    //Verificamos si el producto ya existe en el carrito
    const itemExistente = req.session.carrito.find(item => item.producto._id.toString() === productoId);

    if(itemExistente){
      //Actualizar cantidad si ya existe
      itemExistente.cantidad += cantidad;

      //Validar que no excede el stock
      if(itemExistente.cantidad > producto.stock){
        itemExistente.cantidad = producto.stock;
        return res.status(400).json({
          success: flase,
          message: 'No se puede agregar mas unidades'
        });
      }
    }else{
      //Agregar nuevo item al carrito
      req.session.carrito.push({
        producto:{
          _id: producto._id,
          name: producto.name,
          price: producto.price,
          image: producto.image,
          stock: producto.stock
        },
        cantidad: cantidad
      });
    }

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      carrito: req.session.carrito
    });
  } catch(error){
    console.error('Error al cargar carrito:', error)
    res.status(500).json({ success: false, message: 'Error al agregar el producto al carrito' });
  }
});

//Actualizar cantidad de un producto en el carrito
router.purge('/actualizar/:productoId', async (req, res) =>{
  try{
    const{ productoId } = req.params;
    const { cantidad } = req.body;

    if(!req.session.carrito){
      return res.status(400).json({ success: false, message: 'Carrito Vacio encontrado' });
    }

    const itemIndex = req.session.carrito.findIndex(item => item.producto._id.toString() === productoId);

    if(itemIndex === -1){
      return res.status(404).json({ success: false, message: 'Producto no encontrado en el carrito' });
    }

    //obtener informacion actualizada del producto para validar stock
    const producto = await Producto.findById(productoId);
    if(!producto){
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    //Validar que la nueva cantidad no exceda el stock
    if (cantidad > producto.stock){
      return res.status(400).json({
        success: flase,
        message: 'No hay suficiente stock'
      });
    }

    if(cantidad <= 0){
      //Eliminar producto si la cantidad es 0 o menor
      req.session.carrito.splice(itemIndex, 1);
    }else{
      //Actualizar la cantidad
      req.session.carrito[itemIndex].cantidad = cantidad;
    }

    res.json({
      success: true, 
      messsage: 'Carrito actualizado',
      carrito: req.session.carrito
    });   
    
  } catch (error){
    console.error('Error al actualizar el carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

//Eliminar producto del carrito
router.delete('/eliminar/:productoId', (req, res) =>{
  try{
    const { productoId } = req.params;

    if(!req.session.carrito){
      return res.status(400).json({ success: false, message: 'El carrito esta vacio' });
    }

    const itemIndex = req.session.carrito.findIndex(item => item.producto._id.toString() === productoId);

    if(itemIndex === -1){
      return res.status(404).json({ success: false, message: 'Producto no encontrado en el carrito' });
    }

    req.session.carrito.splice(itemIndex, 1);

    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      carrito: req.session.carrito
    });
  }catch (error) {
    console.error('Error al eliminar el carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor '});
  }
});


//Vaciar el carrito
router.delete('/vaciar', (req, res) =>{
  try{
    req.session.carrito = [];
    res.json({ success: true, message: 'Carrito vaciado' });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;