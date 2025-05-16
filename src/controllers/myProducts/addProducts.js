export const addMyProducts = async (req, res) => {
  try {
    // TODO: Implement add products logic
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};
