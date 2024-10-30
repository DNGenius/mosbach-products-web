  document.addEventListener('DOMContentLoaded', () => {
      // Prüfen, ob die aktuelle Seite "Produkte.html" ist
      if (window.location.pathname.endsWith('Produkte.html')) {
          loadProducts("alphabet"); // Funktion nur aufrufen, wenn "Produkte.html" geladen ist und Produkte ABC sortieren
          document.getElementById('sortSwitch').checked = false; // Sicherstellen, dass Schalter auf ABC steht
      }
      if (window.location.pathname.endsWith('Warenkorb.html')) {
          loadCartItems(); // Funktion nur aufrufen, wenn "Warenkorb.html" geladen ist
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

// Logout
async function logout() {
    try {
        const response = await authenticatedFetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/auth/logout', { method: 'POST' });

        if (response.ok) {
            // Erfolgsfall: Token löschen und Weiterleitung zur Login-Seite
            console.log("Vor dem Entfernen:", localStorage.getItem('authToken'));
            localStorage.removeItem('authToken');
            console.log("Nach dem Entfernen:", localStorage.getItem('authToken'));
            alert("Erfolgreich abgemeldet.");
        } else {
            // Fehlerfall: Fehlermeldung anzeigen
            localStorage.removeItem('authToken');
            const errorMessage = await response.text();
            if (response.status === 400 && errorMessage === "Invalid operation") {
                alert("Ungültige Operation. Bitte versuchen Sie es erneut.");
            } else {
                alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
            }
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
}

function toggleSort() {
    const sortSwitch = document.getElementById("sortSwitch");

    if (sortSwitch.checked) {
        // Wenn der Schalter auf "Preis" ist
        loadProducts("price"); // Produkte nach Preis laden
        document.getElementById("sortLabel").innerText = "Preis"; // Update der Beschriftung
    } else {
        // Wenn der Schalter auf "ABC" ist
        loadProducts("alphabet"); // Produkte alphabetisch laden
        document.getElementById("sortLabel").innerText = "ABC"; // Update der Beschriftung
    }
}

async function loadProducts(sortOrder) {
    try {
        const response = await authenticatedFetch(`https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/products?sortOrder=${sortOrder}`, {
            method: 'GET',
        });

        // Response verarbeiten
        if (response.ok) {
            const products = await response.json(); // Antwort als JSON einlesen

            // Überprüfen, ob products ein Array ist
            if (Array.isArray(products)) {
                // Produkte anzeigen
                displayProducts(products);
            } else {
                console.error('Erwartetes Array für Produkte wurde nicht gefunden.', products);
            }
        } else {
            // Behandlung der verschiedenen Fehlerfälle
            const errorMessage = await response.text();
            switch (response.status) {
                case 401:
                    alert("Ungültiges Token."); // Meldung für 401
                    break;
                case 400:
                    alert("Authorization-Header muss bereitgestellt werden."); // Meldung für 400
                    break;
                case 500:
                    alert("Ein unerwarteter Fehler ist aufgetreten."); // Meldung für 500
                    break;
                default:
                    alert(`Fehler beim Laden der Produkte: ${errorMessage}`); // Allgemeine Fehlermeldung
                    break;
            }
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Produkte:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'); // Allgemeine Fehlermeldung für Fehler im try-Block
    }
}

// Funktion zum Anzeigen der Produkte
function displayProducts(products) {
    // Annahme: Du hast ein Container-Element in deiner HTML-Datei, um die Produkte anzuzeigen
    const productContainer = document.querySelector('.product-grid'); // Beispiel: Der Container für die Produktkarten

    // Alte Produkte entfernen, bevor neue Produkte angezeigt werden
    productContainer.innerHTML = '';

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

    try {
        const response = await authenticatedFetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
    try {
        const response = await authenticatedFetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/view', {
            method: 'GET'
        });

        if (response.ok) {
            const text = await response.text(); // Lese die Antwort als Text

            // Wenn die Antwort leer ist, wird ein leerer Warenkorb angezeigt
            const cartData = text ? JSON.parse(text) : { cartItems: [], totalPrice: 0.0 };

            // Überprüfen, ob der Warenkorb leer ist
            displayCartItems(cartData.cartItems, cartData.totalPrice);

            const customerID = cartData.customerID; // Speichere die customerID
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

    // Überprüfen, ob der Warenkorb leer ist
    if (cartItems.length === 0) {
        const emptyCartMessage = document.createElement('p');
        emptyCartMessage.textContent = "Puh, so leer hier...";
        emptyCartMessage.classList.add('empty-cart-message'); // Optional: Füge eine Klasse für CSS-Styles hinzu
        cartItemsContainer.appendChild(emptyCartMessage);
    } else {
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
    }
    const totalPriceContainer = document.getElementById('total-price-container');
    totalPriceContainer.innerHTML = `<h3 class="total-price">Gesamtpreis: ${totalPrice.toFixed(2)} €</h3>`;
}

async function removeFromCart(productID) {
    try {
        const response = await authenticatedFetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productID: productID // Produkt-ID im Body als JSON
            })
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

async function placeOrder() {
    const dateInput = document.getElementById("abholDatum"); // Kalender-Eingabefeld
    const pickupDateValue = dateInput ? dateInput.value : null;

    // Überprüfen, ob ein Datum ausgewählt wurde
    if (!pickupDateValue) {
        alert("Bitte wählen Sie ein Abholdatum aus.");
        return; // Beende die Funktion, falls kein Datum gewählt wurde
    }

    const pickupDate = new Date(pickupDateValue).getTime(); // Zeitstempel in Millisekunden

    try {
        const response = await authenticatedFetch('https://wildewurstwarenbackend-zany-waterbuck-zj.apps.01.cf.eu01.stackit.cloud/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pickupDate: pickupDate // Abholdatum als String
            })
        });

        // Antworten entsprechend der Statuscodes behandeln
        if (response.ok) {
            alert("Bestellung erfolgreich aufgegeben!");
            loadCartItems(); // Geleerten Warenkorb neu laden
        } else if (response.status === 409) {
            alert("Der Warenkorb ist leer."); // Deutsche Ausgabe für 409
        } else if (response.status === 401) {
            alert("Ungültiges Token."); // Deutsche Ausgabe für 401
        } else if (response.status === 400) {
            alert("Authorization-Header muss bereitgestellt werden."); // Deutsche Ausgabe für 400
        } else if (response.status === 500) {
            alert("Ein unerwarteter Fehler ist aufgetreten."); // Deutsche Ausgabe für 500
        } else {
            const errorMessage = await response.text();
            console.error(`Fehler beim Aufgeben der Bestellung: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Fehler:', error);
        alert('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
    }
}

async function authenticatedFetch(url, options = {}) {
    const headers = {
        ...options.headers,
        ...await getAuthHeader(), // Hier wird das Auth-Header-Objekt abgerufen
    };

    const response = await fetch(url, { ...options, headers });

    // Es ist nicht notwendig, die 401 hier zu behandeln, wenn wir sie im loadProductsAlphabet behandeln.
    return response;
}

//Token AuthHeader
async function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Wenn kein Token vorhanden ist, gibt es keinen Authorization-Header
        return {};
    }
    return { 'Authorization': `Bearer ${token}` }; // Header mit Token
}