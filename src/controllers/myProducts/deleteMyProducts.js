import createHttpError from "http-errors";
import { MyProducts } from "../../db/models/MyProducts.model.js";
import mongoose from "mongoose";

const deleteMyProducts = async (req, res) => {
  try {
    const { date } = req.query;
    const { id } = req.params;
    const owner = req.user._id;

    // Debug log'ları ekleyelim
    console.log("=== DELETE REQUEST DEBUG ===");
    console.log("- Request URL:", req.originalUrl);
    console.log("- Request Method:", req.method);
    console.log("- Request Headers:", JSON.stringify(req.headers, null, 2));
    console.log("- Request Params:", JSON.stringify(req.params, null, 2));
    console.log("- Request Query:", JSON.stringify(req.query, null, 2));
    console.log("- ID:", id);
    console.log("- Date:", date);
    console.log("- Owner:", owner);
    console.log("- ID Type:", typeof id);
    console.log("- Date Type:", typeof date);

    // Validasyonlar
    if (!date) {
      throw createHttpError(400, "Date parameter is required!");
    }

    if (!id) {
      throw createHttpError(400, "Product ID is required!");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError(400, `Invalid product ID format: ${id}`);
    }

    // Tarih formatını düzeltelim - Date objesi olarak
    let dateFormatted;
    let dateString;
    try {
      // Eğer date zaten YYYY-MM-DD formatındaysa
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateString = date;
        dateFormatted = new Date(date + 'T00:00:00.000Z');
      } else {
        // Değilse parse et
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          throw createHttpError(400, `Invalid date format: ${date}`);
        }
        dateFormatted = parsedDate;
        dateString = parsedDate.toISOString().split("T")[0];
      }
    } catch (error) {
      throw createHttpError(400, `Date parsing error: ${error.message}`);
    }

    console.log("- Date String:", dateString);
    console.log("- Date Object:", dateFormatted);

    // Önce o tarih için tüm ürünleri listeleyelim (debug için)
    const allProductsForDate = await MyProducts.find({
      owner,
      date: {
        $gte: new Date(dateString + 'T00:00:00.000Z'),
        $lt: new Date(dateString + 'T23:59:59.999Z')
      }
    });

    console.log("- All products for this date:", allProductsForDate.map(p => ({
      id: p._id.toString(),
      date: p.date,
      productId: p.productId,
      productWeight: p.productWeight
    })));

    // Önce ürünün var olup olmadığını kontrol edelim
    const existingProduct = await MyProducts.findOne({
      _id: id,
      owner,
      date: {
        $gte: new Date(dateString + 'T00:00:00.000Z'),
        $lt: new Date(dateString + 'T23:59:59.999Z')
      }
    });

    console.log("- Existing product:", existingProduct);

    if (!existingProduct) {
      // Daha detaylı hata mesajı için ayrı ayrı kontrol edelim
      const productById = await MyProducts.findOne({ _id: id });
      const productByOwner = await MyProducts.findOne({ _id: id, owner });
      
      console.log("- Product by ID only:", productById);
      console.log("- Product by ID and Owner:", productByOwner);

      let errorMessage = `Product not found. `;
      
      if (!productById) {
        errorMessage += `No product exists with ID: ${id}`;
      } else if (!productByOwner) {
        errorMessage += `Product exists but doesn't belong to this user`;
      } else {
        errorMessage += `Product exists but not for date: ${dateString}`;
        // Gerçek tarihi de gösterelim
        const actualDate = productById.date.toISOString().split('T')[0];
        errorMessage += ` (Product date: ${actualDate})`;
      }

      return res.status(404).json({
        message: errorMessage,
        debug: {
          searchedId: id,
          searchedDate: dateString,
          searchedOwner: owner,
          productById: !!productById,
          productByOwner: !!productByOwner,
          actualProductDate: productById?.date,
          allProductsForDate: allProductsForDate.length,
          allProductIds: allProductsForDate.map(p => p._id.toString()),
        }
      });
    }

    // Ürünü sil
    const deletedProduct = await MyProducts.findOneAndDelete({
      _id: id,
      owner,
      date: {
        $gte: new Date(dateString + 'T00:00:00.000Z'),
        $lt: new Date(dateString + 'T23:59:59.999Z')
      }
    });

    console.log("- Deleted product:", deletedProduct);
    console.log("=== DELETE REQUEST COMPLETED ===");

    res.status(200).json({ 
      message: "Product deleted successfully!", 
      productId: id,
      deletedProduct 
    });

  } catch (error) {
    console.error("Delete product error:", error);
    
    if (error.status) {
      // createHttpError ile oluşturulan hatalar
      return res.status(error.status).json({
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }

    // Beklenmeyen hatalar
    res.status(500).json({
      message: "Internal server error while deleting product",
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

export { deleteMyProducts };
