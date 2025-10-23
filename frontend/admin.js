document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById('name').value,
    price: parseFloat(document.getElementById('price').value),
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    imageUrl: document.getElementById('imageUrl').value
  };

  try {
    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    const data = await res.json();

    const msg = document.getElementById('responseMsg');
    if (res.ok) {
      msg.textContent = '✅ Product added successfully!';
      msg.className = 'text-green-600 text-center mt-4 font-semibold';
      document.getElementById('productForm').reset();
    } else {
      msg.textContent = `❌ Error: ${data.message || 'Something went wrong'}`;
      msg.className = 'text-red-600 text-center mt-4 font-semibold';
    }
  } catch (err) {
    console.error(err);
    const msg = document.getElementById('responseMsg');
    msg.textContent = '❌ Server error. Check backend connection.';
    msg.className = 'text-red-600 text-center mt-4 font-semibold';
  }
});
