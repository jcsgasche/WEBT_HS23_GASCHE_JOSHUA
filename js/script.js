function toggleMenu() {
    let x = document.getElementById("nav");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
}

function drawOnCanvas(data) {
    data.ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);

    data.ctx.fillStyle = data.farbe;
    data.ctx.fillRect(10, 10, data.textur * 2, data.textur);

    let quadratGroesse = data.textur;

    if (data.muster === 'leinen' || data.muster === 'köper' || data.muster === 'atlas') {
        for (let y = 0; y < data.canvas.height; y += quadratGroesse) {
            for (let x = 0; x < data.canvas.width; x += quadratGroesse) {

                if (data.muster === 'leinen') {
                    data.ctx.fillStyle = ((x / quadratGroesse + y / quadratGroesse) % 2 === 0) ? data.farbe : 'white';
                } else if (data.muster === 'köper') {
                    let gruppenPositionX = Math.floor(x / quadratGroesse) % 3;
                    let gruppenPositionY = Math.floor(y / quadratGroesse) % 3;
                    data.ctx.fillStyle = ((gruppenPositionX + gruppenPositionY) % 2 === 0) ? data.farbe : 'white';
                } else if (data.muster === 'atlas') {
                    // Pixel-Darstellung eines "Atlas-Musters", das ich im Internet gefunden und nachgebildet habe.
                    // https://www.r-g.de/wiki/Webarten
                    let muster = [
                        [0, 0, 0, 0, 0, 1, 0, 0],
                        [0, 0, 1, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 1],
                        [0, 0, 0, 0, 1, 0, 0, 0],
                        [0, 1, 0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0, 1, 0],
                        [0, 0, 0, 1, 0, 0, 0, 0],
                        [1, 0, 0, 0, 0, 0, 0, 0]
                    ];
                    let musterX = Math.floor(x / quadratGroesse) % muster.length;
                    let musterY = Math.floor(y / quadratGroesse) % muster.length;
                    data.ctx.fillStyle = muster[musterY][musterX] ? data.farbe : 'white';
                }

                data.ctx.fillRect(x, y, quadratGroesse, quadratGroesse);
                data.ctx.strokeRect(x, y, quadratGroesse, quadratGroesse);
                data.ctx.beginPath();
                data.ctx.arc(x + quadratGroesse / 2, y + quadratGroesse / 2, quadratGroesse / 4, 0, Math.PI * 2);
                data.ctx.stroke();
                data.ctx.beginPath();
                data.ctx.moveTo(x, y);
                data.ctx.lineTo(x + quadratGroesse, y + quadratGroesse);
                data.ctx.stroke();
                data.ctx.beginPath();
                data.ctx.moveTo(x + quadratGroesse, y);
                data.ctx.lineTo(x, y + quadratGroesse);
                data.ctx.stroke();
            }
        }
    }
}
document.getElementById('webForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let farbe = document.getElementById('farbe').value;
    let textur = parseInt(document.getElementById('textur').value);
    let muster = document.getElementById('muster').value;
    let canvas = document.getElementById('webmusterCanvas');
    let ctx = canvas.getContext('2d');

    drawOnCanvas({ farbe, textur, muster, canvas, ctx });
});

let app = Vue.createApp({
    data() {
        return {
            serverResponse: '',
            submitted: false,
            formData: {
                kleidungsstueck: '',
                webmuster: '',
                fadenfarbe: 'black',
                stofftextur: '25',
                groesse: '',
                name: '',
                email: '',
                nachricht: ''
            },
            formErrors: {
                kleidungsstueck: '',
                webmuster: '',
                groesse: '',
                name: '',
                email: '',
                allFields: ''
            },
            fieldTouched: {
                kleidungsstueck: false,
                webmuster: false,
                groesse: false,
                name: false,
                email: false,
            }
        };
    },
    methods: {
        submitForm() {
            if(this.validateAllFields()) {
                this.formErrors.allFields = '';
                this.submitted = true;
                fetch('backend.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        kleidungsstueck: this.formData.kleidungsstueck,
                        webmuster: this.formData.webmuster,
                        fadenfarbe: this.formData.fadenfarbe,
                        stofftextur: this.formData.stofftextur,
                        groesse: this.formData.groesse,
                        name: this.formData.name,
                        email: this.formData.email,
                        nachricht: this.formData.nachricht
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    this.serverResponse = data.message;
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    this.serverResponse = 'Ein Fehler ist aufgetreten.';
                });
            } else {
                console.log("Fehlerhafte Eingaben.");
                this.formErrors.allFields = 'Bitte füllen Sie alle Felder korrekt aus.';
                for (let field in this.fieldTouched) {
                    this.fieldTouched[field] = true;
                }
            }
        },
        isValidColor(strColor) {
            let s = new Option().style;
            s.color = strColor;
            return s.color !== '';
        },
        // Farbe und Textur validiere ich nicht, da sie regler mit vorgegebenen Werten haben, weshalb man intuitiverweise diese Auch gleich so lassen kann.
        // Beim Rest fand ich es sinnvoll, dass man den User dazu bringt, etwas auszuwählen
        validateAllFields() {
            let isValid = true;
            isValid = this.validateField('kleidungsstueck', 'Bitte wählen Sie ein Kleidungsstück aus.') && isValid;
            isValid = this.validateField('webmuster', 'Bitte wählen Sie ein Webmuster aus.') && isValid;
            isValid = this.validateField('groesse', 'Bitte wählen Sie eine Grösse aus.') && isValid;
            isValid = this.validateName() && isValid;
            isValid = this.validateEmail() && isValid;
            return isValid;
        },
        // Error Message, wenn nichts ausgewählt wird oder zurück zu "keiner Auswahl" gewechselt wird.
        validateField(fieldName, errorMessage) {
            if (this.formData[fieldName] === '') {
                this.formErrors[fieldName] = errorMessage;
                return false;
            } else {
                this.formErrors[fieldName] = '';
                return true;
            }
        },
        validateName() {
            // https://stackoverflow.com/questions/2385701/regular-expression-for-first-and-last-name
            let nameRegex = /^[a-z ,.'-]+$/i;
            if (this.formData.name === '') {
                this.formErrors.name = 'Bitte geben Sie Ihren Namen ein.';
            } else if (!nameRegex.test(this.formData.name)) {
                this.formErrors.name = 'Bitte geben Sie einen gültigen Namen ein.';
            } else {
                this.formErrors.name = '';
                return true;
            }
        },
        validateEmail() {
            // https://www.w3resource.com/javascript/form/email-validation.php
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (this.formData.email === '') {
                this.formErrors.email = 'Bitte geben Sie eine E-Mail-Adresse ein.';
            } else if (!emailRegex.test(this.formData.email)) {
                this.formErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            } else { 
                this.formErrors.email = '';
                return true;
            }
        },
    },
    // Weil die Methoden hier schon aufgerufen werden, kann dier Error Message auch angezeigt werden, wenn man gar nichts auswählt.
    // Durch die doppelte Bedingung im HTML wird der Error erst sichtbar, wenn man daruf klickt.
    // Somit erscheint auch eine Error Message, wenn man nichts auswählt (Nicht nur beim zurück wechseln auf ""/"keine Angabe"/"bitte wählen")
    created() {
        this.validateField('kleidungsstueck', 'Bitte wählen Sie ein Kleidungsstück aus.');
        this.validateField('webmuster', 'Bitte wählen Sie ein Webmuster aus.'); 
        this.validateField('groesse', 'Bitte wählen Sie eine Grösse aus.');
        this.validateName();
        this.validateEmail();
    },
}).mount('#app');