document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Atualiza o ano no footer
    const footerParagraph = document.querySelector('footer .container p');
    if (footerParagraph) {
        footerParagraph.innerHTML = `© ${new Date().getFullYear()} SofáChic. Todos os direitos reservados.`;
    }

    // Hero Background Slider Logic
    const heroSlides = document.querySelectorAll('.hero-bg-slide');
    let currentHeroSlideIndex = 0;
    const heroSlideIntervalTime = 5000; // 5 segundos

    function showNextHeroSlide() {
        if (heroSlides.length === 0) return;
        heroSlides[currentHeroSlideIndex].classList.remove('active');
        currentHeroSlideIndex = (currentHeroSlideIndex + 1) % heroSlides.length;
        heroSlides[currentHeroSlideIndex].classList.add('active');
    }

    if (heroSlides.length > 1) {
        if (!heroSlides[0].classList.contains('active') && heroSlides.length > 0) {
            heroSlides[0].classList.add('active');
        }
        setInterval(showNextHeroSlide, heroSlideIntervalTime);
    }

    // Função para mudar a imagem do produto
    window.changeImage = function(imageId, swatchElement) {
        const imageElement = document.getElementById(imageId);
        const newImageSrc = swatchElement.dataset.image;
        if (imageElement) imageElement.src = newImageSrc;

        const cardBody = swatchElement.closest('.card-body');
        const addButton = cardBody.querySelector('.add-to-cart-btn');
        if (addButton) {
            addButton.dataset.image = newImageSrc;
            addButton.dataset.color = swatchElement.dataset.color;
        }

        const swatches = swatchElement.parentElement.querySelectorAll('.color-swatch');
        swatches.forEach(s => s.classList.remove('active'));
        swatchElement.classList.add('active');
    }

    // Adicionar ao carrinho
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        // Inicializa data-attributes do botão com a cor/imagem ativa
        const cardBody = button.closest('.card-body');
        if (cardBody) {
            const activeSwatch = cardBody.querySelector('.colors .color-swatch.active');
            if (activeSwatch) {
                button.dataset.color = activeSwatch.dataset.color;
                button.dataset.image = activeSwatch.dataset.image;
            } else {
                const firstSwatch = cardBody.querySelector('.colors .color-swatch');
                if (firstSwatch) {
                    button.dataset.color = firstSwatch.dataset.color;
                    button.dataset.image = firstSwatch.dataset.image;
                }
            }
        }

        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            let image = this.dataset.image; // Pega a imagem do botão (atualizada pelo changeImage)
            const color = this.dataset.color;

            // Garante que a imagem e cor são do swatch ativo no momento do clique, se houver
            const currentCardBody = this.closest('.card-body');
            if (currentCardBody) {
                 const currentActiveSwatch = currentCardBody.querySelector('.colors .color-swatch.active');
                 if (currentActiveSwatch) {
                     image = currentActiveSwatch.dataset.image;
                 }
            }

            const existingItem = cart.find(item => item.id === id && item.color === color);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, image, color, quantity: 1 });
            }
            showToast(`${name} (${color}) adicionado ao carrinho!`);
            updateCart();
        });
    });

    function updateCart() {
        if (!cartItemsContainer || !cartTotalElement || !cartCountElement || !emptyCartMessage || !checkoutBtn) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            cart.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h6>${item.name}</h6>
                        <p class="cart-item-meta">Cor: ${item.color}</p>
                        <p class="cart-item-meta">Quantidade: ${item.quantity}</p>
                    </div>
                    <p class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                    <span class="cart-item-remove" data-index="${index}" title="Remover item"><i class="fas fa-trash-alt"></i></span>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
                itemCount += item.quantity;
            });
        }

        cartTotalElement.textContent = `R$ ${total.toFixed(2)}`;
        cartCountElement.textContent = itemCount;
        cartCountElement.style.display = itemCount > 0 ? 'inline-block' : 'none';

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const indexToRemove = parseInt(this.dataset.index);
                removeItemFromCart(indexToRemove);
            });
        });
    }

    function removeItemFromCart(index) {
        const item = cart[index];
        if (!item) return;

        showToast(`${item.name} (${item.color}) removido.`, 'info');
        
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
    
    function showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container') || createToastContainer();
        
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'primary' : 'info'} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement); // Delay já está no HTML via data-bs-delay
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = 1090; // Acima do modal
        document.body.appendChild(container);
        return container;
    }

    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                alert(`Compra finalizada! Total: ${cartTotalElement.textContent}\nObrigado por comprar na SofáChic!`);
                cart.length = 0;
                updateCart();
                const cartModalEl = document.getElementById('cartModal');
                if (cartModalEl) {
                    const cartModalInstance = bootstrap.Modal.getInstance(cartModalEl);
                    if (cartModalInstance) {
                        cartModalInstance.hide();
                    }
                }
            }
        });
    }

    // Animações ao rolar a página (ocorrem apenas uma vez)
    const animatedElements = document.querySelectorAll('.product-card-animation, .section-title');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observerInstance.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Inicializa o carrinho (chamada final para garantir que tudo esteja pronto)
    updateCart();
});