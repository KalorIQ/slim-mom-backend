export const deleteMyProducts = async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: Implement delete product logic
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
