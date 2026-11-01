let currentTab = 'gadget';
let cart = [];

// Base API URL (Works dynamically both locally and on Vercel)
const API_URL = '/api/products';

async function fetchProducts() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('products-container');
    loading.style.display = 'block';
    container.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}?category=${currentTab}`);
        const products = await response.json();
        
        loading.style.display = 'none';
        if(products.length === 0) {
            container.innerHTML = '<p class="status-msg">No products found in this category.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img"><i class="fas ${product.icon || 'fa-box'}"></i></div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">৳${product.price}</p>
                <button class="add-btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        loading.innerText = 'Error loading products from Database.';
        console.error(err);
    }
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    fetchProducts();
}

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('open'); }

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) { existing.quantity += 1; } 
    else { cart.push({ id, name, price, quantity: 1 }); }
    updateCartUI();
    document.getElementById('cart-sidebar').classList.add('open');
}

function updateCartUI() {
    const countSpan = document.getElementById('cart-count');
    const container = document.getElementById('cart-items-container');
    let totalItems = 0, totalPrice = 0;
    container.innerHTML = '';
    
    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += (item.price * item.quantity);
        container.innerHTML += `
            <div class="cart-item">
                <div><h4>${item.name}</h4><small>৳${item.price} x ${item.quantity}</small></div>
                <button style="border:none; background:none; color:#ff2a5f; cursor:pointer;" onclick="removeItem('${item.id}')"><i class="fas fa-trash"></i></button>
            </div>`;
    });
    countSpan.innerText = totalItems;
    document.getElementById('cart-total').innerText = totalPrice;
}

function removeItem(id) { cart = cart.filter(item => item.id !== id); updateCartUI(); }
function openOrderModal() { if(cart.length===0) return alert("Cart is empty!"); document.getElementById('order-modal').classList.add('open'); }
function closeOrderModal() { document.getElementById('order-modal').classList.remove('open'); }

function submitOrder(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    
    let text = `*New Order from Website*\\n\\n*Name:* ${name}\\n*Phone:* ${phone}\\n*Address:* ${address}\\n\\n*Products:*\\n`;
    cart.forEach(item => { text += `- ${item.name} (x${item.quantity}) = ৳${item.price * item.quantity}\\n`; });
    text += `\\n*Total:* ৳${document.getElementById('cart-total').innerText}`;
    
    window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
    cart = []; updateCartUI(); closeOrderModal(); toggleCart();
}

// Initial Fetch
fetchProducts();
