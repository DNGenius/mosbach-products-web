  document.addEventListener('DOMContentLoaded', () => {
      // Prüfen, ob die aktuelle Seite "Produkte.html" ist
      if (window.location.pathname.endsWith('Produkte.html')) {
          loadProducts(); // Funktion nur aufrufen, wenn "Produkte.html" geladen ist
      }
      if (window.location.pathname.endsWith('Warenkorb.html')) {
          loadCartItems(); // Funktion nur aufrufen, wenn "Produkte.html" geladen ist
      }
  });


// Registrierung
async function submitForm(event) {
    event.preventDefault(); // Verhindert das Standardverhalten des Formulars

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value;
    const confirmPassword = document.getElementById("confirmUserPassword").value;

    // Passwortüberprüfung
    if (password !== confirmPassword) {
        alert("Die Passwörter stimmen nicht überein.");
        return;
    }

    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail: email,
                userPassword: password,
                lastName,
                firstName,
            }),
        });

        const result = await response.text(); // Antwort immer als Text behandeln
        console.log("Response Status:", response.status); // Status überprüfen
        console.log("Response Result:", result); // Antwortinhalt überprüfen

        if (response.ok) {
            alert(result); // Erfolgreiche Registrierung
            window.location.href = '../index.html'; // Weiterleitung nach erfolgreicher Registrierung
        } else {
            alert(result); // Fehlermeldung anzeigen
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'); // Fehlerbehandlung
    }
}

// Login
async function submitLogin(event) {
    event.preventDefault(); // Verhindert das Standardformularverhalten

    const userEmail = document.getElementById("userEmail").value.trim();
    const userPassword = document.getElementById("userPassword").value;

    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userEmail,
                userPassword,
            }),
        });

        const result = await response.text(); // Antwort als Text einlesen
        console.log("Response Result:", result); // Antwortinhalt in Konsole ausgeben

        if (response.ok) {
            // Erfolgreicher Login
            window.location.href = './public/Homepage.html'; // Weiterleitung zur Hauptseite
            localStorage.setItem('authToken', result); // Auth-Token speichern (angenommen, `result` ist der Token)
        } else if (response.status === 401) {
            // Unautorisierter Zugriff
            alert("Anmeldung fehlgeschlagen: " + result); // Fehlernachricht anzeigen
        } else if (response.status === 500) {
            // Interner Serverfehler
            alert("Serverfehler: " + result); // Fehlermeldung anzeigen
        } else {
            // Andere Fehler
            alert("Ein unbekannter Fehler ist aufgetreten: " + result);
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
}

async function loadProducts() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("Du musst dich zuerst anmelden.");
        window.location.href = '../index.html';
        return;
    }

    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/products?sortOrder=alphabet', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Antwort als JSON einlesen
        const products = await response.json(); // Direktes Einlesen des Arrays

        // Überprüfen, ob products ein Array ist
        if (Array.isArray(products)) {
            // Produkte anzeigen
            displayProducts(products);
        } else {
            console.error('Erwartetes Array für Produkte wurde nicht gefunden.', products);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
    }
}

// Funktion zum Anzeigen der Produkte
function displayProducts(products) {
    // Annahme: Du hast ein Container-Element in deiner HTML-Datei, um die Produkte anzuzeigen
    const productContainer = document.querySelector('.product-grid'); // Beispiel: Der Container für die Produktkarten

    // Produkte in den Container einfügen
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card'; // Füge eine Klasse für CSS hinzu

        productCard.innerHTML = `
            <img src="../images/${product.productID}.jpg" alt="${product.displayName}">
            <h3>${product.displayName}</h3>
            <p class="product-price">${product.priceInEuro.toFixed(2)} €</p>
            <p class="product-weight">Preis für ${product.weightInGrams} g</p>
            <input type="number" value="1" min="1" max="${product.totalQuantity}" class="quantity-input" id="quantity-${product.productID}">
            <button class="add-to-cart" onclick="addToCart('${product.productID}')">In den Warenkorb</button>
        `;

        productContainer.appendChild(productCard); // Füge die Produktkarte zum Container hinzu
    });
}

async function addToCart(productID) {
    const quantityInput = document.getElementById(`quantity-${productID}`);
    const quantity = quantityInput.value;

    // Überprüfen, ob die Menge gültig ist
    if (quantity < 1) {
        alert("Bitte wähle eine gültige Menge.");
        return;
    }

    const authToken = localStorage.getItem('authToken'); // Token aus dem Local Storage

    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                productID: productID,
                quantity: parseInt(quantity) // Menge als Integer
            })
        });

        // Antwort als Text lesen
        const result = await response.text(); // Textantwort einlesen

        // Protokollieren des Response-Textes für Debugging
        console.log('Server Response:', result);

        // Überprüfen des Statuscodes
        if (response.ok) {
            // Erfolgreiche Antwort
            alert("Produkt erfolgreich zum Warenkorb hinzugefügt!");
        } else {
            // Hier wird die Fehlermeldung angezeigt
            switch (response.status) {
                case 401:
                    alert(`Fehler beim Hinzufügen zum Warenkorb: Ungültiges Token.`);
                    break;
                case 400:
                    alert(`Fehler beim Hinzufügen zum Warenkorb: Authorization Header muss bereitgestellt werden.`);
                    break;
                case 500:
                    alert(`Fehler beim Hinzufügen zum Warenkorb: Unerwarteter Fehler aufgetreten.`);
                    break;
                default:
                    alert(`Fehler beim Hinzufügen zum Warenkorb: ${result}`); // allgemeine Fehlermeldung
                    break;
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
}

async function loadCartItems() {
    // Hier solltest du den API-Endpunkt anpassen, um die Warenkorbartikel abzurufen
    const authToken = localStorage.getItem('authToken'); // Token aus dem Local Storage
    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/view', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}` // Token im Header
            }
        });

        if (response.ok) {
            const cartData = await response.json();
            displayCartItems(cartData.cartItems, cartData.totalPrice);
        } else {
            // Behandlung der verschiedenen Fehlerfälle
            const errorMessage = await response.text();
            switch (response.status) {
                case 401:
                    alert(`Fehler beim Laden des Warenkorbs: Ungültiges Token.`); // Angepasste Fehlermeldung
                    break;
                case 400:
                    alert(`Fehler beim Laden des Warenkorbs: Authorization Header muss bereitgestellt werden.`); // Angepasste Fehlermeldung
                    break;
                case 500:
                    alert(`Fehler beim Laden des Warenkorbs: Unerwarteter Fehler aufgetreten.`); // Angepasste Fehlermeldung
                    break;
                default:
                    alert(`Fehler beim Laden des Warenkorbs: ${errorMessage}`); // Allgemeine Fehlermeldung
                    break;
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
}

function displayCartItems(cartItems, totalPrice) {
    const cartItemsContainer = document.getElementById('cart-items-container');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    cartItems.forEach(item => {
        const product = item.product;
        const quantity = item.quantity;

        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="../images/${product.productID}.jpg" alt="${product.displayName}">
            <h3>${product.displayName}</h3>
            <p class="product-price">${product.priceInEuro.toFixed(2)} €</p>
            <p>Preis für ${product.weightInGrams} g</p>
            <p>Menge: ${quantity}</p>
            <button class="remove-from-cart" onclick="removeFromCart('${product.productID}')">Entfernen</button>
        `;
        cartItemsContainer.appendChild(productCard);
    });

    const totalPriceContainer = document.getElementById('total-price-container');
    totalPriceContainer.innerHTML = `<h3 class="total-price">Gesamtpreis: ${totalPrice.toFixed(2)} €</h3>`;
}

async function removeFromCart(productID) {
    const authToken = localStorage.getItem('authToken'); // Token aus dem Local Storage abrufen

    try {
        const response = await fetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productID: productID }) // Produkt-ID im Body als JSON
        });

        if (response.ok) {
            // Produkt erfolgreich entfernt, aktualisiere den Warenkorb
            loadCartItems(); // Funktion zum Neuladen des Warenkorbs aufrufen
        } else {
            // Fehlerbehandlung je nach Statuscode
            const errorText = await response.text();
            switch (response.status) {
                case 401:
                    alert(`Fehler beim Entfernen aus dem Warenkorb: Ungültiges Token.`);
                    break;
                case 400:
                    alert(`Fehler beim Entfernen aus dem Warenkorb: Ungültige Anfrage.`);
                    break;
                case 500:
                    alert(`Fehler beim Entfernen aus dem Warenkorb: Unerwarteter Fehler aufgetreten.`);
                    break;
                default:
                    alert(`Fehler beim Entfernen aus dem Warenkorb: ${errorText}`);
                    break;
            }
        }
    } catch (error) {
        console.error('Fehler beim Entfernen aus dem Warenkorb:', error);
        alert(`Fehler beim Entfernen aus dem Warenkorb: ${error.message}`);
    }
}

//Token AuthHeader
async function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function authenticatedFetch(url, options = {}) {
    const headers = {
        ...options.headers,
        ...getAuthHeader(),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        // Token ist möglicherweise abgelaufen, leiten Sie zur Login-Seite weiter
        window.location.href = '/login';
    }

    return response;
}