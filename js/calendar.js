// Flatpickr initialisieren
flatpickr("#abholDatum", {
    altInput: true, // Anzeigen eines benutzerfreundlichen Formats im Eingabefeld
    altFormat: "F j, Y", // Format für Anzeige, z.B. "March 10, 2023"
    dateFormat: "Y-m-d", // Format für Timestamp, z.B. "2023-03-10"
    minDate: "today", // Verhindert Auswahl eines früheren Datums
    onChange: function(selectedDates) {
        // Hier können Sie den Timestamp verwenden oder speichern
        const selectedTimestamp = selectedDates[0].getTime(); // Timestamp in ms
        console.log("Ausgewählter Timestamp:", selectedTimestamp);
    }
});