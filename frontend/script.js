// --- 1. Data & State Management ---
let FOOD_MENU = [];

async function loadMenuFromServer() {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        FOOD_MENU = data.map(item => ({
            id: item._id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category || 'GENERAL',
            imageUrl: item.imageUrl || `https://placehold.co/300x200/404040/CC8000?text=${encodeURIComponent(item.name)}`
        }));

        renderMenu();
    } catch (err) {
        console.error('Failed to load menu:', err);
    }
}


const SPECIAL_OFFERS = [
    { title: "20% OFF ALL PIZZAS!", action: "Use Code: PIZZA20", icon: "fas fa-pizza-slice", color: "text-accent-gold" },
    { title: "Free Garlic Fries with any Burger!", action: "Add 'F003' to your order!", icon: "fas fa-utensils", color: "text-secondary-accent" },
    { title: "VIP Week: 15% Off Your Entire Order.", action: "No code needed. Today Only!", icon: "fas fa-gift", color: "text-green-400" },
];

// Global state variables
let cart = []; // Stores cart items: { id, name, price, quantity }
let currentScreenId = 'menu-screen';
let lastOrder = {};

// Global DOM References (Will be assigned in init function)
let cartListDiv, cartTotalSpan, headerCartCountBadge, emptyMessage, checkoutBtn, bottomNav, offerRotatorDiv;

// --- 2. Screen Navigation (with Animation) ---

/** Updates the active navigation button color. */
function updateNav(screenId) {
    const navMap = {
        'menu-screen': 'nav-home',
        'cart-screen': 'nav-order',
        'booking-screen': 'nav-booking',
        'profile-screen': 'nav-profile'
    };

    // Reset all nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('text-accent-gold');
        btn.classList.add('text-text-light/50');
    });

    // Set active nav button
    const activeNavId = navMap[screenId];
    if (activeNavId) {
        const activeBtn = document.getElementById(activeNavId);
        if (activeBtn) {
            activeBtn.classList.add('text-accent-gold');
            activeBtn.classList.remove('text-text-light/50');
        }
    }
}

/** Switches the active screen with a sliding animation. */
function showScreen(newScreenId) {
    if (currentScreenId === newScreenId) return;

    const currentScreen = document.getElementById(currentScreenId);
    const newScreen = document.getElementById(newScreenId);
    
    // 1. Animate current screen out
    currentScreen.classList.add('animate-out');

    // 2. Set new screen to active (hidden by animate-out initially)
    setTimeout(() => {
        currentScreen.classList.remove('active', 'animate-out');
        
        // 3. Animate new screen in
        newScreen.classList.add('active', 'animate-in');
        currentScreenId = newScreenId;

        // 4. Update Bottom Nav visibility
        const isHidden = newScreenId === 'success-screen';
        bottomNav.classList.toggle('hidden', isHidden);
        
        // 5. Update Nav Button state
        updateNav(newScreenId);

    }, 300); // Duration matches CSS animation time
}

// Attach to window so HTML onclicks can access it
window.showScreen = showScreen;


// --- 3. Offer Rotator Logic ---
let currentOfferIndex = 0;
const offerDuration = 5000; // 5 seconds per offer

function renderOffer() {
    if (!offerRotatorDiv) return;

    const offer = SPECIAL_OFFERS[currentOfferIndex];

    // Use animation utility classes for smooth transition
    offerRotatorDiv.classList.remove('animate-pulseOffer');
    offerRotatorDiv.classList.add('opacity-0', 'transition-opacity', 'duration-500');

    setTimeout(() => {
        offerRotatorDiv.innerHTML = `
            <div class="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left space-y-1 sm:space-y-0 sm:space-x-4">
                <i class="${offer.icon} text-3xl ${offer.color}"></i>
                <div>
                    <p class="text-lg sm:text-xl font-extrabold ${offer.color}">${offer.title}</p>
                    <p class="text-sm text-text-light/80">${offer.action}</p>
                </div>
            </div>
        `;
        // Fade in the new content
        offerRotatorDiv.classList.remove('opacity-0');

        // Prepare for the next offer
        currentOfferIndex = (currentOfferIndex + 1) % SPECIAL_OFFERS.length;

    }, 500); // Wait for fade-out before changing content
}

/** Starts the offer rotation. */
function startOfferRotation() {
    renderOffer(); // Render the first offer immediately
    setInterval(renderOffer, offerDuration);
}


// --- 4. Menu Rendering ---

/** Populates the menu list dynamically with premium-looking banner cards. */
function renderMenu() {
    const menuList = document.getElementById('menu-list');
    if (!menuList) return;

    // Clear the skeleton loaders before rendering real content
    menuList.innerHTML = ''; 

    FOOD_MENU.forEach(item => {
        const card = document.createElement('div');
        
        // Banner style card for mobile app feel
        card.className = 'bg-card-bg rounded-xl overflow-hidden premium-shadow w-full h-40 flex items-center relative transition-all duration-300 hover:scale-[1.01]';
        
        // Function to set background image (handles fallback)
        function setBackgroundImage(url) {
            card.style.backgroundImage = `url(${url})`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        }

        // Set the initial background image
        setBackgroundImage(item.imageUrl);
        
        // Add error handling to switch to a reliable placeholder on failure
        const img = new Image();
        img.src = item.imageUrl;
        img.onerror = function() {
            // Fallback to a placehold.co image with the item name
            const fallbackUrl = `https://placehold.co/300x200/404040/CC8000?text=${encodeURIComponent(item.name.replace(/\s/g, '+'))}`;
            setBackgroundImage(fallbackUrl);
            console.log(`Image load failed for ${item.name}. Using fallback.`);
        };


        card.innerHTML = `
            <div class="absolute inset-0 bg-black/50 rounded-xl"></div>
            <div class="relative p-5 w-full flex justify-between items-end h-full">
                <div>
                    <span class="text-sm font-semibold text-accent-gold uppercase">${item.category}</span>
                    <h3 class="text-3xl font-extrabold text-white leading-tight mt-1">${item.name}</h3>
                    <p class="text-xl font-bold text-secondary-accent mt-2">$${item.price.toFixed(2)}</p>
                </div>
                <button 
                    class="px-5 py-2 bg-secondary-accent text-white font-bold rounded-lg transition-colors hover:bg-secondary-accent/80 shadow-lg text-sm" 
                    onclick="window.addToCart('${item.id}')"
                >
                    <i class="fas fa-cart-plus mr-1"></i> Add
                </button>
            </div>
        `;
        menuList.appendChild(card);
    });
}


// --- 5. Cart Logic & Rendering ---

/** Adds item to cart or increments quantity. */
function addToCart(itemId) {
    const foodItem = FOOD_MENU.find(item => item.id === itemId);
    if (!foodItem) return;

    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        // Use a deep copy to ensure the cart item is independent of the FOOD_MENU item
        cart.push({ ...foodItem, quantity: 1 });
    }
    renderCart();
}

/** Updates the quantity of a cart item. */
function updateQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1); // Remove item
        }
    }
    renderCart();
}

// Attach to window so HTML onclicks can access it
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;


/** Renders the cart list and updates summary/badge. */
function renderCart() {
    // Check if critical DOM elements are loaded
    if (!cartListDiv || !cartTotalSpan || !headerCartCountBadge || !emptyMessage || !checkoutBtn) {
         console.error("Critical error: Cart DOM elements not initialized.");
         return; 
    }
    
    let subtotal = 0;
    let totalItems = 0;
    cartListDiv.innerHTML = '';

    if (cart.length === 0) {
        emptyMessage.classList.remove('hidden');
        checkoutBtn.disabled = true;
    } else {
        emptyMessage.classList.add('hidden');
        checkoutBtn.disabled = false;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            const itemDiv = document.createElement('div');
            // Mobile Optimization: flex-col on small screens, flex-row on sm+
            itemDiv.className = 'flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-slate-700 last:border-b-0 transition duration-150';
            itemDiv.innerHTML = `
                <div class="flex flex-col mb-3 sm:mb-0 sm:flex-row sm:items-center flex-1 min-w-0">
                    <p class="text-lg font-semibold text-text-light truncate">${item.name}</p>
                    <p class="text-sm text-text-light/50 sm:ml-4">$${item.price.toFixed(2)} each</p> 
                </div>

                <div class="flex items-center justify-between w-full sm:w-auto">
                    <div class="flex items-center space-x-3">
                        <button class="w-8 h-8 bg-slate-500 rounded-full text-white transition hover:bg-slate-400 text-sm" onclick="window.updateQuantity('${item.id}', -1)">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="text-lg font-bold w-4 text-center">${item.quantity}</span>
                        <button class="w-8 h-8 bg-accent-gold rounded-full text-primary-dark transition hover:bg-accent-gold/80 text-sm" onclick="window.updateQuantity('${item.id}', 1)">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <div class="w-20 text-right">
                        <strong class="text-xl text-secondary-accent">$${itemTotal.toFixed(2)}</strong>
                    </div>
                </div>
            `;
            cartListDiv.appendChild(itemDiv);
        });
    }

    cartTotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    headerCartCountBadge.textContent = totalItems;
}


// --- 6. Checkout Logic ---

/** Handles the submission of the checkout form. */
function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
        // In a real app, this would show a custom message box
        console.error("Cart is empty! Cannot place order."); 
        return;
    }

    // Capture customer details
    const customer = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    // Construct the order object
    const order = {
        orderId: 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        customer: customer,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            total: (item.price * item.quantity).toFixed(2)
        })),
        grandTotal: cartTotalSpan.textContent, // Get final calculated total
        timestamp: new Date().toLocaleString()
    };
    
    // Store and display success
    lastOrder = order;
    renderOrderSummary();
    showScreen('success-screen');

    // Clear form fields
    this.reset();
}

/** Displays the order summary on the success screen. */
function renderOrderSummary() {
    const summaryDiv = document.getElementById('order-summary');
    
    if (!summaryDiv || !lastOrder.orderId) {
        console.error("Error: Order summary element is missing or last order is empty.");
        return;
    }

    let itemsHtml = lastOrder.items.map(item => 
        `<p class="text-base text-text-light/80"><span class="font-bold text-accent-gold">${item.quantity}x</span> ${item.name} <span class="float-right text-secondary-accent">$${item.total}</span></p>`
    ).join('');

    summaryDiv.innerHTML = `
        <h3 class="text-xl font-bold border-b border-slate-700 pb-2 mb-3 text-accent-gold">Order ${lastOrder.orderId}</h3>
        <p><strong>Customer:</strong> ${lastOrder.customer.name}</p>
        <p><strong>Delivery To:</strong> ${lastOrder.customer.address}</p>
        
        <h4 class="text-lg font-semibold mt-4 mb-2 text-text-light/90">Items Ordered:</h4>
        ${itemsHtml}
        
        <div class="border-t border-slate-700 mt-4 pt-3">
            <p class="text-2xl font-extrabold text-text-light">Total Paid: ${lastOrder.grandTotal}</p>
        </div>
    `;
}


// --- 7. Initialization & Reset ---

/** Clears state and returns to the menu screen. */
function resetApp() {
    cart = [];
    lastOrder = {};
    renderCart(); 
    showScreen('menu-screen');
}

// Attach to window so HTML onclicks can access it
window.resetApp = resetApp;


/** Initial setup on page load. */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Assigning DOM elements to global references
    cartListDiv = document.getElementById('cart-list');
    cartTotalSpan = document.getElementById('cart-total');
    headerCartCountBadge = document.getElementById('cart-count-header'); 
    emptyMessage = document.getElementById('empty-cart-message');
    checkoutBtn = document.getElementById('checkout-btn');
    bottomNav = document.getElementById('bottom-nav');
    offerRotatorDiv = document.getElementById('offer-rotator'); 

    // 2. Attach form submission handler
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    
    // 3. Initial Renders & Load Simulation
    renderCart(); 
    startOfferRotation(); 

    // Simulate loading delay for a nicer visual effect with the skeleton loaders
    setTimeout(() => {
        loadMenuFromServer(); 
        updateNav('menu-screen');
    }, 800);

});
