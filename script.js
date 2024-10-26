let allProducts = [];

// Fetch products from the API
async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        allProducts = data.products;
        return data.products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Display products
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price.toFixed(2)}</p>
        `;
        productList.appendChild(productCard);
    });
    updateProductCount(products.length);

    // Ensure the product list maintains its grid layout
    productList.style.display = 'grid';
    productList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    productList.style.gap = '2rem';
}

// Update product count
function updateProductCount(count) {
    document.querySelector('#product-count span').textContent = count;
}

// Function to sort products
function sortProducts(products, sortBy) {
    if (sortBy === 'price-low-to-high') {
        return products.slice().sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-to-low') {
        return products.slice().sort((a, b) => b.price - a.price);
    }
    return products; // Return original if no valid sort option
}

// Filter and sort products
function filterAndSortProducts() {
    let filteredProducts = allProducts;
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm)
        );
    }
    
    if (sortBy === 'price-low-to-high') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-to-low') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    displayProducts(filteredProducts);
}

// Smooth scroll function
function smoothScroll(target, duration) {
    const targetElement = document.querySelector(target);
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Initialize the page
async function init() {
    allProducts = await fetchProducts();
    displayProducts(allProducts);

    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) {
        console.error('Sort select element not found');
        return;
    }

    sortSelect.innerHTML = `
        <option value="">Sort by</option>
        <option value="price-low-to-high">Price (low to high)</option>
        <option value="price-high-to-low">Price (high to low)</option>
    `;

    sortSelect.addEventListener('change', filterAndSortProducts);

    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', filterAndSortProducts);

    // Initial display
    filterAndSortProducts();

    // Fetch and display recipes
    await fetchRecipes();

    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScroll(targetId, 300); // Changed from 500ms to 300ms for even faster animation
        });
    });
}

window.addEventListener('load', init);

// Fetch recipes from the API
async function fetchRecipes() {
    try {
        const response = await fetch('https://dummyjson.com/recipes');
        const data = await response.json();
        displayRecipes(data.recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Display recipes
function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        
        // Truncate the recipe name if it's too long
        const truncatedName = recipe.name.length > 25 ? recipe.name.substring(0, 25) + '...' : recipe.name;
        
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}" onerror="this.src='path/to/placeholder-image.jpg';">
            <h3 title="${recipe.name}">${truncatedName}</h3>
            <div style="height: 20px;"></div>
            <div style="text-align: center; color: #777; font-size: 0.9rem;">
                <span><strong>Rating:</strong> ${recipe.rating} (${recipe.reviewCount} reviews)</span><br>
                <span><strong>Difficulty:</strong> ${recipe.difficulty}</span><br>
                <span><strong>Cook Time:</strong> ${recipe.cookTimeMinutes} minutes</span>
            </div>
        `;
        recipeCard.addEventListener('click', () => showRecipeModal(recipe));
        recipeList.appendChild(recipeCard);
    });

    // Ensure the recipe list maintains its grid layout
    recipeList.style.display = 'grid';
    recipeList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    recipeList.style.gap = '2rem';
}

// Show recipe modal
function showRecipeModal(recipe) {
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-recipe-details');
    modalContent.innerHTML = `
        <h2 style="text-align: center; color: #333; margin-bottom: 1rem;">${recipe.name}</h2>
        <div style="text-align: center; color: #777; font-size: 0.9rem; margin-bottom: 1rem;">
            <span><strong>Rating:</strong> ${recipe.rating} (${recipe.reviewCount} reviews)</span> | 
            <span><strong>Difficulty:</strong> ${recipe.difficulty}</span> | 
            <span><strong>Cook Time:</strong> ${recipe.cookTimeMinutes} minutes</span>
        </div>
        <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-width: 400px; margin: 0 auto 1rem; display: block;">
        <div style="text-align: left; color: #555; line-height: 1.8; font-size: 0.9rem;">
            <p style="margin-bottom: 1rem;"><strong>Cuisine:</strong> ${recipe.cuisine}</p>
            <p style="margin-bottom: 1rem;"><strong>Ingredients:</strong></p>
            <ul style="margin-left: 20px; margin-bottom: 1rem;">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <p style="margin-bottom: 1rem;"><strong>Instructions:</strong></p>
            <ol style="margin-left: 20px; margin-bottom: 1rem;">
                ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
            <p style="margin-bottom: 1rem;"><strong>Prep Time:</strong> ${recipe.prepTimeMinutes} minutes</p>
            <p style="margin-bottom: 1rem;"><strong>Servings:</strong> ${recipe.servings}</p>
            <p style="margin-bottom: 1rem;"><strong>Calories per Serving:</strong> ${recipe.caloriesPerServing}</p>
            <p style="margin-bottom: 1rem;"><strong>Meal Type:</strong> ${recipe.mealType.join(', ')}</p>
        </div>
    `;
    modal.style.display = 'block';
    modal.scrollTop = 0; // Reset scroll position to top of modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

window.onclick = function(event) {
    const modal = document.getElementById('recipe-modal');
    if (event.target == modal || event.target.className == 'close') {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};



function showRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'block';
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'none';
}


function handleRegistrationSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Form submitted:', { name, email, password }); // Or send to server

    closeRegistrationModal();

    Swal.fire({  // SweetAlert success message
        title: 'Success!',
        text: 'Registration completed successfully!',
        icon: 'success',
        confirmButtonText: 'Ok'
    });

    e.target.reset(); // Reset the form
}

// Get modal element and trigger elements
const modal = document.getElementById('registrationModal');
const btn = document.getElementById('get-started-button');
const closeBtn = document.querySelector('.close');
const registrationForm = document.getElementById('registrationForm');

// Open modal when "Get Started" button is clicked
btn.onclick = function () {
    modal.style.display = 'block';
}

// Close modal when 'x' is clicked
closeBtn.onclick = function () {
    modal.style.display = 'none';
}

// Close modal when clicking outside of the modal content
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Handle form submission
registrationForm.onsubmit = function (e) {
    e.preventDefault();

    // Form validation and registration logic could go here (if needed)

    // Show success alert using SweetAlert
    Swal.fire({
        icon: 'success',
        title: 'Registered Successfully!',
        text: 'Thank you for registering with us.',
        timer: 3000,
        showConfirmButton: false
    });

    // Hide the modal after registration
    modal.style.display = 'none';

    // Clear form fields
    registrationForm.reset();
}


document.addEventListener('DOMContentLoaded', function () {
    // ... other code ...

    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {  // Check if the element exists
        contactInfo.innerHTML = `
            <div class="contact-item">
                <h3>Head Office</h3>
                <div class="icon"><i class="fas fa-map-marker-alt"></i></div> 
                <p>#60/182-A22, 2nd Floor, K Zone Trade Centre,<br>Makkolath Lane, Opp. Coronation Theatre,<br>Kozhikode, Kerala, India, PIN 673004</p>
            </div>
            <div class="contact-item">
                <h3>Branch</h3>
                <div class="icon"><i class="fas fa-map-marker-alt"></i></div>
                <p>Bldg no XVI / 1549 F 1 3rd Floor Above Reliance Fresh,<br>Kandathil Complex P.T Jacob Road Thoppumpady,<br>City Cochi-682005</p>
            </div>
            <div class="contact-item">
                <h3>Email Address</h3>
                <div class="icon"><i class="fas fa-envelope"></i></div>
                <p><a href="mailto:contact@fullstackdeveloper.io">contact@fullstackdeveloper.io</a></p>
            </div>
            <div class="contact-item">
                <h3>Phone Number</h3>
                <div class="icon"><i class="fas fa-phone"></i></div>
                <p>+91 8281 628 618<br>+91 8281 628 618</p>
            </div>
        `;
    }



});




document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Show the success message
    const successMessage = document.getElementById("successMessage");
    successMessage.classList.remove("hidden");
    successMessage.classList.add("show");

    // Clear the form inputs
    document.getElementById("contactForm").reset();

    // Hide the message after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove("show");
        successMessage.classList.add("hidden");
    }, 5000);
});



document.addEventListener('DOMContentLoaded', function () {
    const exploreButton = document.querySelector('#about .explore');
    if (exploreButton) {
        exploreButton.addEventListener('click', function (e) {
            e.preventDefault();
            const productsSection = document.querySelector('#products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const recipeModal = document.getElementById('recipe-modal');
    const closeButton = recipeModal.querySelector('.close');

    closeButton.addEventListener('click', function() {
        recipeModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === recipeModal) {
            recipeModal.style.display = 'none';
        }
    });
});




// Add this to your existing script.js file

function setupTestimonialCarousel() {
    const track = document.querySelector('.testimonial-track');
    const slides = track.querySelectorAll('.testimonial-slide');
    const slideWidth = slides[0].offsetWidth;
    let currentIndex = 0;

    // Clone the first slide and append it to the end for seamless looping
    const firstSlideClone = slides[0].cloneNode(true);
    track.appendChild(firstSlideClone);

    function moveToSlide(index) {
        track.style.transform = `translateX(${-index * slideWidth}px)`;
        track.style.transition = 'transform 0.5s ease';
        currentIndex = index;
    }

    function moveSlides() {
        if (currentIndex === slides.length) {
            // If we're on the cloned slide, quickly reset to the first slide without animation
            track.style.transition = 'none';
            currentIndex = 0;
            moveToSlide(currentIndex);
            // Force a reflow to make the transition take effect
            track.offsetHeight;
        }
        moveToSlide(currentIndex + 1);
    }

    // Move slides every 3 seconds
    setInterval(moveSlides, 3000);
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', setupTestimonialCarousel);






const carousel = document.querySelector(".partner-section .carousel");

setInterval(() => {
    // Move the first box to the end with a smooth transition
    carousel.style.transition = "transform 0.5s ease";
    carousel.style.transform = "translateX(-25%)"; // Slide left to show the next 4 boxes

    // After the transition is done, reset to the original position instantly and rearrange boxes
    setTimeout(() => {
        carousel.style.transition = "none";
        carousel.appendChild(carousel.firstElementChild); // Move the first box to the end
        carousel.style.transform = "translateX(0)"; // Reset position
    }, 500); // Match the transition duration
}, 3000);

// Add this function to your existing script.js
function setupScrollAnimations() {
    const faders = document.querySelectorAll('.fade-in-up');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupScrollAnimations();
    // ... your other initialization code ...
});

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
});
