import { calculateCalory } from '../utils/calculateCalory';

export const addProduct = async (userId, body) => {
  const calc = await calculateCalory(body);

  return await productsPerDate.create({ ...body, kcal: calc, owner: userId });
};

export const removeProduct = async (userId, { productId }) => {
  return await productsPerDate.findOneAndRemove({
    _id: productId,
    owner: userId,
  });
};

export const getProductsByDay = async (userId, date) => {
  const allDates = await productsPerDate.find({ owner: userId, date });
  const products = allDates.map((el) => {
    return {
      kcal: el.kcal,
      weight: el.weight,
      title: el.title,
      id: el._id,
    };
  });
  let productsOptimized;
  if (date === new Date().toLocaleDateString('fr-CA')) {
    productsOptimized = products;
  } else {
    productsOptimized = products.reduce((accum, el) => {
      const accumTitles = accum.map((elem) => elem.title) || [];
      if (accumTitles.includes(el.title)) {
        const sameProduct = accum.find((element) => element.title === el.title);
        sameProduct.weight = sameProduct.weight + el.weight;
        sameProduct.kcal = sameProduct.kcal + el.kcal;
      } else {
        accum.push(el);
      }
      return accum;
    }, []);
  }
  return productsOptimized;
};

export const getProductsByQuery = async (userId, { title }) => {
  const regex = new RegExp(title, 'i');
  const data = await productsPerDate
    .find({ title: regex, owner: userId })
    .limit(10);
  return data;
};

export const getAllProducts = async (userId) => {
  const allProducts = await productsPerDate.find({ owner: userId });
  const products = allProducts.map((el) => {
    return {
      kcal: el.kcal,
      weight: el.weight,
      title: el.title,
      id: el._id,
    };
  });
  return products;
};
