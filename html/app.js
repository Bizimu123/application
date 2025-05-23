document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('bookForm');
    const bookTableBody = document.getElementById('bookTableBody');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const bookIdInput = document.getElementById('bookId');
    
    let isEditing = false;
    let currentBookId = null;
    
    // Load books when page loads
    loadBooks();
    
    // Form submission handler
    bookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            price: parseFloat(document.getElementById('price').value),
            instock: document.getElementById('instock').value === '1' ? 1 : 0
        };
        
        try {
            if (isEditing) {
                await updateBook(currentBookId, bookData);
            } else {
                await createBook(bookData);
            }
            
            // Reset form and reload books
            resetForm();
            loadBooks();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please check the console for details.');
        }
    });
    
    // Cancel button handler
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });
    async function loadBooks() {
    try {
        const response = await fetch('http://localhost:5000/book');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to load books');
        }
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading books: ' + error.message);
    }
}
    
    // Load all books from the API
    async function loadBooks() {
        try {
            const response = await fetch('http://localhost:5000/book');
            const books = await response.json();
            
            bookTableBody.innerHTML = '';
            
            books.forEach(book => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.genre}</td>
                    <td>$${book.price.toFixed(2)}</td>
                    <td>${book.instock ? 'Yes' : 'No'}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${book.id}">Edit</button>
                        <button class="delete-btn" data-id="${book.id}">Delete</button>
                    </td>
                `;
                
                bookTableBody.appendChild(row);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', handleEdit);
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDelete);
            });
        } catch (error) {
            console.error('Error loading books:', error);
            alert('Failed to load books. Please check the console for details.');
        }
    }
    
    // Create a new book
    async function createBook(bookData) {
        const response = await fetch('http://localhost:5000/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create book');
        }
        
        alert('Book created successfully!');
    }
    
    // Update an existing book
async function updateBook(id, bookData) {
    try {
        const response = await fetch(`http://localhost:5000/book/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update book');
        }
        
        const result = await response.json();
        alert('Book updated successfully!'); // Success message added here
        return result;
    } catch (error) {
        console.error('Update error:', error);
        alert(`Error: ${error.message}`); // Show error message to user
        throw error; // Re-throw to be caught by the form handler
    }
}


    // Delete a book
    async function deleteBook(id) {
        const response = await fetch(`http://localhost:5000/book/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete book');
        }
        
        alert('Book deleted successfully!');
    }
    
    // Handle edit button click
    async function handleEdit(e) {
        const id = e.target.getAttribute('data-id');
        
        try {
            const response = await fetch(`http://localhost:5000/book/${id}`);
            const book = await response.json();
            
            if (book.length === 0) {
                throw new Error('Book not found');
            }
            
            // Populate form with book data
            document.getElementById('title').value = book[0].title;
            document.getElementById('author').value = book[0].author;
            document.getElementById('genre').value = book[0].genre;
            document.getElementById('price').value = book[0].price;
            document.getElementById('instock').value = book[0].instock ? '1' : '0';
            
            // Set editing state
            isEditing = true;
            currentBookId = id;
            bookIdInput.value = id;
            formTitle.textContent = 'Edit Book';
            submitBtn.textContent = 'Update Book';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            bookForm.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error loading book for edit:', error);
            alert('Failed to load book for editing. Please check the console for details.');
        }
    }
    
    // Handle delete button click
    async function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }
        
        const id = e.target.getAttribute('data-id');
        
        try {
            await deleteBook(id);
            loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book. Please check the console for details.');
        }
    }
    
    // Reset the form to its initial state
    function resetForm() {
        bookForm.reset();
        isEditing = false;
        currentBookId = null;
        bookIdInput.value = '';
        formTitle.textContent = 'Add New Book';
        submitBtn.textContent = 'Add Book';
        cancelBtn.style.display = 'none';
    }
});