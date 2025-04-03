document.addEventListener('DOMContentLoaded', async() => {
    const excelFileInput = document.getElementById('excelFile');
    const processBtn = document.getElementById('processBtn');
    const mapContainer = document.getElementById('map-container');
    const colorPicker = document.getElementById('color-picker');
    const colorInput = document.getElementById('color-input');

    let excelData = null;
    let svgContent = null;
    let selectedDepartment = null;

    // Load SVG file automatically
    try {
        const response = await fetch('./departements_chiffre_couleur.svg');
        if (!response.ok) throw new Error('SVG file not found');
        svgContent = await response.text();
        mapContainer.innerHTML = svgContent;

        // Add click handlers to all departments
        const departments = mapContainer.querySelectorAll('path[id^="dep_"]');
        departments.forEach(department => {
            department.classList.add('department');

            department.addEventListener('click', (e) => {
                // Remove previous selection
                if (selectedDepartment) {
                    selectedDepartment.style.stroke = '';
                    selectedDepartment.style.strokeWidth = '';
                }

                // Set new selection
                selectedDepartment = department;
                selectedDepartment.style.stroke = '#000000';
                selectedDepartment.style.strokeWidth = '2px';

                // Show color picker and set current color
                colorPicker.classList.add('active');
                colorInput.value = department.getAttribute('fill') || '#ffffff';
            });
        });

        // Handle color changes
        colorInput.addEventListener('input', (e) => {
            if (selectedDepartment) {
                selectedDepartment.setAttribute('fill', e.target.value);
            }
        });

        // Close color picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!colorPicker.contains(e.target) && !selectedDepartment.contains(e.target)) {
                colorPicker.classList.remove('active');
                if (selectedDepartment) {
                    selectedDepartment.style.stroke = '';
                    selectedDepartment.style.strokeWidth = '';
                    selectedDepartment = null;
                }
            }
        });

    } catch (error) {
        console.error('Error loading SVG file:', error);
        mapContainer.innerHTML = '<p class="text-danger">Erreur lors du chargement de la carte SVG</p>';
    }

    // Enable process button only when Excel file is selected
    function updateProcessButton() {
        processBtn.disabled = !excelData;
    }

    // Handle Excel file upload
    excelFileInput.addEventListener('change', async(e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            excelData = XLSX.utils.sheet_to_json(firstSheet);
            updateProcessButton();
        } catch (error) {
            console.error('Error reading Excel file:', error);
            alert('Erreur lors de la lecture du fichier Excel');
        }
    });

    // Process button click handler
    processBtn.addEventListener('click', () => {
        if (!excelData || !svgContent) return;

        try {
            // Create a temporary div to parse the SVG
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgContent;
            const svgElement = tempDiv.querySelector('svg');

            // Create color map from Excel data
            const colorMap = {};
            excelData.forEach(row => {
                const depId = String(row.dep);
                const color = String(row.Couleur).trim();
                if (color && color !== 'nan') {
                    colorMap[depId] = color.replace('#', '');
                }
            });

            // Update colors in SVG
            Object.entries(colorMap).forEach(([depId, color]) => {
                const formattedDepId = depId.length === 1 ? `0${depId}` : depId;
                const element = svgElement.querySelector(`#dep_${formattedDepId}`);
                if (element) {
                    element.setAttribute('fill', `#${color}`);
                }
            });

            // Update the displayed SVG
            mapContainer.innerHTML = svgElement.outerHTML;

            // Re-add click handlers to the updated SVG
            const departments = mapContainer.querySelectorAll('path[id^="dep_"]');
            departments.forEach(department => {
                department.classList.add('department');

                department.addEventListener('click', (e) => {
                    if (selectedDepartment) {
                        selectedDepartment.style.stroke = '';
                        selectedDepartment.style.strokeWidth = '';
                    }

                    selectedDepartment = department;
                    selectedDepartment.style.stroke = '#000000';
                    selectedDepartment.style.strokeWidth = '2px';

                    colorPicker.classList.add('active');
                    colorInput.value = department.getAttribute('fill') || '#ffffff';
                });
            });

        } catch (error) {
            console.error('Error processing files:', error);
            alert('Erreur lors du traitement des fichiers');
        }
    });
});