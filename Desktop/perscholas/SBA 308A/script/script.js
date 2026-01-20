const API_KEY = 'live_S8mDz7xromcpanSjqAplYdgTfTIFQzbHbyj6o4M3Y3h4dcOrQA7OcFSV8zcVrRmy';
const BASE_URL = 'https://api.thedogapi.com/v1';

export async function getAllBreeds() {
    try {
        const response = await fetch(`${BASE_URL}/breeds`, {
            headers: { 'x-api-key': API_KEY }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching breeds:', error);
        throw error;
    }
}

export async function searchImages(breedId, limit = 9, page = 0) {
    try {
        const response = await fetch(
            `${BASE_URL}/images/search?breed_ids=${breedId}&limit=${limit}&page=${page}`,
            { headers: { 'x-api-key': API_KEY } }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}