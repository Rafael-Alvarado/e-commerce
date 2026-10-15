const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    document.addEventListener('DOMContentLoaded', function () {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const productCards = document.querySelectorAll('.product-card');
        const searchInput = document.getElementById('search-input');
        const navNovedades = document.getElementById('nav-novedades');
        const navRebajas = document.getElementById('nav-rebajas');

        // --- FUNCIÓN CENTRALIZADA DE FILTRADO Y BÚSQUEDA ---
        function filterProducts(categoryOverride = null) {
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            // Determinar qué categoría está activa
            let activeCategory = categoryOverride;
            if (!activeCategory) {
                const activeBtn = document.querySelector('.filter-btn.text-black');
                activeCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
            }

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardTitle = card.querySelector('h3').innerText.toLowerCase();
                const cardDesc = card.querySelector('p').innerText.toLowerCase();

                // Validación cruzada: categoría + texto de búsqueda
                const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
                const matchesSearch = cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);

                if (matchesCategory && matchesSearch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // --- 1. LÓGICA DE LOS BOTONES DE FILTRO DE ABAJO ---
        filterButtons.forEach(button => {
            button.addEventListener('click', function () {
                // Cambiar estilos visuales de los botones
                filterButtons.forEach(btn => {
                    btn.classList.remove('text-black', 'border-b-2', 'border-black');
                    btn.classList.add('text-gray-600');
                });
                this.classList.remove('text-gray-600');
                this.classList.add('text-black', 'border-b-2', 'border-black');

                // Filtrar productos según el botón presionado
                const filterValue = this.getAttribute('data-filter');
                filterProducts(filterValue);
            });
        });

        // --- 2. BUSCADOR EN TIEMPO REAL ---
        if (searchInput) {
            searchInput.addEventListener('input', () => filterProducts());
        }

        // --- 3. CONEXIÓN CON LOS ENLACES DEL NAVBAR ---
        function triggerNavFilter(filterName) {
            // Sincronizar visualmente los botones de abajo para que reflejen la selección del Navbar
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-filter') === filterName) {
                    btn.classList.remove('text-gray-600');
                    btn.classList.add('text-black', 'border-b-2', 'border-black');
                } else {
                    btn.classList.remove('text-black', 'border-b-2', 'border-black');
                    btn.classList.add('text-gray-600');
                }
            });

            if (searchInput) searchInput.value = ''; // Limpiar buscador para mejor experiencia
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

        // --- 4. VISUALIZADOR DE IMAGEN (MODAL) ---
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const closeModal = document.getElementById('close-modal');
        const productImages = document.querySelectorAll('.product-card img');

        productImages.forEach(img => {
            img.classList.add('cursor-pointer');
            img.addEventListener('click', function () {
                const imgSrc = this.getAttribute('src');
                const card = this.closest('.product-card');
                const title = card.querySelector('h3').innerText;

                modalImg.setAttribute('src', imgSrc);
                modalTitle.innerText = title;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        function hideModal() {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        if (closeModal) closeModal.addEventListener('click', hideModal);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) hideModal();
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hideModal();
        });

        // --- 5. LÓGICA DEL CARRITO DE COMPRAS + SELECTOR DE CANTIDAD ---
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
            cartDrawer.classList.toggle('hidden');
            document.body.style.overflow = cartDrawer.classList.contains('hidden') ? 'auto' : 'hidden';
        }

        if (cartBtn) cartBtn.addEventListener('click', toggleCart);
        if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

        // Añadir producto leyendo la cantidad seleccionada en el input de la tarjeta
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function () {
                const name = this.getAttribute('data-name');
                const price = parseFloat(this.getAttribute('data-price'));
                const img = this.getAttribute('data-img');
                
                // Leer la cantidad del input dentro de la misma tarjeta del producto
                const card = this.closest('.product-card');
                const qtyInput = card.querySelector('.product-qty');
                const quantity = parseInt(qtyInput.value) || 1;

                const existingProduct = cart.find(item => item.name === name);
                if (existingProduct) {
                    existingProduct.quantity += quantity;
                } else {
                    cart.push({ name, price, img, quantity });
                }

                updateCartUI();
                toggleCart(); // Abre el carrito automáticamente
                
                // Reiniciar el input a 1
                qtyInput.value = 1;
            });
        });

        function updateCartUI() {
            if (!cartItemsContainer) return;
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `<p class="text-center text-gray-500 py-12 text-sm">Tu bolsa está vacía.</p>`;
                cartTotalItems.innerText = '0';
                cartCountBubble.innerText = '0';
                cartSubtotal.innerText = '$0';
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

            cartTotalItems.innerText = totalItems;
            cartCountBubble.innerText = totalItems;
            cartSubtotal.innerText = `$${subtotal}`;
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