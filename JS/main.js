
    document.addEventListener('DOMContentLoaded', function () {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');
        const searchInput = document.getElementById('search-input');
        
        const navNovedades = document.getElementById('nav-novedades');
        const navRebajas = document.getElementById('nav-rebajas');
        const navNovedadesMobile = document.getElementById('nav-novedades-mobile');
        const navRebajasMobile = document.getElementById('nav-rebajas-mobile');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuBtn = document.getElementById('menu-btn');

        // Menú móvil
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // --- FUNCIÓN CENTRALIZADA DE FILTRADO Y BÚSQUEDA ---
        function filterProducts(categoryOverride = null) {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            let activeCategory = categoryOverride;
            if (!activeCategory) {
                const activeBtn = document.querySelector('.filter-btn.text-black');
                activeCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
            }

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const titleEl = card.querySelector('h3');
                const descEl = card.querySelector('p');
                
                const cardTitle = titleEl ? titleEl.innerText.toLowerCase() : '';
                const cardDesc = descEl ? descEl.innerText.toLowerCase() : '';

                const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
                const matchesSearch = cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);

                // Usamos la clase 'hidden' de Tailwind en lugar de style.display para mayor compatibilidad
                if (matchesCategory && matchesSearch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        // Botones de filtro inferiores
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                filterButtons.forEach(btn => {
                    btn.classList.remove('text-black', 'border-b-2', 'border-black');
                    btn.classList.add('text-gray-600');
                });
                this.classList.remove('text-gray-600');
                this.classList.add('text-black', 'border-b-2', 'border-black');

                const filterValue = this.getAttribute('data-filter');
                filterProducts(filterValue);
            });
        });

        // Buscador en tiempo real
        if (searchInput) {
            searchInput.addEventListener('input', () => filterProducts());
        }

        // Sincronización Navbar (Escritorio y Móvil)
        function triggerNavFilter(filterName) {
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-filter') === filterName) {
                    btn.classList.remove('text-gray-600');
                    btn.classList.add('text-black', 'border-b-2', 'border-black');
                } else {
                    btn.classList.remove('text-black', 'border-b-2', 'border-black');
                    btn.classList.add('text-gray-600');
                }
            });

            if (searchInput) searchInput.value = '';
            filterProducts(filterName);
        }

        if (navNovedades) {
            navNovedades.addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
                triggerNavFilter('nuevo');
            });
        }

        if (navRebajas) {
            navRebajas.addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
                triggerNavFilter('rebajas');
            });
        }

        if (navNovedadesMobile) {
            navNovedadesMobile.addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
                triggerNavFilter('nuevo');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }

        if (navRebajasMobile) {
            navRebajasMobile.addEventListener('click', function (e) {
                e.preventDefault();
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
                triggerNavFilter('rebajas');
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        }

        // --- LÓGICA DEL CARRITO CON SELECTOR DE CANTIDAD ---
        let cart = [];
        const cartBtn = document.getElementById('cart-btn');
        const cartDrawer = document.getElementById('cart-drawer');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCartBtn = document.getElementById('close-cart');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalItems = document.getElementById('cart-total-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartCountBubble = document.getElementById('cart-count');
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp');

        function toggleCart() {
            if (cartDrawer) {
                cartDrawer.classList.toggle('hidden');
                document.body.style.overflow = cartDrawer.classList.contains('hidden') ? 'auto' : 'hidden';
            }
        }

        if (cartBtn) cartBtn.addEventListener('click', toggleCart);
        if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function () {
                const name = this.getAttribute('data-name');
                const price = parseFloat(this.getAttribute('data-price'));
                const img = this.getAttribute('data-img');
                
                // Lee el input de cantidad de esta tarjeta específica
                const card = this.closest('.product-card');
                const qtyInput = card.querySelector('.product-qty');
                const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

                const existingProduct = cart.find(item => item.name === name);
                if (existingProduct) {
                    existingProduct.quantity += quantity;
                } else {
                    cart.push({ name, price, img, quantity });
                }

                updateCartUI();
                toggleCart();
                
                if (qtyInput) qtyInput.value = 1; // Resetea el input a 1
            });
        });

        function updateCartUI() {
            if (!cartItemsContainer) return;
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `<p class="text-center text-gray-500 py-12 text-sm">Tu bolsa está vacía.</p>`;
                if (cartTotalItems) cartTotalItems.innerText = '0';
                if (cartCountBubble) cartCountBubble.innerText = '0';
                if (cartSubtotal) cartSubtotal.innerText = '$0';
                return;
            }

            let totalItems = 0;
            let subtotal = 0;

            cart.forEach((item, index) => {
                totalItems += item.quantity;
                subtotal += item.price * item.quantity;

                const itemElement = document.createElement('div');
                itemElement.className = 'flex items-center py-4 space-x-4';
                itemElement.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md bg-gray-100">
                    <div class="flex-1">
                        <h4 class="text-xs font-bold uppercase text-gray-900">${item.name}</h4>
                        <p class="text-xs text-gray-500">$${item.price} x ${item.quantity}</p>
                    </div>
                    <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold p-1">Eliminar</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });

            if (cartTotalItems) cartTotalItems.innerText = totalItems;
            if (cartCountBubble) cartCountBubble.innerText = totalItems;
            if (cartSubtotal) cartSubtotal.innerText = `$${subtotal}`;
        }

        window.removeItem = function(index) {
            cart.splice(index, 1);
            updateCartUI();
        }

        if (checkoutWhatsappBtn) {
            checkoutWhatsappBtn.addEventListener('click', function() {
                if (cart.length === 0) {
                    alert('Tu bolsa está vacía.');
                    return;
                }

                let message = "Hola Z-SHOES, quiero realizar el siguiente pedido:\n\n";
                let total = 0;

                cart.forEach(item => {
                    let itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    message += `- ${item.quantity}x ${item.name} ($${item.price} c/u) = $${itemTotal}\n`;
                });

                message += `\n*Total a pagar: $${total}*\n\n¡Espero su respuesta para coordinar la entrega en Chivacoa, Yaracuy!`;

                const phoneNumber = "584245628866"; 
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
            });
        }
    });
