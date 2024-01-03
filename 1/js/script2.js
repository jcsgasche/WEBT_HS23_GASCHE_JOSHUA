document.addEventListener('DOMContentLoaded', () => {
    let app = Vue.createApp({
        data() {
            return {
                inputData: {
                    farbe: '#ff0000',
                    muster: 'leinen',
                    textur: 50
                }
            };
        },
        methods: {
            validateInput() {
                let errors = [];
                if (this.inputData.farbe === '') {
                    errors.push("Bitte wählen Sie eine Farbe aus.");
                }
                if (errors.length > 0) {
                    alert(errors.join('\n'));
                    return false;
                }
                return true;
            },
            submitForm() {
                if (this.validateInput()) {
                    sendFormDataToBackend(this.inputData);
                    console.log('Daten gesendet');
                    drawOnCanvas(this.inputData);
                }
            }
        }
    }).mount('#eingabe');

    document.getElementById('farbe').addEventListener('change', (event) => {
        app.inputData.farbe = event.target.value;
    });

    function sendFormDataToBackend(data) {
        let inputData = data;
        fetch('backend.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            console.log('Antwort des Backends:', response);
            return response.json();
        })
        .then(data => {
            console.log('Erfolgreich:', data);
            drawOnCanvas(inputData);
        })
        .catch((error) => {
            console.error('Fehler beim Verarbeiten der Antwort:', error);
        });
    }    
});

    let canvas = document.getElementById('webmusterCanvas');
    let ctx = canvas.getContext('2d');

    function drawOnCanvas(data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = data.farbe;
        ctx.fillRect(10, 10, data.textur * 2, data.textur);
    
        let quadratGroesse = data.textur;
    
        if (data.muster === 'leinen' || data.muster === 'köper' || data.muster === 'atlas') {
            for (let y = 0; y < canvas.height; y += quadratGroesse) {
                for (let x = 0; x < canvas.width; x += quadratGroesse) {

                    if (data.muster === 'leinen') {
                        ctx.fillStyle = ((x / quadratGroesse + y / quadratGroesse) % 2 === 0) ? data.farbe : 'white';
                    } else if (data.muster === 'köper') {
                        let gruppenPositionX = Math.floor(x / quadratGroesse) % 3;
                        let gruppenPositionY = Math.floor(y / quadratGroesse) % 3;
                        ctx.fillStyle = ((gruppenPositionX + gruppenPositionY) % 2 === 0) ? data.farbe : 'white';
                    } else if (data.muster === 'atlas') {
                        // Pixel-Darstellung eines "Atlas-Musters", das ich im Internet gefunden und nachgebildet habe.
                        // https://www.r-g.de/wiki/Webarten
                        let muster = [
                            [0, 0, 0, 0, 0, 1, 0, 0, 0],
                            [0, 0, 1, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 1, 0],
                            [0, 0, 0, 0, 1, 0, 0, 0, 0],
                            [0, 1, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 1, 0, 0],
                            [0, 0, 0, 1, 0, 0, 0, 0, 0],
                            [1, 0, 0, 0, 0, 0, 0, 0, 1],
                            [0, 0, 0, 0, 0, 1, 0, 0, 0]
                        ];
                        let musterX = Math.floor(x / quadratGroesse) % muster.length;
                        let musterY = Math.floor(y / quadratGroesse) % muster.length;
                        ctx.fillStyle = muster[musterY][musterX] ? data.farbe : 'white';
                    }
    
                    ctx.fillRect(x, y, quadratGroesse, quadratGroesse);
                    ctx.strokeRect(x, y, quadratGroesse, quadratGroesse);
                    ctx.beginPath();
                    ctx.arc(x + quadratGroesse / 2, y + quadratGroesse / 2, quadratGroesse / 4, 0, Math.PI * 2); // Kreis
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + quadratGroesse, y + quadratGroesse);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x + quadratGroesse, y);
                    ctx.lineTo(x, y + quadratGroesse);
                    ctx.stroke();
                }
            }
        }    

        app.$watch('inputData', function (newVal, oldVal) {
            drawOnCanvas(newVal);
        }, { deep: true });
    }