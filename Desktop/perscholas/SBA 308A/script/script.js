// API KEY 
const API_KEY = 'live_S8mDz7xromcpanSjqAplYdgTfTIFQzbHbyj6o4M3Y3h4dcOrQA7OcFSV8zcVrRmy';
const BASE_URL = 'https://api.thedogapi.com/v1';

// 
let allBreeds = [];
let displayedDogs = [];
let filteredBreeds = [];
let currentIndex = 0;
const DOGS_PER_LOAD = 6;

async function getAllBreeds() {
    try {
        console.log('Fetching breeds from:', `${BASE_URL}/breeds`);
        
        const response = await fetch(`${BASE_URL}/breeds`, {
            method: 'GET',
            headers: { 
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Successfully fetched', data.length, 'breeds');
        return data;
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}


 // Fetch a specific image for a breed

async function getBreedImage(breedId) {
    try {
        const response = await fetch(
            `${BASE_URL}/images/search?breed_ids=${breedId}&limit=1`,
            { 
                method: 'GET',
                headers: { 
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            console.error('Image fetch failed with status:', response.status);
            return 'https://via.placeholder.com/300x300?text=No+Image';
        }
        
        const data = await response.json();
        return data[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
    } catch (error) {
        console.error('Error fetching image:', error);
        return 'https://via.placeholder.com/300x300?text=No+Image';
    }
}



function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}


 // Generate an interesting fact about the breed
 
function generateFact(breed) {
    const facts = [];
    
    if (breed.bred_for) {
        facts.push(`Originally bred for ${breed.bred_for.toLowerCase()}.`);
    }
    
    if (breed.temperament) {
        const temps = breed.temperament.split(',').slice(0, 3).join(',');
        facts.push(`Known for being ${temps.toLowerCase()}.`);
    }
    
    if (breed.life_span) {
        facts.push(`Has an average lifespan of ${breed.life_span}.`);
    }
    
    if (breed.origin) {
        facts.push(`Originally from ${breed.origin}.`);
    }

    return facts.length > 0 ? facts[Math.floor(Math.random() * facts.length)] : 'A wonderful companion dog!';
}


 // Create a dog card element

async function createDogCard(breed) {
    const card = document.createElement('div');
    card.className = 'dog-card';
    
    // Image for this breed 
    const imageUrl = await getBreedImage(breed.id);
    const fact = generateFact(breed);
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${breed.name}" class="dog-image" loading="lazy">
        <div class="dog-content">
            <h2 class="dog-name">${breed.name}</h2>
            <span class="fact-label">FUN FACT</span>
            <p class="dog-fact">${fact}</p>
            <div class="dog-details">
                ${breed.breed_group ? `<span class="detail-badge">🏆 ${breed.breed_group}</span>` : ''}
                ${breed.weight?.metric ? `<span class="detail-badge">⚖️ ${breed.weight.metric} kg</span>` : ''}
                ${breed.life_span ? `<span class="detail-badge">📅 ${breed.life_span}</span>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

//

async function loadMoreDogs() {
    const breedsToShow = filteredBreeds.slice(currentIndex, currentIndex + DOGS_PER_LOAD);
    
    if (breedsToShow.length === 0) {
        return;
    }

    showLoading();
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.disabled = true;

    try {
        const dogGrid = document.getElementById('dogGrid');
        
        // Create cards for each breed 
        for (const breed of breedsToShow) {
            const card = await createDogCard(breed);
            dogGrid.appendChild(card);
            displayedDogs.push(breed);
        }

        currentIndex += DOGS_PER_LOAD;

        
        if (currentIndex >= filteredBreeds.length) {
            loadMoreBtn.textContent = 'No More Dogs 🐶';
            loadMoreBtn.disabled = true;
        } else {
            loadMoreBtn.disabled = false;
        }

    } catch (error) {
        console.error('Error loading dogs:', error);
        showError('Failed to load dogs. Please try again.');
    } finally {
        hideLoading();
    }
}


 // Handle search functionality
 
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const dogGrid = document.getElementById('dogGrid');
    
    // Clear current display
    dogGrid.innerHTML = '';
    displayedDogs = [];
    currentIndex = 0;

    if (searchTerm === '') {
        filteredBreeds = allBreeds;
    } else {
        filteredBreeds = allBreeds.filter(breed =>
            breed.name.toLowerCase().includes(searchTerm) ||
            (breed.temperament && breed.temperament.toLowerCase().includes(searchTerm)) ||
            (breed.breed_group && breed.breed_group.toLowerCase().includes(searchTerm))
        );
    }

    if (filteredBreeds.length === 0) {
        dogGrid.innerHTML = '<div class="no-results">No dogs found matching your search 😢</div>';
        document.getElementById('loadMoreBtn').disabled = true;
    } else {
        document.getElementById('loadMoreBtn').disabled = false;
        document.getElementById('loadMoreBtn').textContent = 'Load More Dogs 🐾';
        loadMoreDogs();
    }
}


async function init() {
    try {
        showLoading();
        hideError();

        // Fetch all breeds 
        allBreeds = await getAllBreeds();
        filteredBreeds = allBreeds;

        hideLoading();

        // Load initial batch of dogs
        await loadMoreDogs();

        // Set up event listeners
        document.getElementById('searchInput').addEventListener('input', handleSearch);
        document.getElementById('loadMoreBtn').addEventListener('click', loadMoreDogs);

    } catch (error) {
        hideLoading();
        console.error('Error initializing app:', error);
        showError('Failed to load dog breeds. Please check your connection and try again.');
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}