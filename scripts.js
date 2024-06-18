document.getElementById('simular').addEventListener('click', function() {
    // Obtener el conteo de plazas
    const plazasCheckboxes = document.querySelectorAll('.plazas:checked').length;
    const totalPlazas = document.querySelectorAll('.plazas').length - 1; // Excluyendo "Todas"
    const plazas = document.getElementById('selectAllPlazas').checked ? totalPlazas + 1 : plazasCheckboxes;

    // Obtener el conteo de bares
    const bares = Array.from(document.querySelectorAll('.bares:checked')).reduce((total, checkbox) => total + parseInt(checkbox.value), 0);
    const selectAllBares = document.getElementById('selectAllBares').checked;
    const baresTotal = selectAllBares ? 9 : bares;

    // Obtener el conteo de universidades
    const universidadesCheckboxes = document.querySelectorAll('.universidades:checked').length;
    const totalUniversidades = document.querySelectorAll('.universidades').length - 1; // Excluyendo "Todas"
    const universidades = document.getElementById('selectAllUniversidades').checked ? totalUniversidades + 1 : universidadesCheckboxes;

    // Llamar a la función del simulador
    const resultados = simulador(plazas, baresTotal, universidades);

    // Mostrar los datos en la ventana emergente
    if (resultados.CPT > 0) {
        document.getElementById('modal-titlep').textContent = `Plazas`;
        document.getElementById('modal-result-plazas').textContent = `Cantidad de colillas recolectadas: ${resultados.CPT}`;
        document.getElementById('modal-recolectores-plazas').textContent = `Recolectores necesarios: ${Math.ceil(resultados.CPT / 1650)}`;
        document.querySelector('.result-container1').style.display = 'block';
    } else {
        document.querySelector('.result-container1').style.display = 'none';
    }
    if (resultados.CUT > 0) {
        document.getElementById('modal-titleu').textContent = `Universidades`;
        document.getElementById('modal-result-universidades').textContent = `Cantidad de colillas recolectadas: ${resultados.CUT}`;
        document.getElementById('modal-recolectores-universidades').textContent = `Recolectores necesarios: ${Math.ceil(resultados.CUT / 1650)}`;
        document.querySelector('.result-container2').style.display = 'block';
    } else {
        document.querySelector('.result-container2').style.display = 'none';
    }
    if (resultados.CBT > 0) {
        document.getElementById('modal-titleb').textContent = `Bares`;
        document.getElementById('modal-result-bares').textContent = `Cantidad de colillas recolectadas: ${resultados.CBT}`;
        document.getElementById('modal-recolectores-bares').textContent = `Recolectores necesarios: ${Math.ceil(resultados.CBT / 1650)}`;
        document.querySelector('.result-container3').style.display = 'block';
    } else {
        document.querySelector('.result-container3').style.display = 'none';
    }
    document.getElementById('modal-result-p').textContent = 'Plastico';
    document.getElementById('modal-result-plastico').textContent = `Cantidad total a recuperar: ${resultados.PLT.toFixed(2)} kg`;
    document.querySelector('.result-containerp').style.display = 'block';

    // Mostrar la ventana emergente
    const modal = document.getElementById('modal');
    modal.style.display = "block";

    // Actualizar gráfico
    updateChart(
        Math.ceil(resultados.CPT / 1650), 
        Math.ceil(resultados.CBT / 1650), 
        Math.ceil(resultados.CUT / 1650)
    );
});

// Cerrar la ventana emergente
document.getElementsByClassName('close')[0].addEventListener('click', function() {
    const modal = document.getElementById('modal');
    modal.style.display = "none";
});

// Cerrar la ventana emergente cuando el usuario hace clic fuera de la misma
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

function updateChart(plazas, bares, universidades) {
    const ctx = document.getElementById('recolectoresChart').getContext('2d');
    if (window.recolectoresChart) {
        window.recolectoresChart.data.datasets[0].data = [plazas, bares, universidades];
        window.recolectoresChart.update();
    } else {
        window.recolectoresChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Plazas', 'Bares', 'Universidades'],
                datasets: [{
                    label: 'Recolectores necesarios',
                    data: [plazas, bares, universidades],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)', // Rojo para Plazas
                        'rgba(54, 162, 235, 0.2)', // Azul para Bares
                        'rgba(255, 182, 193, 0.2)', // Rosa para Universidades
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)', // Rojo para Plazas
                        'rgba(54, 162, 235, 1)', // Azul para Bares
                        'rgba(255, 182, 193, 1)', // Rosa para Universidades
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}



// Función de número aleatorio a partir del congruencial multiplicativo con `a` y `m` aleatorios
function numeroU(ni) {
    const a = 5;
    const m = 8;
    const c = 7;
    const nj = (a * ni + c) % m;
    return nj / m;
}

let m = 8;
let n =  Math.random() * (150 - 10) + 10;

function poisson(lambda, n) {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
        k++;
        const u = numeroU(n);
        n = u * m;
        p *= u;
    } while (p > L);
    return k - 1;
}

function simulador(P, B, U) {
    let CT = 0, PLT = 0, CPT = 0, CUT = 0, CBT = 0;
    for (let d = 1; d <= 30; d++) {  // Bucle de los días (un mes)
        let CP = 0, CU = 0, CB = 0;
        // Simula cigarros en bares
        if (B >= 1) { // Pregunta si hay por lo menos un bar seleccionado          
            for (let i = 0; i < B; i++) { // Recorre la cantidad de bares seleccionados
                let colillas = poisson(84, n); // Obtiene los resultados para un bar
                for (let j = 0; j < colillas; j++) { // Recorre cada colilla
                    let u = numeroU(n);
                    n = u * m; // Usar el valor de m en el simulador
                    if (u <= 0.78) { // Determina si esa colilla es arrojada en el recolector o en cualquier otro lado
                        CB++;  // Acumula las colillas recolectadas
                    }
                }
            }
            CBT += CB; // Acumulador de colillas en bares total
        }
        // Misma lógica para plazas
        if (P >= 1) {
            for (let i = 0; i < P; i++) {
                let colillas = poisson(48, n);
                for (let j = 0; j < colillas; j++) {
                    let u = numeroU(n);
                    n = u * m; // Usar el valor de m en el simulador
                    if (u <= 0.78) {
                        CP++;
                    }
                }
            }
            CPT += CP;
        }
        // Misma lógica para universidades
        if (U >= 1) {
            for (let i = 0; i < U; i++) {
                let colillas = poisson(70, n);
                for (let j = 0; j < colillas; j++) {
                    let u = numeroU(n);
                    n = u * m; // Usar el valor de m en el simulador
                    if (u <= 0.78) {
                        CU++;
                    }
                }
            }
            CUT += CU;
        }

        const CD = CU + CB + CP; // Se obtienen las colillas recolectadas en un día

        for (let i = 0; i < CD; i++) { // Se recorre cada colilla y se determina su peso para obtener su plástico
            let u = numeroU(n);
            n = u * m; // Usar el valor de m en el simulador

            let peso = 0.2 + 0.3 * u;
            let plastico = peso * 0.75;

            PLT += plastico; // Se acumula el total de plástico recuperado
        }
    }

    let plasticoTotal = PLT / 1000; // Se pasa el plástico a kilos, estaba en gramos
    CT = CPT + CBT + CUT; // Colillas recolectadas totales

    return { // Devuelve un objeto con todos los datos
        PLT: plasticoTotal,
        CPT: CPT,
        CBT: CBT,
        CUT: CUT,
        CT: CT
    };
}
let map;
let markers = [];
let mcopy =[]; 
const locations = [
    { id: 'plaza1', lat: -26.819433, lng: -65.202784, title: 'Plaza Urquiza', type: 'plazas' },
    { id: 'plaza2', lat: -26.83909613043274, lng: -65.21063127151447, title: 'Plaza San Martin', type: 'plazas' },
    { id: 'plaza3', lat: -26.837179613104176, lng: -65.21717297799597, title: 'Plaza Belgrano', type: 'plazas' },
    { id: 'plaza4', lat: -26.83048715182709, lng: -65.20381526023203, title: 'Plaza Independencia', type: 'plazas' },
    { id: 'plaza5', lat: -26.82179034966474, lng: -65.21112155822031, title: 'Plaza Alberdi', type: 'plazas' },
    { id: 'plaza6', lat: -26.836998564395937, lng: -65.20545535415515, title: 'Plaza Yrigoyen', type: 'plazas' },
    { id: 'bar1', lat: -26.833871103472223, lng: -65.20858752468824, title: 'Zona Chacabuco', type: 'bares' },
    { id: 'bar2', lat: -26.820804561598017, lng: -65.20231892087082, title: 'Zona 25 de Mayo', type: 'bares' },
    { id: 'uni1', lat: -26.833231188243023, lng: -65.20546042879059, title: 'UNSTA', type: 'universidades' },
    { id: 'uni2', lat: -26.824910961705694, lng: -65.20256796458636, title: 'Facultad de Derecho', type: 'universidades' },
    { id: 'uni3', lat: -26.839800244337763, lng: -65.20930546838383, title: 'Facultad de Artes', type: 'universidades' },
    { id: 'uni4', lat: -26.83593902199619, lng: -65.21092236105045, title: 'Facultad de Bioquímica y Farmacia', type: 'universidades' },
    { id: 'uni5', lat: -26.82961556485243, lng: -65.20351054372624, title: 'San Pablo T', type: 'universidades' },
    { id: 'uni6', lat: -26.836176131422956, lng: -65.21197807800371, title: 'Facultad de Medicina', type: 'universidades' }
];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -26.828991, lng: -65.206149 },
        zoom: 14
    });


    // Añadir event listeners a los checkboxes
    locations.forEach(location => {
        const checkbox = document.getElementById(location.id);
        checkbox.setAttribute('data-lat', location.lat);
        checkbox.setAttribute('data-lng', location.lng);
        checkbox.setAttribute('data-title', location.title);
        checkbox.setAttribute('data-type', location.type);
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // Añadir event listener a los select all checkboxes
    document.getElementById('selectAllPlazas').addEventListener('change', () => toggleAllCheckboxes('plazas', 'selectAllPlazas'));
    document.getElementById('selectAllBares').addEventListener('change', () => toggleAllCheckboxes('bares', 'selectAllBares'));
    document.getElementById('selectAllUniversidades').addEventListener('change', () => toggleAllCheckboxes('universidades', 'selectAllUniversidades'));
}

window.onload = initMap;



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -26.828991, lng: -65.206149 },
        zoom: 14
    });

    const locations = [
        { id: 'plaza1', lat: -26.819433, lng: -65.202784, title: 'Plaza Urquiza', type: 'plazas' },
        { id: 'plaza2', lat: -26.83909613043274, lng: -65.21063127151447, title: 'Plaza San Martin', type: 'plazas' },
        { id: 'plaza3', lat: -26.837179613104176, lng: -65.21717297799597, title: 'Plaza Belgrano', type: 'plazas' },
        { id: 'plaza4', lat: -26.83048715182709, lng: -65.20381526023203, title: 'Plaza Independencia', type: 'plazas' },
        { id: 'plaza5', lat: -26.82179034966474, lng: -65.21112155822031, title: 'Plaza Alberdi', type: 'plazas' },
        { id: 'plaza6', lat: -26.836998564395937, lng: -65.20545535415515, title: 'Plaza Yrigoyen', type: 'plazas' },
        { id: 'bar1', lat: -26.833871103472223, lng: -65.20858752468824, title: 'Zona Chacabuco', type: 'bares' },
        { id: 'bar2', lat: -26.820804561598017, lng: -65.20231892087082, title: 'Zona 25 de Mayo', type: 'bares' },
        { id: 'uni1', lat: -26.833231188243023, lng: -65.20546042879059, title: 'UNSTA', type: 'universidades' },
        { id: 'uni2', lat: -26.824910961705694, lng: -65.20256796458636, title: 'Facultad de Derecho', type: 'universidades' },
        { id: 'uni3', lat: -26.839800244337763, lng: -65.20930546838383, title: 'Facultad de Artes', type: 'universidades' },
        { id: 'uni4', lat: -26.83593902199619, lng: -65.21092236105045, title: 'Facultad de Bioquímica y Farmacia', type: 'universidades' },
        { id: 'uni5', lat: -26.82961556485243, lng: -65.20351054372624, title: 'San Pablo T', type: 'universidades' },
        { id: 'uni6', lat: -26.836176131422956, lng: -65.21197807800371, title: 'Facultad de Medicina', type: 'universidades' }
    ];

    // Añadir event listeners a los checkboxes
    locations.forEach(location => {
        const checkbox = document.getElementById(location.id);
        checkbox.setAttribute('data-lat', location.lat);
        checkbox.setAttribute('data-lng', location.lng);
        checkbox.setAttribute('data-title', location.title);
        checkbox.setAttribute('data-type', location.type);
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // Añadir event listener a los select all checkboxes
    document.getElementById('selectAllPlazas').addEventListener('change', () => toggleAllCheckboxes('plazas', 'selectAllPlazas'));
    document.getElementById('selectAllBares').addEventListener('change', () => toggleAllCheckboxes('bares', 'selectAllBares'));
    document.getElementById('selectAllUniversidades').addEventListener('change', () => toggleAllCheckboxes('universidades', 'selectAllUniversidades'));
}

window.onload = initMap;
const objFunction = {
    selectAllPlazas: () => toggleAllCheckboxes('plazas', 'selectAllPlazas'), 
    selectAllBares: () => toggleAllCheckboxes('bares', 'selectAllBares'), 
    selectAllUniversidades: () => toggleAllCheckboxes('universidades', 'selectAllUniversidades')
}
function handleCheckboxChange() {
    debugger
    const lat = parseFloat(this.getAttribute('data-lat'));
    const lng = parseFloat(this.getAttribute('data-lng'));
    const title = this.getAttribute('data-title');
    const type = this.getAttribute('data-type');

    let iconColor;
    switch (type) {
        case 'plazas':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            break;
        case 'bares':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            break;
        case 'universidades':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
            break;
        default:
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
    if (this.checked) {
        // Añadir marcador si está seleccionado
        let markerE = markers.find(marker => {return marker.title === title && marker.type === type})
        if(!markerE){
            const marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
                title: title,
                icon: iconColor
            });
            markers.push({ title: title, marker: marker, type: type });
        }else {
            const marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
                title: title,
                icon: iconColor
            });
        }
    } else {
            const markerIndex = markers.findIndex(marker => {return marker.title === title && marker.type === type});
            if (markerIndex !== -1) {
                markers[markerIndex].marker.setMap(null);
                markers.splice(markerIndex, 1);
             
            }
    }

    // Manejar la deselección de "Todas" si se selecciona una opción individual después
    const selectAllCheckbox = document.getElementById(`selectAll${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (selectAllCheckbox.checked && this.checked) {
        selectAllCheckbox.checked = false;
        objFunction[`selectAll${type.charAt(0).toUpperCase() + type.slice(1)}`](); 
    }
}

function toggleAllCheckboxes(className, selectAllId) {
    debugger
    const selectAllCheckbox = document.getElementById(selectAllId);
    const checkboxes = document.querySelectorAll(`.${className}`);
    console.log(checkboxes);
    checkboxes.forEach(checkbox => {
        if (checkbox.id !== selectAllId) {
           // checkbox.checked = false; // No marcar visualmente los checkboxes individuales
            if (selectAllCheckbox.checked) {
                // Añadir marcadores
                const lat = parseFloat(checkbox.getAttribute('data-lat'));
                const lng = parseFloat(checkbox.getAttribute('data-lng'));
                const title = checkbox.getAttribute('data-title');
                const type = checkbox.getAttribute('data-type');

                let iconColor;
                switch (type) {
                    case 'plazas':
                        iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                        break;
                    case 'bares':
                        iconColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
                        break;
                    case 'universidades':
                        iconColor = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
                        break;
                    default:
                        iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                }

                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: map,
                    title: title,
                    icon: iconColor
                });
                markers.push({ title: title, marker: marker, type: type });
            } else {
                // Eliminar marcadores
               if(!checkbox.checked){
                   const title = checkbox.getAttribute('data-title');
                   const type = checkbox.getAttribute('data-type');
                   const markerIndex = markers.findIndex(marker => marker.title === title && marker.type === type);
                   if (markerIndex !== -1) {
                       markers[markerIndex].marker.setMap(null);
                       markers.splice(markerIndex, 1);
                   }
               }
            }
        }
    });

    // Manejar la selección de "Todas" en el mapa
    toggleAllMarkers(className, selectAllCheckbox.checked);
}

function toggleAllMarkers(type, showMarkers) {
    const locationsOfType = locations.filter(location => location.type === type);

    let iconColor;
    switch (type) {
        case 'plazas':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            break;
        case 'bares':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            break;
        case 'universidades':
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
            break;
        default:
            iconColor = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }

    if (showMarkers) {
        locationsOfType.forEach(location => {
            const existingMarker = markers.find(marker => marker.title === location.title && marker.type === type);
            if (!existingMarker) {
                const marker = new google.maps.Marker({
                    position: { lat: location.lat, lng: location.lng },
                    map: map,
                    title: location.title,
                    icon: iconColor
                });
                markers.push({ title: location.title, marker: marker, type: type });
            }
        });
    } else {
        // Eliminar todos los marcadores del tipo correspondiente si "Todas" está deseleccionado
        markers = markers.filter(marker => !(marker.type === type));
        markers.forEach(marker => {
            if (marker.type === type) {
                marker.marker.setMap(null);
            }
        });
    }
}



